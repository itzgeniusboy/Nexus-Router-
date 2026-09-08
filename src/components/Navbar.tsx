import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  ChevronRight, 
  Cpu, 
  Menu, 
  X, 
  Shuffle,
  Hammer,
  Activity
} from 'lucide-react';

interface NavbarProps {
  onOpenGenerator: () => void;
  onOpenDocs?: () => void;
  onOpenUnifiedGateway?: () => void;
  onOpenCustomProvider?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenGenerator, 
  onOpenUnifiedGateway,
  onOpenCustomProvider 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Safe localStorage read — avoids JSON parse crash in JSX render
  const [pooledAccountCount, setPooledAccountCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('nexus_pooled_gmails');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? Math.max(parsed.length, 1) : 1;
    } catch {
      return 1;
    }
  });

  // Sync count when modal closes (storage event doesn't fire same-tab, so poll on focus)
  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem('nexus_pooled_gmails');
        const parsed = raw ? JSON.parse(raw) : [];
        setPooledAccountCount(Array.isArray(parsed) ? Math.max(parsed.length, 1) : 1);
      } catch { /* ignore */ }
    };
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);
    return () => { 
      window.removeEventListener('focus', sync); 
      window.removeEventListener('storage', sync); 
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none px-3 sm:px-6 pt-3 sm:pt-4">
      {/* iOS Floating Dynamic Island Dock Capsule */}
      <div 
        className={`max-w-6xl mx-auto pointer-events-auto transition-all duration-500 ${
          scrolled 
            ? 'ios-dock rounded-full px-4 sm:px-6 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.18)]' 
            : 'bg-[#18181b]/50 backdrop-blur-md rounded-2xl sm:rounded-full px-4 sm:px-6 py-3 border border-white/[0.06]'
        } flex items-center justify-between`}
      >
        {/* Brand Logo & Name */}
        <a href="#" className="flex items-center gap-3 group ios-tap">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#FF6B35] via-[#FFB627] to-[#0D3B3B] p-[1.5px] shadow-[0_0_20px_rgba(255,107,53,0.45)]">
            <div className="w-full h-full rounded-full bg-[#121215] flex items-center justify-center group-hover:bg-[#1c1c20] transition-colors">
              <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FFB627] group-hover:text-[#FF6B35] group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white font-display">
                Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FFB627]">Gateway</span>
              </span>
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-mono tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE</span>
              </div>
            </div>
            <span className="text-[9px] text-slate-400 font-mono tracking-widest -mt-0.5 uppercase">
              Zero-Rate-Limit &bull; AI Edge Pool
            </span>
          </div>
        </a>

        {/* Desktop Nav Items (iOS Style Pill Segment) */}
        <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium text-slate-300 bg-black/20 p-1 rounded-full border border-white/[0.05]">
          <a href="#hero" className="px-3.5 py-1 rounded-full hover:text-white hover:bg-white/[0.06] transition-all">
            Master Hub
          </a>
          <a href="#architecture" className="px-3.5 py-1 rounded-full hover:text-white hover:bg-white/[0.06] transition-all">
            Architecture
          </a>
          <a href="#features" className="px-3.5 py-1 rounded-full hover:text-white hover:bg-white/[0.06] transition-all">
            Features
          </a>
          <a href="#providers" className="px-3.5 py-1 rounded-full hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1.5">
            <span>Free Hub</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-[#FFB627]/15 text-[#FFB627] border border-[#FFB627]/30">28+</span>
          </a>
        </nav>

        {/* Right CTA Area: Apple-style rounded pill buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {onOpenCustomProvider && (
            <button
              onClick={onOpenCustomProvider}
              className="ios-tap px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-[#FFB627]" />
              <span>+ Custom Host</span>
            </button>
          )}

          {onOpenUnifiedGateway && (
            <button
              id="nav-multi-gmail-btn"
              onClick={onOpenUnifiedGateway}
              className="ios-tap px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1e1e24] hover:bg-[#282830] border border-[#FFB627]/30 text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Accounts ({pooledAccountCount})</span>
            </button>
          )}

          <button
            id="nav-launch-console-btn"
            onClick={onOpenUnifiedGateway || onOpenGenerator}
            className="ios-tap btn-forge-primary px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-[#0c0c0c]" />
            <span>Get API Key</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#0c0c0c] opacity-90" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full bg-white/[0.08] border border-white/10 text-slate-200 hover:text-white cursor-pointer ios-tap"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (iOS Sheet style) */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 max-w-6xl mx-auto ios-dock rounded-3xl p-4 space-y-3 pointer-events-auto border border-white/[0.15]">
          <nav className="flex flex-col space-y-1 text-sm text-slate-300">
            <a 
              href="#architecture" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
            >
              Pipeline Architecture
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
            >
              Edge Features
            </a>
            <a 
              href="#providers" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
            >
              28+ Free Providers Catalog
            </a>
          </nav>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            {onOpenUnifiedGateway && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUnifiedGateway();
                }}
                className="w-full py-2.5 rounded-full text-xs font-semibold bg-[#1e1e24] border border-[#FFB627]/30 text-white flex items-center justify-center gap-2 ios-tap"
              >
                <Shuffle className="w-4 h-4 text-[#FF6B35]" />
                <span>Multi-Account Pool</span>
              </button>
            )}
            {onOpenCustomProvider && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCustomProvider();
                }}
                className="w-full py-2.5 rounded-full text-xs font-semibold bg-white/[0.08] border border-white/10 text-white flex items-center justify-center gap-2 ios-tap"
              >
                <Cpu className="w-4 h-4 text-[#FFB627]" />
                <span>+ Custom Host / VPS</span>
              </button>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGenerator();
              }}
              className="w-full btn-forge-primary py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 ios-tap"
            >
              <Hammer className="w-4 h-4 text-[#0c0c0c]" />
              <span>Forge API with AI</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
