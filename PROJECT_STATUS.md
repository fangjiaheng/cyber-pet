# 项目当前状态

更新时间：2026-03-27

## 当前定位

当前仓库更准确的定位是：

- 一个桌面萌宠 + AI 助手的交互原型
- 现阶段仍基于原版 QQ 宠物 SWF 资源验证动画播放和交互链路
- 主要目标是先把“桌面交互、无闪切动作、AI 对话、设置面板、状态系统”打通

因此，这个项目现在适合：

- 本地开发
- 交互验证
- 动画研究
- 后续原创萌宠产品的技术底座沉淀

它当前还不适合：

- 公开商业化
- 公开收费或接受打赏式变现
- 作为正式品牌对外发布

## 当前技术方案

### 1. 动画系统：`player.swf` + `loadlists`

当前正式动画方案已经不是旧的“切单个 SWF 文件”，而是：

- Ruffle 里常驻加载 `/player.swf`
- 通过 `setid()` 指定角色
- 通过 `loadlists()` 传入播放列表
- 主界面只维护“当前 playlist + token”这类轻量播放命令

这套方案的效果：

- 动画切换不会再因为播放器整实例重建而闪屏
- 可以更贴近原版动作逻辑
- 后续更适合接状态机和统一动作编排

### 2. 原版多段动作映射

为了让长动作不被截断，当前增加了两层处理：

- `swfPlaylist.ts`：负责路径标准化和默认 playlist 构造
- `penguin102OriginalPlaylists.ts`：保存 102 号企鹅需要显式保留的原版完整 playlist

现在播放链路会优先：

1. 把业务路径转为 `anime/...`
2. 如果传入了 `animationId`，优先按 id 命中原版特殊 playlist
3. 命不中时，再走默认规则：
   - 单动作后接待机
   - 离场类动作后接 `anime/end.swf`
   - 已经是逗号分隔的 playlist 则直接使用

这一步已经解决了“看书 / 来信 / 记笔记 / 瞌睡 / 靠窗 / 行走”等多段动作只播放首段的问题。

### 3. 窗口与交互

当前窗口方案如下：

- 主窗口是透明无边框 Electron 窗口，默认尺寸 360×420
- 宠物始终保持在同一 CSS 位置 (x=130, y=232)，所有模式（气泡、下拉菜单、右键菜单）统一使用 `padding: 148px 20px 16px` 和 `align-items: flex-start`
- 气泡出现/消失不触发任何窗口大小或位置变化，彻底消除模式切换时的视觉跳动
- 右键菜单固定在宠物右下附近展开
- 点击外部、按 `Escape` 或窗口失焦都会关闭右键菜单
- 喂食和清洁使用 `HorizontalScrollStrip` 横向滚动选择组件（圆形图标 + 左右箭头 + tooltip）
- 喂食和清洁横向滚动条会跟随功能栏位置，固定显示在功能区正下方
- 治疗、学习、打工、旅行等仍使用 `ActionDropdownMenu` 下拉菜单
- 动画菜单使用统一的 `ActionDropdownMenu` 组件
- 下拉菜单是透明、无边框的旧式风格，并已去掉横向滚动条
- 功能栏下方已去掉等级、经验、元宝、心情等状态摘要，避免浮层信息过密
- 主窗口会在宠物、右键菜单、下拉菜单、聊天、设置之间动态调整尺寸
- 初始窗口位置在屏幕右下角
- 动画播放时设置 `penguinAction` 阻止鼠标凝视系统打断动画
- 动作播放不再显示 bubbleText（签到除外）

### 4. AI 助手配置

设置面板已经从占位入口变成真正可用的配置界面：

- 名称统一为 `AI 助手配置`
- 支持查看当前配置概览
- 支持编辑 Base URL、API Key、默认模型
- 支持测试连接
- 保存后会立即重新初始化 AI 引擎
- 配置保存在本地 `electron-store`

### 5. 开发态稳定性

开发态为避免 Ruffle 双挂载干扰，当前：

