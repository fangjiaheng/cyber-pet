/**
 * 活动系统 — 管理打工/学习/旅行的互斥和计时
 */

import { create } from 'zustand'
import type { WorkEntry, StudyEntry, StudySubject } from '../../shared/itemCatalog'

export type ActivityType = 'work' | 'study' | 'travel'

export interface ActiveActivity {
  type: ActivityType
  /** 工作/学习的 ID 或 key */
  id: string
  /** 显示名称 */
  name: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 完成后的奖励数据 */
  rewards: {
    yb?: number
    charm?: number
    intel?: number
    strong?: number
    subject?: StudySubject
    studyHours?: number
  }
  /** 消耗数据 */
  costs: {
    starve?: number
    clean?: number
    mood?: number
  }
}

export interface StudyProgress {
  /** 各科目累计学时 */
  hours: Record<StudySubject, number>
}

export interface ActivityState {
  active: ActiveActivity | null
  studyProgress: StudyProgress
}

export interface ActivityActions {
  startWork: (work: WorkEntry) => boolean
  startStudy: (entry: StudyEntry) => boolean
  cancelActivity: () => void
  /** 检查活动是否已完成，返回完成的活动 */
  checkCompletion: () => ActiveActivity | null
  /** 完成活动并清除 */
  completeActivity: () => ActiveActivity | null
  isActive: () => boolean
  /** 获取学历等级 */
  getSchoolLevel: (subject: StudySubject) => string
  /** 检查学历是否满足要求 */
  meetsEducation: (requirements: Partial<Record<StudySubject, number>>) => boolean
  loadFromSaved: (saved: { active?: ActiveActivity | null; studyProgress?: StudyProgress } | null) => void
  getPersistedData: () => { active: ActiveActivity | null; studyProgress: StudyProgress }
}

const INITIAL_STUDY_PROGRESS: StudyProgress = {
  hours: {
    chinese: 0, mathematics: 0, politics: 0,
    music: 0, art: 0, manner: 0,
    pe: 0, labouring: 0, wushu: 0,
  },
}

function resolveSchoolLevel(hours: number): string {
  if (hours >= 95) return '学无止境'
  if (hours >= 40) return '研究生'
  if (hours >= 20) return '大学'
  if (hours >= 9) return '中学'
  if (hours > 0) return '小学'
  return '未入学'
}

export const useActivityStore = create<ActivityState & ActivityActions>((set, get) => ({
  active: null,
  studyProgress: { ...INITIAL_STUDY_PROGRESS },

  startWork: (work) => {
    if (get().active) return false
    const now = Date.now()
    set({
      active: {
        type: 'work',
        id: work.id,
        name: work.tolkName,
        startTime: now,
        endTime: now + work.useTime * 60 * 1000,
        rewards: {
          yb: work.yb,
          charm: work.charm,
          intel: work.intel,
          strong: work.strong,
        },
        costs: {
          starve: work.starve,
          clean: work.clean,
          mood: work.mood,
        },
      },
    })
    return true
  },

  startStudy: (entry) => {
    if (get().active) return false
    const now = Date.now()
    set({
      active: {
        type: 'study',
        id: entry.key,
        name: entry.tolkName,
        startTime: now,
        endTime: now + entry.classTime * 60 * 1000,
        rewards: {
          charm: entry.charm,
          intel: entry.intel,
          strong: entry.strong,
          subject: entry.subject,
          studyHours: 1,
        },
        costs: {
          starve: entry.starve,
          clean: entry.clean,
        },
      },
    })
    return true
  },

  cancelActivity: () => {
    set({ active: null })
  },

  checkCompletion: () => {
    const { active } = get()
    if (!active) return null
    if (Date.now() >= active.endTime) return active
    return null
  },

  completeActivity: () => {
    const { active, studyProgress } = get()
    if (!active || Date.now() < active.endTime) return null

    // 学习活动：更新学时
    if (active.type === 'study' && active.rewards.subject) {
      const subject = active.rewards.subject
      const newHours = { ...studyProgress.hours }
      newHours[subject] = Math.min(95, (newHours[subject] || 0) + (active.rewards.studyHours || 1))
      set({ active: null, studyProgress: { hours: newHours } })
    } else {
      set({ active: null })
    }

    return active
  },

  isActive: () => get().active !== null,

  getSchoolLevel: (subject) => {
    return resolveSchoolLevel(get().studyProgress.hours[subject] || 0)
  },

  meetsEducation: (requirements) => {
    const { hours } = get().studyProgress
    for (const [subject, required] of Object.entries(requirements)) {
      if ((hours[subject as StudySubject] || 0) < (required || 0)) return false
    }
    return true
  },

  loadFromSaved: (saved) => {
    if (!saved) return
    const updates: Partial<ActivityState> = {}
    if (saved.active) {
      // 检查活动是否已过期
      if (Date.now() < saved.active.endTime) {
        updates.active = saved.active
      }
    }
    if (saved.studyProgress) {
      updates.studyProgress = {
        hours: { ...INITIAL_STUDY_PROGRESS.hours, ...saved.studyProgress.hours },
      }
    }
    if (Object.keys(updates).length > 0) set(updates)
  },

  getPersistedData: () => ({
    active: get().active,
    studyProgress: get().studyProgress,
  }),
}))
