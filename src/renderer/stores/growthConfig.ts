/**
 * 成长系统配置 — 基于原版 QQ 宠物数值
 */

// ========== 等级经验表 ==========

/**
 * 渐进经验表（前 20 级来自原版，后续按公式外推至 400 级）
 * 原版公式近似：exp(n) ≈ exp(n-1) + 200 + (n-2)*100  （n>=3）
 */
function generateExperienceTable(): number[] {
  // 原版前 20 级精确值
  const table: number[] = [
    0,      // Lv1
    100,    // Lv2
    300,    // Lv3
    600,    // Lv4
    1100,   // Lv5
    1800,   // Lv6
    2800,   // Lv7
    4200,   // Lv8
    5900,   // Lv9
    8000,   // Lv10
    10600,  // Lv11
    13700,  // Lv12
    17400,  // Lv13
    21700,  // Lv14
    26700,  // Lv15
    32500,  // Lv16
    39000,  // Lv17
    46300,  // Lv18
    54500,  // Lv19
    63600,  // Lv20
  ]

  // 从 Lv21 开始外推到 Lv400
  for (let i = 20; i < 400; i++) {
    const prev = table[i - 1]
    const prevPrev = table[i - 2]
    const delta = prev - prevPrev
    // 增量递增约 800~1000 每级
    table.push(prev + delta + 900)
  }

  return table
}

export const EXPERIENCE_TABLE = generateExperienceTable()

/**
 * 根据累计经验查找当前等级（二分查找）
 */
export function levelForExperience(exp: number): number {
  let lo = 0
  let hi = EXPERIENCE_TABLE.length - 1

  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1
    if (EXPERIENCE_TABLE[mid] <= exp) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }

  return lo + 1 // 等级从 1 开始
}

// ========== 属性上限 ==========

/** 饥饿上限 = 3000 + 100 × min(level, 30)，最大 6000 */
export function getHungerMax(level: number): number {
  return Math.min(6000, 3000 + 100 * Math.min(level, 30))
}

/** 清洁上限 = 同饥饿公式 */
export function getCleanlinessMax(level: number): number {
  return Math.min(6000, 3000 + 100 * Math.min(level, 30))
}

/** 心情上限固定 1000 */
export const MOOD_MAX = 1000

/** 健康上限固定 5（5=健康，0=死亡） */
export const HEALTH_MAX = 5

/** 能量上限保持 100（非原版属性，本项目扩展） */
export const ENERGY_MAX = 100

// ========== 成长阶段 ==========

export type GrowthStage = 'egg' | 'kid' | 'adult'

/** 蛋 ≤4、幼年 5-8、成年 ≥9 */
export function getGrowthStage(level: number): GrowthStage {
  if (level <= 4) return 'egg'
  if (level < 9) return 'kid'
  return 'adult'
}

// ========== 心情外观 ==========

export type MoodAppearance = 'happy' | 'peaceful' | 'upset' | 'sad'

/** 成年阶段根据心情值切换外观 */
export function getMoodAppearance(mood: number): MoodAppearance {
  if (mood >= 900) return 'happy'
  if (mood >= 800) return 'peaceful'
  if (mood >= 500) return 'upset'
  return 'sad'
}

// ========== 存档版本 ==========

/** 当前存档版本号 */
export const SAVE_VERSION = 1
