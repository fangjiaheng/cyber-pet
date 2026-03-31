/**
 * AI 引擎类型定义
 */

// AI 提供商类型
export type AIProvider =
  | 'openclaw'      // OpenClaw Gateway
  | 'claude'        // Anthropic Claude
  | 'openai'        // OpenAI
  | 'bailian'       // Alibaba Bailian / DashScope
  | 'gemini'        // Google Gemini
  | 'deepseek'      // DeepSeek
  | 'glm'           // 智谱 GLM
  | 'qwen'          // 通义千问
  | 'ernie';        // 文心一言

// Token 使用统计
export interface TokenUsage {
  inputTokens: number;      // 输入 token 数
  outputTokens: number;     // 输出 token 数
  totalTokens: number;      // 总 token 数
  estimatedCost?: number;   // 预估成本（美元）
}

// AI 请求选项
export interface AIRequestOptions {
  temperature?: number;     // 温度参数 0-1
  maxTokens?: number;       // 最大输出 token 数
  topP?: number;            // Top-p 采样
  stream?: boolean;         // 是否流式响应
  model?: string;           // 指定模型名称
}

// AI 响应
export interface AIResponse {
  content: string;          // 响应内容
  usage: TokenUsage;        // Token 使用情况
  model: string;            // 使用的模型
  finishReason?: string;    // 结束原因
  error?: string;           // 错误信息
}

// 流式响应回调
export interface StreamCallbacks {
  onStart?: () => void;
  onContent?: (delta: string) => void;
  onComplete?: (response: AIResponse) => void;
  onError?: (error: Error) => void;
}

// AI 引擎配置
export interface AIEngineConfig {
  provider: AIProvider;
  apiKey?: string;          // API Key
  baseUrl?: string;         // API 基础 URL
  model?: string;           // 默认模型
  enabled?: boolean;        // 是否启用
  maxRetries?: number;      // 最大重试次数
  timeout?: number;         // 超时时间（毫秒）
}

// AI 引擎抽象接口
export interface IAIEngine {
  // 引擎信息
  readonly name: string;
  readonly provider: AIProvider;

  // 发送请求（非流式）
  sendRequest(prompt: string, options?: AIRequestOptions): Promise<AIResponse>;

  // 发送流式请求
  sendStreamRequest(
    prompt: string,
    callbacks: StreamCallbacks,
    options?: AIRequestOptions
  ): Promise<void>;

  // 检查可用性
  checkAvailability(): Promise<boolean>;

  // 获取配置
  getConfig(): AIEngineConfig;

  // 更新配置
  updateConfig(config: Partial<AIEngineConfig>): void;
}
