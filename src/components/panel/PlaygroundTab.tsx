import React, { useState, useRef } from 'react';
import { 
  Send, 
  Terminal, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Clock, 
  Cpu, 
  Layers, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { UnifiedAccount } from '../../types';

interface PlaygroundTabProps {
  masterKey: string;
  gatewayUrl: string;
  accounts: UnifiedAccount[];
}

const POPULAR_MODELS = [
  { id: 'gemini-flash-latest', name: 'Gemini Flash (Built-in Active)', provider: 'Google AI' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Active)', provider: 'Google AI' },
  { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1 (Reasoning)', provider: 'SiliconFlow / OpenRouter' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', provider: 'Groq Cloud' },
  { id: 'llama3.3-70b', name: 'Llama 3.3 70B (Ultra-Fast)', provider: 'Cerebras AI' },
  { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3 (671B MoE)', provider: 'SiliconFlow' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B Instruct', provider: 'SiliconFlow / OpenRouter' },
  { id: 'gemma-2-27b', name: 'Gemma 2 27B', provider: 'Google AI' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (:free tier)', provider: 'OpenRouter' },
];

export const PlaygroundTab: React.FC<PlaygroundTabProps> = ({
  masterKey,
  gatewayUrl,
  accounts,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('gemini-flash-latest');
  const [systemPrompt, setSystemPrompt] = useState<string>('You are an expert, helpful AI coding assistant.');
  const [userPrompt, setUserPrompt] = useState<string>('Write a clean TypeScript debounce function with generic type safety.');
  const [enableStream, setEnableStream] = useState<boolean>(true);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseText, setResponseText] = useState<string>('');
  const [responseHeaders, setResponseHeaders] = useState<{
    status: number;
    latencyMs: number;
    routedProvider?: string;
    routedAccount?: string;
    retryCount?: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim() || isLoading) return;

    setIsLoading(true);
    setResponseText('');
    setErrorMsg('');
    setResponseHeaders(null);

    abortControllerRef.current = new AbortController();
    const startTime = Date.now();

    try {
      // Build pool payload from active keys in memory
      const poolPayload = accounts.map(a => ({
        email: a.email,
        provider: a.provider,
        apiKey: a.apiKey,
      }));

      const res = await fetch(`${gatewayUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${masterKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt },
          ],
          stream: enableStream,
          pool: poolPayload,
        }),
        signal: abortControllerRef.current.signal,
      });

      const elapsed = Date.now() - startTime;
      const routedProvider = res.headers.get('X-Nexus-Provider') || res.headers.get('X-Forge-Provider') || undefined;
      const routedAccount = res.headers.get('X-Nexus-Account') || res.headers.get('X-Forge-Account') || undefined;
      const retryCount = Number(res.headers.get('X-Nexus-Retry-Count') || '0');

      setResponseHeaders({
        status: res.status,
        latencyMs: elapsed,
        routedProvider,
        routedAccount,
        retryCount,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = errData?.error?.message || `HTTP error ${res.status} from gateway.`;
        setErrorMsg(msg);
        setIsLoading(false);
        return;
      }

      if (enableStream && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine || !cleanLine.startsWith('data:')) continue;
            const dataStr = cleanLine.replace(/^data:\s*/, '');
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                setResponseText((prev) => prev + delta);
              }
            } catch {
              // Ignore non-json lines
            }
          }
        }
      } else {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content || JSON.stringify(json, null, 2);
        setResponseText(content);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setErrorMsg(err.message || 'Failed to connect to gateway.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(responseText);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#FFB627]" />
            <span>Interactive Live AI Playground</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test any model directly through your unified gateway endpoint with live streaming &amp; failover telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Stream Mode:</span>
          <button
            onClick={() => setEnableStream(!enableStream)}
            className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
              enableStream 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold' 
                : 'bg-black/40 text-slate-400 border-white/10'
            }`}
          >
            {enableStream ? 'SSE Stream ON' : 'JSON Mode'}
          </button>
        </div>
      </div>

      {/* Two Column Layout: Prompt Controls & Live Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Model & Prompts Input */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleSendPrompt} className="p-5 rounded-2xl bg-[#18181b] border border-white/10 shadow-lg space-y-4">
            
            {/* Model Selector */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center justify-between">
                <span>Select Target Model</span>
                <span className="text-[10px] font-mono text-[#FFB627]">Auto-Routed</span>
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm sm:text-xs font-mono text-white focus:outline-none focus:border-[#FFB627]"
              >
                {POPULAR_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#18181b] text-white">
                    {m.name} ({m.id})
                  </option>
                ))}
              </select>
            </div>

            {/* System Prompt */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                System Prompt (Optional)
              </label>
              <input
                type="text"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are an expert assistant..."
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#FFB627]"
              />
            </div>

            {/* User Prompt */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-300 font-medium">
                  User Prompt
                </label>
                <span className="text-[10px] text-slate-400">Quick Test:</span>
              </div>

              {/* Quick Sample Prompts */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  { label: '⚡ Test Connection', text: 'Hello! Please confirm you are working through Nexus Gateway.' },
                  { label: '🐍 Python Code', text: 'Write a clean Python script to fetch and parse JSON data with error handling.' },
                  { label: '🚀 Terminal Agent', text: 'Simulate a quick terminal command to check disk space and memory usage.' },
                ].map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => setUserPrompt(sample.text)}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/[0.06] hover:bg-[#FF6B35]/20 hover:text-[#FFB627] text-slate-300 border border-white/10 transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Ask anything..."
                className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-sm sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#FFB627] resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !userPrompt.trim()}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB627] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Routing to AI Edge...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Prompt to Gateway</span>
                </>
              )}
            </button>

            {/* Quick helper note */}
            <div className="text-[11px] text-slate-400 font-mono text-center">
              Uses your active pool ({accounts.length} keys) + environment keys
            </div>
          </form>
        </div>

        {/* Right Column: Output & Live Telemetry Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-[#18181b] border border-white/10 shadow-lg overflow-hidden flex flex-col min-h-[360px] sm:h-[500px]">
            
            {/* Telemetry Header */}
            <div className="p-3 sm:px-4 bg-black/50 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-[#FFB627]" />
                  <span>{selectedModel.split('/').pop()}</span>
                </span>
                
                {responseHeaders && (
                  <>
                    <span className="text-slate-600">|</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      responseHeaders.status === 200 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {responseHeaders.status} {responseHeaders.status === 200 ? 'OK' : 'ERR'}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{responseHeaders.latencyMs}ms</span>
                    </span>
                    {responseHeaders.routedProvider && (
                      <>
                        <span className="text-slate-600">|</span>
                        <span className="text-[#FF6B35] font-bold">
                          via {responseHeaders.routedProvider}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>

              {responseText && (
                <button
                  onClick={handleCopyResponse}
                  className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedResponse ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {/* Response Body Window */}
            <div className="flex-1 p-4 bg-[#101012] overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {errorMsg ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Gateway Error</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{errorMsg}</p>
                </div>
              ) : responseText ? (
                <div>{responseText}</div>
              ) : isLoading ? (
                <div className="h-full flex items-center justify-center flex-col gap-2 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#FFB627]" />
                  <span className="text-xs font-mono">Streaming response from edge...</span>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center flex-col gap-2 text-slate-600">
                  <Terminal className="w-8 h-8 text-slate-700" />
                  <span className="text-xs font-mono">Response output will stream here.</span>
                </div>
              )}
            </div>

            {/* Bottom Status Pill */}
            <div className="px-4 py-2 bg-black/60 border-t border-white/[0.06] text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Endpoint: {gatewayUrl}/chat/completions</span>
              {responseHeaders?.retryCount !== undefined && responseHeaders.retryCount > 0 && (
                <span className="text-[#FFB627] font-bold">
                  ⚡ Auto-Failover: {responseHeaders.retryCount} retries handled
                </span>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
