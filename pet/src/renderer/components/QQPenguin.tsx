import type { FC } from 'react'

export type PenguinAction =
  | 'idle'
  | 'walk'
  | 'run'
  | 'sit'
  | 'sleep'
  | 'eat'
  | 'bathe'
  | 'play'
  | 'work'
  | 'happy'
  | 'sad'
  | 'angry'

interface QQPenguinProps {
  action?: PenguinAction
  scale?: number
  onAnimationComplete?: () => void
  onClick?: () => void
  showEntrance?: boolean
}

// Deprecated after the renderer switched to SWF + Ruffle playback.
export const QQPenguin: FC<QQPenguinProps> = () => null

export default QQPenguin
