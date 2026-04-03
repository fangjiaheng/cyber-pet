import { useEffect, useState } from 'react'
import './components/PetBubble.css'

/**
 * 独立气泡窗口页面
 * 通过 URL hash 接收参数: #/bubble?text=xxx&duration=3000
 */
export default function BubblePage() {
  const [isVisible, setIsVisible] = useState(false)

  // 从 URL hash 中解析参数
  const hash = window.location.hash
  const params = new URLSearchParams(hash.replace('#/bubble?', ''))
  const text = decodeURIComponent(params.get('text') || '')
  const duration = parseInt(params.get('duration') || '3000', 10)

  useEffect(() => {
    // 延迟显示，触发入场动画
    const showTimer = window.setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // 到时间后自动关闭
    let hideTimer: number | undefined
    if (duration > 0) {
      hideTimer = window.setTimeout(() => {
        handleClose()
      }, duration)
    }

    return () => {
      window.clearTimeout(showTimer)
      if (hideTimer) window.clearTimeout(hideTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    window.setTimeout(() => {
      window.electronAPI?.closeBubble?.()
    }, 300)
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <div
        className={`pet-bubble pet-bubble--standalone ${isVisible ? 'visible' : ''}`}
      >
        <div className="bubble-content">
          <p>{text}</p>
          <button className="bubble-ok-btn" onClick={handleClose}>
            <img
              src="/assets/1.2.4source/tip/alert/btnok_00.png"
              alt="确定"
              draggable={false}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
