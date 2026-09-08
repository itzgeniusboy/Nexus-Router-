import React, { useState } from 'react';
import { 
  Key, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Info,
  Play,
  Cloud
} from 'lucide-react';
import { type User } from 'firebase/auth';
import { UnifiedAccount } from '../../types';

interface KeyPoolTabProps {
  accounts: UnifiedAccount[];
  onAddAccount: (acc: UnifiedAccount) => void;
  onRemoveAccount: (id: string) => void;
  envStatus?: Record<string, boolean>;
  currentUser?: User | null;
}

interface ProviderMeta {
  name: string;
  key: string;
  category: string;
  freeTier: string;
  portalUrl: string;
  models: string[];
  placeholder: string;
}

const PROVIDERS_CATALOG: ProviderMeta[] = [
  {
    name: 'Google AI Studio',
    key: 'google_ai',
    category: 'Gemini Frontier Models',
    freeTier: '1,500 Free Requests/Day per Gmail',
    portalUrl: 'https://aistudio.google.com/app/apikey',
    models: ['gemini-flash-latest', 'gemini-3.8-flash', 'gemma-2-27b'],
    placeholder: 'AIzaSy...',
  },
  {
    name: 'Groq Cloud',
    key: 'groq',
    category: 'Ultra-Fast Inference',
    freeTier: '30 RPM Free • 14,400 Requests/Day',
    portalUrl: 'https://console.groq.com/keys',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'llama-3.1-8b-instant'],
    placeholder: 'gsk_...',
  },
  {
    name: 'Cerebras AI',
    key: 'cerebras',
    category: 'Wafer-Scale Engine',
    freeTier: '1M Tokens/Day Free • 2,000 Tok/s',
    portalUrl: 'https://cloud.cerebras.ai',
    models: ['llama3.3-70b', 'llama3.1-8b'],
    placeholder: 'csk-...',
  },
  {
    name: 'OpenRouter',
    key: 'openrouter',
    category: 'Unified Router',
    freeTier: '50+ Permanent :free tier models',
    portalUrl: 'https://openrouter.ai/keys',
    models: ['meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-r1:free'],
    placeholder: 'sk-or-v1-...',
  },
  {
    name: 'SiliconFlow',
    key: 'siliconflow',
    category: 'DeepSeek Specialist',
    freeTier: 'Free DeepSeek-R1 & V3 access',
    portalUrl: 'https://cloud.siliconflow.cn',
    models: ['deepseek-ai/DeepSeek-R1', 'deepseek-ai/DeepSeek-V3', 'qwen/qwen-2.5-72b-instruct'],
    placeholder: 'sk-...',
  },
  {
    name: 'Pollinations AI',
    key: 'pollinations',
    category: 'Zero-Key Public Endpoint',
    freeTier: '100% Free Public Server (No Key Required)',
    portalUrl: 'https://pollinations.ai',
    models: ['openai-fast', 'mistral', 'deepseek'],
    placeholder: 'zero-key-public',
  },
  {
    name: 'OpenAI',
    key: 'openai',
    category: 'GPT-4o & Reasoning',
    freeTier: 'Official OpenAI Developer Platform',
    portalUrl: 'https://platform.openai.com/api-keys',
    models: ['gpt-4o', 'gpt-4o-mini'],
    placeholder: 'sk-proj-...',
  },
  {
    name: 'Anthropic',
    key: 'anthropic',
    category: 'Claude Frontier Models',
    freeTier: 'Anthropic Developer Console',
    portalUrl: 'https://console.anthropic.com/settings/keys',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    placeholder: 'sk-ant-api...',
  },
];

