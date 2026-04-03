# 项目当前状态

更新时间：2026-04-03

## 当前定位

- 一个桌面宠物 + AI 助手的交互原型，项目名称"Q宠宝贝"
- 当前仍基于原版 QQ 宠物 SWF 资源验证动画播放、交互链路和任务逻辑
- 适合本地开发、功能验证、动画研究
- 不适合直接商业化或公开发布

## 已完成能力

### 桌面交互

- 透明无边框 Electron 主窗口
- 宠物拖拽移动、透明区域点击穿透
- 悬浮功能区（click 和 hover 触发）
- 右键菜单：AI助手 / 宠物互动 / 商城 / 宠物信息 / 选项
- 气泡提示显示在宠物头顶，不引发位移

### 动画系统

- Ruffle 常驻加载 `player.swf`，`setid()` + `loadlists()` 切换动作
- 成长阶段感知：蛋/幼年/成年各阶段动态加载 SWF
- 心情外观切换：成年阶段 happy/peaceful/upset/sad 四种待机
- 阶段转变动画：蛋→幼年（Etoj.swf）、幼年→成年（Jtoc.swf）自动播放
- 系统托盘图标根据状态切换动画帧

### AI 助手

- AI 聊天窗口（流式回复、本地历史持久化）
- AI 配置面板（Base URL、API Key、模型选择）

### 养成与成长系统

- **渐进等级系统**：400 级经验表（`growthConfig.ts`）
- **每分钟自动成长值**：基础 260，受心情/健康/属性惩罚（`growthEngine.ts`）
- **动态属性上限**：饥饿/清洁 = 3000 + 100×min(level,30)，心情上限 1000
- **属性衰减**：饥饿/清洁 -5~8/分，心情 -2~4/分，mood<600 额外 -2
- **成长阶段切换**：蛋(≤4级)、幼年(5-8级)、成年(≥9级)
- **存档迁移**：旧版数据自动缩放到新属性范围

### 疾病系统

- 3 条疾病链（感冒/咳嗽/消化），每条 4 级
- 对症药品匹配 + 万能药品（百草丹、还魂丹）
- 治疗条智能标注对症药品，错误用药提示
- 健康 0-5 级影响成长速度

### 物品与商店系统

- 完整物品目录：50+食物、22清洁品、22药品、17背景（`itemCatalog.ts`）
- 库存系统：物品消耗型喂食/清洁/治疗（`inventoryStore.ts`）
- 商店面板：4分类标签、分页浏览、元宝购买（`ShopPanel.tsx`）
- 新存档自动发放入门物品

### 打工 + 学习 + 旅行

- 打工面板：18种工作、等级/学历门槛、计时、元宝+属性奖励（`WorkPanel.tsx`）
- 学习面板：9科目×4学校等级、学时追踪、进度条（`StudyPanel.tsx`）
- 旅行：4个目的地、心情/属性奖励
- 活动互斥：打工/学习/旅行期间锁定其他活动（`activitySystem.ts`）
- 学历影响打工工种解锁

### 对话系统

- 200+条原版对话（`communication.ts`）
- 启动进入对话、4分钟闲聊、状态提醒（饥饿/脏乱）
- 喂食/清洁/升级事件对话（`usePetDialogue.ts`）

### 信息面板

- 宠物资料卡：名称可编辑、属性、学历（`InfoCardPanel.tsx`）
- 状态信息面板：属性进度条、经验进度、疾病状态（`StateInfoPanel.tsx`）
- 背包面板：4分类浏览、数量展示（`InventoryPanel.tsx`）

### 任务系统

- 登录送礼 12 格周期、在线送礼 8 档
- 每天 06:00 重置在线送礼
- 奖励映射到属性系统并持久化

## 关键文件

```text
src/
├─ main/
│  ├─ index.ts                    # 主进程、窗口管理、托盘
│  ├─ preload.ts                  # IPC 桥接
│  └─ storage.ts                  # electron-store 持久化
├─ renderer/
│  ├─ App.tsx                     # 主界面、面板入口、交互逻辑
│  ├─ stores/
│  │  ├─ petStore.ts              # 宠物核心状态
│  │  ├─ inventoryStore.ts        # 物品库存
│  │  ├─ activitySystem.ts        # 打工/学习/旅行活动管理
│  │  ├─ growthConfig.ts          # 400级经验表、阶段判断
│  │  ├─ growthEngine.ts          # 每分钟成长/衰减计算
│  │  ├─ diseaseSystem.ts         # 3条疾病链、药品匹配
│  │  ├─ pinkDiamond.ts           # 粉钻VIP数据层
│  │  └─ migration.ts             # 旧版存档迁移
│  ├─ components/
│  │  ├─ ShopPanel.tsx            # 商店面板
│  │  ├─ WorkPanel.tsx            # 打工面板
│  │  ├─ StudyPanel.tsx           # 学习面板
│  │  ├─ InfoCardPanel.tsx        # 宠物资料卡
│  │  ├─ StateInfoPanel.tsx       # 状态信息面板
│  │  ├─ InventoryPanel.tsx       # 背包面板
│  │  ├─ SettingsPanel.tsx        # 设置面板
│  │  ├─ RufflePlayer.tsx         # SWF 播放器
│  │  ├─ ContextMenu.tsx          # 右键菜单
│  │  ├─ ActionDropdownMenu.tsx   # 下拉菜单
│  │  ├─ HorizontalScrollStrip.tsx # 横向滚动选择
│  │  └─ PetBubble.tsx            # 气泡提示
│  ├─ hooks/
│  │  ├─ usePetDecay.ts           # 属性衰减
│  │  ├─ usePetDialogue.ts        # 对话系统
│  │  ├─ useMouseGaze.ts          # 鼠标凝视
│  │  └─ useWindowDrag.ts         # 窗口拖拽
│  └─ utils/
│     ├─ swfPlaylist.ts           # 动作→playlist 映射
│     └─ stageSwfResolver.ts      # 阶段感知 SWF 路径
├─ shared/
│  ├─ itemCatalog.ts              # 完整物品目录（食物/清洁/药品/学习/打工）
│  ├─ communication.ts            # 200+条宠物对话数据
│  ├─ taskGift.ts                 # 任务送礼规则
│  ├─ windowSizes.ts              # 窗口尺寸常量
│  ├─ petWindowLayout.ts          # 锚点计算
│  └─ types.ts                    # ElectronAPI 类型
└─ ai/                            # AI 引擎适配层
```

## 当前已知问题

1. **素材版权**：仍依赖原版素材，不适合直接对外发布
2. **蛋/幼年 SWF 路径**：部分动作仍硬编码 Adult 路径
3. **离线衰减无上限**：长时间未打开时补算衰减量无限制
4. **动作状态机**：部分业务逻辑仍分散在 App.tsx 中，可继续收敛
5. **粉钻面板UI**：数据层已完成，面板待接入
6. **背景房间UI**：素材17张已就绪，渲染层待接入

## 下一步建议

1. 粉钻面板UI和背景房间渲染
2. 完善蛋/幼年阶段的动作 SWF 路径映射
3. 离线衰减上限限制
4. 继续推进原创素材替换

状态：可开发、可演示、可继续迭代
不建议：直接对外商业化
