import React, { useState } from 'react';
import { 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PanelTab } from './PanelHeader';

interface OverviewTabProps {
  masterKey: string;
  gatewayUrl: string;
  onRotateKey: () => void;
  isRotating: boolean;
  activeKeyCount: number;
  onNavigateTab: (tab: PanelTab) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  masterKey,
  gatewayUrl,
  onRotateKey,
  isRotating,
  activeKeyCount,
  onNavigateTab,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'opencode' | 'cursor' | 'vscode' | 'python' | 'node' | 'curl'>('opencode');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

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

  const getActiveSnippet = () => {
    switch (activeSnippetTab) {
      case 'opencode':
        return `# ── OpenCode / Terminal Agent Setup ──
# Apne terminal mein yeh 2 lines run karein:
export OPENAI_BASE_URL="${gatewayUrl}"
export OPENAI_API_KEY="${masterKey}"

# Ab direct OpenCode ya koi bhi CLI agent run karein:
opencode --model gemini-flash-latest

# Note: Agar koi Gmail rate-limit hogi, Nexus bina ruke next key se request poori karega!`;
      case 'cursor':
        return `# Cursor Settings -> Models -> OpenAI API Key:
Base URL: ${gatewayUrl}
API Key:  ${masterKey}
Model:    gemini-flash-latest (ya deepseek-ai/DeepSeek-R1)`;
      case 'vscode':
        return `// VS Code settings.json (Continue / Cline / RooCode)
{
  "models": [{
    "title": "Nexus Gateway",
    "provider": "openai",
    "model": "gemini-flash-latest",
    "apiBase": "${gatewayUrl}",
    "apiKey": "${masterKey}"
  }]
}`;
      case 'python':
        return `from openai import OpenAI

client = OpenAI(
    base_url="${gatewayUrl}",
    api_key="${masterKey}"
)

response = client.chat.completions.create(
    model="gemini-flash-latest",
    messages=[{"role": "user", "content": "Hello from Nexus Gateway!"}]
)

print(response.choices[0].message.content)`;
      case 'node':
        return `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${gatewayUrl}",
  apiKey: "${masterKey}",
});

const response = await client.chat.completions.create({
  model: "gemini-flash-latest",
  messages: [{ role: "user", content: "Hello from Nexus Gateway!" }],
});

console.log(response.choices[0].message.content);`;
      case 'curl':
        return `curl -X POST "${gatewayUrl}/chat/completions" \\
  -H "Authorization: Bearer ${masterKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gemini-flash-latest",
    "messages": [{"role": "user", "content": "Hi Nexus Gateway!"}]
  }'`;
    }
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(getActiveSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const downloadEnvFile = () => {
    const envContent = `# Nexus Gateway Client Configuration\nOPENAI_BASE_URL="${gatewayUrl}"\nOPENAI_API_KEY="${masterKey}"\nDEFAULT_MODEL="deepseek-ai/DeepSeek-R1"\n`;
    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.nexus';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCursorConfig = () => {
    const configContent = JSON.stringify({
      "cursor.openaiBaseUrl": gatewayUrl,
      "cursor.openaiApiKey": masterKey,
      "cursor.model": "deepseek-ai/DeepSeek-R1"
    }, null, 2);
    const blob = new Blob([configContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cursor-nexus-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Quick Summary & Action */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#18181b] via-[#1f1915] to-[#18181b] border border-[#FF6B35]/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFB627]">
              100% Free Master Gateway • Zero Rate Limits
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Ek Single Endpoint. Zero Downtime.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Apne kisi bhi terminal tool (<span className="text-[#FFB627] font-semibold">OpenCode</span>, <span className="text-[#FFB627] font-semibold">Cursor</span>, <span className="text-[#FFB627] font-semibold">Aider</span>, <span className="text-[#FFB627] font-semibold">VS Code</span>, Python) mein yeh Base URL aur Master Key daalein. Gateway aapke sabhi accounts aur providers ke beech automatically traffic distribute karega aur 429 aane par auto-switch karega.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={() => onNavigateTab('playground')}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB627] text-black text-xs font-bold font-mono flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Terminal className="w-4 h-4" />
            <span>Open Test Playground</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => onNavigateTab('pool')}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#27272a] hover:bg-[#323238] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Key className="w-4 h-4 text-[#FFB627]" />
            <span>Manage Keys ({activeKeyCount})</span>
          </button>
        </div>
      </div>

      {/* 3-Step Super Easy Beginner Guide */}
      <div className="p-5 rounded-2xl bg-[#141417] border border-white/[0.08] shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FFB627]" />
            <h3 className="text-sm font-bold text-white font-display">
              Nexus Gateway Kaise Use Karein? (3 Aasan Steps)
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            100% Free Forever
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div 
            onClick={() => onNavigateTab('pool')}
            className="p-4 rounded-xl bg-black/40 border border-white/[0.06] hover:border-[#FF6B35]/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-mono font-bold flex items-center justify-center">1</span>
              <span className="text-[11px] text-[#FFB627] group-hover:underline flex items-center gap-1">Open Pool &rarr;</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Apni Free Keys Add Karein</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Google AI Studio ya Groq se free keys nikaal kar Pool tab mein daalein. Aap apni sabhi Gmails se 1-1 key add kar sakte hain.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-[#FFB627]/20 text-[#FFB627] text-xs font-mono font-bold flex items-center justify-center">2</span>
              <span className="text-[11px] text-emerald-400">Ready to Copy</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Base URL &amp; Master Key Copy Karein</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Neeche diye gaye Base URL aur Master Key ko 1-click me copy karein. Ye aapka universal AI passport hai.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center">3</span>
              <span className="text-[11px] text-slate-400">Zero Limits</span>
            </div>
            <h4 className="text-xs font-bold text-white mb-1">OpenCode / Cursor me Run Karein</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Apne terminal ya editor me paste karein. Agar koi account rate-limit hoga, Nexus khud doosre account se request poori kar dega!
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Credentials & Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Left Column: Master Endpoint & Virtual Key */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Base URL Box */}
          <div className="rounded-2xl p-5 bg-[#18181b] border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FF6B35]" />
                OPENAI-COMPATIBLE BASE URL
              </span>
              <button
                onClick={copyUrl}
                className="text-[11px] font-mono text-[#FFB627] hover:text-[#FFAA00] flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs text-emerald-300 break-all select-all flex items-center justify-between">
              <span>{gatewayUrl}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
              Standard OpenAI format. Compatible with all SDKs by replacing <code className="text-slate-200">api.openai.com/v1</code>.
            </p>
          </div>

          {/* Master API Key Box */}
          <div className="rounded-2xl p-5 bg-[#18181b] border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#FFB627]" />
                MASTER VIRTUAL API KEY
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={onRotateKey}
                  disabled={isRotating}
                  className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  title="Generate new master key"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-[#FFB627]' : ''}`} />
                  <span>Rotate</span>
                </button>
                <button
                  onClick={copyKey}
                  className="text-[11px] font-mono text-[#FFB627] hover:text-[#FFAA00] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-xs text-[#FFB627] break-all select-all flex items-center justify-between">
              <span>{masterKey}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
              Pass as <code className="text-slate-200">Authorization: Bearer {masterKey.slice(0, 12)}...</code>. Requests authenticate without exposing individual provider keys.
            </p>
          </div>

          {/* Quick Downloads */}
          <div className="rounded-2xl p-5 bg-[#18181b] border border-white/10 shadow-lg">
            <span className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1.5 mb-3">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              1-CLICK CONFIG DOWNLOADS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={downloadEnvFile}
                className="min-h-[50px] p-3 rounded-xl bg-black/40 hover:bg-black/70 active:scale-[0.99] border border-white/10 text-xs text-left text-slate-200 hover:text-white transition-all cursor-pointer flex flex-col justify-between"
              >
                <span className="font-mono font-bold text-white mb-1">.env File</span>
                <span className="text-[11px] text-slate-400">Download for Node/Python apps</span>
              </button>
              <button
                onClick={downloadCursorConfig}
                className="min-h-[50px] p-3 rounded-xl bg-black/40 hover:bg-black/70 active:scale-[0.99] border border-white/10 text-xs text-left text-slate-200 hover:text-white transition-all cursor-pointer flex flex-col justify-between"
              >
                <span className="font-mono font-bold text-white mb-1">Cursor JSON</span>
                <span className="text-[11px] text-slate-400">1-click IDE config</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Code Snippets & IDE Connect */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-[#18181b] border border-white/10 shadow-lg overflow-hidden flex flex-col h-full">
            
            {/* Snippet Header Tabs */}
            <div className="p-3 sm:px-5 sm:py-3.5 bg-black/40 border-b border-white/[0.08] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {(['opencode', 'cursor', 'vscode', 'python', 'node', 'curl'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSnippetTab(tab)}
                    className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer uppercase whitespace-nowrap ${
                      activeSnippetTab === tab
                        ? 'bg-[#FF6B35]/20 text-[#FFB627] border border-[#FFB627]/40 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {tab === 'opencode' ? '⚡ OpenCode / Terminal' : tab}
                  </button>
                ))}
              </div>

              <button
                onClick={copySnippet}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ml-auto sm:ml-0"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy Snippet'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 sm:p-5 flex-1 bg-[#101012] font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
              <pre className="whitespace-pre">{getActiveSnippet()}</pre>
            </div>

            {/* Bottom Helper */}
            <div className="p-4 bg-black/40 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero rate limits — 429 auto-failover across all pool keys.</span>
              </div>
              <button
                onClick={() => onNavigateTab('models')}
                className="text-[#FFB627] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all models list</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 3 Core Architecture Pillars (Honest & Clean) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-[#18181b] border border-white/[0.08]">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
            01
          </div>
          <h4 className="text-sm font-bold text-white font-display mb-1">
            Round-Robin Key Rotation
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Agar aapne 3 Groq keys ya 2 SiliconFlow keys jodi hain, har naya request sequentially next key par dispatch hota hai taaki kisi ek key ka quota block na ho.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#18181b] border border-white/[0.08]">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center font-mono font-bold text-xs mb-3">
            02
          </div>
          <h4 className="text-sm font-bold text-white font-display mb-1">
            Instant 429 Auto-Failover
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Agar upstream provider 429 (Rate Limit Exceeded) throw karta hai, router 10ms ke andar transparently backup provider/key par retry kar leta hai. Client ko error nahi milta.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#18181b] border border-white/[0.08]">
          <div className="w-8 h-8 rounded-lg bg-[#FFB627]/15 text-[#FFB627] flex items-center justify-center font-mono font-bold text-xs mb-3">
            03
          </div>
          <h4 className="text-sm font-bold text-white font-display mb-1">
            Ollama &amp; Localhost Bridge
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Local Ollama ya LM Studio ko bhi isi master endpoint me link karein. Cloud models aur local offline models ek hi single OpenAI API interface se chalu rehte hain.
          </p>
        </div>
      </div>

    </div>
  );
};
