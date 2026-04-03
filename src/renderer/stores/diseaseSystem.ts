/**
 * 疾病系统 — 基于原版 QQ 宠物 State.js
 *
 * 3 条疾病链，每条 4 个阶段（加上终末=死亡）
 * 触发条件：对应不适累计超过 4 次
 */

// ========== 类型定义 ==========

/** 不适类型 */
export type DiscomfortKind = 'overfed' | 'dirty' | 'hungry'

/** 疾病链类型 */
export type DiseaseChain = 'cold' | 'cough' | 'stomach'

/** 疾病阶段：0=无病，1-4=疾病等级，4=终末 */
export type DiseaseStage = 0 | 1 | 2 | 3 | 4

export interface DiseaseState {
  /** 各类不适累计次数 */
  discomfortCounters: Record<DiscomfortKind, number>
  /** 当前疾病（null=健康） */
  activeDisease: { chain: DiseaseChain; stage: DiseaseStage } | null
  /** 上次疾病恶化的时间戳 */
  lastProgressionTime: number
}

// ========== 疾病链定义 ==========

export interface DiseaseInfo {
  chain: DiseaseChain
  stage: DiseaseStage
  name: string
  medicineId: string
}

/** 感冒链：饱食不适触发 */
const COLD_CHAIN: DiseaseInfo[] = [
  { chain: 'cold', stage: 1, name: '感冒', medicineId: '10001' },     // 板蓝根
  { chain: 'cold', stage: 2, name: '发烧', medicineId: '30004' },     // 退烧药
  { chain: 'cold', stage: 3, name: '重感冒', medicineId: '20001' },   // 银翘丸
  { chain: 'cold', stage: 4, name: '肺炎', medicineId: '30001' },     // 金色消炎水
]

/** 咳嗽链：脏乱不适触发 */
const COUGH_CHAIN: DiseaseInfo[] = [
  { chain: 'cough', stage: 1, name: '咳嗽', medicineId: '10003' },    // 枇杷糖浆
  { chain: 'cough', stage: 2, name: '支气管炎', medicineId: '20003' }, // 甘草剂
  { chain: 'cough', stage: 3, name: '哮喘', medicineId: '30003' },    // 定喘丸
  { chain: 'cough', stage: 4, name: '肺结核', medicineId: '40003' },  // 通风散
]

/** 肚子胀链：饥饿不适触发 */
const STOMACH_CHAIN: DiseaseInfo[] = [
  { chain: 'stomach', stage: 1, name: '肚子胀', medicineId: '10002' }, // 消食片
  { chain: 'stomach', stage: 2, name: '胃炎', medicineId: '20002' },   // 蓝色消炎水
  { chain: 'stomach', stage: 3, name: '胃溃疡', medicineId: '30002' }, // 龙胆草
  { chain: 'stomach', stage: 4, name: '胃癌', medicineId: '40002' },   // 仙人汤
]

const DISEASE_CHAINS: Record<DiseaseChain, DiseaseInfo[]> = {
  cold: COLD_CHAIN,
  cough: COUGH_CHAIN,
  stomach: STOMACH_CHAIN,
}

/** 不适类型 → 触发的疾病链 */
const DISCOMFORT_TO_CHAIN: Record<DiscomfortKind, DiseaseChain> = {
  overfed: 'cold',
  dirty: 'cough',
  hungry: 'stomach',
}

/** 触发疾病的不适次数阈值 */
const DISCOMFORT_THRESHOLD = 4

/** 疾病恶化间隔（毫秒）= 10 分钟 */
export const DISEASE_PROGRESSION_INTERVAL = 10 * 60 * 1000

// ========== 初始状态 ==========

export function createInitialDiseaseState(): DiseaseState {
  return {
    discomfortCounters: { overfed: 0, dirty: 0, hungry: 0 },
    activeDisease: null,
    lastProgressionTime: Date.now(),
  }
}

// ========== 核心逻辑 ==========

/**
 * 检测当前哪些不适条件成立
 */
export function checkDiscomfort(
  hunger: number,
  cleanliness: number,
  hungerMax: number,
): DiscomfortKind[] {
  const active: DiscomfortKind[] = []
  if (hunger > hungerMax - 260) active.push('overfed')
  if (cleanliness < 1080) active.push('dirty')
  if (hunger < 720) active.push('hungry')
  return active
}

