import React from 'react';
import { 
  Flame, 
  ShieldCheck, 
  Globe2, 
  Code2, 
  Layers, 
  Cpu, 
  Lock,
  Shuffle,
  Server,
  Zap,
  Hammer,
  ArrowUpRight
} from 'lucide-react';
import { TiltCard3D } from './TiltCard3D';

const FORGE_FEATURES = [
  {
    id: 'multi-account-forge',
    title: 'Multi-Account Quota Pooler',
    subtitle: 'Zero 429 Rate Limits Forever',
    description: 'Pool developer accounts from Google AI Studio, Groq, SiliconFlow, and Cerebras into 1 master endpoint. When one account runs out of tokens, traffic shifts instantly to the next account in <10ms.',
    icon: Shuffle,
    color: 'from-[#FFB627] to-[#FF6B35]',
    iconColor: 'text-[#FFB627]',
    badge: 'Auto 429 Failover',
    codeSnippet: `// 1 Master Endpoint for All Pooled Accounts
const client = new OpenAI({
  baseURL: 'https://nexus-gateway.dev/v1',
  apiKey: 'forge_live_master_key'
});`
  },
  {
    id: 'ai-synthesis',
    title: 'Universal OpenAI Compatibility',
    subtitle: 'Plug Directly into Cursor & Cline',
    description: 'Every request is formatted to the standard OpenAI /v1/chat/completions spec. Plug seamlessly into Cursor, VS Code Continue, Cline, LangChain, LlamaIndex, or raw cURL.',
    icon: Code2,
    color: 'from-[#FF6B35] to-[#FFB627]',
    iconColor: 'text-[#FF6B35]',
    badge: 'Drop-In Protocol',
    codeSnippet: `// VS Code settings.json (Cline / Continue)
{
  "apiBase": "https://nexus-gateway.dev/v1",
  "apiKey": "forge_live_master_key",
  "model": "deepseek-ai/DeepSeek-R1"
}`
  },
  {
    id: 'edge-mesh',
    title: 'High-Throughput Edge Routing',
    subtitle: '<12ms Routing Across 285+ PoPs',
    description: 'Requests are routed through distributed edge instances with smart token bucket tracking, health checks, and automatic geographic failover.',
    icon: Globe2,
    color: 'from-[#0D3B3B] to-[#FFB627]',
    iconColor: 'text-teal-400',
    badge: '285+ Anycast PoPs',
    codeSnippet: `nexus.route({
  strategy: 'least-latency-failover',
  accounts: ['google_pool', 'groq_pool', 'silicon_pool'],
  autoRetryOn429: true
});`
  },
  {
    id: 'custom-foundry',
    title: 'Custom Provider & VPS Support',
    subtitle: 'Bring Any Local or Cloud Endpoint',
    description: 'Plug in self-hosted Ollama instances, local LM Studio, RunPod vLLM servers, or proprietary private LLM endpoints directly into your unified gateway mesh.',
    icon: Server,
    color: 'from-[#FF6B35] to-[#0D3B3B]',
    iconColor: 'text-[#FFB627]',
    badge: 'Universal BYOA',
    codeSnippet: `nexus.addCustomProvider({
  name: 'Local Ollama RTX 4090',
  baseURL: 'http://localhost:11434/v1',
  models: ['deepseek-r1:32b', 'llama3.3']
});`
  },
  {
    id: 'zero-trust-vault',
    title: 'Client-Side Key Security',
    subtitle: 'Zero-Trust Architecture',
    description: 'Your upstream provider API keys remain completely secure. Generate master tokens for development without ever leaking root provider credentials to client apps.',
    icon: Lock,
    color: 'from-[#FFB627] to-[#FFAA00]',
    iconColor: 'text-[#FFB627]',
    badge: 'Zero-Trust Vault',
    codeSnippet: `// Key Rotation with Zero Downtime
await nexus.rotateKey({
  reason: 'Routine Security Cycle',
  immediateRevoke: true
});`
  },
  {
    id: 'sdk-crucible',
    title: 'Zero-Cost Free AI Aggregator',
    subtitle: '28+ Free Providers in 1 Place',
    description: 'Access 28+ verified free AI providers offering daily quotas without credit cards. Multiply your free allowance across multiple accounts effortlessly.',
    icon: Zap,
    color: 'from-[#0D3B3B] to-[#FF6B35]',
    iconColor: 'text-[#FFB627]',
    badge: '100% Free Tiers',
    codeSnippet: `// Free Combined Quota
const stats = await nexus.getPoolStats();
console.log(stats.dailyFreeTokensRemaining); // >50M Tokens`
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-24 bg-[#121212] overflow-hidden border-t border-b border-white/[0.06]">
      {/* Background Molten Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-[#FF6B35]/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a1a1a] border border-[#FFB627]/30 text-xs font-mono text-[#FFB627] mb-4 shadow-[0_0_20px_rgba(255,182,39,0.2)]">
            <Shuffle className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>ENTERPRISE-GRADE AI EDGE POOL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            Pool Free Quotas.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#FFB627] to-[#FFAA00]">
              Eliminate Rate Limits.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Engineered for developers who demand uninterrupted coding in Cursor, Cline, and custom applications 
            without paying expensive API subscriptions.
          </p>
        </div>

        {/* 3D Tilted Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FORGE_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <TiltCard3D
                key={feature.id}
                maxTilt={7}
                glareEffect={true}
                className="p-6 sm:p-7 flex flex-col justify-between group cursor-default transition-all duration-300"
              >
                <div>
                  {/* Card Header: Icon & Industrial Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#FFB627]/25 flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.15)] group-hover:border-[#FFB627]/60 group-hover:scale-105 transition-all duration-300">
                      <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-[#181818] text-[#FFB627] border border-[#FFB627]/25 shadow-sm">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Feature Title & Subtitle */}
                  <h3 className="text-lg font-bold text-white font-display mb-1 group-hover:text-[#FFB627] transition-colors">
                    {feature.title}
                  </h3>
                  <div className="text-xs font-mono text-[#FF6B35] mb-3">
                    {feature.subtitle}
                  </div>

                  {/* Feature Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                    {feature.description}
                  </p>
                </div>

                {/* Industrial Code Snippet with Orange Syntax Highlights */}
                <div className="rounded-xl bg-[#0a0a0a] border border-white/10 p-3 font-mono text-[11px] overflow-x-auto shadow-inner group-hover:border-[#FFB627]/30 transition-colors">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5 text-[9px] text-slate-500 uppercase">
                    <span>FORGED ARTIFACT</span>
                    <span className="text-[#FF6B35] font-bold">READY</span>
                  </div>
                  <pre className="text-slate-300 whitespace-pre leading-relaxed">
                    <code>{feature.codeSnippet}</code>
                  </pre>
                </div>
              </TiltCard3D>
            );
          })}
        </div>

      </div>
    </section>
  );
};
