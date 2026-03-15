import { create } from 'zustand'

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

export interface PetState {
  id: string
  name: string
  hunger: number
  cleanliness: number
  mood: number
  energy: number
  level: number
  experience: number
  coins: number
  lastCheckIn: number | null
  checkInStreak: number
  position: { x: number; y: number }
  currentAction: AnimationAction
  currentEmotion: Emotion
  profile: PetProfile
  tasksCompleted: number
  totalWorkTime: number
  createdAt: number
  lastFed: number
  lastCleaned: number
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
  earnCoins: (amount: number) => void
  updateProfile: (patch: Partial<PetProfile>) => void
  feed: () => void
  clean: () => void
  play: () => void
  rest: () => void
  heal: () => void
  study: () => void
  work: () => void
  travel: () => void
  checkIn: () => CheckInResult
  cancelCurrentAction: () => void
  startWorking: () => void
  finishWorking: (workTimeMinutes: number) => void
  decay: () => void
  loadFromStorage: () => Promise<void>
  saveToStorage: () => void
  reset: () => void
}

const LEVEL_EXP = 200
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const saveTimerKey = '__petStateSaveTimer'

type WindowWithPetSaveTimer = Window & {
  __petStateSaveTimer?: number
}

const INITIAL_PROFILE: PetProfile = {
  petName: 'Cyber Mate',
  ownerName: '主人',
  intelligence: 18,
  strength: 12,
  charm: 16,
  education: '启蒙班',
}

const INITIAL_STATE: PetState = {
  id: 'cyber-mate-1',
  name: 'Cyber Mate',
  hunger: 80,
  cleanliness: 80,
  mood: 80,
  energy: 80,
  level: 1,
  experience: 0,
  coins: 0,
  lastCheckIn: null,
  checkInStreak: 0,
  position: { x: 100, y: 100 },
  currentAction: 'idle',
  currentEmotion: 'neutral',
  profile: INITIAL_PROFILE,
  tasksCompleted: 0,
  totalWorkTime: 0,
  createdAt: Date.now(),
  lastFed: Date.now(),
  lastCleaned: Date.now(),
}

function clampStatus(value: number) {
  return Math.max(0, Math.min(100, value))
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
  const nextLevel = Math.max(1, Math.floor(nextExperience / LEVEL_EXP) + 1)

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
    level: state.level,
    experience: state.experience,
    coins: state.coins,
    lastCheckIn: state.lastCheckIn,
    checkInStreak: state.checkInStreak,
    profile: state.profile,
    lastUpdateTime: Date.now(),
  }
}

function normalizeLoadedState(savedState: Partial<PetState> | null | undefined): Partial<PetState> {
  if (!savedState) return {}

  const profile = {
    ...INITIAL_PROFILE,
    ...(savedState.profile ?? {}),
  }

  const education = profile.education || resolveEducation(profile.intelligence)

  return {
    hunger: clampStatus(savedState.hunger ?? INITIAL_STATE.hunger),
    cleanliness: clampStatus(savedState.cleanliness ?? INITIAL_STATE.cleanliness),
    mood: clampStatus(savedState.mood ?? INITIAL_STATE.mood),
    energy: clampStatus(savedState.energy ?? INITIAL_STATE.energy),
    level: Math.max(1, savedState.level ?? INITIAL_STATE.level),
    experience: Math.max(0, savedState.experience ?? INITIAL_STATE.experience),
    coins: Math.max(0, savedState.coins ?? 0),
    lastCheckIn: savedState.lastCheckIn ?? null,
    checkInStreak: Math.max(0, savedState.checkInStreak ?? 0),
    profile: {
      ...profile,
      education,
    },
  }
}

