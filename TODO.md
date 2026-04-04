# 待办事项

更新时间：2026-04-04

## 动画播放机制
原版QQ宠物交互与动作播放机制

  交互方式

  原版在 D:\QQPetSource\resources\app-extracted\src\windows\util\move.js 中处理鼠标事件：

  - 左键点击 — 触发 clickPet()，播放互动动画
  - 左键拖拽 — mousedown → mousemove → mouseup，拖动宠物窗口
  - 右键菜单 — 弹出菜单：喂养宠物(喂养/清洗/吃药)、小游戏、设置及帮助、停止成长、退出宠物

  动画系统核心（swfPet.js）
  原版有三个核心类：

  1. SwfRouter — 动作路由/状态机
  // 支持的动作名:
  enter, exit, clean, eat, game, sick, cure,
  normal, speak, hide, appear, play(随机选择),
  hideright, hideleft, dying, die, revival, bury, levUp

  根据以下条件决定播放哪个 SWF：
  - 心情状态: happy / peaceful / upset / sad / prostrate（由 mood 数值决定）
  - 成长阶段: egg(≤4级) / kid(5-9级) / adult(≥10级)
  - 性别: GG(女) / MM(男)
  - 健康值: 0=死亡, 1=濒死, 2-4=生病(每30秒循环播放), ≥5=正常

  2. SwfChangeProxy — SWF 切换管理
  - 淡出旧动画(0.08s透明度过渡) → 加载新 SWF → 淡入
  - 管理 DOM 中的 SWF 嵌入元素

  3. AnimationSystem — 帧管理
  - 用 requestAnimationFrame 追踪播放进度
  - 通过 setState() 在每帧检查是否需要切换动作
动画优先级与队列

  每个动作有属性控制播放行为：
  {
    power: 100,              // 优先级，高的可以打断低的
    backSwf: "normal",       // 播放完后回到什么动作
    canSelfSet: true,        // 能否打断自己
    lastTimeCut: 1,          // 提前几帧可以切换
    afterState: [],          // 允许的后续动作
    isOverState: "normal",   // 覆盖时的状态
    nextFrames: 66           // 跳转到第几帧
  }
  交互流程

  用户点击/右键 → move.js 捕获事件
    → 右键弹出菜单 → 选择项(如"喂养")
      → swfPet.nextSwf("eat")
        → SwfRouter 根据(心情+阶段+性别)计算 SWF 路径
          → 例: /Action/GG/Adult/happy/Eat1.swf
            → SwfChangeProxy 淡入淡出切换
              → AnimationSystem 监控播放
                → 播放结束 → 根据 backSwf 回到 idle

  与当前项目的对比

  ┌──────────┬────────────────────────────┬─────────────────────────────────────┐
  │   特性   │            原版            │              当前项目               │
  ├──────────┼────────────────────────────┼─────────────────────────────────────┤
  │ SWF播放  │ Flash Player (PPAPI)       │ Ruffle 模拟器                       │
  ├──────────┼────────────────────────────┼─────────────────────────────────────┤
  │ 状态机   │ SwfRouter 类 + power优先级 │ Zustand store + runTimedInteraction │
  ├──────────┼────────────────────────────┼─────────────────────────────────────┤
  │ 动作队列 │ nextSwf() 带优先级打断     │ 简单的定时器+序列号防冲突           │
  ├──────────┼────────────────────────────┼─────────────────────────────────────┤
  │ 菜单     │ 纯右键菜单                 │ 右键菜单 + 4个按钮下拉              │
  ├──────────┼────────────────────────────┼─────────────────────────────────────┤
  │ 心情映射 │ 数值区间硬编码             │ 动态 mood 值                        │
  └──────────┴────────────────────────────┴─────────────────────────────────────┘

  当前项目基本已经复现了原版的核心交互逻辑，主要差异在于动作优先级系统——原版有完整的 power 优先级和打断机制，当前项目用的是简单的定时器方案。


## P0
- 刚开始的初始化设置, 比如选男企鹅还是选女企鹅, 设置名称什么的
- 原版对话系统中显示关闭的按钮, 文字会变化的, 比如说我知道了, xxxx等
- 学习打工旅行的模块不对, 他是打开那种dialog形式的, 
- 商城做的不好看

## P1
- 为任务面板补充更明确的领取反馈、刷新提示和倒计时展示
- 补更多状态与交互测试，覆盖菜单打开、动作切换、任务领取后的 UI 反馈
- 清理功能区与右键菜单中的历史文案/样式差异，保持一致性
- 调整右键菜单结构，补齐”设置、宠物资料、中止动画、关于、隐藏宠物、退出宠物”等目标项

## P2 — 成长系统

原版成长系统已完成分析（见下方参考）。核心框架已实现，以下为剩余待办：

