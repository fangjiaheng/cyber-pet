import { useEffect } from 'react'
import { usePetStore } from '../stores/petStore'

/**
 * 宠物状态自动衰减 Hook
 * 每分钟自动降低饥饿值、清洁值等
 */
export function usePetDecay() {
  const decay = usePetStore((state) => state.decay)

  useEffect(() => {
    // 每分钟衰减一次
    const interval = setInterval(() => {
      decay()
    }, 60 * 1000) // 60秒

    // 清理
    return () => clearInterval(interval)
  }, [decay])
}
