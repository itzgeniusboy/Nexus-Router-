import { ModelProvider, ProviderId } from '../types';

export const MODEL_PROVIDERS: ModelProvider[] = [
  {
    id: 'google_ai',
    name: 'Google AI Studio',
    description: 'Generative Language Developer API with free tier for developer accounts',
    keyPrefix: 'AIzaSy',
    portalUrl: 'https://aistudio.google.com/app/apikey',
    category: 'General LLM',
    popularModels: ['Gemma 2 27B', 'Gemma 2 9B', 'Gemma 2 2B'],
    freeTierDetails: '15 RPM / 1,500 RPD Free Daily per account',
    colorScheme: 'from-blue-600 to-sky-500'
  },
  {
    id: 'groq',
    name: 'Groq Cloud LPU',
    description: 'Ultra-fast LPUs serving open models at hundreds of tokens/sec with daily free limits',
    keyPrefix: 'gsk_',
    portalUrl: 'https://console.groq.com/keys',
    category: 'High-Speed',
    popularModels: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'llama-3.1-8b-instant'],
    freeTierDetails: '14,400 RPD & 30 RPM Free Daily Quota',
    colorScheme: 'from-orange-600 to-amber-500'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter Free Tier',
    description: 'Unified gateway providing permanent free access to open & reasoning models',
    keyPrefix: 'sk-or-',
    portalUrl: 'https://openrouter.ai/keys',
    category: 'Aggregator',
    popularModels: ['deepseek/deepseek-r1:free', 'meta-llama/llama-3.3-70b-instruct:free', 'qwen/qwen-2.5-72b-instruct:free'],
    freeTierDetails: '200+ Requests/Day Free on all :free models',
    colorScheme: 'from-purple-600 to-indigo-500'
  },
  {
    id: 'cerebras',
    name: 'Cerebras Cloud',
    description: 'World fastest inference engine offering 1M free daily tokens without credit card',
    keyPrefix: 'csk-',
    portalUrl: 'https://cloud.cerebras.ai/',
    category: 'High-Speed',
    popularModels: ['llama3.3-70b', 'llama3.1-8b'],
    freeTierDetails: '1,000,000 Tokens/Day Free Daily Quota',
    colorScheme: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'sambanova',
    name: 'SambaNova Cloud',
    description: 'Enterprise open-model inference cloud with generous free daily developer tier',
    keyPrefix: 'samba_',
    portalUrl: 'https://cloud.sambanova.ai/apis',
    category: 'High-Speed',
    popularModels: ['Meta-Llama-3.3-70B-Instruct', 'DeepSeek-R1', 'Qwen2.5-72B-Instruct'],
    freeTierDetails: 'Free Daily Rate-Limited Tier on Open Models',
    colorScheme: 'from-amber-600 to-orange-500'
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow (硅基流动)',
    description: 'Premier Chinese high-speed LLM cloud offering permanently free tokens for DeepSeek-R1, DeepSeek-V3, and Qwen 2.5',
    keyPrefix: 'sk-',
    portalUrl: 'https://cloud.siliconflow.cn/account/ak',
    category: 'High-Speed',
    popularModels: ['deepseek-ai/DeepSeek-R1', 'deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct', 'THUDM/glm-4-9b-chat'],
    freeTierDetails: '14 Free Models & 20M Free Starter Tokens',
    colorScheme: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek (深度求索)',
    description: 'Official API for state-of-the-art DeepSeek-R1 Reasoning and DeepSeek-V3 models',
    keyPrefix: 'sk-',
    portalUrl: 'https://platform.deepseek.com/api_keys',
    category: 'General LLM',
    popularModels: ['deepseek-reasoner', 'deepseek-chat'],
    freeTierDetails: '5M Free Tokens on Signup + Ultra Low Rates',
    colorScheme: 'from-sky-500 to-blue-600'
  },
  {
    id: 'zhipu_glm',
    name: 'Zhipu AI / GLM (智谱清言)',
    description: 'Creators of GLM-4 and CogVideo; GLM-4-Flash is 100% free with unlimited API usage',
    keyPrefix: 'glm_',
    portalUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    category: 'General LLM',
    popularModels: ['glm-4-flash', 'glm-4-plus', 'glm-4-air'],
    freeTierDetails: 'GLM-4-Flash 100% Permanently Free & Unlimited',
    colorScheme: 'from-cyan-600 to-teal-500'
  },
  {
    id: 'dashscope_qwen',
    name: 'Alibaba DashScope / Qwen (通义千问)',
    description: 'Alibaba Cloud LLM platform offering generous free quotas for Qwen 2.5, Qwen-Max, and Qwen-Coder',
    keyPrefix: 'sk-',
    portalUrl: 'https://bailian.console.aliyun.com/',
    category: 'General LLM',
    popularModels: ['qwen-max', 'qwen-plus', 'qwen-coder-plus', 'qwen2.5-72b-instruct'],
    freeTierDetails: '1M+ Free Tokens per Model during Trial',
    colorScheme: 'from-orange-500 to-amber-600'
  },
  {
    id: 'moonshot_kimi',
    name: 'Moonshot AI / Kimi (月之暗面)',
    description: 'Ultra-long context reasoning models with up to 200k context window',
    keyPrefix: 'sk-',
    portalUrl: 'https://platform.moonshot.cn/console/api-keys',
    category: 'Specialized',
    popularModels: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    freeTierDetails: '¥15 Free Credit on API Registration',
    colorScheme: 'from-violet-600 to-purple-600'
  },
  {
    id: 'opencode',
    name: 'OpenCode / Free Model Hub',
    description: 'Community-driven gateway routing free developer coding models and open-weights',
    keyPrefix: 'opencode_',
    portalUrl: 'https://openrouter.ai/models?max_price=0',
    category: 'Aggregator',
    popularModels: ['deepseek/deepseek-r1:free', 'qwen/qwen-2.5-coder-32b-instruct:free', 'meta-llama/llama-3.3-70b-instruct:free'],
    freeTierDetails: 'Zero Cost Community Daily Rate-Limited',
    colorScheme: 'from-emerald-500 to-cyan-500'
  },
  {
    id: 'mistral',
    name: 'Mistral AI (La Plateforme)',
    description: 'State of the art European open weights with free experimentation tier',
    keyPrefix: 'mis_',
    portalUrl: 'https://console.mistral.ai/api-keys/',
    category: 'General LLM',
    popularModels: ['codestral-latest', 'mistral-small-latest', 'pixtral-12b-2409'],
    freeTierDetails: 'Free Experimentation Tier (1 RPS)',
    colorScheme: 'from-amber-500 to-red-500'
  },
  {
    id: 'novita',
    name: 'Novita AI',
    description: 'Serverless inference for open-source AI with generous signup credits and low-latency Llama/DeepSeek',
    keyPrefix: 'novita_',
    portalUrl: 'https://novita.ai/settings/key-management',
    category: 'High-Speed',
    popularModels: ['deepseek/deepseek-r1', 'meta-llama/llama-3.3-70b-instruct'],
    freeTierDetails: 'Free Signup Credits & Zero Idle Cost',
    colorScheme: 'from-pink-500 to-rose-600'
  },
  {
    id: 'cloudflare_ai',
    name: 'Cloudflare Workers AI',
    description: 'Serverless GPU inference at 300+ edge locations with 10,000 neurons free daily',
    keyPrefix: 'cf_',
    portalUrl: 'https://dash.cloudflare.com/ai/workers-ai',
    category: 'High-Speed',
    popularModels: ['@cf/meta/llama-3.3-70b-instruct', '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b'],
    freeTierDetails: '10,000 Neurons/Day Permanently Free',
    colorScheme: 'from-amber-600 to-yellow-500'
  },
  {
    id: 'together_ai',
    name: 'Together AI',
    description: 'Leading open-source AI cloud with fast inference on DeepSeek-R1, Llama 3, and FLUX',
    keyPrefix: 'tog_',
    portalUrl: 'https://api.together.xyz/settings/api-keys',
    category: 'High-Speed',
    popularModels: ['deepseek-ai/DeepSeek-R1', 'meta-llama/Llama-3.3-70B-Instruct-Turbo'],
    freeTierDetails: '$5.00 Free Trial Credit (No Card Required)',
    colorScheme: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'fireworks_ai',
    name: 'Fireworks AI',
    description: 'Lightning-fast compound AI platform with free onboarding quota on leading reasoning models',
    keyPrefix: 'fw_',
    portalUrl: 'https://fireworks.ai/api-keys',
    category: 'High-Speed',
    popularModels: ['accounts/fireworks/models/deepseek-r1', 'accounts/fireworks/models/llama-v3p3-70b-instruct'],
    freeTierDetails: '$1.00 Instant Free Developer Credit',
    colorScheme: 'from-rose-600 to-orange-500'
  },
  {
    id: 'bytedance_doubao',
    name: 'ByteDance Volcano / Doubao (火山引擎 豆包)',
    description: 'TikTok / ByteDance official flagship LLM with high Chinese reasoning capabilities',
    keyPrefix: 'volc_',
    portalUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',
    category: 'General LLM',
    popularModels: ['doubao-pro-32k', 'doubao-lite-32k', 'doubao-vision-pro'],
    freeTierDetails: '500,000 Free Tokens per Model on Signup',
    colorScheme: 'from-cyan-600 to-blue-600'
  },
  {
    id: 'baidu_ernie',
    name: 'Baidu ERNIE / Qianfan (文心一言 千帆)',
    description: 'Baidu AI platform with free tier on ERNIE-Speed and ERNIE-Lite models',
    keyPrefix: 'bce_',
    portalUrl: 'https://console.bce.baidu.com/qianfan/ais/console/onlineService',
    category: 'General LLM',
    popularModels: ['ERNIE-Speed-128K', 'ERNIE-Lite-8K', 'ERNIE-4.0-Turbo'],
    freeTierDetails: 'ERNIE-Speed & Lite 100% Free Unlimited',
    colorScheme: 'from-blue-700 to-sky-500'
  },
  {
    id: 'pollinations',
    name: 'Pollinations AI (Zero Auth)',
    description: '100% Free, open, serverless AI endpoint requiring NO API KEY or login whatsoever',
    keyPrefix: 'none_',
    portalUrl: 'https://pollinations.ai/',
    category: 'Aggregator',
    popularModels: ['openai', 'deepseek-r1', 'mistral', 'qwen-coder'],
    freeTierDetails: '100% Free & Unlimited (Zero Auth)',
    colorScheme: 'from-emerald-500 to-teal-400'
  },
  {
    id: 'hyperbolic',
    name: 'Hyperbolic AI',
    description: 'Decentralized open-access GPU network offering low latency DeepSeek-R1 and Llama 3.3',
    keyPrefix: 'hyp_',
    portalUrl: 'https://app.hyperbolic.xyz/settings',
    category: 'High-Speed',
    popularModels: ['deepseek-ai/DeepSeek-R1', 'meta-llama/Meta-Llama-3.3-70B-Instruct'],
    freeTierDetails: 'Free Starter Balance & Low Rates',
    colorScheme: 'from-purple-600 to-pink-500'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Inference',
    description: 'Free serverless inference endpoints for 100,000+ open-source models',
    keyPrefix: 'hf_',
    portalUrl: 'https://huggingface.co/settings/tokens',
    category: 'Aggregator',
    popularModels: ['meta-llama/Meta-Llama-3-8B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3'],
    freeTierDetails: 'Free Community Serverless Daily Limit',
    colorScheme: 'from-yellow-600 to-amber-600'
  },
  {
    id: 'github_models',
    name: 'GitHub Models',
    description: 'Free playground & API access for GPT-4o, Llama 3.3, and Phi-4 for all GitHub accounts',
    keyPrefix: 'ghp_',
    portalUrl: 'https://github.com/marketplace/models',
    category: 'General LLM',
    popularModels: ['gpt-4o', 'gpt-4o-mini', 'Meta-Llama-3.3-70B-Instruct', 'Phi-4'],
    freeTierDetails: '150 Requests/Day Free Daily with GitHub PAT',
    colorScheme: 'from-slate-700 to-slate-900'
  },
  {
    id: 'cohere',
    name: 'Cohere Platform',
    description: 'Free trial prototyping API key for Command R and Embed models',
    keyPrefix: 'co-',
    portalUrl: 'https://dashboard.cohere.com/api-keys',
    category: 'Specialized',
    popularModels: ['command-r-plus', 'embed-multilingual-v3.0'],
    freeTierDetails: 'Free Trial Prototyping Quota (1000 req/mo)',
    colorScheme: 'from-emerald-700 to-green-600'
  },
  {
    id: 'nvidia_nim',
    name: 'NVIDIA NIM (build.nvidia.com)',
    description: 'Enterprise GPU accelerated inference with 1,000 free inference credits on registration',
    keyPrefix: 'nvapi-',
    portalUrl: 'https://build.nvidia.com/',
    category: 'High-Speed',
    popularModels: ['meta/llama-3.1-405b-instruct', 'deepseek-ai/deepseek-r1', 'nvidia/llama-3.1-nemotron-70b'],
    freeTierDetails: '1,000 Free Inference Credits per account',
    colorScheme: 'from-emerald-600 to-teal-600'
  },
  {
    id: 'deepinfra',
    name: 'DeepInfra Free Trial',
    description: 'Serverless inference for open-weights models with instant free credit upon signup',
    keyPrefix: 'di-',
    portalUrl: 'https://deepinfra.com/dash/api_keys',
    category: 'High-Speed',
    popularModels: ['deepseek-ai/DeepSeek-R1', 'meta-llama/Llama-3.3-70B-Instruct', 'Qwen/Qwen2.5-Coder-32B'],
    freeTierDetails: 'Free Starter Credits without Credit Card',
    colorScheme: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'scaleway',
    name: 'Scaleway Generative APIs',
    description: 'European sovereign cloud offering free developer tier credits for open LLMs',
    keyPrefix: 'scw_',
    portalUrl: 'https://console.scaleway.com/iam/api-keys',
    category: 'General LLM',
    popularModels: ['llama-3.3-70b-instruct', 'mistral-7b-instruct-v0.3'],
    freeTierDetails: 'Free Developer Credits & European Edge',
    colorScheme: 'from-purple-700 to-violet-600'
  },
  {
    id: 'glhf',
    name: 'GLHF (Go Learn How Fast)',
    description: 'Community-driven OpenAI-compatible gateway hosting open-source reasoning and code models',
    keyPrefix: 'glhf_',
    portalUrl: 'https://glhf.chat/users/settings/api',
    category: 'Aggregator',
    popularModels: ['hf:deepseek-ai/DeepSeek-R1', 'hf:meta-llama/Llama-3.3-70B-Instruct'],
    freeTierDetails: 'Free Open Community Daily Quota',
    colorScheme: 'from-amber-600 to-orange-600'
  }
];

export function getProviderById(id: ProviderId): ModelProvider {
  return MODEL_PROVIDERS.find(p => p.id === id) || MODEL_PROVIDERS[0];
}
