import React, { useState } from 'react';
import { 
  Cpu, 
  Search, 
  Copy, 
  Check, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  providerKey: string;
  contextWindow: string;
  speed: string;
  type: 'Reasoning' | 'Ultra-Fast' | 'General' | 'Free-Tier';
  description: string;
}

const MODELS_LIST: ModelInfo[] = [
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash (Built-in Active)',
    provider: 'Google AI Studio',
    providerKey: 'google_ai',
    contextWindow: '1M',
    speed: '~120 tok/s',
    type: 'Ultra-Fast',
    description: 'High-speed multimodal frontier model with ultra-low latency and 1M context window.',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'Google AI Studio',
    providerKey: 'google_ai',
    contextWindow: '1M',
    speed: '~130 tok/s',
    type: 'Ultra-Fast',
    description: 'Next generation multimodal edge intelligence model by Google DeepMind.',
  },
  {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek R1',
    provider: 'SiliconFlow / OpenRouter',
    providerKey: 'siliconflow',
    contextWindow: '64k',
    speed: '~50 tok/s',
    type: 'Reasoning',
    description: 'State-of-the-art open reasoning model rivaling OpenAI o1 on math, coding, and logical chain-of-thought.',
  },
  {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek V3',
    provider: 'SiliconFlow',
    providerKey: 'siliconflow',
    contextWindow: '64k',
    speed: '~65 tok/s',
    type: 'General',
    description: '671B parameter Mixture-of-Experts powerhouse for coding, complex refactoring, and multi-turn workflows.',
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'Groq Cloud',
    providerKey: 'groq',
    contextWindow: '128k',
    speed: '~280 tok/s',
    type: 'Ultra-Fast',
    description: 'Blazing fast Meta Llama 3.3 running on Groq LPU hardware with 128k context and high precision.',
  },
  {
    id: 'llama3.3-70b',
    name: 'Llama 3.3 70B (Wafer Scale)',
    provider: 'Cerebras AI',
    providerKey: 'cerebras',
    contextWindow: '8k',
    speed: '~2,100 tok/s',
    type: 'Ultra-Fast',
    description: 'World fastest inference engine on Cerebras CS-3 wafer chips. Delivers instantaneous responses.',
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    provider: 'SiliconFlow / OpenRouter',
    providerKey: 'siliconflow',
    contextWindow: '32k',
    speed: '~45 tok/s',
    type: 'General',
    description: 'Alibaba Cloud top tier open-weights model with superior multilingual coding and structured JSON support.',
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'Groq Cloud',
    providerKey: 'groq',
    contextWindow: '32k',
    speed: '~480 tok/s',
    type: 'Ultra-Fast',
    description: 'Mistral AI MoE model with 32k context on Groq LPUs. Excellent for rapid summaries and classification.',
  },
  {
    id: 'gemma-2-27b',
    name: 'Gemma 2 27B',
    provider: 'Google AI Studio',
    providerKey: 'google_ai',
    contextWindow: '8k',
    speed: '~60 tok/s',
    type: 'General',
    description: 'Google open weights lightweight powerhouse built on Gemini technology.',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (:free)',
    provider: 'OpenRouter',
    providerKey: 'openrouter',
    contextWindow: '128k',
    speed: '~40 tok/s',
    type: 'Free-Tier',
    description: 'Permanent free tier endpoint hosted through OpenRouter community nodes.',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (:free)',
    provider: 'OpenRouter',
    providerKey: 'openrouter',
    contextWindow: '64k',
    speed: '~30 tok/s',
    type: 'Free-Tier',
    description: 'Free community tier of DeepSeek R1 for testing without any API token cost.',
  },
];

export const ModelsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyModelId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredModels = MODELS_LIST.filter((m) => {
    const matchesSearch = 
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || m.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#FFB627]" />
            <span>Supported Models &amp; Routing Rules</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kisi bhi model ka ID copy karke apne Cursor / VS Code ya Python client ke <code className="text-slate-200">model</code> parameter mein daalein.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model or provider..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-sm sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB627]"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['All', 'Reasoning', 'Ultra-Fast', 'General', 'Free-Tier'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap flex items-center ${
              filterType === tab
                ? 'bg-[#FF6B35]/20 text-[#FFB627] border border-[#FFB627]/40 font-bold'
                : 'bg-[#18181b] text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.map((model) => {
          const isCopied = copiedId === model.id;
          return (
            <div
              key={model.id}
              className="p-5 rounded-2xl bg-[#18181b] border border-white/10 hover:border-[#FFB627]/40 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/40 text-slate-300 border border-white/10">
                    {model.type}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>{model.speed}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white font-display">
                  {model.name}
                </h3>
                
                <p className="text-xs text-slate-400 mt-1 mb-3 line-clamp-2 leading-relaxed">
                  {model.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Provider:</span>
                  <span className="text-slate-200 font-semibold">{model.provider}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Context:</span>
                  <span className="text-slate-200">{model.contextWindow}</span>
                </div>

                {/* Copy ID Button */}
                <div className="pt-1">
                  <button
                    onClick={() => copyModelId(model.id)}
                    className="w-full min-h-[42px] py-2.5 px-3 rounded-xl bg-black/60 hover:bg-black/90 active:scale-[0.99] border border-white/10 text-[11px] font-mono text-[#FFB627] flex items-center justify-between cursor-pointer transition-all"
                  >
                    <span className="truncate">{model.id}</span>
                    {isCopied ? (
                      <span className="flex items-center gap-1 text-emerald-400 shrink-0 ml-2">
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 shrink-0 ml-2">
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy ID</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
