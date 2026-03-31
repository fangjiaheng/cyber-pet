import React, { useEffect, useRef } from 'react'
import './RufflePlayer.css'

declare global {
  interface Window {
    RufflePlayer: any
  }
}

type ControllerState = {
  hasLoadLists: boolean
  hasSetId: boolean
  hasBridgeApi: boolean
}

type ControllerReadyResult = {
  player: any
  controllerState: ControllerState
}

interface RufflePlayerProps {
  playlist: string
  playToken?: number
  petId?: number
  width?: number
  height?: number
  stageWidth?: number
  stageHeight?: number
  scale?: number
  onLoad?: () => void
  onError?: (error: Error) => void
}

const CONTROLLER_SWF_URL = '/player.swf'
// 新版素材路径前缀 - 这些 SWF 是独立文件，需要直接加载
const NEW_ASSETS_PREFIX = 'assets/1.2.4source/'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 检测是否为新版独立 SWF 素材
function isStandaloneSwf(playlist: string): boolean {
  return playlist.includes(NEW_ASSETS_PREFIX)
}

async function ensureRuffleLoaded(): Promise<void> {
  if (window.RufflePlayer && typeof window.RufflePlayer.newest === 'function') return

  if (!window.RufflePlayer) {
    window.RufflePlayer = { config: { publicPath: '/ruffle/' } }
  }

  if (!document.querySelector('script[src="/ruffle/ruffle.js"]')) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = '/ruffle/ruffle.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Ruffle 脚本加载失败'))
      document.head.appendChild(script)
    })
  }

  for (let index = 0; index < 50; index += 1) {
    if (typeof window.RufflePlayer?.newest === 'function') return
    await wait(100)
  }

  throw new Error('Ruffle 初始化超时')
}

function getControllerState(player: any): ControllerState {
  return {
    hasLoadLists: typeof player?.loadlists === 'function',
    hasSetId: typeof player?.setid === 'function',
    hasBridgeApi: typeof player?.ruffle === 'function',
  }
}

function callSwfCallback(
  player: any,
  callbackName: string,
  ...args: Array<string | number>
) {
  if (typeof player?.[callbackName] === 'function') {
    player[callbackName](...args)
    return 'legacy'
  }

  const bridge = typeof player?.ruffle === 'function'
    ? player.ruffle(1)
    : null

  if (typeof bridge?.callExternalInterface === 'function') {
    bridge.callExternalInterface(callbackName, ...args)
    return 'bridge'
  }

  throw new Error(`未找到可用的 ${callbackName} 调用桥`)
}

