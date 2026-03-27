# Desktop Pet 桌面萌宠原型

> 基于 Electron + React + Ruffle 的桌面萌宠研究原型。
> 当前版本仍使用原版 QQ 宠物 SWF 资源做交互验证，仅适合本地学习、原型测试和动画研究；如果未来要公开发布或商业化，必须先完成角色、命名、素材、音效和视觉风格的原创化替换。

## 项目简介

这个项目的目标，是把经典桌面宠物体验和现代 AI 助手结合起来，做成一个可以常驻桌面的互动角色。

当前版本已经完成了下面这条主链路：

- 宠物常驻桌面显示，可拖拽、可右键、可展开功能区
- 原版 SWF 动画通过 Ruffle 播放
- 播放器改为常驻 `player.swf`，通过 `loadlists` 切动作，切换时不再整屏闪烁
- 喂食菜单、清洁菜单改为横向滚动选择组件，动画菜单、AI 聊天、AI 配置面板已经打通
- 喂食/清洁横向条会贴着功能栏正下方展开，初始化时不再显示企鹅占位图
- 宠物状态、聊天记录、AI 配置会持久化到本地 `electron-store`

## 当前能力

### 动画系统

- 使用原版 SWF 资源作为当前验证素材
- 常驻 `/player.swf`，通过 `setid()` + `loadlists()` 切换动作
- 已接入原版 102 号企鹅的多段动作 playlist 映射，常见长动作可完整播放
- 启动时会播放进场动画，再自动回到待机
- 内置动画菜单，当前主界面可浏览 8 个分类的动作入口
- 支持开发态 `player.swf` 验证面板，用来检查控制桥是否可用

### 桌面交互

- 支持拖拽窗口移动
- 支持透明区域点击穿透
- 悬浮或点击企鹅会显示功能区
- 右键菜单会贴近宠物右下方展开，点击外部区域可关闭
- 喂食和清洁使用横向滚动选择组件（圆形图标 + 左右箭头 + tooltip），动画菜单和互动菜单使用统一的可复用下拉组件
- 喂食和清洁横向滚动条会跟随功能栏居中对齐，显示在功能区正下方
- 下拉菜单已去掉横向滚动条，避免视觉干扰
- 功能栏下方不再额外显示等级、经验、元宝、心情摘要，主界面更干净
- 对话气泡和下拉菜单会根据窗口模式动态调整展示区域

### AI 助手

- 内置聊天窗口，支持流式回复
- 支持本地保存聊天历史
- 已完成真正可用的 `AI 助手配置` 面板
- 支持配置 Base URL、API Key、默认模型
- 支持测试连接和保存后即时生效
- 设置面板和聊天窗口都支持拖动

### 养成与状态

- 饥饿、清洁、心情、精力四维状态
- 喂食、清洁、玩耍、休息等基础互动
- 喂食提供 10 种食物、清洁提供 6 种用品，通过横向滚动条选择
- 自动衰减和情绪反馈基础逻辑
- 宠物状态会自动持久化

## 当前技术方案

### 动画播放

当前播放器不再走“每个动作单独 `player.load()` 一个 SWF”的旧方案，而是：

1. 在 `RufflePlayer` 中常驻加载 `/player.swf`
2. 通过 `setid(petId)` 指定角色
3. 通过 `loadlists(playlist)` 切换动作播放列表
4. 在 `swfPlaylist.ts` 中把业务入口传入的路径转换成最终 playlist
5. 对多段动作优先按动画 id 命中原版 playlist，避免只播首段

这样做的核心收益是：

- 动画切换不会再因为整实例重建而闪屏
- 多段动作能够更接近原版完整表现
- 后续可以继续扩展动作状态机，而不用再回到“切单个 SWF”的方案

### 窗口与交互

- 主窗口是透明无边框 Electron 窗口
- 主进程通过 `setIgnoreMouseEvents` 控制穿透
- 渲染层通过 `resizeWindow` 在宠物、气泡、右键菜单、下拉菜单、聊天、设置之间切换窗口尺寸
- `main.tsx` 已移除 `StrictMode`，避免开发环境下 Ruffle 因双挂载出现异常

## 目录结构

```text
pet/
├── README.md
├── CHANGELOG.md
├── PROJECT_STATUS.md
├── TODO.md
├── docs/
│   ├── README.md
│   └── dev/PROGRESS.md
├── public/
│   ├── assets/swf_original/      # 当前验证素材
│   ├── player.swf                # 常驻控制器
│   └── ruffle/                   # Ruffle 运行时
└── src/
    ├── main/                     # Electron 主进程
    ├── components/               # 共享聊天等组件
    └── renderer/
        ├── App.tsx
        ├── main.tsx
        ├── swfData.ts
        ├── hooks/
        ├── stores/
        ├── components/
        │   ├── RufflePlayer.tsx
        │   ├── ContextMenu.tsx
        │   ├── ActionDropdownMenu.tsx
        │   ├── HorizontalScrollStrip.tsx
        │   ├── SettingsPanel.tsx
        │   ├── AIConfigForm.tsx
        │   └── PlayerSwfProbePanel.tsx
        └── utils/
            ├── swfPlaylist.ts
            └── penguin102OriginalPlaylists.ts
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

默认情况下：

- Vite 使用 `5173`
- Electron 会等待 `http://localhost:5173`

如果 `5173` 被其他项目占用，可以把渲染层改到别的端口，并同步给 Electron 设置 `VITE_DEV_SERVER_URL`。

### 构建

```bash
npm run build
```

只构建渲染层：

```bash
npm run build:renderer
```

只构建主进程：

```bash
npm run build:main
```

## 当前已知问题

- 宠物窗口拖到屏幕最顶端时，仍然会留下大约一段顶部留白，说明窗口可视区域、布局和系统工作区之间还有边界问题需要继续排查
- 当前版本仍直接使用原版角色和动画资源，不适合公开收费、公开分发或商业化
- 少量动作虽然已经能完整播放，但业务层的“动作开始/结束/回待机”管理仍有进一步收敛空间

## 商业化与版权边界

这部分是当前文档里必须明确写清楚的边界：

- 当前版本仍属于“原版素材验证原型”
- 只把收费改成“打赏”并不能解决版权、商标和混淆风险
- 如果后续要走长期产品路线，建议先完成“去 Q 宠化 / 原创化”
- 在原创角色和原创资产完成前，不建议把当前版本作为正式商业产品运营

## 文档导航

- [PROJECT_STATUS.md](./PROJECT_STATUS.md)：当前实现、关键文件、已知问题
- [TODO.md](./TODO.md)：下一阶段任务清单
- [CHANGELOG.md](./CHANGELOG.md)：版本更新记录
- [docs/README.md](./docs/README.md)：文档索引和历史文档说明
- [docs/dev/PROGRESS.md](./docs/dev/PROGRESS.md)：开发阶段进度记录

## 备注

- 当前主文档以根目录四个文件为准：`README.md`、`PROJECT_STATUS.md`、`TODO.md`、`CHANGELOG.md`
- `docs/` 下的大量历史文档仍然保留，但部分内容反映的是旧阶段方案，阅读时请结合根目录最新文档判断

---

最后更新：2026-03-15
