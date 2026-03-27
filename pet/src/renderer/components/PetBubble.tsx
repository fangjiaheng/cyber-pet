import { useEffect, useState } from 'react'
import './PetBubble.css'

interface PetBubbleProps {
  text: string
  placement?: 'above' | 'below'
  duration?: number
  onClose?: () => void
}

export function PetBubble({
  text,
  placement = 'above',
  duration = 3000,
  onClose,
}: PetBubbleProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const showTimer = window.setTimeout(() => {
      setIsVisible(true)
    }, 100)

    if (duration > 0) {
      const hideTimer = window.setTimeout(() => {
        setIsVisible(false)
        window.setTimeout(() => {
          onClose?.()
        }, 300)
      }, duration)

      return () => {
        window.clearTimeout(showTimer)
        window.clearTimeout(hideTimer)
      }
    }

    return () => {
      window.clearTimeout(showTimer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    window.setTimeout(() => {
      onClose?.()
    }, 300)
  }

  return (
    <div className={`pet-bubble pet-bubble--${placement} ${isVisible ? 'visible' : ''}`}>
      <div className="bubble-content">
        <p>{text}</p>
        <button className="bubble-close-btn" onClick={handleClose}>
          Close
        </button>
      </div>
    </div>
  )
}
