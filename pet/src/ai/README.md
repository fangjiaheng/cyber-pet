# AI 引擎适配层

## 简介

这是桌面宠物应用的 AI 引擎适配层，提供统一的接口来对接多种 AI 服务。

## 架构设计

```
桌面宠物应用
    ↓
AI Manager（AI 管理器）
    ↓
AI Engine Factory（引擎工厂）
    ↓
各种 AI Engine（引擎实现）
    ↓
AI 服务提供商 API
```

## 核心组件

### 1. 类型定义 (`types.ts`)

- `AIProvider`: AI 提供商枚举
- `TokenUsage`: Token 使用统计
- `AIRequestOptions`: AI 请求选项
- `AIResponse`: AI 响应
- `StreamCallbacks`: 流式响应回调
- `AIEngineConfig`: AI 引擎配置
- `IAIEngine`: AI 引擎接口

### 2. 基类 (`BaseAIEngine.ts`)

所有 AI 引擎的抽象基类，提供：
- 配置管理
- 重试机制
- 错误处理
- 公共工具方法

### 3. 引擎实现

#### OpenClaw 引擎 (`engines/OpenClawEngine.ts`)

对接 OpenClaw Gateway，支持：
- 通过 `/v1/chat/completions` 端点调用
- 兼容 OpenAI API 格式
- 流式和非流式响应
- Token 使用统计

### 4. 工厂模式 (`AIEngineFactory.ts`)

负责创建和管理引擎实例：
- 单例模式，避免重复创建
- 支持动态切换引擎
- 统一的创建接口

### 5. AI 管理器 (`AIManager.ts`)

统一管理所有 AI 引擎：
- 注册和获取引擎
- 设置默认引擎
- 任务调度和执行
- 可用性检查

### 6. Token 管理器 (`TokenManager.ts`)

追踪和统计 Token 使用：
- 记录每次调用的 Token 消耗
- 按提供商/任务类型统计
- 今日统计、历史记录
- 导入导出功能

## 使用示例

### 1. 初始化 OpenClaw 引擎

```typescript
import { aiManager } from './ai';

// 注册 OpenClaw 引擎
aiManager.registerEngine({
  provider: 'openclaw',
  apiKey: 'your-token-here',
  baseUrl: 'http://localhost:8181',
  model: 'gpt-4',
  enabled: true,
});

// 设为默认引擎
aiManager.setDefaultEngine('openclaw');
```

### 2. 发送非流式请求

```typescript
import { aiManager, tokenManager } from './ai';

async function askQuestion(question: string) {
  try {
    const response = await aiManager.executeTask(question, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    console.log('回答:', response.content);
    console.log('Token 使用:', response.usage);

    // 记录 Token 使用
    tokenManager.addRecord('openclaw', 'question', response.usage, {
      prompt: question,
      response: response.content,
    });

    return response;
  } catch (error) {
    console.error('请求失败:', error);
  }
}

// 使用
askQuestion('今天天气怎么样？');
```

### 3. 发送流式请求

```typescript
import { aiManager } from './ai';

async function askWithStream(question: string) {
  let fullResponse = '';

  await aiManager.executeStreamTask(
    question,
    {
      onStart: () => {
        console.log('开始接收响应...');
      },
      onContent: (delta) => {
        fullResponse += delta;
        console.log('接收到:', delta);
      },
      onComplete: (response) => {
        console.log('完成! 总 Token:', response.usage.totalTokens);
      },
      onError: (error) => {
        console.error('错误:', error);
      },
    },
    {
      temperature: 0.7,
      maxTokens: 2000,
    }
  );
}

// 使用
askWithStream('给我讲个故事');
```

### 4. 使用指定引擎

```typescript
import { aiManager } from './ai';

// 使用 OpenClaw 引擎
const response = await aiManager.executeTaskWithEngine(
  'openclaw',
  '翻译成英文：你好',
  { maxTokens: 100 }
);
```

### 5. 检查引擎可用性

```typescript
import { aiManager } from './ai';

// 检查所有引擎
const availability = await aiManager.checkAllEnginesAvailability();

for (const [provider, available] of availability.entries()) {
  console.log(`${provider}: ${available ? '可用' : '不可用'}`);
}
```

### 6. 查看 Token 统计

