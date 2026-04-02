# Q宠宝贝 桌面宠物 - 需求文档

## 1. 项目概述

### 1.1 项目背景
致敬经典 QQ 宠物，结合现代 AI 技术，打造一款既有怀旧情怀又具备实用价值的桌面宠物应用。

### 1.2 项目目标
- 重现 QQ 宠物的经典养成体验
- 集成 AI 能力，让宠物成为真正的工作助手
- 通过 Token 消耗机制，将 AI 使用成本游戏化
- 支持多种 AI 引擎，给用户灵活选择

### 1.3 目标用户
- 怀念 QQ 宠物的用户
- 需要 AI 辅助工作的开发者、办公人员
- 希望以有趣方式管理 AI 使用成本的用户

## 2. 功能需求

### 2.1 核心功能

#### 2.1.1 宠物基础交互
- **拖拽移动**：用户可以拖拽宠物在桌面上移动
- **点击互动**：点击宠物触发不同反应（开心、害羞、生气等）
- **右键菜单**：显示功能菜单（喂食、清洁、设置等）
- **桌面漫游**：宠物自动在桌面边缘行走
- **边界检测**：宠物不会移出屏幕范围

#### 2.1.2 动画系统（基于 OpenClaw）
- **基础动作**
  - 站立（idle）
  - 行走（walk）
  - 跑步（run）
  - 坐下（sit）
  - 睡觉（sleep）
  - 工作中（working）

- **情绪表情**
  - 开心（happy）
  - 难过（sad）
  - 生气（angry）
  - 疲惫（tired）
  - 饥饿（hungry）

- **特殊动作**
  - 吃东西（eating）
  - 洗澡（bathing）
  - 玩耍（playing）

#### 2.1.3 状态管理系统
- **饥饿值**（0-100）
  - 随时间自然下降
  - 低于 30 时宠物显示饥饿状态
  - 通过喂食恢复

- **清洁值**（0-100）
  - 随时间自然下降
  - 低于 30 时宠物显示脏污状态
  - 通过洗澡恢复

- **心情值**（0-100）
  - 受互动、工作、状态影响
  - 影响宠物的表情和行为

- **Token 余额**
  - 显示当前可用 Token 数量
  - 工作时实时扣除
  - 支持充值和使用自有 API Key

#### 2.1.4 AI 工作助手功能
- **多 AI 引擎支持**
  - Claude Code（Anthropic）
  - Google Gemini
  - DeepSeek
  - 智谱 GLM
  - 通义千问
  - 文心一言
  - 其他兼容 OpenAI API 的模型

- **AI 引擎切换**
  - 用户可在设置中选择 AI 引擎
  - 支持为不同任务配置不同引擎
  - 显示各引擎的 Token 消耗情况

- **工作任务类型**
  - 邮件整理和回复
  - 文档摘要和翻译
  - 代码审查和优化
  - 日程安排建议
  - 文本润色和改写
  - 自定义任务

- **任务执行流程**
  1. 用户发起任务请求
  2. 宠物进入"工作中"状态
  3. 调用选定的 AI 引擎
  4. 实时显示 Token 消耗
  5. 返回任务结果
  6. 更新宠物状态（疲惫度增加）

#### 2.1.5 Token 管理系统
- **Token 获取方式**
  - 应用内购买 Token 包
  - 使用自己的 API Key（各 AI 平台）
  - 支持多个 API Key 管理

- **Token 消耗追踪**
  - 实时显示当前任务消耗
  - 历史消耗记录和统计
  - 按 AI 引擎分类统计
  - 按任务类型分类统计

- **余额提醒**
  - Token 不足时提醒充值
  - 可设置余额预警阈值
  - 支持自动切换到备用 API Key

### 2.2 辅助功能

#### 2.2.1 设置面板
- **宠物设置**
  - 选择宠物外观（支持多种皮肤）
  - 调整宠物大小
  - 设置漫游速度
  - 开关桌面漫游

- **AI 引擎配置**
  - 添加/删除 API Key
  - 设置默认引擎
  - 配置各引擎参数（温度、最大 Token 等）

- **通知设置**
  - 状态提醒（饥饿、清洁）
  - Token 余额提醒
  - 任务完成通知

- **其他设置**
  - 开机自启动
  - 窗口置顶
  - 快捷键配置

#### 2.2.2 数据持久化
- 宠物状态自动保存
- AI 使用历史记录
- Token 消耗统计
- 用户配置保存

#### 2.2.3 成就系统
- 工作任务完成数量
- 累计工作时长
- Token 使用统计
- 养成天数记录

## 3. 技术需求

### 3.1 技术栈
- **前端框架**：React 18+
- **桌面框架**：Electron 28+
- **动画引擎**：OpenClaw（2D 动画）
- **开发语言**：TypeScript
- **构建工具**：Vite
- **状态管理**：React Context / Zustand
- **样式方案**：CSS Modules / Tailwind CSS

### 3.2 系统架构

#### 3.2.1 进程架构
```
Main Process (Electron 主进程)
├── 窗口管理
├── 系统托盘
├── 文件系统操作
└── IPC 通信

Renderer Process (渲染进程)
├── React 应用
├── OpenClaw 动画渲染
├── UI 组件
└── 状��管理
```

#### 3.2.2 模块划分
- **核心模块**
  - Pet Engine：宠物逻辑引擎
  - Animation System：动画系统
  - State Manager：状态管理

- **AI 模块**
  - AI Adapter：AI 引擎适配层
  - Task Manager：任务管理
  - Token Manager：Token 管理

- **UI 模块**
  - Pet View：宠物视图
  - Settings Panel：设置面板
  - Task Panel：任务面板

### 3.3 AI 引擎适配层设计

