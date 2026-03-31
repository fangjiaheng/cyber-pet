import { useRef, useState, useCallback, useEffect } from 'react'
import './HorizontalScrollStrip.css'

export interface ScrollStripItem {
  id: string
  icon?: string
  imageSrc?: string
  imageAlt?: string
  label: string
  description?: string
  accent?: string
  disabled?: boolean
  onSelect?: () => void
}

export interface HorizontalScrollStripProps {
  items: ScrollStripItem[]
  title?: string
  onClose?: () => void
  className?: string
  style?: React.CSSProperties
  meter?: {
    label: string
    value: number
    max?: number
    hint?: string
  }
}

export default function HorizontalScrollStrip({ items, title, onClose, className, style, meter }: HorizontalScrollStripProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [hoveredItem, setHoveredItem] = useState<ScrollStripItem | null>(null)

  const scroll = useCallback((dir: number) => {
    if (!trackRef.current) return
    trackRef.current.scrollBy({ left: dir * 80, behavior: 'smooth' })
  }, [])

  const handleWheel = (e: React.WheelEvent) => {
    if (!trackRef.current) return
    if (e.deltaY !== 0) {
      e.preventDefault()
      trackRef.current.scrollLeft += e.deltaY
    }
  }

  const handleClick = (item: ScrollStripItem) => {
    if (item.disabled) return
    item.onSelect?.()
  }

  // 点击外部关闭
  useEffect(() => {
    if (!onClose) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [onClose])

  return (
    <div
      ref={containerRef}
      className={`scroll-strip${className ? ` ${className}` : ''}`}
      style={style}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {/* Header: title + close */}
      {(title || onClose) && (
        <div className="scroll-strip__header">
          {title && <span className="scroll-strip__title">{title}</span>}
          {onClose && (
            <button className="scroll-strip__close" onClick={onClose}>✕</button>
          )}
        </div>
      )}

      {/* Arrow + track row */}
      <div className="scroll-strip__row">
        <button className="scroll-strip__arrow" onClick={() => scroll(-1)}>‹</button>
        <div
          ref={trackRef}
          className="scroll-strip__track"
          onWheel={handleWheel}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className={`scroll-strip__item${item.disabled ? ' disabled' : ''}`}
              style={{ '--strip-accent': item.accent || '#ffcf8a' } as React.CSSProperties}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => handleClick(item)}
            >
              <div className="scroll-strip__circle">
                {item.imageSrc ? (
                  <img
                    className="scroll-strip__image"
                    src={item.imageSrc}
                    alt={item.imageAlt ?? item.label}
                  />
                ) : (
                  item.icon
                )}
              </div>
              <span className="scroll-strip__label">{item.label}</span>
            </div>
          ))}
        </div>
        <button className="scroll-strip__arrow" onClick={() => scroll(1)}>›</button>
      </div>

      {/* Tooltip */}
      <div className={`scroll-strip__tooltip${hoveredItem?.description ? ' visible' : ''}`}>
        {hoveredItem?.description?.split('\n').map((line, i) => (
          <div key={i} className="scroll-strip__tooltip-line">{line}</div>
        ))}
      </div>

      {meter ? (
        <div className="scroll-strip__meter">
          <div className="scroll-strip__meter-header">
            <span>{meter.label}</span>
            <strong>{Math.round(meter.value)} / {Math.round(meter.max ?? 100)}</strong>
          </div>
          <div className="scroll-strip__meter-track">
            <div
              className="scroll-strip__meter-fill"
              style={{ width: `${Math.max(0, Math.min(100, (meter.value / Math.max(1, meter.max ?? 100)) * 100))}%` }}
            />
          </div>
          {meter.hint ? <p className="scroll-strip__meter-hint">{meter.hint}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