- `src/renderer/main.tsx` 不再包裹 `React.StrictMode`
- 播放器逻辑保持常驻，不随聊天/设置切换而销毁
- 初始化阶段不再渲染临时企鹅占位图，避免真实 SWF 加载前出现额外视觉噪音

## 已完成能力

### 核心交互

- [x] 透明无边框桌宠窗口
- [x] 宠物拖拽移动
- [x] 透明区域点击穿透
- [x] 悬浮/点击宠物显示功能区
- [x] 右键菜单
- [x] 点击外部关闭右键菜单
- [x] 对话气泡

### 动画系统

- [x] Ruffle 播放原版 SWF
- [x] `/player.swf` 控制桥接入
- [x] `loadlists` 正式接入主播放链路
- [x] 无闪切动作
- [x] 原版多段 playlist 映射
- [x] 启动进场动画
- [x] 动画下拉菜单
- [x] 喂食横向滚动选择组件（HorizontalScrollStrip）
- [x] 清洁横向滚动选择组件
- [x] 开发态 `player.swf` 验证面板

### AI 助手

- [x] 聊天窗口
- [x] 聊天窗口可拖动
- [x] 聊天历史持久化
- [x] 流式回复
- [x] `AI 助手配置` 面板
- [x] Base URL / API Key / 模型配置
- [x] 测试连接
- [x] 设置面板可拖动

### 状态与存储

- [x] 饥饿、清洁、心情、精力四维状态
- [x] 自动衰减
- [x] 基础互动：喂食、清洁、玩耍、休息
- [x] 本地持久化存储

## 当前已知问题

### 1. 原版素材带来的发布风险

当前仓库仍直接使用原版角色和动画资源，因此：

- 只适合本地研究和原型验证
- 不建议公开收费、公开打赏或直接商业化
- 若要长期运营，需要先完成原创化替换

### 2. 业务层动作状态机仍可继续收敛

虽然播放链路已经切到 `loadlists`，但部分按钮仍在业务层使用定时器回收状态。
后续如果要做更稳的自动回待机和状态调度，建议继续把动作状态机从 `App.tsx` 中抽离。

## 关键文件

```text
src/
├── main/
│   ├── index.ts                         # Electron 主进程窗口与 IPC
│   └── storage.ts                       # electron-store 持久化
├── shared/
│   ├── windowSizes.ts                   # 各模式窗口尺寸常量
│   └── petWindowLayout.ts              # 宠物锚点计算（所有模式统一）
├── components/
│   └── ChatWindow.tsx                   # AI 聊天窗口
└── renderer/
    ├── App.tsx                          # 主应用和菜单/播放入口
    ├── App.css                          # 统一布局（padding 148px, flex-start）
    ├── main.tsx                         # 渲染入口（无 StrictMode）
    ├── swfData.ts                       # 动画分类数据
    ├── aiInit.ts                        # AI 初始化
    ├── hooks/
    │   └── useMouseGaze.ts             # 鼠标凝视追踪（受 penguinAction 阻止）
    ├── components/
    │   ├── RufflePlayer.tsx             # 常驻 player.swf 播放器
    │   ├── PlayerSwfProbePanel.tsx      # 开发态控制桥验证面板
    │   ├── SettingsPanel.tsx            # AI 助手配置面板
    │   ├── AIConfigForm.tsx             # AI 配置表单
    │   ├── ContextMenu.tsx              # 右键菜单
    │   ├── ActionDropdownMenu.tsx       # 可复用下拉菜单
    │   ├── HorizontalScrollStrip.tsx   # 横向滚动选择组件（喂食/清洁）
    │   └── PetBubble.tsx                # 对话气泡（仅签到使用）
    └── utils/
        ├── swfPlaylist.ts               # playlist 构造规则
        └── penguin102OriginalPlaylists.ts
```

## 当前建议的下一步

建议优先级如下：

1. 继续收敛动作状态机，减少业务层分散的定时器
2. 开始准备原创化替换方案，把项目从”原版素材验证原型”过渡到”可公开发布的原创萌宠”
3. 完善签到/经验/等级系统

---

状态：可开发、可演示、可继续迭代  
不建议：直接对外商业化
