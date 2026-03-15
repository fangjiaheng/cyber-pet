# 待办事项
- 在喂食下方加入饥饿值的进度条， 同理清洁
- 解决企鹅乱动的问题
- 签到加经验升级的问题， 签到原版是送东西的， 我考虑一下是送东西还是送token， 升级以后有什么好处呢？
- 右键菜单修改的问题，右键里面的内容是喂养宠物， 商城， 选项（设置， 宠物资料（昵称， 主人昵称， 个性能力： 智力 武力， 魅力， 还有个学历获得）， 中止动画， 关于，设置中有个设置动画间隔的功能）， 隐藏宠物， 退出宠物
- 学习和打工应该是用来挣元宝的

最后更新：2026-03-15

---

## 🐛 Bug 修复

> 功能开发前先把这些修掉。

### B1. 点击菜单时宠物位置乱跳 ⚠️ 高优

- 根因：菜单打开时立即触发窗口 resize，破坏拖拽坐标系；ContextMenu/ActionDropdownMenu 只阻止了 `pointerdown`，未阻止 `mousedown`，导致拖拽仍被触发
- 修复方向：菜单/下拉组件加 `mousedown stopPropagation`；菜单打开时通过 `isDragging` 状态锁定拖拽；resize 延迟到菜单渲染后执行
- 涉及文件：`App.tsx`、`ContextMenu.tsx`、`ActionDropdownMenu.tsx`

状态：未开始

### B2. Token 记录未持久化

- TokenManager 只在内存中，重启后丢失
- 修复：在 `addRecord` 时同步写入 electron-store（IPC 通道已就绪：`storage:addTokenRecord`）
- 涉及文件：`src/ai/TokenManager.ts`

状态：未开始

### B3. Ruffle 初始化轮询太脆弱

- 当前 50×100ms 忙等，稳定性差
- 修复：改为 MutationObserver 或事件驱动
- 涉及文件：`src/renderer/components/RufflePlayer.tsx`

状态：未开始

### B4. swfData.ts 睡眠动画重复路径

- sleep id 10 和 11 指向同一文件
- 修复：补全缺失动画路径，或删除重复项
- 涉及文件：`src/renderer/swfData.ts`

状态：未开始

### B5. 生产环境聊天窗口路径错误

- `createChatWindow` 生产分支加载 `chat.html`，需确认与实际构建产物一致
- 涉及文件：`src/main/index.ts`

状态：未开始

---

## 🔒 安全

### S1. 移除 config.ts 中硬编码的 Claude API Key

- 改为从 electron-store 读取用户配置的 Key
- AIConfigForm 已有 UI，打通读写逻辑即可
- 涉及文件：`src/ai/config.ts`、`src/renderer/components/AIConfigForm.tsx`

状态：待确认（AIConfigForm 保存逻辑已完成，需核实 config.ts 是否还有硬编码残留）

---

## 优先级 1

### 1. 去 Q 宠化 / 原创化改造

目标：把当前"原版素材验证原型"逐步过渡到"可公开发布的原创萌宠"

- [ ] 确定新的原创角色方向
- [ ] 替换产品命名和文案中的强关联表述
- [ ] 制定角色、美术、动作、音效替换清单
- [ ] 明确哪些代码和资源仍直接依赖原版素材
- [ ] 评估替换顺序：先角色，再动作，再 UI，再音效

状态：未开始

### 2. 收敛动作状态机

目标：让动作播放、回待机、状态同步不要再分散在多个 `setTimeout`

- [ ] 梳理当前 `App.tsx` 里所有直接触发动作的入口
- [ ] 抽离统一的"播放命令 + 回收策略"层
- [ ] 尽量由 playlist 自身完成动作闭环，减少业务层猜时长
- [ ] 为清洁、玩耍、休息、签到建立统一动作描述结构

状态：未开始

---

## 优先级 2

### 3. 原版动作 QA 与补齐

