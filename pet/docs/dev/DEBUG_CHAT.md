# 调试 AI 对话窗口

## 问题
打开 AI 助手后看不到对话窗口

## 已修复
✅ 将 `chat.html` 移到项目根目录
✅ 更新了脚本引用路径
✅ 更新了 Vite 配置

## 下一步：重启应用

### 1. 停止当前的开发服务器

在终端按 `Ctrl+C` 停止 `npm run dev`

### 2. 重新启动

```bash
npm run dev
```

### 3. 测试 AI 对话窗口

方式 1：右键宠物 → 选择 "🦞 AI 助手"
方式 2：鼠标悬停宠物 → 点击 🦞 按钮

### 4. 检查浏览器控制台

打开对话窗口后，按 `Cmd+Opt+I` (Mac) 或 `Ctrl+Shift+I` (Windows/Linux) 打开开发者工具，查看：

1. **Console** 标签：
   - 应该看到 "正在初始化 AI 引擎..."
   - 应该看到 "AI 引擎初始化成功: OpenClaw Gateway"
   - 应该看到 "✅ AI 引擎可用" 或 "❌ AI 引擎不可用"

2. **Network** 标签：
   - 检查是否有加载失败的资源

### 5. 常见问题排查

#### 问题：窗口打开了但是空白

**检查：**
```bash
# 访问 chat.html 看能否加载
curl http://localhost:5173/chat.html
```

**解决：**
- 确保 Vite 开发服务器正在运行
- 检查 chat.html 中的脚本路径是否正确

#### 问题：提示 "AI 引擎不可用"

**检查：**
```bash
# 检查 OpenClaw 是否运行
curl http://localhost:8181/health
```

**解决：**
```bash
# 启动 OpenClaw Gateway
openclaw gateway
```

#### 问题：窗口创建了但在屏幕外

**解决：**
1. 关闭对话窗口
2. 在 `src/main/index.ts` 的 `createChatWindow` 函数中添加位置参数：

```typescript
chatWindow = new BrowserWindow({
  width: 600,
  height: 700,
  x: 100,  // 添加这行
  y: 100,  // 添加这行
  // ... 其他配置
});
```

### 6. 验证文件结构

确保以下文件存在：

```
pet/
├── chat.html                        ← 在根目录
├── index.html
├── src/
│   ├── windows/
│   │   ├── chat.html               ← 原始文件（可保留）
│   │   └── chat.tsx                ← 对话窗口入口
│   ├── components/
│   │   ├── ChatWindow.tsx          ← 对话组件
│   │   └── ChatWindow.css          ← 样式
│   └── ai/
│       ├── config.ts               ← AI 配置
│       └── ...
└── ...
```

### 7. 手动测试 chat.html

在浏览器中直接访问：
```
http://localhost:5173/chat.html
```

应该能看到对话窗口界面。

## 调试技巧

### 查看主进程日志

主进程的 console.log 会输出到启动 Electron 的终端。

### 查看渲染进程日志

1. 对话窗口打开后按 `Cmd+Opt+I`
2. 查看 Console 标签

### 检查 IPC 通信

在 `src/main/index.ts` 添加日志：

```typescript
ipcMain.on('chat:open', () => {
  console.log('收到打开对话窗口请求');  // 添加这行
  createChatWindow()
})
```

## 预期结果

窗口应该：
- ✅ 大小：600x700
- ✅ 标题："AI 助手 🦞"
- ✅ 背景：紫色渐变
- ✅ 显示宠物图标 🦞
- ✅ 有任务类型选择按钮
- ✅ 有输入框和发送按钮

## 如果还是看不到

请提供以下信息：

1. 终端输出（主进程日志）
2. 浏览器控制台输出（渲染进程日志）
3. 是否有任何错误消息
4. 运行 `npm run dev` 后的完整输出

我会根据这些信息进一步诊断问题。
