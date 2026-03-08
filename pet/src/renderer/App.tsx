import React, { useRef, useEffect, useState } from 'react'
import './App.css'
import './ChatPanel.css'
import { usePetStore } from './stores/petStore'
import { usePetDecay } from './hooks/usePetDecay'
import { ContextMenu, MenuItem } from './components/ContextMenu'
import { Toast } from './components/Toast'
import { PetBubble } from './components/PetBubble'
import { SwfGallery } from './components/SwfGallery'
import { ChatWindow } from '../components/ChatWindow'
import { initializeAI } from './aiInit'
import { QQPenguinSprite, type PenguinType } from './components/QQPenguinSprite'

// 企鹅动作类型
type PenguinAction =
  | 'idle' | 'walk' | 'run' | 'sit' | 'sleep'
  | 'eat' | 'bathe' | 'play' | 'work'
  | 'happy' | 'sad' | 'angry'

function App() {
  // 初始化 AI 引擎（只执行一次）
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

  // 启动时显示欢迎气泡
  useEffect(() => {
    const timer = setTimeout(() => {
      setBubbleText('我来啦！')
    }, 1000) // 延迟1秒后显示

    return () => clearTimeout(timer)
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
  const [isAnimating, setIsAnimating] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showActions, setShowActions] = useState(false)
  const hideActionsTimer = useRef<NodeJS.Timeout | null>(null)
  const testActionTimer = useRef<NodeJS.Timeout | null>(null)
  const isTestingActionRef = useRef(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [penguinAction, setPenguinAction] = useState<PenguinAction>('idle')
  const [showActionTest, setShowActionTest] = useState(false)
  const [isTestingAction, setIsTestingAction] = useState(false)
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const [showSwfGallery, setShowSwfGallery] = useState(false)

  // 企鹅类型（GG/MM）
  const [penguinType, setPenguinType] = useState<PenguinType>('GG')

  useEffect(() => {
    const petContainer = document.querySelector('.pet-container') as HTMLElement
    if (!petContainer) return

    const handleMouseDown = async (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // 如果点击的是功能区或功能区内的按钮，不触发拖拽
      if (target.closest('.pet-actions')) {
        return
      }

      startPos.current = { x: e.screenX, y: e.screenY }
      hasMoved.current = false
      isDragging.current = true
      const pos = await window.electronAPI.getWindowPosition()
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

      const x = e.screenX - dragOffset.current.x
      const y = e.screenY - dragOffset.current.y
      window.electronAPI.moveWindow(x, y)
    }

    const handleMouseUp = (e: MouseEvent) => {
      // 如果没有发生移动，并且点击的是宠物，触发点击交互
      if (!hasMoved.current) {
        const target = e.target as HTMLElement
        if (target.classList.contains('pet')) {
          setIsAnimating(true)
          setTimeout(() => {
            setIsAnimating(false)
            setAction('idle')
          }, 300)
        }
      }
      isDragging.current = false
    }

    petContainer.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      petContainer.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [setAction])


  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleFeed = (e: React.MouseEvent) => {
    e.stopPropagation()
    feed()
    setPenguinAction('eat')
    setBubbleText('好好吃！')
    setTimeout(() => {
      setAction('idle')
      setPenguinAction('idle')
    }, 2000)
  }

  const handleClean = (e: React.MouseEvent) => {
    e.stopPropagation()
    clean()
    setPenguinAction('bathe')
    setBubbleText('真舒服～')
    setTimeout(() => {
      setAction('idle')
      setPenguinAction('idle')
    }, 2500)
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
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
    setBubbleText('签到成功！')
    setToastMessage('获得 10 经验 ✅')
    setTimeout(() => setPenguinAction('idle'), 1500)
  }

  const handleSettings = () => {
    setToastMessage('设置功能即将推出！')
  }

  // 测试动作
  const handleTestAction = (action: string) => {
    // 清除之前的测试定时器
    if (testActionTimer.current) {
      clearTimeout(testActionTimer.current)
    }

    setIsTestingAction(true)
    isTestingActionRef.current = true
    setPenguinAction(action as PenguinAction)
    setToastMessage(`测试动作: ${action}`)

    // 根据动作设置不同的持续时间
    const duration = action === 'sleep' ? 5000 : 3000

    testActionTimer.current = setTimeout(() => {
      setPenguinAction('idle')
      // 延迟一小段时间再关闭测试模式，防止被情绪系统立即接管
      setTimeout(() => {
        setIsTestingAction(false)
        isTestingActionRef.current = false
      }, 200)
    }, duration)
  }

  const handlePetHover = () => {
    // 清除之前的定时器
    if (hideActionsTimer.current) {
      clearTimeout(hideActionsTimer.current)
    }

    // 显示功能区
    setShowActions(true)

    // 3秒后自动隐藏
    hideActionsTimer.current = setTimeout(() => {
      setShowActions(false)
    }, 3000)
  }

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
    setShowChat(!showChat)
    if (!showChat) {
      setToastMessage('AI 助手已展开！🦞')
    }
  }

  const menuItems: MenuItem[] = [
    { label: 'AI 助手', icon: '🦞', onClick: handleOpenChat },
    { divider: true, label: '', onClick: () => {} },
    { label: '喂食', icon: '🍖', onClick: handleFeed, disabled: hunger > 90 },
    { label: '清洁', icon: '🚿', onClick: handleClean, disabled: cleanliness > 90 },
    { label: '玩耍', icon: '🎾', onClick: handlePlay, disabled: energy < 15 },
    { label: '休息', icon: '💤', onClick: handleRest, disabled: energy > 90 },
    { divider: true, label: '', onClick: () => {} },
    { label: '设置', icon: '⚙️', onClick: handleSettings },
    { divider: true, label: '', onClick: () => {} },
    { label: '退出', icon: '❌', onClick: handleQuit },
  ]

  // 根据情绪更新企鹅动作
  useEffect(() => {
    // 如果正在测试动作，不要被情绪打断（使用 ref 立即检查）
    if (isTestingAction || isTestingActionRef.current) {
      return
    }

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
  }, [currentEmotion, energy, hunger, penguinAction, isTestingAction])

  return (
    <div className={`app ${showChat ? 'chat-expanded' : ''}`}>
      <div className="pet-container" onContextMenu={handleContextMenu}>
        {/* QQ宠物企鹅（原版素材） */}
        <div
          className="penguin-wrapper"
          onMouseEnter={handlePetHover}
        >
          {/* 对话气泡 */}
          {bubbleText && (
            <PetBubble
              text={bubbleText}
              duration={3000}
              onClose={() => setBubbleText(null)}
            />
          )}

          <QQPenguinSprite
            type={penguinType}
            action={penguinAction}
            scale={1}
            fps={12}
          />
        </div>

        {/* 功能按钮 */}
        <div className={`pet-actions ${showActions ? 'show' : ''}`}>
          <button className="action-btn" onClick={handleOpenChat} title="AI 助手">
            🦞
          </button>
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation()
              setShowActionTest(!showActionTest)
            }}
            title="动作测试"
          >
            🎮
          </button>
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation()
              setShowSwfGallery(!showSwfGallery)
            }}
            title="动画画廊"
          >
            🎬
          </button>
          <button className="action-btn" onClick={handleFeed} title="喂养">
            🍖
          </button>
          <button className="action-btn" onClick={handleCheckIn} title="签到">
            ✅
          </button>
        </div>

        {/* 动作测试下拉列表 */}
        {showActionTest && (
          <div className="action-test-dropdown">
            <div className="dropdown-header">
              <span>动作测试</span>
              <button onClick={() => setShowActionTest(false)}>✕</button>
            </div>
            <div className="dropdown-content">
              <button onClick={() => handleTestAction('idle')}>
                🧍 待机 (xiuxian)
              </button>
              <button onClick={() => handleTestAction('eat')}>
                🍖 吃饭 (chifan)
              </button>
              <button onClick={() => handleTestAction('bathe')}>
                🚿 洗澡 (xizao)
              </button>
              <button onClick={() => handleTestAction('happy')}>
                👋 招手 (zhaoshou)
              </button>
              <button onClick={() => handleTestAction('play')}>
                🛹 滑板 (huaban)
              </button>
              <button onClick={() => handleTestAction('sad')}>
                😢 眨眼 (zayan)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={menuItems}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Toast 提示 */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
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

      {/* 动画画廊 */}
      {showSwfGallery && (
        <div className="gallery-panel">
          <div className="gallery-panel-header">
            <span>Flash 动画画廊 🎬</span>
            <button className="close-gallery-btn" onClick={() => setShowSwfGallery(false)}>
              ✕
            </button>
          </div>
          <div className="gallery-panel-content">
            <SwfGallery />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
