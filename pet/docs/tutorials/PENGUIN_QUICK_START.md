# 🐧 QQ企鹅快速开始指南

## 🎯 两种实现方案

### 方案A：使用占位符（立即可用）✅

在提取真实素材之前，先用CSS绘制的企鹅快速验证功能。

```tsx
import { QQPenguinPlaceholder } from './components/QQPenguinPlaceholder'

function App() {
  return (
    <QQPenguinPlaceholder
      action="idle"
      showEntrance={true}
      onClick={() => console.log('企鹅被点击')}
    />
  )
}
```

### 方案B：使用真实素材（需要提取）

从QQ宠物客户端提取序列帧后使用。

```tsx
import { QQPenguin } from './components/QQPenguin'

function App() {
  return (
    <QQPenguin
      action="idle"
      showEntrance={true}
      onClick={() => console.log('企鹅被点击')}
    />
  )
}
```

---

## 📝 修改现有 App.tsx

找到 `src/renderer/App.tsx`，替换企鹅显示部分：

```tsx
import React, { useState } from 'react'
import { QQPenguinPlaceholder, type PenguinAction } from './components/QQPenguinPlaceholder'
// 提取素材后改为：
// import { QQPenguin, type PenguinAction } from './components/QQPenguin'

function App() {
  const [penguinAction, setPenguinAction] = useState<PenguinAction>('idle')

  // 喂食时的动画
  const handleFeed = () => {
    setPenguinAction('eat')
    setTimeout(() => setPenguinAction('idle'), 2000)
  }

  // 清洁时的动画
  const handleClean = () => {
    setPenguinAction('bathe')
    setTimeout(() => setPenguinAction('idle'), 2500)
  }

  // 玩耍时的动画
  const handlePlay = () => {
    setPenguinAction('play')
    setTimeout(() => setPenguinAction('idle'), 3000)
  }

  // 休息时的动画
  const handleRest = () => {
    setPenguinAction('sleep')
    // 睡觉是循环动画，需要手动结束
  }

  // 点击企鹅的交互
  const handlePenguinClick = () => {
    if (penguinAction === 'idle') {
      setPenguinAction('happy')
      setTimeout(() => setPenguinAction('idle'), 1500)
    }
  }

  return (
    <div className="app">
      <div className="pet-container">
        {/* 使用占位符企鹅 */}
        <QQPenguinPlaceholder
          action={penguinAction}
          scale={1.2}
          showEntrance={true}
          onClick={handlePenguinClick}
        />

        {/* 功能按钮 */}
        <div className="pet-actions">
          <button onClick={handleFeed}>🍖 喂食</button>
          <button onClick={handleClean}>🚿 清洁</button>
          <button onClick={handlePlay}>🎾 玩耍</button>
          <button onClick={handleRest}>💤 休息</button>
        </div>
      </div>
    </div>
  )
}

export default App
```

---

## 🎬 动画效果列表

| 动作 | 描述 | 循环 | 适用场景 |
|------|------|------|----------|
| `idle` | 待机 | ✅ | 默认状态 |
| `walk` | 走路 | ✅ | 移动时 |
| `run` | 跑步 | ✅ | 快速移动 |
| `sit` | 坐下 | ❌ | 休息前 |
| `sleep` | 睡觉 | ✅ | 恢复能量 |
| `eat` | 吃东西 | ❌ | 喂食时 |
| `bathe` | 洗澡 | ❌ | 清洁时 |
| `play` | 玩耍 | ❌ | 互动时 |
| `work` | 工作 | ✅ | 完成任务时 |
| `happy` | 开心 | ❌ | 点击/完成任务 |
| `sad` | 难过 | ❌ | 饥饿/脏污 |
| `angry` | 生气 | ❌ | 被忽视 |

---

## 🎨 提取真实素材的步骤

详细步骤请参考 `PENGUIN_SETUP.md`，这里是简化版：

### 1. 下载QQ宠物客户端
```bash
# 下载地址
http://do1.3h3.com/QQPet37.exe

# 或访问 B站教程
https://www.bilibili.com/video/BV1PF411t7nX/
```

