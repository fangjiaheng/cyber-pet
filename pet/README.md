# 🐾 桌面宠物 Desktop Pet

> 致敬经典 QQ 宠物，用现代技术重现童年回忆

一个基于 Electron 和 OpenClaw 打造的桌面宠物应用，带你重温 QQ 宠物的温馨时光。宠物不仅能陪伴你，还能帮你完成各种实际工作任务。通过购买 Token 来"喂养"宠物，让它为你工作，将 AI 使用成本游戏化。

## ✨ 特性

- 🎮 **互动体验** - 点击、拖拽、喂食等多种互动方式
- 🎨 **精美动画** - 基于 OpenClaw 引擎，流畅的动作表现和可爱的表情变化
- 💝 **情感系统** - 宠物会根据互动产生不同的情绪反应
- 🎯 **桌面漫游** - 宠物可以在桌面上自由行走
- 🍖 **养成系统** - 通过购买 Token "喂养"宠物，消耗 Token 让宠物工作
- 💼 **工作助手** - 宠物可以帮你完成实际任务（整理邮件、文档处理等）
- 🤖 **多 AI 引擎** - 支持切换不同的 AI 模型（Claude Code、Gemini、国内大模型等）
- 🔑 **灵活的 Token 管理** - 支持应用内购买 Token，也支持使用自己的 API Key
- 🌙 **智能休眠** - 长时间无互动自动进入休眠状态
- 🖥️ **跨平台支持** - Windows / macOS / Linux

## 🛠️ 技术栈

- **Electron** - 跨平台桌面应用框架
- **OpenClaw** - 2D 动画引擎，提供流畅的角色动画和物理效果
- **React** - 用户界面构建
- **Canvas/WebGL** - 动画渲染
- **TypeScript** - 类型安全的开发体验
- **多 AI 引擎集成**
  - Claude Code - Anthropic 的代码助手
  - Google Gemini - Google 的多模态大模型
  - 国内大模型 - 支持通义千问、文心一言、智谱 GLM 等

## 📦 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/desktop-pet.git

# 进入项目目录
cd pet

# 安装依赖
npm install

# 启动开发模式
npm run dev
```

## 🚀 使用

```bash
# 开发模式
npm run dev

# 构建应用
npm run build

# 打包应用
npm run package
```

## 📁 项目结构

```
pet/
├── src/
│   ├── main/           # Electron 主进程
│   ├── renderer/       # 渲染进程（React）
│   ├── assets/         # 资源文件（图片、音效）
│   ├── components/     # React 组件
│   ├── utils/          # 工具函数
│   └── types/          # TypeScript 类型定义
├── public/             # 静态资源
├── build/              # 构建配置
└── package.json
```

## 🎯 开发路线

- [x] 项目初始化
- [ ] 基础窗口和透明背景
- [ ] 集成 OpenClaw 动画引擎
- [ ] 宠物精灵图和动画系统
- [ ] 拖拽和点击交互
- [ ] 桌面漫游逻辑
- [ ] 状态管理（饥饿、清洁、心情、Token 余额）
- [ ] 喂食和互动功能
- [ ] Token 管理系统
  - [ ] 应用内 Token 购买
  - [ ] 自定义 API Key 配置
  - [ ] Token 消耗追踪和显示
- [ ] AI 引擎适配层设计
- [ ] 集成 Claude Code API
- [ ] 集成 Google Gemini API
- [ ] 集成国内大模型 API（通义千问、文心一言、DeepSeek 等）
- [ ] AI 引擎切换界面
- [ ] 工作任务系统（邮件整理、文档处理等）
- [ ] 任务完成反馈和成就展示
- [ ] 设置面板
- [ ] 多宠物支持
- [ ] 数据持久化

## 🎨 设计理念

本项目致力于还原 QQ 宠物的经典体验，同时融入现代化的设计元素：

- **怀旧与创新并存** - 保留经典玩法，加入新鲜元素
- **轻量化设计** - 低资源占用，不影响日常工作
- **高度可定制** - 支持自定义宠物外观和行为

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

## 💖 致谢

感谢腾讯 QQ 宠物带给我们的美好回忆

---

**注意**: 本项目仅供学习交流使用，不用于商业用途
