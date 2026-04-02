/**
 * 存档迁移 — 将旧版数据结构转换为新版成长系统
 */

import {
  EXPERIENCE_TABLE,
  getHungerMax,
  getCleanlinessMax,
  MOOD_MAX,
  HEALTH_MAX,
  ENERGY_MAX,
  SAVE_VERSION,
} from './growthConfig'

/** 旧版常量 */
const OLD_HUNGER_MAX = 3500
const OLD_CLEANLINESS_MAX = 3500
const OLD_MOOD_MAX = 100
// 旧版 200 exp/级

/**
 * 检查是否需要迁移
 */
export function needsMigration(savedState: Record<string, unknown>): boolean {
  return !savedState.saveVersion || (savedState.saveVersion as number) < SAVE_VERSION
}

/**
 * 备份原始存档到 localStorage（防止迁移失败丢数据）
 */
export function backupOldSave(savedState: Record<string, unknown>): void {
  try {
    localStorage.setItem('__petState_backup_v0', JSON.stringify(savedState))
  } catch {
    // localStorage 不可用时静默忽略
  }
}

/**
 * 将旧版存档迁移到新版格式
 */
export function migrateState(saved: Record<string, unknown>): Record<string, unknown> {
  const oldLevel = Math.max(1, Number(saved.level ?? 1))
  const newLevel = oldLevel

  // 经验：旧版 level 对应新表中的起始经验
  const tableIndex = Math.min(newLevel - 1, EXPERIENCE_TABLE.length - 1)
  const newExperience = EXPERIENCE_TABLE[tableIndex]

  // 饥饿：按比例从旧上限缩放到新上限
  const newHungerMax = getHungerMax(newLevel)
  const oldHunger = Number(saved.hunger ?? 80)
  const newHunger = Math.round((oldHunger / OLD_HUNGER_MAX) * newHungerMax)

  // 清洁：同上
  const newCleanMax = getCleanlinessMax(newLevel)
  const oldCleanliness = Number(saved.cleanliness ?? 80)
  const newCleanliness = Math.round((oldCleanliness / OLD_CLEANLINESS_MAX) * newCleanMax)

  // 心情：0-100 → 0-1000
  const oldMood = Number(saved.mood ?? 80)
  const newMood = Math.round((oldMood / OLD_MOOD_MAX) * MOOD_MAX)

  // 能量：范围不变
  const energy = Math.max(0, Math.min(ENERGY_MAX, Number(saved.energy ?? 80)))

  return {
    ...saved,
    level: newLevel,
    experience: newExperience,
    hunger: Math.max(0, Math.min(newHungerMax, newHunger)),
    cleanliness: Math.max(0, Math.min(newCleanMax, newCleanliness)),
    mood: Math.max(0, Math.min(MOOD_MAX, newMood)),
    energy,
    health: HEALTH_MAX, // 新增：默认健康
    saveVersion: SAVE_VERSION,
  }
}