### 2. 下载提取工具
```bash
# JPEXS Free Flash Decompiler
https://github.com/jindrapetrik/jpexs-decompiler
```

### 3. 提取步骤
```
1. 用JPEXS打开 QQPet安装目录/res/pet.swf
2. 找到 sprites → penguin_idle 等 MovieClip
3. 右键 → Export Selection → PNG Sequence
4. 导出到 public/assets/penguin/idle/
5. 重命名为 idle_0.png, idle_1.png, ...
```

### 4. 切换到真实素材
```tsx
// 在 App.tsx 中改为
import { QQPenguin } from './components/QQPenguin'
```

---

## 🎯 核心功能实现

### 入场动画
```tsx
<QQPenguin showEntrance={true} />
// 企鹅从上方掉落+旋转360度
```

### 点击交互
```tsx
<QQPenguin
  onClick={() => {
    // 企鹅会旋转+弹跳
    console.log('被点击了！')
  }}
/>
```

### 动画完成回调
```tsx
<QQPenguin
  action="eat"
  onAnimationComplete={() => {
    console.log('吃完了！')
    setAction('idle')
  }}
/>
```

### 动态缩放
```tsx
<QQPenguin scale={1.5} />  // 放大1.5倍
<QQPenguin scale={0.8} />  // 缩小到0.8倍
```

---

## 🔧 调试模式

在开发环境下会显示调试信息：

```
Action: eat
Frame: 8/16
FPS: 12
```

可以用来：
- 检查当前播放的帧
- 调整帧率
- 验证动画是否正确加载

---

## 🚀 性能优化

### 使用 requestAnimationFrame
组件使用 RAF 而非 setInterval，更流畅且省电。

### 图片预加载（可选）
```tsx
useEffect(() => {
  // 预加载所有动画帧
  const preloadImages = async () => {
    const actions = ['idle', 'walk', 'eat', 'play']
    for (const action of actions) {
      for (let i = 0; i < 12; i++) {
        const img = new Image()
        img.src = `/assets/penguin/${action}/${action}_${i}.png`
      }
    }
  }
  preloadImages()
}, [])
```

### WebP 格式（体积更小）
```bash
# 转换PNG到WebP
cd public/assets/penguin/idle
for file in *.png; do
  cwebp "$file" -o "${file%.png}.webp"
done
```

然后修改 `QQPenguin.tsx`:
```tsx
const framePath = `/assets/penguin/${config.folder}/${config.folder}_${currentFrame}.webp`
```

---

## 📚 下一步

1. ✅ **现在就能用**：使用 `QQPenguinPlaceholder` 快速验证功能
2. 📦 **提取素材**：按照 `PENGUIN_SETUP.md` 提取真实企鹅
3. 🎨 **替换组件**：从 Placeholder 切换到 QQPenguin
4. 🚀 **增强功能**：添加声音、粒子效果、更多交互

---

## 🐛 常见问题

**Q: 占位符企鹅不显示？**
```bash
# 检查组件是否正确导入
import { QQPenguinPlaceholder } from './components/QQPenguinPlaceholder'
import './components/QQPenguinPlaceholder.css'
```

**Q: 真实素材不显示？**
```bash
# 检查图片路径
public/assets/penguin/idle/idle_0.png  ✅
src/assets/penguin/idle/idle_0.png     ❌ (错误)

# 检查浏览器控制台是否有404错误
```

**Q: 动画太快/太慢？**
```tsx
// 在 QQPenguin.tsx 中调整 fps
const ANIMATION_CONFIG = {
  idle: { frames: 8, fps: 12, ... }  // 增加fps加快，减少fps减慢
}
```

**Q: 图片背景不透明？**
```bash
# 重新用JPEXS导出，勾选 "Transparent background"
# 或使用 ImageMagick 批量去背景：
mogrify -transparent white *.png
```

---

**祝你复刻成功！** 🎉

有问题随时问，我会继续帮你完善！