### 已完成
- [x] 等级系统重构：渐进400级经验表（`growthConfig.ts`），替代原来固定200经验/级
- [x] 每分钟自动成长值：基础260，受心情/健康/饥饿/清洁惩罚（`growthEngine.ts`）
- [x] 动态属性上限：饥饿/清洁 = 3000 + 100×min(level,30)，心情上限1000
- [x] 属性衰减调整：饥饿/清洁 -5~8/分，心情 -2~4/分，mood<600额外-2
- [x] 成长阶段切换：蛋≤4、幼年5-8、成年≥9，待机/入场动画按阶段动态加载
- [x] 心情驱动外观：成年阶段 happy/peaceful/upset/sad 四种外观
- [x] 疾病系统框架：3条疾病链、不适计数器、健康0-5（`diseaseSystem.ts`）
- [x] 存档迁移：旧版数据自动缩放到新属性范围（`migration.ts`）
- [x] 奖励数值平衡：feed/clean/task gift 等数值适配新范围
- [x] 阶段感知SWF路径解析器（`stageSwfResolver.ts`）

### 待完善
- 疾病系统 UI：药品选择条、生病动画播放、死亡动画
- 阶段切换过渡动画：升级跨阶段时播放 Etoj.swf / Jtoc.swf
- 物品 SWF 路径完全动态化：当前 Eat/Clean/Cure 仍硬编码 Adult 路径，蛋/幼年阶段需映射
- 离线衰减上限：长时间未打开时限制最大补算衰减量
- 心情外观切换实时响应：mood 变化时自动切换当前待机动画

### 其他成长相关
- 推进原创角色、命名、美术与音效替换
- 明确签到奖励、经验升级、等级收益的产品规则
- 评估学习和打工与元宝产出的关系，统一资源循环
- 评估桌面通知、漫游、更多随机互动动画

## Phase 1 — 物品库存 + 商店（已完成 ✅）

- [x] 物品目录数据层 `src/shared/itemCatalog.ts`（食物50+、商品22+、药品22、背景17、学习36、打工18）
- [x] 库存 Store `src/renderer/stores/inventoryStore.ts`（Zustand + 持久化）
- [x] 重构喂食/清洁/治疗流程为库存消耗模式（App.tsx 中 feedWithItem/cleanWithItem/healWithItem）
- [x] 商店面板 `src/renderer/components/ShopPanel.tsx`（4分类、分页、购买流程）
- [x] 右键菜单"商城"入口已接通

## Phase 2 — 对话系统 + 疾病UI（已完成 ✅）

### 2a. 对话系统
- [x] `src/shared/communication.ts` — 转录原版全部对话（enter/exit/eat/clean/levUp/smallTalk/state等 200+条）
- [x] `src/renderer/hooks/usePetDialogue.ts` — 启动对话、定时闲聊（4分钟间隔）、状态提醒、事件触发
- [x] 喂食/清洁后延迟触发对应对话

### 2b. 疾病UI完善
- [x] 修正 `diseaseSystem.ts` 药品ID（感冒链/咳嗽链/消化链对应原版State.js）
- [x] 治疗条根据当前疾病动态展示对症药品（★对症标记 + 错误药品提示）
- [x] 万能药品支持（百草丹治一级、还魂丹直接痊愈）
- [x] 药品目录完整22种（itemCatalog.ts）

## Phase 3 — 打工 + 学习系统（已完成 ✅）

- [x] `src/renderer/stores/activitySystem.ts` — 统一活动管理（打工/学习互斥、计时、学时追踪）
- [x] `src/renderer/components/WorkPanel.tsx` — 18种工作选择、等级/学历门槛过滤、计时、元宝收益
- [x] `src/renderer/components/StudyPanel.tsx` — 9科目×4学校等级、学时进度条、前置学业检查
- [x] 活动互斥：activityStore 管理 activeActivity，忙碌时按钮灰化
- [x] 活动数据持久化（petStore → electron-store）

## Phase 4 — 信息面板（已完成 ✅）

- [x] `src/renderer/components/InfoCardPanel.tsx` — 宠物资料卡（名称可编辑/属性/学历/在线时长）
- [x] `src/renderer/components/StateInfoPanel.tsx` — 状态进度条（饥饿/清洁/心情/体力/健康/经验/疾病）
- [x] `src/renderer/components/InventoryPanel.tsx` — 背包浏览（4分类/分页/数量展示）
- [x] 右键菜单新增"宠物信息"子菜单（资料/状态/背包）

## Phase 5 — 阶段转变动画 + 托盘图标（已完成 ✅）

- [x] 升级跨阶段时播放 Etoj.swf / Jtoc.swf（useEffect 监听 growthStage 变化）
- [x] 系统托盘根据宠物状态切换图标（IPC tray:update-icon + 动画帧循环）
- [x] 状态映射：normal/hungry/dirty/ill/dead/study/work/travel

