import { create } from 'zustand'

export type AnimationAction = 'idle' | 'walk' | 'run' | 'sit' | 'sleep' | 'working' | 'eating' | 'bathing' | 'playing'
export type Emotion = 'happy' | 'sad' | 'angry' | 'tired' | 'hungry' | 'neutral'

export interface PetState {
  // 基础属性
  id: string
  name: string

  // 状态值 (0-100)
  hunger: number        // 饥饿值
  cleanliness: number   // 清洁值
  mood: number          // 心情值
  energy: number        // 能量值

  // 位置和动画
  position: { x: number; y: number }
  currentAction: AnimationAction
  currentEmotion: Emotion

  // 统计信息
  tasksCompleted: number
  totalWorkTime: number  // 总工作时长（分钟）
  createdAt: number      // 创建时间戳
  lastFed: number        // 上次喂食时间
  lastCleaned: number    // 上次清洁时间
}

interface PetActions {
  // 状态更新
  updateHunger: (value: number) => void
  updateCleanliness: (value: number) => void
  updateMood: (value: number) => void
  updateEnergy: (value: number) => void

  // 动作
  setAction: (action: AnimationAction) => void
  setEmotion: (emotion: Emotion) => void
  setPosition: (x: number, y: number) => void

  // 养成功能
  feed: () => void
  clean: () => void
  play: () => void
  rest: () => void

  // 工作相关
  startWorking: () => void
  finishWorking: (workTimeMinutes: number) => void

  // 自动衰减
  decay: () => void

  // 持久化
  loadFromStorage: () => Promise<void>
  saveToStorage: () => void

  // 重置
  reset: () => void
}

const INITIAL_STATE: PetState = {
  id: 'cyber-mate-1',
  name: 'Cyber Mate',
  hunger: 80,
  cleanliness: 80,
  mood: 80,
  energy: 80,
  position: { x: 100, y: 100 },
  currentAction: 'idle',
  currentEmotion: 'neutral',
  tasksCompleted: 0,
  totalWorkTime: 0,
  createdAt: Date.now(),
  lastFed: Date.now(),
  lastCleaned: Date.now(),
}

