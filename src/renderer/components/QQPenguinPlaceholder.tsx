/* ⚠️ 已废弃 - 项目已切换到 SWF + Ruffle 方案 */

/*
/**
 * QQ企鹅占位符组件
 * 在提取真实素材前使用，用CSS绘制简化版企鹅
 */

import React, { useState, useEffect } from 'react'
import './QQPenguinPlaceholder.css'

export type PenguinAction =
  | 'idle' | 'walk' | 'run' | 'sit' | 'sleep'
  | 'eat' | 'bathe' | 'play' | 'work'
  | 'happy' | 'sad' | 'angry'

interface QQPenguinPlaceholderProps {
  action?: PenguinAction
  scale?: number
  onClick?: () => void
  showEntrance?: boolean
}

export const QQPenguinPlaceholder: React.FC<QQPenguinPlaceholderProps> = ({
  action = 'idle',
  scale = 1,
  onClick,
  showEntrance = false,
}) => {
  const [isEntering, setIsEntering] = useState(showEntrance)
  const [rotation, setRotation] = useState(0)

  // 入场动画
  useEffect(() => {
    if (showEntrance) {
      setRotation(-360)
      setTimeout(() => {
        setRotation(0)
        setIsEntering(false)
      }, 100)
    }
  }, [showEntrance])

  // 点击交互
  const handleClick = () => {
    setRotation(360)
    setTimeout(() => setRotation(0), 500)
    onClick?.()
  }

  return (
    <div
      className={`penguin-placeholder penguin-${action} ${isEntering ? 'entering' : ''}`}
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
      }}
      onClick={handleClick}
    >
      {/* 企鹅身体 */}
      <div className="penguin-body">
        {/* 脸部 */}
        <div className="penguin-face">
          {/* 眼睛 */}
          <div className="penguin-eyes">
            <div className={`eye left ${action === 'sleep' ? 'closed' : ''}`}></div>
            <div className={`eye right ${action === 'sleep' ? 'closed' : ''}`}></div>
          </div>
          {/* 嘴巴 */}
          <div className={`penguin-beak ${action}`}></div>
        </div>

        {/* 腮红（开心时显示） */}
        {action === 'happy' && (
          <>
            <div className="blush left"></div>
            <div className="blush right"></div>
          </>
        )}

        {/* 肚皮 */}
        <div className="penguin-belly"></div>

        {/* 翅膀 */}
        <div className="penguin-wing left"></div>
        <div className="penguin-wing right"></div>
      </div>

      {/* 脚 */}
      <div className="penguin-feet">
        <div className="foot left"></div>
        <div className="foot right"></div>
      </div>

      {/* 动作特效 */}
      {action === 'eat' && <div className="effect food">🍖</div>}
      {action === 'bathe' && <div className="effect bubbles">💧</div>}
      {action === 'play' && <div className="effect toy">🎾</div>}
      {action === 'work' && <div className="effect laptop">💻</div>}
      {action === 'sleep' && <div className="effect zzz">💤</div>}

      {/* 提示文字 */}
      <div className="placeholder-hint">
        临时占位符 - 提取真实素材后替换
      </div>
    </div>
  )
}

export default QQPenguinPlaceholder
*/
