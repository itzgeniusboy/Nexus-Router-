import React, { useState } from 'react';
import { 
  GitBranch, 
  Cpu, 
  ShieldCheck, 
  Globe2, 
  Code2, 
  ArrowRight, 
  Layers, 
  CheckCircle2,
  Sparkles,
  Zap,
  Flame,
  Hammer
} from 'lucide-react';

const PIPELINE_STAGES = [
  {
    id: 'client_request',
    step: '01',
    title: 'Standard OpenAI Call',
    subtitle: '/v1/chat/completions',
    description: 'Accepts standard OpenAI-compatible requests from Cursor, Continue, VS Code Cline, LangChain, or Python SDKs.',
    icon: Code2,
    stat: '100% Compatible',
    details: 'Zero code rewrite needed. Just replace base_url and api_key in your tools.'
  },
  {
    id: 'edge_router',
    step: '02',
    title: 'Nexus Edge Router',
    subtitle: 'Stateful Health Check',
    description: 'Distributes traffic via Round-Robin, Least-Latency, or Priority across your active pooled accounts.',
    icon: Cpu,
    stat: '<2ms Routing',
    details: 'Continuously monitors token consumption and quota reset windows across all configured providers.'
  },
  {
    id: 'failover',
    step: '03',
    title: 'Instant 429 Failover',
    subtitle: 'Zero Downtime Circuit Breaker',
    description: 'If Google, Groq, or DeepSeek signals rate limit (HTTP 429), Nexus instantly reroutes to Account #2 in <10ms.',
    icon: ShieldCheck,
    stat: '0ms Interruption',
    details: 'User request never fails with quota errors; upstream fallback happens transparently.'
  },
  {
    id: 'model_adapt',
    step: '04',
    title: 'Multi-Provider Adapter',
    subtitle: 'Protocol Translation',
    description: 'Seamlessly translates prompts to Llama-3.3, DeepSeek-R1, Qwen-Coder, Mistral, or Groq formats behind the scenes.',
    icon: Globe2,
    stat: '28+ Free Providers',
    details: 'Handles token limits, system prompt variations, and reasoning model special tokens automatically.'
  },
  {
    id: 'stream',
    step: '05',
    title: 'Zero-Latency Streaming',
    subtitle: 'Server-Sent Events (SSE)',
    description: 'Streams tokens directly back to Cursor or VS Code with minimal time-to-first-token (TTFT).',
    icon: Zap,
    stat: '>250 Tok/sec',
    details: 'High-throughput edge SSE streaming pipe keeps your IDE autocompletion fluid and snappy.'
  }
];

export const ArchitectureFlow: React.FC = () => {
  const [activeStage, setActiveStage] = useState(PIPELINE_STAGES[1]);

  return (
    <section id="architecture" className="relative py-20 lg:py-28 bg-[#121212] overflow-hidden border-t border-white/[0.06]">
      {/* Background Ember Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#FF6B35]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#FFB627]/30 text-xs font-mono text-[#FFB627] mb-4 shadow-[0_0_20px_rgba(255,182,39,0.15)]">
            <Flame className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>HOW NEXUS GATEWAY WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
            Multi-Account{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FFB627]">
              Failover Architecture
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            From single client call to automated 429 rate-limit bypass and high-speed streaming in under 10 milliseconds.
            Select each stage to inspect the routing mechanism.
          </p>
        </div>

        {/* 5-Stage Interactive Pipeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {PIPELINE_STAGES.map((stage) => {
            const Icon = stage.icon;
            const isSelected = activeStage.id === stage.id;

            return (
              <div
                key={stage.id}
                onClick={() => setActiveStage(stage)}
                className={`relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1c1c1c] border-[#FFB627]/60 shadow-[0_10px_30px_rgba(255,107,53,0.25)] scale-[1.02]'
                    : 'bg-[#161616] border-white/[0.08] hover:border-[#FFB627]/30 hover:bg-[#1a1a1a]'
                }`}
              >
                {/* Step Marker */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-[#FFB627]' : 'text-slate-500'}`}>
                    {stage.step}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                    {stage.stat}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-inner ${
                  isSelected 
                    ? 'bg-[#FF6B35]/20 text-[#FFB627] border border-[#FF6B35]/40'
                    : 'bg-white/[0.04] text-slate-300 border border-white/10'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm font-bold text-white font-display mb-1">
                    {stage.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {stage.subtitle}
                  </p>
                </div>

                {/* Active Indicator Bar */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-[#FFB627] font-semibold' : 'text-slate-400'}`}>
                    {isSelected ? 'Active View' : 'Inspect'}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-ping" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Deep-Dive Inspection Panel */}
        <div className="rounded-2xl bg-[#181818] border border-[#FFB627]/30 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B35]/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF6B35]/20 text-[#FFB627] border border-[#FF6B35]/30">
                  STAGE {activeStage.step}
                </span>
                <span className="text-xs font-mono text-[#FFB627] font-semibold">
                  {activeStage.subtitle}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                {activeStage.title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {activeStage.description}
              </p>

              <div className="p-4 rounded-xl bg-[#101010] border border-white/10 text-xs font-mono text-slate-300 flex items-start gap-3">
                <Zap className="w-4 h-4 text-[#FFB627] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Edge Optimization Metric:</strong> {activeStage.details}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl bg-[#101010] border border-white/10 p-5 font-mono text-xs text-slate-300 shadow-inner space-y-2.5">
                <div className="text-[11px] text-slate-500">// Execution Flow Telemetry</div>
                <div className="text-emerald-400 font-semibold">&gt; status: OK (200)</div>
                <div className="text-slate-300">&gt; compile_target: v8-isolates-edge</div>
                <div className="text-slate-300">&gt; rate_limit_bucket: 10,000 req/min</div>
                <div className="text-[#FFB627]">&gt; global_propagation_time: 240ms</div>
                <div className="text-slate-400 text-[10px] pt-2 border-t border-white/[0.08]">
                  Verified by Zero-Trust Edge Mesh Validator
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