export const usePetStore = create<PetState & PetActions>((set) => ({
  ...INITIAL_STATE,

  // 状态更新
  updateHunger: (value) => set({ hunger: Math.max(0, Math.min(100, value)) }),
  updateCleanliness: (value) => set({ cleanliness: Math.max(0, Math.min(100, value)) }),
  updateMood: (value) => set({ mood: Math.max(0, Math.min(100, value)) }),
  updateEnergy: (value) => set({ energy: Math.max(0, Math.min(100, value)) }),

  // 动作
  setAction: (action) => set({ currentAction: action }),
  setEmotion: (emotion) => set({ currentEmotion: emotion }),
  setPosition: (x, y) => set({ position: { x, y } }),

  // 喂食
  feed: () => set((state) => {
    const newHunger = Math.min(100, state.hunger + 30)
    const newMood = Math.min(100, state.mood + 10)
    return {
      hunger: newHunger,
      mood: newMood,
      lastFed: Date.now(),
      currentAction: 'eating',
      currentEmotion: 'happy',
    }
  }),

  // 清洁
  clean: () => set((state) => {
    const newCleanliness = Math.min(100, state.cleanliness + 40)
    const newMood = Math.min(100, state.mood + 15)
    return {
      cleanliness: newCleanliness,
      mood: newMood,
      lastCleaned: Date.now(),
      currentAction: 'bathing',
      currentEmotion: 'happy',
    }
  }),

  // 玩耍
  play: () => set((state) => {
    const newMood = Math.min(100, state.mood + 20)
    const newEnergy = Math.max(0, state.energy - 10)
    const newHunger = Math.max(0, state.hunger - 5)
    return {
      mood: newMood,
      energy: newEnergy,
      hunger: newHunger,
      currentAction: 'playing',
      currentEmotion: 'happy',
    }
  }),

  // 休息
  rest: () => set((state) => {
    const newEnergy = Math.min(100, state.energy + 30)
    return {
      energy: newEnergy,
      currentAction: 'sleep',
    }
  }),

  // 开始工作
  startWorking: () => set({
    currentAction: 'working',
    currentEmotion: 'neutral',
  }),

  // 完成工作
  finishWorking: (workTimeMinutes) => set((state) => {
    const newEnergy = Math.max(0, state.energy - workTimeMinutes * 2)
    const newHunger = Math.max(0, state.hunger - workTimeMinutes)
    const newMood = state.mood > 50 ? state.mood - 5 : state.mood
    return {
      tasksCompleted: state.tasksCompleted + 1,
      totalWorkTime: state.totalWorkTime + workTimeMinutes,
      energy: newEnergy,
      hunger: newHunger,
      mood: newMood,
      currentAction: 'idle',
      currentEmotion: newEnergy < 30 ? 'tired' : 'neutral',
    }
  }),

  // 自动衰减（每分钟调用一次）
  decay: () => set((state) => {
    const newHunger = Math.max(0, state.hunger - 0.5)
    const newCleanliness = Math.max(0, state.cleanliness - 0.3)
    const newEnergy = state.currentAction === 'sleep'
      ? Math.min(100, state.energy + 1)
      : Math.max(0, state.energy - 0.2)

    // 根据状态自动更新情绪
    let newEmotion: Emotion = state.currentEmotion
    if (newHunger < 30) newEmotion = 'hungry'
    else if (newEnergy < 30) newEmotion = 'tired'
    else if (newCleanliness < 30) newEmotion = 'sad'
    else if (state.mood > 70) newEmotion = 'happy'
    else newEmotion = 'neutral'

    // 状态低时降低心情
    let newMood = state.mood
    if (newHunger < 30 || newCleanliness < 30 || newEnergy < 30) {
      newMood = Math.max(0, newMood - 0.5)
    }

    return {
      hunger: newHunger,
      cleanliness: newCleanliness,
      energy: newEnergy,
      mood: newMood,
      currentEmotion: newEmotion,
    }
  }),

  // 从存储加载
  loadFromStorage: async () => {
    if (!window.electronAPI?.storage) return

    try {
      const savedState = await window.electronAPI.storage.getPetState()
      if (savedState) {
        set({
          hunger: savedState.hunger,
          cleanliness: savedState.cleanliness,
          mood: savedState.mood,
          energy: savedState.energy,
        })
        console.log('✅ 宠物状态已从存储恢复')
      }
    } catch (error) {
      console.error('❌ 加载宠物状态失败:', error)
    }
  },

  // 保存到存储
  saveToStorage: () => {
    if (!window.electronAPI?.storage) return

    const state = usePetStore.getState()
    window.electronAPI.storage.savePetState({
      hunger: state.hunger,
      cleanliness: state.cleanliness,
      mood: state.mood,
      energy: state.energy,
      level: 1,
      experience: 0,
      lastUpdateTime: Date.now(),
    })
  },

  // 重置
  reset: () => set(INITIAL_STATE),
}))

// 自动保存：订阅状态变化
if (typeof window !== 'undefined' && window.electronAPI?.storage) {
  usePetStore.subscribe((state) => {
    // 延迟保存，避免频繁写入
    const saveDebounced = () => {
      window.electronAPI.storage.savePetState({
        hunger: state.hunger,
        cleanliness: state.cleanliness,
        mood: state.mood,
        energy: state.energy,
        level: 1,
        experience: 0,
        lastUpdateTime: Date.now(),
      })
    }

    // 使用 setTimeout 实现简单的防抖
    if ((window as any)._petStateSaveTimer) {
      clearTimeout((window as any)._petStateSaveTimer)
    }
    (window as any)._petStateSaveTimer = setTimeout(saveDebounced, 1000)
  })
}
