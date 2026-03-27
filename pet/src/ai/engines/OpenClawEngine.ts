/**
 * OpenClaw AI 引擎适配器
 * 支持通过 OpenClaw Gateway 调用各种 AI 模型
 */

import { BaseAIEngine } from '../BaseAIEngine';
import type {
  AIEngineConfig,
  AIRequestOptions,
  AIResponse,
  StreamCallbacks,
  TokenUsage,
} from '../types';
import { getDefaultModelForProvider, getProviderDefinition } from '../providerCatalog';

interface OpenClawMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenClawRequest {
  model: string;
  messages: OpenClawMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface OpenClawUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface OpenClawResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: OpenClawUsage;
}

interface OpenClawStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export class OpenClawEngine extends BaseAIEngine {
  private defaultModel: string;

  constructor(config: AIEngineConfig) {
    const definition = getProviderDefinition(config.provider);

    super({
      ...config,
      baseUrl: config.baseUrl || definition.defaultBaseUrl,
    });

    this.defaultModel = config.model || getDefaultModelForProvider(config.provider);
  }

  get name(): string {
    return getProviderDefinition(this.config.provider).label;
  }

  private getChatCompletionsUrl(): string {
    const rawBaseUrl = (this.config.baseUrl || '').trim().replace(/\/+$/, '');

    if (!rawBaseUrl) {
      throw new Error(`${this.name}: Base URL is required`);
    }

    if (rawBaseUrl.endsWith('/chat/completions')) {
      return rawBaseUrl;
    }

    if (this.config.provider === 'openclaw' && !rawBaseUrl.endsWith('/v1')) {
      return `${rawBaseUrl}/v1/chat/completions`;
    }

    return `${rawBaseUrl}/chat/completions`;
  }

  /**
   * 发送非流式请求
   */
  async sendRequest(
    prompt: string,
    options?: AIRequestOptions
  ): Promise<AIResponse> {
    this.validateApiKey();

    return this.requestWithRetry(async () => {
      const requestBody: OpenClawRequest = {
        model: options?.model || this.defaultModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        top_p: options?.topP,
        stream: false,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout || 30000
      );

      try {
        const response = await fetch(this.getChatCompletionsUrl(), {
          method: 'POST',
          headers: this.buildHeaders(),
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `OpenClaw API error (${response.status}): ${errorText}`
          );
        }

        const data = await response.json() as OpenClawResponse;
        return this.parseResponse(data);
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    });
  }

  /**
   * 发送流式请求
   */
  async sendStreamRequest(
    prompt: string,
    callbacks: StreamCallbacks,
    options?: AIRequestOptions
  ): Promise<void> {
    this.validateApiKey();

    const requestBody: OpenClawRequest = {
      model: options?.model || this.defaultModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      stream: true,
    };

    try {
      callbacks.onStart?.();

      const response = await fetch(this.getChatCompletionsUrl(), {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenClaw API error (${response.status}): ${errorText}`
        );
      }

      await this.handleStreamResponse(response, callbacks);
    } catch (error) {
      callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * 处理流式响应
   */
  private async handleStreamResponse(
    response: Response,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const decoder = new TextDecoder();
    let fullContent = '';
    let model = '';
    let usage: TokenUsage | undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed: OpenClawStreamChunk = JSON.parse(data);
              model = parsed.model;

              const delta = parsed.choices[0]?.delta;
              if (delta?.content) {
                fullContent += delta.content;
                callbacks.onContent?.(delta.content);
              }

              // 最后一个 chunk 可能包含 finish_reason
              if (parsed.choices[0]?.finish_reason) {
                // OpenClaw 可能在最后返回 usage
                // 如果没有，我们估算一下
                usage = this.estimateTokenUsage(fullContent);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }

      // 完成回调
      callbacks.onComplete?.({
        content: fullContent,
        usage: usage || this.estimateTokenUsage(fullContent),
        model: model || this.defaultModel,
        finishReason: 'stop',
      });
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 解析非流式响应
   */
  private parseResponse(data: OpenClawResponse): AIResponse {
    const choice = data.choices[0];
    if (!choice) {
      throw new Error('No choices in response');
    }

    const usage: TokenUsage = {
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    };

    return {
      content: choice.message.content,
      usage,
      model: data.model,
      finishReason: choice.finish_reason,
    };
  }

  /**
   * 估算 Token 使用量（用于流式响应）
   * 简单估算：1 token ≈ 4 字符（英文）或 1.5 字符（中文）
   */
  private estimateTokenUsage(text: string): TokenUsage {
    // 检测是否主要是中文
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const isMostlyChinese = chineseChars / text.length > 0.3;

    const estimatedTokens = isMostlyChinese
      ? Math.ceil(text.length / 1.5)
      : Math.ceil(text.length / 4);

    return {
      inputTokens: 0, // 无法准确估算
      outputTokens: estimatedTokens,
      totalTokens: estimatedTokens,
    };
  }

  /**
   * 检查 OpenClaw Gateway 可用性
   */
  async checkAvailability(): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      // 尝试访问健康检查端点
      if (this.config.provider === 'openclaw' && this.config.baseUrl) {
        const rawBaseUrl = this.config.baseUrl.replace(/\/+$/, '').replace(/\/v1$/, '');
        const response = await fetch(`${rawBaseUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          return true;
        }
      }
    } catch (error) {
      console.error(`${this.name} availability check failed:`, error);

      // 如果没有健康检查端点，尝试发送一个简单的请求
      try {
        await this.sendRequest('Reply with "ok" only.', { maxTokens: 8 });
        return true;
      } catch {
        return false;
      }
    }
    try {
      await this.sendRequest('Reply with "ok" only.', { maxTokens: 8 });
      return true;
    } catch {
      return false;
    }
  }
}
