import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  Code2, 
  Copy, 
  Check, 
  Shuffle,
  RefreshCw,
  Server,
  Play,
  Flame,
  Hammer,
  Key,
  TerminalSquare
} from 'lucide-react';
import { ForgeCore3D } from './ForgeCore3D';
import { EmberCanvas } from './EmberCanvas';

interface HeroProps {
  onOpenUnifiedGateway: () => void;
  onOpenCustomProviderModal: () => void;
  onExploreArchitecture?: () => void;
  onForgePrompt?: (prompt: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onOpenUnifiedGateway,
  onOpenCustomProviderModal,
  onForgePrompt
}) => {
  const [activeSnippetTab, setActiveSnippetTab] = useState<'cursor' | 'vscode' | 'python' | 'curl'>('cursor');
  const [heroCardMode, setHeroCardMode] = useState<'endpoint' | 'key' | 'code'>('endpoint');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Dynamic host detection
  const [currentOrigin, setCurrentOrigin] = useState('https://ais-dev-zghse3fb6n5qggs4lz3luq-470491496334.asia-southeast1.run.app');
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const [masterToken, setMasterToken] = useState<string>(() => {
    // migrate old forge_ / nxf_ keys to unified nexus_ namespace
    const saved = localStorage.getItem('nexus_user_master_token')
      || localStorage.getItem('nxf_user_master_token');
    if (saved) { localStorage.setItem('nexus_user_master_token', saved); return saved; }
    const newToken = `nxg_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('nexus_user_master_token', newToken);
    return newToken;
  });

  const [isRotating, setIsRotating] = useState(false);

  // Live Test ping state
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    status: number;
    account: string;
    model: string;
    latency: number;
    reply: string;
  } | null>(null);

  const gatewayUrl = `${currentOrigin}/api/gateway/v1`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(masterToken);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(gatewayUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRotateKey = async () => {
    if (!window.confirm("Regenerate Master API Key? Previous key will be revoked immediately.")) return;
    setIsRotating(true);
    try {
      const res = await fetch('/api/gateway/v1/rotate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentToken: masterToken, reason: 'Manual regeneration' })
      });
      const data = await res.json();
      if (data.newToken) {
        setMasterToken(data.newToken);
        localStorage.setItem('nexus_user_master_token', data.newToken);
      }
    } catch (e) {
      console.error('Rotate failed', e);
    } finally {
      setIsRotating(false);
    }
  };

  const handleRunPingTest = async () => {
    setIsPinging(true);
    setPingResult(null);
    const startTime = Date.now();
    try {
      const res = await fetch('/api/gateway/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${masterToken}`
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-R1',
          messages: [{ role: 'user', content: 'Ping edge gateway' }]
        })
      });
      const elapsed = Date.now() - startTime;
      const data = await res.json();
      const accountHeader = res.headers.get('X-Nexus-Account') || res.headers.get('X-Forge-Account') || 'Nexus Edge Router (Groq/Silicon)';
      setPingResult({
        status: res.status,
        account: accountHeader,
        model: data.model || 'deepseek-ai/DeepSeek-R1',
        latency: elapsed,
        reply: data.choices?.[0]?.message?.content || 'ForgeAPI core is operational. High-temperature edge routing online.'
      });
    } catch {
      // Show honest error — don't fake success
      setPingResult({
        status: 0,
        account: 'Connection failed — check server',
        model: 'N/A',
        latency: Date.now() - startTime,
        reply: 'Gateway unreachable. Make sure the dev server is running on the correct port.'
      });
    } finally {
      setIsPinging(false);
    }
  };

  const getActiveSnippet = () => {
    switch (activeSnippetTab) {
      case 'cursor':
        return `# Cursor Settings -> Models -> OpenAI API Key:\nBase URL: ${gatewayUrl}\nAPI Key:  ${masterToken}\nModel:    deepseek-ai/DeepSeek-R1`;
      case 'vscode':
        return `// VS Code settings.json (Continue / Cline)\n{\n  "apiBase": "${gatewayUrl}",\n  "apiKey": "${masterToken}",\n  "model": "deepseek-ai/DeepSeek-R1"\n}`;
      case 'python':
        return `from openai import OpenAI\n\nclient = OpenAI(base_url="${gatewayUrl}", api_key="${masterToken}")\nres = client.chat.completions.create(model="deepseek-ai/DeepSeek-R1", messages=[{"role": "user", "content": "Hello Nexus Gateway"}])\nprint(res.choices[0].message.content)`;
      case 'curl':
        return `curl ${gatewayUrl}/chat/completions \\\n  -H "Authorization: Bearer ${masterToken}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model": "deepseek-ai/DeepSeek-R1", "messages": [{"role": "user", "content": "Hi Nexus Gateway!"}]}'`;
    }
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getActiveSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <section id="hero" className="relative min-h-[96vh] pt-36 pb-20 lg:pt-40 lg:pb-28 overflow-hidden flex items-center bg-[#121212] iso-grid">
      {/* Background Ember Particles */}
      <EmberCanvas className="opacity-70" />

      {/* Industrial Dark Mesh & Ambient Molten Core Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-160px] left-1/4 w-[540px] h-[540px] bg-[#FF6B35]/12 rounded-full blur-[160px]" />
        <div className="absolute top-[-120px] right-1/4 w-[500px] h-[500px] bg-[#FFB627]/10 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#0D3B3B]/20 rounded-full blur-[180px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-7 text-left">
            
            {/* Top iOS Capsule Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ios-dock text-xs font-mono text-[#FFB627] shadow-[0_0_20px_rgba(255,182,39,0.15)]">
                <Flame className="w-3.5 h-3.5 text-[#FF6B35] animate-pulse" />
                <span className="font-bold tracking-wider uppercase">NEXUS GATEWAY &bull; ZERO-EFFORT AI POOL</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                Permanent Free Tier Active
              </span>
            </div>

            {/* Main Headline: Clear & Friendly */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-white leading-[1.08] font-display">
              Ek Single Endpoint:{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#FFB627] to-[#FFAA00]">
                Sabhi AI Models Bilkul Free.
              </span>
            </h1>

            {/* Subtitle: Super friendly explanation */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
              Bina kisi API key ke turant shuru karein! Apni multiple provider accounts jod kar daily limit badhayein, ya ek click mein DeepSeek, Llama 3.3 aur Qwen ko Cursor &amp; VS Code mein chalayein.
            </p>

            {/* 3-Step Simple Visual Guide */}
            <div className="w-full max-w-xl grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col">
                <div className="flex items-center gap-1.5 text-[#FFB627] text-xs font-bold font-mono mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#FFB627]/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Instant Free</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-snug">
                  Bina key dale DeepSeek &amp; Llama ready.
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono mb-1">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Pool Jodein</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-snug">
                  1-Click mein multi-provider accounts link karein.
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col">
                <div className="flex items-center gap-1.5 text-[#FF6B35] text-xs font-bold font-mono mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[10px]">3</span>
                  <span>Copy &amp; Use</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-snug">
                  Master key ko Cursor ya Python mein dalein.
                </span>
              </div>
            </div>

            {/* Clean Action Buttons */}
            <div className="w-full max-w-xl flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onOpenUnifiedGateway}
                className="ios-tap flex-1 btn-forge-primary py-3 px-6 rounded-full text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110"
              >
                <Shuffle className="w-4 h-4 text-[#0c0c0c]" />
                <span>Open Nexus Gateway Console</span>
                <ArrowRight className="w-4 h-4 text-[#0c0c0c]" />
              </button>

              <button
                onClick={onOpenCustomProviderModal}
                className="ios-tap px-5 py-3 rounded-full text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Server className="w-3.5 h-3.5 text-[#FFB627]" />
                <span>+ Add Custom Host</span>
              </button>
            </div>

            {/* Metrics Bar with Clean Typographic Hierarchy */}
            <div className="pt-4 w-full border-t border-white/10 grid grid-cols-4 gap-4 text-left">
              <div>
                <div className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                  &lt;12<span className="text-[#FF6B35]">ms</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Edge Latency</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                  60<span className="text-[#FFB627]">RPM</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Free Combined</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                  285<span className="text-emerald-400">+</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Global PoPs</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                  $0<span className="text-[#FF6B35]">.00</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">BYOA Forever</div>
              </div>
            </div>

          </div>

          {/* Right Hero 3D Centerpiece & iOS Control Widget */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            
            {/* 3D Molten Core Object Canvas */}
            <div className="relative w-full max-w-[460px] lg:max-w-[500px] aspect-square flex items-center justify-center">
              <ForgeCore3D />
            </div>

            {/* iOS Control Center Widget: Master Gateway & Integration */}
            <div className="w-full max-w-md mt-4 p-4 sm:p-5 rounded-3xl ios-glass border border-white/[0.1] shadow-2xl">
              
              {/* iOS Segmented Control Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="ios-segmented flex items-center gap-1">
                  <button
                    onClick={() => setHeroCardMode('endpoint')}
                    className={`ios-tap px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                      heroCardMode === 'endpoint'
                        ? 'bg-white/[0.15] text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Endpoint
                  </button>
                  <button
                    onClick={() => setHeroCardMode('key')}
                    className={`ios-tap px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                      heroCardMode === 'key'
                        ? 'bg-white/[0.15] text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Master Key
                  </button>
                  <button
                    onClick={() => setHeroCardMode('code')}
                    className={`ios-tap px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                      heroCardMode === 'code'
                        ? 'bg-white/[0.15] text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SDK Snippet
                  </button>
                </div>

                <button
                  onClick={handleRunPingTest}
                  disabled={isPinging}
                  className="ios-tap px-3 py-1 rounded-full bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 border border-[#FF6B35]/30 text-[#FFB627] text-[10px] font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-3 h-3 ${isPinging ? 'animate-spin text-[#FF6B35]' : ''}`} />
                  <span>{isPinging ? 'Pinging...' : 'Test Ping'}</span>
                </button>
              </div>

              {/* View 1: Endpoint URL */}
              {heroCardMode === 'endpoint' && (
                <div className="pt-3">
                  <div className="flex items-center justify-between bg-[#0e0e12] p-2.5 rounded-2xl border border-white/[0.08] font-mono text-xs shadow-inner">
                    <span className="text-slate-300 truncate text-[11px] select-all">{gatewayUrl}</span>
                    <button
                      onClick={handleCopyUrl}
                      className="ios-tap text-[#FFB627] hover:text-[#FF6B35] ml-2 text-[10px] flex items-center gap-1 shrink-0 cursor-pointer bg-white/[0.06] px-2.5 py-1 rounded-full"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                    <span>OpenAI-Compatible &bull; /chat/completions</span>
                    <span className="text-emerald-400">Zero-Queuing</span>
                  </div>
                </div>
              )}

              {/* View 2: Master Key */}
              {heroCardMode === 'key' && (
                <div className="pt-3">
                  <div className="flex items-center justify-between bg-[#0e0e12] p-2.5 rounded-2xl border border-white/[0.08] font-mono text-xs shadow-inner">
                    <span className="text-emerald-300 truncate text-[11px] select-all">{masterToken}</span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={handleCopyKey}
                        className="ios-tap text-[#FFB627] hover:text-[#FF6B35] text-[10px] flex items-center gap-1 cursor-pointer bg-white/[0.06] px-2.5 py-1 rounded-full"
                      >
                        {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={handleRotateKey}
                        disabled={isRotating}
                        title="Rotate Master API Key"
                        className="ios-tap text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-400 px-1">
                    Universal bearer token dispatching across all linked accounts.
                  </div>
                </div>
              )}

              {/* View 3: Code Snippet */}
              {heroCardMode === 'code' && (
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1">
                      {(['cursor', 'vscode', 'python', 'curl'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveSnippetTab(tab)}
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold transition-colors ${
                            activeSnippetTab === tab
                              ? 'bg-[#FF6B35]/20 text-[#FFB627] border border-[#FF6B35]/30'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleCopySnippet}
                      className="ios-tap text-[#FFB627] hover:text-[#FF6B35] text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-[#0e0e12] p-2.5 rounded-2xl border border-white/[0.08] font-mono text-[11px] text-slate-300 overflow-x-auto max-h-24 shadow-inner">
                    <pre className="whitespace-pre">{getActiveSnippet()}</pre>
                  </div>
                </div>
              )}

              {/* Live Ping Status Indicator (iOS Dynamic Island Style) */}
              {pingResult && (
                <div className={`mt-3 p-2.5 rounded-2xl text-[10px] font-mono flex items-center justify-between shadow-sm ${
                  pingResult.status === 0 || pingResult.status >= 400
                    ? 'bg-red-950/40 border border-red-500/30 text-red-300'
                    : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      pingResult.status === 0 || pingResult.status >= 400
                        ? 'bg-red-400'
                        : 'bg-emerald-400 animate-ping'
                    }`} />
                    <span>{pingResult.status === 0 ? 'ERR' : `HTTP ${pingResult.status}`} &bull; {pingResult.latency}ms</span>
                  </div>
                  <span className="truncate ml-2 text-slate-300">{pingResult.account}</span>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
