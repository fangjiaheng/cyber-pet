/**
 * AI 引擎配置示例
 * 复制此文件为 config.ts 并填入你的配置
 */

import type { AIEngineConfig } from './types';

// ============ OpenClaw 配置 ============

export const openclawConfig: AIEngineConfig = {
  provider: 'openclaw',
  apiKey: process.env.OPENCLAW_TOKEN || 'your-openclaw-token',
  baseUrl: process.env.OPENCLAW_BASE_URL || 'http://localhost:8181',
  model: 'gpt-4', // 或你在 OpenClaw 中配置的其他模型
  enabled: true,
  timeout: 60000, // 60 秒
  maxRetries: 3,
};

// ============ Claude 配置（待实现） ============

export const claudeConfig: AIEngineConfig = {
  provider: 'claude',
  apiKey: process.env.CLAUDE_API_KEY || 'sk-ant-...',
  baseUrl: 'https://api.anthropic.com',
  model: 'claude-3-opus-20240229',
  enabled: false, // 暂未实现
};

// ============ OpenAI 配置（待实现） ============

export const openaiConfig: AIEngineConfig = {
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY || 'sk-...',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4',
  enabled: false, // 暂未实现
};

// ============ DeepSeek 配置（待实现） ============

export const deepseekConfig: AIEngineConfig = {
  provider: 'deepseek',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  enabled: false, // 暂未实现
};

// ============ 默认配置 ============

export const defaultConfig = {
  // 默认使用的引擎
  defaultProvider: 'openclaw' as const,

  // 默认请求选项
  defaultOptions: {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
  },

  // Token 管理配置
  tokenManagement: {
    maxRecords: 1000, // 最多保存的记录数
    enableAutoSave: true, // 自动保存到本地存储
    saveInterval: 60000, // 保存间隔（毫秒）
  },

  // 重试配置
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // 重试延迟（毫秒）
    exponentialBackoff: true, // 指数退避
  },
};

// ============ 环境变量说明 ============

/*
创建 .env 文件并添加以下变量：

# OpenClaw 配置
OPENCLAW_TOKEN=your-openclaw-token
OPENCLAW_BASE_URL=http://localhost:8181

# Claude 配置（可选）
CLAUDE_API_KEY=sk-ant-...

# OpenAI 配置（可选）
OPENAI_API_KEY=sk-...

# DeepSeek 配置（可选）
DEEPSEEK_API_KEY=...

*/

// ============ 获取配置函数 ============

export function getEngineConfig(provider: string): AIEngineConfig | null {
  switch (provider) {
    case 'openclaw':
      return openclawConfig;
    case 'claude':
      return claudeConfig;
    case 'openai':
      return openaiConfig;
    case 'deepseek':
      return deepseekConfig;
    default:
      return null;
  }
}

// ============ 验证配置 ============

export function validateConfig(config: AIEngineConfig): boolean {
  // 检查必需字段
  if (!config.provider) {
    console.error('Provider is required');
    return false;
  }

  // 检查 API Key 或 Base URL
  if (!config.apiKey && !config.baseUrl) {
    console.error('API Key or Base URL is required');
    return false;
  }

  return true;
}
