import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ArchitectureFlow } from './components/ArchitectureFlow';
import { Features } from './components/Features';
import { SupportedProvidersCatalog } from './components/SupportedProvidersCatalog';
import { Footer } from './components/Footer';
import { UnifiedGatewayModal } from './components/UnifiedGatewayModal';
import { AddCustomProviderModal } from './components/AddCustomProviderModal';
import { CustomProviderConfig } from './types';

export default function App() {
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isCustomProviderModalOpen, setIsCustomProviderModalOpen] = useState(false);
  const [customProviders, setCustomProviders] = useState<CustomProviderConfig[]>(() => {
    try {
      const saved = localStorage.getItem('forge_custom_providers') || localStorage.getItem('nxf_custom_providers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddCustomProvider = (newProvider: CustomProviderConfig) => {
    const updated = [newProvider, ...customProviders];
    setCustomProviders(updated);
    try {
      localStorage.setItem('forge_custom_providers', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist custom provider', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 flex flex-col selection:bg-[#FF6B35]/30 selection:text-[#FFB627] overflow-x-hidden font-sans">
      {/* Fixed Industrial Glass Navigation */}
      <Navbar 
        onOpenGenerator={() => setIsGatewayModalOpen(true)}
        onOpenUnifiedGateway={() => setIsGatewayModalOpen(true)}
        onOpenCustomProvider={() => setIsCustomProviderModalOpen(true)}
      />

      {/* Main Content Layout:
          Hero with 3D centerpiece & Quick Edge Status
          -> Multi-Account Failover Architecture Flow
          -> Feature cards with glassmorphic blur + gold border glow on hover 
          -> 28+ Free Providers Catalog 
          -> Footer */}
      <main className="flex-1 w-full">
        {/* 1. Hero Section: Floating 3D Molten Core with Quick Pool Status */}
        <Hero 
          onOpenUnifiedGateway={() => setIsGatewayModalOpen(true)}
          onOpenCustomProviderModal={() => setIsCustomProviderModalOpen(true)}
        />

        {/* 2. Architecture Pipeline: Client Request -> Nexus Edge Router -> 429 Failover -> Multi-Provider Adapter -> Zero-Latency Streaming */}
        <ArchitectureFlow />

        {/* 3. Feature Cards with Glassmorphic Blur + Gold Border Glow on Hover & 3D Tilt */}
        <Features />

        {/* 4. Supported Free Providers Catalog & Custom VPS/Ollama Gateway */}
        <SupportedProvidersCatalog 
          onOpenCustomProviderModal={() => setIsCustomProviderModalOpen(true)}
          onOpenAccountModal={() => setIsGatewayModalOpen(true)}
        />
      </main>

      {/* 8. Footer with Warm Gradient Mesh Background */}
      <Footer />

      {/* Multi-Account Unified API Gateway Modal */}
      <UnifiedGatewayModal 
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
        onOpenCustomProvider={() => setIsCustomProviderModalOpen(true)}
      />

      {/* Add Custom Provider Modal (Ollama, LM Studio, Together, VPS) */}
      <AddCustomProviderModal
        isOpen={isCustomProviderModalOpen}
        onClose={() => setIsCustomProviderModalOpen(false)}
        onAddProvider={handleAddCustomProvider}
      />
    </div>
  );
}
