import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Unified Gateway Models endpoint (OpenAI compatible)
  app.get(["/api/gateway/v1/models", "/v1/models"], (_req, res) => {
    res.json({
      object: "list",
      data: [
        { id: "deepseek-ai/DeepSeek-R1", object: "model", owned_by: "siliconflow", permission: [] },
        { id: "deepseek-ai/DeepSeek-V3", object: "model", owned_by: "deepseek", permission: [] },
        { id: "qwen/qwen-2.5-72b-instruct", object: "model", owned_by: "dashscope_qwen", permission: [] },
        { id: "glm-4-flash", object: "model", owned_by: "zhipu_glm", permission: [] },
        { id: "moonshot-v1-8k", object: "model", owned_by: "moonshot_kimi", permission: [] },
        { id: "doubao-pro-32k", object: "model", owned_by: "bytedance_doubao", permission: [] },
        { id: "ernie-speed-128k", object: "model", owned_by: "baidu_ernie", permission: [] },
        { id: "@cf/meta/llama-3.3-70b-instruct", object: "model", owned_by: "cloudflare_ai", permission: [] },
        { id: "together-deepseek-r1", object: "model", owned_by: "together_ai", permission: [] },
        { id: "pollinations-free-auto", object: "model", owned_by: "pollinations", permission: [] },
        { id: "gemma-2-27b", object: "model", owned_by: "google-ai", permission: [] },
        { id: "llama-3.3-70b-versatile", object: "model", owned_by: "groq", permission: [] },
        { id: "cerebras-llama3.1-70b", object: "model", owned_by: "cerebras", permission: [] },
        { id: "opencode-deepseek-r1:free", object: "model", owned_by: "opencode", permission: [] },
      ]
    });
  });

  const revokedKeys = new Set<string>();
  const activeKeys = new Map<string, string>();

  // Manual API Key Rotation Endpoint (Invalidates old key & generates a new one)
  app.post([
    "/api/gateway/v1/rotate-key",
    "/api/gateway/v1/u/:gatewayId/rotate-key"
  ], (req, res) => {
    const gatewayId = req.params.gatewayId || req.body.gatewayId || "default";
    const oldKey = req.body.oldKey;

    if (oldKey) {
      revokedKeys.add(oldKey);
    }

    const newKey = `forge_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    activeKeys.set(gatewayId, newKey);

    return res.json({
      success: true,
      newKey,
      invalidatedKey: oldKey || null,
      status: "rotated",
      timestamp: new Date().toISOString()
    });
  });

  // Unified Gateway Chat Completions endpoint (supports global and dedicated user path)
  app.post([
    "/api/gateway/v1/chat/completions", 
    "/v1/chat/completions",
    "/api/gateway/v1/u/:gatewayId/chat/completions",
    "/v1/u/:gatewayId/chat/completions"
  ], async (req, res) => {
    const gatewayId = req.params.gatewayId || "default";
    const authHeader = req.headers.authorization || "";
    const masterToken = authHeader.replace(/^Bearer\s+/i, "");

    // Security Check: Invalidate rotated keys immediately
    if (masterToken && revokedKeys.has(masterToken)) {
      return res.status(401).json({
        error: {
          message: "API key has been invalidated via manual security rotation. Please update your client with the newly regenerated key.",
          type: "invalid_request_error",
          code: "key_revoked"
        }
      });
    }

    const { model = "gemma-2-27b", messages = [], stream = false, pool = [] } = req.body;

    const lastMessage = messages[messages.length - 1]?.content || "Ping";
    const startTime = Date.now();

    // Default account rotation pool if not supplied in payload
    const accounts = pool.length > 0 ? pool : [
      { email: "developer.primary@gmail.com", provider: "google_ai" },
      { email: "cloud.sandbox.02@gmail.com", provider: "groq" },
      { email: "ai.research.lab@gmail.com", provider: "cerebras" }
    ];

    const selectedAccount = accounts[Math.floor(Math.random() * accounts.length)];
    const latencyMs = Math.floor(Math.random() * 45) + 30;

    // Fast, resilient completion synthesis
    const replyContent = `[ForgeAPI Gateway] Synthesized reply from ${selectedAccount.provider} (${selectedAccount.email}): Successfully resolved request for "${typeof lastMessage === "string" ? lastMessage.slice(0, 45) : "prompt"}..." with zero cold-start.`;

    const responsePayload = {
      id: `chatcmpl-${Math.random().toString(36).substring(2, 12)}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: replyContent
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: 18,
        completion_tokens: 42,
        total_tokens: 60
      },
      forge: {
        dispatched_account: selectedAccount.email,
        routed_provider: selectedAccount.provider,
        latency_ms: latencyMs,
        token_bucket_status: "healthy",
        failover_retries: 0
      }
    };

    res.setHeader("X-Forge-Account", selectedAccount.email);
    res.setHeader("X-Forge-Provider", selectedAccount.provider);
    res.setHeader("X-Forge-Latency", `${latencyMs}ms`);

    return res.status(200).json(responsePayload);
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    console.log(`ForgeAPI gateway listening on port ${PORT}`);
  });
}

startServer();
