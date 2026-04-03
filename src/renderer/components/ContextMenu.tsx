import { useEffect, useRef, useState } from 'react'
import './ContextMenu.css'

export interface MenuItem {
  label: string
  onClick: () => void
  divider?: boolean
  disabled?: boolean
  children?: MenuItem[]
}

interface ContextMenuProps {
  x: number
  y: number
  ready?: boolean
  items: MenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, ready = true, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [activeItemLabel, setActiveItemLabel] = useState<string | null>(null)

  useEffect(() => {
    setActiveItemLabel(null)
  }, [items])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  const activeItem = items.find((item) => item.label === activeItemLabel && item.children?.length)

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return

    if (item.children?.length) {
      setActiveItemLabel(item.label)
      return
    }

    item.onClick()
    onClose()
  }

  return (
    <div
      className="context-menu-overlay"
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={() => onClose()}
    >
      <div
        ref={menuRef}
        className={`context-menu ${ready ? '' : 'context-menu--hidden'}`}
        style={{ left: x, top: y }}
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="context-menu__rail">
          <div className="context-menu__column">
            {items.map((item, index) => (
              item.divider ? (
                <div key={index} className="context-menu-divider" />
              ) : (
                <div
                  key={index}
                  className={`context-menu-item ${item.disabled ? 'disabled' : ''} ${activeItemLabel === item.label ? 'active' : ''}`}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => {
                    if (item.children?.length && !item.disabled) {
                      setActiveItemLabel(item.label)
                    }
                  }}
                >
                  <span className="context-menu-label">{item.label}</span>
                  {item.children?.length ? <span className="context-menu-chevron">&gt;</span> : null}
                </div>
              )
            ))}
          </div>

          {activeItem?.children?.length ? (
            <div className="context-menu__column context-menu__column--submenu">
              {activeItem.children.map((item, index) => (
                item.divider ? (
                  <div key={index} className="context-menu-divider" />
                ) : (
                  <div
                    key={index}
                    className={`context-menu-item ${item.disabled ? 'disabled' : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className="context-menu-label">{item.label}</span>
                  </div>
                )
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
