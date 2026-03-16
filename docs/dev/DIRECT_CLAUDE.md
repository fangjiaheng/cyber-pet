# ✅ 已切换为直接调用 Claude API

## 🎉 好消息

**不再需要 OpenClaw Gateway！**

现在 AI 引擎已经完全集成到桌面宠物应用中，直接调用 Claude API。

## 📋 改动说明

### 1. 创建了 Claude 引擎

**文件：** `src/ai/engines/ClaudeEngine.ts`

- ✅ 直接调用 CClaude API
- ✅ 支持流式和非流式响应
- ✅ 精确的 Token 计数
- ✅ 自动成本估算
- ✅ 完整的错误处理

### 2. 更新了配置

**文件：** `src/ai/config.ts`

```typescript
// 直接使用 Claude（推荐，默认）
export const claudeConfig: AIEngineConfig = {
  provider: 'claude',
  apiKey: 'cr_b5a70e1a2c0636052d1c64e75ae6644da47a477fd02e2f375992e81904d4b391',
  baseUrl: 'https://cclaude.cc/api',
  model: 'claude-opus-4-5-20251101',
  enabled: true,
};

// OpenClaw 作为备用（已禁用）
export const openclawConfig: AIEngineConfig = {
  provider: 'openclaw',
  enabled: false,
};
```

### 3. 更新了对话窗口

**文件：** `src/windows/chat.tsx`

现在使用 `claudeConfig` 而不是 `openclawConfig`。

## 🚀 使用方法

### 直接启动，无需其他依赖！

```bash
# 停止之前的应用（Ctrl+C）
# 重新启动
npm run dev
```

### 打开 AI 助手

- 右键宠物 → 选择 "🦞 AI 助手"
- 或鼠标悬停宠物 → 点击 🦞 按钮

### 开始对话

选择任务类型和模型，输入消息，直接开始使用！

## 📊 优势对比

### 之前（通过 OpenClaw Gateway）

```
桌面宠物 → OpenClaw Gateway → CClaude API → Claude
     ↑            ↑                ↑
   应用       需要手动启动      API 中转
```

**问题：**
- ❌ 需要手动启动 OpenClaw Gateway
- ❌ 多一层中转，增加延迟
- ❌ 端口占用和进程管理
- ❌ 配置复杂

### 现在（直接调用）

```
桌面宠物 → CClaude API → Claude
     ↑          ↑
   应用      直接调用
```

**优势：**
- ✅ 一键启动，无需其他进程
- ✅ 更快的响应速度
- ✅ 更简单的配置
- ✅ 更少的依赖
- ✅ 更容易调试

## 🔧 技术细节

### API 调用格式

Claude 引擎使用 Anthropic Messages API 格式：

```typescript
// 请求
POST https://cclaude.cc/api/v1/messages
Headers:
  x-api-key: your-api-key
  anthropic-version: 2023-06-01
  Content-Type: application/json

Body:
{
  "model": "claude-opus-4-5-20251101",
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.7,
  "stream": true  // 流式响应
}
```

### Token 计数

非流式响应返回精确的 Token 数：

```json
{
  "usage": {
    "input_tokens": 10,
    "output_tokens": 245
  }
}
```

流式响应在最后的 `message_delta` 事件中返回 Token 数。

### 成本估算

自动根据模型计算成本：

- **Claude Opus 4.5**: $15/M 输入, $75/M 输出
- **Claude 3.5 Sonnet**: $3/M 输入, $15/M 输出
- **Claude 3.5 Haiku**: $0.8/M 输入, $4/M 输出

## 🎨 支持的功能

所有功能保持不变：

- ✅ 6 种任务类型
- ✅ 3 种 Claude 模型
- ✅ 流式响应
- ✅ Token 统计
- ✅ 成本估算
- ✅ 快捷键支持

## 🔍 验证

启动应用后，打开对话窗口，在控制台应该看到：

```
正在初始化 AI 引擎...
AI 引擎初始化成功: Claude (CClaude)
✅ AI 引擎可用
```

**如果看到 "❌ AI 引擎不可用"：**

1. 检查网络连接
2. 检查 API Key 是否正确
3. 尝试访问 https://cclaude.cc/ 确认服务可用

## 📝 常见问题

### Q: 还能用 OpenClaw 吗？

A: 可以！OpenClaw 引擎仍然保留。如果需要使用：

编辑 `src/ai/config.ts`：

```typescript
export const openclawConfig: AIEngineConfig = {
  provider: 'openclaw',
  enabled: true,  // 改为 true
  // ...
};
```

然后在 `src/windows/chat.tsx` 中：

```typescript
import { openclawConfig } from '../ai/config';
const engine = aiManager.registerEngine(openclawConfig);
aiManager.setDefaultEngine('openclaw');
```

### Q: 如何切换模型？

A: 在对话窗口点击设置按钮（⚙️），选择不同的模型。

### Q: Token 统计准确吗？

A: 非流式响应返回的是 API 提供的精确 Token 数。流式响应的 Token 数也由 API 返回，非常准确。

### Q: 可以添加其他 AI 引擎吗？

A: 可以！参考 `ClaudeEngine.ts` 的实现方式，创建新的引擎类即可。

## 🎉 总结

现在你的桌面宠物应用：

- ✅ **完全自包含** - 不需要外部进程
- ✅ **开箱即用** - 一键启动
- ✅ **性能更好** - 减少了中转延迟
- ✅ **更易维护** - 代码更简洁

马上试试吧！🦞
