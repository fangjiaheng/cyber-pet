import React, { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './ActionDropdownMenu.css'

export interface ActionDropdownMenuItem {
  id: string
  label: string
  icon?: string
  accent?: string
  disabled?: boolean
  onSelect?: () => void
  children?: ActionDropdownMenuItem[]
}

interface ActionDropdownMenuProps {
  items: ActionDropdownMenuItem[]
  position?: {
    left: number
    top: number
  } | null
  ready?: boolean
  onClose: () => void
  className?: string
}

interface ActionDropdownMenuColumnProps {
  items: ActionDropdownMenuItem[]
  activeItemId: string | null
  onItemHover: (item: ActionDropdownMenuItem) => void
  onItemClick: (item: ActionDropdownMenuItem) => void
  submenu?: boolean
}

function ActionDropdownMenuColumn({
  items,
  activeItemId,
  onItemHover,
  onItemClick,
  submenu = false,
}: ActionDropdownMenuColumnProps) {
  return (
    <div className={`action-dropdown-menu__column ${submenu ? 'action-dropdown-menu__column--submenu' : 'action-dropdown-menu__column--root'}`}>
      {items.map((item) => {
        const itemStyle = item.accent
          ? ({ '--action-dropdown-accent': item.accent } as CSSProperties)
          : undefined

        return (
          <button
            key={item.id}
            type="button"
            style={itemStyle}
            className={`action-dropdown-menu__item ${item.id === activeItemId ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
            disabled={item.disabled}
            onPointerEnter={() => onItemHover(item)}
            onClick={() => onItemClick(item)}
          >
            <span className="action-dropdown-menu__icon">{item.icon ?? '•'}</span>
            <span className="action-dropdown-menu__label">{item.label}</span>
            {item.children?.length ? (
              <span className="action-dropdown-menu__chevron">›</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function ActionDropdownMenu({
  items,
  position = null,
  ready = true,
  onClose,
  className = '',
}: ActionDropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const initialPositionSet = useRef(false)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  useEffect(() => {
    setActiveItemId(null)
    initialPositionSet.current = false
  }, [items])

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

  const activeItem = items.find((item) => item.id === activeItemId && item.children?.length)

  useLayoutEffect(() => {
    if (!menuRef.current) return

    // Only adjust position on initial render, not when submenu expands
    if (initialPositionSet.current) return

    if (!position) {
      menuRef.current.style.left = '50%'
      menuRef.current.style.top = '50%'
      initialPositionSet.current = true
      return
    }

    const rect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Calculate fixed pixel offset (42% of initial width) to prevent shift when submenu opens
    const offsetX = Math.round(rect.width * 0.42)
    menuRef.current.style.setProperty('--menu-offset-x', `-${offsetX}px`)

    let adjustedLeft = position.left
    let adjustedTop = position.top

    const minLeft = rect.width / 2 + 16
    const maxLeft = viewportWidth - rect.width / 2 - 16

    if (adjustedLeft < minLeft) {
      adjustedLeft = minLeft
    } else if (adjustedLeft > maxLeft) {
      adjustedLeft = maxLeft
    }

    if (adjustedTop + rect.height > viewportHeight - 16) {
      adjustedTop = viewportHeight - rect.height - 16
    }

    if (adjustedTop < 12) {
      adjustedTop = 12
    }

    menuRef.current.style.left = `${Math.round(adjustedLeft)}px`
    menuRef.current.style.top = `${Math.round(adjustedTop)}px`
    initialPositionSet.current = true
  }, [activeItem, items, position])

  const handleItemHover = (item: ActionDropdownMenuItem) => {
    if (item.children?.length && !item.disabled) {
      setActiveItemId(item.id)
    }
  }

  const handleItemClick = (item: ActionDropdownMenuItem) => {
    if (item.disabled) return

    if (item.children?.length) {
      setActiveItemId(item.id)
      return
    }

    item.onSelect?.()
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className={`action-dropdown-menu ${position ? 'action-dropdown-menu--anchored' : 'action-dropdown-menu--centered'} ${ready ? '' : 'action-dropdown-menu--hidden'} ${className}`}
      style={position ? { left: position.left, top: position.top } : undefined}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="action-dropdown-menu__rail">
        <ActionDropdownMenuColumn
          items={items}
          activeItemId={activeItemId}
          onItemHover={handleItemHover}
          onItemClick={handleItemClick}
        />

        {activeItem?.children?.length ? (
          <ActionDropdownMenuColumn
            items={activeItem.children}
            activeItemId={null}
            onItemHover={() => {}}
            onItemClick={handleItemClick}
            submenu
          />
        ) : null}
      </div>
    </div>
  )
}
