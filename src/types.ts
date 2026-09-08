export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt?: string;
}

export interface ConnectedAccount {
  accountId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  status: 'active' | 'pending' | 'disconnected';
  addedAt: string;
  lastSyncedAt?: string;
  notes?: string;
  source: 'google_oauth' | 'manual_import' | 'session_token';
}

export type ProviderId = 
  | 'google_ai'
  | 'groq'
  | 'openrouter'
  | 'cerebras'
  | 'sambanova'
  | 'siliconflow'
  | 'deepseek'
  | 'zhipu_glm'
  | 'dashscope_qwen'
  | 'moonshot_kimi'
  | 'bytedance_doubao'
  | 'baidu_ernie'
  | 'cloudflare_ai'
  | 'together_ai'
  | 'fireworks_ai'
  | 'pollinations'
  | 'hyperbolic'
  | 'opencode'
  | 'mistral'
  | 'novita'
  | 'huggingface'
  | 'github_models'
  | 'cohere'
  | 'nvidia_nim'
  | 'deepinfra'
  | 'scaleway'
  | 'glhf'
  | 'custom';

export interface CustomProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  modelName: string;
  addedAt: string;
  notes?: string;
}

export interface ModelProvider {
  id: ProviderId;
  name: string;
  description: string;
  keyPrefix: string;
  portalUrl: string;
  category: 'General LLM' | 'High-Speed' | 'Open Weights' | 'Specialized' | 'Aggregator';
  popularModels: string[];
  freeTierDetails: string;
  colorScheme: string; // Tailwind color reference
}

export interface ExtractedApiKey {
  keyId: string;
  accountId: string;
  accountEmail: string;
  provider: ProviderId;
  providerName: string;
  apiKey: string;
  status: 'valid' | 'checking' | 'invalid' | 'rate_limited';
  quotaTier: string;
  extractedAt: string;
  lastTestedAt?: string;
  latencyMs?: number;
  modelsCount?: number;
  notes?: string;
}

export interface ExtractionJobProgress {
  isRunning: boolean;
  totalAccounts: number;
  completedAccounts: number;
  currentAccountEmail?: string;
  currentProvider?: string;
  extractedKeysCount: number;
  logs: Array<{
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

export type ExportFormat = 'env' | 'json' | 'csv' | 'litellm' | 'cursor';
