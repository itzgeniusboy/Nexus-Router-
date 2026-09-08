import React from 'react';
import { 
  Flame, 
  Activity, 
  Key, 
  Layers, 
  Terminal, 
  Cpu, 
  Server, 
  ScrollText,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { type User } from 'firebase/auth';

export type PanelTab = 'overview' | 'pool' | 'playground' | 'models' | 'custom' | 'logs';

interface PanelHeaderProps {
  activeTab: PanelTab;
  onSelectTab: (tab: PanelTab) => void;
  masterKey: string;
  gatewayUrl: string;
  isOnline: boolean;
  activeKeyCount: number;
  onRotateKey: () => void;
  isRotating: boolean;
  user?: User | null;
  onSignOut?: () => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  activeTab,
  onSelectTab,
  masterKey,
  gatewayUrl,
  isOnline,
  activeKeyCount,
  onRotateKey,
  isRotating,
  user,
  onSignOut,
}) => {
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(masterKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(gatewayUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const navItems: { id: PanelTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview & Connect', icon: Layers },
    { id: 'pool', label: 'Keys & Provider Pool', icon: Key },
    { id: 'playground', label: 'Live Playground', icon: Terminal },
    { id: 'models', label: 'Model Directory', icon: Cpu },
    { id: 'custom', label: 'Local & Custom Hosts', icon: Server },
    { id: 'logs', label: 'Live Request Logs', icon: ScrollText },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#141416]/95 backdrop-blur-md border-b border-white/[0.08]">
        {/* Top Brand & Status Strip */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] via-[#FFB627] to-[#121212] p-[1.5px] shadow-[0_0_16px_rgba(255,107,53,0.3)] shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#121214] flex items-center justify-center">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB627]" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight font-display truncate">
                  Nexus Gateway
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-[#FF6B35]/20 text-[#FFB627] border border-[#FF6B35]/30 shrink-0">
                  PANEL
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono hidden sm:block truncate">
                Zero-rate-limit AI edge pool &amp; router
              </p>
            </div>
          </div>

          {/* Center/Right: Quick Key & Gateway Endpoint */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Edge Health Pill - Desktop */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300">
                {isOnline ? 'Online' : 'Connecting...'}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-[#FFB627]">
                {activeKeyCount} Pool Keys
              </span>
            </div>

            {/* Quick Copy Key Button - 44px min touch target */}
            <button
              onClick={copyKey}
              title="Copy Master Virtual API Key"
              className="min-h-[42px] px-2.5 sm:px-3 py-2 rounded-xl bg-[#222226] hover:bg-[#2c2c32] active:scale-95 border border-white/10 text-xs font-mono text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer select-none"
            >
              <Key className="w-4 h-4 text-[#FFB627] shrink-0" />
              <span className="hidden md:inline text-slate-400">Key:</span>
              <span className="font-bold text-[11px] sm:text-xs">{masterKey.slice(0, 8)}...</span>
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* Quick Rotate Button - 44px min touch target */}
            <button
              onClick={onRotateKey}
              disabled={isRotating}
              title="Rotate Master API Key"
              className="min-w-[42px] min-h-[42px] p-2.5 rounded-xl bg-[#222226] hover:bg-[#2c2c32] active:scale-95 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin text-[#FFB627]' : ''}`} />
            </button>

            {/* User Profile & Sign Out */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="flex items-center gap-2 max-w-[140px] sm:max-w-[200px]" title={user.email || 'Logged in user'}>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF6B35]/20 border border-[#FFB627]/40 text-[#FFB627] flex items-center justify-center text-xs font-bold shrink-0">
                      {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </div>
                  )}
                  <div className="hidden sm:block min-w-0">
                    <p className="text-xs font-medium text-white truncate leading-tight">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    title="Sign Out of Nexus"
                    className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop / Tablet Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-white/[0.05] scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`min-h-[44px] flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? 'border-[#FF6B35] text-white font-semibold bg-white/[0.04]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFB627]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (Screens < 640px) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121215]/95 backdrop-blur-xl border-t border-white/10 px-1 py-1 shadow-[0_-8px_24px_rgba(0,0,0,0.7)]">
        <div className="grid grid-cols-6 gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            // Short label for mobile bottom bar
            const mobileLabel = item.id === 'overview' ? 'Overview'
              : item.id === 'pool' ? 'Pool'
              : item.id === 'playground' ? 'Test'
              : item.id === 'models' ? 'Models'
              : item.id === 'custom' ? 'Hosts'
              : 'Logs';

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`min-h-[48px] py-1.5 px-0.5 flex flex-col items-center justify-center rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#FFB627] bg-white/[0.06] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#FFB627]' : 'text-slate-400'}`} />
                <span className="text-[10px] leading-tight truncate">{mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
