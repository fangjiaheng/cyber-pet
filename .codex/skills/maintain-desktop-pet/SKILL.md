---
name: maintain-desktop-pet
description: 维护和扩展这个基于 Electron + React + Ruffle 的桌面宠物原型项目。在此仓库中处理动画播放、悬浮窗口布局、任务送礼逻辑、本地 AI 聊天与配置、持久化存储，以及相关的 renderer/main/shared 改动时使用。尤其适合在用户现象与实际文件之间快速定位、选择正确验证命令，以及避免 `player.swf` 播放列表控制、气泡锚点和每日 `06:00` 任务刷新等回归问题时使用。
---

# 维护桌面宠物项目

## 首要原则
用中文回复, 修改一些文字信息内容也使用中文
如果当前是在 Windows 环境下开发，优先查看 `D:\QQPetSource` 中原始项目的实现方式，并尽量沿用原先的实现思路、交互结构和技术路径。只有在原实现不适用、无法迁移或无法满足当前仓库约束时，才改用其他实现方式。

## 概述

当你要修改这个仓库中的产品行为时，优先使用这个 skill，而不是每次重新摸索文件结构。

把根目录文档视为当前事实来源：

- `README.md`
- `PROJECT_STATUS.md`
- `TODO.md`
- `CHANGELOG.md`

只有在根目录文档不足以支撑当前任务时，才去读取 `docs/` 下的历史文档。

## 遵循这些仓库规则

- 保持当前项目定位：这是一个基于旧 QQ 宠物素材做验证的本地原型，不是可直接发布的成品。
- 规则类改动优先放到 `src/shared/`，不要在 renderer 里重复实现。
- 预期旧代码和旧字符串里仍然有历史乱码。实际修改到相关区域时可以顺手修复，但不要把乱码继续带进新代码。
- 保持改动收敛。renderer 主壳已经比较密集，变更一旦变复杂，优先抽逻辑，不要继续堆更多临时定时器和重复状态。
- 如果用户可见行为来自共享纯逻辑模块，改动后同步补或更新测试。

## 起步顺序

在做较大改动前，先读 [`references/repo-map.md`](references/repo-map.md)。它包含：

- 从用户请求快速定位到相关文件的路径
- 这个仓库的验证矩阵
- 当前高风险热点和回归边界

## 常见改动路由

### 动画播放或 SWF 不对

优先读这些文件：

- `src/renderer/App.tsx`
- `src/renderer/components/RufflePlayer.tsx`
- `src/renderer/components/PlayerSwfProbePanel.tsx`
- `src/renderer/utils/swfPlaylist.ts`
- `src/renderer/utils/penguin102OriginalPlaylists.ts`

注意点：

- 应用会常驻加载 `player.swf`，通过 `setid()` 和 `loadlists()` 切动作
- playlist 的归一化和拼接应放在 `swfPlaylist.ts`，不要散落在各个按钮回调里
- `RufflePlayer.tsx` 目前仍依赖轮询等待就绪，这里改动会影响启动稳定性

### 窗口尺寸、锚点漂移、气泡位置、下拉面板定位

优先读这些文件：

- `src/shared/petWindowLayout.ts`
- `src/shared/windowSizes.ts`
- `src/renderer/App.tsx`
- `tests/petWindowLayout.test.ts`

保持 `pet` 和 `bubble` 模式使用同一个逻辑锚点。只要改了尺寸或偏移，就重新检查布局测试。

### 任务送礼、奖励规则、每日刷新、任务进度

优先读这些文件：

- `src/shared/taskGift.ts`
- `src/renderer/stores/petStore.ts`
- `src/renderer/App.tsx`
- `tests/taskGift.test.ts`

把业务规则放在 `src/shared/taskGift.ts`。store 负责消费结果，不要在 store 里再次定义时间表或奖励逻辑。

### AI 聊天、模型设置、AI 配置持久化

优先读这些文件：

- `src/ai/`
- `src/renderer/components/SettingsPanel.tsx`
- `src/components/ChatWindow.tsx`
- `src/renderer/aiInit.ts`
- `src/main/storage.ts`

### 主进程窗口行为或持久化

优先读这些文件：

- `src/main/index.ts`
- `src/main/preload.ts`
- `src/main/storage.ts`

## 验证方式

用最小但足够证明变更正确的验证集合：

- 大多数代码改动后执行 `npm run type-check`
- 修改 `src/shared/taskGift.ts`、`src/shared/petWindowLayout.ts` 或现有测试覆盖到的纯逻辑时执行 `npm run test`
- renderer 或 Electron 交互变更、需要人工确认行为时执行 `npm run dev`

如果改动涉及动画控制，开发环境里优先使用内置的 `PlayerSwfProbePanel` 验证 `player.swf` 控制桥。如果当前无法跑 GUI，要明确说明这条桥接路径没有被人工实测。

## 文档更新原则

- 只有当项目能力、边界或下一步计划真的变化时，才更新根目录文档
- 除非任务明确依赖某篇旧文档，否则不要花时间同步 `docs/` 下的全部历史文件
