/**
 * AI 引擎抽象基类
 */

import type {
  AIProvider,
  IAIEngine,
  AIEngineConfig,
  AIRequestOptions,
  AIResponse,
  StreamCallbacks,
} from './types';

export abstract class BaseAIEngine implements IAIEngine {
  protected config: AIEngineConfig;

  constructor(config: AIEngineConfig) {
    this.config = {
      enabled: true,
      maxRetries: 3,
      timeout: 30000,
      ...config,
    };
  }

  // 引擎名称（由子类实现）
  abstract get name(): string;

  // 提供商类型
  get provider(): AIProvider {
    return this.config.provider;
  }

  // 发送请求（由子类实现）
  abstract sendRequest(
    prompt: string,
    options?: AIRequestOptions
  ): Promise<AIResponse>;

  // 发送流式请求（由子类实现）
  abstract sendStreamRequest(
    prompt: string,
    callbacks: StreamCallbacks,
    options?: AIRequestOptions
  ): Promise<void>;

  // 检查可用性
  async checkAvailability(): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    if (!this.config.apiKey && !this.config.baseUrl) {
      return false;
    }

    try {
      // 发送测试请求
      await this.sendRequest('test', { maxTokens: 10 });
      return true;
    } catch (error) {
      console.error(`${this.name} availability check failed:`, error);
      return false;
    }
  }

  // 获取配置
  getConfig(): AIEngineConfig {
    return { ...this.config };
  }

  // 更新配置
  updateConfig(config: Partial<AIEngineConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  // 辅助方法：带重试的请求
  protected async requestWithRetry<T>(
    requestFn: () => Promise<T>,
    retries: number = this.config.maxRetries || 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        // 如果不是网络错误或超时，不重试
        if (!this.isRetriableError(error)) {
          throw error;
        }

        // 等待一段时间后重试（指数退避）
        if (i < retries - 1) {
          await this.delay(Math.pow(2, i) * 1000);
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  // 判断是否可重试的错误
  protected isRetriableError(error: any): boolean {
    // 网络错误、超时、429 状态码等可重试
    const retriableCodes = [408, 429, 500, 502, 503, 504];
    return (
      error.name === 'NetworkError' ||
      error.name === 'TimeoutError' ||
      (error.status && retriableCodes.includes(error.status))
    );
  }

  // 延迟工具函数
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 验证 API Key
  protected validateApiKey(): void {
    if (!this.config.apiKey) {
      throw new Error(`${this.name}: API Key is required`);
    }
  }

  // 构建请求头
  protected buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };
  }
}
