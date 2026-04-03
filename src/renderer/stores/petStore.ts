import { create } from 'zustand'
import {
  claimTaskGift,
  countClaimedTaskGifts,
  createInitialTaskGiftState,
  refreshTaskGiftState,
  type TaskGiftKind,
  type TaskGiftReward,
  type TaskGiftState,
} from '../../shared/taskGift'
import { useInventoryStore } from './inventoryStore'
import { useActivityStore } from './activitySystem'
import {
  levelForExperience,
  getHungerMax,
  getCleanlinessMax,
  MOOD_MAX,
  HEALTH_MAX,
  ENERGY_MAX,
  SAVE_VERSION,
} from './growthConfig'
import { needsMigration, backupOldSave, migrateState } from './migration'
import { calculateGrowthPerTick, calculateDecay } from './growthEngine'
import {
  type DiseaseState,
  createInitialDiseaseState,
  checkDiscomfort,
  tickDiscomfort,
  progressDisease,
  healthFromDisease,
} from './diseaseSystem'

export type AnimationAction = 'idle' | 'walk' | 'run' | 'sit' | 'sleep' | 'working' | 'eating' | 'bathing' | 'playing'
export type Emotion = 'happy' | 'sad' | 'angry' | 'tired' | 'hungry' | 'neutral'

export interface PetProfile {
  petName: string
  ownerName: string
  intelligence: number
  strength: number
  charm: number
  education: string
}

export interface CheckInResult {
  success: boolean
  alreadyCheckedIn: boolean
  expGained: number
  streak: number
  levelUps: number
  newLevel: number
}

export interface TaskGiftClaimActionResult {
  success: boolean
  reason: 'ready' | 'locked' | 'claimed' | 'missing'
  kind: TaskGiftKind
  slotIndex: number
  reward: TaskGiftReward | null
}

export interface PetState {
  id: string
  name: string
  hunger: number
  cleanliness: number
  mood: number
  energy: number
  health: number
  level: number
  experience: number
  yuanbao: number
  lastCheckIn: number | null
  checkInStreak: number
  onlineDataTime: number
  taskGifts: TaskGiftState
  position: { x: number; y: number }
  currentAction: AnimationAction
  currentEmotion: Emotion
  profile: PetProfile
  tasksCompleted: number
  totalWorkTime: number
  createdAt: number
  lastFed: number
  lastCleaned: number
  saveVersion: number
  diseaseState: DiseaseState
}

