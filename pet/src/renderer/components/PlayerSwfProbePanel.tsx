import React, { useEffect, useRef, useState } from 'react'
import './PlayerSwfProbePanel.css'
import { useWindowDrag } from '../hooks/useWindowDrag'

declare global {
  interface Window {
    RufflePlayer: any
  }
}

type ProbeStatus = 'idle' | 'loading' | 'ready' | 'running' | 'error'
type PathMode = 'relative' | 'absolute'
type ControllerState = {
  hasLoadLists: boolean
  hasSetId: boolean
  hasBridgeApi: boolean
}
type ControllerReadyResult = {
  player: any
  controllerState: ControllerState
}

const PLAYER_SWF_URL = '/player.swf'
const RELATIVE_ENTER_PATH = 'anime/102/1020110141.swf'
const RELATIVE_IDLE_PATH = 'anime/102/1020000141.swf'
const RELATIVE_WAVE_PATH = 'anime/102/1020060341.swf'
const RELATIVE_EAT_PATH = 'anime/102/1022010141.swf'
const RELATIVE_MEDICINE_PATH = 'anime/102/1022100141.swf'
const RELATIVE_INJECTION_PATH = 'anime/102/1022100241.swf'
const ABSOLUTE_ENTER_PATH = '/anime/102/1020110141.swf'
const ABSOLUTE_IDLE_PATH = '/anime/102/1020000141.swf'
const ABSOLUTE_WAVE_PATH = '/anime/102/1020060341.swf'
const ABSOLUTE_EAT_PATH = '/anime/102/1022010141.swf'
const ABSOLUTE_MEDICINE_PATH = '/anime/102/1022100141.swf'
const ABSOLUTE_INJECTION_PATH = '/anime/102/1022100241.swf'
const PLAYER_STAGE_WIDTH = 520
const PLAYER_STAGE_HEIGHT = 520

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

function getPlayerDiagnostic(player: any) {
  if (!player) {
    return {
      tagName: 'unknown',
      ownProps: [],
      shadowMessage: '',
    }
  }

  let ownProps: string[] = []
  let shadowMessage = ''

  try {
    ownProps = Object.getOwnPropertyNames(player)
      .filter((name) => !name.startsWith('__react'))
      .slice(0, 28)
  } catch {
    ownProps = []
  }

  try {
    const shadowRoot = (player?.shadowRoot ?? player?.shadow) as ShadowRoot | null
    const panicNode = shadowRoot?.querySelector('#panic-body, #message_overlay, #message-overlay, .message')
    shadowMessage = panicNode?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  } catch {
    shadowMessage = ''
  }

  return {
    tagName: player.tagName ?? 'unknown',
    ownProps,
    shadowMessage,
  }
}

interface PlayerSwfProbePanelProps {
  onClose: () => void
}

