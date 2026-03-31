import { PENGUIN_102_SPECIAL_PLAYLIST_BY_ID } from './penguin102OriginalPlaylists'

const LEGACY_SWF_BASE_PATH = '/assets/swf_original/'
const ABSOLUTE_ANIME_BASE_PATH = '/anime/'
// 新版素材路径前缀
const NEW_ASSETS_BASE_PATH = '/assets/1.2.4source/'

// ============================================================
// 使用新版素材 (1.2.4source) - 独立 SWF 文件，直接加载
// ============================================================
export const IDLE_SWF_PATH = 'assets/1.2.4source/Action/GG/Adult/peaceful/Stand.swf'
export const END_SWF_PATH = 'assets/1.2.4source/Action/GG/Adult/Exit1.swf'
export const ENTER_PLAYLIST = `assets/1.2.4source/Action/GG/Adult/Enter1.swf,${IDLE_SWF_PATH}`

const ENDING_SWF_PATHS = new Set([
  'anime/102/1020120141.swf',
  'assets/1.2.4source/Action/GG/Adult/Exit1.swf',
  'assets/1.2.4source/Action/GG/Adult/Exit2.swf',
  'assets/1.2.4source/Action/GG/Adult/Exit3.swf',
  'assets/1.2.4source/Action/GG/Adult/Exit4.swf',
])

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
  },
): string {
  const normalizedPath = normalizeLoadlistsPath(path)

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

  if (normalizedPath === IDLE_SWF_PATH || normalizedPath === END_SWF_PATH) {
    return normalizedPath
  }

  if (options?.appendIdle === false) {
    return normalizedPath
  }

  if (ENDING_SWF_PATHS.has(normalizedPath)) {
    return `${normalizedPath},${END_SWF_PATH}`
  }

  return `${normalizedPath},${IDLE_SWF_PATH}`
}
