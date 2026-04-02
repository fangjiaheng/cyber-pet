# 项目当前状态

更新时间：2026-04-02

## 当前定位

当前仓库的准确定位是：

- 一个桌面宠物 + AI 助手的交互原型，项目名称"Q宠宝贝"
- 当前仍基于原版 QQ 宠物 SWF 资源验证动画播放、交互链路和任务逻辑
- 适合本地开发、功能验证、动画研究
- 不适合直接商业化或公开发布

## 已完成能力

### 桌面交互

- 透明无边框 Electron 主窗口
- 宠物拖拽移动
- 透明区域点击穿透
- 宠物悬浮显示功能区
- 右键菜单与功能区菜单（支持 click 和 hover 触发）
- 下拉菜单原版风格：小圆点 + 原版图标
- 气泡提示显示在宠物头顶
- 气泡显示时宠物锚点保持不变，不再发生位移

### 动画系统

- Ruffle 常驻加载 `player.swf`
- 通过 `setid()` + `loadlists()` 切换动作
- 已接入原版多段动作 playlist 映射
- 动画切换不再整屏闪烁
- 动画菜单、喂食、清洁、日常入口均已接入统一播放链路
- **成长阶段感知**：蛋/幼年/成年各阶段动态加载对应 SWF 路径
- **心情外观切换**：成年阶段根据心情值切换 happy/peaceful/upset/sad 四种待机外观
- 入场动画仅在启动时播放一次，按当前等级播放对应形态

### AI 助手

- AI 聊天窗口
- AI 配置面板
- 聊天记录本地持久化
- AI 配置本地持久化

### 养成与成长系统

- **渐进等级系统**：400 级经验表（`growthConfig.ts`），替代原来固定 200 经验/级
- **每分钟自动成长值**：基础 260，受心情/健康/饥饿/清洁惩罚（`growthEngine.ts`）
- **动态属性上限**：饥饿/清洁 = 3000 + 100×min(level,30)，心情上限 1000
- **属性衰减**：饥饿/清洁 -5~8/分，心情 -2~4/分，mood<600 额外 -2
- **成长阶段切换**：蛋(≤4级)、幼年(5-8级)、成年(≥9级)
- **疾病系统框架**：3 条疾病链（感冒/咳嗽/肠胃）、不适计数器、健康 0-5（`diseaseSystem.ts`）
- **存档迁移**：旧版数据自动缩放到新属性范围（`migration.ts`）
- 喂食、清洁、玩耍、休息等基础互动
- 喂食提供 10 种食物、清洁提供 6 种用品

### 任务系统

- `任务 -> 登录送礼`
- `任务 -> 在线送礼`
- 在线时长累计
- 每日 `06:00` 重置在线送礼周期
- 奖励领取后映射到现有属性系统并持久化保存
- 奖励数值已适配新属性范围

## 当前技术方案

### 动画播放

- 主播放器使用 `src/renderer/components/RufflePlayer.tsx`
- 业务动作通过 `src/renderer/utils/swfPlaylist.ts` 转换为最终 playlist
- 特殊多段动作由 `src/renderer/utils/penguin102OriginalPlaylists.ts` 兜底
- 阶段感知 SWF 路径由 `src/renderer/utils/stageSwfResolver.ts` 解析

### 窗口布局

- 统一窗口常量在 `src/shared/windowSizes.ts`
- 统一宠物锚点计算在 `src/shared/petWindowLayout.ts`
- `pet` 与 `bubble` 模式共享同一锚点，保证显示气泡不影响宠物位置

### 成长与状态

- 成长配置在 `src/renderer/stores/growthConfig.ts`
- 成长引擎在 `src/renderer/stores/growthEngine.ts`
- 疾病系统在 `src/renderer/stores/diseaseSystem.ts`
- 存档迁移在 `src/renderer/stores/migration.ts`

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

### 2. 成长系统待完善

- 疾病系统 UI（药品选择条、生病/死亡动画）尚未实现
- 阶段切换过渡动画（Etoj.swf / Jtoc.swf）尚未接入
- 蛋/幼年阶段的 Eat/Clean/Cure SWF 路径仍硬编码 Adult 路径
- 离线衰减无上限限制
- 心情外观切换尚未实时响应 mood 变化

### 3. 业务层动作状态机仍可继续收敛

虽然播放链路已经切到 `loadlists`，但部分按钮仍在业务层使用定时器回收状态。后续如果要做更稳的自动回待机和状态调度，建议继续把动作状态机从 `App.tsx` 中抽离。

### 4. 任务系统暂未接入完整背包

当前登录送礼/在线送礼采用"奖励映射到现有属性"的实现，而不是完整道具库存系统。

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
│  ├─ stores/
│  │  ├─ petStore.ts
│  │  ├─ growthConfig.ts
│  │  ├─ growthEngine.ts
│  │  ├─ diseaseSystem.ts
│  │  └─ migration.ts
│  ├─ components/
│  │  ├─ RufflePlayer.tsx
│  │  ├─ ContextMenu.tsx
│  │  └─ ActionDropdownMenu.tsx
│  └─ utils/
│     ├─ swfPlaylist.ts
│     └─ stageSwfResolver.ts
├─ shared/
│  ├─ windowSizes.ts
│  ├─ petWindowLayout.ts
│  └─ taskGift.ts
└─ components/
   └─ ChatWindow.tsx
```

## 下一步建议

1. 实现疾病系统 UI（药品选择条、生病动画）
2. 接入阶段切换过渡动画
3. 完善蛋/幼年阶段的动作 SWF 路径映射
4. 设计商城 UI 和元宝体系
5. 从 1.2.4source 素材中提取学习/打工/旅行列表图标和名称
6. 继续推进原创素材替换，降低版权风险

状态：可开发、可演示、可继续迭代  
不建议：直接对外商业化
