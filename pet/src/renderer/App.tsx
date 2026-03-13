import React, { useRef, useEffect, useState, useCallback } from 'react'
import './App.css'
import './ChatPanel.css'
import { usePetStore } from './stores/petStore'
import { usePetDecay } from './hooks/usePetDecay'
import { ActionDropdownMenu, ActionDropdownMenuItem } from './components/ActionDropdownMenu'
import { ContextMenu, MenuItem } from './components/ContextMenu'
import { Toast } from './components/Toast'
import { PetBubble } from './components/PetBubble'
import { RufflePlayer } from './components/RufflePlayer'
import { PlayerSwfProbePanel } from './components/PlayerSwfProbePanel'
import { ChatWindow } from '../components/ChatWindow'
import { SettingsPanel } from './components/SettingsPanel'
import { initializeAI } from './aiInit'
import { useWindowDrag } from './hooks/useWindowDrag'
import {
  ACTION_DROPDOWN_WINDOW_HEIGHT,
  ACTION_DROPDOWN_WINDOW_WIDTH,
  BUBBLE_WINDOW_HEIGHT,
  BUBBLE_WINDOW_WIDTH,
  CHAT_WINDOW_HEIGHT,
  CHAT_WINDOW_WIDTH,
  CONTEXT_MENU_WINDOW_HEIGHT,
  CONTEXT_MENU_WINDOW_WIDTH,
  PET_WINDOW_HEIGHT,
  PET_WINDOW_WIDTH,
  SETTINGS_WINDOW_HEIGHT,
  SETTINGS_WINDOW_WIDTH,
} from '@shared/windowSizes'

import { swfCategories } from './swfData'
import { buildLoadlistsPlaylist, ENTER_PLAYLIST, IDLE_SWF_PATH } from './utils/swfPlaylist'
// import { QQPenguinSprite, type PenguinType } from './components/QQPenguinSprite'

// 企鹅动作类型
type PenguinAction =
  | 'idle' | 'walk' | 'run' | 'sit' | 'sleep'
  | 'eat' | 'bathe' | 'play' | 'work'
  | 'happy' | 'sad' | 'angry'

type ActivePanel = 'chat' | 'settings' | 'probe' | null
type WindowMode = 'pet' | 'chat' | 'settings' | 'probe' | 'context-menu' | 'action-dropdown' | 'bubble'
type PlayerCommand = {
  playlist: string
  token: number
}
type PlaySwfOptions = {
  appendIdle?: boolean
  animationId?: string
}

