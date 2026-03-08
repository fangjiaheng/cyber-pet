/**
 * AI 引擎配置
 */

import type { AIEngineConfig } from './types';

// ============ Claude 配置（直接调用，无需 OpenClaw）============

export const claudeConfig: AIEngineConfig = {
  provider: 'claude',
  apiKey: 'cr_b5a70e1a2c0636052d1c64e75ae6644da47a477fd02e2f375992e81904d4b391',
  baseUrl: 'https://cclaude.cc/api',
  model: 'claude-opus-4-5-20251101',
  enabled: true,
  timeout: 120000, // 120 秒
  maxRetries: 3,
};

// ============ OpenClaw 配置（可选，作为备用）============

export const openclawConfig: AIEngineConfig = {
  provider: 'openclaw',
  apiKey: import.meta.env.VITE_OPENCLAW_TOKEN || 'test123',
  baseUrl: import.meta.env.VITE_OPENCLAW_BASE_URL || 'http://localhost:8181',
  model: 'claude-opus-4-5-20251101',
  enabled: false, // 默认禁用，优先使用直接调用
  timeout: 120000,
  maxRetries: 3,
};

// ============ 可用的模型列表 ============

export const availableModels = [
  {
    id: 'claude-opus-4-5-20251101',
    name: 'Claude Opus 4.5',
    provider: 'cclaude',
    description: '最强大的 Claude 模型',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'cclaude',
    description: '平衡性能和速度',
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'cclaude',
    description: '快速响应模型',
  },
];

// ============ 任务类型配置 ============

export const taskTypes = [
  {
    id: 'chat',
    name: '普通对话',
    icon: '💬',
    temperature: 0.7,
    maxTokens: 2000,
  },
  {
    id: 'email',
    name: '邮件整理',
    icon: '📧',
    temperature: 0.3,
    maxTokens: 1500,
    systemPrompt: '你是一个专业的邮件助手，帮助用户整理和回复邮件。请提取关键信息、待办事项，并给出建议。',
  },
  {
    id: 'code-review',
    name: '代码审查',
    icon: '🔍',
    temperature: 0.2,
    maxTokens: 3000,
    systemPrompt: '你是一个资深的代码审查专家。请仔细分析代码质量、潜在问题、性能优化和安全隐患，给出专业建议。',
  },
  {
    id: 'translate',
    name: '翻译',
    icon: '🌐',
    temperature: 0.3,
    maxTokens: 2000,
    systemPrompt: '你是一个专业的翻译员。请准确翻译内容，保持原意，确保语言流畅自然。',
  },
  {
    id: 'summarize',
    name: '内容摘要',
    icon: '📝',
    temperature: 0.4,
    maxTokens: 1000,
    systemPrompt: '你是一个信息提取专家。请用简洁的语言总结要点，突出关键信息。',
  },
  {
    id: 'brainstorm',
    name: '创意头脑风暴',
    icon: '💡',
    temperature: 0.9,
    maxTokens: 2500,
    systemPrompt: '你是一个富有创造力的顾问。请提供多样化的想法和建议，鼓励创新思维。',
  },
];

// ============ 默认配置 ============

export const defaultConfig = {
  // 默认使用的引擎（直接调用 Claude，不需要 OpenClaw Gateway）
  defaultProvider: 'claude' as const,

  // 默认模型
  defaultModel: 'claude-opus-4-5-20251101',

  // 默认请求选项
  defaultOptions: {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
  },

  // Token 管理配置
  tokenManagement: {
    maxRecords: 1000,
    enableAutoSave: true,
    saveInterval: 60000,
  },

  // 重试配置
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },

  // 对话框配置
  chatWindow: {
    width: 600,
    height: 700,
    minWidth: 400,
    minHeight: 500,
    defaultPosition: 'center' as const,
  },
};

// ============ OpenClaw Gateway 配置说明 ============

export const openclawGatewayConfig = `
将以下配置添加到 ~/.openclaw/openclaw.json:

{
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
      "token": "test123"
    }
  },
  "models": {
    "providers": {
      "cclaude": {
        "baseUrl": "https://cclaude.cc/api",
        "apiKey": "cr_b5a70e1a2c0636052d1c64e75ae6644da47a477fd02e2f375992e81904d4b391",
        "api": "anthropic-messages",
        "models": [
          {
            "id": "claude-opus-4-5-20251101",
            "name": "Claude Opus 4.5"
          },
          {
            "id": "claude-3-5-sonnet-20241022",
            "name": "Claude 3.5 Sonnet"
          },
          {
            "id": "claude-3-5-haiku-20241022",
            "name": "Claude 3.5 Haiku"
          }
        ]
      }
    }
  }
}
`;

// ============ 环境变量配置 ============

export const envTemplate = `
# 创建 .env 文件并添加以下配置

# OpenClaw Gateway
OPENCLAW_TOKEN=test123
OPENCLAW_BASE_URL=http://localhost:8181

# CClaude API (已在 OpenClaw 中配置，无需在此配置)
`;
