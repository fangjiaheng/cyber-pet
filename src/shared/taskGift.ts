export type TaskGiftKind = 'sign' | 'online'
export type TaskGiftStatus = 0 | 1 | 2

export interface TaskGiftSlot {
  order: number
  typeKey: string
  isTake: TaskGiftStatus
  seeTime: string
  time: number
  nextTime?: number
}

export interface TaskGiftGroup {
  kind: TaskGiftKind
  cycleStartAt: number
  nextResetAt: number
  slots: TaskGiftSlot[]
}

export interface TaskGiftState {
  sign: TaskGiftGroup
  online: TaskGiftGroup
}

export interface TaskGiftReward {
  experience: number
  coins: number
  hunger: number
  cleanliness: number
  mood: number
  energy: number
}

export interface TaskGiftClaimResult {
  ok: boolean
  reason: 'ready' | 'locked' | 'claimed' | 'missing'
  state: TaskGiftState
  slot: TaskGiftSlot | null
  reward: TaskGiftReward | null
}

const RESET_HOUR = 6
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONLINE_REQUIREMENTS = [10, 40, 70, 100, 130, 160, 190, 220]

const SIGN_TYPE_KEYS = [
  'food*_102010001',
  'commodity*_102020012',
  'food*_102010012',
  'food*_10013004',
  'food*_100010465',
  'commodity*_102020014',
  'food*_100010117',
  'medicine*_60001',
  'commodity*_10021005',
  'commodity*_102020011',
  'commodity*_102020020',
  'food*_100010142',
]

const ONLINE_TYPE_KEYS = [
  'food*_10013006',
  'commodity*_10021008',
  'commodity*_102020005',
  'food*_10013005',
  'commodity*_10021009',
  'commodity*_10021005',
  'food*_10013009',
  'medicine*_60001',
]

function cloneSlot(slot: TaskGiftSlot): TaskGiftSlot {
  return {
    ...slot,
  }
}

function cloneGroup(group: TaskGiftGroup): TaskGiftGroup {
  return {
    ...group,
    slots: group.slots.map(cloneSlot),
  }
}