/**
 * 每 tick 更新不适计数器，可能触发新疾病
 */
export function tickDiscomfort(
  state: DiseaseState,
  activeDiscomforts: DiscomfortKind[],
): DiseaseState {
  const counters = { ...state.discomfortCounters }

  // 更新计数器
  for (const kind of activeDiscomforts) {
    counters[kind] = (counters[kind] || 0) + 1
  }

  // 没有不适的类型重置计数器
  for (const kind of ['overfed', 'dirty', 'hungry'] as DiscomfortKind[]) {
    if (!activeDiscomforts.includes(kind)) {
      counters[kind] = 0
    }
  }

  let disease = state.activeDisease

  // 如果没有疾病，检查是否有计数器超过阈值
  if (!disease) {
    for (const kind of activeDiscomforts) {
      if (counters[kind] > DISCOMFORT_THRESHOLD) {
        const chain = DISCOMFORT_TO_CHAIN[kind]
        disease = { chain, stage: 1 as DiseaseStage }
        counters[kind] = 0 // 重置触发的计数器
        break
      }
    }
  }

  return {
    ...state,
    discomfortCounters: counters,
    activeDisease: disease,
  }
}

/**
 * 疾病恶化：未治疗的疾病阶段 +1
 * 应在 DISEASE_PROGRESSION_INTERVAL 间隔调用
 */
export function progressDisease(state: DiseaseState, now: number): DiseaseState {
  if (!state.activeDisease) return state
  if (now - state.lastProgressionTime < DISEASE_PROGRESSION_INTERVAL) return state

  const { chain, stage } = state.activeDisease
  const nextStage = Math.min(4, stage + 1) as DiseaseStage

  return {
    ...state,
    activeDisease: { chain, stage: nextStage },
    lastProgressionTime: now,
  }
}

/** 万能药品：百草丹治愈一级，还魂丹直接痊愈 */
const UNIVERSAL_CURE_ONE = '50001'  // 百草丹
const UNIVERSAL_CURE_ALL = '60001'  // 还魂丹

/**
 * 使用药品治疗
 * 正确药品/百草丹：疾病阶段 -1（降到 0 则痊愈）
 * 还魂丹：直接痊愈
 * 错误药品：无效果
 */
export function applyMedicine(
  state: DiseaseState,
  medicineId: string,
): { state: DiseaseState; cured: boolean; wrongMedicine: boolean } {
  if (!state.activeDisease) {
    return { state, cured: false, wrongMedicine: false }
  }

  const { chain, stage } = state.activeDisease

  // 还魂丹：直接痊愈
  if (medicineId === UNIVERSAL_CURE_ALL) {
    return {
      state: { ...state, activeDisease: null },
      cured: true,
      wrongMedicine: false,
    }
  }

  // 百草丹：治愈一级（等同对症药品）
  if (medicineId === UNIVERSAL_CURE_ONE) {
    const newStage = (stage - 1) as DiseaseStage
    return {
      state: {
        ...state,
        activeDisease: newStage === 0 ? null : { chain, stage: newStage },
      },
      cured: newStage === 0,
      wrongMedicine: false,
    }
  }

  // 检查药品是否匹配当前疾病
  const chainDiseases = DISEASE_CHAINS[chain]
  const currentDisease = chainDiseases[stage - 1]
  if (currentDisease.medicineId !== medicineId) {
    return { state, cured: false, wrongMedicine: true }
  }

  // 治愈一级
  const newStage = (stage - 1) as DiseaseStage

  return {
    state: {
      ...state,
      activeDisease: newStage === 0 ? null : { chain, stage: newStage },
    },
    cured: newStage === 0,
    wrongMedicine: false,
  }
}

/**
 * 从疾病状态推导健康值（0-5）
 */
export function healthFromDisease(diseaseState: DiseaseState): number {
  if (!diseaseState.activeDisease) return 5
  return Math.max(0, 5 - diseaseState.activeDisease.stage)
}

/**
 * 获取当前疾病信息
 */
export function getCurrentDiseaseInfo(state: DiseaseState): DiseaseInfo | null {
  if (!state.activeDisease) return null
  const { chain, stage } = state.activeDisease
  return DISEASE_CHAINS[chain][stage - 1] ?? null
}
