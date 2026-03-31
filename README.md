# Desktop Pet

基于 Electron + React + Ruffle 的桌面宠物原型项目。

当前版本仍使用原版 QQ 宠物相关 SWF 资源做交互与动画验证，因此只适合本地学习、原型验证和技术研究，不适合直接公开分发或商业化。若要长期发布，必须先完成角色、美术、命名、音效与文案的原创化替换。

## 当前实现

- 桌面宠物常驻显示，支持拖拽、悬浮、右键菜单和透明区域穿透
- Ruffle 常驻加载 `player.swf`，通过 `setid()` + `loadlists()` 切换动作，减少整屏闪烁
- 功能区支持动画、日常、交互、任务等入口
- 喂食与清洁使用横向滚动条组件，任务使用下拉面板
- 气泡提示显示在宠物头部上方，显示气泡时不再引发宠物窗口位移
- AI 聊天窗口、AI 配置面板、本地聊天记录与设置持久化
- 宠物基础养成：饥饿、清洁、心情、精力、经验、等级、元宝
- 任务系统已接入“登录送礼 / 在线送礼”，支持本地持久化与重置

## 任务系统说明

- 入口位于 `任务`
- 登录送礼按周期发放，共 12 格
- 在线送礼按在线分钟数解锁，当前阈值为 10 / 40 / 70 / 100 / 130 / 160 / 190 / 220 分钟
- 每天早上 `06:00` 刷新在线送礼周期
- 送礼奖励当前映射到现有属性系统：经验、元宝、饥饿、清洁、心情、精力
- 任务状态保存在本地 `electron-store`

## 技术方案

### 动画播放

当前播放链路不再为每个动作单独重建播放器，而是：

1. 常驻加载 `public/player.swf`
2. 使用 `setid()` 指定角色
3. 使用 `loadlists()` 切换播放列表
4. 在 `src/renderer/utils/swfPlaylist.ts` 中做业务动作到原始 playlist 的映射
5. 对部分多段动作保留原版 playlist，避免只播放第一段

### 窗口布局

- `pet` 与 `bubble` 模式统一使用相同的锚点计算
- 气泡窗口尺寸与宠物窗口一致，避免切换时出现视觉跳位
- 右键菜单与功能区下拉菜单使用独立尺寸，但都基于统一锚点进行定位

### 本地存储

`electron-store` 当前持久化以下内容：

- 宠物状态与养成数据
- 登录送礼 / 在线送礼状态
- AI 配置
- 聊天记录
- Token 统计记录

## 测试

当前仓库包含两组基础测试：

- `tests/petWindowLayout.test.ts`
  - 验证宠物窗口与气泡窗口锚点一致，防止显示气泡时宠物位移
- `tests/taskGift.test.ts`
  - 验证登录送礼解锁与领取
  - 验证在线送礼按在线时长解锁
  - 验证 `06:00` 刷新逻辑
  - 验证登录送礼 12 天周期轮换

运行命令：

```bash
npm run type-check
npm run test
```

## 开发

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建：

```bash
npm run build
```

## 目录

```text
pet/
├─ README.md
├─ CHANGELOG.md
├─ PROJECT_STATUS.md
├─ TODO.md
├─ docs/
│  ├─ README.md
│  └─ dev/PROGRESS.md
├─ public/
│  ├─ assets/
│  ├─ player.swf
│  └─ ruffle/
├─ src/
│  ├─ main/
│  ├─ renderer/
│  ├─ shared/
│  └─ components/
└─ tests/
```

## 已知边界

- 当前资源仍直接依赖原版 QQ 宠物素材，不适合直接对外发布
- 仓库内仍有部分历史文件与少量源码注释存在乱码，需要继续清理
- 当前任务奖励采用“映射到现有属性系统”的方式，尚未接入完整道具背包

## 文档导航

- [PROJECT_STATUS.md](./PROJECT_STATUS.md)：当前实现、关键文件、已知问题
- [TODO.md](./TODO.md)：下一阶段任务列表
- [CHANGELOG.md](./CHANGELOG.md)：版本更新记录
- [docs/README.md](./docs/README.md)：文档索引
- [docs/dev/PROGRESS.md](./docs/dev/PROGRESS.md)：阶段进度记录

最后更新：2026-03-31
