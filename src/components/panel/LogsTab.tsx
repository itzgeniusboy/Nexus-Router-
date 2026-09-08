import React, { useEffect, useState } from 'react';
import { 
  ScrollText, 
  RefreshCw, 
  Activity, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface RequestLog {
  id: string;
  timestamp: string;
  model: string;
  provider: string;
  account: string;
  status: number;
  latencyMs: number;
  retries: number;
  stream: boolean;
}

export const LogsTab: React.FC = () => {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gateway/v1/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    if (!autoRefresh) return;
    const timer = setInterval(fetchLogs, 4000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#18181b] border border-white/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-[#FFB627]" />
            <span>Live Request Telemetry &amp; Failover Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Apne Cursor, VS Code, ya Python client se aane wali har request ka real-time log yahan dikhta hai.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
              autoRefresh 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-black/40 text-slate-400 border-white/10'
            }`}
          >
            {autoRefresh ? '● Auto-polling' : 'Paused'}
          </button>

          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[#27272a] hover:bg-[#323238] border border-white/10 text-slate-200 transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#FFB627]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table (Desktop) & Card List (Mobile) */}
      <div className="rounded-2xl bg-[#18181b] border border-white/10 shadow-lg overflow-hidden">
        
        {/* Mobile View: Clean Card List */}
        <div className="block md:hidden divide-y divide-white/[0.08]">
          {logs.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-500 font-mono text-xs">
              <Activity className="w-6 h-6 mx-auto mb-2 text-slate-600" />
              <span>No requests logged yet. Send a test prompt from the Playground tab or your IDE!</span>
            </div>
          ) : (
            logs.map((log) => {
              const isSuccess = log.status >= 200 && log.status < 300;
              return (
                <div key={log.id} className="p-4 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-sm truncate">
                      {log.model}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      isSuccess 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {log.status} {isSuccess ? 'OK' : 'ERR'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-[11px]">
                    <span className="text-[#FFB627] font-semibold">{log.provider}</span>
                    <span>&bull;</span>
                    <span>{log.latencyMs}ms</span>
                    <span>&bull;</span>
                    <span>{log.stream ? 'SSE Stream' : 'JSON'}</span>
                    {log.retries > 0 && (
                      <>
                        <span>&bull;</span>
                        <span className="text-[#FF6B35]">⚡ {log.retries} failover</span>
                      </>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500">
                    {log.timestamp}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/50 border-b border-white/[0.08] text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Routed Provider</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Failover</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Activity className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    <span>No requests logged yet. Send a test prompt from the Playground tab or your IDE!</span>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.status >= 200 && log.status < 300;
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        {log.model}
                      </td>
                      <td className="py-3 px-4 text-[#FFB627] whitespace-nowrap">
                        {log.provider}
                      </td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {log.latencyMs}ms
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {log.stream ? 'SSE Stream' : 'JSON'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.retries > 0 ? (
                          <span className="text-[#FF6B35] font-bold">
                            ⚡ {log.retries} retried
                          </span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSuccess 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {log.status} {isSuccess ? 'OK' : 'ERR'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
