import { useEffect, useRef, type RefObject } from 'react'

/** 四象限方向 → SWF 路径映射 */
const GAZE_SWF: Record<string, string> = {
  'top-left': '/assets/swf_original/102/1020020141.swf',     // 看左上 ID 6
  'bottom-left': '/assets/swf_original/102/1020020241.swf',  // 看左下 ID 7
  'top-right': '/assets/swf_original/102/1020020341.swf',    // 看右上 ID 8
  'bottom-right': '/assets/swf_original/102/1020020441.swf', // 看右下 ID 9
}

const DIZZY_SWF = '/assets/swf_original/102/10225.swf' // 晕倒 ID 100

/** 中心死区半径（px），防抖动 */
const DEAD_ZONE = 15
/** 方向切换节流间隔（ms） */
const THROTTLE_MS = 200
/** 鼠标离开后恢复 idle 的延迟（ms） */
const LEAVE_DELAY_MS = 300
/** 滑动窗口：时间跨度（ms） */
const DIRECTION_WINDOW_MS = 2000
/** 滑动窗口：触发晕倒的左右切换次数 */
const DIRECTION_THRESHOLD = 6
/** 晕倒冷却时间（ms） */
const DIZZY_COOLDOWN_MS = 8000

type GazeDirection = 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right'

const GAZE_BLOCKED_ACTIONS = new Set([
  'eat',
  'bathe',
  'play',
  'sleep',
  'happy',
  'work',
  'run',
  'walk',
])

interface UseMouseGazeOptions {
  targetRef: RefObject<HTMLDivElement | null>
  isDraggingRef: RefObject<boolean>
  penguinAction: string
  activePanel: string | null
  isContextMenuOpen: boolean
  isActionDropdownOpen: boolean
  isBubbleOpen: boolean
  onGaze: (swfPath: string) => void
  onGazeEnd: () => void
  onDizzy: (swfPath: string) => void
}

export function useMouseGaze({
  targetRef,
  isDraggingRef,
  penguinAction,
  activePanel,
  isContextMenuOpen,
  isActionDropdownOpen,
  isBubbleOpen,
  onGaze,
  onGazeEnd,
  onDizzy,
}: UseMouseGazeOptions) {
  // 内部状态全部用 ref 避免不必要的 re-render
  const currentDirection = useRef<GazeDirection | null>(null)
  const lastThrottleTime = useRef(0)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isGazing = useRef(false)
  const isDizzy = useRef(false)
  const dizzyCooldownEnd = useRef(0)

  // 水平方向切换记录：存储每次切换的时间戳
  const horizontalSwitches = useRef<number[]>([])
  const lastHorizontalSide = useRef<'left' | 'right' | null>(null)

  // 用 ref 持有最新的回调，避免 effect 依赖变化频繁
  const onGazeRef = useRef(onGaze)
  const onGazeEndRef = useRef(onGazeEnd)
  const onDizzyRef = useRef(onDizzy)
  onGazeRef.current = onGaze
  onGazeEndRef.current = onGazeEnd
  onDizzyRef.current = onDizzy

  useEffect(() => {
    const el = targetRef.current
    if (!el) return

    const isUiBlocking = () =>
      activePanel !== null || isContextMenuOpen || isActionDropdownOpen || isBubbleOpen

    const getQuadrant = (dx: number, dy: number): GazeDirection => {
      if (dx < 0 && dy < 0) return 'top-left'
      if (dx < 0 && dy >= 0) return 'bottom-left'
      if (dx >= 0 && dy < 0) return 'top-right'
      return 'bottom-right'
    }

    const checkDizzy = (side: 'left' | 'right'): boolean => {
      const now = Date.now()

      // 冷却中
      if (now < dizzyCooldownEnd.current) return false

      if (lastHorizontalSide.current !== null && lastHorizontalSide.current !== side) {
        horizontalSwitches.current.push(now)
      }
      lastHorizontalSide.current = side

      // 清理超出窗口的记录
      horizontalSwitches.current = horizontalSwitches.current.filter(
        (t) => now - t < DIRECTION_WINDOW_MS,
      )

      if (horizontalSwitches.current.length >= DIRECTION_THRESHOLD) {
        // 触发晕倒
        isDizzy.current = true
        dizzyCooldownEnd.current = now + DIZZY_COOLDOWN_MS
        horizontalSwitches.current = []
        lastHorizontalSide.current = null
        currentDirection.current = null
        isGazing.current = false

        setTimeout(() => {
          isDizzy.current = false
        }, 3000) // 晕倒动画约 3 秒

        return true
      }

      return false
    }

    const handleMouseMove = (e: MouseEvent) => {
      // 拖拽中 → 跳过
      if (isDraggingRef.current) return
      // 非 idle → 不打断其他动画
      if (GAZE_BLOCKED_ACTIONS.has(penguinAction)) return
      // UI 遮挡 → 跳过
      if (isUiBlocking()) return
      // 晕倒中 → 跳过
      if (isDizzy.current) return

      // 清除离开计时器
      if (leaveTimer.current) {
        clearTimeout(leaveTimer.current)
        leaveTimer.current = null
      }

      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY

      // 死区
      if (Math.abs(dx) < DEAD_ZONE && Math.abs(dy) < DEAD_ZONE) return

      const direction = getQuadrant(dx, dy)

      // 检测晕倒
      const side: 'left' | 'right' = dx < 0 ? 'left' : 'right'
      if (checkDizzy(side)) {
        onDizzyRef.current(DIZZY_SWF)
        return
      }

      // 节流：方向未变 or 时间未到
      const now = Date.now()
      if (direction === currentDirection.current && isGazing.current) return
      if (now - lastThrottleTime.current < THROTTLE_MS) return

      currentDirection.current = direction
      lastThrottleTime.current = now
      isGazing.current = true
      onGazeRef.current(GAZE_SWF[direction])
    }

    const handleMouseLeave = () => {
      if (!isGazing.current) return
      if (isDizzy.current) return

      leaveTimer.current = setTimeout(() => {
        if (isGazing.current) {
          isGazing.current = false
          currentDirection.current = null
          onGazeEndRef.current()
        }
      }, LEAVE_DELAY_MS)
    }

    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
    }
  }, [
    targetRef,
    isDraggingRef,
    penguinAction,
    activePanel,
    isContextMenuOpen,
    isActionDropdownOpen,
    isBubbleOpen,
  ])
}
