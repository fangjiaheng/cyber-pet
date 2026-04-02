# 开发进度

更新时间：2026-04-02

## 当前阶段结论

项目已经从"桌宠基础原型"推进到"成长系统核心重构完成、主交互链路稳定"的阶段。

当前阶段的关键结论：

- 成长系统已按原版 QQ 宠物机制重构：渐进经验表、动态属性上限、成长阶段、疾病框架
- 主播放链路已经稳定在 `player.swf + loadlists`
- 动画按成长阶段（蛋/幼年/成年）和心情外观动态加载对应 SWF 路径
- 功能区、右键菜单、喂食清洁滚动条、任务面板都已接入主交互链路
- 下拉菜单已改为原版风格（小圆点 + 原版图标）
- 源码编码残留已全部清理完毕
- 项目名称统一为"Q宠宝贝"

## 最新里程碑

### 里程碑 12：P2 成长系统核心重构

已完成：

- 新增 `src/renderer/stores/growthConfig.ts`：渐进 400 级经验表、动态属性上限、阶段判断
- 新增 `src/renderer/stores/growthEngine.ts`：每分钟成长值计算、属性衰减
- 新增 `src/renderer/stores/diseaseSystem.ts`：3 条疾病链、不适计数器、健康等级
- 新增 `src/renderer/stores/migration.ts`：旧版存档自动缩放
- 新增 `src/renderer/utils/stageSwfResolver.ts`：阶段感知 SWF 路径解析
- `petStore.ts` 全面适配新成长体系
- 任务送礼奖励数值适配新属性范围

### 里程碑 13：下拉菜单原版风格改造

已完成：

- 下拉菜单 item 样式改为原版风格：小圆点 + 原版图标
- 图标替换为 1.2.4source 中的原版素材（richang/qingjie/zhibing/xuexi/dagong/lvyou）
- 功能区菜单按钮支持 click 和 hover 双触发
- 修复展开二级菜单时整体偏移的问题
- 功能区按钮栏位置下移

### 里程碑 14：入场动画修复

已完成：

- 入场动画改为仅启动时播放一次（`hasPlayedEnter` ref guard）
- 按当前等级播放对应形态的入场动画，不再出现幼年体播完又播成年体的问题

### 里程碑 15：编码清理（P0）

已完成：

- App.tsx 中 4 处乱码修复（2 个 console.error + 2 个注释）
- "Cyber Mate" 全部替换为"Q宠宝贝"（petStore.ts、storage.ts、index.ts）
- 验证通过：grep 无残余乱码、无残余占位名、TypeScript 编译通过

### 里程碑 9-11（历史）

- 里程碑 9：任务送礼接入
- 里程碑 10：宠物与气泡锚点修正
- 里程碑 11：文档修复

## 本轮验证

建议每次改动后至少执行：

```bash
npm run type-check
npm run test
```

当前测试集：

- `tests/petWindowLayout.test.ts`
- `tests/taskGift.test.ts`

## 仍需推进

1. 疾病系统 UI：药品选择条、生病/死亡动画
2. 阶段切换过渡动画：升级跨阶段时播放 Etoj.swf / Jtoc.swf
3. 蛋/幼年阶段的 Eat/Clean/Cure SWF 路径完全动态化
4. 商城系统与元宝体系设计
5. 从 1.2.4source 中提取学习/打工/旅行列表素材
6. 推进原创角色、命名、美术与音效替换

阶段关键词：成长系统重构、原版风格还原、编码清理