export const usePetStore = create<PetState & PetActions>((set, get) => ({
  ...INITIAL_STATE,

  updateHunger: (value) => set({ hunger: clampStatus(value) }),
  updateCleanliness: (value) => set({ cleanliness: clampStatus(value) }),
  updateMood: (value) => set({ mood: clampStatus(value) }),
  updateEnergy: (value) => set({ energy: clampStatus(value) }),
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

  earnCoins: (amount) => set((state) => ({
    coins: Math.max(0, state.coins + amount),
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

  feed: () => set((state) => {
    const progress = applyExperienceProgress(state, 6)
    return {
      hunger: clampStatus(state.hunger + 30),
      mood: clampStatus(state.mood + 10),
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
      cleanliness: clampStatus(state.cleanliness + 40),
      mood: clampStatus(state.mood + 15),
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
      mood: clampStatus(state.mood + 20),
      energy: clampStatus(state.energy - 10),
      hunger: clampStatus(state.hunger - 5),
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
    energy: clampStatus(state.energy + 30),
    currentAction: 'sleep',
    currentEmotion: state.energy < 40 ? 'tired' : state.currentEmotion,
  })),

  heal: () => set((state) => {
    const progress = applyExperienceProgress(state, 4)
    return {
      mood: clampStatus(state.mood + 20),
      energy: clampStatus(state.energy + 15),
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
      energy: clampStatus(state.energy - 15),
      mood: clampStatus(state.mood + 5),
      currentAction: 'idle',
      currentEmotion: 'neutral',
      experience: progress.experience,
      level: progress.level,
      coins: state.coins + 12,
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
      energy: clampStatus(state.energy - 20),
      hunger: clampStatus(state.hunger - 10),
      mood: clampStatus(state.mood - 5),
      currentAction: 'working',
      currentEmotion: 'neutral',
      experience: progress.experience,
      level: progress.level,
      coins: state.coins + 28,
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
      energy: clampStatus(state.energy - 15),
      mood: clampStatus(state.mood + 25),
      hunger: clampStatus(state.hunger - 10),
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
      energy: clampStatus(state.energy - workTimeMinutes * 2),
      hunger: clampStatus(state.hunger - workTimeMinutes),
      mood: state.mood > 50 ? clampStatus(state.mood - 5) : state.mood,
      currentAction: 'idle',
      currentEmotion: state.energy < 30 ? 'tired' : 'neutral',
      experience: progress.experience,
      level: progress.level,
      coins: state.coins + Math.max(10, workTimeMinutes * 3),
    }
  }),

  decay: () => set((state) => {
    const hunger = clampStatus(state.hunger - 0.5)
    const cleanliness = clampStatus(state.cleanliness - 0.3)
    const energy = state.currentAction === 'sleep'
      ? clampStatus(state.energy + 1)
      : clampStatus(state.energy - 0.2)

    let nextEmotion: Emotion = state.currentEmotion
    if (hunger < 30) nextEmotion = 'hungry'
    else if (energy < 30) nextEmotion = 'tired'
    else if (cleanliness < 30) nextEmotion = 'sad'
    else if (state.mood > 70) nextEmotion = 'happy'
    else nextEmotion = 'neutral'

    let mood = state.mood
    if (hunger < 30 || cleanliness < 30 || energy < 30) {
      mood = clampStatus(mood - 0.5)
    }

    return {
      hunger,
      cleanliness,
      energy,
      mood,
      currentEmotion: nextEmotion,
    }
  }),

  loadFromStorage: async () => {
    if (!window.electronAPI?.storage) return

    try {
      const savedState = await window.electronAPI.storage.getPetState()
      if (savedState) {
        set(normalizeLoadedState(savedState))
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

  reset: () => set(INITIAL_STATE),
}))

if (typeof window !== 'undefined' && window.electronAPI?.storage) {
  usePetStore.subscribe((state) => {
    const saveDebounced = () => {
      window.electronAPI.storage.savePetState(buildPersistedState(state))
    }

    const typedWindow = window as WindowWithPetSaveTimer
    const currentTimer = typedWindow[saveTimerKey]
    if (currentTimer) {
      window.clearTimeout(currentTimer)
    }

    typedWindow[saveTimerKey] = window.setTimeout(saveDebounced, 1000)
  })
}
