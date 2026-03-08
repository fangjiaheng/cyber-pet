/**
 * QQ宠物企鹅 - Sprite Sheet版本
 * 使用从 GitHub 仓库获取的原版素材
 * 支持 GG（哥哥）和 MM（妹妹）两个版本
 */

import React, { useState, useEffect, useRef } from 'react'
import './QQPenguinSprite.css'

// 企鹅类型
export type PenguinType = 'GG' | 'MM'

// 动画类型（对应文件名）
export type PenguinSpriteAction =
  | 'xiuxian'   // 休闲/待机
  | 'chifan'    // 吃饭
  | 'xizao'     // 洗澡
  | 'zhaoshou'  // 招手
  | 'huaban'    // 滑板
  | 'zayan'     // 眨眼

// 动画配置映射到我们现有的动作
export const ACTION_MAPPING: Record<string, PenguinSpriteAction> = {
  idle: 'xiuxian',
  eat: 'chifan',
  bathe: 'xizao',
  happy: 'zhaoshou',
  play: 'huaban',
  sad: 'zayan',
  angry: 'zayan',
  sleep: 'xiuxian',
  work: 'xiuxian',
  walk: 'xiuxian',
  run: 'huaban',
  sit: 'xiuxian',
}

// Sprite Sheet 帧信息接口
interface SpriteFrame {
  frame: {
    x: number
    y: number
    w: number
    h: number
  }
  sourceSize: {
    w: number
    h: number
  }
}

interface SpriteSheetData {
  frames: Record<string, SpriteFrame>
  meta: {
    image: string
    scale: number
  }
}

interface QQPenguinSpriteProps {
  type?: PenguinType
  action?: string  // 使用现有的动作名
  scale?: number
  fps?: number
  onClick?: () => void
}

export const QQPenguinSprite: React.FC<QQPenguinSpriteProps> = ({
  type = 'GG',
  action = 'idle',
  scale = 1,
  fps = 12,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [spriteData, setSpriteData] = useState<SpriteSheetData | null>(null)
  const [spriteImage, setSpriteImage] = useState<HTMLImageElement | null>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const animationRef = useRef<number>()
  const lastFrameTimeRef = useRef<number>(Date.now())

  // 映射到真实的动作名
  const spriteAction = ACTION_MAPPING[action] || 'xiuxian'

  // 加载 Sprite Sheet 数据和图片
  useEffect(() => {
    const loadSprite = async () => {
      try {
        // 加载 JSON 配置
        const jsonPath = `/assets/penguin_original/${type}/${spriteAction}.json`
        const response = await fetch(jsonPath)
        const data: SpriteSheetData = await response.json()
        setSpriteData(data)

        // 加载图片
        const img = new Image()
        img.src = `/assets/penguin_original/${type}/${spriteAction}.png`
        img.onload = () => setSpriteImage(img)
      } catch (error) {
        console.error('加载企鹅素材失败:', error)
      }
    }

    loadSprite()
  }, [type, spriteAction])

  // 绘制当前帧
  useEffect(() => {
    if (!spriteData || !spriteImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 获取所有帧
    const frames = Object.keys(spriteData.frames).sort()
    if (frames.length === 0) return

    const frameKey = frames[currentFrame % frames.length]
    const frameData = spriteData.frames[frameKey]

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制当前帧
    ctx.drawImage(
      spriteImage,
      frameData.frame.x,
      frameData.frame.y,
      frameData.frame.w,
      frameData.frame.h,
      0,
      0,
      canvas.width,
      canvas.height
    )
  }, [spriteData, spriteImage, currentFrame])

  // 动画循环
  useEffect(() => {
    if (!spriteData) return

    const frames = Object.keys(spriteData.frames).sort()
    const frameDuration = 1000 / fps

    const animate = () => {
      const now = Date.now()
      const elapsed = now - lastFrameTimeRef.current

      if (elapsed >= frameDuration) {
        setCurrentFrame((prev) => (prev + 1) % frames.length)
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
  }, [spriteData, fps])

  // 点击交互（保留供后续使用）
  const handleClick = () => {
    onClick?.()
  }

  // 如果还没加载，显示占位符
  if (!spriteData || !spriteImage) {
    return (
      <div className="penguin-sprite-loading">
        <div className="loading-spinner">🐧</div>
        <div className="loading-text">加载中...</div>
      </div>
    )
  }

  // 画布尺寸（固定为素材的原始尺寸）
  const canvasSize = 140

  return (
    <div
      className="qq-penguin-sprite"
      style={{
        transform: `scale(${scale})`,
      }}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="penguin-canvas"
      />

      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <div>类型: {type}</div>
          <div>动作: {spriteAction}</div>
          <div>帧: {currentFrame + 1}/{Object.keys(spriteData.frames).length}</div>
          <div>FPS: {fps}</div>
        </div>
      )}
    </div>
  )
}

export default QQPenguinSprite
