import React, { useState } from 'react';
import { 
  Server, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Laptop, 
  Radio, 
  Info 
} from 'lucide-react';
import { CustomProviderConfig } from '../../types';

interface CustomHostsTabProps {
  customProviders: CustomProviderConfig[];
  onAddCustomProvider: (provider: CustomProviderConfig) => void;
  onRemoveCustomProvider: (id: string) => void;
}

const PRESET_TEMPLATES = [
  {
    name: 'Ollama (Localhost)',
    baseUrl: 'http://localhost:11434/v1',
    apiKey: 'ollama',
    defaultModel: 'deepseek-r1:8b',
    description: 'Local offline LLMs running on your Mac/Linux/Windows machine.',
  },
  {
    name: 'LM Studio (Localhost)',
    baseUrl: 'http://localhost:1234/v1',
    apiKey: 'lm-studio',
    defaultModel: 'local-model',
    description: 'Local GUI engine with OpenAI-compatible server on port 1234.',
  },
  {
    name: 'vLLM / Self-Hosted VPS',
    baseUrl: 'https://vllm.your-domain.com/v1',
    apiKey: '',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct',
    description: 'High-throughput GPU instance running vLLM or text-generation-inference.',
  },
];

export const CustomHostsTab: React.FC<CustomHostsTabProps> = ({
  customProviders,
  onAddCustomProvider,
  onRemoveCustomProvider,
}) => {
  const [name, setName] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [defaultModel, setDefaultModel] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const applyTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setName(tpl.name);
    setBaseUrl(tpl.baseUrl);
    setApiKey(tpl.apiKey);
    setDefaultModel(tpl.defaultModel);
  };

  const handleAddHost = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    setIsError(false);

    if (!name.trim() || !baseUrl.trim()) {
      setIsError(true);
      setStatusMsg('Please provide a Host Name and Base URL.');
      return;
    }

    const newProvider: CustomProviderConfig = {
      id: `cust_${Date.now()}`,
      name: name.trim(),
      baseUrl: baseUrl.trim().replace(/\/+$/, ''),
      apiKey: apiKey.trim() || undefined,
      customModels: defaultModel.trim() ? [defaultModel.trim()] : ['default-model'],
      isLocalhost: baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'),
      status: 'active',
      addedAt: new Date().toISOString(),
    };

    onAddCustomProvider(newProvider);
    setStatusMsg(`Successfully connected ${name.trim()} to your gateway!`);
    setName('');
    setBaseUrl('');
    setApiKey('');
    setDefaultModel('');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Server className="w-5 h-5 text-[#FFB627]" />
            <span>Local &amp; Custom Hosts (Ollama / vLLM / LM Studio)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Apne local Ollama ya private GPU server ko bhi isi unified gateway se connect karein. Ek hi API key aur endpoint se local aur cloud dono models access honge.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
          <span className="text-slate-400">Custom Hosts: </span>
          <span className="font-bold text-[#FFB627]">{customProviders.length}</span>
        </div>
      </div>

      {/* Grid: Form & Existing Hosts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Quick Templates & Add Form */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Quick Presets */}
          <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              1-Click Presets
            </h3>
            <div className="space-y-2">
              {PRESET_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="w-full p-3 rounded-xl bg-black/40 hover:bg-black/70 border border-white/[0.08] hover:border-[#FFB627]/40 text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{tpl.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{tpl.baseUrl}</div>
                  </div>
                  <span className="text-xs text-[#FFB627] font-semibold">&rarr; Use</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Form */}
          <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#FF6B35]" />
              <span>Configure Custom Host</span>
            </h3>

            <form onSubmit={handleAddHost} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Host Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Mac Ollama"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#FFB627]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Base URL (OpenAI-compatible)</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434/v1"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm sm:text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#FFB627]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">API Key (Optional for Ollama)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ollama or sk-..."
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm sm:text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#FFB627]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Default Model Name</label>
                <input
                  type="text"
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  placeholder="e.g. deepseek-r1:8b"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm sm:text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#FFB627]"
                />
              </div>

              {statusMsg && (
                <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  isError 
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300' 
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                }`}>
                  {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{statusMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB627] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save Host Configuration</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right: Active Custom Hosts List */}
        <div className="lg:col-span-7">
          <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 shadow-lg min-h-[420px] flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Connected Custom Hosts ({customProviders.length})</span>
              </h3>

              {customProviders.length === 0 ? (
                <div className="py-14 px-4 rounded-xl border border-dashed border-white/10 text-center flex flex-col items-center justify-center">
                  <Laptop className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No custom hosts connected</p>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Select a 1-click preset on the left (e.g. Ollama) to route local offline models through your master gateway.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customProviders.map((host) => (
                    <div
                      key={host.id}
                      className="p-4 rounded-xl bg-black/40 border border-white/[0.08] hover:border-white/20 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white truncate">{host.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            host.isLocalhost 
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' 
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          }`}>
                            {host.isLocalhost ? 'LOCALHOST' : 'REMOTE VPS'}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-1 truncate">
                          {host.baseUrl}
                        </div>
                        {host.customModels && host.customModels.length > 0 && (
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            Models: {host.customModels.join(', ')}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onRemoveCustomProvider(host.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                        title="Remove host"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#141416] border border-white/[0.06] text-[11px] text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#FFB627] shrink-0" />
              <span>
                Note: Localhost URLs (`http://localhost:11434`) must be running on the machine where client requests originate.
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
