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

interface QQPenguinPlaceholderProps {
  action?: PenguinAction
  scale?: number
  onClick?: () => void
  showEntrance?: boolean
}

// Deprecated after the renderer switched to SWF + Ruffle playback.
export const QQPenguinPlaceholder: FC<QQPenguinPlaceholderProps> = () => null

export default QQPenguinPlaceholder
