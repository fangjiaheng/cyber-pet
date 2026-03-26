export type PetWindowLayoutMode = 'pet' | 'bubble' | 'action-dropdown' | 'context-menu'

const PET_CONTAINER_TOP_PADDING = 148
const PET_CONTAINER_LEFT_PADDING = 20
const PET_HOME_STAGE_WIDTH = 220
const PENGUIN_WRAPPER_TOP = 6
const PENGUIN_WRAPPER_HEIGHT = 156

type AnchorPoint = {
  x: number
  y: number
}

export function getPetAnchorPoint(_mode: PetWindowLayoutMode): AnchorPoint {
  const halfPenguinHeight = PENGUIN_WRAPPER_HEIGHT / 2
  return {
    x: PET_CONTAINER_LEFT_PADDING + PET_HOME_STAGE_WIDTH / 2,
    y: PET_CONTAINER_TOP_PADDING + PENGUIN_WRAPPER_TOP + halfPenguinHeight,
  }
}

export function getPetAnchorOffset(from: PetWindowLayoutMode, to: PetWindowLayoutMode) {
  const fromAnchor = getPetAnchorPoint(from)
  const toAnchor = getPetAnchorPoint(to)

  return {
    x: Math.round(fromAnchor.x - toAnchor.x),
    y: Math.round(fromAnchor.y - toAnchor.y),
  }
}