function App() {
  const isDev = import.meta.env.DEV

  // 初始化 AI 引擎（从存储读取配置）
  useEffect(() => {
    initializeAI()
  }, [])

  // 加载宠物状态（只执行一次）
  useEffect(() => {
    const loadPetState = async () => {
      try {
        await usePetStore.getState().loadFromStorage()
      } catch (error) {
        console.error('加载宠物状态失败:', error)
      }
    }
    loadPetState()
  }, [])

  // 使用宠物状态
  const {
    hunger,
    cleanliness,
    mood,
    energy,
    currentEmotion,
    feed,
    clean,
    play,
    rest,
    setAction,
  } = usePetStore()

  // 启用自动衰减
  usePetDecay()
  const isDragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  const chatHeaderRef = useRef<HTMLDivElement | null>(null)
  const feedButtonRef = useRef<HTMLButtonElement | null>(null)
  const animButtonRef = useRef<HTMLButtonElement | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showActions, setShowActions] = useState(false)
  const hideActionsTimer = useRef<NodeJS.Timeout | null>(null)
  const testActionTimer = useRef<NodeJS.Timeout | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [penguinAction, setPenguinAction] = useState<PenguinAction>('idle')
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const [showFeedDropdown, setShowFeedDropdown] = useState(false)
  const [showAnimDropdown, setShowAnimDropdown] = useState(false)
  const [feedDropdownPosition, setFeedDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [animDropdownPosition, setAnimDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [isContextMenuReady, setIsContextMenuReady] = useState(false)
  const [isFeedDropdownReady, setIsFeedDropdownReady] = useState(false)
  const [isAnimDropdownReady, setIsAnimDropdownReady] = useState(false)
  const [playerCommand, setPlayerCommand] = useState<PlayerCommand>({
    playlist: IDLE_SWF_PATH,
    token: 0,
  })

  // 喂养动画列表
  const feedAnimations = [
    { id: '85', name: '🍚 吃饭', path: '/assets/swf_original/102/1022010141.swf', emoji: '🍚' },
    { id: '312', name: '🥤 喝水', path: '/assets/swf_original/102/1022020141.swf', emoji: '🥤' },
    { id: '313', name: '🐟 烤鱼', path: '/assets/swf_original/102/1023160141.swf', emoji: '🐟' },
    { id: '314', name: '☕ 喝咖啡', path: '/assets/swf_original/102/1023160341.swf', emoji: '☕' },
    { id: '315', name: '🧊 喝冷饮', path: '/assets/swf_original/102/1023160441.swf', emoji: '🧊' },
  ]
  const showChat = activePanel === 'chat'
  const showSettingsPanel = activePanel === 'settings'
  const showPlayerSwfProbe = activePanel === 'probe'
  const isContextMenuOpen = contextMenu !== null
  const isActionDropdownOpen = showFeedDropdown || showAnimDropdown
  const isBubbleOpen = bubbleText !== null

  const playPlaylist = useCallback((playlist: string) => {
    setPlayerCommand((current) => ({
      playlist,
      token: current.token + 1,
    }))
  }, [])

  const playSwfPath = useCallback((swfPath: string, options?: PlaySwfOptions) => {
    playPlaylist(buildLoadlistsPlaylist(swfPath, options))
  }, [playPlaylist])

  // 启动时播放进场动画，再显示欢迎气泡
  useEffect(() => {
    const enterTimer = setTimeout(() => {
      playPlaylist(ENTER_PLAYLIST)
    }, 1500)

    const bubbleTimer = setTimeout(() => {
      setBubbleText('我只是倔强说不想主人，假装说不想主人，但心里面很想陪在你身边的。。。')
    }, 5000)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(bubbleTimer)
    }
  }, [playPlaylist])

  useWindowDrag(chatHeaderRef, showChat)

  // 企鹅类型（GG/MM）- 已废弃 PNG 方案
  // const [penguinType, setPenguinType] = useState<PenguinType>('GG')

  // 鼠标穿透控制
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (activePanel !== null || isContextMenuOpen || isActionDropdownOpen || isBubbleOpen) {
        if (window.electronAPI?.setIgnoreMouseEvents) {
          window.electronAPI.setIgnoreMouseEvents(false)
        }
        return
      }

      // 检查鼠标是否在可交互区域
      const isOverInteractive =
        target.closest('.penguin-wrapper') !== null ||
        target.closest('.pet-actions') !== null ||
        target.closest('.action-dropdown-menu') !== null ||
        target.closest('.chat-panel') !== null ||
        target.closest('.settings-panel') !== null ||
        target.closest('.context-menu-overlay') !== null ||
        target.closest('.context-menu') !== null ||
        target.closest('.pet-bubble') !== null

      // 设置窗口穿透
      if (window.electronAPI?.setIgnoreMouseEvents) {
        window.electronAPI.setIgnoreMouseEvents(!isOverInteractive)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [activePanel, isActionDropdownOpen, isBubbleOpen, isContextMenuOpen])

  useEffect(() => {
    if (!window.electronAPI?.setIgnoreMouseEvents) return

    if (activePanel !== null || isContextMenuOpen || isActionDropdownOpen || isBubbleOpen) {
      window.electronAPI.setIgnoreMouseEvents(false)
    }
  }, [activePanel, isActionDropdownOpen, isBubbleOpen, isContextMenuOpen])

  useEffect(() => {
    const draggableArea = document.querySelector('.pet-draggable-area') as HTMLElement
    if (!draggableArea) return

    const handleMouseDown = async (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // 如果点击的是功能区或功能区内的按钮，不触发拖拽
      if (target.closest('.pet-actions')) {
        return
      }

      e.preventDefault() // 防止默认行为

      isDragging.current = true
      hasMoved.current = false
      startPos.current = { x: e.screenX, y: e.screenY }

      // 获取当前窗口位置
      const pos = await window.electronAPI.getWindowPosition()

      // 计算鼠标屏幕坐标相对于窗口位置的偏移
      dragOffset.current = {
        x: e.screenX - pos[0],
        y: e.screenY - pos[1],
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const dx = Math.abs(e.screenX - startPos.current.x)
      const dy = Math.abs(e.screenY - startPos.current.y)
      if (dx > 3 || dy > 3) {
        hasMoved.current = true
      }

      // 计算新的窗口位置 = 鼠标屏幕坐标 - 鼠标在窗口内的偏移
      const x = e.screenX - dragOffset.current.x
      const y = e.screenY - dragOffset.current.y
      window.electronAPI.moveWindow(x, y)
    }

    const handleMouseUp = (e: MouseEvent) => {
      isDragging.current = false
    }

    draggableArea.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      draggableArea.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [activePanel])


  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    closeFloatingUi()
    setIsContextMenuReady(false)
    setContextMenu({ x: 0, y: 0 })
  }

  const getActionDropdownPosition = useCallback((button: HTMLElement) => {
    const rect = button.getBoundingClientRect()

    return {
      left: Math.round(rect.left + rect.width / 2),
      top: Math.round(rect.bottom + 10),
    }
  }, [])

  const pinActionButtons = useCallback(() => {
    if (hideActionsTimer.current) {
      clearTimeout(hideActionsTimer.current)
    }

    setShowActions(true)
  }, [])

  const closeFeedDropdown = useCallback(() => {
    setShowFeedDropdown(false)
    setFeedDropdownPosition(null)
    setIsFeedDropdownReady(false)
  }, [])

  const closeAnimDropdown = useCallback(() => {
    setShowAnimDropdown(false)
    setAnimDropdownPosition(null)
    setIsAnimDropdownReady(false)
  }, [])

  const handleFeed = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation()
    closeAnimDropdown()
    pinActionButtons()

    if (showFeedDropdown) {
      closeFeedDropdown()
      return
    }

    if (e?.currentTarget) {
      setFeedDropdownPosition(getActionDropdownPosition(e.currentTarget))
    } else {
      setFeedDropdownPosition(null)
    }

    setIsFeedDropdownReady(false)
    setShowFeedDropdown(true)
  }, [closeAnimDropdown, closeFeedDropdown, getActionDropdownPosition, pinActionButtons, showFeedDropdown])

  const handleToggleAnimDropdown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    closeFeedDropdown()
    pinActionButtons()

    if (showAnimDropdown) {
      closeAnimDropdown()
      return
    }

    setAnimDropdownPosition(getActionDropdownPosition(e.currentTarget))
    setIsAnimDropdownReady(false)
    setShowAnimDropdown(true)
  }, [closeAnimDropdown, closeFeedDropdown, getActionDropdownPosition, pinActionButtons, showAnimDropdown])

  const handlePlayFeedAnimation = (animationPath: string, animationId?: string) => {
    feed()
    playSwfPath(animationPath, { animationId })
  }

  const handleClean = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    clean()
    playSwfPath('/assets/swf_original/102/1022040141.swf', { animationId: '87' })
    setPenguinAction('bathe')
    setBubbleText('真舒服～')
    setTimeout(() => {
      setAction('idle')
      setPenguinAction('idle')
    }, 2500)
  }

  const handlePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    play()
    playSwfPath('/assets/swf_original/102/1022070141.swf', { animationId: '316' })
    setPenguinAction('play')
    setBubbleText('好开心～')
    setTimeout(() => {
      setAction('idle')
      setPenguinAction('idle')
    }, 3000)
  }

  const handleRest = () => {
    rest()
    playSwfPath('/assets/swf_original/102/1020030141.swf', { animationId: '10' })
    setPenguinAction('sleep')
    // 休息按钮走完整“瞌睡”分镜，再把状态同步回 idle
    setTimeout(() => {
      setPenguinAction('idle')
      setAction('idle')
    }, 5000)
  }

  const handleCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: 实现签到功能
    playSwfPath('/assets/swf_original/102/1020060441.swf', { animationId: '38' })
    setPenguinAction('happy')
    setBubbleText('签到成功！获得 10 经验 ✅')
    setTimeout(() => setPenguinAction('idle'), 1500)
  }

  const resizeWindowForMode = useCallback((mode: WindowMode) => {
    if (!window.electronAPI?.resizeWindow) return

    if (mode === 'chat') {
      window.electronAPI.resizeWindow(CHAT_WINDOW_WIDTH, CHAT_WINDOW_HEIGHT, { fitToScreen: true })
      return
    }

    if (mode === 'action-dropdown') {
      window.electronAPI.resizeWindow(ACTION_DROPDOWN_WINDOW_WIDTH, ACTION_DROPDOWN_WINDOW_HEIGHT)
      return
    }

    if (mode === 'probe') {
      window.electronAPI.resizeWindow(CHAT_WINDOW_WIDTH, CHAT_WINDOW_HEIGHT, { fitToScreen: true })
      return
    }

    if (mode === 'bubble') {
      window.electronAPI.resizeWindow(BUBBLE_WINDOW_WIDTH, BUBBLE_WINDOW_HEIGHT)
      return
    }

    if (mode === 'settings') {
      window.electronAPI.resizeWindow(SETTINGS_WINDOW_WIDTH, SETTINGS_WINDOW_HEIGHT, { fitToScreen: true })
      return
    }

    if (mode === 'context-menu') {
      window.electronAPI.resizeWindow(CONTEXT_MENU_WINDOW_WIDTH, CONTEXT_MENU_WINDOW_HEIGHT)
      return
    }

    window.electronAPI.resizeWindow(PET_WINDOW_WIDTH, PET_WINDOW_HEIGHT)
  }, [])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
    setIsContextMenuReady(false)
  }, [])

  const closeFloatingUi = useCallback(() => {
    closeContextMenu()
    closeFeedDropdown()
    closeAnimDropdown()
    setShowActions(false)
  }, [closeAnimDropdown, closeContextMenu, closeFeedDropdown])

  const openPanel = useCallback((panel: Exclude<ActivePanel, null>) => {
    closeFloatingUi()
    const nextPanel = activePanel === panel ? null : panel
    setActivePanel(nextPanel)
    resizeWindowForMode(nextPanel ?? 'pet')
  }, [activePanel, closeFloatingUi, resizeWindowForMode])

  const handleSettings = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    openPanel('settings')
  }

  const handleOpenPlayerProbe = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    openPanel('probe')
  }

  const handlePetHover = useCallback(() => {
    if (isContextMenuOpen || isActionDropdownOpen) return

    console.log('🐧 handlePetHover 被触发')
    // 清除之前的定时器
    if (hideActionsTimer.current) {
      clearTimeout(hideActionsTimer.current)
    }

    // 显示功能区
    setShowActions(true)
    console.log('✅ 功能区应该显示了')

    // 3秒后自动隐藏
    hideActionsTimer.current = setTimeout(() => {
      console.log('⏱️ 3秒到了，隐藏功能区')
      setShowActions(false)
    }, 3000)
  }, [isActionDropdownOpen, isContextMenuOpen])

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (hideActionsTimer.current) {
        clearTimeout(hideActionsTimer.current)
      }
      if (testActionTimer.current) {
        clearTimeout(testActionTimer.current)
      }
    }
  }, [])

  const handleQuit = () => {
    if (window.electronAPI && window.electronAPI.closeWindow) {
      window.electronAPI.closeWindow()
    }
  }

  const handleOpenChat = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    openPanel('chat')
  }

  const handlePlaySwf = (swfUrl: string, animationId?: string) => {
    playSwfPath(swfUrl, animationId ? { animationId } : undefined)
  }

  const handleStopSwf = useCallback(() => {
    playPlaylist(IDLE_SWF_PATH)
    setPenguinAction('idle')
  }, [playPlaylist])

  const handleSwfLoad = useCallback(() => {
    console.log('SWF loaded:', playerCommand.playlist)
  }, [playerCommand.playlist])

  const handleSwfError = useCallback((error: Error) => {
    console.error('SWF load error:', error)
    setToastMessage('动画加载失败')
    handleStopSwf()
  }, [handleStopSwf])

  const dropdownAccentColors = [
    '#69dcff',
    '#ffca7a',
    '#9ef0a5',
    '#ffd770',
    '#b4b8ff',
    '#ff9ab6',
    '#91e6d3',
    '#ffc082',
  ]

  const feedMenuItems: ActionDropdownMenuItem[] = feedAnimations.map((animation, index) => ({
    id: animation.id,
    label: animation.name.split(' ').slice(1).join(' ') || animation.name,
    icon: animation.emoji,
    accent: dropdownAccentColors[index % dropdownAccentColors.length],
    onSelect: () => handlePlayFeedAnimation(animation.path, animation.id),
  }))

  const animationMenuItems: ActionDropdownMenuItem[] = swfCategories.map((category, index) => ({
    id: category.key,
    label: category.name,
    icon: category.icon,
    accent: dropdownAccentColors[index % dropdownAccentColors.length],
    children: category.files.map((file) => ({
      id: `${category.key}-${file.id}`,
      label: file.name,
      icon: category.icon,
      accent: dropdownAccentColors[index % dropdownAccentColors.length],
      onSelect: () => handlePlaySwf(file.path, file.id),
    })),
  }))

  const menuItems: MenuItem[] = [
    { label: 'AI 助手', onClick: handleOpenChat },
    { divider: true, label: '', onClick: () => { } },
    { label: '喂食', onClick: handleFeed, disabled: hunger > 90 },
    { label: '清洁', onClick: handleClean, disabled: cleanliness > 90 },
    { label: '玩耍', onClick: handlePlay, disabled: energy < 15 },
    { label: '休息', onClick: handleRest, disabled: energy > 90 },
    { divider: true, label: '', onClick: () => { } },
    { label: 'AI 助手配置', onClick: handleSettings },
    ...(isDev ? [
      { label: 'player.swf 验证', onClick: handleOpenPlayerProbe },
      { divider: true, label: '', onClick: () => { } },
    ] : []),
    { label: '退出', onClick: handleQuit },
  ]

  // 根据情绪更新企鹅动作
  useEffect(() => {
    // 如果企鹅正在执行特定动作，不要被情绪打断
    if (['eat', 'bathe', 'play', 'sleep', 'happy'].includes(penguinAction)) {
      return
    }

    // 根据情绪显示对应的企鹅表情
    switch (currentEmotion) {
      case 'sad':
        setPenguinAction('sad')
        break
      case 'angry':
        setPenguinAction('angry')
        break
      case 'tired':
        if (energy < 20) {
          setPenguinAction('sleep')
        }
        break
      case 'hungry':
        if (hunger < 30) {
          setPenguinAction('sad')
        }
        break
      case 'happy':
        // happy 情绪默认显示待机，不自动招手
        // 招手动作只在特定交互（喂食、玩耍等）时触发
        setPenguinAction('idle')
        break
      default:
        setPenguinAction('idle')
    }
  }, [currentEmotion, energy, hunger, penguinAction])

  useEffect(() => {
    if (!isActionDropdownOpen) return

    if (hideActionsTimer.current) {
      clearTimeout(hideActionsTimer.current)
    }

    setShowActions(true)
  }, [isActionDropdownOpen])

  useEffect(() => {
    if (activePanel !== null) return

    let frame1 = 0
    let frame2 = 0

    if (isContextMenuOpen) {
      resizeWindowForMode('context-menu')

      frame1 = window.requestAnimationFrame(() => {
        frame2 = window.requestAnimationFrame(() => {
          const penguin = document.querySelector('.pet-draggable-area') as HTMLElement | null
          const rect = penguin?.getBoundingClientRect()

          if (!rect) return

          const nextX = Math.round(rect.right - 50)
          const nextY = Math.round(rect.top + rect.height * 0.58 + 30)

          setContextMenu((current) => {
            if (!current) return current
            if (current.x === nextX && current.y === nextY) return current

            return {
              x: nextX,
              y: nextY,
            }
          })
          setIsContextMenuReady(true)
        })
      })

      return () => {
        window.cancelAnimationFrame(frame1)
        window.cancelAnimationFrame(frame2)
      }
    }

    if (isActionDropdownOpen) {
      resizeWindowForMode('action-dropdown')

      frame1 = window.requestAnimationFrame(() => {
        frame2 = window.requestAnimationFrame(() => {
          if (showFeedDropdown && feedButtonRef.current) {
            setFeedDropdownPosition(getActionDropdownPosition(feedButtonRef.current))
            setIsFeedDropdownReady(true)
          } else if (showFeedDropdown) {
            setIsFeedDropdownReady(true)
          }

          if (showAnimDropdown && animButtonRef.current) {
            setAnimDropdownPosition(getActionDropdownPosition(animButtonRef.current))
            setIsAnimDropdownReady(true)
          } else if (showAnimDropdown) {
            setIsAnimDropdownReady(true)
          }
        })
      })

      return () => {
        window.cancelAnimationFrame(frame1)
        window.cancelAnimationFrame(frame2)
      }
    }

    if (isBubbleOpen) {
      resizeWindowForMode('bubble')
      return
    }

    resizeWindowForMode('pet')
  }, [
    activePanel,
    getActionDropdownPosition,
    isActionDropdownOpen,
    isBubbleOpen,
    isContextMenuOpen,
    resizeWindowForMode,
    showAnimDropdown,
    showFeedDropdown,
  ])

  useEffect(() => {
    const disposers: Array<() => void> = []

    if (window.electronAPI?.onOpenChat) {
      disposers.push(window.electronAPI.onOpenChat(() => {
        closeFloatingUi()
        setActivePanel('chat')
        resizeWindowForMode('chat')
      }))
    }

    if (window.electronAPI?.onOpenSettings) {
      disposers.push(window.electronAPI.onOpenSettings(() => {
        closeFloatingUi()
        setActivePanel('settings')
        resizeWindowForMode('settings')
      }))
    }

    return () => {
      disposers.forEach((dispose) => dispose())
    }
  }, [closeFloatingUi, resizeWindowForMode])

  return (
    <div className={`app ${activePanel ? 'panel-expanded' : ''} ${isContextMenuOpen ? 'context-menu-open' : ''} ${isActionDropdownOpen ? 'action-dropdown-open' : ''} ${isBubbleOpen ? 'bubble-open' : ''}`}>
      <div
        className={`pet-container ${isContextMenuOpen ? 'context-menu-open' : ''} ${isActionDropdownOpen ? 'action-dropdown-open' : ''} ${isBubbleOpen ? 'bubble-open' : ''}`}
        onContextMenu={handleContextMenu}
      >
        {/* 企鹅区域 - 始终保留在 DOM 中，聊天时隐藏，避免 Ruffle 单例被销毁 */}
        <div style={{ display: activePanel ? 'none' : 'block' }}>
          <>
            {/* QQ宠物企鹅（原版素材） */}
            <div
              className="penguin-wrapper"
              onMouseEnter={() => {
                console.log('🐧 onMouseEnter 触发')
                handlePetHover()
              }}
              onClick={(e) => {
                console.log('🖱️ onClick 触发')
                e.stopPropagation()
                handlePetHover()
              }}
            >
              {/* 对话气泡 */}
              {bubbleText && (
                <PetBubble
                  text={bubbleText}
                  duration={3000}
                  onClose={() => setBubbleText(null)}
                />
              )}

              {/* SWF 动画播放器 */}
              <div className="swf-player-container">
                {/* 可拖拽区域 - 只有企鹅本身可以拖动 */}
                <div className="pet-draggable-area">
                  <RufflePlayer
                    playlist={playerCommand.playlist}
                    playToken={playerCommand.token}
                    petId={0}
                    width={140}
                    height={140}
                    scale={1}
                    onLoad={handleSwfLoad}
                    onError={handleSwfError}
                  />
                </div>
              </div>

              {/* 已废弃 PNG Sprite 方案 */}
              {/* <QQPenguinSprite
              type={penguinType}
              action={penguinAction}
              scale={1}
              fps={12}
            /> */}
            </div>

            {/* 功能按钮 */}
            {!isContextMenuOpen && (
              <div className={`pet-actions ${showActions ? 'show' : ''}`}>
                <button className="action-btn" onClick={handleOpenChat} title="AI 助手">
                  🦞
                </button>
                <button
                  ref={animButtonRef}
                  className="action-btn"
                  onClick={handleToggleAnimDropdown}
                  title="动画"
                >
                  🎬
                </button>
                {/* 第三个功能按钮暂时停用，保留代码便于后续恢复
                <button ref={feedButtonRef} className="action-btn" onClick={handleFeed} title="喂养">
                  🍖
                </button>
                */}
                <button className="action-btn" onClick={handleCheckIn} title="签到">
                  ✅
                </button>
              </div>
            )}

          </>
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          ready={isContextMenuReady}
          items={menuItems}
          onClose={closeContextMenu}
        />
      )}

      {/* 喂养下拉列表 */}
      {showFeedDropdown && (
        <ActionDropdownMenu
          items={feedMenuItems}
          position={feedDropdownPosition}
          ready={isFeedDropdownReady}
          onClose={closeFeedDropdown}
        />
      )}

      {/* 动画分类下拉（一级+二级） */}
      {showAnimDropdown && (
        <ActionDropdownMenu
          items={animationMenuItems}
          position={animDropdownPosition}
          ready={isAnimDropdownReady}
          onClose={closeAnimDropdown}
        />
      )}

      {/* Toast 提示 */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* 设置面板 */}
      {showSettingsPanel && (
        <SettingsPanel
          onClose={() => {
            setActivePanel(null)
            resizeWindowForMode('pet')
          }}
          onOpenChat={() => {
            setActivePanel('chat')
            resizeWindowForMode('chat')
          }}
          onSaved={() => {
            setToastMessage('AI 配置已保存并立即生效')
          }}
        />
      )}

      {/* AI 对话框 */}
      {showChat && (
        <div className="chat-panel">
          <div ref={chatHeaderRef} className="chat-panel-header">
            <span>AI 助手 🦞</span>
            <button
              className="close-chat-btn"
              data-window-drag-ignore="true"
              onClick={handleOpenChat}
            >
              ✕
            </button>
          </div>
          <div className="chat-panel-content">
            <ChatWindow />
          </div>
        </div>
      )}

      {showPlayerSwfProbe && (
        <PlayerSwfProbePanel
          onClose={() => {
            setActivePanel(null)
            resizeWindowForMode('pet')
          }}
        />
      )}
    </div>
  )
}

export default App
