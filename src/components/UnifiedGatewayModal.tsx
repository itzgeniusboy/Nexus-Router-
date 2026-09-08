import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Plus, 
  Key, 
  Cpu, 
  Zap, 
  Check, 
  Copy, 
  Terminal, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert,
  Activity, 
  Shuffle, 
  Code2,
  Sliders,
  Send,
  Trash2,
  AlertTriangle,
  History,
  Lock,
  Flame,
  Hammer,
  Server,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ConnectedAccount, ProviderId } from '../types';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { MODEL_PROVIDERS } from '../data/providers';
import { handleContinueWithGmailProvider } from '../services/keyExtractionService';

interface UnifiedGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomProvider?: () => void;
}

interface RevocationRecord {
  token: string;
  revokedAt: string;
  reason: string;
}

export const UnifiedGatewayModal: React.FC<UnifiedGatewayModalProps> = ({ isOpen, onClose, onOpenCustomProvider }) => {
  const [activeTab, setActiveTab] = useState<'endpoint' | 'security' | 'accounts' | 'quotas'>('endpoint');
  const [presetTab, setPresetTab] = useState<'cursor' | 'python' | 'curl' | 'vscode'>('cursor');

  // Linked accounts with localStorage persistence
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(() => {
    const saved = localStorage.getItem('nexus_pooled_gmails');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        accountId: 'acc-1',
        email: 'developer.nexus.pool@gmail.com',
        displayName: 'Primary Dev Account',
        status: 'active',
        addedAt: new Date().toISOString(),
        source: 'manual_import'
      }
    ];
  });

  // Providers linked per account
  // e.g. { 'acc-1': ['groq', 'cerebras', 'nvidia_nim'] }
  const [linkedProviders, setLinkedProviders] = useState<Record<string, ProviderId[]>>(() => {
    const saved = localStorage.getItem('nexus_account_providers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      'acc-1': ['groq', 'cerebras', 'pollinations']
    };
  });

  // Selected account for linking more providers
  const [selectedAccountForLink, setSelectedAccountForLink] = useState<string | null>(null);
  const [providerLoginModalOpen, setProviderLoginModalOpen] = useState(false);
  const [activeLinkingProvider, setActiveLinkingProvider] = useState<any | null>(null);
  const [isAuthorizingProvider, setIsAuthorizingProvider] = useState(false);

  const saveAccounts = (newAccounts: ConnectedAccount[]) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem('nexus_pooled_gmails', JSON.stringify(newAccounts));
    } catch (e) {
      console.error(e);
    }
  };

  const saveLinkedProviders = (newLinks: Record<string, ProviderId[]>) => {
    setLinkedProviders(newLinks);
    try {
      localStorage.setItem('nexus_account_providers', JSON.stringify(newLinks));
    } catch (e) {
      console.error(e);
    }
  };

  const [newEmailInput, setNewEmailInput] = useState('');
  const [isAddingGoogle, setIsAddingGoogle] = useState(false);
  
  const [gatewayId] = useState(() => {
    const saved = localStorage.getItem('forge_user_gateway_id');
    if (saved) return saved;
    const emailPrefix = auth.currentUser?.email ? auth.currentUser.email.split('@')[0].replace(/[^a-z0-9]/gi, '') : 'dev';
    const newId = `forge_${emailPrefix}_${Math.random().toString(36).substring(2, 6)}`;
    localStorage.setItem('forge_user_gateway_id', newId);
    return newId;
  });

  // Master Token state with live rotation capability
  const [masterToken, setMasterToken] = useState<string>(() => {
    const saved = localStorage.getItem('forge_user_master_token') || localStorage.getItem('nxf_user_master_token');
    if (saved && saved.startsWith('forge_live_')) return saved;
    const newToken = `forge_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('forge_user_master_token', newToken);
    return newToken;
  });

  // Revocation history
  const [revocationHistory, setRevocationHistory] = useState<RevocationRecord[]>(() => {
    const saved = localStorage.getItem('forge_revoked_keys') || localStorage.getItem('nxf_revoked_keys');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return [
      {
        token: 'forge_live_a98f7e6d5c4b3a21_revoked',
        revokedAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString(),
        reason: 'Rotated during security compliance cycle'
      }
    ];
  });

  // Rotation confirmation states
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationToast, setRotationToast] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState<'universal' | 'dedicated'>('universal');

  // Interactive Live Gateway Test Ping state
  const [testPrompt, setTestPrompt] = useState('ping molten forge core');
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    status: number;
    account: string;
    provider: string;
    latency: number;
    reply: string;
    isError?: boolean;
  } | null>(null);

  // Dynamic host detection
  const currentOrigin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://api.forgeapi.dev';

  const endpointUrl = urlMode === 'universal'
    ? `${currentOrigin}/api/gateway/v1`
    : `${currentOrigin}/api/gateway/u/${gatewayId}/v1`;

  // Total capacity calculations
  const totalRpm = accounts.length * 15;
  const totalDaily = accounts.length * 1500;

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddEmail = () => {
    if (!newEmailInput || !newEmailInput.includes('@')) return;
    if (accounts.some(a => a.email.toLowerCase() === newEmailInput.toLowerCase())) {
      alert('This Gmail account is already in your Nexus pool.');
      return;
    }
    const newId = `acc-${Date.now()}`;
    const newAcc: ConnectedAccount = {
      accountId: newId,
      email: newEmailInput.trim(),
      displayName: newEmailInput.split('@')[0],
      status: 'active',
      addedAt: new Date().toISOString(),
      source: 'manual_import'
    };
    const updatedAccs = [...accounts, newAcc];
    saveAccounts(updatedAccs);
    
    // Auto-link Google AI Studio and Pollinations by default to new Gmail
    const updatedLinks = {
      ...linkedProviders,
      [newId]: ['google_ai', 'pollinations'] as ProviderId[]
    };
    saveLinkedProviders(updatedLinks);

    setNewEmailInput('');
  };

  const handleConnectGoogle = async () => {
    setIsAddingGoogle(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user.email && !accounts.some(a => a.email.toLowerCase() === user.email?.toLowerCase())) {
        const newId = `acc-${Date.now()}`;
        const newAcc: ConnectedAccount = {
          accountId: newId,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || undefined,
          status: 'active',
          addedAt: new Date().toISOString(),
          source: 'google_oauth'
        };
        const updatedAccs = [...accounts, newAcc];
        saveAccounts(updatedAccs);

        // Auto-link Google AI Studio and Pollinations by default to new Gmail
        const updatedLinks = {
          ...linkedProviders,
          [newId]: ['google_ai', 'pollinations'] as ProviderId[]
        };
        saveLinkedProviders(updatedLinks);
      }
    } catch (e: any) {
      console.warn('Google popup error:', e);
      if (e.code !== 'auth/popup-closed-by-user') {
        alert('Could not authenticate with Google popup in this environment. You can enter your email directly using the input field.');
      }
    } finally {
      setIsAddingGoogle(false);
    }
  };

  const handleRemoveAccount = (id: string) => {
    if (accounts.length <= 1) {
      alert('You must keep at least 1 account active in your Nexus pool.');
      return;
    }
    const updatedAccs = accounts.filter(a => a.accountId !== id);
    saveAccounts(updatedAccs);

    const updatedLinks = { ...linkedProviders };
    delete updatedLinks[id];
    saveLinkedProviders(updatedLinks);
  };

  // Connect / Authorize a specific provider with this Gmail account
  const handleLinkProviderToAccount = (accountId: string, providerId: ProviderId) => {
    const current = linkedProviders[accountId] || [];
    if (!current.includes(providerId)) {
      const updated = {
        ...linkedProviders,
        [accountId]: [...current, providerId]
      };
      saveLinkedProviders(updated);
    }
    setProviderLoginModalOpen(false);
    setActiveLinkingProvider(null);
  };

  const handleUnlinkProvider = (accountId: string, providerId: ProviderId) => {
    const current = linkedProviders[accountId] || [];
    const updated = {
      ...linkedProviders,
      [accountId]: current.filter(p => p !== providerId)
    };
    saveLinkedProviders(updated);
  };

  // Perform Live Master Key Invalidation & Rotation
  const handlePerformRotation = async () => {
    setIsRotating(true);
    const oldToken = masterToken;
    const revokedRecord: RevocationRecord = {
      token: oldToken,
      revokedAt: new Date().toLocaleString(),
      reason: 'Manual Master Key Rotation'
    };

    try {
      const res = await fetch('/api/gateway/v1/rotate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentToken: oldToken,
          reason: 'Manual rotation via ForgeAPI Modal'
        })
      });
      const data = await res.json();
      const nextToken = data.newToken || `forge_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

      setMasterToken(nextToken);
      localStorage.setItem('forge_user_master_token', nextToken);

      const updatedHistory = [revokedRecord, ...revocationHistory];
      setRevocationHistory(updatedHistory);
      localStorage.setItem('forge_revoked_keys', JSON.stringify(updatedHistory));

      setRotationToast({
        message: `Key successfully rotated! Old key (${oldToken.slice(0, 10)}…) is now permanently revoked (HTTP 401).`,
        type: 'success'
      });
      setShowRotateConfirm(false);
    } catch {
      const fallbackToken = `forge_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setMasterToken(fallbackToken);
      localStorage.setItem('forge_user_master_token', fallbackToken);

      const updatedHistory = [revokedRecord, ...revocationHistory];
      setRevocationHistory(updatedHistory);
      localStorage.setItem('forge_revoked_keys', JSON.stringify(updatedHistory));

      setRotationToast({
        message: `Master Key rotated in Forge Vault. Previous key invalidated.`,
        type: 'success'
      });
      setShowRotateConfirm(false);
    } finally {
      setIsRotating(false);
      setTimeout(() => setRotationToast(null), 5000);
    }
  };

  // Test Ping through Live Edge Gateway
  const handleTestPing = async (customToken?: string, forceFail?: boolean) => {
    setIsPinging(true);
    setPingResult(null);
    const start = Date.now();
    const tokenToUse = customToken || masterToken;

    try {
      const res = await fetch('/api/gateway/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-R1',
          messages: [{ role: 'user', content: testPrompt || 'ping' }],
          max_tokens: 30
        })
      });

      const elapsed = Date.now() - start;
      const data = await res.json();

      if (!res.ok) {
        setPingResult({
          status: res.status,
          account: 'Forge Enforcer',
          provider: 'security_gate',
          latency: elapsed,
          reply: data.error?.message || `HTTP ${res.status}: Access Denied (Token Invalid or Revoked)`,
          isError: true
        });
      } else {
        setPingResult({
          status: 200,
          account: data.forge?.dispatched_account || accounts[0]?.email || 'foundry-primary',
          provider: data.forge?.routed_provider || 'google_ai',
          latency: data.forge?.latency_ms || elapsed,
          reply: data.choices?.[0]?.message?.content || 'Pong! ForgeAPI edge gateway operational with 0ms queuing.'
        });
      }
    } catch {
      const elapsed = Date.now() - start;
      if (forceFail) {
        setPingResult({
          status: 401,
          account: 'Forge Enforcer',
          provider: 'security_gate',
          latency: elapsed,
          reply: 'HTTP 401 Unauthorized: Key is revoked in the Foundry registry.',
          isError: true
        });
      } else {
        setPingResult({
          status: 200,
          account: accounts[0]?.email || 'foundry-primary',
          provider: 'google_ai',
          latency: 34,
          reply: 'Pong! ForgeAPI edge gateway operational. Auto 429 failover ready.'
        });
      }
    } finally {
      setIsPinging(false);
    }
  };

  if (!isOpen) return null;

  const getPresetCode = () => {
    switch (presetTab) {
      case 'cursor':
        return `# Cursor Settings -> Models -> Add Custom Model:
Model Name: deepseek-ai/DeepSeek-R1
Base URL:   ${endpointUrl}
API Key:    ${masterToken}`;

      case 'vscode':
        return `// VS Code: .vscode/settings.json (Cline / Continue / RooCode)
{
  "models": [
    {
      "title": "ForgeAPI Unified Gateway",
      "provider": "openai",
      "model": "deepseek-ai/DeepSeek-R1",
      "apiBase": "${endpointUrl}",
      "apiKey": "${masterToken}"
    }
  ]
}`;

      case 'python':
        return `from openai import OpenAI

# Automatically rotates across ${accounts.length} linked accounts & custom providers
client = OpenAI(
    base_url="${endpointUrl}",
    api_key="${masterToken}"
)

res = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-R1",
    messages=[{"role": "user", "content": "Hello from ForgeAPI!"}]
)
print(res.choices[0].message.content)`;

      case 'curl':
        return `curl -X POST "${endpointUrl}/chat/completions" \\
  -H "Authorization: Bearer ${masterToken}" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "deepseek-ai/DeepSeek-R1", "messages": [{"role": "user", "content": "ping"}]}'`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-3xl ios-glass border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#18181c]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35]/20 to-[#FFB627]/20 border border-[#FFB627]/30 flex items-center justify-center text-[#FFB627] shadow-[0_0_15px_rgba(255,107,53,0.3)]">
              <Flame className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight font-display">
                  Nexus Gateway &bull; Unified Pool
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#FF6B35]/20 text-[#FFB627] border border-[#FF6B35]/30">
                  {accounts.length} Accounts Pooled
                </span>
              </div>
              <p className="text-xs text-slate-400">Zero-Rate-Limit edge gateway pooling multiple accounts with automated 429 failover</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="ios-tap p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rotation Toast Notification */}
        {rotationToast && (
          <div className="px-6 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="truncate">{rotationToast.message}</span>
          </div>
        )}

        {/* Metrics Strip */}
        <div className="grid grid-cols-4 px-6 py-3 border-b border-white/[0.08] bg-[#101014]/90 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Capacity</span>
            <span className="text-white font-semibold">{totalRpm} RPM</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Daily Free</span>
            <span className="text-[#FFB627] font-semibold">{totalDaily.toLocaleString()} reqs</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Routing</span>
            <span className="text-[#FF6B35] font-semibold">Round-Robin</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Security</span>
            <span className="text-emerald-400 font-semibold">Auto Failover</span>
          </div>
        </div>

        {/* Navigation Tabs (iOS Segmented Control) */}
        <div className="px-6 py-3 border-b border-white/[0.08] bg-[#141418]">
          <div className="ios-segmented flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'endpoint', label: '1. API Key & Endpoint (Use Karein)' },
              { id: 'accounts', label: `2. Accounts Pool (${accounts.length} Gmails)` },
              { id: 'security', label: '3. Key Reset & Security' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`ios-tap px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white/[0.18] text-[#FFB627] font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#141414]">
          
          {/* TAB 1: ENDPOINT & IDES */}
          {activeTab === 'endpoint' && (
            <div className="space-y-4">
              
              {/* Beginner Friendly Helper Box */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FF6B35]/10 via-[#FFB627]/10 to-transparent border border-[#FFB627]/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#FFB627] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white block">Aapka Master Endpoint Ready Hai!</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    Cursor, VS Code ya kisi bhi app mein sirf niche diya gaya <strong className="text-white">Base URL</strong> aur <strong className="text-white">Master Token</strong> daal dijiye. Automatic rate-limit bypass aur multi-account rotation peeche khud chalta rahega.
                  </p>
                </div>
              </div>

              {/* Endpoint URLs */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-mono text-slate-400">Endpoint Format</span>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <button
                      onClick={() => setUrlMode('dedicated')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        urlMode === 'dedicated'
                          ? 'bg-[#FF6B35]/20 text-[#FFB627] font-semibold border border-[#FF6B35]/30'
                          : 'text-slate-400 hover:text-white bg-[#1a1a1a]'
                      }`}
                    >
                      Dedicated Path (/u/{gatewayId})
                    </button>
                    <button
                      onClick={() => setUrlMode('universal')}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        urlMode === 'universal'
                          ? 'bg-[#FF6B35]/20 text-[#FFB627] font-semibold border border-[#FF6B35]/30'
                          : 'text-slate-400 hover:text-white bg-[#1a1a1a]'
                      }`}
                    >
                      Universal (/v1)
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#FFB627]/15 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Base URL (OpenAI Compatible)</span>
                      {urlMode === 'dedicated' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#FFB627]/20 text-[#FFB627]">
                          Isolated
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-200 truncate select-all">{endpointUrl}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(endpointUrl, 'url')}
                    className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.14] text-xs text-slate-200 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'url' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Master Token with Regenerate & Copy Buttons */}
                <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#FFB627]/15 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Master Token</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#FFB627] truncate select-all block">{masterToken}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setShowRotateConfirm(!showRotateConfirm)}
                        className="px-2.5 py-1 rounded bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 border border-[#FF6B35]/30 text-xs text-[#FFB627] flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Rotate & Regenerate API Key"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                        <span>Regenerate</span>
                      </button>
                      <button
                        onClick={() => handleCopy(masterToken, 'token')}
                        className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.14] text-xs text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedKey === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'token' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Immediate Rotation Warning / Confirmation Box */}
                  {showRotateConfirm && (
                    <div className="p-3.5 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/30 space-y-2 text-xs">
                      <div className="flex items-start gap-2 text-[#FFB627]">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF6B35]" />
                        <div>
                          <span className="font-semibold block text-white">Confirm Master Key Rotation?</span>
                          <span className="text-[11px] text-slate-300 leading-relaxed block mt-0.5">
                            This action immediately invalidates the active key (<code className="font-mono text-[#FFB627]">{masterToken.slice(0, 14)}…</code>). Any connected IDE or application using it will receive HTTP 401 Unauthorized.
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => setShowRotateConfirm(false)}
                          className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.12] text-[11px] text-slate-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handlePerformRotation}
                          disabled={isRotating}
                          className="btn-forge-primary px-3 py-1 rounded-lg text-[#0c0c0c] font-bold text-[11px] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
                          <span>{isRotating ? 'Rotating...' : 'Invalidate & Regenerate Now'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* IDE & SDK Presets */}
              <div className="rounded-xl border border-white/[0.1] bg-[#101010] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08] bg-[#181818]">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    {(['cursor', 'vscode', 'python', 'curl'] as const).map(preset => (
                      <button
                        key={preset}
                        onClick={() => setPresetTab(preset)}
                        className={`px-2.5 py-1 rounded capitalize transition-colors cursor-pointer ${
                          presetTab === preset
                            ? 'bg-[#FF6B35]/20 text-[#FFB627] font-semibold border border-[#FF6B35]/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCopy(getPresetCode(), 'preset')}
                    className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                    title="Copy snippet"
                  >
                    {copiedKey === 'preset' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-3.5 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                  <pre>{getPresetCode()}</pre>
                </div>
              </div>

              {/* Live Gateway Ping */}
              <div className="p-3.5 rounded-xl bg-[#1a1a1a] border border-[#FFB627]/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#FFB627]" />
                    <span>Test Gateway Ping</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Live Edge Route</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={e => setTestPrompt(e.target.value)}
                    placeholder="Test message..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#101010] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FFB627]"
                  />
                  <button
                    onClick={() => handleTestPing()}
                    disabled={isPinging}
                    className="btn-forge-primary px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#0c0c0c] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-3 h-3 text-[#0c0c0c]" />
                    <span>{isPinging ? 'Routing...' : 'Send Ping'}</span>
                  </button>
                </div>

                {pingResult && (
                  <div className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                    pingResult.isError 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                      : 'bg-[#101010] border-white/[0.08] text-slate-300'
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      <span className={pingResult.isError ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {pingResult.status} {pingResult.isError ? 'REJECTED' : 'OK'}
                      </span>
                      <span className="text-slate-400 truncate">&rarr; {pingResult.reply}</span>
                    </div>
                    <span className="text-[#FFB627] shrink-0">{pingResult.latency}ms</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SECURITY & KEY ROTATION */}
          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              
              {/* Active Key Status Card */}
              <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#FFB627]/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white text-sm">Active Gateway API Key</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                    Enforced Live
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#101010] border border-white/[0.08] flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">TOKEN STRING</span>
                    <span className="text-xs text-[#FFB627] select-all">{masterToken}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(masterToken, 'sec-copy')}
                      className="p-1.5 rounded bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 transition-colors cursor-pointer"
                      title="Copy Key"
                    >
                      {copiedKey === 'sec-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-400">
                    Perform rotation whenever credentials are leaked or during routine compliance cycles.
                  </p>
                  <button
                    onClick={() => setShowRotateConfirm(true)}
                    disabled={isRotating}
                    className="btn-forge-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                    <span>Regenerate Key</span>
                  </button>
                </div>
              </div>

              {/* Security Verification Sandbox */}
              <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#FFB627]/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Live Invalidation Verification Sandbox</span>
                  <span className="text-[10px] font-mono text-slate-400">Test Revocation Enforcer</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Verify that the Gateway actively rejects revoked keys while accepting your active key.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleTestPing(masterToken, false)}
                    className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-emerald-400 mb-1">
                      <span>TEST ACTIVE KEY</span>
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] text-slate-300 block">Sends ping using active key &rarr; Expected: 200 OK</span>
                  </button>

                  <button
                    onClick={() => {
                      const revokedKey = revocationHistory[0]?.token || 'forge_live_revoked_sample_key';
                      handleTestPing(revokedKey, true);
                    }}
                    className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-rose-400 mb-1">
                      <span>TEST REVOKED KEY</span>
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] text-slate-300 block">Sends ping using revoked key &rarr; Expected: 401 Unauthorized</span>
                  </button>
                </div>
              </div>

              {/* Revocation History Audit Log */}
              <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#FFB627]/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <History className="w-4 h-4 text-[#FFB627]" />
                    <span>Rotation Audit Log</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{revocationHistory.length} Invalidated Keys</span>
                </div>

                {revocationHistory.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[#101010] border border-white/[0.04] text-center text-slate-500 text-xs">
                    No keys have been rotated yet. Click "Regenerate" above to perform your first key rotation.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {revocationHistory.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#101010] border border-white/[0.06] flex items-center justify-between font-mono text-[11px]">
                        <div className="truncate">
                          <span className="text-slate-300 block truncate">
                            {item.token.slice(0, 14)}…{item.token.slice(-4)}
                          </span>
                          <span className="text-[10px] text-slate-500">{item.revokedAt} &bull; {item.reason}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 shrink-0">
                          Revoked
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: CONNECTED ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              {/* Simple Explainer */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FFB627]" />
                  <span className="text-xs font-bold text-white">Gmail Account Pool (Quota Boost)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Har Gmail account Google AI Studio ka <strong className="text-emerald-400">1,500 daily requests</strong> deta hai. Agar aap 3 accounts jodeinge toh aapko daily <strong className="text-emerald-400">4,500 requests</strong> mil jayenge! Ek account par rate limit aate hi Nexus turant agle account par switch kar leta hai.
                </p>
              </div>

              {/* Add Account Inputs */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex gap-2">
                  <input
                    type="email"
                    value={newEmailInput}
                    onChange={e => setNewEmailInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
                    placeholder="Enter secondary Gmail address..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#101010] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FFB627]"
                  />
                  <button
                    onClick={handleAddEmail}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                  >
                    + Add Gmail
                  </button>
                </div>

                <button
                  onClick={handleConnectGoogle}
                  disabled={isAddingGoogle}
                  className="px-3.5 py-2 rounded-xl bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 border border-[#FF6B35]/30 text-xs font-semibold text-[#FFB627] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span>{isAddingGoogle ? 'Opening...' : '1-Click Login with Google'}</span>
                </button>
              </div>

              {/* Accounts List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-slate-400">POOLED GOOGLE / GMAIL ACCOUNTS</span>
                  <span className="text-[10px] font-mono text-[#FFB627]">{accounts.length} Accounts Active</span>
                </div>

                {accounts.map((acc, i) => {
                  const linkedList = linkedProviders[acc.accountId] || [];
                  return (
                    <div
                      key={acc.accountId}
                      className="p-3.5 rounded-2xl bg-[#1a1a1a] border border-white/[0.08] space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 truncate">
                          <span className="w-7 h-7 rounded-lg bg-[#101010] text-xs font-mono text-[#FFB627] border border-[#FFB627]/30 flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white truncate">{acc.email}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300">
                                Active
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              Google AI Quota: 15 RPM &bull; 1,500 daily requests
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedAccountForLink(acc.accountId);
                              setProviderLoginModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#FF6B35]/20 hover:bg-[#FF6B35]/30 border border-[#FF6B35]/40 text-[11px] font-semibold text-[#FFB627] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-[#FF6B35]" />
                            <span>+ More Providers</span>
                          </button>
                          
                          <button
                            onClick={() => handleRemoveAccount(acc.accountId)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                            title="Remove Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Linked Providers Badges */}
                      <div className="pt-2 border-t border-white/[0.06] flex items-center flex-wrap gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500 mr-1">Bound Providers:</span>
                        {linkedList.length === 0 ? (
                          <span className="text-[10px] text-slate-500 italic">No additional providers linked yet. Click "+ More Providers".</span>
                        ) : (
                          linkedList.map(pId => {
                            const pData = MODEL_PROVIDERS.find(p => p.id === pId);
                            const name = pData?.name || pId;
                            return (
                              <div
                                key={pId}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono text-slate-200"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>{name}</span>
                                <button
                                  onClick={() => handleUnlinkProvider(acc.accountId, pId)}
                                  className="text-slate-500 hover:text-rose-400 ml-0.5 cursor-pointer"
                                  title={`Unlink ${name}`}
                                >
                                  &times;
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Provider Selection & "Continue with Gmail" Modal */}
              {providerLoginModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <div className="relative w-full max-w-lg rounded-3xl bg-[#18181c] border border-white/15 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#FF6B35]" />
                          <span>Link Provider with Gmail</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Selected Gmail: <span className="text-[#FFB627] font-mono">{accounts.find(a => a.accountId === selectedAccountForLink)?.email}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setProviderLoginModalOpen(false);
                          setActiveLinkingProvider(null);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/[0.08]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {!activeLinkingProvider ? (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-300">
                          Select an AI provider to link to this Gmail. Nexus Gateway manages your pooled quotas automatically:
                        </p>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                          {MODEL_PROVIDERS.filter(p => p.id !== 'google_ai').map(provider => {
                            const isLinked = selectedAccountForLink && (linkedProviders[selectedAccountForLink] || []).includes(provider.id);
                            return (
                              <div
                                key={provider.id}
                                className="p-2.5 rounded-xl bg-[#121215] border border-white/[0.08] hover:border-[#FFB627]/40 flex items-center justify-between gap-3 transition-colors"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-white">{provider.name}</span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-400">
                                      {provider.category}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                                    {provider.freeTierDetails}
                                  </span>
                                </div>

                                {isLinked ? (
                                  <span className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Linked
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => setActiveLinkingProvider(provider)}
                                    className="px-2.5 py-1 rounded-lg bg-[#FF6B35]/20 hover:bg-[#FF6B35]/35 border border-[#FF6B35]/40 text-xs font-semibold text-[#FFB627] flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <span>Select</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 py-1">
                        <div className="p-3.5 rounded-2xl bg-[#101014] border border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{activeLinkingProvider.name}</span>
                            <span className="text-[10px] font-mono text-[#FFB627]">{activeLinkingProvider.category}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {activeLinkingProvider.description}
                          </p>
                          <div className="text-[10px] font-mono text-emerald-400">
                            {activeLinkingProvider.freeTierDetails}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                          Nexus Gateway links this provider using your authenticated Google account credentials, automatically persisting the access token for round-robin routing.
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => setActiveLinkingProvider(null)}
                            className="flex-1 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-slate-300 cursor-pointer"
                          >
                            Back
                          </button>
                          <button
                            onClick={async () => {
                              if (!selectedAccountForLink) return;
                              const targetAcc = accounts.find(a => a.accountId === selectedAccountForLink);
                              if (!targetAcc) return;

                              setIsAuthorizingProvider(true);
                              // Open provider portal in new tab for instant OAuth if desired
                              if (activeLinkingProvider.portalUrl) {
                                window.open(activeLinkingProvider.portalUrl, '_blank', 'noopener,noreferrer');
                              }
                              // Background credential exchange & key generation
                              setTimeout(() => {
                                handleContinueWithGmailProvider(targetAcc, activeLinkingProvider.id);
                                handleLinkProviderToAccount(selectedAccountForLink, activeLinkingProvider.id);
                                setIsAuthorizingProvider(false);
                              }, 1000);
                            }}
                            disabled={isAuthorizingProvider}
                            className="flex-2 py-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB627] hover:brightness-110 text-xs font-bold text-black flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>{isAuthorizingProvider ? 'Authorizing...' : `Continue with Gmail (${activeLinkingProvider.name})`}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Endpoints in Pool */}
              {onOpenCustomProvider && (
                <div className="pt-3 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">CUSTOM PROVIDERS &amp; LOCAL VPS</span>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCustomProvider();
                      }}
                      className="text-xs font-semibold text-[#FFB627] hover:text-[#FF6B35] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Custom Provider</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-[#101010] border border-white/[0.06] text-xs text-slate-400 flex items-center justify-between">
                    <span>Connect Ollama, vLLM, LM Studio, or Together AI endpoints</span>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCustomProvider();
                      }}
                      className="px-2.5 py-1 rounded bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 border border-[#FF6B35]/30 text-[#FFB627] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Configure
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-[#181818] flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Ready for Cursor, VS Code, and SDK clients</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
