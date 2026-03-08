/**
 * 企鹅对话气泡组件
 * 使用原版素材 wors_bg.png 作为背景
 */

import React, { useEffect, useState } from 'react'
import './PetBubble.css'

interface PetBubbleProps {
  text: string
  duration?: number  // 显示时长（毫秒），0 表示不自动消失
  onClose?: () => void
}

export const PetBubble: React.FC<PetBubbleProps> = ({
  text,
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 延迟一点再显示，让动画更自然
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // 如果设置了自动消失时长
    if (duration > 0) {
      const hideTimer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onClose?.()
        }, 300) // 等待淡出动画完成
      }, duration)

      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    }

    return () => {
      clearTimeout(showTimer)
    }
  }, [duration, onClose])

  return (
    <div className={`pet-bubble ${isVisible ? 'visible' : ''}`}>
      <div className="bubble-content">
        <p>{text}</p>
      </div>
    </div>
  )
}
