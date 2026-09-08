import React, { useState } from 'react';
import { Terminal, Copy, Check, Sparkles, CheckCircle2, ChevronRight, Zap, Flame, Hammer } from 'lucide-react';

const CLI_COMMANDS = [
  {
    id: 'init',
    tabName: '1. Initialize',
    command: 'forgeapi init e-commerce-api --template=stripe-checkout',
    output: `✔ Fetched template 'stripe-checkout' [180ms]
✔ Synthesized typed Prisma schema & Zod validators
✔ Injected sliding rate-limiter & JWT auth guard
✔ Local development server running at http://localhost:8080/v1`
  },
  {
    id: 'generate',
    tabName: '2. Generate Route',
    command: 'forgeapi generate route "POST /orders/refund with Stripe webhook"',
    output: `✔ Analyzed prompt semantics with Molten AI Core
✔ Created src/routes/refund.ts (V8 isolate compatible)
✔ Generated TypeScript types & client SDK bindings
✔ Verified zero vulnerabilities with static security analyzer`
  },
  {
    id: 'deploy',
    tabName: '3. Deploy Edge',
    command: 'forgeapi deploy --edge --env=production',
    output: `✔ Bundling micro-container isolate [120ms]
✔ Deploying to 285+ Anycast PoPs simultaneously
✔ Validating health checks... [OK]
✨ Live Production URL: https://api.forgeapi.dev/v1/orders/refund
✨ Latency: 7.4ms (Global P99: 10.8ms)`
  }
];

export const CliShowcase: React.FC = () => {
  const [activeStep, setActiveStep] = useState(CLI_COMMANDS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeStep.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="cli-terminal" className="relative py-20 lg:py-28 bg-[#121212] overflow-hidden border-t border-white/[0.06]">
      {/* Background Ember Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FF6B35]/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#FFB627]/30 text-xs font-mono text-[#FFB627] mb-4 shadow-[0_0_20px_rgba(255,182,39,0.15)]">
            <Terminal className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>DEVELOPER EXPERIENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-display">
            CLI-First for Maximum{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FFB627]">
              Terminal Speed
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Prefer the terminal? ForgeAPI CLI integrates directly into your command line, 
            CI/CD pipelines, and GitHub Actions with zero friction.
          </p>
        </div>

        {/* CLI Terminal Mockup Card */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#141414] border border-[#FFB627]/25 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden">
          
          {/* Header Bar */}
          <div className="bg-[#181818] px-4 py-3 border-b border-white/[0.08] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-[#FFB627]/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">bash &middot; forge-cli v3.4.0</span>
            </div>

            {/* Quick Step Buttons */}
            <div className="flex items-center gap-1.5">
              {CLI_COMMANDS.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => setActiveStep(cmd)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                    activeStep.id === cmd.id
                      ? 'bg-[#FF6B35]/20 text-[#FFB627] border border-[#FF6B35]/40 font-semibold'
                      : 'text-slate-400 hover:text-white bg-white/[0.03]'
                  }`}
                >
                  {cmd.tabName}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Command Input Area */}
          <div className="bg-[#101010] p-5 sm:p-6 font-mono text-xs sm:text-sm space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/10 shadow-inner">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-[#FF6B35] font-bold select-none">&gt;</span>
                <span className="text-white select-all">{activeStep.command}</span>
              </div>
              <button
                onClick={handleCopy}
                className="ml-3 p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copy command"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Output Log Box */}
            <div className="p-4 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-line text-xs sm:text-[13px]">
              {activeStep.output}
            </div>

            {/* Terminal Footer Indicator */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Edge Engine: Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#FFB627]" />
                <span className="text-slate-400">Zero Cold Starts &bull; V8 Isolates</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