function formatMonthDay(timestamp: number) {
  const date = new Date(timestamp)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${month}-${day}`
}

export function getResetBoundary(now: number) {
  const date = new Date(now)
  date.setHours(RESET_HOUR, 0, 0, 0)

  if (now < date.getTime()) {
    date.setDate(date.getDate() - 1)
  }

  return date.getTime()
}

export function getNextResetBoundary(now: number) {
  return getResetBoundary(now) + ONE_DAY_MS
}

function buildSignGroup(cycleStartAt: number): TaskGiftGroup {
  const slots: TaskGiftSlot[] = SIGN_TYPE_KEYS.map((typeKey, index) => {
    const time = cycleStartAt + index * ONE_DAY_MS
    return {
      order: index + 1,
      typeKey,
      isTake: 0 as TaskGiftStatus,
      seeTime: formatMonthDay(time),
      time,
    }
  })

  const nextResetAt = cycleStartAt + SIGN_TYPE_KEYS.length * ONE_DAY_MS
  slots[slots.length - 1].nextTime = nextResetAt

  return {
    kind: 'sign',
    cycleStartAt,
    nextResetAt,
    slots,
  }
}

function buildOnlineGroup(cycleStartAt: number): TaskGiftGroup {
  const nextResetAt = cycleStartAt + ONE_DAY_MS
  const slots: TaskGiftSlot[] = ONLINE_TYPE_KEYS.map((typeKey, index) => ({
    order: index + 1,
    typeKey,
    isTake: 0 as TaskGiftStatus,
    seeTime: ONLINE_REQUIREMENTS[index] + ' min',
    time: ONLINE_REQUIREMENTS[index],
    nextTime: index === ONLINE_TYPE_KEYS.length - 1 ? nextResetAt : undefined,
  }))

  return {
    kind: 'online',
    cycleStartAt,
    nextResetAt,
    slots,
  }
}

function normalizeGroup(group: TaskGiftGroup, kind: TaskGiftKind, now: number): TaskGiftGroup {
  if (group.kind === kind && now < group.nextResetAt) {
    return cloneGroup(group)
  }

  if (kind === 'sign') {
    return buildSignGroup(getResetBoundary(now))
  }

  return buildOnlineGroup(getResetBoundary(now))
}

function unlockSlots(group: TaskGiftGroup, onlineMinutes: number, now: number): TaskGiftGroup {
  return {
    ...group,
    slots: group.slots.map((slot): TaskGiftSlot => {
      if (slot.isTake !== 0) {
        return cloneSlot(slot)
      }

      const unlocked = group.kind === 'sign'
        ? now >= slot.time
        : onlineMinutes >= slot.time

      return {
        ...slot,
        isTake: (unlocked ? 1 : 0) as TaskGiftStatus,
      }
    }),
  }
}

export function createInitialTaskGiftState(now: number): TaskGiftState {
  const cycleStartAt = getResetBoundary(now)

  return {
    sign: buildSignGroup(cycleStartAt),
    online: buildOnlineGroup(cycleStartAt),
  }
}
export function refreshTaskGiftState(
  taskGiftState: TaskGiftState | null | undefined,
  now: number,
  onlineMinutes: number,
): TaskGiftState {
  const base = taskGiftState ?? createInitialTaskGiftState(now)

  const sign = unlockSlots(normalizeGroup(base.sign, 'sign', now), onlineMinutes, now)
  const online = unlockSlots(normalizeGroup(base.online, 'online', now), onlineMinutes, now)

  return {
    sign,
    online,
  }
}

export function getTaskGiftReward(kind: TaskGiftKind, slot: TaskGiftSlot): TaskGiftReward {
  const category = slot.typeKey.split('*_')[0]
  const scale = slot.order - 1
  const isSign = kind === 'sign'

  if (category === 'food') {
    return {
      experience: (isSign ? 14 : 8) + scale * 2,
      coins: (isSign ? 22 : 10) + scale * 3,
      hunger: (isSign ? 24 : 16) + scale,
      cleanliness: 0,
      mood: (isSign ? 8 : 5) + Math.floor(scale / 2),
      energy: isSign ? 4 : 2,
    }
  }

  if (category === 'commodity') {
    return {
      experience: (isSign ? 12 : 7) + scale * 2,
      coins: (isSign ? 26 : 12) + scale * 3,
      hunger: 0,
      cleanliness: (isSign ? 16 : 10) + scale,
      mood: (isSign ? 10 : 6) + Math.floor(scale / 2),
      energy: isSign ? 5 : 3,
    }
  }

  return {
    experience: (isSign ? 16 : 10) + scale * 2,
    coins: (isSign ? 18 : 8) + scale * 2,
    hunger: 0,
    cleanliness: 0,
    mood: (isSign ? 12 : 8) + Math.floor(scale / 2),
    energy: (isSign ? 18 : 12) + scale,
  }
}

export function claimTaskGift(
  taskGiftState: TaskGiftState | null | undefined,
  kind: TaskGiftKind,
  index: number,
  now: number,
  onlineMinutes: number,
): TaskGiftClaimResult {
  const state = refreshTaskGiftState(taskGiftState, now, onlineMinutes)
  const group = cloneGroup(state[kind])
  const slot = group.slots[index]

  if (!slot) {
    return {
      ok: false,
      reason: 'missing',
      state,
      slot: null,
      reward: null,
    }
  }

  if (slot.isTake === 2) {
    return {
      ok: false,
      reason: 'claimed',
      state,
      slot,
      reward: null,
    }
  }

  if (slot.isTake !== 1) {
    return {
      ok: false,
      reason: 'locked',
      state,
      slot,
      reward: null,
    }
  }

  const reward = getTaskGiftReward(kind, slot)
  group.slots[index] = {
    ...slot,
    isTake: 2,
  }

  return {
    ok: true,
    reason: 'ready',
    state: {
      ...state,
      [kind]: group,
    },
    slot: group.slots[index],
    reward,
  }
}

export function countReadyTaskGifts(group: TaskGiftGroup) {
  return group.slots.filter((slot) => slot.isTake === 1).length
}

export function countClaimedTaskGifts(group: TaskGiftGroup) {
  return group.slots.filter((slot) => slot.isTake === 2).length
}

export function typeKeyToIconPath(typeKey: string): string {
  const [category, itemId] = typeKey.split('*_')
  return `assets/1.2.4source/img_res/${category}/${itemId}.gif`
}
