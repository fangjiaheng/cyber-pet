# 📊 项目当前状态 (2026-03-10)

## ✅ 当前技术方案

### 动画系统：SWF + Ruffle（单例模式）
项目使用 SWF + Ruffle 方案播放原版 QQ 宠物动画，PNG Sprite Sheet 方案已废弃。

**Ruffle 单例设计**：
- 全局只创建一次 player，存储在 `window.__rufflePlayer` 上（热重载安全）
- 切换动画只调 `player.load()`，不销毁重建
- 切换时截取当前帧覆盖，防止空白闪烁
- 单例不随 React 组件卸载而销毁，企鹅始终可见

**核心文件**：
- `src/renderer/components/RufflePlayer.tsx` - Ruffle 播放器（单例）
- `src/renderer/components/SwfGallery.tsx` - SWF 动画画廊（测试用）
- `src/renderer/App.tsx` - 主应用

### 素材路径
- **企鹅 GG（102）**：`/assets/swf_original/102/`，共 235 个 SWF 文件
- **待机动画**：`1020000141.swf`（循环）
- **进场动画**：`1020110141.swf`（单次，播完自动回待机）

---

## 🎯 功能状态

### ✅ 已完成

#### 核心交互
- [x] 桌面宠物拖拽移动
- [x] 窗口点击穿透（鼠标在企鹅/功能区外可穿透到底层窗口）
- [x] 悬浮/点击企鹅显示功能区（3秒后自动隐藏）
- [x] 宠物状态系统（饥饿、清洁、心情、精力、自动衰减）
- [x] 对话气泡
- [x] 右键菜单
- [x] 透明背景

#### 动画系统
- [x] Ruffle 单例播放器（热重载安全，存储在 window 上）
- [x] 截帧覆盖防闪烁（二次加载起效，首次加载跳过）
- [x] 非循环动画播完自动回待机（metadata 估算时长）
- [x] 启动时播放进场动画（1.5s 后触发），播完回待机
- [x] 动画画廊（9个分类，136个动画，测试用）
- [x] 喂养下拉菜单（5种吃喝动画）
- [x] 聊天时隐藏企鹅（`display:none` 不卸载组件，保留 Ruffle 单例）

#### AI 助手
- [x] AI 聊天窗口（未配置时显示 API 配置引导）
- [x] AIConfigForm 组件（独立引导 + 嵌入设置面板两种模式）
- [x] 对话历史持久化（自动保存/加载）
- [x] 流式响应（逐字显示）
- [x] 微信风格布局（用户右绿，AI左白）
- [x] Enter 发送 / Shift+Enter 换行
- [x] 聊天时窗口放大至 900×820，关闭后恢复 450×700
- [x] 多任务类型（对话、邮件、代码审查等）

#### 功能按钮区
- 🦞 AI 助手
- 🎬 动画画廊
- 🍖 喂养（下拉选择动画）
- ✅ 签到

### ⚠️ 已知问题

**SWF 切换闪烁**：
- `load()` 时 Ruffle 的 WebAssembly canvas 会短暂重置，出现空白帧
- 已用截帧覆盖（canvas.toDataURL）部分缓解，但仍有轻微闪烁
- 首次加载不截帧（canvas 此时为空白）
- 根本解决需要 Ruffle 官方支持 preload API，暂无

**动画时长估算不精确**：
- 用 `metadata.frameCount / frameRate` 估算，有时不准
- 部分动画会提前或延迟触发 onEnd（自动回待机）

### ❌ 已废弃
- PNG Sprite Sheet 方案（QQPenguinSprite / QQPenguin / QQPenguinPlaceholder）
- 鼠标跟随 SWF 切换（每次 load 都闪烁，无法规避）
- 动作测试下拉菜单（🎮 按钮已移除）

---

## 📂 关键文件

```
src/
├── renderer/
│   ├── App.tsx                        # 主应用入口
│   ├── aiInit.ts                      # AI 初始化（从存储读配置）
│   ├── components/
│   │   ├── RufflePlayer.tsx           # ⭐ Ruffle 单例播放器
│   │   ├── SwfGallery.tsx             # 动画画廊（测试用）
│   │   ├── AIConfigForm.tsx           # AI 配置表单（可复用）
│   │   ├── PetBubble.tsx              # 对话气泡
│   │   ├── ContextMenu.tsx            # 右键菜单
│   │   └── Toast.tsx                  # 提示条
│   └── stores/petStore.ts             # 宠物状态（Zustand）
└── components/
    └── ChatWindow.tsx                 # AI 聊天窗口

public/assets/swf_original/102/       # 企鹅 GG 原版 SWF（235个）
```

---

## 📋 待办

1. **动画时长精确化**：手动建立 SWF → 时长映射表
2. **清洁/玩耍/休息按钮**：接入对应 SWF（目前只改状态值，没有动画）
3. **状态反馈动画**：饥饿/心情差时自动播对应情绪动画
4. **风筝入场动画**：确认候选文件（1025010141.swf / 10250.swf）

---

## 🔄 开发

```bash
npm run dev      # 启动开发模式
npm run build    # 构建
rm -rf node_modules/.vite && npm run dev  # 清缓存重启
```

**最后更新**：2026-03-10
**状态**：✅ 稳定
**技术栈**：React + Electron + Ruffle + TypeScript + Claude AI
