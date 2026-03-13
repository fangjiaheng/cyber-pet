# 🦞 桌面宠物 AI 助手 - 快速开始

## 🎯 已完成的功能

✅ AI 引擎适配层基础架构
✅ OpenClaw Gateway 集成
✅ Claude API 配置（通过 cclaude.cc）
✅ AI 对话窗口界面
✅ 6 种任务类型（普通对话、邮件整理、代码审查、翻译、摘要、头脑风暴）
✅ 3 种 Claude 模型选择（Opus 4.5、Sonnet、Haiku）
✅ Token 使用统计
✅ 流式响应支持

## 📋 前置条件

### 1. 安装 OpenClaw

```bash
# 通过 npm 安装（如果可用）
npm install -g openclaw

# 或从 GitHub 下载
# https://github.com/openclaw/openclaw
```

### 2. 配置 OpenClaw Gateway

创建或编辑 `~/.openclaw/openclaw.json`：

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

### 3. 启动 OpenClaw Gateway

```bash
# 前台启动
openclaw gateway

# 或后台启动
nohup openclaw gateway > openclaw.log 2>&1 &
```

验证 OpenClaw 运行：

```bash
# 检查健康状态
curl http://localhost:8181/health

# 应该返回 OK 或类似的成功响应
```

## 🚀 启动桌面宠物应用

### 1. 安装依赖

```bash
npm install
```

### 2. 检查环境变量

`.env` 文件已创建，内容如下：

```env
OPENCLAW_TOKEN=test123
OPENCLAW_BASE_URL=http://localhost:8181
NODE_ENV=development
```

### 3. 启动开发服务器

```bash
npm run dev
```

这会同时启动：
- Vite 开发服务器（端口 5173）
- TypeScript 编译监听
- Electron 应用

## 💬 使用 AI 对话功能

### 方式 1：通过悬停菜单

1. 鼠标悬停在桌面宠物上
2. 点击出现的 🦞 按钮
3. AI 对话窗口会打开

### 方式 2：通过右键菜单

1. 右键点击桌面宠物
2. 选择 "🦞 AI 助手"
3. AI 对话窗口会打开

### 对话窗口功能

#### 1. 选择任务类型

点击设置按钮（⚙️）展开设置面板，选择任务类型：

- 💬 **普通对话** - 日常聊天
- 📧 **邮件整理** - 自动提取邮件关键信息
- 🔍 **代码审查** - 分析代码质量和安全问题
- 🌐 **翻译** - 专业翻译服务
- 📝 **内容摘要** - 快速总结长文本
- 💡 **创意头脑风暴** - 生成创意想法

#### 2. 选择 AI 模型

- **Claude Opus 4.5** - 最强大，适合复杂任务
- **Claude 3.5 Sonnet** - 平衡性能和速度
- **Claude 3.5 Haiku** - 快速响应，适合简单任务

#### 3. 发送消息

- 输入消息后点击"发送"
- 或使用快捷键：`Cmd/Ctrl + Enter`
- 支持流式响应，实时查看 AI 生成的内容

#### 4. 查看 Token 统计

每条消息下方显示 Token 消耗量，帮助你管理使用成本。

## 🗂️ 项目结构

```
pet/
├── src/
│   ├── ai/                          # AI 引擎适配层 ⭐
│   │   ├── engines/
│   │   │   └── OpenClawEngine.ts    # OpenClaw 引擎实现
│   │   ├── examples/                # 示例代码
│   │   ├── types.ts                 # 类型定义
│   │   ├── config.ts                # AI 配置 ⭐
│   │   ├── BaseAIEngine.ts          # 引擎基类
│   │   ├── AIManager.ts             # AI 管理器
│   │   ├── TokenManager.ts          # Token 统计
│   │   └── README.md                # 详细文档
│   │
│   ├── components/
│   │   ├── ChatWindow.tsx           # AI 对话组件 ⭐
│   │   └── ChatWindow.css           # 对话窗口样式
│   │
│   ├── windows/
│   │   ├── chat.html                # 对话窗口 HTML
│   │   └── chat.tsx                 # 对话窗口入口
│   │
│   ├── main/
│   │   ├── index.ts                 # Electron 主进程 ⭐
│   │   └── preload.ts               # Preload 脚本
│   │
│   └── renderer/
│       ├── App.tsx                  # 宠物主应用 ⭐
│       └── ...
│
├── .env                             # 环境变量 ⭐
├── SETUP.md                         # 详细设置指南
└── package.json
```

## 🔧 常见问题

### Q1: OpenClaw 连接失败

**症状**：对话窗口显示连接错误

**解决方案**：

1. 检查 OpenClaw 是否运行：
   ```bash
   ps aux | grep openclaw
   ```

2. 检查端口 8181 是否监听：
   ```bash
   lsof -i :8181
   ```

3. 查看 OpenClaw 日志：
   ```bash
   tail -f openclaw.log
   ```

4. 重启 OpenClaw：
   ```bash
   killall openclaw
   openclaw gateway
   ```

### Q2: 对话窗口无法打开

**解决方案**：

1. 打开开发者工具查看错误（Cmd/Ctrl + Shift + I）
2. 检查 `src/main/index.ts` 中的 `createChatWindow` 函数
3. 确保 Vite 开发服务器正在运行

### Q3: AI 响应超时

**解决方案**：

编辑 `src/ai/config.ts`，增加超时时间：

```typescript
export const openclawConfig: AIEngineConfig = {
  // ...
  timeout: 180000,  // 增加到 180 秒
};
```

### Q4: Token 统计不准确

流式响应的 Token 是估算的。如需精确统计，使用非流式响应。

## 📚 相关文档

- **AI 引擎详细文档**：`src/ai/README.md`
- **快速入门指南**：`src/ai/QUICKSTART.md`
- **完整设置指南**：`SETUP.md`
- **OpenClaw 官方文档**：https://openclaw.cc/

## 🎮 测试示例

### 测试普通对话

```
问题：介绍一下你自己
```

### 测试邮件整理

```
任务类型：📧 邮件整理

输入：
发件人：张三 <zhangsan@example.com>
主题：项目进度汇报

你好，

上周的开发工作已经完成，本周计划进行测试。
请安排时间review代码。

谢谢。
```

### 测试代码审查

```
任务类型：🔍 代码审查

输入：
function add(a, b) {
  return a + b
}
```

### 测试翻译

```
任务类型：🌐 翻译

输入：
今天天气真不错，适合出去散步。
```

## 🚧 后续开发计划

- [ ] 添加对话历史保存
- [ ] 实现多轮对话上下文管理
- [ ] 添加更多 AI 引擎（OpenAI、Gemini 等）
- [ ] 实现宠物状态影响 AI 行为
- [ ] 添加语音输入支持
- [ ] 实现任务模板管理
- [ ] 添加数据导出功能

## 💡 提示

1. **第一次使用**：建议先用 Claude 3.5 Haiku 测试，速度快
2. **复杂任务**：使用 Claude Opus 4.5，效果最好
3. **成本控制**：查看 Token 统计，合理选择模型
4. **快捷键**：记住 `Cmd/Ctrl + Enter` 快速发送

## 🤝 获取帮助

遇到问题？

1. 查看 `SETUP.md` 详细设置指南
2. 查看 `src/ai/README.md` AI 引擎文档
3. 检查控制台错误信息
4. 查看 OpenClaw 日志

---

**开始享受你的 AI 助手吧！🦞**