```typescript
import { tokenManager } from './ai';

// 获取今日统计
const todayStats = tokenManager.getTodayStatistics();
console.log('今日统计:', todayStats);

// 获取 OpenClaw 的统计
const openclawStats = tokenManager.getStatisticsByProvider('openclaw');
console.log('OpenClaw 统计:', openclawStats);

// 获取所有记录
const allRecords = tokenManager.getAllRecords();
console.log('总共', allRecords.length, '条记录');
```

### 7. 在 React 组件中使用

```typescript
import { useState } from 'react';
import { aiManager } from './ai';

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setResponse('');

    try {
      await aiManager.executeStreamTask(
        message,
        {
          onContent: (delta) => {
            setResponse((prev) => prev + delta);
          },
          onComplete: (result) => {
            console.log('Token 使用:', result.usage);
          },
        },
        {
          temperature: 0.7,
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入消息..."
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? '发送中...' : '发送'}
      </button>
      <div>{response}</div>
    </div>
  );
}
```

## 配置 OpenClaw

### 1. 启动 OpenClaw Gateway

确保 OpenClaw Gateway 已经在本地运行：

```bash
# 默认端口 8181
openclaw gateway
```

### 2. 配置文件示例 (`~/.openclaw/openclaw.json`)

```json
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
      "token": "your-secret-token"
    }
  },
  "models": {
    "mode": "merge",
    "providers": {
      "openai": {
        "baseUrl": "https://api.openai.com/v1",
        "apiKey": "sk-...",
        "api": "openai-completions"
      }
    }
  }
}
```

### 3. 在应用中配置

```typescript
import { aiManager } from './ai';

aiManager.registerEngine({
  provider: 'openclaw',
  apiKey: 'your-secret-token',  // 对应 gateway.auth.token
  baseUrl: 'http://localhost:8181',
  model: 'gpt-4',  // 或其他在 OpenClaw 中配置的模型
});
```

## 扩展新的 AI 引擎

### 1. 创建引擎类

```typescript
// src/ai/engines/ClaudeEngine.ts
import { BaseAIEngine } from '../BaseAIEngine';
import type { AIEngineConfig, AIRequestOptions, AIResponse } from '../types';

export class ClaudeEngine extends BaseAIEngine {
  constructor(config: AIEngineConfig) {
    super({
      provider: 'claude',
      baseUrl: 'https://api.anthropic.com',
      ...config,
    });
  }

  get name(): string {
    return 'Claude (Anthropic)';
  }

  async sendRequest(prompt: string, options?: AIRequestOptions): Promise<AIResponse> {
    // 实现 Claude API 调用
    // ...
  }

  async sendStreamRequest(/* ... */) {
    // 实现流式调用
    // ...
  }
}
```

### 2. 在工厂中注册

```typescript
// src/ai/AIEngineFactory.ts
import { ClaudeEngine } from './engines/ClaudeEngine';

// 在 createEngine 方法中添加
case 'claude':
  engine = new ClaudeEngine(config);
  break;
```

### 3. 使用新引擎

```typescript
import { aiManager } from './ai';

aiManager.registerEngine({
  provider: 'claude',
  apiKey: 'sk-ant-...',
  model: 'claude-3-opus-20240229',
});
```

## 注意事项

1. **API Key 安全**: 不要将 API Key 硬编码在代码中，使用环境变量或加密存储
2. **错误处理**: 所有 API 调用都应该包裹在 try-catch 中
3. **Token 限制**: 注意各个 AI 服务的 Token 限制和费率限制
4. **流式响应**: 流式响应更适合长文本生成，能提供更好的用户体验
5. **重试机制**: BaseAIEngine 已经实现了自动重试，但对于非重试性错误会直接抛出

## 后续开发计划

- [ ] 实现 Claude 引擎
- [ ] 实现 OpenAI 引擎
- [ ] 实现 Gemini 引擎
- [ ] 实现 DeepSeek 引擎
- [ ] 实现 GLM、Qwen、ERNIE 引擎
- [ ] 添加请求队列和并发控制
- [ ] 添加成本估算功能
- [ ] 添加缓存机制
- [ ] 添加 A/B 测试支持
- [ ] 添加更详细的错误分类和处理

## 参考资料

- [OpenClaw 官方文档](https://openclaw.cc/)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)

Sources:
- [OpenClaw API集成指南](https://www.yanfukun.com/read/openclaw/doc-20260202-154150?wd=c)
- [OpenClaw 配置与使用指南](https://blog.chensoul.cc/posts/2026/03/04/openclaw-install-config-usage-guide)
- [OpenClaw 中文文档](https://openclaw.cc/)
