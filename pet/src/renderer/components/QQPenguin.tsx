/**
 * QQ宠物企鹅组件
 * 使用序列帧动画实现经典企鹅形象
 */

import React, { useState, useEffect, useRef } from 'react'
import './QQPenguin.css'

// 动画类型定义
export type PenguinAction =
  | 'idle'      // 待机
  | 'walk'      // 走路
  | 'run'       // 跑步
  | 'sit'       // 坐下
  | 'sleep'     // 睡觉
  | 'eat'       // 吃东西
  | 'bathe'     // 洗澡
  | 'play'      // 玩耍
  | 'work'      // 工作
  | 'happy'     // 开心
  | 'sad'       // 难过
  | 'angry'     // 生气

// 动画配置（根据提取的帧数调整）
const ANIMATION_CONFIG: Record<PenguinAction, {
  frames: number,      // 总帧数
  fps: number,         // 帧率
  loop: boolean,       // 是否循环
  folder: string       // 文件夹名称
}> = {
  idle: { frames: 8, fps: 8, loop: true, folder: 'idle' },
  walk: { frames: 12, fps: 12, loop: true, folder: 'walk' },
  run: { frames: 10, fps: 15, loop: true, folder: 'run' },
  sit: { frames: 6, fps: 8, loop: false, folder: 'sit' },
  sleep: { frames: 4, fps: 4, loop: true, folder: 'sleep' },
  eat: { frames: 16, fps: 12, loop: false, folder: 'eat' },
  bathe: { frames: 20, fps: 12, loop: false, folder: 'bathe' },
  play: { frames: 24, fps: 15, loop: false, folder: 'play' },
  work: { frames: 12, fps: 8, loop: true, folder: 'work' },
  happy: { frames: 10, fps: 10, loop: false, folder: 'happy' },
  sad: { frames: 8, fps: 8, loop: false, folder: 'sad' },
  angry: { frames: 8, fps: 10, loop: false, folder: 'angry' },
}

interface QQPenguinProps {
  action?: PenguinAction
  scale?: number
  onAnimationComplete?: () => void
  onClick?: () => void
  showEntrance?: boolean  // 是否显示入场动画
}

export const QQPenguin: React.FC<QQPenguinProps> = ({
  action = 'idle',
  scale = 1,
  onAnimationComplete,
  onClick,
  showEntrance = false,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isEntering, setIsEntering] = useState(showEntrance)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const animationRef = useRef<number>()
  const lastFrameTimeRef = useRef<number>(Date.now())

  const config = ANIMATION_CONFIG[action]
  const frameDuration = 1000 / config.fps

  // 入场动画：从上方掉落+旋转
  useEffect(() => {
    if (showEntrance) {
      setPosition({ x: 0, y: -200 })
      setRotation(-360)

      setTimeout(() => {
        setPosition({ x: 0, y: 0 })
        setRotation(0)
        setIsEntering(false)
      }, 100)
    }
  }, [showEntrance])

  // 序列帧动画循环
  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const elapsed = now - lastFrameTimeRef.current

      if (elapsed >= frameDuration) {
        setCurrentFrame((prev) => {
          const next = prev + 1

          // 动画播放完成
          if (next >= config.frames) {
            if (config.loop) {
              return 0
            } else {
              onAnimationComplete?.()
              return prev // 停留在最后一帧
            }
          }

          return next
        })

        lastFrameTimeRef.current = now
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [action, config.frames, config.loop, frameDuration, onAnimationComplete])

  // 切换动作时重置帧
  useEffect(() => {
    setCurrentFrame(0)
    lastFrameTimeRef.current = Date.now()
  }, [action])

  // 点击交互：弹跳+旋转
  const handleClick = () => {
    setRotation(360)
    setTimeout(() => setRotation(0), 500)
    onClick?.()
  }

  // 构建当前帧的图片路径
  // 假设提取的图片命名为：idle_0.png, idle_1.png, ...
  const framePath = `/assets/penguin/${config.folder}/${config.folder}_${currentFrame}.png`

  return (
    <div
      className={`qq-penguin-container ${isEntering ? 'entering' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
        transition: isEntering ? 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.5s ease-out',
      }}
      onClick={handleClick}
    >
      <img
        src={framePath}
        alt={`企鹅-${action}`}
        className="penguin-sprite"
        draggable={false}
      />

      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <div>Action: {action}</div>
          <div>Frame: {currentFrame}/{config.frames}</div>
          <div>FPS: {config.fps}</div>
        </div>
      )}
    </div>
  )
}

export default QQPenguin
