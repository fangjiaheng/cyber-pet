# 📝 更新日志

所有重要的项目变更都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [0.2.0] - 2026-03-06

### ✨ 新增

#### 数据持久化系统
- 添加 electron-store 依赖
- 实现 StorageManager 类
- 宠物状态自动保存和恢复
- Token 使用记录持久化（最多 1000 条）
- 对话历史持久化（最多 500 条）
- AI 设置持久化
- 统计信息查询 API
- 数据导入/导出功能
- 数据加密存储（AES-256-GCM）
- 40+ Storage IPC API

#### 存储功能
- 自动保存（防抖 1 秒）
- 启动时自动恢复宠物状态
- 存储位置：
  - macOS: `~/Library/Application Support/Electron/config.json`
  - Windows: `%APPDATA%/Electron/config.json`
  - Linux: `~/.config/Electron/config.json`

#### 文档
- 添加 PROGRESS.md - 开发进度跟踪
- 添加 STORAGE_INFO.md - 存储系统说明
- 添加 StorageViewer 组件 - 数据查看器

### 🔄 变更
- 宠物状态现在会在应用重启后保持
- Token 使用记录会自动保存

---

## [0.1.0] - 2026-03-05

### ✨ 新增

#### AI 引擎系统
- 完整的 AI 引擎适配层架构
  - BaseAIEngine 抽象基类
  - AIEngineFactory 工厂模式
  - AIManager 单例管理器
  - TokenManager Token 统计
- ClaudeEngine 实现
  - 直接调用 Claude API（通过 cclaude.cc）
  - 支持 3 个模型（Opus 4.5, Sonnet, Haiku）
  - 流式和非流式响应
  - 精确 Token 计数
  - 成本估算
- OpenClawEngine 实现（可选）
  - 兼容 OpenAI API 格式
  - 支持 OpenClaw Gateway

#### AI 对话功能
- AI 对话窗口集成到主窗口
- 在宠物下方展开/收起
- 6 种任务类型
  - 💬 普通对话
  - 📧 邮件整理
  - 🔍 代码审查
  - 🌐 翻译
  - 📝 内容摘要
  - 💡 创意头脑风暴
- AI 模型选择（3 种 Claude 模型）
- 流式实时响应
- Token 使用统计显示
- 消息历史记录
- 美观的紫色渐变 UI
- 打字动画效果
- 快捷键支持（Cmd/Ctrl + Enter）

#### 文档
- 添加 AI 引擎详细文档
- 添加快速入门指南
- 添加使用示例
- 添加配置说明

### 🔧 修复
- 修复浏览器环境 `process is not defined` 错误
- 修复环境变量读取问题（改用 Vite 的 `import.meta.env`）
- 修复对话窗口无法显示的问题

### 🔄 变更
- 主窗口尺寸调整为 450x700
- 不再使用独立的对话窗口
- AI 配置使用 Claude 直接调用，不依赖 OpenClaw Gateway

---

## [0.0.1] - 2026-03-04

### ✨ 新增

#### 基础框架
- Electron 应用框架搭建
- 透明无边框窗口
- 窗口拖拽功能
- 屏幕边界检测
- React 18 + TypeScript
- Vite 开发环境

#### 宠物系统
- 宠物状态管理（Zustand）
  - 饥饿值（0-100）
  - 清洁值（0-100）
  - 心情值（0-100）
  - 能量值（0-100）
- 互动功能
  - 🍖 喂食
  - 🚿 清洁
  - 🎮 玩耍
  - 💤 休息
- 自动衰减系统
- 情绪系统（happy, sad, angry, tired, hungry, neutral）

#### UI 组件
- 右键上下文菜单
- Toast 提示消息
- 悬停功能区（4 个快捷按钮）

#### 文档
- README.md
- REQUIREMENTS.md - 完整需求文档
- package.json 配置

### 🎯 初始功能
- 宠物显示（表情符号）
- 基础交互
- 状态管理
- 自动衰减

---

## 版本说明

### 版本号格式
- **主版本号**: 重大架构变更或不兼容的 API 变更
- **次版本号**: 向后兼容的功能性新增
- **修订号**: 向后兼容的问题修正

### 发布周期
- **开发版**: 每完成一个功能模块
- **测试版**: 每完成一个开发阶段
- **正式版**: 所有计划功能完成并稳定运行

---

## 路线图

### v0.3.0 (计划中)
- 设置面板
- Token 可视化
- 对话历史集成
- 系统托盘完善

### v0.4.0 (计划中)
- 动画系统
- 桌面漫游
- 通知系统

### v0.5.0 (计划中)
- 皮肤系统
- 成就系统
- 任务模板

### v1.0.0 (目标)
- 完整功能
- 稳定运行
- 用户文档完善
- 准备发布

---

**最后更新**: 2026-03-06
