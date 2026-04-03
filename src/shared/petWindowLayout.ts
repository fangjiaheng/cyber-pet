import { CHAT_WINDOW_HEIGHT, CHAT_WINDOW_WIDTH, PET_WINDOW_HEIGHT, PET_WINDOW_WIDTH } from './windowSizes'

export type PetWindowLayoutMode = 'pet' | 'bubble' | 'action-dropdown' | 'context-menu' | 'chat'

const PET_CONTAINER_TOP_PADDING = 148
const PET_CONTAINER_LEFT_PADDING = 20
const PET_HOME_STAGE_WIDTH = 220
const PENGUIN_WRAPPER_TOP = 6
const PENGUIN_WRAPPER_HEIGHT = 180

type AnchorPoint = {
  x: number
  y: number
}

const PET_ANCHOR_POINT: AnchorPoint = {
  x: PET_CONTAINER_LEFT_PADDING + PET_HOME_STAGE_WIDTH / 2,
  y: PET_CONTAINER_TOP_PADDING + PENGUIN_WRAPPER_TOP + PENGUIN_WRAPPER_HEIGHT / 2,
}

const PET_ANCHOR_RIGHT_OFFSET = PET_WINDOW_WIDTH - PET_ANCHOR_POINT.x
const PET_ANCHOR_BOTTOM_OFFSET = PET_WINDOW_HEIGHT - PET_ANCHOR_POINT.y

export function getPetAnchorPoint(mode: PetWindowLayoutMode): AnchorPoint {
  if (mode === 'chat') {
    return {
      x: CHAT_WINDOW_WIDTH - PET_ANCHOR_RIGHT_OFFSET,
      y: CHAT_WINDOW_HEIGHT - PET_ANCHOR_BOTTOM_OFFSET,
    }
  }

  return PET_ANCHOR_POINT
}

export function getPetAnchorOffset(from: PetWindowLayoutMode, to: PetWindowLayoutMode) {
  const fromAnchor = getPetAnchorPoint(from)
  const toAnchor = getPetAnchorPoint(to)

  return {
    x: Math.round(fromAnchor.x - toAnchor.x),
    y: Math.round(fromAnchor.y - toAnchor.y),
  }
}
