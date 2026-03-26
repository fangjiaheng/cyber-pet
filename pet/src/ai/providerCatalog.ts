import type { AIProvider } from './types'

export interface ModelPreset {
  id: string
  name: string
  provider: AIProvider
  description: string
}

export interface ProviderDefinition {
  id: AIProvider
  label: string
  description: string
  region: 'global' | 'china' | 'hybrid' | 'custom'
  apiStyle: 'anthropic' | 'openai-compatible'
  defaultBaseUrl: string
  baseUrlPlaceholder: string
  apiKeyPlaceholder: string
  defaultModel: string
  models: ModelPreset[]
}

const providerDefinitions: Partial<Record<AIProvider, ProviderDefinition>> = {
  claude: {
    id: 'claude',
    label: 'Claude',
    description: 'Anthropic official Messages API',
    region: 'global',
    apiStyle: 'anthropic',
    defaultBaseUrl: 'https://api.anthropic.com',
    baseUrlPlaceholder: 'https://api.anthropic.com',
    apiKeyPlaceholder: 'sk-ant-...',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        provider: 'claude',
        description: 'Balanced quality and speed',
      },
      {
        id: 'claude-opus-4-20250514',
        name: 'Claude Opus 4',
        provider: 'claude',
        description: 'Higher-end reasoning and writing',
      },
      {
        id: 'claude-opus-4-1-20250805',
        name: 'Claude Opus 4.1',
        provider: 'claude',
        description: 'Official example model from Anthropic docs',
      },
    ],
  },
  openai: {
    id: 'openai',
    label: 'ChatGPT',
    description: 'OpenAI Chat Completions API',
    region: 'global',
    apiStyle: 'openai-compatible',
    defaultBaseUrl: 'https://api.openai.com/v1',
    baseUrlPlaceholder: 'https://api.openai.com/v1',
    apiKeyPlaceholder: 'sk-...',
    defaultModel: 'gpt-4o',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        description: 'General-purpose ChatGPT model',
      },
      {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        provider: 'openai',
        description: 'Stronger instruction following',
      },
      {
        id: 'gpt-4.1-mini',
        name: 'GPT-4.1 Mini',
        provider: 'openai',
        description: 'Lower-cost fast option',
      },
    ],
  },
  bailian: {
    id: 'bailian',
    label: 'Alibaba Bailian',
    description: 'DashScope OpenAI-compatible endpoint',
    region: 'china',
    apiStyle: 'openai-compatible',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    baseUrlPlaceholder: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKeyPlaceholder: 'dashscope api key',
    defaultModel: 'qwen-plus',
    models: [
      {
        id: 'qwen-plus',
        name: 'Qwen Plus',
        provider: 'bailian',
        description: 'Balanced Qwen model',
      },
      {
        id: 'qwen-max',
        name: 'Qwen Max',
        provider: 'bailian',
        description: 'Higher-end reasoning and writing',
      },
      {
        id: 'qwen-turbo',
        name: 'Qwen Turbo',
        provider: 'bailian',
        description: 'Fast lower-cost option',
      },
    ],
  },
  glm: {
    id: 'glm',
    label: 'GLM',
    description: 'Zhipu chat completions API',
    region: 'china',
    apiStyle: 'openai-compatible',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    baseUrlPlaceholder: 'https://open.bigmodel.cn/api/paas/v4',
    apiKeyPlaceholder: 'zhipu api key',
    defaultModel: 'glm-4.7',
    models: [
      {
        id: 'glm-4.7',
        name: 'GLM-4.7',
        provider: 'glm',
        description: 'Current flagship text model',
      },
      {
        id: 'glm-5',
        name: 'GLM-5',
        provider: 'glm',
        description: 'Newer generation option',
      },
      {
        id: 'glm-4.5-flash',
        name: 'GLM-4.5 Flash',
        provider: 'glm',
        description: 'Fast low-cost model',
      },
    ],
  },
  openclaw: {
    id: 'openclaw',
    label: 'OpenClaw',
    description: 'Local OpenAI-compatible gateway',
    region: 'custom',
    apiStyle: 'openai-compatible',
    defaultBaseUrl: 'http://localhost:8181/v1',
    baseUrlPlaceholder: 'http://localhost:8181/v1',
    apiKeyPlaceholder: 'gateway token',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        provider: 'openclaw',
        description: 'Use the model exposed by your gateway',
      },
    ],
  },
}

export const supportedChatProviders = [
  'claude',
  'openai',
  'bailian',
  'glm',
] as const

export type SupportedChatProvider = typeof supportedChatProviders[number]

export function getProviderDefinition(provider?: AIProvider): ProviderDefinition {
  return providerDefinitions[provider ?? 'claude'] ?? providerDefinitions.claude!
}

export function getProviderOptions(): ProviderDefinition[] {
  return supportedChatProviders.map((provider) => getProviderDefinition(provider))
}

export function getModelsForProvider(provider?: AIProvider): ModelPreset[] {
  return getProviderDefinition(provider).models
}

export function getDefaultModelForProvider(provider?: AIProvider): string {
  return getProviderDefinition(provider).defaultModel
}

export function getDefaultBaseUrlForProvider(provider?: AIProvider): string {
  return getProviderDefinition(provider).defaultBaseUrl
}
