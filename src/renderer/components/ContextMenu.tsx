import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  const menuRootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [activeItemLabel, setActiveItemLabel] = useState<string | null>(null)
  const [submenuPosition, setSubmenuPosition] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    setActiveItemLabel(null)
    setSubmenuPosition(null)
  }, [items])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRootRef.current && !menuRootRef.current.contains(event.target as Node)) {
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

  useLayoutEffect(() => {
    if (!activeItemLabel || !activeItem?.children?.length || !menuRef.current) {
      setSubmenuPosition(null)
      return
    }

    const menuRect = menuRef.current.getBoundingClientRect()
    const activeItemRect = itemRefs.current[activeItemLabel]?.getBoundingClientRect()

    if (!activeItemRect) {
      setSubmenuPosition({
        left: Math.round(menuRect.right),
        top: Math.round(menuRect.top),
      })
      return
    }

    setSubmenuPosition({
      left: Math.round(menuRect.right),
      top: Math.round(activeItemRect.top),
    })
  }, [activeItem, activeItemLabel, items, x, y])

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
      <div ref={menuRootRef}>
        <div
          ref={menuRef}
          className={`context-menu ${ready ? '' : 'context-menu--hidden'}`}
          style={{ left: x, top: y }}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="context-menu__column">
            {items.map((item, index) => (
              item.divider ? (
                <div key={index} className="context-menu-divider" />
              ) : (
                <div
                  key={index}
                  ref={(node) => { itemRefs.current[item.label] = node }}
                  className={`context-menu-item ${item.disabled ? 'disabled' : ''} ${activeItemLabel === item.label ? 'active' : ''}`}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => {
                    if (item.disabled) return
                    setActiveItemLabel(item.children?.length ? item.label : null)
                  }}
                >
                  <span className="context-menu-label">{item.label}</span>
                  {item.children?.length ? <span className="context-menu-chevron">&gt;</span> : null}
                </div>
              )
            ))}
          </div>
        </div>

        {activeItem?.children?.length && submenuPosition ? (
          <div
            className={`context-menu context-menu--submenu-popout ${ready ? '' : 'context-menu--hidden'}`}
            style={{ left: submenuPosition.left, top: submenuPosition.top }}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="context-menu__column">
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
          </div>
        ) : null}
      </div>
    </div>
  )
}
