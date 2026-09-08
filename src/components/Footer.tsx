import React from 'react';
import { 
  Flame, 
  Github, 
  Twitter, 
  Disc as Discord, 
  Terminal, 
  ShieldCheck, 
  Heart, 
  Hammer,
  ArrowUpRight,
  Globe2,
  Cpu
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-mesh-footer-forge border-t border-[#FFB627]/20 text-slate-400 overflow-hidden pt-16 pb-12">
      {/* Molten Glow Element at Bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-[#FF6B35]/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FFB627] p-[1.5px] shadow-[0_0_20px_rgba(255,107,53,0.5)]">
                <div className="w-full h-full rounded-[10px] bg-[#141414] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#FFB627]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white font-display tracking-tight">
                  Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FFB627]">Gateway</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                  Zero-Rate-Limit AI Edge Pool
                </span>
              </div>
            </a>

            <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed">
              Synthesize zero-latency edge APIs, pool multiple free developer accounts, 
              and route high-throughput requests with automated 429 failover.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#FFB627]/30 text-[11px] font-mono text-[#FFB627]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Nexus Edge: Operational</span>
              </span>
              <span className="text-xs font-mono text-slate-500">99.999% SLA</span>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Hammer className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Platform</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li><a href="#hero" className="hover:text-[#FFB627] transition-colors">Master API Gateway</a></li>
              <li><a href="#architecture" className="hover:text-[#FFB627] transition-colors">Failover Architecture</a></li>
              <li><a href="#features" className="hover:text-[#FFB627] transition-colors">Edge Failover Features</a></li>
              <li><a href="#providers" className="hover:text-[#FFB627] transition-colors">28+ Free Providers Hub</a></li>
            </ul>
          </div>

          {/* Column 3: Architecture */}
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#FFB627]" />
              <span>Architecture</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li><a href="#" className="hover:text-[#FFB627] transition-colors">429 Auto Failover</a></li>
              <li><a href="#" className="hover:text-[#FFB627] transition-colors">285+ Anycast PoPs</a></li>
              <li><a href="#" className="hover:text-[#FFB627] transition-colors">V8 Edge Isolates</a></li>
              <li><a href="#" className="hover:text-[#FFB627] transition-colors">Ollama &amp; VPS Bridge</a></li>
              <li><a href="#" className="hover:text-[#FFB627] transition-colors">AES-256-GCM Vault</a></li>
            </ul>
          </div>

          {/* Column 4: Community & SDKs */}
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Connect</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#FFB627] transition-colors flex items-center gap-1"><span>GitHub Forge</span> <ArrowUpRight className="w-3 h-3" /></a></li>
              <li><a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-[#FFB627] transition-colors flex items-center gap-1"><span>Discord Foundry</span> <ArrowUpRight className="w-3 h-3" /></a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#FFB627] transition-colors flex items-center gap-1"><span>X / Twitter</span> <ArrowUpRight className="w-3 h-3" /></a></li>
              <li><a href="#" className="hover:text-[#FFB627] transition-colors">OpenAPI 3.1 Spec</a></li>
              <li><a href="#" className="hover:text-[#FFB627] transition-colors">Status &amp; Incidents</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Nexus Gateway.</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400">Cast with burnt orange &amp; warm gold.</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
            <span className="text-[#FFB627]">100% BYOA Zero-Cost Engine</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
