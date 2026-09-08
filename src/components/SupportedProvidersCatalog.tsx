import React, { useState } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Check, 
  Plus, 
  Layers, 
  Search, 
  Key, 
  Zap, 
  Server,
  Globe
} from 'lucide-react';
import { MODEL_PROVIDERS } from '../data/providers';
import { ModelProvider } from '../types';

interface SupportedProvidersCatalogProps {
  onOpenCustomProviderModal: () => void;
  onOpenAccountModal: () => void;
}

export const SupportedProvidersCatalog: React.FC<SupportedProvidersCatalogProps> = ({
  onOpenCustomProviderModal,
  onOpenAccountModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedKeyProvider, setCopiedKeyProvider] = useState<string | null>(null);

  const categories = ['All', 'General LLM', 'High-Speed', 'Aggregator', 'Specialized'];

  const filteredProviders = MODEL_PROVIDERS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.popularModels.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="providers" className="relative py-24 bg-[#121212] border-t border-b border-white/[0.06] overflow-hidden">
      {/* Background Molten Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#FF6B35]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#FFB627]/30 text-xs font-mono text-[#FFB627] mb-4 shadow-[0_0_20px_rgba(255,182,39,0.2)]">
            <Zap className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>28+ FREE AI PROVIDERS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            Supported Free Providers &amp; Models
          </h2>
          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            In sabhi providers ke free tier models ko aap apne master gateway ke through bina kisi extra setup ke call kar sakte hain. Apna local Ollama server ya custom API jodne ke liye <strong className="text-[#FFB627]">"Add Custom Provider"</strong> dabayein.
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenCustomProviderModal}
              className="btn-forge-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Server className="w-4 h-4 text-[#0c0c0c]" />
              <span>+ Add Custom Provider (Ollama / VPS)</span>
            </button>

            <button
              onClick={onOpenAccountModal}
              className="btn-forge-secondary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4 text-[#FFB627]" />
              <span>Open Master Gateway</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF6B35]/20 text-[#FFB627] border border-[#FFB627]/40 font-semibold'
                    : 'bg-[#181818] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search providers or models..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#181818] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB627]"
            />
          </div>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Custom Provider Quick Action Card */}
          <div 
            onClick={onOpenCustomProviderModal}
            className="group relative rounded-2xl p-6 bg-gradient-to-br from-[#1c1815] to-[#121212] border border-dashed border-[#FFB627]/40 hover:border-[#FFB627] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,182,39,0.2)] hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/15 border border-[#FFB627]/30 flex items-center justify-center text-[#FFB627] group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FFB627]/20 text-[#FFB627] border border-[#FFB627]/30">
                  Custom
                </span>
              </div>
              <h3 className="text-base font-bold text-white font-display mb-1 group-hover:text-[#FFB627] transition-colors">
                + Add Custom Provider
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect any self-hosted Ollama, vLLM, LM Studio, or third-party OpenAI-compatible endpoint directly into your pool.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center text-xs text-[#FFB627] font-semibold gap-1.5">
              <span>Configure Base URL &amp; Key</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          {/* Catalog Providers */}
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              className="relative rounded-2xl p-6 bg-[#181818] border border-white/10 hover:border-[#FFB627]/40 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-medium bg-[#222222] text-slate-300 border border-white/10">
                    {provider.category}
                  </span>
                  <a
                    href={provider.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-[#FFB627] hover:text-[#FF6B35] flex items-center gap-1 transition-colors"
                    title="Get Free API Key"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Provider Title */}
                <h3 className="text-base font-bold text-white font-display mb-1">
                  {provider.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {provider.description}
                </p>

                {/* Free Tier Highlight Pill */}
                <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-mono font-medium mb-4 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{provider.freeTierDetails}</span>
                </div>

                {/* Popular Models */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                    Popular Models:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {provider.popularModels.slice(0, 3).map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.03] text-slate-300 border border-white/[0.05] truncate max-w-[200px]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  Key prefix: <code className="text-slate-300">{provider.keyPrefix}*</code>
                </span>
                <button
                  onClick={onOpenAccountModal}
                  className="text-xs font-semibold text-[#FFB627] hover:text-[#FF6B35] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Link Account</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
};
