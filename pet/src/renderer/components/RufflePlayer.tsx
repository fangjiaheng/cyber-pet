/**
 * Ruffle Flash 播放器组件
 * 单例模式：全局只创建一次 Ruffle 实例，直接 load SWF 切换动画
 * - 截帧覆盖：切换前截当前帧，load 期间显示截图防止闪烁
 * - 自动回待机：通过 onEnd 回调通知外层，外层设置回 idle SWF
 * - 热重载安全：单例存储在 window 上，模块重新加载后仍能找回
 */

import React, { useEffect, useRef } from 'react'
import './RufflePlayer.css'

declare global {
  interface Window {
    RufflePlayer: any
    __rufflePlayer: any
    __ruffleReady: boolean
    __ruffleLoadedOnce: boolean
  }
}

interface RufflePlayerProps {
  src: string
  width?: number
  height?: number
  scale?: number
  loop?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
  onEnd?: () => void
}

// 使用 window 存储单例，热重载后仍能找回已有实例
if (typeof window.__rufflePlayer === 'undefined') {
  window.__rufflePlayer = null
  window.__ruffleReady = false
  window.__ruffleLoadedOnce = false
}

async function ensureRuffleLoaded(): Promise<void> {
  if (window.RufflePlayer && typeof window.RufflePlayer.newest === 'function') return
  if (!window.RufflePlayer) {
    window.RufflePlayer = { config: { publicPath: '/ruffle/' } }
  }
  if (!document.querySelector('script[src="/ruffle/ruffle.js"]')) {
    console.log('RufflePlayer: loading ruffle.js...')
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = '/ruffle/ruffle.js'
      script.onload = () => { console.log('RufflePlayer: ruffle.js loaded'); resolve() }
      script.onerror = (e) => { console.error('RufflePlayer: ruffle.js load failed', e); reject(new Error('Failed to load Ruffle')) }
      document.head.appendChild(script)
    })
  }
  for (let i = 0; i < 50; i++) {
    if (typeof window.RufflePlayer?.newest === 'function') return
    await new Promise(r => setTimeout(r, 100))
  }
  throw new Error('Ruffle 初始化超时')
}

// 截取 Ruffle 播放器当前帧为 dataURL
function captureFrame(player: any): string | null {
  try {
    const canvas = player.querySelector('canvas')
    if (!canvas) return null
    return canvas.toDataURL('image/png')
  } catch (e) {
    return null
  }
}

export const RufflePlayer: React.FC<RufflePlayerProps> = ({
  src,
  width = 140,
  height = 140,
  scale = 1,
  loop = true,
  onLoad,
  onError,
  onEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const frozenFrameRef = useRef<HTMLImageElement | null>(null)
  const onLoadRef = useRef(onLoad)
  const onErrorRef = useRef(onError)
  const onEndRef = useRef(onEnd)
  const loopRef = useRef(loop)
  const endTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    onLoadRef.current = onLoad
    onErrorRef.current = onError
    onEndRef.current = onEnd
    loopRef.current = loop
  })

  // 显示截帧覆盖图（防止 load 期间闪烁）
  const showFrozenFrame = () => {
    if (!containerRef.current || !window.__rufflePlayer) return
    const dataUrl = captureFrame(window.__rufflePlayer)
    if (!dataUrl) return

    const img = document.createElement('img')
    img.src = dataUrl
    img.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: ${width}px;
      height: ${height}px;
      pointer-events: none;
      z-index: 10;
    `
    containerRef.current.appendChild(img)
    frozenFrameRef.current = img
  }

  // 移除截帧覆盖图
  const hideFrozenFrame = () => {
    if (frozenFrameRef.current && containerRef.current?.contains(frozenFrameRef.current)) {
      containerRef.current.removeChild(frozenFrameRef.current)
    }
    frozenFrameRef.current = null
  }

  const doLoad = async (src: string) => {
    if (!window.__rufflePlayer) return
    if (endTimerRef.current) clearTimeout(endTimerRef.current)

    // 只有已成功加载过一次才截帧（首次加载时 canvas 是空白，截了反而盖住）
    if (window.__ruffleLoadedOnce) {
      showFrozenFrame()
    }

    try {
      console.log('RufflePlayer: loading SWF:', src)
      await window.__rufflePlayer.load({ url: src })

      // 等新动画第一帧渲染出来后再移除截帧
      await new Promise(r => setTimeout(r, 150))
      hideFrozenFrame()
      window.__ruffleLoadedOnce = true

      onLoadRef.current?.()

      // 用 metadata 估算时长，只有非 loop 模式且有 onEnd 时才触发
      if (!loopRef.current && onEndRef.current) {
        await new Promise(r => setTimeout(r, 300))
        const meta = window.__rufflePlayer.metadata
        let duration = 4000
        if (meta?.frameCount && meta?.frameRate) {
          duration = (meta.frameCount / meta.frameRate) * 1000
        }
        endTimerRef.current = setTimeout(() => {
          onEndRef.current?.()
        }, duration)
      }
    } catch (e) {
      hideFrozenFrame()
      onErrorRef.current?.(e as Error)
    }
  }

  // 初始化单例
  useEffect(() => {
    const init = async () => {
      try {
        await ensureRuffleLoaded()
        if (!containerRef.current) return

        if (!window.__rufflePlayer) {
          // 首次创建
          const ruffle = window.RufflePlayer.newest()
          const player = ruffle.createPlayer()
          player.config = {
            autoplay: 'on',
            loop,
            unmuteOverlay: 'hidden',
            backgroundColor: null,
            letterbox: 'off',
            warnOnUnsupportedContent: false,
            logLevel: 'error',
            showSwfDownload: false,
            contextMenu: false,
            wmode: 'transparent',
            splashScreen: false,
            preloader: false,
            quality: 'best',
          }
          player.style.background = 'transparent'
          player.style.backgroundColor = 'transparent'
          player.style.width = `${width}px`
          player.style.height = `${height}px`

          containerRef.current.appendChild(player)
          window.__rufflePlayer = player
          window.__ruffleReady = true
          await doLoad(src)
        } else {
          // 热重载后找回已有实例，移入当前 container
          if (!containerRef.current.contains(window.__rufflePlayer)) {
            containerRef.current.appendChild(window.__rufflePlayer)
          }
          // 热重载后如果已加载过，直接标记好，不重新 load（避免闪烁）
          window.__ruffleReady = true
          if (!window.__ruffleLoadedOnce) {
            await doLoad(src)
          }
        }
      } catch (e) {
        console.error('RufflePlayer init error:', e)
        onErrorRef.current?.(e as Error)
      }
    }

    init()

    return () => {
      if (endTimerRef.current) clearTimeout(endTimerRef.current)
      hideFrozenFrame()
    }
  }, [])

  // src 变化时切换
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      return
    }
    if (window.__ruffleReady) doLoad(src)
  }, [src])

  return (
    <div
      className="ruffle-player"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        position: 'relative',
      }}
    >
      <div ref={containerRef} className="ruffle-container" style={{ position: 'relative' }} />
    </div>
  )
}