interface PetActions {
  updateHunger: (value: number) => void
  updateCleanliness: (value: number) => void
  updateMood: (value: number) => void
  updateEnergy: (value: number) => void
  setAction: (action: AnimationAction) => void
  setEmotion: (emotion: Emotion) => void
  setPosition: (x: number, y: number) => void
  gainExperience: (amount: number) => { levelUps: number; level: number; experience: number }
  earnYuanbao: (amount: number) => void
  updateProfile: (patch: Partial<PetProfile>) => void
  /** 使用物品喂食。传入物品效果值，库存扣减由调用方负责 */
  feedWithItem: (effects: { starve: number; charm?: number; intel?: number; strong?: number }) => void
  /** 使用物品清洁。传入物品效果值，库存扣减由调用方负责 */
  cleanWithItem: (effects: { clean: number; charm?: number; intel?: number; strong?: number }) => void
  /** 使用药品治疗。传入物品效果值，库存扣减由调用方负责 */
  healWithItem: (effects: { starve?: number; clean?: number; strong?: number }) => void
  /** @deprecated 旧版固定值喂食，保留兼容 */
  feed: () => void
  clean: () => void
  play: () => void
  rest: () => void
  heal: () => void
  study: () => void
  work: () => void
  travel: () => void
  checkIn: () => CheckInResult
  ensureTaskGiftState: () => void
  claimTaskGift: (kind: TaskGiftKind, index: number) => TaskGiftClaimActionResult
  cancelCurrentAction: () => void
  startWorking: () => void
  finishWorking: (workTimeMinutes: number) => void
  decay: () => void
  loadFromStorage: () => Promise<void>
  saveToStorage: () => void
  reset: () => void
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const saveTimerKey = '__petStateSaveTimer'

// 导出动态上限供外部使用（兼容旧引用）
export { getHungerMax as HUNGER_MAX_FN, getCleanlinessMax as CLEANLINESS_MAX_FN, MOOD_MAX, ENERGY_MAX }
// 保留旧名称的导出用于向后兼容（使用 level=1 时的默认值）
export const HUNGER_MAX = getHungerMax(1)
export const CLEANLINESS_MAX = getCleanlinessMax(1)

type WindowWithPetSaveTimer = Window & {
  __petStateSaveTimer?: number
}

const INITIAL_PROFILE: PetProfile = {
  petName: 'Q宠宝贝',
  ownerName: '主人',
  intelligence: 18,
  strength: 12,
  charm: 16,
  education: '启蒙班',
}

const INITIAL_STATE: PetState = {
  id: 'cyber-mate-1',
  name: 'Q宠宝贝',
  hunger: getHungerMax(1) * 0.8,    // 80% 满值
  cleanliness: getCleanlinessMax(1) * 0.8,
  mood: MOOD_MAX * 0.8,              // 800
  energy: ENERGY_MAX * 0.8,          // 80
  health: HEALTH_MAX,                // 5 = 健康
  level: 1,
  experience: 0,
  yuanbao: 0,
  lastCheckIn: null,
  checkInStreak: 0,
  onlineDataTime: 0,
  taskGifts: createInitialTaskGiftState(Date.now()),
  position: { x: 100, y: 100 },
  currentAction: 'idle',
  currentEmotion: 'neutral',
  profile: INITIAL_PROFILE,
  tasksCompleted: 0,
  totalWorkTime: 0,
  createdAt: Date.now(),
  lastFed: Date.now(),
  lastCleaned: Date.now(),
  saveVersion: SAVE_VERSION,
  diseaseState: createInitialDiseaseState(),
}

function clampStatus(value: number, max: number) {
  return Math.max(0, Math.min(max, value))
}

function clampHunger(value: number, level: number) {
  return clampStatus(value, getHungerMax(level))
}

function clampCleanliness(value: number, level: number) {
  return clampStatus(value, getCleanlinessMax(level))
}

function clampMood(value: number) {
  return clampStatus(value, MOOD_MAX)
}

function clampEnergy(value: number) {
  return clampStatus(value, ENERGY_MAX)
}

function clampHealth(value: number) {
  return clampStatus(value, HEALTH_MAX)
}

function startOfDay(timestamp: number) {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function isSameDay(first: number | null, second: number) {
  if (first === null) return false
  return startOfDay(first) === startOfDay(second)
}

function isPreviousDay(previous: number | null, current: number) {
  if (previous === null) return false
  return startOfDay(current) - startOfDay(previous) === ONE_DAY_MS
}

function resolveEducation(intelligence: number) {
  if (intelligence >= 120) return '研究生'
  if (intelligence >= 95) return '大学'
  if (intelligence >= 70) return '高中'
  if (intelligence >= 45) return '初中'
  if (intelligence >= 25) return '小学'
  return '启蒙班'
}

function applyExperienceProgress(state: PetState, amount: number) {
  const nextExperience = Math.max(0, state.experience + amount)
  const nextLevel = levelForExperience(nextExperience)

  return {
    experience: nextExperience,
    level: nextLevel,
    levelUps: Math.max(0, nextLevel - state.level),
  }
}

function buildPersistedState(state: PetState) {
  return {
    hunger: state.hunger,
    cleanliness: state.cleanliness,
    mood: state.mood,
    energy: state.energy,
    health: state.health,
    level: state.level,
    experience: state.experience,
    yuanbao: state.yuanbao,
    lastCheckIn: state.lastCheckIn,
    checkInStreak: state.checkInStreak,
    onlineDataTime: state.onlineDataTime,
    taskGifts: state.taskGifts,
    inventory: useInventoryStore.getState().getPersistedData(),
    activity: useActivityStore.getState().getPersistedData(),
    profile: state.profile,
    diseaseState: state.diseaseState,
    saveVersion: SAVE_VERSION,
    lastUpdateTime: Date.now(),
  }
}

function normalizeLoadedState(savedState: Partial<PetState> | null | undefined): Partial<PetState> {
  if (!savedState) return {}

  // 检查是否需要从旧版迁移
  let stateData = savedState as Record<string, unknown>
  if (needsMigration(stateData)) {
    backupOldSave(stateData)
    stateData = migrateState(stateData)
    console.log('📦 存档已从旧版迁移到 v' + SAVE_VERSION)
  }

  const migrated = stateData as Partial<PetState>

  const profile = {
    ...INITIAL_PROFILE,
    ...(migrated.profile ?? {}),
  }

  const level = Math.max(1, migrated.level ?? INITIAL_STATE.level)
  const education = profile.education || resolveEducation(profile.intelligence)
  const onlineDataTime = Math.max(0, Number(migrated.onlineDataTime ?? 0))
  const taskGifts = refreshTaskGiftState(migrated.taskGifts ?? null, Date.now(), onlineDataTime)

  return {
    hunger: clampHunger(migrated.hunger ?? INITIAL_STATE.hunger, level),
    cleanliness: clampCleanliness(migrated.cleanliness ?? INITIAL_STATE.cleanliness, level),
    mood: clampMood(migrated.mood ?? INITIAL_STATE.mood),
    energy: clampEnergy(migrated.energy ?? INITIAL_STATE.energy),
    health: clampHealth(migrated.health ?? HEALTH_MAX),
    level,
    experience: Math.max(0, migrated.experience ?? INITIAL_STATE.experience),
    yuanbao: Math.max(0, migrated.yuanbao ?? 0),
    lastCheckIn: migrated.lastCheckIn ?? null,
    checkInStreak: Math.max(0, migrated.checkInStreak ?? 0),
    onlineDataTime,
    taskGifts,
    saveVersion: SAVE_VERSION,
    diseaseState: (migrated.diseaseState as DiseaseState) ?? createInitialDiseaseState(),
    profile: {
      ...profile,
      education,
    },
  }
}

export const usePetStore = create<PetState & PetActions>((set, get) => ({
  ...INITIAL_STATE,

  updateHunger: (value) => set((s) => ({ hunger: clampHunger(value, s.level) })),
  updateCleanliness: (value) => set((s) => ({ cleanliness: clampCleanliness(value, s.level) })),
  updateMood: (value) => set({ mood: clampMood(value) }),
  updateEnergy: (value) => set({ energy: clampEnergy(value) }),
  setAction: (action) => set({ currentAction: action }),
  setEmotion: (emotion) => set({ currentEmotion: emotion }),
  setPosition: (x, y) => set({ position: { x, y } }),

  gainExperience: (amount) => {
    const state = get()
    const progress = applyExperienceProgress(state, amount)
    set({
      experience: progress.experience,
      level: progress.level,
    })
    return progress
  },

  earnYuanbao: (amount) => set((state) => ({
    yuanbao: Math.max(0, state.yuanbao + amount),
  })),

  updateProfile: (patch) => set((state) => {
    const nextProfile = {
      ...state.profile,
      ...patch,
    }

    return {
      name: nextProfile.petName,
      profile: {
        ...nextProfile,
        intelligence: Math.max(0, nextProfile.intelligence),
        strength: Math.max(0, nextProfile.strength),
        charm: Math.max(0, nextProfile.charm),
        education: nextProfile.education || resolveEducation(nextProfile.intelligence),
      },
    }
  }),

  feedWithItem: (effects) => set((state) => {
    const progress = applyExperienceProgress(state, 6)
    return {
      hunger: clampHunger(state.hunger + (effects.starve || 0), state.level),
      mood: clampMood(state.mood + 100),
      lastFed: Date.now(),
      currentAction: 'eating',
      currentEmotion: 'happy',
      experience: progress.experience,
      level: progress.level,
      profile: {
        ...state.profile,
        charm: state.profile.charm + (effects.charm || 0),
        intelligence: state.profile.intelligence + (effects.intel || 0),
        strength: state.profile.strength + (effects.strong || 0),
      },
    }
  }),

  cleanWithItem: (effects) => set((state) => {
    const progress = applyExperienceProgress(state, 6)
    return {
      cleanliness: clampCleanliness(state.cleanliness + (effects.clean || 0), state.level),
      mood: clampMood(state.mood + 150),
      lastCleaned: Date.now(),
      currentAction: 'bathing',
      currentEmotion: 'happy',
      experience: progress.experience,
      level: progress.level,
      profile: {
        ...state.profile,
        charm: state.profile.charm + (effects.charm || 0),
        intelligence: state.profile.intelligence + (effects.intel || 0),
        strength: state.profile.strength + (effects.strong || 0),
      },
    }
  }),

  healWithItem: (effects) => set((state) => {
    const progress = applyExperienceProgress(state, 4)
    return {
      hunger: effects.starve ? clampHunger(state.hunger + effects.starve, state.level) : state.hunger,
      cleanliness: effects.clean ? clampCleanliness(state.cleanliness + effects.clean, state.level) : state.cleanliness,
      mood: clampMood(state.mood + 200),
      energy: clampEnergy(state.energy + 15),
      currentAction: 'idle',
      currentEmotion: 'happy',
      experience: progress.experience,
      level: progress.level,
      profile: {
        ...state.profile,
        strength: state.profile.strength + (effects.strong || 0),
      },
    }
  }),

  feed: () => set((state) => {
    const progress = applyExperienceProgress(state, 6)
    return {
      hunger: clampHunger(state.hunger + 300, state.level),
      mood: clampMood(state.mood + 100),
      lastFed: Date.now(),
      currentAction: 'eating',
      currentEmotion: 'happy',
      experience: progress.experience,
      level: progress.level,
    }
  }),

  clean: () => set((state) => {
    const progress = applyExperienceProgress(state, 6)
    return {
      cleanliness: clampCleanliness(state.cleanliness + 400, state.level),
      mood: clampMood(state.mood + 150),
      lastCleaned: Date.now(),
      currentAction: 'bathing',
      currentEmotion: 'happy',
      experience: progress.experience,
      level: progress.level,
    }
  }),

  play: () => set((state) => {
    const progress = applyExperienceProgress(state, 8)
    return {
      mood: clampMood(state.mood + 200),
      energy: clampEnergy(state.energy - 10),
      hunger: clampHunger(state.hunger - 50, state.level),
      currentAction: 'playing',
      currentEmotion: 'happy',
      experience: progress.experience,
      level: progress.level,
      profile: {
        ...state.profile,
        charm: state.profile.charm + 2,
      },
    }
  }),

  rest: () => set((state) => ({
    energy: clampEnergy(state.energy + 30),
    currentAction: 'sleep',
    currentEmotion: state.energy < 40 ? 'tired' : state.currentEmotion,
  })),

  heal: () => set((state) => {
    const progress = applyExperienceProgress(state, 4)
    return {
      mood: clampMood(state.mood + 200),
      energy: clampEnergy(state.energy + 15),
      currentAction: 'idle',
      currentEmotion: 'happy',
      experience: progress.experience,
      level: progress.level,
    }
  }),

  study: () => set((state) => {
    const progress = applyExperienceProgress(state, 10)
    const intelligence = state.profile.intelligence + 2
    return {
      energy: clampEnergy(state.energy - 15),
      mood: clampMood(state.mood + 50),
      currentAction: 'idle',
      currentEmotion: 'neutral',
      experience: progress.experience,
      level: progress.level,
      yuanbao: state.yuanbao + 12,
      profile: {
        ...state.profile,
        intelligence,
        education: resolveEducation(intelligence),
      },
    }
  }),

  work: () => set((state) => {
    const progress = applyExperienceProgress(state, 5)
    return {
      energy: clampEnergy(state.energy - 20),
      hunger: clampHunger(state.hunger - 100, state.level),
      mood: clampMood(state.mood - 50),
      currentAction: 'working',
      currentEmotion: 'neutral',
      experience: progress.experience,
      level: progress.level,
      yuanbao: state.yuanbao + 28,
      profile: {
        ...state.profile,
        strength: state.profile.strength + 1,
        charm: state.profile.charm + 1,
      },
    }
  }),

  travel: () => set((state) => {
    const progress = applyExperienceProgress(state, 6)
    return {
      energy: clampEnergy(state.energy - 15),
      mood: clampMood(state.mood + 250),
      hunger: clampHunger(state.hunger - 100, state.level),
      currentAction: 'idle',
      currentEmotion: 'happy',
      experience: progress.experience,
      level: progress.level,
      profile: {
        ...state.profile,
        charm: state.profile.charm + 1,
      },
    }
  }),

  ensureTaskGiftState: () => {
    const state = get()
    const nextTaskGifts = refreshTaskGiftState(state.taskGifts, Date.now(), state.onlineDataTime)
    const claimedSignCount = countClaimedTaskGifts(nextTaskGifts.sign)

    set({
      taskGifts: nextTaskGifts,
      checkInStreak: claimedSignCount,
    })
  },

  claimTaskGift: (kind, index) => {
    const state = get()
    const now = Date.now()
    const result = claimTaskGift(state.taskGifts, kind, index, now, state.onlineDataTime)

    if (!result.ok || !result.reward) {
      set({
        taskGifts: result.state,
        checkInStreak: countClaimedTaskGifts(result.state.sign),
      })

      return {
        success: false,
        reason: result.reason,
        kind,
        slotIndex: index,
        reward: null,
      }
    }

    const reward = result.reward
    const progress = applyExperienceProgress(state, reward.experience)

    set({
      hunger: clampHunger(state.hunger + reward.hunger, state.level),
      cleanliness: clampCleanliness(state.cleanliness + reward.cleanliness, state.level),
      mood: clampMood(state.mood + reward.mood),
      energy: clampEnergy(state.energy + reward.energy),
      experience: progress.experience,
      level: progress.level,
      yuanbao: Math.max(0, state.yuanbao + reward.yuanbao),
      currentEmotion: 'happy',
      lastCheckIn: kind === 'sign' ? now : state.lastCheckIn,
      checkInStreak: countClaimedTaskGifts(result.state.sign),
      taskGifts: result.state,
    })

    return {
      success: true,
      reason: result.reason,
      kind,
      slotIndex: index,
      reward,
    }
  },

  checkIn: () => {
    const state = get()
    const now = Date.now()

    if (isSameDay(state.lastCheckIn, now)) {
      return {
        success: false,
        alreadyCheckedIn: true,
        expGained: 0,
        streak: state.checkInStreak,
        levelUps: 0,
        newLevel: state.level,
      }
    }

    const streak = isPreviousDay(state.lastCheckIn, now) ? state.checkInStreak + 1 : 1
    const bonus = streak >= 3 ? Math.min(40, (streak - 2) * 10) : 0
    const expGained = 50 + bonus
    const progress = applyExperienceProgress(state, expGained)

    set({
      experience: progress.experience,
      level: progress.level,
      lastCheckIn: now,
      checkInStreak: streak,
      currentEmotion: 'happy',
    })

    return {
      success: true,
      alreadyCheckedIn: false,
      expGained,
      streak,
      levelUps: progress.levelUps,
      newLevel: progress.level,
    }
  },

  cancelCurrentAction: () => set({
    currentAction: 'idle',
    currentEmotion: 'neutral',
  }),

  startWorking: () => set({
    currentAction: 'working',
    currentEmotion: 'neutral',
  }),

  finishWorking: (workTimeMinutes) => set((state) => {
    const progress = applyExperienceProgress(state, Math.max(4, Math.round(workTimeMinutes / 3)))
    return {
      tasksCompleted: state.tasksCompleted + 1,
      totalWorkTime: state.totalWorkTime + workTimeMinutes,
      energy: clampEnergy(state.energy - workTimeMinutes * 2),
      hunger: clampHunger(state.hunger - workTimeMinutes, state.level),
      mood: state.mood > 500 ? clampMood(state.mood - 50) : state.mood,
      currentAction: 'idle',
      currentEmotion: state.energy < 30 ? 'tired' : 'neutral',
      experience: progress.experience,
      level: progress.level,
      yuanbao: state.yuanbao + Math.max(10, workTimeMinutes * 3),
    }
  }),

  decay: () => set((state) => {
    const now = Date.now()
    const isSleeping = state.currentAction === 'sleep'
    const decay = calculateDecay(state.mood, isSleeping)

    const hunger = clampHunger(state.hunger + decay.hungerDelta, state.level)
    const cleanliness = clampCleanliness(state.cleanliness + decay.cleanlinessDelta, state.level)
    const mood = clampMood(state.mood + decay.moodDelta)
    const energy = clampEnergy(state.energy + decay.energyDelta)
    const onlineDataTime = Math.max(0, state.onlineDataTime + 1)

    // 疾病系统：检测不适 → 更新计数器 → 可能恶化
    const hungerMax = getHungerMax(state.level)
    const discomforts = checkDiscomfort(hunger, cleanliness, hungerMax)
    let diseaseState = tickDiscomfort(state.diseaseState, discomforts)
    diseaseState = progressDisease(diseaseState, now)
    const health = healthFromDisease(diseaseState)

    // 每分钟成长值
    const growth = calculateGrowthPerTick(mood, health, hunger, cleanliness)
    const nextExperience = Math.max(0, state.experience + growth)
    const nextLevel = levelForExperience(nextExperience)

    // 情绪判断（基于新的属性范围）
    const nextHungerMax = getHungerMax(nextLevel)
    const cleanMax = getCleanlinessMax(nextLevel)
    const hungerRatio = hunger / nextHungerMax
    const cleanRatio = cleanliness / cleanMax

    let nextEmotion: Emotion = state.currentEmotion
    if (health < 3) nextEmotion = 'sad'
    else if (hungerRatio < 0.1) nextEmotion = 'hungry'
    else if (energy < 30) nextEmotion = 'tired'
    else if (cleanRatio < 0.1) nextEmotion = 'sad'
    else if (mood > 700) nextEmotion = 'happy'
    else nextEmotion = 'neutral'

    const taskGifts = refreshTaskGiftState(state.taskGifts, now, onlineDataTime)

    return {
      hunger,
      cleanliness,
      mood,
      energy,
      health,
      diseaseState,
      experience: nextExperience,
      level: nextLevel,
      onlineDataTime,
      taskGifts,
      checkInStreak: countClaimedTaskGifts(taskGifts.sign),
      currentEmotion: nextEmotion,
    }
  }),

  loadFromStorage: async () => {
    if (!window.electronAPI?.storage) return

    try {
      const savedState = await window.electronAPI.storage.getPetState()
      if (savedState) {
        const normalizedState = normalizeLoadedState(savedState)
        set({
          ...normalizedState,
          checkInStreak: countClaimedTaskGifts((normalizedState.taskGifts ?? createInitialTaskGiftState(Date.now())).sign),
        })
        // 恢复库存
        useInventoryStore.getState().loadFromSaved(savedState.inventory)
        // 恢复活动和学习进度
        useActivityStore.getState().loadFromSaved(savedState.activity)
        console.log('✅ 宠物状态已从存储恢复')
      }
    } catch (error) {
      console.error('❌ 加载宠物状态失败:', error)
    }
  },

  saveToStorage: () => {
    if (!window.electronAPI?.storage) return
    window.electronAPI.storage.savePetState(buildPersistedState(get()))
  },

  reset: () => set({
    ...INITIAL_STATE,
    createdAt: Date.now(),
    lastFed: Date.now(),
    lastCleaned: Date.now(),
    taskGifts: createInitialTaskGiftState(Date.now()),
    diseaseState: createInitialDiseaseState(),
    saveVersion: SAVE_VERSION,
  }),
}))

if (typeof window !== 'undefined' && window.electronAPI?.storage) {
  const triggerSave = () => {
    const state = usePetStore.getState()
    const saveDebounced = () => {
      window.electronAPI.storage.savePetState(buildPersistedState(state))
    }

    const typedWindow = window as WindowWithPetSaveTimer
    const currentTimer = typedWindow[saveTimerKey]
    if (currentTimer) {
      window.clearTimeout(currentTimer)
    }

    typedWindow[saveTimerKey] = window.setTimeout(saveDebounced, 1000)
  }

  usePetStore.subscribe(triggerSave)
  // 库存和活动变化也触发保存
  useInventoryStore.subscribe(triggerSave)
  useActivityStore.subscribe(triggerSave)
}
