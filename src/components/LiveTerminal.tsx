import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw, 
  Code2, 
  Cpu, 
  Globe2,
  Lock,
  Layers,
  FileCode2,
  CheckCircle2,
  Flame,
  Hammer,
  Sparkles
} from 'lucide-react';

interface TemplateOption {
  id: string;
  name: string;
  icon: string;
  category: string;
  prompt: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  tsHandler: string;
  clientSdkTs: string;
  clientSdkPy: string;
  curlCommand: string;
  openApiYaml: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Checkout & Inventory',
    icon: '🛍️',
    category: 'Commerce',
    prompt: 'E-Commerce checkout API with Stripe webhooks, PostgreSQL schema & inventory sync',
    endpoint: '/v1/checkout/create-session',
    method: 'POST',
    tsHandler: `import { defineEndpoint, z } from '@forgeapi/edge';
import { db } from '@forgeapi/orm';
import { stripe } from './stripe';

export const POST = defineEndpoint({
  auth: 'jwt_bearer',
  rateLimit: { maxPerMinute: 600, strategy: 'sliding_window' },
  schema: z.object({
    items: z.array(z.object({ sku: z.string(), qty: z.number().min(1), price: z.number() })),
    currency: z.enum(['USD', 'EUR', 'GBP']),
    customerId: z.string(),
    idempotencyKey: z.string().uuid()
  }),
  async handler(req, { user, traceId }) {
    // 1. Atomically lock inventory in Edge KV
    const reserved = await db.inventory.reserve(req.body.items);
    if (!reserved) throw new Error('INSUFFICIENT_STOCK');

    // 2. Synthesize Stripe checkout intent
    const session = await stripe.checkout.sessions.create({
      customer: req.body.customerId,
      line_items: req.body.items,
      metadata: { traceId }
    });

    return {
      status: 'success',
      sessionToken: session.id,
      checkoutUrl: session.url,
      inventoryReserved: true
    };
  }
});`,
    clientSdkTs: `import { ForgeClient } from '@forgeapi/sdk';

const client = new ForgeClient({
  apiKey: process.env.FORGE_API_KEY,
  region: 'auto'
});

const session = await client.checkout.createSession({
  customerId: 'cust_98124a',
  currency: 'USD',
  idempotencyKey: crypto.randomUUID(),
  items: [{ sku: 'FORGE-CORE-PRO', qty: 1, price: 99 }]
});`,
    clientSdkPy: `from forgeapi import ForgeClient
import os

client = ForgeClient(api_key=os.environ["FORGE_API_KEY"])

session = client.checkout.create_session(
    customer_id="cust_98124a",
    currency="USD",
    items=[{"sku": "FORGE-CORE-PRO", "qty": 1, "price": 99}]
)
print(f"Checkout URL: {session.checkout_url}")`,
    curlCommand: `curl -X POST https://edge.forgeapi.dev/v1/checkout/create-session \\
  -H "Authorization: Bearer forge_live_master_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerId": "cust_98124a",
    "currency": "USD",
    "idempotencyKey": "b9f71c40-3a1b-4f9e-a0e2-7629b35b62b1",
    "items": [{"sku": "FORGE-CORE-PRO", "qty": 1, "price": 99}]
  }'`,
    openApiYaml: `openapi: 3.1.0
info:
  title: ForgeAPI Checkout & Inventory
  version: 1.0.0
paths:
  /v1/checkout/create-session:
    post:
      summary: Create Checkout Session
      operationId: createCheckoutSession
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CheckoutPayload'
      responses:
        '200':
          description: Session created successfully`
  },
  {
    id: 'ai-gateway',
    name: 'Multi-Account AI Gateway & Pool',
    icon: '⚡',
    category: 'AI Gateway',
    prompt: 'OpenAI-compatible multi-account gateway with automatic 429 failover and quota pooling',
    endpoint: '/v1/chat/completions',
    method: 'POST',
    tsHandler: `import { defineGateway, routePool } from '@forgeapi/gateway';

export const POST = defineGateway({
  auth: 'master_key',
  accounts: ['google_pool', 'groq_pool', 'silicon_pool', 'cloudflare_pool'],
  failoverStrategy: 'round_robin_on_429',
  
  async dispatch(request) {
    // Auto-routes to available account with active quota
    const node = routePool.getNextAvailable({
      model: request.body.model,
      excludeCoolingDown: true
    });

    const upstreamResponse = await node.forward(request);
    if (upstreamResponse.status === 429) {
      // 0ms seamless switch to backup account
      return routePool.failoverToNext(request);
    }
    return upstreamResponse;
  }
});`,
    clientSdkTs: `import { OpenAI } from 'openai';

const client = new OpenAI({
  baseURL: 'https://edge.forgeapi.dev/v1',
  apiKey: 'forge_live_master_key'
});

const response = await client.chat.completions.create({
  model: 'deepseek-ai/DeepSeek-R1',
  messages: [{ role: 'user', content: 'Synthesize production endpoint' }]
});`,
    clientSdkPy: `from openai import OpenAI

client = OpenAI(
    base_url="https://edge.forgeapi.dev/v1",
    api_key="forge_live_master_key"
)

response = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-R1",
    messages=[{"role": "user", "content": "Forge API"}]
)
print(response.choices[0].message.content)`,
    curlCommand: `curl https://edge.forgeapi.dev/v1/chat/completions \\
  -H "Authorization: Bearer forge_live_master_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-ai/DeepSeek-R1",
    "messages": [{"role": "user", "content": "Hello ForgeAPI"}]
  }'`,
    openApiYaml: `openapi: 3.1.0
info:
  title: ForgeAPI Unified AI Gateway
  version: 1.0.0
paths:
  /v1/chat/completions:
    post:
      summary: Dispatch Chat Completion with 429 Failover`
  },
  {
    id: 'auth-rbac',
    name: 'Multi-Tenant Auth & RBAC',
    icon: '🛡️',
    category: 'Security',
    prompt: 'Multi-tenant organization auth with JWT issuance, RBAC permissions & sliding sessions',
    endpoint: '/v1/auth/organization-token',
    method: 'POST',
    tsHandler: `import { defineEndpoint, z } from '@forgeapi/edge';
import { rbac, signJwt } from '@forgeapi/crypto';

export const POST = defineEndpoint({
  rateLimit: { rpm: 300 },
  schema: z.object({
    tenantId: z.string(),
    userId: z.string(),
    requestedRoles: z.array(z.string())
  }),
  async handler(req) {
    const permissions = await rbac.resolvePermissions(req.body.tenantId, req.body.requestedRoles);
    const token = await signJwt({
      sub: req.body.userId,
      tenantId: req.body.tenantId,
      permissions
    }, { expiresIn: '24h' });

    return { token, permissions, expiresIn: 86400 };
  }
});`,
    clientSdkTs: `const token = await forge.auth.getOrgToken({
  tenantId: 'org_foundry_corp',
  userId: 'usr_8829a',
  requestedRoles: ['forge_admin']
});`,
    clientSdkPy: `token = client.auth.get_org_token(tenant_id="org_foundry", user_id="usr_8829a")`,
    curlCommand: `curl -X POST https://edge.forgeapi.dev/v1/auth/organization-token \\
  -H "Content-Type: application/json" \\
  -d '{"tenantId":"org_foundry","userId":"usr_8829a"}'`,
    openApiYaml: `openapi: 3.1.0
info:
  title: ForgeAPI Multi-Tenant Auth`
  }
];

