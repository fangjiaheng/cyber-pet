# 快速入门指南

## 5 分钟快速开始

### 第 1 步：安装依赖

确保项目已安装必要的依赖：

```bash
npm install
```

### 第 2 步：启动 OpenClaw Gateway

在终端中启动 OpenClaw Gateway：

```bash
# 确保已安装 OpenClaw
openclaw gateway

# 或使用 Docker
docker run -p 8181:8181 openclaw/gateway
```

确认 OpenClaw 已成功启动，访问 http://localhost:8181/health 应该返回 OK。

### 第 3 步：配置 OpenClaw

编辑 `~/.openclaw/openclaw.json`：

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
      "token": "test123"
    }
  },
  "models": {
    "providers": {
      "openai": {
        "baseUrl": "https://api.openai.com/v1",
        "apiKey": "你的-OpenAI-API-Key",
        "api": "openai-completions",
        "models": [
          {
            "id": "gpt-4",
            "name": "GPT-4"
          }
        ]
      }
    }
  }
}
```

### 第 4 步：在代码中使用

#### 基础用法

```typescript
import { aiManager } from './ai';

// 1. 注册引擎
aiManager.registerEngine({
  provider: 'openclaw',
  apiKey: 'test123',  // 对应 OpenClaw 配置中的 token
  baseUrl: 'http://localhost:8181',
  model: 'gpt-4',
});

// 2. 设为默认引擎
aiManager.setDefaultEngine('openclaw');

// 3. 发送请求
const response = await aiManager.executeTask('你好，请介绍一下自己');
console.log(response.content);
```

#### 在 React 组件中使用

```tsx
import { useState } from 'react';
import { aiManager } from './ai';

function MyComponent() {
  const [response, setResponse] = useState('');

  const handleClick = async () => {
    const result = await aiManager.executeTask('告诉我一个笑话');
    setResponse(result.content);
  };

  return (
    <div>
      <button onClick={handleClick}>获取笑话</button>
      <p>{response}</p>
    </div>
  );
}
```

### 第 5 步：查看示例

运行完整的示例：

```typescript
import { examples } from './ai/examples/basic-usage';

// 运行完整工作流
await examples.fullWorkflow();
```

## 常见问题

### Q1: 连接 OpenClaw 失败

**A:** 检查：
1. OpenClaw Gateway 是否正在运行
2. 端口 8181 是否被占用
3. `apiKey` 是否与 OpenClaw 配置的 `token` 一致

```bash
# 检查 OpenClaw 状态
curl http://localhost:8181/health

# 检查端口占用
lsof -i :8181
```

### Q2: 请求超时

**A:** 增加超时时间：

```typescript
aiManager.registerEngine({
  provider: 'openclaw',
  // ...
  timeout: 120000,  // 增加到 120 秒
});
```

### Q3: Token 统计不准确

**A:** 流式响应的 Token 是估算的，非流式响应的 Token 由 API 返回，更准确。如需精确统计，建议：
- 优先使用非流式请求
- 或在 OpenClaw 配置中启用 Token 计数

### Q4: 如何切换不同的 AI 模型

**A:** 在发送请求时指定模型：

```typescript
const response = await aiManager.executeTask('你好', {
  model: 'gpt-3.5-turbo',  // 使用不同的模型
});
```

或更新引擎配置：

```typescript
const engine = aiManager.getEngine('openclaw');
engine?.updateConfig({ model: 'gpt-3.5-turbo' });
```

## 进阶用法

### 使用流式响应

```typescript
await aiManager.executeStreamTask(
  '写一篇关于 AI 的文章',
  {
    onStart: () => console.log('开始...'),
    onContent: (delta) => console.log(delta),
    onComplete: (result) => console.log('完成!', result.usage),
  }
);
```

### 查看 Token 统计

```typescript
import { tokenManager } from './ai';

// 今日统计
const todayStats = tokenManager.getTodayStatistics();

// 按提供商统计
const openclawStats = tokenManager.getStatisticsByProvider('openclaw');

// 所有记录
const allRecords = tokenManager.getAllRecords();
```

### 检查引擎可用性

```typescript
const available = await aiManager.checkAllEnginesAvailability();
console.log('OpenClaw 可用:', available.get('openclaw'));
```

## 下一步

- 📖 阅读完整文档：[README.md](./README.md)
- 💡 查看示例代码：[examples/](./examples/)
- 🔧 自定义配置：[config.example.ts](./config.example.ts)
- 🚀 集成到应用：[react-integration.tsx](./examples/react-integration.tsx)

## 获取帮助

- [OpenClaw 官方文档](https://openclaw.cc/)
- [GitHub Issues](https://github.com/openclaw/openclaw/issues)
- [社区论坛](https://github.com/openclaw/openclaw/discussions)