export const PlayerSwfProbePanel: React.FC<PlayerSwfProbePanelProps> = ({
  onClose,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const mirrorCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const playerRef = useRef<any>(null)
  const mountedRef = useRef(false)
  const timersRef = useRef<number[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const autoStartTimerRef = useRef<number | null>(null)
  const controllerPromiseRef = useRef<Promise<ControllerReadyResult> | null>(null)
  const [status, setStatus] = useState<ProbeStatus>('idle')
  const [pathMode, setPathMode] = useState<PathMode>('relative')
  const [logs, setLogs] = useState<string[]>([])
  const [hasLoadLists, setHasLoadLists] = useState(false)
  const [hasSetId, setHasSetId] = useState(false)
  const [hasBridgeApi, setHasBridgeApi] = useState(false)
  const [canvasInfo, setCanvasInfo] = useState('等待内部画布...')

  useWindowDrag(headerRef)

  const pushPlayerDiagnostic = (label: string) => {
    const diagnostic = getPlayerDiagnostic(playerRef.current)
    const propsText = diagnostic.ownProps.length > 0
      ? diagnostic.ownProps.join(', ')
      : '无'

    pushLog(`${label}：tag=${diagnostic.tagName} ownProps=${propsText}`)

    if (diagnostic.shadowMessage) {
      pushLog(`${label}：shadow=${diagnostic.shadowMessage}`)
    }
  }

  const pushLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    setLogs((current) => [...current.slice(-79), `[${timestamp}] ${message}`])
  }

  const clearScheduledTasks = () => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    timersRef.current = []
  }

  const stopCanvasMirror = () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  const getShadowRoot = () => {
    const player = playerRef.current
    return (player?.shadowRoot ?? player?.shadow) as ShadowRoot | null
  }

  const getInternalCanvas = () => {
    const shadowRoot = getShadowRoot()
    return shadowRoot?.querySelector('canvas') as HTMLCanvasElement | null
  }

  const getControllerState = (player: any): ControllerState => ({
    hasLoadLists: typeof player?.loadlists === 'function',
    hasSetId: typeof player?.setid === 'function',
    hasBridgeApi: typeof player?.ruffle === 'function',
  })

  const pushResourceSnapshot = (label: string) => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const relevantPaths = entries
      .map((entry) => {
        try {
          return new URL(entry.name, window.location.origin).pathname
        } catch {
          return entry.name
        }
      })
      .filter((pathname) => /\/(player\.swf|mood\.swf|common\.swf|anime\/|ruffle\/)/.test(pathname))

    const uniqueRecentPaths = Array.from(new Set(relevantPaths)).slice(-10)
    pushLog(`${label}：${uniqueRecentPaths.length > 0 ? uniqueRecentPaths.join(' | ') : '暂无相关资源请求'}`)
  }

  const syncCanvasMirror = () => {
    if (!mountedRef.current) return

    const sourceCanvas = getInternalCanvas()
    const mirrorCanvas = mirrorCanvasRef.current

    if (sourceCanvas && mirrorCanvas) {
      const sourceWidth = sourceCanvas.width || 1
      const sourceHeight = sourceCanvas.height || 1

      if (mirrorCanvas.width !== sourceWidth || mirrorCanvas.height !== sourceHeight) {
        mirrorCanvas.width = sourceWidth
        mirrorCanvas.height = sourceHeight
      }

      const context = mirrorCanvas.getContext('2d')
      if (context) {
        context.clearRect(0, 0, mirrorCanvas.width, mirrorCanvas.height)
        context.drawImage(sourceCanvas, 0, 0)

        let visibleRatioText = '可见像素未知'
        try {
          const imageData = context.getImageData(0, 0, mirrorCanvas.width, mirrorCanvas.height).data
          let visiblePixels = 0
          const sampleStep = Math.max(4, Math.floor((mirrorCanvas.width * mirrorCanvas.height) / 12000) * 4)

          for (let index = 3; index < imageData.length; index += sampleStep) {
            if (imageData[index] > 0) {
              visiblePixels += 1
            }
          }

          const sampledPixels = Math.max(1, Math.floor(imageData.length / sampleStep))
          const visibleRatio = (visiblePixels / sampledPixels) * 100
          visibleRatioText = `可见像素约 ${visibleRatio.toFixed(1)}%`
        } catch {
          visibleRatioText = '可见像素读取失败'
        }

        const nextCanvasInfo = `内部 canvas: ${sourceWidth} x ${sourceHeight}，${visibleRatioText}`
        setCanvasInfo((current) => current === nextCanvasInfo ? current : nextCanvasInfo)
      }
    } else {
      setCanvasInfo((current) => current === '等待内部画布...' ? current : '等待内部画布...')
    }

    animationFrameRef.current = window.requestAnimationFrame(syncCanvasMirror)
  }

  const destroyPlayer = () => {
    const player = playerRef.current

    clearScheduledTasks()
    stopCanvasMirror()

    if (!player) return

    try {
      player.destroy?.()
    } catch {
      // Ruffle 某些版本 destroy 不稳定，这里容错即可
    }

    if (player.parentNode) {
      player.parentNode.removeChild(player)
    }

    playerRef.current = null
    controllerPromiseRef.current = null
    setHasLoadLists(false)
    setHasSetId(false)
    setHasBridgeApi(false)
  }

  const getResolvedPath = (
    relativePath: string,
    absolutePath: string,
    nextMode = pathMode,
  ) => (nextMode === 'relative' ? relativePath : absolutePath)

  const waitForControllerMethods = async () => {
    for (let index = 0; index < 60; index += 1) {
      const player = playerRef.current
      const {
        hasLoadLists: nextHasLoadLists,
        hasSetId: nextHasSetId,
        hasBridgeApi: nextHasBridgeApi,
      } = getControllerState(player)

      if (mountedRef.current) {
        setHasLoadLists(nextHasLoadLists)
        setHasSetId(nextHasSetId)
        setHasBridgeApi(nextHasBridgeApi)
      }

      if (nextHasLoadLists || nextHasBridgeApi) {
        pushLog(`player.swf 控制桥已就绪：loadlists=${nextHasLoadLists} setid=${nextHasSetId} bridge=${nextHasBridgeApi}`)
        return {
          hasLoadLists: nextHasLoadLists,
          hasSetId: nextHasSetId,
          hasBridgeApi: nextHasBridgeApi,
        }
      }

      await wait(100)
    }

    const player = playerRef.current
    const {
      hasLoadLists: nextHasLoadLists,
      hasSetId: nextHasSetId,
      hasBridgeApi: nextHasBridgeApi,
    } = getControllerState(player)

    if (mountedRef.current) {
      setHasLoadLists(nextHasLoadLists)
      setHasSetId(nextHasSetId)
      setHasBridgeApi(nextHasBridgeApi)
    }

    pushLog(`等待 player.swf 控制桥超时：loadlists=${nextHasLoadLists} setid=${nextHasSetId} bridge=${nextHasBridgeApi}`)
    pushPlayerDiagnostic('控制桥超时快照')

    return {
      hasLoadLists: nextHasLoadLists,
      hasSetId: nextHasSetId,
      hasBridgeApi: nextHasBridgeApi,
    }
  }

  const callSwfCallback = (
    player: any,
    callbackName: string,
    ...args: Array<string | number>
  ) => {
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

  const createPlayer = async () => {
    await ensureRuffleLoaded()

    if (!hostRef.current) {
      throw new Error('验证播放器容器不存在')
    }

    if (playerRef.current && hostRef.current.contains(playerRef.current)) {
      return playerRef.current
    }

    destroyPlayer()

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

    player.style.width = `${PLAYER_STAGE_WIDTH}px`
    player.style.height = `${PLAYER_STAGE_HEIGHT}px`
    player.style.background = 'transparent'
    player.style.backgroundColor = 'transparent'
    player.style.display = 'block'
    player.style.position = 'relative'
    player.style.overflow = 'visible'
    player.style.pointerEvents = 'none'

    hostRef.current.replaceChildren()
    hostRef.current.appendChild(player)
    playerRef.current = player

    stopCanvasMirror()
    animationFrameRef.current = window.requestAnimationFrame(syncCanvasMirror)

    return player
  }

  const loadController = async () => {
    if (controllerPromiseRef.current) {
      return controllerPromiseRef.current
    }

    const controllerPromise = (async () => {
      setStatus('loading')
      pushLog(`开始加载 ${PLAYER_SWF_URL}`)

      const player = await createPlayer()
      await player.load({ url: PLAYER_SWF_URL })
      pushLog('player.swf load() 已完成，开始检查控制方法')
      pushPlayerDiagnostic('load 完成后快照')
      pushResourceSnapshot('load 完成后资源快照')

      const controllerState = await waitForControllerMethods()

      if (controllerState.hasLoadLists || controllerState.hasBridgeApi) {
        setStatus('ready')
        return {
          player,
          controllerState,
        }
      }

      setStatus('error')
      throw new Error('player.swf 没有暴露可用控制桥，当前版本无法继续验证')
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

  const ensureControllerReady = async () => {
    const currentPlayer = playerRef.current
    const currentState = getControllerState(currentPlayer)

    if (currentPlayer && (currentState.hasLoadLists || currentState.hasBridgeApi)) {
      return {
        player: currentPlayer,
        controllerState: currentState,
      }
    }

    return loadController()
  }

  const callLoadLists = async (
    label: string,
    relativePath: string,
    absolutePath: string,
    nextMode = pathMode,
  ) => {
    try {
      const { player, controllerState } = await ensureControllerReady()

      if (controllerState.hasSetId || controllerState.hasBridgeApi) {
        const setIdMode = callSwfCallback(player, 'setid', 0)
        pushLog(`已通过 ${setIdMode === 'legacy' ? '旧式回调' : 'Ruffle 桥接'} 调用 setid(0)`)
      }

      const path = getResolvedPath(relativePath, absolutePath, nextMode)
      const loadMode = callSwfCallback(player, 'loadlists', path)
      setStatus('running')
      pushLog(`已通过 ${loadMode === 'legacy' ? '旧式回调' : 'Ruffle 桥接'} 调用 loadlists("${path}")，目标动作：${label}`)
      const resourceLogTimer = window.setTimeout(() => {
        pushResourceSnapshot(`${label} 后资源快照`)
      }, 450)
      timersRef.current.push(resourceLogTimer)
    } catch (error) {
      setStatus('error')
      pushLog(`调用 ${label} 失败：${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const runAutoProbe = async (nextMode = pathMode) => {
    clearScheduledTasks()

    try {
      const { player, controllerState } = await loadController()

      if (controllerState.hasSetId || controllerState.hasBridgeApi) {
        const setIdMode = callSwfCallback(player, 'setid', 0)
        pushLog(`自动验证已通过 ${setIdMode === 'legacy' ? '旧式回调' : 'Ruffle 桥接'} 调用 setid(0)`)
      }

      setStatus('running')

      const enterPath = getResolvedPath(RELATIVE_ENTER_PATH, ABSOLUTE_ENTER_PATH, nextMode)
      const idlePath = getResolvedPath(RELATIVE_IDLE_PATH, ABSOLUTE_IDLE_PATH, nextMode)
      const wavePath = getResolvedPath(RELATIVE_WAVE_PATH, ABSOLUTE_WAVE_PATH, nextMode)

      await wait(300)
      const enterMode = callSwfCallback(player, 'loadlists', enterPath)
      pushLog(`自动验证第 1 步：通过 ${enterMode === 'legacy' ? '旧式回调' : 'Ruffle 桥接'} 调用 loadlists("${enterPath}") -> 进场`)
      const enterResourceTimer = window.setTimeout(() => {
        pushResourceSnapshot('自动验证第 1 步后资源快照')
      }, 450)

      const idleTimer = window.setTimeout(() => {
        try {
          const idleMode = callSwfCallback(player, 'loadlists', idlePath)
          pushLog(`自动验证第 2 步：通过 ${idleMode === 'legacy' ? '旧式回调' : 'Ruffle 桥接'} 调用 loadlists("${idlePath}") -> 通常`)
          const idleResourceTimer = window.setTimeout(() => {
            pushResourceSnapshot('自动验证第 2 步后资源快照')
          }, 450)
          timersRef.current.push(idleResourceTimer)
        } catch (error) {
          setStatus('error')
          pushLog(`自动切回通常失败：${error instanceof Error ? error.message : String(error)}`)
        }
      }, 2400)

      const waveTimer = window.setTimeout(() => {
        try {
          const waveMode = callSwfCallback(player, 'loadlists', wavePath)
          pushLog(`自动验证第 3 步：通过 ${waveMode === 'legacy' ? '旧式回调' : 'Ruffle 桥接'} 调用 loadlists("${wavePath}") -> 打招呼`)
          const waveResourceTimer = window.setTimeout(() => {
            pushResourceSnapshot('自动验证第 3 步后资源快照')
          }, 450)
          timersRef.current.push(waveResourceTimer)
        } catch (error) {
          setStatus('error')
          pushLog(`自动切换打招呼失败：${error instanceof Error ? error.message : String(error)}`)
        }
      }, 4800)

      timersRef.current.push(enterResourceTimer, idleTimer, waveTimer)
    } catch (error) {
      setStatus('error')
      pushLog(`自动验证失败：${error instanceof Error ? error.message : String(error)}`)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    pushLog('player.swf 验证面板已打开')
    autoStartTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current) return
      void runAutoProbe('relative')
    }, 120)

    return () => {
      mountedRef.current = false
      if (autoStartTimerRef.current !== null) {
        window.clearTimeout(autoStartTimerRef.current)
        autoStartTimerRef.current = null
      }
      stopCanvasMirror()
      destroyPlayer()
    }
  }, [])

  return (
    <div className="player-swf-probe-panel">
      <div ref={headerRef} className="player-swf-probe-header">
        <div>
          <h2>player.swf 验证面板</h2>
          <p>最小实验：只验证 `player.swf + loadlists` 在当前项目里能不能无闪切动作。</p>
        </div>
        <button
          className="player-swf-probe-close"
          data-window-drag-ignore="true"
          onClick={onClose}
        >
          关闭
        </button>
      </div>

      <div className="player-swf-probe-body">
        <section className="player-swf-probe-stage">
          <div className="player-swf-probe-player-wrap">
            <div ref={hostRef} className="player-swf-probe-player-host" />
          </div>
          <div className="player-swf-probe-mirror">
            <div className="player-swf-probe-mirror-header">
              <span>实时镜像预览</span>
              <strong>{canvasInfo}</strong>
            </div>
            <div className="player-swf-probe-mirror-stage">
              <canvas ref={mirrorCanvasRef} className="player-swf-probe-mirror-canvas" />
            </div>
          </div>
          <div className="player-swf-probe-tip">
            观察重点：从{' '}
            <code>进场 -&gt; 通常 -&gt; 打招呼</code>
            {' '}切换时，是否还会出现明显的白闪或整块重载感。
          </div>
        </section>

        <section className="player-swf-probe-sidebar">
          <div className="player-swf-probe-status-grid">
            <div className="player-swf-probe-status-card">
              <span>状态</span>
              <strong>{status}</strong>
            </div>
            <div className="player-swf-probe-status-card">
              <span>loadlists</span>
              <strong>{hasLoadLists ? '已就绪' : '未就绪'}</strong>
            </div>
            <div className="player-swf-probe-status-card">
              <span>setid</span>
              <strong>{hasSetId ? '已就绪' : '未就绪'}</strong>
            </div>
            <div className="player-swf-probe-status-card">
              <span>bridge</span>
              <strong>{hasBridgeApi ? '已就绪' : '未就绪'}</strong>
            </div>
          </div>

          <div className="player-swf-probe-controls">
            <div className="player-swf-probe-control-group">
              <span className="player-swf-probe-label">路径模式</span>
              <div className="player-swf-probe-toggle">
                <button
                  className={pathMode === 'relative' ? 'active' : ''}
                  onClick={() => setPathMode('relative')}
                >
                  相对路径
                </button>
                <button
                  className={pathMode === 'absolute' ? 'active' : ''}
                  onClick={() => setPathMode('absolute')}
                >
                  绝对路径
                </button>
              </div>
            </div>

            <div className="player-swf-probe-actions">
              <button onClick={() => void runAutoProbe()}>一键自动验证</button>
              <button onClick={() => void loadController()}>重新加载 player.swf</button>
              <button onClick={() => void callLoadLists('进场', RELATIVE_ENTER_PATH, ABSOLUTE_ENTER_PATH)}>
                只切进场
              </button>
              <button onClick={() => void callLoadLists('通常', RELATIVE_IDLE_PATH, ABSOLUTE_IDLE_PATH)}>
                只切通常
              </button>
              <button onClick={() => void callLoadLists('打招呼', RELATIVE_WAVE_PATH, ABSOLUTE_WAVE_PATH)}>
                只切打招呼
              </button>
              <button onClick={() => void callLoadLists('吃饭', RELATIVE_EAT_PATH, ABSOLUTE_EAT_PATH)}>
                只切吃饭
              </button>
              <button onClick={() => void callLoadLists('吃药', RELATIVE_MEDICINE_PATH, ABSOLUTE_MEDICINE_PATH)}>
                只切吃药
              </button>
              <button onClick={() => void callLoadLists('打针', RELATIVE_INJECTION_PATH, ABSOLUTE_INJECTION_PATH)}>
                只切打针
              </button>
              <button
                className="ghost"
                onClick={() => {
                  clearScheduledTasks()
                  setLogs([])
                }}
              >
                清空日志
              </button>
            </div>
          </div>

          <div className="player-swf-probe-log">
            <div className="player-swf-probe-log-title">运行日志</div>
            <div className="player-swf-probe-log-list">
              {logs.map((logLine, index) => (
                <div key={`${logLine}-${index}`}>{logLine}</div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