## Phase 6 — 旅行 + 粉钻 + 背景房间（已完成 ✅）

- [x] 旅行系统（4个目的地：公园/海滩/登山/图书馆，使用 activityStore 计时）
- [x] 粉钻VIP系统数据层 `src/renderer/stores/pinkDiamond.ts`（7级、购买/续费/过期/成长加成）
- [ ] 粉钻面板UI（待后续需要时接入）
- [ ] 背景房间UI（素材 17 张已就绪，待后续接入渲染层）

## 其他待办

### 动画对应问题
- 排查当前各动作（喂食、清洁、治疗、学习、打工、旅行）播放的 SWF 是否与实际动作匹配
- 蛋/幼年阶段的动作 SWF 是否都能正确加载（当前 Eat/Clean/Cure 仍硬编码 Adult 路径）
- 确认心情外观切换后待机动画是否正确对应

## Bug / 技术债

- `TokenManager` 记录仍需确认是否完整持久化
- `RufflePlayer` 初始化仍依赖轮询，后续可改为事件驱动或观察器方案
- `swfData.ts` 仍需排查重复或缺失动画路径
- 生产环境聊天窗口加载路径需要与最终构建产物再核对一次
- 动作状态机还分散在业务层，需继续收敛，减少 `setTimeout`

## 最近已完成

- [x] **P2 成长系统核心重构**：新增 growthConfig / growthEngine / migration / diseaseSystem / stageSwfResolver 五个模块
- [x] 下拉菜单 item 样式改为原版风格：小圆点 + 原版图标（richang/qingjie/zhibing/xuexi/dagong/lvyou）
- [x] 功能区菜单按钮改为 hover 触发下拉菜单
- [x] 功能区按钮栏位置下移
- [x] 签到送礼任务条图标替换为原版物品 GIF 素材
- [x] 任务菜单图标替换为原版 renwu.png
- [x] HorizontalScrollStrip 组件支持 badge 叠加层（已领取/可领取标记）
- [x] 修复气泡提示出现时宠物下移的问题，并补充布局测试
- [x] 新增 `任务 -> 登录送礼 / 在线送礼`
- [x] 接入在线时长累计、每日 `06:00` 刷新和本地持久化
- [x] 新增 `tests/taskGift.test.ts`
- [x] 修复 `src/shared/petWindowLayout.ts` 导入路径错误导致的启动失败
- [x] 主文档恢复为中文并同步到最新功能状态

---

## 原版成长系统参考

> 以下数值来自 `D:\QQPetSource` 原版源码分析，供实现时参考。

### 成长值计算（GrowUp.js）

每分钟成长值 = 基础速率(260) - 心情惩罚 - 健康惩罚 - 属性惩罚

| 心情(mood) | 惩罚 | 健康(health) | 惩罚 |
|-----------|------|-------------|------|
| 900-1000 | 0 | 5（满） | 0 |
| 700-899 | -20 | 4 | -30 |
| 500-699 | -70 | 3 | -80 |
| 300-499 | -100 | 2 | -120 |
| 100-299 | -140 | 1 | -160 |
| 0-99 | -180 | 0 | 停止成长 |

饥饿<720：额外 -80；清洁<1080：额外 -80

### 属性衰减（每分钟）
- 饥饿：随机 -5~8
- 清洁：随机 -5~8
- 心情：随机 -2~4
- mood<600时：饥饿和清洁额外 -2

### 属性上限
- 饥饿/清洁：3000 + 100×min(level, 30)，最大 6000
- 心情：固定 1000
- 健康：固定 5（0=死亡，1-4=不同疾病阶段，5=健康）

### 疾病触发
- 饱食(hunger > max-260)、脏乱(clean < 1080)、饥饿(hunger < 720) 每次检测累计不适次数
- 不适次数 > 4 时触发对应疾病链
- 疾病未治疗会沿链条恶化

### 等级经验表（前20级）
```
Lv1: 0, Lv2: 100, Lv3: 300, Lv4: 600, Lv5: 1100
Lv6: 1800, Lv7: 2800, Lv8: 4200, Lv9: 5900, Lv10: 8000
Lv11: 10600, Lv12: 13700, Lv13: 17400, Lv14: 21700, Lv15: 26700
Lv16: 32500, Lv17: 39000, Lv18: 46300, Lv19: 54500, Lv20: 63600
```

### 关键源文件
- 成长计算：`QQPetSource/resources/app-extracted/src/windows/util/pet/GrowUp.js`
- 等级表：`QQPetSource/resources/app-extracted/src/windows/util/pet/level.js`（含400级完整表）
- 疾病系统：`QQPetSource/resources/app-extracted/src/windows/util/pet/State.js`
- 外观切换：`QQPetSource/resources/app-extracted/src/windows/util/pet/swfPet.js`
- 属性初始化：`QQPetSource/resources/app-extracted/src/ini/pet.js`