目标：核对主界面已暴露动作是否都按原版完整播放

- [ ] 对动画菜单 9 个分类逐组抽样
- [ ] 记录仍需特殊 playlist 的动作
- [ ] 必要时继续扩充 `penguin102OriginalPlaylists.ts`
- [ ] 给"动作完整播放"建立最小回归清单

状态：进行中

### 4. DeepSeek 引擎接入

- 参照 `ClaudeEngine.ts` 实现，填入 `AIEngineFactory.ts` 的 TODO 位置
- 新建文件：`src/ai/engines/DeepSeekEngine.ts`
- 修改：`src/ai/AIEngineFactory.ts`

状态：未开始

### 5. 签到 + 经验值 + 等级系统

- `petStore` 增加 `exp`、`level`、`lastCheckIn` 字段
- 签到每天一次 +50 exp，连续签到有 bonus
- 等级每 200 exp 升一级（暂定），升级时播放特殊动画 + 气泡
- 喂食/清洁/玩耍等互动给少量 exp（+5~10）
- SettingsPanel 或主界面显示等级和 exp 进度条
- 涉及文件：`src/renderer/stores/petStore.ts`、`App.tsx`、`SettingsPanel.tsx`

状态：未开始

### 6. Token / 使用统计可视化

- 设计统计面板入口
- 展示最近调用次数、模型分布、估算成本
- 提供按日期查看能力

状态：未开始

### 7. 音效与反馈系统

- 设计音量与静音控制
- 给关键动作挂接音效
- 增加提示音和状态音效开关

状态：未开始

---

## 优先级 3

### 8. 宠物点击互动动画

- 点击企鹅时随机触发 reaction 动画（现有 SWF 库已有素材），并显示对应气泡
- 涉及文件：`App.tsx`、`QQPenguin.tsx`

状态：未开始

### 9. 桌面通知 / 提醒

- 饥饿度 < 20 时推送"肚子饿了"
- 可在设置中配置定时提醒（喝水、休息等）
- 涉及文件：`src/main/index.ts`（新增 Notification IPC）、`SettingsPanel.tsx`

状态：未开始

### 10. 桌面漫游

- 自动漫游路径和边界策略
- 漫游开关
- 漫游中断与拖拽恢复

状态：未开始

### 11. 产品化准备

- 明确原创版本的品牌名
- 梳理公开发布所需最小文档
- 评估未来会员 / 道具 / 打赏 / AI 功能分层

状态：未开始

---

## 最近已完成

### 2026-03-14

- [x] 修复企鹅顶部留白：`App.css` 顶部 padding 从 28px 压缩到 6px，企鹅可贴近屏幕顶边（待回归验证）

### 2026-03-15

- [x] 功能栏下方状态摘要移除，不再显示等级、经验、元宝、心情
- [x] 喂食和清洁横向滚动条对齐到功能区正下方
- [x] 初始化阶段移除企鹅占位 fallback

### 2026-03-13

- [x] `AI 助手配置` 面板可真正保存和测试连接
- [x] 右键菜单位置与关闭逻辑修正
- [x] 喂食菜单与动画菜单抽成可复用组件
- [x] 下拉菜单去掉横向滚动条
- [x] 气泡和下拉内容裁切问题修复
- [x] 正式播放器切换到 `player.swf + loadlists`
- [x] 动画切换闪烁问题显著缓解并接入主链路
- [x] 多段动作播放不完整问题完成第一轮修复

### 2026-03-09 至 2026-03-12

- [x] 聊天历史持久化
- [x] 微信风格聊天布局
- [x] 鼠标穿透
- [x] 设置面板与聊天窗口拖动
- [x] 悬浮功能区

---

## 不做的事

- OpenAI / Gemini / GLM / Qwen / ERNIE 引擎（暂缓）
- API Key 加密存储（不是公开项目，明文够用）
- 测试覆盖（当前阶段不引入）
- 宠物皮肤/主题切换（等原创化完成后再考虑）
