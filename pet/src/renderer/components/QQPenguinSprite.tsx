import type { FC } from 'react'

export type PenguinType = 'GG' | 'MM'
export type PenguinSpriteAction =
  | 'xiuxian'
  | 'chifan'
  | 'xizao'
  | 'zhaoshou'
  | 'huaban'
  | 'zayan'

export const ACTION_MAPPING: Record<string, PenguinSpriteAction> = {
  idle: 'xiuxian',
  eat: 'chifan',
  bathe: 'xizao',
  happy: 'zhaoshou',
  play: 'huaban',
  sad: 'zayan',
  angry: 'zayan',
  sleep: 'xiuxian',
  work: 'xiuxian',
  walk: 'xiuxian',
  run: 'huaban',
  sit: 'xiuxian',
}

interface QQPenguinSpriteProps {
  type?: PenguinType
  action?: string
  scale?: number
  fps?: number
  onClick?: () => void
}

// Deprecated after the renderer switched to SWF + Ruffle playback.
export const QQPenguinSprite: FC<QQPenguinSpriteProps> = () => null

export default QQPenguinSprite
