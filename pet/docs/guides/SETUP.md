# 桌面宠物 AI 助手设置指南

## 第一步：配置 OpenClaw Gateway

### 1. 创建 OpenClaw 配置文件

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
      "cclaude": {
        "baseUrl": "https://cclaude.cc/api",
        "apiKey": "cr_b5a70e1a2c0636052d1c64e75ae6644da47a477fd02e2f375992e81904d4b391",
        "api": "anthropic-messages",
        "models": [
          {
            "id": "claude-opus-4-5-20251101",
            "name": "Claude Opus 4.5"
          },
          {
            "id": "claude-3-5-sonnet-20241022",
            "name": "Claude 3.5 Sonnet"
          },
          {
            "id": "claude-3-5-haiku-20241022",
            "name": "Claude 3.5 Haiku"
          }
        ]
      }
    }
  }
}
```

### 2. 启动 OpenClaw Gateway

```bash
# 启动 OpenClaw Gateway
openclaw gateway

# 或使用后台运行
nohup openclaw gateway > openclaw.log 2>&1 &
```

### 3. 验证 OpenClaw 可用性

```bash
# 检查健康状态
curl http://localhost:8181/health

# 测试 API
curl -X POST http://localhost:8181/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test123" \
  -d '{
    "model": "claude-opus-4-5-20251101",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

## 第二步：配置桌面宠物应用

### 1. 创建环境变量文件

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# OpenClaw Gateway 配置
OPENCLAW_TOKEN=test123
OPENCLAW_BASE_URL=http://localhost:8181

# 开发环境
NODE_ENV=development
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动应用

```bash
# 开发模式
npm run dev

# 或单独启动各部分
npm run dev:renderer    # 启动渲染进程
npm run watch:main      # 监听主进程变化
npm run start:electron  # 启动 Electron
```

## 第三步：使用 AI 对话功能

### 打开 AI 对话窗口

有两种方式：

1. **通过宠物菜单**：右键点击宠物 → 选择 "AI 助手"
2. **通过系统托盘**：右键托盘图标 → 选择 "AI 助手"

### 对话窗口功能

1. **选择任务类型**：
   - 💬 普通对话
   - 📧 邮件整理
   - 🔍 代码审查
   - 🌐 翻译
   - 📝 内容摘要
   - 💡 创意头脑风暴

2. **选择 AI 模型**：
   - Claude Opus 4.5（最强大）
   - Claude 3.5 Sonnet（平衡）
   - Claude 3.5 Haiku（快速）

3. **发送消息**：
   - 输入消息后点击"发送"
   - 或使用快捷键：`Cmd/Ctrl + Enter`

4. **查看统计**：
   - 每条消息下方显示 Token 消耗
   - 可在设置中查看详细统计

## 常见问题排查

### Q1: 连接 OpenClaw 失败

**检查清单：**

```bash
# 1. 检查 OpenClaw 是否运行
ps aux | grep openclaw

# 2. 检查端口是否监听
lsof -i :8181

# 3. 检查配置文件
cat ~/.openclaw/openclaw.json

# 4. 查看 OpenClaw 日志
tail -f openclaw.log
```

**解决方案：**
- 确保 OpenClaw Gateway 正在运行
- 检查端口 8181 没有被占用
- 验证 token 配置正确

### Q2: AI 响应超时

**可能原因：**
- 网络连接问题
- CClaude API 服务响应慢
- 请求的内容太长

**解决方案：**

编辑 `src/ai/config.ts`：

```typescript
export const openclawConfig: AIEngineConfig = {
  // ...
  timeout: 180000,  // 增加到 180 秒
};
```

### Q3: API Key 无效

**检查：**
1. 确认 CClaude API Key 是否正确
2. 检查 OpenClaw 配置中的 apiKey
3. 尝试在浏览器中直接访问 https://cclaude.cc/

**更新 API Key：**

编辑 `~/.openclaw/openclaw.json`，更新 `models.providers.cclaude.apiKey`。

### Q4: 开发模式下页面空白

**检查：**

```bash
# 1. 确保 Vite 开发服务器运行
npm run dev:renderer

# 2. 检查 5173 端口
curl http://localhost:5173

# 3. 查看控制台错误
```

## 项目结构

```
pet/
├── src/
│   ├── ai/                      # AI 引擎适配层
│   │   ├── engines/
│   │   │   └── OpenClawEngine.ts
│   │   ├── examples/
│   │   ├── types.ts
│   │   ├── config.ts            # ← AI 配置（已包含你的 Claude 配置）
│   │   ├── AIManager.ts
│   │   └── TokenManager.ts
│   ├── components/
│   │   ├── ChatWindow.tsx       # ← AI 对话组件
│   │   └── ChatWindow.css
│   ├── windows/
│   │   ├── chat.html
│   │   └── chat.tsx
│   ├── main/
│   │   ├── index.ts             # ← Electron 主进程
│   │   └── preload.ts
│   └── renderer/
├── .env                         # ← 环境变量（需创建）
├── .env.example
└── package.json
```

## 下一步

- [ ] 自定义宠物外观
- [ ] 添加更多任务类型
- [ ] 实现宠物状态管理
- [ ] 添加本地数据持久化
- [ ] 创建设置面板

## 获取帮助

- 项目文档：`src/ai/README.md`
- 快速入门：`src/ai/QUICKSTART.md`
- OpenClaw 文档：https://openclaw.cc/
