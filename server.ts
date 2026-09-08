import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// ─────────────────────────────────────────────
// Nexus Gateway — Server
// ─────────────────────────────────────────────

const IS_DEV = process.env.NODE_ENV !== "production";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "4mb" }));

  // ── CORS headers for dev ──
  if (IS_DEV) {
    app.use((_req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      next();
    });
    app.options("*", (_req, res) => res.sendStatus(200));
  }

  // ── Health check ──
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      mode: IS_DEV ? "development" : "production",
      timestamp: new Date().toISOString(),
    });
  });

  // ── Models list (OpenAI-compatible) ──
  app.get(["/api/gateway/v1/models", "/v1/models"], (_req, res) => {
    res.json({
      object: "list",
      data: [
        { id: "gemini-flash-latest",               object: "model", owned_by: "google-ai" },
        { id: "gemini-3.8-flash",                  object: "model", owned_by: "google-ai" },
        { id: "deepseek-ai/DeepSeek-R1",           object: "model", owned_by: "siliconflow" },
        { id: "deepseek-ai/DeepSeek-V3",           object: "model", owned_by: "deepseek" },
        { id: "qwen/qwen-2.5-72b-instruct",        object: "model", owned_by: "dashscope" },
        { id: "llama-3.3-70b-versatile",           object: "model", owned_by: "groq" },
        { id: "llama3.3-70b",                      object: "model", owned_by: "cerebras" },
        { id: "gemma-2-27b",                       object: "model", owned_by: "google-ai" },
        { id: "@cf/meta/llama-3.3-70b-instruct",   object: "model", owned_by: "cloudflare" },
        { id: "pollinations-free-auto",             object: "model", owned_by: "pollinations" },
      ],
    });
  });

  // ── In-memory key vault (TODO: replace with Redis/Firestore for persistence) ──
  const revokedKeys = new Set<string>();
  const activeKeys  = new Map<string, string>();   // gatewayId → currentKey
  const poolRotationIndex = new Map<string, number>(); // gatewayId → rotation index
  // Server-side pool accounts memory store for external CLI tools (OpenCode, Cursor, Aider)
  const serverPools = new Map<string, Array<{ email: string; provider: string; apiKey?: string }>>();

  // ── Telemetry logs buffer (in-memory, latest 30) ──
  interface RequestLog {
    id: string;
    timestamp: string;
    model: string;
    provider: string;
    account: string;
    status: number;
    latencyMs: number;
    retries: number;
    stream: boolean;
  }
  const recentLogs: RequestLog[] = [];

  function recordLog(log: RequestLog) {
    recentLogs.unshift(log);
    if (recentLogs.length > 30) recentLogs.pop();
  }

  // ── Gateway live status endpoint ──
  app.get("/api/gateway/v1/status", (_req, res) => {
    res.json({
      status: "online",
      envProviders: {
        GROQ: !!getProviderEnvKey("GROQ"),
        CEREBRAS: !!getProviderEnvKey("CEREBRAS"),
        SILICONFLOW: !!getProviderEnvKey("SILICONFLOW"),
        OPENROUTER: !!getProviderEnvKey("OPENROUTER"),
        GOOGLE_AI: !!getProviderEnvKey("GOOGLE_AI"),
      },
      totalLoggedRequests: recentLogs.length,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // ── Recent logs endpoint ──
  app.get("/api/gateway/v1/logs", (_req, res) => {
    res.json({
      logs: recentLogs,
    });
  });

  // ── Supported Providers Configuration ──
  type SupportedProvider = "GOOGLE_AI" | "POLLINATIONS" | "GROQ" | "CEREBRAS" | "OPENROUTER" | "SILICONFLOW";

  const PROVIDER_CONFIGS: Record<SupportedProvider, { name: string; url: string; envKey: string }> = {
    GOOGLE_AI: {
      name: "google_ai",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      envKey: "GOOGLE_AI_API_KEY",
    },
    POLLINATIONS: {
      name: "pollinations",
      url: "https://text.pollinations.ai/openai/chat/completions",
      envKey: "POLLINATIONS_API_KEY",
    },
    GROQ: {
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      envKey: "GROQ_API_KEY",
    },
    CEREBRAS: {
      name: "cerebras",
      url: "https://api.cerebras.ai/v1/chat/completions",
      envKey: "CEREBRAS_API_KEY",
    },
    OPENROUTER: {
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      envKey: "OPENROUTER_API_KEY",
    },
    SILICONFLOW: {
      name: "siliconflow",
      url: "https://api.siliconflow.cn/v1/chat/completions",
      envKey: "SILICONFLOW_API_KEY",
    },
  };

  const DEFAULT_PROVIDER_ORDER: SupportedProvider[] = [
    "GOOGLE_AI",
    "POLLINATIONS",
    "GROQ",
    "CEREBRAS",
    "OPENROUTER",
    "SILICONFLOW",
  ];

  function getProviderEnvKey(provider: SupportedProvider): string | undefined {
    if (provider === "GOOGLE_AI") {
      return process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    }
    if (provider === "POLLINATIONS") {
      return process.env.POLLINATIONS_API_KEY || "zero-key-public";
    }
    return process.env[PROVIDER_CONFIGS[provider].envKey];
  }

  function resolveProvidersForModel(modelName: string): SupportedProvider[] {
    const m = (modelName || "").toLowerCase();
    if (m.endsWith(":free")) {
      return ["OPENROUTER", "POLLINATIONS"];
    }
    if (m.startsWith("gemma-") || m.startsWith("gemini-")) {
      return ["GOOGLE_AI", "POLLINATIONS"];
    }
    if ((m.startsWith("llama-") && m.includes("versatile")) || m.startsWith("mixtral-")) {
      return ["GROQ", "POLLINATIONS"];
    }
    if (m.startsWith("llama3") && !m.includes("versatile")) {
      return ["CEREBRAS", "POLLINATIONS"];
    }
    if (m.startsWith("deepseek-") || m.startsWith("qwen/")) {
      return ["SILICONFLOW", "OPENROUTER", "POLLINATIONS"];
    }
    if (m.includes("pollinations") || m.includes("openai-fast")) {
      return ["POLLINATIONS"];
    }
    return DEFAULT_PROVIDER_ORDER;
  }

  function normalizeProviderType(raw: string): SupportedProvider | null {
    const p = (raw || "").toLowerCase().replace(/[-_\s]/g, "");
    if (p.includes("google") || p.includes("gemini")) return "GOOGLE_AI";
    if (p.includes("pollinations")) return "POLLINATIONS";
    if (p.includes("groq")) return "GROQ";
    if (p.includes("cerebras")) return "CEREBRAS";
    if (p.includes("openrouter")) return "OPENROUTER";
    if (p.includes("silicon") || p.includes("siliconflow")) return "SILICONFLOW";
    return null;
  }

  // ── Key rotation — FIXED: reads currentToken (matches Hero.tsx) ──
  app.post(["/api/gateway/v1/rotate-key", "/api/gateway/v1/u/:gatewayId/rotate-key"], (req, res) => {
    const gatewayId  = req.params.gatewayId || req.body.gatewayId || "default";
    // Hero.tsx sends `currentToken`; also accept legacy `oldKey`
    const oldKey     = req.body.currentToken || req.body.oldKey;

    if (oldKey) revokedKeys.add(oldKey);

    const newToken = `nxg_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    activeKeys.set(gatewayId, newToken);

    return res.json({
      success: true,
      newToken,
      invalidatedKey: oldKey || null,
      status: "rotated",
      timestamp: new Date().toISOString(),
    });
  });

  // ── Sync user pool from frontend to server store ──
  app.post(["/api/gateway/v1/sync-pool", "/v1/sync-pool"], (req, res) => {
    const { masterKey, gatewayId = "default", pool } = req.body;
    if (Array.isArray(pool)) {
      if (masterKey) serverPools.set(masterKey, pool);
      if (gatewayId) serverPools.set(gatewayId, pool);
      serverPools.set("default", pool);
    }
    return res.json({
      success: true,
      syncedCount: Array.isArray(pool) ? pool.length : 0,
      timestamp: new Date().toISOString(),
    });
  });

  // ── Chat completions proxy ──
  // In DEV mode → returns a clear mock response labelled as such.
  // In PROD mode → routes to real provider using pool accounts from request body.
  app.post(
    ["/api/gateway/v1/chat/completions", "/v1/chat/completions",
     "/api/gateway/v1/u/:gatewayId/chat/completions", "/v1/u/:gatewayId/chat/completions"],
    async (req, res) => {
      const gatewayId   = req.params.gatewayId || req.body.gatewayId || "default";
      const authHeader  = req.headers.authorization || "";
      const masterToken = authHeader.replace(/^Bearer\s+/i, "");

      // Security: reject revoked keys
      if (masterToken && revokedKeys.has(masterToken)) {
        return res.status(401).json({
          error: {
            message: "API key has been revoked. Please use the newly rotated key.",
            type: "invalid_request_error",
            code: "key_revoked",
          },
        });
      }

      const {
        model    = "deepseek-ai/DeepSeek-R1",
        messages = [],
        stream   = false,
        pool     = [],
      } = req.body;

      const startMs = Date.now();

      // ── Real Multi-Provider Edge Routing ──
      interface TargetCandidate {
        email: string;
        providerKey: SupportedProvider;
        providerName: string;
        url: string;
        apiKey: string;
      }

      const targetProviders = resolveProvidersForModel(model);
      // Fallback to serverPools if external CLI (OpenCode / Aider) doesn't pass pool in body
      const effectivePool = (Array.isArray(pool) && pool.length > 0)
        ? pool
        : (serverPools.get(masterToken) || serverPools.get(gatewayId) || serverPools.get("default") || []);
      const poolAccounts = effectivePool as Array<{ email: string; provider: string; apiKey?: string }>;
      let candidates: TargetCandidate[] = [];

      if (poolAccounts.length > 0) {
        // Collect all valid pool candidates
        const validPoolTargets: TargetCandidate[] = [];
        for (const item of poolAccounts) {
          const pKey = normalizeProviderType(item.provider);
          if (!pKey) continue;
          const key = item.apiKey || getProviderEnvKey(pKey);
          if (!key) continue;
          validPoolTargets.push({
            email: item.email || `${PROVIDER_CONFIGS[pKey].name}@pool`,
            providerKey: pKey,
            providerName: PROVIDER_CONFIGS[pKey].name,
            url: PROVIDER_CONFIGS[pKey].url,
            apiKey: key,
          });
        }

        if (validPoolTargets.length > 0) {
          // Prioritize accounts matching target provider(s) for the requested model
          const matching = validPoolTargets.filter(t => targetProviders.includes(t.providerKey));
          const nonMatching = validPoolTargets.filter(t => !targetProviders.includes(t.providerKey));
          const orderedPool = matching.length > 0 ? [...matching, ...nonMatching] : validPoolTargets;

          // Round-robin rotation using gatewayId as rotation key
          const currentIdx = poolRotationIndex.get(gatewayId) || 0;
          poolRotationIndex.set(gatewayId, currentIdx + 1);

          for (let i = 0; i < orderedPool.length; i++) {
            candidates.push(orderedPool[(currentIdx + i) % orderedPool.length]);
          }
        }
      }

      // Collect env candidates as primary or fallback
      const envCandidates: TargetCandidate[] = [];
      for (const p of targetProviders) {
        const key = getProviderEnvKey(p);
        if (key) {
          envCandidates.push({
            email: `system-${PROVIDER_CONFIGS[p].name}@nexus-gateway`,
            providerKey: p,
            providerName: PROVIDER_CONFIGS[p].name,
            url: PROVIDER_CONFIGS[p].url,
            apiKey: key,
          });
        }
      }
      for (const p of DEFAULT_PROVIDER_ORDER) {
        if (!targetProviders.includes(p)) {
          const key = getProviderEnvKey(p);
          if (key) {
            envCandidates.push({
              email: `system-${PROVIDER_CONFIGS[p].name}@nexus-gateway`,
              providerKey: p,
              providerName: PROVIDER_CONFIGS[p].name,
              url: PROVIDER_CONFIGS[p].url,
              apiKey: key,
            });
          }
        }
      }

      // If pool was empty, candidates are envCandidates; otherwise append any unique env fallbacks
      if (candidates.length === 0) {
        candidates = envCandidates;
      } else {
        for (const envCand of envCandidates) {
          if (!candidates.some(c => c.providerKey === envCand.providerKey && c.apiKey === envCand.apiKey)) {
            candidates.push(envCand);
          }
        }
      }

      // If no valid candidates available, return 503 error
      if (candidates.length === 0) {
        return res.status(503).json({
          error: {
            message: "No provider API keys or valid account pool configured. Please configure provider keys in .env (GOOGLE_AI_API_KEY, GROQ_API_KEY, CEREBRAS_API_KEY, OPENROUTER_API_KEY, SILICONFLOW_API_KEY) or supply a pool with API keys.",
            type: "service_unavailable",
            code: "no_providers_available",
          },
        });
      }

      const { pool: _poolPayload, gatewayId: _gwPayload, ...rawBody } = req.body;
      const upstreamBody = {
        ...rawBody,
        model,
        messages,
        stream,
      };

      let retries = 0;
      const maxRetries = 3;
      let lastError: any = null;

      for (let i = 0; i < candidates.length && retries <= maxRetries; i++) {
        const target = candidates[i];

        // Format model for target provider (e.g. Google AI OpenAI endpoint requires valid Gemini/Gemma models)
        const isGoogleAi = target.providerKey === "GOOGLE_AI";
        const isPollinations = target.providerKey === "POLLINATIONS";
        const mLower = (model || "").toLowerCase();
        let targetModel = model;
        if (isGoogleAi) {
          if (!mLower.includes("gemma")) {
            targetModel = "gemini-flash-latest";
          }
        } else if (isPollinations) {
          targetModel = "openai-fast";
        }

        const candidateBody = {
          ...rawBody,
          model: targetModel,
          messages,
          stream,
        };

        try {
          const reqHeaders: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (target.apiKey && target.apiKey !== "zero-key-public") {
            reqHeaders["Authorization"] = `Bearer ${target.apiKey}`;
          }

          const upstreamRes = await fetch(target.url, {
            method: "POST",
            headers: reqHeaders,
            body: JSON.stringify(candidateBody),
          });

          // 429 auto-failover: if upstream returns 429, retry with next available account/provider from pool
          if (upstreamRes.status === 429) {
            retries++;
            const errJson = await upstreamRes.json().catch(() => null);
            lastError = {
              status: 429,
              provider: target.providerName,
              account: target.email,
              detail: errJson?.error?.message || "Rate limit 429 encountered",
            };
            if (retries <= maxRetries && i + 1 < candidates.length) {
              continue;
            }
            break;
          }

          const latencyMs = Date.now() - startMs;

          // Forward response headers to client
          res.setHeader("X-Nexus-Account", target.email);
          res.setHeader("X-Nexus-Provider", target.providerName);
          res.setHeader("X-Nexus-Latency", `${latencyMs}ms`);
          res.setHeader("X-Nexus-Failover-Retries", String(retries));
          res.setHeader("X-Nexus-Retry-Count", String(retries));

          // Streaming support
          if (stream && upstreamRes.body) {
            if (!upstreamRes.ok) {
              const errPayload = await upstreamRes.json().catch(() => null);
              return res.status(upstreamRes.status).json(
                errPayload || {
                  error: {
                    message: `Upstream error ${upstreamRes.status} from ${target.providerName}`,
                    type: "upstream_error",
                    code: upstreamRes.status,
                  },
                }
              );
            }

            res.status(upstreamRes.status);
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache, no-transform");
            res.setHeader("Connection", "keep-alive");

            // @ts-ignore
            const reader = upstreamRes.body.getReader();
            req.on("close", () => {
              reader.cancel().catch(() => {});
            });

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
              }
            } catch (streamErr) {
              console.error("[SSE Stream Error]", streamErr);
            } finally {
              recordLog({
                id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                timestamp: new Date().toLocaleTimeString(),
                model,
                provider: target.providerName,
                account: target.email,
                status: upstreamRes.status,
                latencyMs,
                retries,
                stream: true,
              });
              res.end();
            }
            return;
          }

          // Non-streaming response
          const responseData = await upstreamRes.json().catch(() => null);
          recordLog({
            id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toLocaleTimeString(),
            model,
            provider: target.providerName,
            account: target.email,
            status: upstreamRes.status,
            latencyMs,
            retries,
            stream: false,
          });

          if (!upstreamRes.ok) {
            return res.status(upstreamRes.status).json(
              responseData || {
                error: {
                  message: `Upstream error ${upstreamRes.status} from ${target.providerName}`,
                  type: "upstream_error",
                  code: upstreamRes.status,
                },
              }
            );
          }

          return res.status(upstreamRes.status).json(responseData);
        } catch (fetchErr: any) {
          retries++;
          lastError = {
            status: 500,
            provider: target.providerName,
            account: target.email,
            detail: fetchErr?.message || "Network error while reaching upstream provider",
          };
          if (retries <= maxRetries && i + 1 < candidates.length) {
            continue;
          }
        }
      }

      // If all providers/accounts exhausted, return 503
      return res.status(503).json({
        error: {
          message: "All providers or pool accounts exhausted (or rate limited).",
          type: "service_unavailable",
          code: "all_providers_exhausted",
          retries,
          lastError,
        },
      });
    }
  );

  // ── Vite dev middleware OR static production serve ──
  if (IS_DEV) {
    const vite = await createViteServer({
      server:  { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Nexus Gateway] Production Edge Router active on port ${PORT}`);
  });
}

startServer();
