/**
 * AI 管理器
 * 统一管理所有 AI 引擎，提供任务调度和执行功能
 */

import type {
  IAIEngine,
  AIEngineConfig,
  AIRequestOptions,
  AIResponse,
  StreamCallbacks,
  AIProvider,
} from './types';
import { AIEngineFactory } from './AIEngineFactory';

export interface TaskContext {
  taskId: string;
  taskType: string;
  prompt: string;
  timestamp: number;
}

export class AIManager {
  private engines: Map<AIProvider, IAIEngine> = new Map();
  private defaultEngine: IAIEngine | null = null;

  /**
   * 注册 AI 引擎
   */
  registerEngine(config: AIEngineConfig): IAIEngine {
    const engine = AIEngineFactory.createEngine(config);
    this.engines.set(config.provider, engine);

    // 如果是第一个引擎，设为默认
    if (!this.defaultEngine) {
      this.defaultEngine = engine;
    }

    return engine;
  }

  /**
   * 获取引擎
   */
  getEngine(provider: AIProvider): IAIEngine | undefined {
    return this.engines.get(provider);
  }

  /**
   * 设置默认引擎
   */
  setDefaultEngine(provider: AIProvider): void {
    const engine = this.engines.get(provider);
    if (!engine) {
      throw new Error(`Engine ${provider} not found`);
    }
    this.defaultEngine = engine;
  }

  /**
   * 获取默认引擎
   */
  getDefaultEngine(): IAIEngine | null {
    return this.defaultEngine;
  }

  /**
   * 获取所有已注册的引擎
   */
  getAllEngines(): IAIEngine[] {
    return Array.from(this.engines.values());
  }

  /**
   * 检查所有引擎的可用性
   */
  async checkAllEnginesAvailability(): Promise<Map<AIProvider, boolean>> {
    const results = new Map<AIProvider, boolean>();

    await Promise.all(
      Array.from(this.engines.entries()).map(async ([provider, engine]) => {
        const available = await engine.checkAvailability();
        results.set(provider, available);
      })
    );

    return results;
  }

  /**
   * 执行任务（使用默认引擎）
   */
  async executeTask(
    prompt: string,
    options?: AIRequestOptions
  ): Promise<AIResponse> {
    if (!this.defaultEngine) {
      throw new Error('No default engine configured');
    }

    return this.defaultEngine.sendRequest(prompt, options);
  }

  /**
   * 使用指定引擎执行任务
   */
  async executeTaskWithEngine(
    provider: AIProvider,
    prompt: string,
    options?: AIRequestOptions
  ): Promise<AIResponse> {
    const engine = this.engines.get(provider);
    if (!engine) {
      throw new Error(`Engine ${provider} not found`);
    }

    return engine.sendRequest(prompt, options);
  }

  /**
   * 执行流式任务（使用默认引擎）
   */
  async executeStreamTask(
    prompt: string,
    callbacks: StreamCallbacks,
    options?: AIRequestOptions
  ): Promise<void> {
    if (!this.defaultEngine) {
      throw new Error('No default engine configured');
    }

    return this.defaultEngine.sendStreamRequest(prompt, callbacks, options);
  }

  /**
   * 使用指定引擎执行流式任务
   */
  async executeStreamTaskWithEngine(
    provider: AIProvider,
    prompt: string,
    callbacks: StreamCallbacks,
    options?: AIRequestOptions
  ): Promise<void> {
    const engine = this.engines.get(provider);
    if (!engine) {
      throw new Error(`Engine ${provider} not found`);
    }

    return engine.sendStreamRequest(prompt, callbacks, options);
  }

  /**
   * 移除引擎
   */
  removeEngine(provider: AIProvider): boolean {
    const engine = this.engines.get(provider);
    if (engine === this.defaultEngine) {
      this.defaultEngine = null;
    }
    return this.engines.delete(provider);
  }

  /**
   * 清空所有引擎
   */
  clearAll(): void {
    this.engines.clear();
    this.defaultEngine = null;
  }
}

// 导出单例
export const aiManager = new AIManager();
