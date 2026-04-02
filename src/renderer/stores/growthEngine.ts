/**
 * 成长引擎 — 每分钟成长值计算 + 属性衰减
 * 基于原版 QQ 宠物 GrowUp.js 逻辑
 */

// ========== 成长值计算 ==========

const BASE_GROWTH_RATE = 260

/** 心情惩罚表 */
export function getMoodPenalty(mood: number): number {
  if (mood >= 900) return 0
  if (mood >= 700) return 20
  if (mood >= 500) return 70
  if (mood >= 300) return 100
  if (mood >= 100) return 140
  return 180
}

/** 健康惩罚表（health: 0-5） */
export function getHealthPenalty(health: number): number {
  if (health >= 5) return 0
  if (health >= 4) return 30
  if (health >= 3) return 80
  if (health >= 2) return 120
  if (health >= 1) return 160
  return -1 // 健康为 0 时停止成长（返回特殊值）
}

/** 属性惩罚：饥饿<720 或 清洁<1080 时各 -80 */
export function getAttributePenalty(hunger: number, cleanliness: number): number {
  let penalty = 0
  if (hunger < 720) penalty += 80
  if (cleanliness < 1080) penalty += 80
  return penalty
}

/**
 * 计算每 tick（每分钟）的成长值
 * 返回 0 表示停止成长（健康为 0）
 */
export function calculateGrowthPerTick(
  mood: number,
  health: number,
  hunger: number,
  cleanliness: number,
): number {
  // 健康为 0 时停止成长
  if (health <= 0) return 0

  const moodPenalty = getMoodPenalty(mood)
  const healthPenalty = getHealthPenalty(health)
  const attributePenalty = getAttributePenalty(hunger, cleanliness)

  return Math.max(0, BASE_GROWTH_RATE - moodPenalty - healthPenalty - attributePenalty)
}

// ========== 属性衰减 ==========

/** 随机整数 [min, max] */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export interface DecayResult {
  hungerDelta: number
  cleanlinessDelta: number
  moodDelta: number
  energyDelta: number
}

/**
 * 计算每 tick 的属性衰减量
 * 原版：饥饿/清洁随机 -5~8，心情 -2~4
 * mood<600 时饥饿和清洁额外 -2
 */
export function calculateDecay(
  mood: number,
  isSleeping: boolean,
): DecayResult {
  let hungerDelta = -randInt(5, 8)
  let cleanlinessDelta = -randInt(5, 8)
  const moodDelta = -randInt(2, 4)

  // 心情低于 600 时额外衰减
  if (mood < 600) {
    hungerDelta -= 2
    cleanlinessDelta -= 2
  }

  // 能量：睡觉恢复，否则缓慢消耗（非原版属性，保留现有逻辑）
  const energyDelta = isSleeping ? 1 : -0.2

  return {
    hungerDelta,
    cleanlinessDelta,
    moodDelta,
    energyDelta,
  }
}