export const KeyPoolTab: React.FC<KeyPoolTabProps> = ({
  accounts,
  onAddAccount,
  onRemoveAccount,
  envStatus = {},
  currentUser,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('google_ai');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [accountLabel, setAccountLabel] = useState<string>('');
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [addError, setAddError] = useState<string>('');
  const [addSuccess, setAddSuccess] = useState<string>('');
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');

    let trimmedKey = apiKeyInput.trim();
    if (selectedProvider === 'pollinations' && !trimmedKey) {
      trimmedKey = 'zero-key-public';
    }

    if (!trimmedKey) {
      setAddError('Kripya ek valid API key enter karein.');
      return;
    }

    const providerObj = PROVIDERS_CATALOG.find((p) => p.key === selectedProvider);
    const label = accountLabel.trim() || `${providerObj?.name || selectedProvider} Key #${accounts.filter(a => a.provider === selectedProvider).length + 1}`;

    const newAcc: UnifiedAccount = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: label,
      provider: selectedProvider,
      dailyQuota: 1500,
      quotaUsedToday: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      status: 'active',
      addedAt: new Date().toISOString(),
      apiKey: trimmedKey,
    };

    onAddAccount(newAcc);
    setApiKeyInput('');
    setAccountLabel('');
    setAddSuccess(`${label} successfully vault me save ho gayi!`);
    setTimeout(() => setAddSuccess(''), 3500);
  };

  const handleTestSingleKey = async (acc: UnifiedAccount) => {
    setTestingKeyId(acc.id);
    setTestResult(null);
    try {
      // Test key directly via gateway endpoint
      const res = await fetch('/api/gateway/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer nxg_live_test`,
        },
        body: JSON.stringify({
          model: acc.provider === 'google_ai' ? 'gemini-flash-latest' : 'openai-fast',
          messages: [{ role: 'user', content: 'Ping' }],
        }),
      });

      if (res.ok) {
        setTestResult({ id: acc.id, success: true, msg: 'Active & Working! Latency fast.' });
      } else {
        setTestResult({ id: acc.id, success: false, msg: 'Connection check responded with code ' + res.status });
      }
    } catch {
      setTestResult({ id: acc.id, success: false, msg: 'Unable to reach provider endpoint.' });
    } finally {
      setTestingKeyId(null);
    }
  };

  const maskKey = (key?: string) => {
    if (!key || key === 'zero-key-public') return 'No key needed (public)';
    if (key.length <= 8) return '••••' + key.slice(-4);
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  };

  const activeProvider = PROVIDERS_CATALOG.find((p) => p.key === selectedProvider) || PROVIDERS_CATALOG[0];

  return (
    <div className="space-y-6">
      
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#18181b] border border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFB627]">
              Universal Multi-Provider Vault
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Key className="w-5 h-5 text-[#FFB627]" />
            <span>Provider Select Karein &amp; API Key Save Karein</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Google AI Studio, Groq, Cerebras ya kisi bhi provider ko select karke apni key save karein. Yeh keys aapke account ke under secure vault mein save hoti hain aur gateway par round-robin chalati hain.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {currentUser && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5" />
              <span>Synced with {currentUser.email?.split('@')[0]}</span>
            </div>
          )}
          <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
            <span className="text-slate-400">Total Saved Keys: </span>
            <span className="font-bold text-[#FFB627]">{accounts.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Add Key Form & Current Pool List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Add Key */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 shadow-lg">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#FF6B35]" />
              <span>Step 1: Provider Select Karein</span>
            </h3>

            {/* Provider Selector Cards */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs text-slate-300 font-medium">Available AI Providers</label>
              <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {PROVIDERS_CATALOG.map((prov) => {
                  const isSelected = selectedProvider === prov.key;
                  return (
                    <button
                      key={prov.key}
                      type="button"
                      onClick={() => {
                        setSelectedProvider(prov.key);
                        if (prov.key === 'pollinations') {
                          setApiKeyInput('zero-key-public');
                        } else if (apiKeyInput === 'zero-key-public') {
                          setApiKeyInput('');
                        }
                      }}
                      className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF6B35]/20 border-[#FFB627] text-white shadow-md'
                          : 'bg-black/40 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>{prov.name}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#FFB627]" />}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{prov.category}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider Free Tier Banner & Get Key Link */}
            <div className="p-3 rounded-xl bg-black/50 border border-white/[0.08] mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs min-w-0">
                <Zap className="w-3.5 h-3.5 text-[#FFB627] shrink-0" />
                <span className="text-slate-300 font-mono text-[11px] truncate">{activeProvider.freeTier}</span>
              </div>
              <a
                href={activeProvider.portalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-[#FF6B35] hover:text-[#FFAA00] flex items-center gap-1 shrink-0 font-medium hover:underline"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleAddKey} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Step 2: API Key Paste Karein ({activeProvider.name})
                </label>
                <div className="relative">
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={activeProvider.placeholder}
                    disabled={activeProvider.key === 'pollinations'}
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm sm:text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#FFB627] disabled:opacity-60"
                  />
                  {activeProvider.key !== 'pollinations' && (
                    <button
                      type="button"
                      onClick={() => setShowKeyText(!showKeyText)}
                      className="min-w-[40px] min-h-[40px] absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300 font-medium">
                    Account Label / Naam (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400">Quick Fill:</span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Gmail 1', 'Gmail 2', 'Work Account', 'Personal Key', 'Groq Account'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAccountLabel(preset)}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/[0.06] hover:bg-[#FF6B35]/20 hover:text-[#FFB627] text-slate-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={accountLabel}
                  onChange={(e) => setAccountLabel(e.target.value)}
                  placeholder="e.g. Gmail 1 (itzraviking@gmail.com)"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#FFB627]"
                />
              </div>

              {/* Friendly Tip Box */}
              <div className="p-3 rounded-xl bg-[#1f1915] border border-[#FF6B35]/20 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
                <Zap className="w-4 h-4 text-[#FFB627] shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Aap apni har Gmail se 1-1 free key le kar yahan daal sakte hain. Ek key exhaust hone par gateway automatically dusri key se bina ruke query serve karega!
                </span>
              </div>

              {addError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              {addSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{addSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[46px] py-3 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB627] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer select-none"
              >
                <Plus className="w-4 h-4" />
                <span>Save API Key to Vault</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right List: Active Keys in Vault */}
        <div className="lg:col-span-7">
          <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 shadow-lg min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Saved Provider Keys ({accounts.length})</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Vault Active
                </span>
              </div>

              {accounts.length === 0 ? (
                <div className="py-16 px-4 rounded-xl border border-dashed border-white/10 text-center flex flex-col items-center justify-center">
                  <Key className="w-10 h-10 text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-300">Vault me abhi koi key save nahi hai</p>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                    Left form me Google AI Studio ya Groq select karein, free key enter karein aur &quot;Save API Key&quot; dabayein.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {accounts.map((acc) => {
                    const provMeta = PROVIDERS_CATALOG.find((p) => p.key === acc.provider);
                    const isTestingThis = testingKeyId === acc.id;
                    const thisResult = testResult && testResult.id === acc.id ? testResult : null;

                    return (
                      <div
                        key={acc.id}
                        className="p-4 rounded-xl bg-black/40 border border-white/[0.08] hover:border-white/20 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#222226] border border-white/10 flex items-center justify-center text-[#FFB627] font-bold text-xs shrink-0">
                              {acc.provider.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-white truncate">
                                  {acc.email || provMeta?.name || acc.provider}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                  ACTIVE
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-slate-400">
                                <span className="text-[#FFB627]">{provMeta?.name || acc.provider}</span>
                                <span>&bull;</span>
                                <span className="text-slate-500">{maskKey(acc.apiKey)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Test Connection Button */}
                            <button
                              onClick={() => handleTestSingleKey(acc)}
                              disabled={isTestingThis}
                              title="Test API Key Connection"
                              className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Play className={`w-3 h-3 ${isTestingThis ? 'animate-spin text-[#FFB627]' : 'text-emerald-400'}`} />
                              <span>{isTestingThis ? 'Testing...' : 'Test'}</span>
                            </button>

                            {/* Delete Key Button */}
                            <button
                              onClick={() => onRemoveAccount(acc.id)}
                              title="Delete key from vault"
                              className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Test Result Message */}
                        {thisResult && (
                          <div className={`text-[11px] font-mono p-2 rounded-lg ${
                            thisResult.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          }`}>
                            {thisResult.success ? '✓ ' : '✗ '} {thisResult.msg}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Tip */}
            <div className="mt-4 p-3 rounded-xl bg-[#141416] border border-white/[0.06] text-[11px] text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#FFB627] shrink-0" />
              <span>
                Tip: Nexus Gateway automatic failover use karta hai — agar kisi ek account par rate limit aati hai, requests bina kisi delay ke doosre account par transfer ho jaati hain.
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
