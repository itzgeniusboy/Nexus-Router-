import React, { useState, useEffect } from 'react';
import { PanelHeader, PanelTab } from './components/panel/PanelHeader';
import { OverviewTab } from './components/panel/OverviewTab';
import { KeyPoolTab } from './components/panel/KeyPoolTab';
import { PlaygroundTab } from './components/panel/PlaygroundTab';
import { ModelsTab } from './components/panel/ModelsTab';
import { CustomHostsTab } from './components/panel/CustomHostsTab';
import { LogsTab } from './components/panel/LogsTab';
import { GoogleAuthScreen } from './components/GoogleAuthScreen';
import { auth, signOut, onAuthStateChanged, type User } from './lib/firebase';
import { 
  syncUserProfile, 
  saveApiKeyToVault, 
  deleteApiKeyFromVault, 
  subscribeToUserVault 
} from './services/vaultService';
import { UnifiedAccount, CustomProviderConfig } from './types';
import { Flame } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<PanelTab>('overview');

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        syncUserProfile(user).catch((err) => console.warn('User profile sync error', err));
      }
    });
    return () => unsubscribe();
  }, []);

  // Master Virtual API Key
  const [masterKey, setMasterKey] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('nxg_master_key');
      if (saved) return saved;
    } catch {}
    return `nxg_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
  });

  const [isRotatingKey, setIsRotatingKey] = useState<boolean>(false);

  // Gateway Base URL
  const [gatewayUrl, setGatewayUrl] = useState<string>('/api/gateway/v1');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGatewayUrl(`${window.location.origin}/api/gateway/v1`);
    }
  }, []);

  // Gateway live status
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkStatus = () => {
      fetch('/api/gateway/v1/status')
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Status failed');
        })
        .then((data) => {
          setIsOnline(true);
          if (data.envProviders) {
            setEnvStatus(data.envProviders);
          }
        })
        .catch(() => {
          setIsOnline(false);
        });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Accounts & Key Pool
  const [accounts, setAccounts] = useState<UnifiedAccount[]>(() => {
    try {
      const saved = localStorage.getItem('nxf_unified_accounts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Subscribe to user's Firestore vault when logged in
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToUserVault(currentUser.uid, (firestoreAccounts) => {
      if (firestoreAccounts && firestoreAccounts.length > 0) {
        setAccounts(firestoreAccounts);
        try {
          localStorage.setItem('nxf_unified_accounts', JSON.stringify(firestoreAccounts));
        } catch (e) {
          console.error('Failed to save to local storage', e);
        }
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Automatically sync pool accounts to backend memory store for external agents (OpenCode, Cursor, Aider)
  useEffect(() => {
    const payload = accounts
      .filter((a) => a.status === 'active' && a.apiKey)
      .map((a) => ({
        email: a.email,
        provider: a.provider,
        apiKey: a.apiKey,
      }));

    fetch('/api/gateway/v1/sync-pool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterKey,
        gatewayId: 'default',
        pool: payload,
      }),
    }).catch((err) => console.warn('Failed to sync pool to server', err));
  }, [accounts, masterKey]);

  const handleAddAccount = (newAcc: UnifiedAccount) => {
    const updated = [newAcc, ...accounts];
    setAccounts(updated);
    try {
      localStorage.setItem('nxf_unified_accounts', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save accounts', e);
    }
    if (currentUser) {
      saveApiKeyToVault(currentUser.uid, newAcc).catch((err) => console.error('Failed to save to firestore', err));
    }
  };

  const handleRemoveAccount = (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    try {
      localStorage.setItem('nxf_unified_accounts', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save accounts', e);
    }
    if (currentUser) {
      deleteApiKeyFromVault(currentUser.uid, id).catch((err) => console.error('Failed to delete from firestore', err));
    }
  };

  // Custom Hosts
  const [customProviders, setCustomProviders] = useState<CustomProviderConfig[]>(() => {
    try {
      const saved = localStorage.getItem('nxf_custom_providers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const handleAddCustomProvider = (newProv: CustomProviderConfig) => {
    const updated = [newProv, ...customProviders];
    setCustomProviders(updated);
    try {
      localStorage.setItem('nxf_custom_providers', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom provider', e);
    }
  };

  const handleRemoveCustomProvider = (id: string) => {
    const updated = customProviders.filter((p) => p.id !== id);
    setCustomProviders(updated);
    try {
      localStorage.setItem('nxf_custom_providers', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom provider', e);
    }
  };

  // Rotate Key
  const handleRotateKey = async () => {
    setIsRotatingKey(true);
    try {
      const res = await fetch('/api/gateway/v1/rotate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentToken: masterKey }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.newToken) {
          setMasterKey(data.newToken);
          localStorage.setItem('nxg_master_key', data.newToken);
        }
      } else {
        const fallback = `nxg_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
        setMasterKey(fallback);
        localStorage.setItem('nxg_master_key', fallback);
      }
    } catch {
      const fallback = `nxg_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setMasterKey(fallback);
      localStorage.setItem('nxg_master_key', fallback);
    } finally {
      setIsRotatingKey(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Loading Screen while checking Firebase Auth status
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FFB627] p-0.5 shadow-[0_0_30px_rgba(255,107,53,0.3)] mb-4 animate-pulse">
          <div className="w-full h-full rounded-[14px] bg-[#121215] flex items-center justify-center">
            <Flame className="w-6 h-6 text-[#FFB627]" />
          </div>
        </div>
        <p className="text-xs font-mono text-slate-400">Loading Nexus Gateway...</p>
      </div>
    );
  }

  // If user is not logged in, show the clean Google Sign-In Screen
  if (!currentUser) {
    return <GoogleAuthScreen />;
  }

  // If user is logged in with Gmail, show the Web App!
  return (
    <div className="min-h-screen bg-[#0f0f11] text-slate-100 flex flex-col font-sans selection:bg-[#FF6B35]/30 selection:text-[#FFB627]">
      
      {/* Top Fixed Header with Brand, Quick Key & User Profile */}
      <PanelHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        masterKey={masterKey}
        gatewayUrl={gatewayUrl}
        isOnline={isOnline}
        activeKeyCount={accounts.length}
        onRotateKey={handleRotateKey}
        isRotating={isRotatingKey}
        user={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Main Panel Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 sm:pb-8">
        {activeTab === 'overview' && (
          <OverviewTab
            masterKey={masterKey}
            gatewayUrl={gatewayUrl}
            onRotateKey={handleRotateKey}
            isRotating={isRotatingKey}
            activeKeyCount={accounts.length}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'pool' && (
          <KeyPoolTab
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onRemoveAccount={handleRemoveAccount}
            envStatus={envStatus}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'playground' && (
          <PlaygroundTab
            masterKey={masterKey}
            gatewayUrl={gatewayUrl}
            accounts={accounts}
          />
        )}

        {activeTab === 'models' && (
          <ModelsTab />
        )}

        {activeTab === 'custom' && (
          <CustomHostsTab
            customProviders={customProviders}
            onAddCustomProvider={handleAddCustomProvider}
            onRemoveCustomProvider={handleRemoveCustomProvider}
          />
        )}

        {activeTab === 'logs' && (
          <LogsTab />
        )}
      </main>

      {/* Clean Developer Footer */}
      <footer className="w-full border-t border-white/[0.08] bg-[#121214] py-6 text-xs text-slate-400 mb-14 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FFB627]" />
            <span className="font-bold text-slate-200">Nexus Gateway</span>
            <span className="text-slate-600">&bull;</span>
            <span>Zero-Rate-Limit Multi-Account AI Edge Pool</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span>{isOnline ? 'Edge Node Active' : 'Offline'}</span>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[#FFB627]">OpenAI Spec v1</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
