/**
 * AI 引擎工厂
 * 负责创建和管理各种 AI 引擎实例
 */

import type { AIProvider, IAIEngine, AIEngineConfig } from './types';
import { OpenClawEngine } from './engines/OpenClawEngine';
import { ClaudeEngine } from './engines/ClaudeEngine';

export class AIEngineFactory {
  private static engines: Map<string, IAIEngine> = new Map();

  /**
   * 创建 AI 引擎实例
   */
  static createEngine(config: AIEngineConfig): IAIEngine {
    const key = this.getEngineKey(config.provider, config.baseUrl);

    // 如果已存在，返回已有实例
    if (this.engines.has(key)) {
      const engine = this.engines.get(key)!;
      engine.updateConfig(config);
      return engine;
    }

    // 创建新实例
    let engine: IAIEngine;

    switch (config.provider) {
      case 'openclaw':
        engine = new OpenClawEngine(config);
        break;

      case 'claude':
        engine = new ClaudeEngine(config);
        break;

      case 'openai':
        // TODO: 实现 OpenAI 引擎
        throw new Error('OpenAI engine not implemented yet');

      case 'gemini':
        // TODO: 实现 Gemini 引擎
        throw new Error('Gemini engine not implemented yet');

      case 'deepseek':
        // TODO: 实现 DeepSeek 引擎
        throw new Error('DeepSeek engine not implemented yet');

      case 'glm':
        // TODO: 实现 GLM 引擎
        throw new Error('GLM engine not implemented yet');

      case 'qwen':
        // TODO: 实现 Qwen 引擎
        throw new Error('Qwen engine not implemented yet');

      case 'ernie':
        // TODO: 实现 ERNIE 引擎
        throw new Error('ERNIE engine not implemented yet');

      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }

    this.engines.set(key, engine);
    return engine;
  }

  /**
   * 获取已创建的引擎实例
   */
  static getEngine(provider: AIProvider, baseUrl?: string): IAIEngine | undefined {
    const key = this.getEngineKey(provider, baseUrl);
    return this.engines.get(key);
  }

  /**
   * 获取所有引擎实例
   */
  static getAllEngines(): IAIEngine[] {
    return Array.from(this.engines.values());
  }

  /**
   * 移除引擎实例
   */
  static removeEngine(provider: AIProvider, baseUrl?: string): boolean {
    const key = this.getEngineKey(provider, baseUrl);
    return this.engines.delete(key);
  }

  /**
   * 清空所有引擎实例
   */
  static clearAll(): void {
    this.engines.clear();
  }

  /**
   * 生成引擎唯一标识
   */
  private static getEngineKey(provider: AIProvider, baseUrl?: string): string {
    return baseUrl ? `${provider}:${baseUrl}` : provider;
  }
}
