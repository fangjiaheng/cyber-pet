/**
 * Claude AI 引擎适配器
 * 直接调用 Anthropic Claude API (通过 cclaude.cc)
 */

import { BaseAIEngine } from '../BaseAIEngine';
import type {
  AIEngineConfig,
  AIRequestOptions,
  AIResponse,
  StreamCallbacks,
  TokenUsage,
} from '../types';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeRequest {
  model: string;
  messages: ClaudeMessage[];
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

interface ClaudeUsage {
  input_tokens: number;
  output_tokens: number;
}

interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  usage: ClaudeUsage;
  stop_reason: string;
}

interface ClaudeStreamEvent {
  type: string;
  index?: number;
  delta?: {
    type: string;
    text?: string;
  };
  message?: {
    id: string;
    type: string;
    role: string;
    model: string;
    usage?: ClaudeUsage;
  };
  usage?: ClaudeUsage;
}

export class ClaudeEngine extends BaseAIEngine {
  private defaultModel: string;

  constructor(config: AIEngineConfig) {
    super({
      provider: 'claude',
      baseUrl: config.baseUrl || 'https://cclaude.cc/api',
      ...config,
    });

    this.defaultModel = config.model || 'claude-opus-4-5-20251101';
  }

  get name(): string {
    return 'Claude (CClaude)';
  }

  /**
   * 构建 Claude API 请求头
   */
  protected buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey!,
      'anthropic-version': '2023-06-01',
    };
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
      const requestBody: ClaudeRequest = {
        model: options?.model || this.defaultModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature,
        top_p: options?.topP,
        stream: false,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout || 120000
      );

      try {
        const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
          method: 'POST',
          headers: this.buildHeaders(),
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Claude API error (${response.status}): ${errorText}`);
        }

        const data: ClaudeResponse = await response.json();
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

    const requestBody: ClaudeRequest = {
      model: options?.model || this.defaultModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature,
      top_p: options?.topP,
      stream: true,
    };

    try {
      callbacks.onStart?.();

      const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error (${response.status}): ${errorText}`);
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

            // 跳过心跳消息
            if (data === '[DONE]') {
              continue;
            }

            try {
              const event: ClaudeStreamEvent = JSON.parse(data);

              // 处理不同类型的事件
              switch (event.type) {
                case 'message_start':
                  if (event.message) {
                    model = event.message.model;
                  }
                  break;

                case 'content_block_delta':
                  if (event.delta?.text) {
                    fullContent += event.delta.text;
                    callbacks.onContent?.(event.delta.text);
                  }
                  break;

                case 'message_delta':
                  if (event.usage) {
                    usage = {
                      inputTokens: event.usage.input_tokens,
                      outputTokens: event.usage.output_tokens,
                      totalTokens:
                        event.usage.input_tokens + event.usage.output_tokens,
                    };
                  }
                  break;

                case 'message_stop':
                  // 消息结束
                  break;
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
  private parseResponse(data: ClaudeResponse): AIResponse {
    const textContent = data.content.find((c) => c.type === 'text');
    if (!textContent) {
      throw new Error('No text content in response');
    }

    const usage: TokenUsage = {
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      estimatedCost: this.estimateCost(
        data.usage.input_tokens,
        data.usage.output_tokens,
        data.model
      ),
    };

    return {
      content: textContent.text,
      usage,
      model: data.model,
      finishReason: data.stop_reason,
    };
  }

  /**
   * 估算 Token 使用量（用于流式响应备用）
   */
  private estimateTokenUsage(text: string): TokenUsage {
    // 中文字符检测
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const isMostlyChinese = chineseChars / text.length > 0.3;

    const estimatedTokens = isMostlyChinese
      ? Math.ceil(text.length / 1.5)
      : Math.ceil(text.length / 4);

    return {
      inputTokens: 0,
      outputTokens: estimatedTokens,
      totalTokens: estimatedTokens,
    };
  }

  /**
   * 估算成本（美元）
   */
  private estimateCost(
    inputTokens: number,
    outputTokens: number,
    model: string
  ): number {
    // Claude 定价（每百万 token）
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-opus-4-5-20251101': { input: 15, output: 75 },
      'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'claude-3-5-haiku-20241022': { input: 0.8, output: 4 },
    };

    const modelPricing = pricing[model] || pricing['claude-3-5-sonnet-20241022'];

    const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
    const outputCost = (outputTokens / 1_000_000) * modelPricing.output;

    return inputCost + outputCost;
  }

  /**
   * 检查 Claude API 可用性
   */
  async checkAvailability(): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    if (!this.config.apiKey) {
      return false;
    }

    try {
      // 发送一个简单的测试请求
      await this.sendRequest('Hi', { maxTokens: 10 });
      return true;
    } catch (error) {
      console.error('Claude availability check failed:', error);
      return false;
    }
  }
}