#### 3.3.1 统一接口
```typescript
interface AIEngine {
  name: string;
  provider: string;
  apiKey: string;

  // 发送请求
  sendRequest(prompt: string, options?: RequestOptions): Promise<AIResponse>;

  // 获取 Token 消耗
  getTokenUsage(): TokenUsage;

  // 检查可用性
  checkAvailability(): Promise<boolean>;
}
```

#### 3.3.2 支持的引擎
- Claude Adapter
- Gemini Adapter
- DeepSeek Adapter
- GLM Adapter
- Qwen Adapter
- ERNIE Adapter
- Generic OpenAI Adapter

### 3.4 数据模型

#### 3.4.1 宠物状态
```typescript
interface PetState {
  id: string;
  name: string;
  hunger: number;        // 0-100
  cleanliness: number;   // 0-100
  mood: number;          // 0-100
  energy: number;        // 0-100
  position: { x: number; y: number };
  currentAction: AnimationAction;
  currentEmotion: Emotion;
}
```

#### 3.4.2 Token 账户
```typescript
interface TokenAccount {
  accountType: 'builtin' | 'custom';
  provider: string;
  balance?: number;      // 内置账户余额
  apiKey?: string;       // 自定义 API Key
  usage: TokenUsage[];   // 使用记录
}

interface TokenUsage {
  timestamp: number;
  taskType: string;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}
```

#### 3.4.3 任务记录
```typescript
interface Task {
  id: string;
  type: TaskType;
  prompt: string;
  result: string;
  aiEngine: string;
  tokenUsage: TokenUsage;
  timestamp: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}
```

## 4. 用户故事

### 4.1 基础交互
- 作为用户，我希望能拖拽宠物到桌面任意位置，让它陪伴我工作
- 作为用户，我希望点击宠物时它能有可爱的反应，增加互动乐趣
- 作为用户，我希望宠物能自动在桌面漫游，让桌面更有生气

### 4.2 养成体验
- 作为用户，我希望定期喂食和清洁宠物，体验养成的乐趣
- 作为用户，我希望看到宠物的状态变化，感受到它是"活着"的
- 作为用户，我希望宠物心情好时更愿意帮我工作

### 4.3 AI 工作助手
- 作为用户，我希望让宠物帮我整理邮件，节省时间
- 作为用户，我希望能选择不同的 AI 引擎，根据任务选择最合适的
- 作为用户，我希望清楚看到每次任务消耗了多少 Token

### 4.4 Token 管理
- 作为用户，我希望能购买 Token 包，像给宠物买食物一样
- 作为用户，我希望能使用自己的 API Key，节省成本
- 作为用户，我希望看到 Token 使用统计，了解消耗情况

## 5. UI/UX 需求

### 5.1 宠物窗口
- 无边框透明窗口
- 宠物大小：默认 150x150 像素，可调整
- 始终置顶（可选）
- 支持拖拽移动
- 右键显示菜单

### 5.2 设置面板
- 独立窗口，居中显示
- 分标签页组织功能
- 响应式布局
- 支持深色/浅色主题

### 5.3 任务面板
- 可停靠在屏幕边缘
- 显示任务历史
- 实时显示 Token 消耗
- 支持快速发起新任务

### 5.4 系统托盘
- 显示宠物状态图标
- 右键菜单快速操作
- 显示 Token 余额
- 任务通知

## 6. 开发优先级

### 6.1 第一阶段（MVP）
- [ ] Electron 基础框架搭建
- [ ] 透明窗口和拖拽功能
- [ ] 基础动画系统（站立、行走）
- [ ] 简单的状态管理（饥饿、心情）
- [ ] 集成一个 AI 引擎（DeepSeek 免费版）
- [ ] 基础的任务执���功能

### 6.2 第二阶段（完善核心功能）
- [ ] 完整的动画系统（OpenClaw 集成）
- [ ] 完整的状态管理系统
- [ ] 多 AI 引擎支持
- [ ] Token 管理系统
- [ ] 设置面板
- [ ] 数据持久化

### 6.3 第三阶段（增强体验）
- [ ] 多宠物皮肤
- [ ] 成就系统
- [ ] 任务模板
- [ ] 统计报表
- [ ] 插件系统（可扩展任务类型）

### 6.4 第四阶段（高级功能）
- [ ] 多宠物支持
- [ ] 宠物社交（与其他用户的宠物互动）
- [ ] 云端同步
- [ ] 移动端伴侣应用

## 7. 非功能需求

### 7.1 性能要求
- 应用启动时间 < 3 秒
- 内存占用 < 200MB（空闲状态）
- CPU 占用 < 5%（空闲状态）
- 动画帧率 ≥ 30 FPS

### 7.2 兼容性
- Windows 10/11
- macOS 11+
- Linux（Ubuntu 20.04+）

### 7.3 安全性
- API Key 本地加密存储
- 不上传用户任务内容
- Token 使用记录仅本地保存

### 7.4 可维护性
- 代码覆盖率 > 60%
- 模块化设计，低耦合
- 完善的文档和注释

## 8. 风险和挑战

### 8.1 技术风险
- OpenClaw 集成复杂度
- 多 AI 引擎适配工作量
- 跨平台兼容性问题

### 8.2 产品风险
- Token 定价策略
- 用户对 AI 功能的接受度
- 与其他 AI 助手的差异化

### 8.3 应对措施
- 先实现基础功能，逐步完善
- 提供免费 AI 引擎选项
- 强调养成和情感连接的独特性

## 9. 后续规划

### 9.1 短期（3 个月）
- 完成 MVP 版本
- 小范围测试
- 收集用户反馈

### 9.2 中期（6 个月）
- 完善核心功能
- 增加更多 AI 引擎
- 优化性能和体验

### 9.3 长期（1 年）
- 构建用户社区
- 开发高级功能
- 探索商业化模式
