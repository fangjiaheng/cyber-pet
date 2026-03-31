# 项目当前状态

更新时间：2026-03-31

## 当前定位

当前仓库的准确定位是：

- 一个桌面宠物 + AI 助手的交互原型
- 当前仍基于原版 QQ 宠物 SWF 资源验证动画播放、交互链路和任务逻辑
- 适合本地开发、功能验证、动画研究
- 不适合直接商业化或公开发布

## 已完成能力

### 桌面交互

- 透明无边框 Electron 主窗口
- 宠物拖拽移动
- 透明区域点击穿透
- 宠物悬浮显示功能区
- 右键菜单与功能区菜单
- 气泡提示显示在宠物头顶
- 气泡显示时宠物锚点保持不变，不再发生位移

### 动画系统

- Ruffle 常驻加载 `player.swf`
- 通过 `setid()` + `loadlists()` 切换动作
- 已接入原版多段动作 playlist 映射
- 动画切换不再整屏闪烁
- 动画菜单、喂食、清洁、日常入口均已接入统一播放链路

### AI 助手

- AI 聊天窗口
- AI 配置面板
- 聊天记录本地持久化
- AI 配置本地持久化

### 养成与任务

- 饥饿、清洁、心情、精力
- 经验、等级、元宝
- 喂食、清洁、休息、治疗、学习、打工、旅行
- `任务 -> 登录送礼`
- `任务 -> 在线送礼`
- 在线时长累计
- 每日 `06:00` 重置在线送礼周期
- 奖励领取后映射到现有属性系统并持久化保存

## 当前技术方案

### 动画播放

- 主播放器使用 `src/renderer/components/RufflePlayer.tsx`
- 业务动作通过 `src/renderer/utils/swfPlaylist.ts` 转换为最终 playlist
- 特殊多段动作由 `src/renderer/utils/penguin102OriginalPlaylists.ts` 兜底

### 窗口布局

- 统一窗口常量在 `src/shared/windowSizes.ts`
- 统一宠物锚点计算在 `src/shared/petWindowLayout.ts`
- `pet` 与 `bubble` 模式共享同一锚点，保证显示气泡不影响宠物位置

### 状态与存储

- 渲染层状态集中在 `src/renderer/stores/petStore.ts`
- 主进程本地存储在 `src/main/storage.ts`
- 任务送礼规则与周期计算在 `src/shared/taskGift.ts`

## 测试状态

当前已覆盖的基础测试：

- `tests/petWindowLayout.test.ts`
  - 验证气泡模式与宠物模式锚点一致
  - 验证窗口来回切换后锚点不会漂移
- `tests/taskGift.test.ts`
  - 验证登录送礼解锁与重复领取限制
  - 验证在线送礼按在线分钟数解锁
  - 验证每天 `06:00` 刷新
  - 验证登录送礼 12 天周期轮换

## 当前已知问题

### 1. 素材版权边界未解决

- 只适合本地研究和原型验证
- 不建议公开收费、公开打赏或直接商业化
- 若要长期运营，需要先完成原创化替换

### 2. 仓库内仍有历史乱码残留

部分旧文档、注释、默认字符串仍存在历史编码问题。这一轮已先把主文档恢复为干净中文，源码仍需继续清理。

### 3. 业务层动作状态机仍可继续收敛

虽然播放链路已经切到 `loadlists`，但部分按钮仍在业务层使用定时器回收状态。后续如果要做更稳的自动回待机和状态调度，建议继续把动作状态机从 `App.tsx` 中抽离。

### 4. 任务系统暂未接入完整背包

当前登录送礼/在线送礼采用“奖励映射到现有属性”的实现，而不是完整道具库存系统。

## 关键文件

```text
src/
├─ main/
│  ├─ index.ts
│  └─ storage.ts
├─ renderer/
│  ├─ App.tsx
│  ├─ App.css
│  ├─ swfData.ts
│  ├─ stores/petStore.ts
│  ├─ components/RufflePlayer.tsx
│  ├─ components/ContextMenu.tsx
│  ├─ components/ActionDropdownMenu.tsx
│  └─ utils/swfPlaylist.ts
├─ shared/
│  ├─ windowSizes.ts
│  ├─ petWindowLayout.ts
│  └─ taskGift.ts
└─ components/
   └─ ChatWindow.tsx
```

## 下一步建议

1. 继续清理源码中的历史乱码与默认文案
2. 继续收敛动作状态机，减少业务层分散的定时器
3. 决定是否扩展任务奖励为真实背包 / 道具系统
4. 继续推进原创素材替换，降低版权风险
5. 完善签到、经验、等级系统

状态：可开发、可演示、可继续迭代  
不建议：直接对外商业化
