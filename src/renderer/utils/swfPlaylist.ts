import { PENGUIN_102_SPECIAL_PLAYLIST_BY_ID } from './penguin102OriginalPlaylists'

const LEGACY_SWF_BASE_PATH = '/assets/swf_original/'
const ABSOLUTE_ANIME_BASE_PATH = '/anime/'

export const IDLE_SWF_PATH = 'anime/102/1020000141.swf'
export const END_SWF_PATH = 'anime/end.swf'
export const ENTER_PLAYLIST = `anime/102/1020110141.swf,${IDLE_SWF_PATH}`

const ENDING_SWF_PATHS = new Set([
  'anime/102/1020120141.swf',
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

  if (trimmedPath.startsWith(LEGACY_SWF_BASE_PATH)) {
    return `anime/${trimmedPath.slice(LEGACY_SWF_BASE_PATH.length)}`
  }

  if (trimmedPath.startsWith(ABSOLUTE_ANIME_BASE_PATH)) {
    return trimmedPath.slice(1)
  }

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
