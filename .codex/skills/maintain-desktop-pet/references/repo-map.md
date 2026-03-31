# 桌面宠物仓库地图

## 首要参考源

如果当前是在 Windows 环境下开发，优先查看 `D:\QQPetSource` 中原始项目的实现方式，并优先参考原先的实现思路、交互结构和技术路径。只有在原实现不适用、无法迁移，或无法满足当前仓库约束时，才考虑其他实现方式。

## 事实来源文档

优先读取：

- `README.md`：当前产品概况、常用命令、项目边界
- `PROJECT_STATUS.md`：当前架构摘要和关键文件
- `TODO.md`：当前优先级和技术债
- `CHANGELOG.md`：最近的项目级变更

除非和根目录文档一致，否则默认 `docs/` 里的旧材料可能反映的是更早阶段。

## 架构速览

- `src/main/`：Electron 主进程、窗口生命周期、IPC 接线、持久化入口
- `src/renderer/`：主 UI 壳层、交互面板、SWF 播放、Zustand store、样式
- `src/shared/`：跨层共享的纯逻辑和适合直接测试的常量
- `src/components/ChatWindow.tsx`：renderer 使用的独立聊天窗口 UI
- `tests/`：布局和任务送礼规则的直接 TypeScript 测试

## 快速定位文件

如果需求涉及桌面宠物主壳或悬浮 UI，先从 `src/renderer/App.tsx` 看起。

如果需求涉及以下主题，优先看这些文件：

- SWF 播放控制桥：`src/renderer/components/RufflePlayer.tsx`
- playlist 映射与回待机：`src/renderer/utils/swfPlaylist.ts`
- 原版 102 长动作 playlist：`src/renderer/utils/penguin102OriginalPlaylists.ts`
- 开发期桥接诊断：`src/renderer/components/PlayerSwfProbePanel.tsx`
- 宠物状态和动作副作用：`src/renderer/stores/petStore.ts`
- 共享任务送礼日程和奖励：`src/shared/taskGift.ts`
- 锚点计算与防漂移：`src/shared/petWindowLayout.ts`
- 各窗口模式尺寸：`src/shared/windowSizes.ts`
- 设置和宠物数据持久化：`src/main/storage.ts`
- BrowserWindow 行为和 IPC：`src/main/index.ts`、`src/main/preload.ts`
- AI 默认模型和提供方目录：`src/ai/config.ts`、`src/ai/providerCatalog.ts`

## 当前回归高风险点

- `RufflePlayer.tsx` 仍通过轮询等待 Ruffle 就绪和控制方法可用
- `App.tsx` 承载了密集 UI 状态和基于定时器的动作回收逻辑
- 送礼奖励仍映射到现有属性系统，还不是完整的背包/道具体系
- 部分字符串和注释仍有乱码；修改相关区域时清理，不要继续扩散

## 验证矩阵

- 改了共享布局计算：执行 `npm run test`
- 改了任务送礼规则或奖励：执行 `npm run test`
- 一般 TypeScript 改动：执行 `npm run type-check`
- 改了 Electron 或 renderer 交互：条件允许时执行 `npm run dev` 做人工验证

## 实用启发式

- 把时间表和奖励规则放进共享模块，不要内联在 renderer 事件处理中
- 把动画路径归一化放进 playlist 工具，不要散落在按钮回调里
- 调整悬浮 UI 定位时，先判断改动属于共享几何逻辑还是 renderer 层像素偏移
- 更新项目状态或路线图描述时，优先更新根目录文档，而不是旧的 `docs/` 页面
