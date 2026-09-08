import React from 'react';
import { 
  Check, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Server, 
  Cpu,
  Hammer
} from 'lucide-react';
import { TiltCard3D } from './TiltCard3D';

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="relative py-24 bg-[#121212] overflow-hidden border-t border-white/[0.06]">
      {/* Background Ambient Heat Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-[#FFB627]/5 rounded-full blur-[190px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#FFB627]/30 text-xs font-mono text-[#FFB627] mb-4 shadow-[0_0_20px_rgba(255,182,39,0.2)]">
            <Hammer className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>TRANSPARENT INDUSTRIAL TIERS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            Forged for Developers.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#FFB627] to-[#FFAA00]">
              Priced for Scale.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Start completely free by pooling your own developer quotas, or scale to dedicated enterprise foundries.
          </p>
        </div>

        {/* 3D Tilted Metallic Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Card 1: Developer Foundry (100% Free BYOA) */}
          <TiltCard3D
            maxTilt={6}
            glareEffect={true}
            className="metallic-card p-7 sm:p-8 flex flex-col justify-between border border-white/10 hover:border-[#FFB627]/40"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-[#181818] text-[#FFB627] border border-[#FFB627]/25">
                  BYOA POOL
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">100% Free</span>
              </div>

              <h3 className="text-2xl font-bold text-white font-display">
                Developer Foundry
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Pool your personal free accounts with zero markups or credit cards.
              </p>

              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white font-display">$0</span>
                  <span className="text-xs font-mono text-slate-400">/ forever</span>
                </div>
                <span className="text-[11px] font-mono text-[#FF6B35] block mt-1">
                  No credit card required
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-300 font-normal">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FFB627] shrink-0 mt-0.5" />
                  <span><strong>Combine Unlimited Free Accounts</strong> (Google, Groq, SiliconFlow, Cloudflare).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FFB627] shrink-0 mt-0.5" />
                  <span><strong>Automatic 429 Failover</strong> in 0ms with intelligent round-robin health checks.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FFB627] shrink-0 mt-0.5" />
                  <span><strong>1 Master OpenAI Endpoint</strong> for Cursor, VS Code, Cline, and Python.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FFB627] shrink-0 mt-0.5" />
                  <span><strong>Add Any Custom Provider</strong> (Ollama, LM Studio, RunPod, VPS).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FFB627] shrink-0 mt-0.5" />
                  <span>1-Click Instant Key Revocation &amp; Audit Trail.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <a
                href="#hero"
                className="w-full btn-forge-secondary py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Start Forging Free</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFB627]" />
              </a>
            </div>
          </TiltCard3D>

          {/* Card 2: Industrial Pro (Featured Metallic Gold Card) */}
          <TiltCard3D
            maxTilt={7}
            glareEffect={true}
            className="metallic-card p-7 sm:p-8 flex flex-col justify-between border-2 border-[#FFB627]/50 shadow-[0_0_50px_rgba(255,182,39,0.2)] relative"
          >
            {/* Featured Molten Banner */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627] text-[#0c0c0c] text-[10px] font-black uppercase tracking-widest shadow-md">
              MOST POWERFUL FORGE
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-1">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-[#FF6B35]/20 text-[#FFB627] border border-[#FF6B35]/30">
                  PRODUCTION FOUNDRY
                </span>
                <div className="flex items-center gap-1 text-xs font-mono text-[#FF6B35]">
                  <Flame className="w-3.5 h-3.5" />
                  <span>High Concurrency</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white font-display">
                Industrial Pro
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                For fast-shipping teams that require dedicated Anycast Edge deployment.
              </p>

              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white font-display">$29</span>
                  <span className="text-xs font-mono text-slate-400">/ month</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 block mt-1">
                  Or $0 with BYOA account pooling
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-white font-normal">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                  <span><strong>Everything in Developer Foundry</strong> plus team quota federation.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                  <span><strong>285+ Anycast Global Edge Mesh</strong> with sub-12ms Anycast routing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                  <span><strong>Custom Domain Support</strong> (<code className="text-[#FFB627]">api.yourdomain.com</code>).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                  <span><strong>Automated Schema Healing</strong> &amp; zero-downtime canary deployments.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                  <span>99.999% SLA Edge Availability Guarantee.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#FFB627]/25">
              <button
                className="w-full btn-forge-primary py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Forge with Industrial Pro</span>
                <Flame className="w-4 h-4 text-[#0c0c0c]" />
              </button>
            </div>
          </TiltCard3D>

          {/* Card 3: Enterprise Crucible */}
          <TiltCard3D
            maxTilt={6}
            glareEffect={true}
            className="metallic-card p-7 sm:p-8 flex flex-col justify-between border border-white/10 hover:border-teal-500/40"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-[#0D3B3B]/60 text-teal-300 border border-teal-500/30">
                  DEDICATED ANVIL
                </span>
                <span className="text-xs font-mono text-teal-400 font-semibold">Custom VPC</span>
              </div>

              <h3 className="text-2xl font-bold text-white font-display">
                Enterprise Crucible
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Air-gapped on-premise forge &amp; custom hardware accelerator clusters.
              </p>

              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white font-display">Custom</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block mt-1">
                  Tailored SLA &amp; dedicated infrastructure
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-300 font-normal">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>On-Premise VPC Deployment</strong> (AWS, GCP, Bare-Metal Linux).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Dedicated Hardware Anvil</strong> (Private H100 / H200 cluster routing).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Zero-Trust SAML/SSO &amp; SCIM</strong> provisioning with audit logging.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>24/7 Dedicated Foundry Architect on Slack/Discord.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Custom Legal BAA, HIPAA &amp; SOC2 Type II compliance.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                className="w-full btn-forge-secondary py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Contact Foundry Architects</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFB627]" />
              </button>
            </div>
          </TiltCard3D>

        </div>

      </div>
    </section>
  );
};