// Helper to format code with orange syntax highlighting
export const HighlightedOrangeCode: React.FC<{ code: string }> = ({ code }) => {
  const lines = code.split('\n');

  return (
    <div className="font-mono text-xs sm:text-sm leading-relaxed whitespace-pre">
      {lines.map((line, lineIdx) => {
        // Simple regex-based syntax tokenization
        // Highlight comments
        if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
          return (
            <div key={lineIdx} className="text-slate-500 italic">
              {line}
            </div>
          );
        }

        return (
          <div key={lineIdx} className="text-slate-200">
            {line.split(/(\b(?:import|export|from|const|let|var|return|async|await|function|class|def|type|interface|as)\b|["'`].*?["'`]|[{}(),:;\[\]]|\b(?:true|false|null|undefined|\d+)\b)/g).map((token, tokenIdx) => {
              // Keywords in Burnt Orange
              if (/^(?:import|export|from|const|let|var|return|async|await|function|class|def|type|interface|as)$/.test(token)) {
                return (
                  <span key={tokenIdx} className="text-[#FF6B35] font-bold">
                    {token}
                  </span>
                );
              }
              // Strings in Warm Gold
              if (/^["'`].*["'`]$/.test(token)) {
                return (
                  <span key={tokenIdx} className="text-[#FFB627]">
                    {token}
                  </span>
                );
              }
              // Literals / Numbers in Amber Gold
              if (/^(?:true|false|null|undefined|\d+)$/.test(token)) {
                return (
                  <span key={tokenIdx} className="text-[#FFAA00] font-semibold">
                    {token}
                  </span>
                );
              }
              // Identifiers with Zod, methods, definitions in Deep Teal
              if (/^(?:defineEndpoint|defineGateway|z|stripe|client|db|routePool|rbac|signJwt)$/.test(token)) {
                return (
                  <span key={tokenIdx} className="text-teal-300 font-semibold">
                    {token}
                  </span>
                );
              }
              // Punctuation & Operators
              if (/^[{}(),:;\[\]]$/.test(token)) {
                return (
                  <span key={tokenIdx} className="text-slate-400">
                    {token}
                  </span>
                );
              }
              return <span key={tokenIdx}>{token}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export const LiveTerminal: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>(TEMPLATES[0]);
  const [activeTab, setActiveTab] = useState<'handler' | 'sdkTs' | 'sdkPy' | 'curl' | 'openapi'>('handler');
  const [copied, setCopied] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState(4);
  const [customPrompt, setCustomPrompt] = useState(selectedTemplate.prompt);

  const handleSelectTemplate = (template: TemplateOption) => {
    setSelectedTemplate(template);
    setCustomPrompt(template.prompt);
  };

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setSynthesisStep(1);

    setTimeout(() => setSynthesisStep(2), 400);
    setTimeout(() => setSynthesisStep(3), 850);
    setTimeout(() => {
      setSynthesisStep(4);
      setIsSynthesizing(false);
    }, 1300);
  };

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'handler': return selectedTemplate.tsHandler;
      case 'sdkTs': return selectedTemplate.clientSdkTs;
      case 'sdkPy': return selectedTemplate.clientSdkPy;
      case 'curl': return selectedTemplate.curlCommand;
      case 'openapi': return selectedTemplate.openApiYaml;
      default: return selectedTemplate.tsHandler;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="terminal" className="relative py-24 bg-[#121212] overflow-hidden">
      {/* Ambient Molten Core Reflection */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-[#FF6B35]/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#FFB627]/30 text-xs font-mono text-[#FFB627] mb-4 shadow-[0_0_20px_rgba(255,182,39,0.2)]">
            <Terminal className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>LIVE API COMPILER &amp; SCHEMA PREVIEW</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            The Molten Code Crucible
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Real-time TypeScript edge handlers, client SDKs, and OpenAPI 3.1 definitions 
            cast with orange syntax illumination.
          </p>
        </div>

        {/* Interactive Template Selector Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl)}
              className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                selectedTemplate.id === tmpl.id
                  ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFB627] text-[#0c0c0c] font-bold shadow-[0_0_20px_rgba(255,107,53,0.4)] scale-105'
                  : 'bg-[#181818] text-slate-300 hover:text-white border border-white/10 hover:border-[#FFB627]/40'
              }`}
            >
              <span>{tmpl.icon}</span>
              <span>{tmpl.name}</span>
            </button>
          ))}
        </div>

        {/* Terminal Container with iOS Glass & Squircle Borders */}
        <div className="rounded-3xl border border-white/[0.1] ios-glass shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden">
          
          {/* Top iOS / macOS Window Bar */}
          <div className="bg-[#141418]/90 px-4 sm:px-6 py-3.5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            {/* Window Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 shadow-[0_0_8px_rgba(255,95,86,0.5)]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 shadow-[0_0_8px_rgba(255,189,46,0.5)]" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 shadow-[0_0_8px_rgba(39,201,63,0.5)]" />
              </div>
              <span className="text-xs font-mono text-slate-400 font-semibold tracking-wide">
                forgeapi-runtime &bull; <span className="text-[#FFB627]">{selectedTemplate.endpoint}</span>
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="ios-tap px-3.5 py-1.5 rounded-full bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 border border-[#FF6B35]/40 text-[#FFB627] text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin text-[#FF6B35]' : ''}`} />
                <span>{isSynthesizing ? 'Smelting Schema...' : 'Re-Forge'}</span>
              </button>

              <button
                onClick={handleCopyCode}
                className="ios-tap px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#FFB627]" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* iOS Segmented Control Tab Bar */}
          <div className="bg-[#0f0f13] border-b border-white/[0.08] p-2.5">
            <div className="ios-segmented flex items-center overflow-x-auto gap-1">
              {[
                { id: 'handler', label: 'handler.ts (Edge Endpoint)' },
                { id: 'sdkTs', label: 'client.ts (TypeScript SDK)' },
                { id: 'sdkPy', label: 'client.py (Python SDK)' },
                { id: 'curl', label: 'cURL Terminal' },
                { id: 'openapi', label: 'OpenAPI 3.1 YAML' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`ios-tap px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer text-xs font-mono ${
                    activeTab === tab.id
                      ? 'bg-white/[0.16] text-[#FFB627] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Code Body with Orange Syntax Highlighting */}
          <div className="bg-[#0a0a0a] p-5 sm:p-7 overflow-x-auto max-h-[520px]">
            {isSynthesizing ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-4">
                <Flame className="w-10 h-10 text-[#FF6B35] animate-pulse" />
                <div className="text-sm font-mono text-[#FFB627]">
                  {synthesisStep === 1 && 'Heating crucible to 1,400°C...'}
                  {synthesisStep === 2 && 'Casting Zod schema & input validations...'}
                  {synthesisStep === 3 && 'Smelting JWT authentication & sliding-window rate limits...'}
                  {synthesisStep === 4 && 'Polishing OpenAPI 3.1 spec and TypeScript SDKs...'}
                </div>
                <div className="w-48 h-1.5 rounded-full bg-[#1e1e1e] overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627] transition-all duration-300"
                    style={{ width: `${synthesisStep * 25}%` }}
                  />
                </div>
              </div>
            ) : (
              <HighlightedOrangeCode code={getCurrentCode()} />
            )}
          </div>

          {/* Terminal Footer Info Bar */}
          <div className="bg-[#121212] px-5 py-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Molten Edge V8 Isolate
              </span>
              <span>&middot;</span>
              <span>Cold Start: &lt;0.08ms</span>
              <span>&middot;</span>
              <span className="text-[#FFB627]">TypeScript 5.8 Strict</span>
            </div>
            <div className="flex items-center gap-2 text-[#FF6B35]">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Deployed across 285+ Anycast PoPs</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
