import React, { useState } from 'react';
import { X, Server, Key, Globe, Cpu, Check, AlertCircle, Sparkles, Flame, Hammer } from 'lucide-react';
import { CustomProviderConfig } from '../types';

interface AddCustomProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProvider: (provider: CustomProviderConfig) => void;
}

const POPULAR_PRESETS = [
  { name: 'Ollama (Localhost)', baseUrl: 'http://localhost:11434/v1', model: 'llama3.2:latest', note: 'No API key required' },
  { name: 'LM Studio (Localhost)', baseUrl: 'http://localhost:1234/v1', model: 'deepseek-r1-distill-qwen-7b', note: 'No API key required' },
  { name: 'Together AI', baseUrl: 'https://api.together.xyz/v1', model: 'deepseek-ai/DeepSeek-R1', note: 'Needs Together API Key' },
  { name: 'vLLM / Custom VPS', baseUrl: 'https://my-vps.example.com/v1', model: 'meta-llama/Llama-3.3-70B', note: 'Your private GPU cluster' }
];

export const AddCustomProviderModal: React.FC<AddCustomProviderModalProps> = ({
  isOpen,
  onClose,
  onAddProvider
}) => {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setName(preset.name);
    setBaseUrl(preset.baseUrl);
    setModelName(preset.model);
    setNotes(preset.note);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name for this provider');
      return;
    }
    if (!baseUrl.trim() || !baseUrl.startsWith('http')) {
      setError('Please enter a valid HTTP/HTTPS base URL (e.g. https://api.together.xyz/v1)');
      return;
    }

    const newProvider: CustomProviderConfig = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      baseUrl: baseUrl.trim().replace(/\/+$/, ''), // strip trailing slash
      apiKey: apiKey.trim() || undefined,
      modelName: modelName.trim() || 'default',
      notes: notes.trim() || undefined,
      addedAt: new Date().toISOString()
    };

    onAddProvider(newProvider);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setName('');
      setBaseUrl('');
      setApiKey('');
      setModelName('');
      setNotes('');
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#141414] border border-[#FFB627]/30 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B35]/20 to-[#FFB627]/20 border border-[#FFB627]/30 flex items-center justify-center">
              <Server className="w-4 h-4 text-[#FFB627]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Add Custom Provider</h3>
              <p className="text-xs text-slate-400">Connect any OpenAI-compatible server or API to your Forge pool</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 pt-4 pb-2 bg-[#141414]">
          <span className="text-[11px] font-mono text-[#FFB627] block mb-2 font-semibold">⚡ Quick 1-Click Presets:</span>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-3 py-2 rounded-xl text-left text-xs bg-[#1a1a1a] hover:bg-[#222222] border border-white/[0.08] hover:border-[#FFB627]/40 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <div className="font-semibold text-white truncate">{p.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{p.note}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[#141414]">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Custom Provider forged into your Gateway pool successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Provider Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Together AI / Local Ollama / Private VPS"
              className="w-full px-3.5 py-2 rounded-xl bg-[#101010] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB627] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Base URL (OpenAI-Compatible) *
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="e.g. https://api.together.xyz/v1 or http://localhost:11434/v1"
              className="w-full px-3.5 py-2 rounded-xl bg-[#101010] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB627] font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">Endpoint must accept standard <code>/chat/completions</code> requests</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                API Key <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Leave empty if localhost"
                className="w-full px-3.5 py-2 rounded-xl bg-[#101010] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB627] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Model Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. deepseek-r1 / llama3"
                className="w-full px-3.5 py-2 rounded-xl bg-[#101010] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB627] font-mono"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="btn-forge-primary px-5 py-2 rounded-xl text-xs font-bold text-[#0c0c0c] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Hammer className="w-3.5 h-3.5 text-[#0c0c0c]" />
              <span>Forge into Pool</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
