/// <reference types="vite/client" />

import type { AIEngineConfig } from './types';
import { getDefaultBaseUrlForProvider, getDefaultModelForProvider, getModelsForProvider } from './providerCatalog';

export const claudeConfig: AIEngineConfig = {
  provider: 'claude',
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',
  baseUrl: getDefaultBaseUrlForProvider('claude'),
  model: getDefaultModelForProvider('claude'),
  enabled: true,
  timeout: 120000,
  maxRetries: 3,
};

export const openclawConfig: AIEngineConfig = {
  provider: 'openclaw',
  apiKey: import.meta.env.VITE_OPENCLAW_TOKEN || '',
  baseUrl: import.meta.env.VITE_OPENCLAW_BASE_URL || getDefaultBaseUrlForProvider('openclaw'),
  model: getDefaultModelForProvider('openclaw'),
  enabled: false,
  timeout: 120000,
  maxRetries: 3,
};

export const availableModels = getModelsForProvider('claude');

export const taskTypes = [
  {
    id: 'chat',
    name: 'Chat',
    icon: 'Chat',
    temperature: 0.7,
    maxTokens: 2000,
  },
  {
    id: 'email',
    name: 'Email',
    icon: 'Mail',
    temperature: 0.3,
    maxTokens: 1500,
    systemPrompt: 'You are a professional email assistant. Extract key points and draft concise replies.',
  },
  {
    id: 'code-review',
    name: 'Code Review',
    icon: 'Code',
    temperature: 0.2,
    maxTokens: 3000,
    systemPrompt: 'You are a senior code reviewer. Focus on correctness, regressions, safety, and maintainability.',
  },
  {
    id: 'translate',
    name: 'Translate',
    icon: 'Translate',
    temperature: 0.3,
    maxTokens: 2000,
    systemPrompt: 'Translate the user content accurately and naturally while preserving meaning.',
  },
  {
    id: 'summarize',
    name: 'Summarize',
    icon: 'Summary',
    temperature: 0.4,
    maxTokens: 1000,
    systemPrompt: 'Summarize the input clearly and highlight the most important details first.',
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    icon: 'Ideas',
    temperature: 0.9,
    maxTokens: 2500,
    systemPrompt: 'Generate diverse, practical ideas and call out strong options with tradeoffs.',
  },
];

export const defaultConfig = {
  defaultProvider: 'claude' as const,
  defaultModel: getDefaultModelForProvider('claude'),
  defaultOptions: {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
  },
  tokenManagement: {
    maxRecords: 1000,
    enableAutoSave: true,
    saveInterval: 60000,
  },
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },
  chatWindow: {
    width: 600,
    height: 700,
    minWidth: 400,
    minHeight: 500,
    defaultPosition: 'center' as const,
  },
};

export const openclawGatewayConfig = `{
  "gateway": {
    "mode": "local",
    "http": {
      "port": 8181,
      "endpoints": {
        "chatCompletions": {
          "enabled": true
        }
      }
    },
    "auth": {
      "mode": "token",
      "token": "your-openclaw-token"
    }
  }
}`;

export const envTemplate = `
VITE_CLAUDE_API_KEY=
VITE_OPENCLAW_TOKEN=
VITE_OPENCLAW_BASE_URL=http://localhost:8181/v1
`;
