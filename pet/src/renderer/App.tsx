import React, { useRef, useEffect, useState, useCallback } from 'react'
import './App.css'
import './ChatPanel.css'
import { usePetStore } from './stores/petStore'
import { usePetDecay } from './hooks/usePetDecay'
import { ContextMenu, MenuItem } from './components/ContextMenu'
import { Toast } from './components/Toast'
import { PetBubble } from './components/PetBubble'
import { RufflePlayer } from './components/RufflePlayer'
import { ChatWindow } from '../components/ChatWindow'
import { SettingsPanel } from './components/SettingsPanel'
import { initializeAI } from './aiInit'
import {
  ACTION_DROPDOWN_WINDOW_HEIGHT,
  ACTION_DROPDOWN_WINDOW_WIDTH,
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
// import { QQPenguinSprite, type PenguinType } from './components/QQPenguinSprite'

// 企鹅动作类型
type PenguinAction =
  | 'idle' | 'walk' | 'run' | 'sit' | 'sleep'
  | 'eat' | 'bathe' | 'play' | 'work'
  | 'happy' | 'sad' | 'angry'

type ActivePanel = 'chat' | 'settings' | null
type WindowMode = 'pet' | 'chat' | 'settings' | 'context-menu' | 'action-dropdown'

function App() {
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

  // 启动时播放进场动画，再显示欢迎气泡
  useEffect(() => {
    // 延迟1.5秒等Ruffle初始化完成后播进场动画
    const enterTimer = setTimeout(() => {
      setCurrentSwfUrl(ENTER_SWF)
    }, 1500)

    // 进场结束后显示欢迎气泡
    const bubbleTimer = setTimeout(() => {
      setBubbleText('我只是倔强说不想主人，假装说不想主人，但心里面很想陪在你身边的。。。')
    }, 5000)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(bubbleTimer)
    }
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
  const feedButtonRef = useRef<HTMLButtonElement | null>(null)
  const animButtonRef = useRef<HTMLButtonElement | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
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
  const [animCategory, setAnimCategory] = useState<string | null>(null)
  const [feedDropdownPosition, setFeedDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [animDropdownPosition, setAnimDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  // 默认待机动画 - 使用 102 号企鹅 GG 的通常动画
  const DEFAULT_IDLE_SWF = '/assets/swf_original/102/1020000141.swf'
  const ENTER_SWF = '/assets/swf_original/102/1020110141.swf'
  const [currentSwfUrl, setCurrentSwfUrl] = useState<string>(DEFAULT_IDLE_SWF)
  // 鼠标跟随已移除（Ruffle load() 每次切换 SWF 都会闪烁，无法规避）

  // 喂养动画列表
  const feedAnimations = [
    { id: 'chi1', name: '🍖 吃饭1', path: '/assets/swf_original/102/1020060141.swf', emoji: '🍖' },
    { id: 'chi2', name: '🍗 吃饭2', path: '/assets/swf_original/102/1020060241.swf', emoji: '🍗' },
    { id: 'chi3', name: '🍰 吃饭3', path: '/assets/swf_original/102/1020060341.swf', emoji: '🍰' },
    { id: 'he1', name: '💧 喝水1', path: '/assets/swf_original/102/1020060441.swf', emoji: '💧' },
    { id: 'he2', name: '🥤 喝水2', path: '/assets/swf_original/102/1020060541.swf', emoji: '🥤' },
  ]
  const showChat = activePanel === 'chat'
  const showSettingsPanel = activePanel === 'settings'
  const isContextMenuOpen = contextMenu !== null
  const isActionDropdownOpen = showFeedDropdown || showAnimDropdown

  // 企鹅类型（GG/MM）- 已废弃 PNG 方案
  // const [penguinType, setPenguinType] = useState<PenguinType>('GG')

  // 鼠标穿透控制
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (activePanel !== null || isContextMenuOpen || isActionDropdownOpen) {
        if (window.electronAPI?.setIgnoreMouseEvents) {
          window.electronAPI.setIgnoreMouseEvents(false)
        }
        return
      }

      // 检查鼠标是否在可交互区域
      const isOverInteractive =
        target.closest('.penguin-wrapper') !== null ||
        target.closest('.pet-actions') !== null ||
        target.closest('.action-test-dropdown') !== null ||
        target.closest('.anim-dropdown') !== null ||
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
  }, [activePanel, isActionDropdownOpen, isContextMenuOpen])

  useEffect(() => {
    if (!window.electronAPI?.setIgnoreMouseEvents) return

    if (activePanel !== null || isContextMenuOpen || isActionDropdownOpen) {
      window.electronAPI.setIgnoreMouseEvents(false)
    }
  }, [activePanel, isActionDropdownOpen, isContextMenuOpen])

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
    setContextMenu({ x: 0, y: 0 })
  }

  const handleFeed = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation()
    setShowAnimDropdown(false)
    setAnimCategory(null)
    setAnimDropdownPosition(null)

    if (e?.currentTarget) {
      setFeedDropdownPosition(getActionDropdownPosition(e.currentTarget))
    } else {
      setFeedDropdownPosition(null)
    }

    setShowFeedDropdown((current) => !current)
  }

  const getActionDropdownPosition = useCallback((button: HTMLElement) => {
    const rect = button.getBoundingClientRect()

    return {
      left: Math.round(rect.left + rect.width / 2),
      top: Math.round(rect.bottom + 10),
    }
  }, [])

  const handleToggleAnimDropdown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setShowFeedDropdown(false)
    setFeedDropdownPosition(null)
    setAnimCategory(null)
    setAnimDropdownPosition(getActionDropdownPosition(e.currentTarget))
    setShowAnimDropdown((current) => !current)
  }, [getActionDropdownPosition])

  // 播放喂养动画（路径已包含待机，loadlists 自动回待机）
  const handlePlayFeedAnimation = (animationPath: string, animationName: string) => {
    feed()
    setCurrentSwfUrl(animationPath)
    setShowFeedDropdown(false)
    setFeedDropdownPosition(null)
  }

  const handleClean = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    clean()
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
    setPenguinAction('play')
    setBubbleText('好开心～')
    setTimeout(() => {
      setAction('idle')
      setPenguinAction('idle')
    }, 3000)
  }

  const handleRest = () => {
    rest()
    setPenguinAction('sleep')
    // 睡觉是循环动画，需要手动结束
    setTimeout(() => {
      setPenguinAction('idle')
      setAction('idle')
    }, 5000)
  }

  const handleCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: 实现签到功能
    setPenguinAction('happy')
    setBubbleText('签到成功！获得 10 经验 ✅')
    setTimeout(() => setPenguinAction('idle'), 1500)
  }

  const resizeWindowForMode = useCallback((mode: WindowMode) => {
    if (!window.electronAPI?.resizeWindow) return

    if (mode === 'chat') {
      window.electronAPI.resizeWindow(CHAT_WINDOW_WIDTH, CHAT_WINDOW_HEIGHT)
      return
    }

    if (mode === 'action-dropdown') {
      window.electronAPI.resizeWindow(ACTION_DROPDOWN_WINDOW_WIDTH, ACTION_DROPDOWN_WINDOW_HEIGHT)
      return
    }

    if (mode === 'settings') {
      window.electronAPI.resizeWindow(SETTINGS_WINDOW_WIDTH, SETTINGS_WINDOW_HEIGHT)
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
  }, [])

  const closeFloatingUi = useCallback(() => {
    closeContextMenu()
    setShowFeedDropdown(false)
    setShowAnimDropdown(false)
    setAnimCategory(null)
    setFeedDropdownPosition(null)
    setAnimDropdownPosition(null)
    setShowActions(false)
  }, [closeContextMenu])

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

  const handlePetHover = useCallback(() => {
    if (isContextMenuOpen) return

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
  }, [isContextMenuOpen])

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

  // 处理SWF播放
  const handlePlaySwf = (swfUrl: string) => {
    setCurrentSwfUrl(swfUrl)
  }

  // 停止SWF播放 - 恢复到待机动画
  const handleStopSwf = useCallback(() => {
    setCurrentSwfUrl(DEFAULT_IDLE_SWF)
    setPenguinAction('idle')
  }, [DEFAULT_IDLE_SWF])

  // SWF 加载完成回调
  const handleSwfLoad = useCallback(() => {
    console.log('SWF loaded:', currentSwfUrl)
  }, [currentSwfUrl])

  // SWF 加载错误回调
  const handleSwfError = useCallback((error: Error) => {
    console.error('SWF load error:', error)
    setToastMessage('动画加载失败')
    handleStopSwf()
  }, [handleStopSwf])

  const menuItems: MenuItem[] = [
    { label: 'AI 助手', onClick: handleOpenChat },
    { divider: true, label: '', onClick: () => { } },
    { label: '喂食', onClick: handleFeed, disabled: hunger > 90 },
    { label: '清洁', onClick: handleClean, disabled: cleanliness > 90 },
    { label: '玩耍', onClick: handlePlay, disabled: energy < 15 },
    { label: '休息', onClick: handleRest, disabled: energy > 90 },
    { divider: true, label: '', onClick: () => { } },
    { label: 'AI 助手配置', onClick: handleSettings },
    { divider: true, label: '', onClick: () => { } },
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
          }

          if (showAnimDropdown && animButtonRef.current) {
            setAnimDropdownPosition(getActionDropdownPosition(animButtonRef.current))
          }
        })
      })

      return () => {
        window.cancelAnimationFrame(frame1)
        window.cancelAnimationFrame(frame2)
      }
    }

    resizeWindowForMode('pet')
  }, [
    activePanel,
    getActionDropdownPosition,
    isActionDropdownOpen,
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
    <div className={`app ${activePanel ? 'panel-expanded' : ''} ${isContextMenuOpen ? 'context-menu-open' : ''} ${isActionDropdownOpen ? 'action-dropdown-open' : ''}`}>
      <div
        className={`pet-container ${isContextMenuOpen ? 'context-menu-open' : ''} ${isActionDropdownOpen ? 'action-dropdown-open' : ''}`}
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
                    src={currentSwfUrl}
                    width={140}
                    height={140}
                    scale={1}
                    loop={currentSwfUrl === DEFAULT_IDLE_SWF}
                    onLoad={handleSwfLoad}
                    onError={handleSwfError}
                    onEnd={handleStopSwf}
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
                <button ref={feedButtonRef} className="action-btn" onClick={handleFeed} title="喂养">
                  🍖
                </button>
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
          items={menuItems}
          onClose={closeContextMenu}
        />
      )}

      {/* 喂养下拉列表 */}
      {showFeedDropdown && (
        <div
          className={`action-test-dropdown ${feedDropdownPosition ? 'action-test-dropdown--anchored' : 'action-test-dropdown--fixed'}`}
          style={feedDropdownPosition ? { left: feedDropdownPosition.left, top: feedDropdownPosition.top } : undefined}
        >
          <div className="dropdown-header">
            <span>喂养宠物</span>
            <button onClick={() => { setShowFeedDropdown(false); setFeedDropdownPosition(null) }}>✕</button>
          </div>
          <div className="dropdown-content">
            {feedAnimations.map((anim) => (
              <button
                key={anim.id}
                onClick={() => handlePlayFeedAnimation(anim.path, anim.name)}
              >
                {anim.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 动画分类下拉（一级+二级） */}
      {showAnimDropdown && (
        <div
          className={`action-test-dropdown anim-dropdown ${animDropdownPosition ? 'action-test-dropdown--anchored' : 'action-test-dropdown--fixed'}`}
          style={animDropdownPosition ? { left: animDropdownPosition.left, top: animDropdownPosition.top } : undefined}
        >
          <div className="dropdown-header">
            <span>播放动画</span>
            <button onClick={() => { setShowAnimDropdown(false); setAnimCategory(null); setAnimDropdownPosition(null) }}>✕</button>
          </div>
          <div className="anim-dropdown-body">
            {/* 一级分类 */}
            <div className="anim-category-list">
              {swfCategories.map((cat) => (
                <button
                  key={cat.key}
                  className={`anim-cat-btn ${animCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setAnimCategory(animCategory === cat.key ? null : cat.key)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="anim-cat-arrow">{animCategory === cat.key ? '▶' : '›'}</span>
                </button>
              ))}
            </div>
            {/* 二级动画列表 */}
            {animCategory && (
              <div className="anim-file-list">
                {swfCategories.find(c => c.key === animCategory)?.files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      handlePlaySwf(file.path)
                      setShowAnimDropdown(false)
                      setAnimCategory(null)
                      setAnimDropdownPosition(null)
                    }}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
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
          <div className="chat-panel-header">
            <span>AI 助手 🦞</span>
            <button className="close-chat-btn" onClick={handleOpenChat}>
              ✕
            </button>
          </div>
          <div className="chat-panel-content">
            <ChatWindow />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
