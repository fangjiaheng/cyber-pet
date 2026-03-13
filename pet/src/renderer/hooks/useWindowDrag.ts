import { RefObject, useEffect, useRef } from 'react'

const DRAG_IGNORE_SELECTOR = [
  '[data-window-drag-ignore="true"]',
  'button',
  'input',
  'textarea',
  'select',
  'option',
  'a',
].join(', ')

export function useWindowDrag(
  handleRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  const isDraggingRef = useRef(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handle = handleRef.current

    if (!enabled || !handle || !window.electronAPI?.moveWindow) {
      return
    }

    const stopDragging = () => {
      isDraggingRef.current = false
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return

      const target = event.target as HTMLElement | null
      if (target?.closest(DRAG_IGNORE_SELECTOR)) {
        return
      }

      event.preventDefault()
      isDraggingRef.current = true
      dragOffsetRef.current = {
        x: event.screenX - window.screenX,
        y: event.screenY - window.screenY,
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return

      const nextX = Math.round(event.screenX - dragOffsetRef.current.x)
      const nextY = Math.round(event.screenY - dragOffsetRef.current.y)
      window.electronAPI.moveWindow(nextX, nextY)
    }

    handle.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', stopDragging)
    window.addEventListener('blur', stopDragging)

    return () => {
      handle.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopDragging)
      window.removeEventListener('blur', stopDragging)
    }
  }, [enabled, handleRef])
}