export const RufflePlayer: React.FC<RufflePlayerProps> = ({
  playlist,
  playToken = 0,
  petId = 0,
  width = 140,
  height = 140,
  stageWidth = 250,
  stageHeight = 200,
  scale = 1,
  onLoad,
  onError,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<any>(null)
  const mountedRef = useRef(false)
  const controllerPromiseRef = useRef<Promise<ControllerReadyResult> | null>(null)
  const onLoadRef = useRef(onLoad)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onLoadRef.current = onLoad
    onErrorRef.current = onError
  }, [onError, onLoad])

  const createPlayer = async () => {
    await ensureRuffleLoaded()

    if (!stageRef.current) {
      throw new Error('播放器挂载容器不存在')
    }

    if (playerRef.current && stageRef.current.contains(playerRef.current)) {
      return playerRef.current
    }

    const ruffle = window.RufflePlayer.newest()
    const player = ruffle.createPlayer()

    player.config = {
      autoplay: 'on',
      allowScriptAccess: true,
      unmuteOverlay: 'hidden',
      backgroundColor: null,
      letterbox: 'off',
      warnOnUnsupportedContent: false,
      contextMenu: false,
      wmode: 'transparent',
      splashScreen: false,
      preloader: false,
      quality: 'best',
    }

    player.style.width = `${stageWidth}px`
    player.style.height = `${stageHeight}px`
    player.style.background = 'transparent'
    player.style.backgroundColor = 'transparent'
    player.style.display = 'block'
    player.style.pointerEvents = 'none'

    stageRef.current.replaceChildren()
    stageRef.current.appendChild(player)
    playerRef.current = player

    return player
  }

  const waitForControllerMethods = async () => {
    for (let index = 0; index < 60; index += 1) {
      const controllerState = getControllerState(playerRef.current)

      if (controllerState.hasLoadLists || controllerState.hasBridgeApi) {
        return controllerState
      }

      await wait(100)
    }

    return getControllerState(playerRef.current)
  }

  const ensureControllerReady = async (): Promise<ControllerReadyResult> => {
    const currentPlayer = playerRef.current
    const currentState = getControllerState(currentPlayer)

    if (currentPlayer && (currentState.hasLoadLists || currentState.hasBridgeApi)) {
      return {
        player: currentPlayer,
        controllerState: currentState,
      }
    }

    if (controllerPromiseRef.current) {
      return controllerPromiseRef.current
    }

    const controllerPromise = (async () => {
      const player = await createPlayer()
      await player.load({ url: CONTROLLER_SWF_URL })

      const controllerState = await waitForControllerMethods()

      if (!controllerState.hasLoadLists && !controllerState.hasBridgeApi) {
        throw new Error('player.swf 未暴露 loadlists 控制桥')
      }

      return {
        player,
        controllerState,
      }
    })()

    controllerPromiseRef.current = controllerPromise

    try {
      return await controllerPromise
    } finally {
      if (controllerPromiseRef.current === controllerPromise) {
        controllerPromiseRef.current = null
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      controllerPromiseRef.current = null

      const player = playerRef.current
      playerRef.current = null

      if (!player) return

      try {
        player.destroy?.()
      } catch {
        // destroy 在旧版 Ruffle 上不稳定，这里只做兜底释放
      }

      if (player.parentNode) {
        player.parentNode.removeChild(player)
      }
    }
  }, [])

  // 直接加载独立 SWF 文件（用于新版素材）
  const playStandaloneSwf = async (swfPath: string) => {
    await ensureRuffleLoaded()

    if (!stageRef.current || !mountedRef.current) return

    const ruffle = window.RufflePlayer.newest()
    const player = ruffle.createPlayer()

    player.config = {
      autoplay: 'on',
      allowScriptAccess: true,
      unmuteOverlay: 'hidden',
      backgroundColor: null,
      letterbox: 'off',
      warnOnUnsupportedContent: false,
      contextMenu: false,
      wmode: 'transparent',
      splashScreen: false,
      preloader: false,
      quality: 'best',
    }

    player.style.width = `${stageWidth}px`
    player.style.height = `${stageHeight}px`
    player.style.background = 'transparent'
    player.style.backgroundColor = 'transparent'
    player.style.display = 'block'
    player.style.pointerEvents = 'none'

    // 清除旧播放器
    if (playerRef.current) {
      try {
        playerRef.current.destroy?.()
      } catch {
        // ignore
      }
    }

    stageRef.current.replaceChildren()
    stageRef.current.appendChild(player)
    playerRef.current = player

    // 直接加载 SWF 文件
    const url = swfPath.startsWith('/') ? swfPath : `/${swfPath}`
    await player.load({ url })
    onLoadRef.current?.()
  }

  useEffect(() => {
    if (!playlist) return

    const play = async () => {
      // 检测是否为新版独立 SWF 素材
      if (isStandaloneSwf(playlist)) {
        // 新版素材：直接加载 SWF 文件
        // 如果是播放列表（逗号分隔），只播放第一个
        const firstSwf = playlist.split(',')[0].trim()
        await playStandaloneSwf(firstSwf)
        return
      }

      // 旧版素材：使用 player.swf 控制器
      const { player, controllerState } = await ensureControllerReady()

      if (!mountedRef.current) return

      if (controllerState.hasSetId || controllerState.hasBridgeApi) {
        callSwfCallback(player, 'setid', petId)
      }

      callSwfCallback(player, 'loadlists', playlist)
      onLoadRef.current?.()
    }

    void play().catch((error) => {
      const nextError = error instanceof Error ? error : new Error(String(error))
      console.error('RufflePlayer 播放失败:', nextError)
      onErrorRef.current?.(nextError)
    })
  }, [petId, playToken, playlist, stageHeight, stageWidth])

  const visualScale = Math.min(width / stageWidth, height / stageHeight) * scale

  return (
    <div
      className="ruffle-player"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div className="ruffle-player-viewport">
        <div
          ref={stageRef}
          className="ruffle-container"
          style={{
            width: `${stageWidth}px`,
            height: `${stageHeight}px`,
            transform: `translate(-50%, -50%) scale(${visualScale})`,
          }}
        />
      </div>
    </div>
  )
}
