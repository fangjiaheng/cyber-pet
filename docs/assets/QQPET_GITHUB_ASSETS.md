# 🎉 已集成QQ宠物原版素材！(已经废弃,新素材从1.2.4获取)

## 📦 素材来源

- **GitHub仓库**: https://github.com/ice-cream-headache/QQPet13
- **项目说明**: QQ宠物相伴十三载，修改免登录版
- **素材格式**: Sprite Sheet（精灵图集）
- **技术栈**: LayaBox 游戏引擎

---

## ✅ 已复制的素材

素材已复制到：`public/assets/penguin_original/`

### 包含内容：

**两个版本**：
- **GG/** - 哥哥/男性企鹅
- **MM/** - 妹妹/女性企鹅

**6种动画**（每个版本都有）：

| 文件名 | 中文名 | 说明 | 帧数 |
|--------|--------|------|------|
| `xiuxian` | 休闲/待机 | 默认站立、呼吸动画 | 68帧 |
| `chifan` | 吃饭 | 进食动画 | 71帧 |
| `xizao` | 洗澡 | 清洁动画 | 多帧 |
| `zhaoshou` | 招手 | 打招呼/开心 | 28帧 |
| `huaban` | 滑板 | 玩耍/运动 | ~60帧 |
| `zayan` | 眨眼 | 表情动画 | 23帧 |

**文件结构**：
```
public/assets/penguin_original/
├── GG/
│   ├── xiuxian.png      (Sprite Sheet 图片)
│   ├── xiuxian.json     (帧位置配置)
│   ├── chifan.png
│   ├── chifan.json
│   └── ...
└── MM/
    ├── xiuxian.png
    ├── xiuxian.json
    └── ...
```

---

## 🎨 素材格式说明

### Sprite Sheet（精灵图集）

每个动画包含两个文件：

1. **PNG文件** - 所有动画帧拼接成一张大图
   - 尺寸：每帧 140x140 像素
   - 所有帧横向或纵向排列

2. **JSON文件** - 描述每一帧的位置
   ```json
   {
     "frames": {
       "0001.png": {
         "frame": { "x": 0, "y": 0, "w": 140, "h": 140 },
         "sourceSize": { "w": 140, "h": 140 }
       },
       "0002.png": { ... },
       ...
     },
     "meta": {
       "image": "xiuxian.png",
       "scale": 1
     }
   }
   ```

---

## 🚀 如何使用

### 方式1：使用新的 QQPenguinSprite 组件（推荐）

已创建完整的组件，支持所有原版动画：

```tsx
import { QQPenguinSprite } from './components/QQPenguinSprite'

function App() {
  return (
    <QQPenguinSprite
      type="GG"          // 'GG' 或 'MM'
      action="idle"      // 使用现有的动作名
      scale={1.2}        // 缩放
      fps={12}           // 帧率
      showEntrance={true}
      onClick={() => console.log('点击企鹅')}
    />
  )
}
```

### 动作映射

组件会自动将你现有的动作名映射到真实素材：

| 你的动作 | 对应素材 | 说明 |
|---------|---------|------|
| `idle` | xiuxian | 待机 |
| `eat` | chifan | 吃饭 |
| `bathe` | xizao | 洗澡 |
| `happy` | zhaoshou | 招手/开心 |
| `play` | huaban | 滑板/玩耍 |
| `sad` | zayan | 眨眼/难过 |
| `angry` | zayan | 眨眼 |
| `sleep` | xiuxian | 休闲 |
| `work` | xiuxian | 休闲 |

### 方式2：在 App.tsx 中切换

修改 `App.tsx`，从占位符切换到真实素材：

```tsx
// 原来的
import { QQPenguinPlaceholder } from './components/QQPenguinPlaceholder'

// 改为
import { QQPenguinSprite } from './components/QQPenguinSprite'

// 使用
<QQPenguinSprite
  type="GG"
  action={penguinAction}
  scale={1}
  showEntrance={showPenguinEntrance}
  onClick={handlePenguinClick}
/>
```

---

## 🎯 测试步骤

### 1. 启动项目
```bash
npm run dev
```

### 2. 测试动画

打开浏览器，你应该看到：
- ✅ 真实的QQ宠物企鹅
- ✅ 流畅的帧动画
- ✅ 入场动画
- ✅ 点击交互

### 3. 测试不同动作

在开发者工具控制台测试：

```javascript
// 测试吃饭
setPenguinAction('eat')

// 测试洗澡
setPenguinAction('bathe')

// 测试玩耍
setPenguinAction('play')

// 测试开心
setPenguinAction('happy')
```

### 4. 切换企鹅类型

想要女性企鹅（MM）？

```tsx
<QQPenguinSprite type="MM" action="idle" />
```

---

## 🎨 自定义配置

### 调整帧率

```tsx
<QQPenguinSprite fps={24} />  // 更快
<QQPenguinSprite fps={8} />   // 更慢
```

### 调整大小

```tsx
<QQPenguinSprite scale={1.5} />  // 放大
<QQPenguinSprite scale={0.8} />  // 缩小
```

### 禁用入场动画

```tsx
<QQPenguinSprite showEntrance={false} />
```

---

## 🔧 技术细节

### Canvas 渲染

组件使用 Canvas 2D 渲染 Sprite Sheet：

1. 加载 JSON 配置和 PNG 图片
2. 根据 JSON 定位每一帧
3. 使用 `requestAnimationFrame` 控制帧率
4. 在 Canvas 上绘制当前帧

### 性能优化

- ✅ 图片预加载
- ✅ Canvas 硬件加速
- ✅ requestAnimationFrame 节流
- ✅ 组件卸载时清理动画

---

## 📊 对比

### 占位符 vs 原版素材

| 特性 | QQPenguinPlaceholder | QQPenguinSprite |
|------|---------------------|-----------------|
| 素材来源 | CSS绘制 | QQ宠物原版 |
| 动画质量 | 简单动画 | 高质量帧动画 |
| 文件大小 | 无需文件 | ~200KB/动画 |
| 加载速度 | 立即 | 需加载 |
| 自定义性 | 高 | 中 |
| 还原度 | 60% | 100% ✅ |

---

## 🐛 故障排除

### Q1: 企鹅不显示，一直显示"加载中..."

**检查**：
1. 确认素材路径：`public/assets/penguin_original/GG/` 存在
2. 打开浏览器控制台，查看是否有 404 错误
3. 确认 JSON 和 PNG 文件都存在

**解决**：
```bash
# 重新复制素材
cd /tmp/QQPet13
cp -r res/atlas/ui/ani/* /Users/erase/Desktop/react_Project/pet/public/assets/penguin_original/
```

### Q2: 动画太快/太慢

**调整 FPS**：
```tsx
<QQPenguinSprite fps={12} />  // 默认12帧/秒
```

### Q3: 想要更多动画

**查看仓库**：
```bash
cd /tmp/QQPet13
ls res/atlas/ui/ani/GG/
```

如果有其他动画文件，复制过来并更新 `PenguinSpriteAction` 类型。

### Q4: Canvas 模糊

**调整像素渲染**：
在 `QQPenguinSprite.css` 中已经设置了：
```css
image-rendering: pixelated;
```

---

## 🎉 下一步

### 已完成 ✅
- ✅ 集成QQ宠物原版素材
- ✅ 创建 Sprite Sheet 渲染组件
- ✅ 支持 GG 和 MM 两个版本
- ✅ 6种动画完整支持
- ✅ 动作自动映射

### 可以添加（可选）
- [ ] 更多动画（如果仓库有）
- [ ] 切换 GG/MM 的 UI
- [ ] 动画队列（连续播放多个动画）
- [ ] 音效支持
- [ ] 粒子效果

---

## 📚 参考资源

- **原仓库**: https://github.com/ice-cream-headache/QQPet13
- **LayaBox文档**: https://ldc2.layabox.com/doc/
- **Sprite Sheet教程**: https://www.codeandweb.com/what-is-a-sprite-sheet

---

**恭喜！你现在拥有了真正的QQ宠物企鹅！** 🐧🎉

现在启动项目，享受原汁原味的QQ宠物体验吧！

```bash
npm run dev
```
