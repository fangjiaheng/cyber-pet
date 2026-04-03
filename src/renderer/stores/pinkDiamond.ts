/**
 * 粉钻(VIP)系统 — 基于原版 QQ 宠物
 *
 * 7个等级，元宝购买，每日额外成长加成
 */

export interface PinkDiamondState {
  active: boolean
  level: number          // 1-7
  beginDate: number      // 开始时间
  expirationDate: number // 到期时间
}

/** 各等级每日额外成长值 */
const LEVEL_GROWTH_BONUS = [0, 100, 300, 600, 1100, 1800, 2800]

/** 购买费用（元宝） */
export const PINK_DIAMOND_COST = 300

/** 有效期（天） */
export const PINK_DIAMOND_DURATION_DAYS = 5

export function createInitialPinkDiamondState(): PinkDiamondState {
  return { active: false, level: 0, beginDate: 0, expirationDate: 0 }
}

/** 购买/续费粉钻 */
export function purchasePinkDiamond(state: PinkDiamondState): PinkDiamondState {
  const now = Date.now()
  const newLevel = Math.min(7, (state.active ? state.level : 0) + 1)
  return {
    active: true,
    level: newLevel,
    beginDate: now,
    expirationDate: now + PINK_DIAMOND_DURATION_DAYS * 24 * 60 * 60 * 1000,
  }
}

/** 检查是否过期 */
export function checkPinkDiamondExpiry(state: PinkDiamondState): PinkDiamondState {
  if (!state.active) return state
  if (Date.now() > state.expirationDate) {
    return { ...state, active: false }
  }
  return state
}

/** 获取当前等级的每日成长加成 */
export function getDailyGrowthBonus(state: PinkDiamondState): number {
  if (!state.active || state.level <= 0) return 0
  return LEVEL_GROWTH_BONUS[Math.min(state.level, 7) - 1] || 0
}

/** 获取剩余天数 */
export function getRemainingDays(state: PinkDiamondState): number {
  if (!state.active) return 0
  const remaining = state.expirationDate - Date.now()
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)))
}
