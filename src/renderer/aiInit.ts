/**
 * AI 引擎初始化
 * 支持从存储读取配置，或使用用户提供的配置
 */

import { aiManager } from '../ai';
import type { AIEngineConfig } from '../ai/types';

// 用存储的配置或给定配置初始化（可重复调用）
export async function initializeAI(config?: { apiKey: string; baseUrl: string; model: string }) {
  // 优先使用传入的配置，否则从存储读取
  let apiKey = config?.apiKey
  let baseUrl = config?.baseUrl
  let model = config?.model

  if (!apiKey || !baseUrl) {
    try {
      const stored = await window.electronAPI?.storage?.getAISettings?.()
      if (stored?.apiKey) apiKey = stored.apiKey
      if (stored?.baseUrl) baseUrl = stored.baseUrl
      if (stored?.defaultModel) model = model || stored.defaultModel
    } catch (e) {
      // storage 不可用时忽略
    }
  }

  if (!apiKey || !baseUrl) {
    console.log('⚠️ AI 未配置，跳过初始化')
    return false
  }

  try {
    const engineConfig: AIEngineConfig = {
      provider: 'claude',
      apiKey,
      baseUrl,
      model: model || 'claude-opus-4-5-20251101',
      enabled: true,
      timeout: 120000,
      maxRetries: 3,
    }

    // 重新注册（覆盖旧实例）
    aiManager.registerEngine(engineConfig)
    aiManager.setDefaultEngine('claude')
    console.log('✅ AI 引擎初始化成功')
    return true
  } catch (error) {
    console.error('❌ AI 引擎初始化失败:', error)
    return false
  }
}
