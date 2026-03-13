import React, { useEffect, useRef } from 'react'
import './ContextMenu.css'

export interface MenuItem {
  label: string
  icon?: string
  onClick: () => void
  divider?: boolean
  disabled?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  items: MenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleWindowBlur = () => {
      onClose()
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [onClose])

  // 确保菜单不会超出屏幕
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let adjustedX = x
      let adjustedY = y

      if (x + rect.width > viewportWidth) {
        adjustedX = Math.max(12, x - rect.width - 14)
      }

      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 12
      }

      if (adjustedX < 12) {
        adjustedX = 12
      }

      if (adjustedY < 12) {
        adjustedY = 12
      }

      menuRef.current.style.left = `${adjustedX}px`
      menuRef.current.style.top = `${adjustedY}px`
    }
  }, [x, y])

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled) {
      item.onClick()
      onClose()
    }
  }

  return (
    <div
      className="context-menu-overlay"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={() => onClose()}
    >
      <div
        ref={menuRef}
        className="context-menu"
        style={{ left: x, top: y }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {items.map((item, index) => (
          item.divider ? (
            <div key={index} className="context-menu-divider" />
          ) : (
            <div
              key={index}
              className={`context-menu-item ${item.disabled ? 'disabled' : ''} ${item.icon ? 'has-icon' : 'text-only'}`}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && <span className="context-menu-icon">{item.icon}</span>}
              <span className="context-menu-label">{item.label}</span>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
