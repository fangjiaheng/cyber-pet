# ✅ Ruffle WASM 加载问题 - 最终修复

## 问题根源

Ruffle 在运行时需要动态加载 WebAssembly (.wasm) 文件和额外的 JavaScript 模块。之前的代码在 Ruffle 脚本加载**之后**才设置 `publicPath` 配置，导致 Ruffle 初始化时不知道从哪里加载这些资源文件。

## 修复方案

### 修改了 `src/renderer/components/RufflePlayer.tsx`

**关键改动**：在加载 ruffle.js 脚本**之前**就设置 publicPath 配置

```typescript
// ❌ 之前的做法（太晚了）
if (!window.RufflePlayer) {
  // 先加载脚本
  await loadScript('/ruffle/ruffle.js')
  // 然后设置配置 ← 这时候 Ruffle 已经初始化完了，来不及了
  window.RufflePlayer.config = { publicPath: '/ruffle/' }
}

// ✅ 现在的做法（正确时机）
if (!window.RufflePlayer) {
  // 先设置配置
  window.RufflePlayer = {
    config: {
      publicPath: '/ruffle/',  // ← Ruffle 初始化时会读取这个配置
    }
  }
  // 再加载脚本
  await loadScript('/ruffle/ruffle.js')
}
```

## 文件清单

确认以下文件都已就位：

```bash
public/ruffle/
├── ruffle.js                              # 57KB - 主加载器
├── 0969fd45808c3fde8c69.wasm             # 5.8MB - WebAssembly 二进制
├── a4f32523a40b35e398c1.wasm             # 5.7MB - WebAssembly 二进制
├── core.ruffle.6d36bc2096814d47c13c.js   # 34KB - 核心模块
└── core.ruffle.b48d89bb372e71bc6d86.js   # 34KB - 核心模块
```

## 测试步骤

1. **重启开发服务器**
   ```bash
   npm run dev
   ```

2. **打开浏览器控制台**（F12）

3. **打开动画画廊**
   - 鼠标移到企鹅上
   - 点击 🎬 按钮

4. **测试播放动画**
   - 点击"常规动作" → "动作1"
   - 查看控制台，应该不再有 WASM 错误
   - 底部播放器应该能正常显示企鹅动画

## 预期结果

### ✅ 成功标志
- 控制台无 "Failed to load Ruffle WASM" 错误
- 控制台显示 "New Ruffle instance created"
- 企鹅动画正常播放
- 可以切换不同分类和动画

### ❌ 如果还有问题
检查以下内容：

1. **文件路径**
   ```bash
   # 确认文件存在且可访问
   curl http://localhost:5173/ruffle/ruffle.js -I
   curl http://localhost:5173/ruffle/0969fd45808c3fde8c69.wasm -I
   ```

2. **开发服务器配置**
   - 确认 Vite 正确提供 public/ 目录下的静态文件
   - 检查是否有 CORS 或 MIME 类型问题

3. **浏览器兼容性**
   - 确认浏览器支持 WebAssembly
   - 打开 chrome://flags 检查 WebAssembly 是否启用

## 技术说明

### Ruffle 加载流程

1. **初始化阶段**（第一次加载 ruffle.js）
   ```
   window.RufflePlayer.config 被读取
   ↓
   设置内部 webpack publicPath
   ↓
   准备动态加载模块
   ```

2. **播放阶段**（调用 player.load(swfUrl)）
   ```
   根据 SWF 复杂度选择 WASM 版本
   ↓
   使用 publicPath 构建 WASM 文件 URL
   ↓
   fetch('/ruffle/0969fd45808c3fde8c69.wasm')
   ↓
   编译并运行 Flash 内容
   ```

### 为什么需要在加载前设置配置

Ruffle 的 `ruffle.js` 是一个 webpack 打包的模块。当脚本执行时，它会：
1. 读取 `window.RufflePlayer.config.publicPath`
2. 设置 webpack 的 `__webpack_require__.p` 变量
3. 后续所有动态 import 都基于这个路径

如果配置在脚本加载后设置，webpack 的 `__webpack_require__.p` 已经被设置为默认值（空字符串或当前页面路径），再修改 config 也无效了。

## 修改历史

- ❌ 尝试 1: 使用 CDN `@ruffle-rs/ruffle` - 被墙超时
- ❌ 尝试 2: 本地文件但只复制 ruffle.js - 缺少 WASM
- ❌ 尝试 3: 复制所有文件但配置太晚 - publicPath 未生效
- ✅ 尝试 4: **在脚本加载前设置配置** - 应该能解决！

## 总结

这次修复的核心是**时机**问题：
- Ruffle 需要在初始化时就知道资源路径
- 必须在加载脚本**之前**设置配置
- 现在代码已经调整到正确顺序

重启项目后应该能正常播放 Flash 动画了！🎉
