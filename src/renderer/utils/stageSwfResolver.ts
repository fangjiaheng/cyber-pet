/**
 * 阶段感知的 SWF 路径解析器
 * 根据成长阶段（蛋/幼年/成年）和心情状态动态返回 SWF 路径
 */

import type { GrowthStage, MoodAppearance } from '../stores/growthConfig'

const BASE_PATHS: Record<GrowthStage, string> = {
  egg: '/assets/1.2.4source/Action/GG/Egg/',
  kid: '/assets/1.2.4source/Action/GG/Kid/',
  adult: '/assets/1.2.4source/Action/GG/Adult/',
}

/**
 * 获取当前阶段的 SWF 基础路径
 */
export function getSwfBase(stage: GrowthStage): string {
  return BASE_PATHS[stage]
}

/**
 * 获取待机动画路径
 * - 蛋/幼年：直接 Stand.swf
 * - 成年：{mood}/Stand.swf
 */
export function getIdleSwfPath(stage: GrowthStage, moodAppearance: MoodAppearance): string {
  const base = BASE_PATHS[stage]
  if (stage === 'adult') {
    return `${base}${moodAppearance}/Stand.swf`
  }
  return `${base}Stand.swf`
}

/**
 * 获取入场动画路径
 */
export function getEnterSwfPath(stage: GrowthStage): string {
  const base = BASE_PATHS[stage]
  if (stage === 'adult') {
    return `${base}Enter1.swf`
  }
  return `${base}Enter1.swf`
}

/**
 * 获取退场动画路径
 */
export function getExitSwfPath(stage: GrowthStage): string {
  const base = BASE_PATHS[stage]
  return `${base}Exit1.swf`
}

/**
 * 获取入场播放列表（Enter + Idle）
 */
export function getEnterPlaylist(stage: GrowthStage, moodAppearance: MoodAppearance): string {
  const enter = getEnterSwfPath(stage)
  const idle = getIdleSwfPath(stage, moodAppearance)
  // 去掉开头的 / 以匹配现有路径格式
  return `${enter.slice(1)},${idle.slice(1)}`
}

/**
 * 获取日常动作的 SWF 路径（吃/清洁/治疗）
 * 这些动作在成年阶段位于根目录，蛋/幼年直接在各自目录下
 */
export function getActionSwfPath(
  stage: GrowthStage,
  action: 'Eat1' | 'Eat2' | 'Clean1' | 'Clean2' | 'Cure1' | 'Cure2' | 'Revival',
): string {
  const base = BASE_PATHS[stage]
  return `${base}${action}.swf`
}

/**
 * 获取阶段切换过渡动画路径
 */
export function getTransitionSwfPath(from: GrowthStage, to: GrowthStage): string | null {
  const base = BASE_PATHS.adult
  if (from === 'egg' && to === 'kid') {
    return `${base}Etoj.swf`
  }
  if (from === 'kid' && to === 'adult') {
    return `${base}Jtoc.swf`
  }
  return null
}

/**
 * 获取结束动画路径集合（用于判断是否需要衔接退场动画）
 */
export function getEndingSwfPaths(stage: GrowthStage): Set<string> {
  const base = BASE_PATHS[stage].slice(1) // 去掉开头的 /
  const paths = new Set<string>()

  if (stage === 'egg') {
    paths.add(`${base}Exit1.swf`)
    paths.add(`${base}Exit2.swf`)
    paths.add(`${base}Exit3.swf`)
  } else if (stage === 'kid') {
    paths.add(`${base}Exit1.swf`)
    paths.add(`${base}Exit2.swf`)
    paths.add(`${base}Exit3.swf`)
  } else {
    paths.add(`${base}Exit1.swf`)
    paths.add(`${base}Exit2.swf`)
    paths.add(`${base}Exit3.swf`)
    paths.add(`${base}Exit4.swf`)
  }

  // 旧版兼容
  paths.add('anime/102/1020120141.swf')

  return paths
}

/**
 * 将带 / 前缀的路径标准化为不带 / 的格式（匹配现有 playlist 格式）
 */
export function toPlaylistPath(absolutePath: string): string {
  return absolutePath.startsWith('/') ? absolutePath.slice(1) : absolutePath
}
