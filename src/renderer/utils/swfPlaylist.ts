import { PENGUIN_102_SPECIAL_PLAYLIST_BY_ID } from './penguin102OriginalPlaylists'
import {
  getIdleSwfPath,
  getExitSwfPath,
  getEnterPlaylist,
  getEndingSwfPaths,
  toPlaylistPath,
} from './stageSwfResolver'
import type { GrowthStage, MoodAppearance } from '../stores/growthConfig'

const LEGACY_SWF_BASE_PATH = '/assets/swf_original/'
const ABSOLUTE_ANIME_BASE_PATH = '/anime/'
// 新版素材路径前缀
const NEW_ASSETS_BASE_PATH = '/assets/1.2.4source/'

// ============================================================
// 默认路径（成年+平静，兼容旧引用）
// ============================================================
export const IDLE_SWF_PATH = toPlaylistPath(getIdleSwfPath('adult', 'peaceful'))
export const END_SWF_PATH = toPlaylistPath(getExitSwfPath('adult'))
export const ENTER_PLAYLIST = getEnterPlaylist('adult', 'peaceful')

// 默认结束路径集合
const DEFAULT_ENDING_SWF_PATHS = getEndingSwfPaths('adult')

/**
 * 获取阶段感知的待机路径
 */
export function getStageIdlePath(stage: GrowthStage, mood: MoodAppearance): string {
  return toPlaylistPath(getIdleSwfPath(stage, mood))
}

/**
 * 获取阶段感知的退场路径
 */
export function getStageEndPath(stage: GrowthStage): string {
  return toPlaylistPath(getExitSwfPath(stage))
}

/**
 * 获取阶段感知的入场播放列表
 */
export function getStageEnterPlaylist(stage: GrowthStage, mood: MoodAppearance): string {
  return getEnterPlaylist(stage, mood)
}

export function normalizeLoadlistsPath(path: string): string {
  const trimmedPath = path.trim()

  if (!trimmedPath) {
    return IDLE_SWF_PATH
  }

  if (trimmedPath.includes(',')) {
    return trimmedPath
      .split(',')
      .map((segment) => normalizeLoadlistsPath(segment))
      .join(',')
  }

  // 处理旧版素材路径
  if (trimmedPath.startsWith(LEGACY_SWF_BASE_PATH)) {
    return `anime/${trimmedPath.slice(LEGACY_SWF_BASE_PATH.length)}`
  }

  // 处理 anime 绝对路径
  if (trimmedPath.startsWith(ABSOLUTE_ANIME_BASE_PATH)) {
    return trimmedPath.slice(1)
  }

  // 处理新版素材路径 - 去掉开头的 /
  if (trimmedPath.startsWith(NEW_ASSETS_BASE_PATH)) {
    return trimmedPath.slice(1)
  }

  // 其他以 / 开头的路径
  if (trimmedPath.startsWith('/')) {
    return trimmedPath.slice(1)
  }

  return trimmedPath
}

export function buildLoadlistsPlaylist(
  path: string,
  options?: {
    appendIdle?: boolean
    animationId?: string
    idlePath?: string
    endPath?: string
  },
): string {
  const normalizedPath = normalizeLoadlistsPath(path)
  const idlePath = options?.idlePath ?? IDLE_SWF_PATH
  const endPath = options?.endPath ?? END_SWF_PATH

  if (normalizedPath.includes(',')) {
    return normalizedPath
  }

  const normalizedAnimationId = options?.animationId?.trim()

  if (normalizedAnimationId) {
    const originalPlaylist = PENGUIN_102_SPECIAL_PLAYLIST_BY_ID[normalizedAnimationId]

    if (originalPlaylist) {
      return originalPlaylist
    }
  }

  if (normalizedPath === idlePath || normalizedPath === endPath) {
    return normalizedPath
  }

  if (options?.appendIdle === false) {
    return normalizedPath
  }

  if (DEFAULT_ENDING_SWF_PATHS.has(normalizedPath)) {
    return `${normalizedPath},${endPath}`
  }

  return `${normalizedPath},${idlePath}`
}
