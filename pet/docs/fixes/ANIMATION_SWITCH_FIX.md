# ✅ 动画切换显示问题修复

## 问题描述

切换动画时：
- ✅ 能听到新动画的音效
- ❌ 但画面还是显示旧动画

## 问题根源

**React 组件复用问题**

```tsx
// ❌ 没有 key 属性
<RufflePlayer src={selectedSwf} />

// 当 selectedSwf 改变时：
// - React 认为这还是同一个组件实例
// - 只更新 props，不重新创建组件
// - 旧的 DOM 元素可能还在显示
```

虽然我们在 `RufflePlayer` 的 `useEffect` 中有清理逻辑，但由于异步执行和 DOM 操作时序问题，旧的 player 视觉元素可能没有完全清除。

## 解决方案

**添加 `key` 属性强制组件重新创建**

```tsx
// ✅ 添加 key 属性
<RufflePlayer
  key={selectedSwf}  // ← 关键！
  src={selectedSwf}
/>

// 现在当 selectedSwf 改变时：
// 1. React 完全卸载旧组件（触发 cleanup）
// 2. 创建全新的组件实例
// 3. 执行新组件的 useEffect（加载新动画）
```

## 修改文件

**src/renderer/components/SwfGallery.tsx**

```diff
  <div className="player-wrapper">
    <RufflePlayer
+     key={selectedSwf}
      src={selectedSwf}
      width={200}
      height={200}
      scale={1.5}
      onError={(error) => setLoadError(error.message)}
    />
  </div>
```

## React key 属性原理

在 React 中，`key` 属性用于标识组件的唯一性：

- **相同的 key**：React 认为是同一个组件，只更新 props
- **不同的 key**：React 认为是不同的组件，会：
  1. 卸载旧组件（调用 cleanup/useEffect return）
  2. 创建新组件（调用 useEffect）

对于我们的场景：
```typescript
// 第一次：key="/assets/swf_original/GG/chang/1.swf"
<RufflePlayer key={swf1} src={swf1} />

// 切换动画：key="/assets/swf_original/GG/chang/2.swf"
<RufflePlayer key={swf2} src={swf2} />
// ↑ key 不同，React 会完全重新创建组件
```

## 测试步骤

重启开发服务器：
```bash
npm run dev
```

测试切换动画：
1. 打开动画画廊（🎬 按钮）
2. 点击"常规动作" → "动作1" ✅ 显示动作1画面
3. 点击"动作2" ✅ 画面和音效都切换到动作2
4. 点击"动作3" ✅ 画面和音效都切换到动作3
5. 切换分类到"饮食活动" → "吃饭1" ✅ 正常显示
6. 继续切换其他动画 ✅ 都能正常显示

## 预期效果

现在每次点击新动画：
- ✅ 画面立即切换
- ✅ 音效正确播放
- ✅ 没有残留的旧画面
- ✅ 没有多个动画同时播放

## 技术总结

这个问题的核心在于：
1. **组件复用** vs **组件重建**
2. **异步清理** vs **同步销毁**

使用 `key` 属性是 React 中处理需要完全重建的组件的标准做法，特别是对于：
- 嵌入式播放器（视频、Flash、音频）
- 第三方库包装的组件
- 需要完全重置内部状态的组件

通过设置 `key={selectedSwf}`，我们确保每次动画切换时：
1. 旧组件被完全销毁（DOM、事件监听器、内存）
2. 新组件从零开始创建
3. 不会有任何残留状态或 DOM 元素

## 相关代码

### RufflePlayer.tsx 的清理逻辑
```typescript
useEffect(() => {
  // ... 加载 Ruffle 和 SWF

  // 返回清理函数
  return () => {
    if (ruffleInstanceRef.current) {
      try {
        ruffleInstanceRef.current.destroy()
      } catch (e) {
        console.warn('清理 player 时出错:', e)
      }
      ruffleInstanceRef.current = null
    }
  }
}, [src])
```

这个清理函数会在：
- 组件卸载时执行
- src 改变时（重新执行 effect 之前）执行

但如果没有 `key` 属性，React 不会卸载组件，只会在 src 改变时重新执行 effect。这可能导致时序问题：
- 清理旧 player 和创建新 player 几乎同时发生
- DOM 操作可能冲突
- 旧的视觉元素可能还没完全移除

添加 `key` 属性后，清理和创建是两个独立的步骤，不会冲突。
