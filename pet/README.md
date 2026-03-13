# 🐾 QQ 宠物桌面版 Desktop Pet

> 致敬经典 QQ 宠物，用现代技术重现童年回忆

基于 Electron + React + Ruffle 打造的桌面宠物应用，使用**原版 Flash (SWF) 动画**，完美还原 QQ 宠物的经典体验。宠物不仅能陪伴你，还能通过 AI 助手帮你完成各种任务。

## ✨ 特性

### 🎮 原版动画体验
- 🎮 **原汁原味** - 使用原版 SWF 动画，完美还原 QQ 宠物动作和音效
- 🎨 **精美动画** - 基于 Ruffle 引擎播放 Flash 动画，流畅自然
- 🎬 **动画画廊** - 浏览和测试所有原版动画
- 🍖 **喂养下拉菜单** - 6种吃喝动作（吃饭1/2/3、喝水1/2/3）

### 🤖 智能AI助手
- 🤖 **Claude AI 集成** - 基于 Claude Opus 4.5 的智能对话
- 💬 **微信风格聊天** - 用户消息右侧绿色，AI回复左侧白色
- 💾 **对话记忆** - 自动保存/加载历史对话，最多500条
- ⚡ **快捷操作** - Enter 发送，Shift+Enter 换行
- 📊 **多任务类型** - 对话、邮件整理、代码审查、翻译等

### 🎯 桌面交互
- 🎯 **桌面漫游** - 宠物可以在桌面上自由拖拽移动
- 👆 **点击穿透** - 边框外区域可点击到后面的应用
- 🖱️ **悬浮/点击触发** - 悬浮或点击企鹅显示功能区
- 📐 **窗口动态调整** - 打开聊天时窗口自动放大

### 💝 养成系统
- 💝 **情感系统** - 饥饿、清洁、心情、精力四维状态系统
- 🍖 **互动养成** - 喂食、洗澡、玩耍、休息等多种互动
- 💭 **对话气泡** - 企鹅表达情感和反馈
- 🖥️ **跨平台** - Windows / macOS / Linux

## 🛠️ 技术栈

- **Electron** - 跨平台桌面应用框架
- **React** - 用户界面构建
- **Ruffle** - WebAssembly Flash 播放器
- **TypeScript** - 类型安全开发
- **Zustand** - 轻量级状态管理
- **Claude API** - AI 对话助手

## 🎯 当前状态

✅ **已完成核心功能**

**窗口交互**
- [x] 基础窗口和透明背景
- [x] 宠物拖拽移动
- [x] 窗口点击穿透（边框外可点击后面应用）
- [x] 悬浮/点击企鹅显示功能区
- [x] 窗口动态调整大小（聊天时自动放大）

**动画系统**
- [x] SWF 动画播放系统（Ruffle）
- [x] 动画画廊（分类浏览）
- [x] 喂养下拉菜单（6种吃喝动作）

**AI 助手**
- [x] AI 聊天助手（Claude Opus 4.5）
- [x] 对话历史记忆存储（自动保存/加载）
- [x] 微信风格聊天布局
- [x] Enter 发送快捷键

**养成系统**
- [x] 四维状态系统（饥饿、清洁、心情、精力）
- [x] 基础交互（喂食、清洁、玩耍、休息）
- [x] 对话气泡
- [x] 右键菜单
- [x] 数据持久化

📝 **详细文档**
- 📊 [项目状态](./PROJECT_STATUS.md) - 最新状态和技术方案
- 📚 [文档索引](./docs/README.md) - 完整文档导航
- ✅ [待办事项](./TODO.md) - 开发计划

## 📦 快速开始

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/yourusername/desktop-pet.git
cd pet

# 安装依赖
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
# 构建主进程
npm run build:main

# 打包应用
npm run package
```

## 📁 项目结构

```
pet/
├── README.md                    # 本文件
├── PROJECT_STATUS.md            # 📊 项目当前状态
├── TODO.md                      # ✅ 待办事项
├── CHANGELOG.md                 # 📝 版本记录
├── docs/                        # 📚 完整文档
│   ├── README.md               # 文档索引
│   ├── guides/                 # 开发指南
│   ├── implementation/         # 技术实现
│   ├── fixes/                  # 问题修复
│   ├── tutorials/              # 使用教程
│   └── dev/                    # 开发调试
├── src/
│   ├── main/                   # Electron 主进程
│   ├── renderer/               # React 渲染进程
│   │   ├── components/        # React 组件
│   │   │   ├── RufflePlayer.tsx      # Ruffle 播放器
│   │   │   ├── SwfGallery.tsx        # 动画画廊
│   │   │   ├── PetBubble.tsx         # 对话气泡
│   │   │   └── ...
│   │   ├── stores/            # Zustand 状态管理
│   │   ├── hooks/             # React Hooks
│   │   └── App.tsx            # 主应用
│   └── components/            # 共享组件
│       └── ChatWindow.tsx     # AI 聊天窗口
└── public/
    └── assets/
        └── swf_original/      # 原版 SWF 动画素材
```

## 🎬 动画系统

项目使用**原版 QQ 宠物 SWF 文件**通过 Ruffle 播放：

- **常规动作** (chang/) - 12 个基础动作 + 拖拽、掉落等
- **饮食活动** (e/) - 吃饭、喝水、洗澡、学习、工作
- **生病状态** (bing/) - 3 种生病动画
- **特殊动作** (other/) - 入场、离开、升级、死亡
- **状态** (zt/) - 饥饿、养育状态

## 🎨 设计理念

- **原汁原味** - 使用原版素材，还原经典体验
- **现代技术** - Electron + React + WebAssembly，跨平台运行
- **轻量化** - 低资源占用，不影响日常工作
- **可扩展** - 模块化设计，易于添加新功能

## 🚧 开发路线

查看 [TODO.md](./TODO.md) 了解详细开发计划。

**近期计划**：
- [ ] AI 配置界面（API Key 设置）
- [ ] 动画时长优化（修复播放不完整问题）
- [ ] 入场动画（开场效果）
- [ ] 更多交互动作（清洁、玩耍、休息动画）
- [ ] 状态反馈动画（饥饿时自动播放饿的动画）
- [ ] 音效控制（音量、静音）

**最近完成**：
- ✅ AI 助手对话历史记忆存储
- ✅ 微信风格聊天布局
- ✅ 窗口点击穿透功能
- ✅ 喂养下拉菜单（6种动作）
- ✅ 窗口动态调整大小

## 📚 文档

- 🚀 [快速开始](./docs/guides/START_HERE.md)
- 🛠️ [开发环境配置](./docs/guides/SETUP.md)
- 📖 [动画方案对比](./docs/implementation/ANIMATION_SOLUTION_COMPARISON.md)
- 🔧 [问题修复记录](./docs/fixes/)
- 📋 [完整文档索引](./docs/README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 💖 致谢

- 感谢腾讯 QQ 宠物带给我们的美好回忆
- 感谢 Ruffle 项目让 Flash 动画重获新生

---

**注意**: 本项目仅供学习交流使用，不用于商业用途。

**重启后从这里开始**: 👉 [PROJECT_STATUS.md](./PROJECT_STATUS.md)
