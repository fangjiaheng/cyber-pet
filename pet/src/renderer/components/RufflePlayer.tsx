/**
 * Ruffle Flash 播放器组件
 * 用于播放原版 QQ 宠物的 .swf 动画文件
 */

import React, { useEffect, useRef } from 'react'
import './RufflePlayer.css'

// 声明 window.RufflePlayer 类型
declare global {
  interface Window {
    RufflePlayer: any
  }
}

interface RufflePlayerProps {
  src: string  // swf 文件路径
  width?: number
  height?: number
  scale?: number
  autoplay?: boolean
  loop?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
}

export const RufflePlayer: React.FC<RufflePlayerProps> = ({
  src,
  width = 140,
  height = 140,
  scale = 1,
  autoplay = true,
  loop = true,
  onLoad,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const ruffleInstanceRef = useRef<any>(null)

  useEffect(() => {
    const loadRuffle = async () => {
      try {
        // 如果 Ruffle 还未加载，先加载脚本
        if (!window.RufflePlayer) {
          // 在加载脚本之前设置 publicPath 配置
          // 这样 Ruffle 初始化时就能正确找到 WASM 文件
          window.RufflePlayer = {
            config: {
              publicPath: '/ruffle/',
            }
          }

          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = '/ruffle/ruffle.js'  // 使用本地 Ruffle 文件
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Failed to load Ruffle'))
            document.head.appendChild(script)
          })
          // 等待 Ruffle 初始化
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        if (!containerRef.current) return
        if (!window.RufflePlayer) {
          throw new Error('Ruffle not loaded')
        }

        // 先清理旧的 player 实例（如果存在）
        if (ruffleInstanceRef.current) {
          try {
            ruffleInstanceRef.current.destroy()
          } catch (e) {
            console.warn('清理旧 player 时出错:', e)
          }
          if (containerRef.current) {
            containerRef.current.innerHTML = ''
          }
          ruffleInstanceRef.current = null
        }

        // 创建新的 Ruffle 实例
        const ruffle = window.RufflePlayer.newest()
        const player = ruffle.createPlayer()

        // 设置配置
        player.config = {
          autoplay,
          unmuteOverlay: 'hidden',
          backgroundColor: null,
          letterbox: 'off',
          warnOnUnsupportedContent: false,
          logLevel: 'error',
          showSwfDownload: false,
          contextMenu: false,
        }

        // 添加到容器
        containerRef.current.appendChild(player)
        ruffleInstanceRef.current = player

        // 加载 SWF
        await player.load(src)

        onLoad?.()
      } catch (error) {
        console.error('Ruffle 加载失败:', error)
        onError?.(error as Error)
      }
    }

    loadRuffle()

    // 清理函数：组件卸载时销毁 player
    return () => {
      if (ruffleInstanceRef.current) {
        try {
          ruffleInstanceRef.current.destroy()
        } catch (e) {
          console.warn('清理 player 时出错:', e)
        }
        ruffleInstanceRef.current = null
      }
    }
  }, [src, autoplay, loop, onLoad, onError])

  return (
    <div
      className="ruffle-player"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <div ref={containerRef} className="ruffle-container" />
    </div>
  )
}
