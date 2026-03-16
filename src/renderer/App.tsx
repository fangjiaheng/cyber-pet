import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './ChatPanel.css'
import { usePetStore } from './stores/petStore'
import { useShallow } from 'zustand/react/shallow'
import { usePetDecay } from './hooks/usePetDecay'
import { ActionDropdownMenu, ActionDropdownMenuItem } from './components/ActionDropdownMenu'
import HorizontalScrollStrip, { ScrollStripItem } from './components/HorizontalScrollStrip'
import { ContextMenu, MenuItem } from './components/ContextMenu'
import { Toast } from './components/Toast'
import { PetBubble } from './components/PetBubble'
import { RufflePlayer } from './components/RufflePlayer'
import { PlayerSwfProbePanel } from './components/PlayerSwfProbePanel'
import { ChatWindow } from '../components/ChatWindow'
import { SettingsPanel } from './components/SettingsPanel'
import { initializeAI } from './aiInit'
import { useWindowDrag } from './hooks/useWindowDrag'
import { useMouseGaze } from './hooks/useMouseGaze'
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

type PenguinAction =
  | 'idle' | 'walk' | 'run' | 'sit' | 'sleep'
  | 'eat' | 'bathe' | 'play' | 'work'
  | 'happy' | 'sad' | 'angry'

type ActivePanel = 'chat' | 'settings' | 'probe' | null
type SettingsSection = 'ai' | 'profile' | 'game' | 'about'
type WindowMode = 'pet' | 'chat' | 'settings' | 'probe' | 'context-menu' | 'action-dropdown' | 'bubble'
type PlayerCommand = {
  playlist: string
  token: number
}
type PlaySwfOptions = {
  appendIdle?: boolean
  animationId?: string
}
type TimedInteractionOptions = {
  perform: () => void
  swfPath: string
  animationId?: string
  penguinAction: PenguinAction
  bubbleText?: string
  baseDuration: number
}

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

function App() {
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
    heal,
    study,
    work: petWork,
    travel,
    checkIn,
    cancelCurrentAction,
  } = usePetStore(useShallow((state) => ({
    hunger: state.hunger,
    cleanliness: state.cleanliness,
    mood: state.mood,
    energy: state.energy,
    currentEmotion: state.currentEmotion,
    feed: state.feed,
    clean: state.clean,
    play: state.play,
    rest: state.rest,
    heal: state.heal,
    study: state.study,
    work: state.work,
    travel: state.travel,
    checkIn: state.checkIn,
    cancelCurrentAction: state.cancelCurrentAction,
  })))

  usePetDecay()

  const isDragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const hideActionsTimer = useRef<number | null>(null)
  const actionResetTimer = useRef<number | null>(null)
  const actionSequence = useRef(0)
  const chatHeaderRef = useRef<HTMLDivElement | null>(null)
  const penguinWrapperRef = useRef<HTMLDivElement | null>(null)
  const actionBarRef = useRef<HTMLDivElement | null>(null)
  const animButtonRef = useRef<HTMLButtonElement | null>(null)
  const lifeButtonRef = useRef<HTMLButtonElement | null>(null)

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('ai')
  const [penguinAction, setPenguinAction] = useState<PenguinAction>('idle')
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const [showFeedStrip, setShowFeedStrip] = useState(false)
  const [showCleanStrip, setShowCleanStrip] = useState(false)
  const [showAnimDropdown, setShowAnimDropdown] = useState(false)
  const [showLifeDropdown, setShowLifeDropdown] = useState(false)
  const [animDropdownPosition, setAnimDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [lifeDropdownPosition, setLifeDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [stripPosition, setStripPosition] = useState<{ left: number; top: number } | null>(null)
  const [isContextMenuReady, setIsContextMenuReady] = useState(false)
  const [isAnimDropdownReady, setIsAnimDropdownReady] = useState(false)
  const [isLifeDropdownReady, setIsLifeDropdownReady] = useState(false)
  const [animationIntervalMs, setAnimationIntervalMs] = useState(2400)
  const [playerCommand, setPlayerCommand] = useState<PlayerCommand>({
    playlist: IDLE_SWF_PATH,
    token: 0,
  })

  const showChat = activePanel === 'chat'
  const showSettingsPanel = activePanel === 'settings'
  const showPlayerSwfProbe = activePanel === 'probe'
  const isContextMenuOpen = contextMenu !== null
  const isActionDropdownOpen = showAnimDropdown || showLifeDropdown || showFeedStrip || showCleanStrip
  const isBubbleOpen = bubbleText !== null

  useEffect(() => {
    initializeAI()
  }, [])

  useEffect(() => {
    const loadPetState = async () => {
      try {
        await usePetStore.getState().loadFromStorage()
      } catch (error) {
        console.error('加载宠物状态失败:', error)
      }
    }

    void loadPetState()
  }, [])

  useEffect(() => {
    const loadWindowSettings = async () => {
      try {
        const settings = await window.electronAPI?.storage?.getSettings?.()
        setAnimationIntervalMs(settings?.pet?.animationIntervalMs ?? 2400)
      } catch (error) {
        console.error('读取互动设置失败:', error)
      }
    }

    void loadWindowSettings()
  }, [])

  const playPlaylist = useCallback((playlist: string) => {
    setPlayerCommand((current) => ({
      playlist,
      token: current.token + 1,
    }))
  }, [])

  const playSwfPath = useCallback((swfPath: string, options?: PlaySwfOptions) => {
    playPlaylist(buildLoadlistsPlaylist(swfPath, options))
  }, [playPlaylist])

  const clearHideActionsTimer = useCallback(() => {
    if (hideActionsTimer.current) {
      window.clearTimeout(hideActionsTimer.current)
      hideActionsTimer.current = null
    }
  }, [])

  const clearActionResetTimer = useCallback(() => {
    if (actionResetTimer.current) {
      window.clearTimeout(actionResetTimer.current)
      actionResetTimer.current = null
    }
  }, [])

  const resetToIdle = useCallback((stopPlayback = false) => {
    clearActionResetTimer()
    actionSequence.current += 1
    cancelCurrentAction()
    setPenguinAction('idle')
    if (stopPlayback) {
      playPlaylist(IDLE_SWF_PATH)
    }
  }, [cancelCurrentAction, clearActionResetTimer, playPlaylist])

  const scheduleReturnToIdle = useCallback((baseDuration: number) => {
    clearActionResetTimer()
    const currentSequence = actionSequence.current + 1
    actionSequence.current = currentSequence

    actionResetTimer.current = window.setTimeout(() => {
      if (actionSequence.current !== currentSequence) return
      cancelCurrentAction()
      setPenguinAction('idle')
      actionResetTimer.current = null
    }, Math.max(600, baseDuration + animationIntervalMs))
  }, [animationIntervalMs, cancelCurrentAction, clearActionResetTimer])

  const runTimedInteraction = useCallback((options: TimedInteractionOptions) => {
    clearActionResetTimer()
    options.perform()
    playSwfPath(options.swfPath, options.animationId ? { animationId: options.animationId } : undefined)
    setPenguinAction(options.penguinAction)
    if (options.bubbleText) {
      setBubbleText(options.bubbleText)
    }
    scheduleReturnToIdle(options.baseDuration)
  }, [clearActionResetTimer, playSwfPath, scheduleReturnToIdle])

  useEffect(() => {
    const enterTimer = window.setTimeout(() => {
      playPlaylist(ENTER_PLAYLIST)
    }, 1500)

    const bubbleTimer = window.setTimeout(() => {
      setBubbleText('我只是倔强说不想主人，假装说不想主人，但心里面很想陪在你身边的。。。')
    }, 5000)

    return () => {
      window.clearTimeout(enterTimer)
      window.clearTimeout(bubbleTimer)
    }
  }, [playPlaylist])

  useWindowDrag(chatHeaderRef, showChat)

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      if (activePanel !== null || isContextMenuOpen || isActionDropdownOpen || isBubbleOpen) {
        window.electronAPI?.setIgnoreMouseEvents(false)
        return
      }

      const isOverInteractive =
        target.closest('.penguin-wrapper') !== null ||
        target.closest('.pet-actions') !== null ||
        target.closest('.action-dropdown-menu') !== null ||
        target.closest('.scroll-strip') !== null ||
        target.closest('.chat-panel') !== null ||
        target.closest('.settings-panel') !== null ||
        target.closest('.context-menu-overlay') !== null ||
        target.closest('.context-menu') !== null ||
        target.closest('.pet-bubble') !== null

      window.electronAPI?.setIgnoreMouseEvents(!isOverInteractive)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [activePanel, isActionDropdownOpen, isBubbleOpen, isContextMenuOpen])

  useEffect(() => {
    if (activePanel !== null || isContextMenuOpen || isActionDropdownOpen || isBubbleOpen) {
      window.electronAPI?.setIgnoreMouseEvents(false)
    }
  }, [activePanel, isActionDropdownOpen, isBubbleOpen, isContextMenuOpen])

  useEffect(() => {
    const draggableArea = document.querySelector('.pet-draggable-area') as HTMLElement | null
    if (!draggableArea) return

    const handleMouseDown = async (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const blocked =
        activePanel !== null ||
        isContextMenuOpen ||
        isActionDropdownOpen ||
        isBubbleOpen ||
        target.closest('.pet-actions') !== null

      if (blocked || event.button !== 0) {
        return
      }

      event.preventDefault()
      isDragging.current = true
      const position = await window.electronAPI.getWindowPosition()
      dragOffset.current = {
        x: event.screenX - position[0],
        y: event.screenY - position[1],
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging.current) return

      const nextX = event.screenX - dragOffset.current.x
      const nextY = event.screenY - dragOffset.current.y
      window.electronAPI.moveWindow(nextX, nextY)
    }

    const stopDragging = () => {
      isDragging.current = false
    }

    draggableArea.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', stopDragging)
    window.addEventListener('blur', stopDragging)

    return () => {
      draggableArea.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopDragging)
      window.removeEventListener('blur', stopDragging)
    }
  }, [activePanel, isActionDropdownOpen, isBubbleOpen, isContextMenuOpen])

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

  const getActionDropdownPosition = useCallback((button: HTMLElement) => {
    const rect = button.getBoundingClientRect()
    return {
      left: Math.round(rect.left + rect.width / 2),
      top: Math.round(rect.bottom + 10),
    }
  }, [])

  const getActionStripPosition = useCallback((container: HTMLElement) => {
    const rect = container.getBoundingClientRect()
    return {
      left: Math.round(rect.left + rect.width / 2),
      top: Math.round(rect.bottom + 10),
    }
  }, [])

  const pinActionButtons = useCallback(() => {
    clearHideActionsTimer()
    setShowActions(true)
  }, [clearHideActionsTimer])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
    setIsContextMenuReady(false)
  }, [])

  const closeFeedStrip = useCallback(() => {
    setShowFeedStrip(false)
    setStripPosition(null)
  }, [])

  const closeCleanStrip = useCallback(() => {
    setShowCleanStrip(false)
    setStripPosition(null)
  }, [])

  const closeAnimDropdown = useCallback(() => {
    setShowAnimDropdown(false)
    setAnimDropdownPosition(null)
    setIsAnimDropdownReady(false)
  }, [])

  const closeLifeDropdown = useCallback(() => {
    setShowLifeDropdown(false)
    setLifeDropdownPosition(null)
    setIsLifeDropdownReady(false)
  }, [])

  const closeFloatingUi = useCallback(() => {
    closeContextMenu()
    closeFeedStrip()
    closeCleanStrip()
    closeAnimDropdown()
    closeLifeDropdown()
    setShowActions(false)
  }, [closeAnimDropdown, closeCleanStrip, closeContextMenu, closeFeedStrip, closeLifeDropdown])

  const openPanel = useCallback((panel: Exclude<ActivePanel, null>) => {
    closeFloatingUi()
    const nextPanel = activePanel === panel ? null : panel
    setActivePanel(nextPanel)
    resizeWindowForMode(nextPanel ?? 'pet')
  }, [activePanel, closeFloatingUi, resizeWindowForMode])

  const openSettingsSection = useCallback((section: SettingsSection) => {
    closeFloatingUi()
    setSettingsSection(section)
    setActivePanel('settings')
    resizeWindowForMode('settings')
  }, [closeFloatingUi, resizeWindowForMode])

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    closeFloatingUi()
    setIsContextMenuReady(false)
    setContextMenu({ x: 0, y: 0 })
  }, [closeFloatingUi])

  const handleFeed = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation()
    closeAnimDropdown()
    closeLifeDropdown()
    closeCleanStrip()
    pinActionButtons()
    setShowFeedStrip((current) => !current)
  }, [closeAnimDropdown, closeCleanStrip, closeLifeDropdown, pinActionButtons])

  const handleClean = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation()
    closeAnimDropdown()
    closeLifeDropdown()
    closeFeedStrip()
    pinActionButtons()
    setShowCleanStrip((current) => !current)
  }, [closeAnimDropdown, closeFeedStrip, closeLifeDropdown, pinActionButtons])

  const handleToggleAnimDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    closeFeedStrip()
    closeCleanStrip()
    closeLifeDropdown()
    pinActionButtons()

    if (showAnimDropdown) {
      closeAnimDropdown()
      return
    }

    setAnimDropdownPosition(getActionDropdownPosition(event.currentTarget))
    setIsAnimDropdownReady(false)
    setShowAnimDropdown(true)
  }, [closeAnimDropdown, closeCleanStrip, closeFeedStrip, closeLifeDropdown, getActionDropdownPosition, pinActionButtons, showAnimDropdown])

  const handleToggleLifeDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    closeFeedStrip()
    closeCleanStrip()
    closeAnimDropdown()
    pinActionButtons()

    if (showLifeDropdown) {
      closeLifeDropdown()
      return
    }

    setLifeDropdownPosition(getActionDropdownPosition(event.currentTarget))
    setIsLifeDropdownReady(false)
    setShowLifeDropdown(true)
  }, [closeAnimDropdown, closeCleanStrip, closeFeedStrip, closeLifeDropdown, getActionDropdownPosition, pinActionButtons, showLifeDropdown])

  const handleOpenChat = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation()
    openPanel('chat')
  }, [openPanel])

  const handleHideToTray = useCallback(() => {
    window.electronAPI?.hideToTray?.()
  }, [])

  const handleQuit = useCallback(() => {
    window.electronAPI?.closeWindow?.()
  }, [])

  const handlePlaySwf = useCallback((swfUrl: string, animationId?: string) => {
    clearActionResetTimer()
    playSwfPath(swfUrl, animationId ? { animationId } : undefined)
  }, [clearActionResetTimer, playSwfPath])

  const handleStopSwf = useCallback(() => {
    resetToIdle(true)
    setBubbleText('先停下来，回到待机状态。')
  }, [resetToIdle])

  const handleSwfLoad = useCallback(() => {
    console.log('SWF loaded:', playerCommand.playlist)
  }, [playerCommand.playlist])

  const handleSwfError = useCallback((error: Error) => {
    console.error('SWF load error:', error)
    setToastMessage('动画加载失败')
    handleStopSwf()
  }, [handleStopSwf])

  const handleCheckInAction = useCallback(() => {
    const result = checkIn()

    if (!result.success) {
      setBubbleText('今天已经签过到了，明天再来。')
      setToastMessage('今日已签到')
      return
    }

    playSwfPath('/assets/swf_original/102/1020060441.swf', { animationId: '38' })
    setPenguinAction('happy')
    setBubbleText(
      result.levelUps > 0
        ? `签到成功！+${result.expGained} 经验，升到 Lv.${result.newLevel}。`
        : `签到成功！+${result.expGained} 经验，已连续签到 ${result.streak} 天。`,
    )
    scheduleReturnToIdle(1600)
  }, [checkIn, playSwfPath, scheduleReturnToIdle])

  const handleCheckIn = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    handleCheckInAction()
  }, [handleCheckInAction])

  const handlePlay = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation()
    runTimedInteraction({
      perform: play,
      swfPath: '/assets/swf_original/102/1022070141.swf',
      animationId: '316',
      penguinAction: 'play',
      bubbleText: '好开心～',
      baseDuration: 1400,
    })
  }, [play, runTimedInteraction])

  const handleRest = useCallback(() => {
    runTimedInteraction({
      perform: rest,
      swfPath: '/assets/swf_original/102/1020030141.swf',
      animationId: '10',
      penguinAction: 'sleep',
      bubbleText: '先睡一会，补充体力。',
      baseDuration: 2800,
    })
  }, [rest, runTimedInteraction])

  const handlePetHover = useCallback(() => {
    if (isContextMenuOpen || isActionDropdownOpen) return
    clearHideActionsTimer()
    setShowActions(true)
    hideActionsTimer.current = window.setTimeout(() => {
      setShowActions(false)
      hideActionsTimer.current = null
    }, 3000)
  }, [clearHideActionsTimer, isActionDropdownOpen, isContextMenuOpen])

  useEffect(() => {
    return () => {
      clearHideActionsTimer()
      clearActionResetTimer()
    }
  }, [clearActionResetTimer, clearHideActionsTimer])

  const handleGaze = useCallback((swfPath: string) => {
    playSwfPath(swfPath, { appendIdle: false })
  }, [playSwfPath])

  const handleGazeEnd = useCallback(() => {
    playPlaylist(IDLE_SWF_PATH)
  }, [playPlaylist])

  const handleDizzy = useCallback((swfPath: string) => {
    playSwfPath(swfPath)
    setBubbleText('好晕～头好晕...')
  }, [playSwfPath])

  useMouseGaze({
    targetRef: penguinWrapperRef,
    isDraggingRef: isDragging,
    penguinAction,
    activePanel,
    isContextMenuOpen,
    isActionDropdownOpen,
    isBubbleOpen,
    onGaze: handleGaze,
    onGazeEnd: handleGazeEnd,
    onDizzy: handleDizzy,
  })

  const feedAnimations = useMemo(() => ([
    { id: '85', name: '🍚 吃饭', path: '/assets/swf_original/102/1022010141.swf', emoji: '🍚' },
    { id: '312', name: '🥤 喝水', path: '/assets/swf_original/102/1022020141.swf', emoji: '🥤' },
    { id: '313', name: '🐟 烤鱼', path: '/assets/swf_original/102/1023160141.swf', emoji: '🐟' },
    { id: '314', name: '☕ 喝咖啡', path: '/assets/swf_original/102/1023160341.swf', emoji: '☕' },
    { id: '315', name: '🧊 喝冷饮', path: '/assets/swf_original/102/1023160441.swf', emoji: '🧊' },
    { id: '301', name: '🏝️ 下岛咖啡', path: '/assets/swf_original/102/1021001541.swf', emoji: '🏝️' },
    { id: '302', name: '🧃 滴答果果', path: '/assets/swf_original/102/1021001641.swf', emoji: '🧃' },
    { id: '307', name: '🍬 霹雳啪啦糖', path: '/assets/swf_original/102/1021003841.swf', emoji: '🍬' },
    { id: '308', name: '🥞 蛋黄甩甩饼', path: '/assets/swf_original/102/1021004141.swf', emoji: '🥞' },
    { id: '310', name: '🥔 某薯片', path: '/assets/swf_original/102/1022010241.swf', emoji: '🥔' },
  ]), [])

  const cleanAnimations = useMemo(() => ([
    { id: '87', name: '🛁 洗澡', path: '/assets/swf_original/102/1022040141.swf', emoji: '🛁' },
    { id: '304', name: '🧼 妙味香皂', path: '/assets/swf_original/102/1023140141.swf', emoji: '🧼' },
    { id: '305', name: '🍋 柠檬洗面奶', path: '/assets/swf_original/102/1023140241.swf', emoji: '🍋' },
    { id: '306', name: '✨ 宝宝爽身粉', path: '/assets/swf_original/102/1023140341.swf', emoji: '✨' },
    { id: '303', name: '💦 舒爽喷湿器', path: '/assets/swf_original/102/1021001941.swf', emoji: '💦' },
    { id: '309', name: '🧖 魔幻矿泉泥', path: '/assets/swf_original/102/1021005241.swf', emoji: '🧖' },
  ]), [])

  const feedStripItems: ScrollStripItem[] = useMemo(() => (
    feedAnimations.map((animation, index) => ({
      id: animation.id,
      icon: animation.emoji,
      label: animation.name.split(' ').slice(1).join(' ') || animation.name,
      description: `名称: ${animation.name.split(' ').slice(1).join(' ') || animation.name}\n饱食: +30`,
      accent: dropdownAccentColors[index % dropdownAccentColors.length],
      onSelect: () => {
        closeFeedStrip()
        runTimedInteraction({
          perform: feed,
          swfPath: animation.path,
          animationId: animation.id,
          penguinAction: 'eat',
          bubbleText: '吃饱啦，继续陪你。',
          baseDuration: 1400,
        })
      },
    }))
  ), [closeFeedStrip, feed, feedAnimations, runTimedInteraction])

  const cleanStripItems: ScrollStripItem[] = useMemo(() => (
    cleanAnimations.map((animation, index) => ({
      id: animation.id,
      icon: animation.emoji,
      label: animation.name.split(' ').slice(1).join(' ') || animation.name,
      description: `名称: ${animation.name.split(' ').slice(1).join(' ') || animation.name}\n清洁: +40`,
      accent: dropdownAccentColors[(index + 1) % dropdownAccentColors.length],
      onSelect: () => {
        closeCleanStrip()
        runTimedInteraction({
          perform: clean,
          swfPath: animation.path,
          animationId: animation.id,
          penguinAction: 'bathe',
          bubbleText: '洗香香了，状态恢复。',
          baseDuration: 1600,
        })
      },
    }))
  ), [clean, cleanAnimations, closeCleanStrip, runTimedInteraction])

  const animationMenuItems: ActionDropdownMenuItem[] = useMemo(() => (
    swfCategories.map((category, index) => ({
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
  ), [handlePlaySwf])

  const lifeMenuItems: ActionDropdownMenuItem[] = useMemo(() => ([
    {
      id: 'feed',
      label: '喂食',
      icon: '🍚',
      accent: dropdownAccentColors[0],
      onSelect: () => {
        closeLifeDropdown()
        setShowFeedStrip(true)
      },
    },
    {
      id: 'clean',
      label: '清洁',
      icon: '🧼',
      accent: dropdownAccentColors[1],
      onSelect: () => {
        closeLifeDropdown()
        setShowCleanStrip(true)
      },
    },
    {
      id: 'heal',
      label: '治疗',
      icon: '💊',
      accent: dropdownAccentColors[2],
      children: [
        {
          id: 'heal-95',
          label: '吃药',
          icon: '💊',
          accent: dropdownAccentColors[2],
          onSelect: () => runTimedInteraction({
            perform: heal,
            swfPath: '/assets/swf_original/102/1022050141.swf',
            animationId: '95',
            penguinAction: 'happy',
            bubbleText: '药效生效中，状态好多了。',
            baseDuration: 1400,
          }),
        },
        {
          id: 'heal-96',
          label: '打针',
          icon: '💉',
          accent: dropdownAccentColors[2],
          onSelect: () => runTimedInteraction({
            perform: heal,
            swfPath: '/assets/swf_original/102/1022050241.swf',
            animationId: '96',
            penguinAction: 'happy',
            bubbleText: '打针结束，恢复精神。',
            baseDuration: 1600,
          }),
        },
      ],
    },
    {
      id: 'study',
      label: '学习',
      icon: '📖',
      accent: dropdownAccentColors[3],
      children: [
        {
          id: 'study-61',
          label: '看书',
          icon: '📖',
          accent: dropdownAccentColors[3],
          onSelect: () => runTimedInteraction({
            perform: study,
            swfPath: '/assets/swf_original/102/1020060241.swf',
            animationId: '61',
            penguinAction: 'happy',
            bubbleText: '认真学习，赚到 12 元宝。',
            baseDuration: 1800,
          }),
        },
        {
          id: 'study-69',
          label: '记笔记',
          icon: '📝',
          accent: dropdownAccentColors[3],
          onSelect: () => runTimedInteraction({
            perform: study,
            swfPath: '/assets/swf_original/102/1020060541.swf',
            animationId: '69',
            penguinAction: 'happy',
            bubbleText: '知识和元宝都进账了。',
            baseDuration: 1800,
          }),
        },
      ],
    },
    {
      id: 'work',
      label: '打工',
      icon: '💼',
      accent: dropdownAccentColors[4],
      children: [
        {
          id: 'work-71',
          label: '办公',
          icon: '💼',
          accent: dropdownAccentColors[4],
          onSelect: () => runTimedInteraction({
            perform: petWork,
            swfPath: '/assets/swf_original/102/1020060341.swf',
            animationId: '71',
            penguinAction: 'work',
            bubbleText: '今天也有认真打工，赚到 28 元宝。',
            baseDuration: 2000,
          }),
        },
        {
          id: 'work-126',
          label: '做手工',
          icon: '🎨',
          accent: dropdownAccentColors[4],
          onSelect: () => runTimedInteraction({
            perform: petWork,
            swfPath: '/assets/swf_original/102/1022070441.swf',
            animationId: '126',
            penguinAction: 'work',
            bubbleText: '手工订单完成，元宝到手。',
            baseDuration: 2000,
          }),
        },
      ],
    },
    {
      id: 'travel',
      label: '旅行',
      icon: '🧳',
      accent: dropdownAccentColors[5],
      children: [
        {
          id: 'travel-23',
          label: '钓鱼',
          icon: '🎣',
          accent: dropdownAccentColors[5],
          onSelect: () => runTimedInteraction({
            perform: travel,
            swfPath: '/assets/swf_original/102/1020040141.swf',
            animationId: '23',
            penguinAction: 'happy',
            bubbleText: '出去散心，心情回来了。',
            baseDuration: 1800,
          }),
        },
      ],
    },
  ]), [closeLifeDropdown, heal, petWork, runTimedInteraction, study, travel])

  const menuItems: MenuItem[] = useMemo(() => ([
    {
      label: 'AI 助手',
      icon: '馃',
      onClick: () => {},
      children: [
        { label: '打开聊天', icon: '馃挰', onClick: () => handleOpenChat() },
        { label: 'AI 配置', icon: '鈿欙笍', onClick: () => openSettingsSection('ai') },
      ],
    },
    {
      label: '喂养宠物',
      icon: '🍽️',
      onClick: () => {},
      children: [
        { label: '喂食', icon: '🍚', onClick: () => handleFeed() },
        { label: '清洁', icon: '🧼', onClick: () => handleClean() },
        { label: '玩耍', icon: '🎉', onClick: () => handlePlay() },
        { label: '休息', icon: '💤', onClick: handleRest },
        { label: '签到', icon: '✅', onClick: handleCheckInAction },
      ],
    },
    {
      label: '商城',
      icon: '🛍️',
      onClick: () => setToastMessage('商城即将开放，后续会接元宝与道具系统。'),
    },
    {
      label: '选项',
      icon: '⚙️',
      onClick: () => {},
      children: [
        { label: '设置', icon: '⚙️', onClick: () => openSettingsSection('game') },
        { label: '宠物资料', icon: '📋', onClick: () => openSettingsSection('profile') },
        { label: '中止动画', icon: '⏹️', onClick: handleStopSwf },
        { label: '关于', icon: 'ℹ️', onClick: () => openSettingsSection('about') },
      ],
    },
    { divider: true, label: '', onClick: () => {} },
    {
      label: '隐藏宠物',
      icon: '🙈',
      onClick: handleHideToTray,
    },
    {
      label: '退出宠物',
      icon: '⏻',
      onClick: handleQuit,
    },
  ]), [handleCheckInAction, handleClean, handleFeed, handleHideToTray, handleOpenChat, handlePlay, handleQuit, handleRest, handleStopSwf, openSettingsSection])

  useEffect(() => {
    if (['eat', 'bathe', 'play', 'sleep', 'happy', 'work'].includes(penguinAction)) {
      return
    }

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
      default:
        setPenguinAction('idle')
    }
  }, [currentEmotion, energy, hunger, penguinAction])

  useEffect(() => {
    if (!isActionDropdownOpen) return
    clearHideActionsTimer()
    setShowActions(true)
  }, [clearHideActionsTimer, isActionDropdownOpen])

  useEffect(() => {
    if (activePanel !== null) return

    let frame1 = 0
    let frame2 = 0
    let frame3 = 0

    if (isContextMenuOpen) {
      frame1 = window.requestAnimationFrame(() => {
        resizeWindowForMode('context-menu')
        frame2 = window.requestAnimationFrame(() => {
          frame3 = window.requestAnimationFrame(() => {
            const penguin = document.querySelector('.pet-draggable-area') as HTMLElement | null
            const rect = penguin?.getBoundingClientRect()

            if (!rect) return

            const nextX = Math.round(rect.right - 40)
            const nextY = Math.round(rect.top + rect.height * 0.58 + 26)
            setContextMenu({ x: nextX, y: nextY })
            setIsContextMenuReady(true)
          })
        })
      })

      return () => {
        window.cancelAnimationFrame(frame1)
        window.cancelAnimationFrame(frame2)
        window.cancelAnimationFrame(frame3)
      }
    }

    if (isActionDropdownOpen) {
      frame1 = window.requestAnimationFrame(() => {
        resizeWindowForMode('action-dropdown')
        frame2 = window.requestAnimationFrame(() => {
          frame3 = window.requestAnimationFrame(() => {
            if (showAnimDropdown && animButtonRef.current) {
              setAnimDropdownPosition(getActionDropdownPosition(animButtonRef.current))
              setIsAnimDropdownReady(true)
            }

            if (showLifeDropdown && lifeButtonRef.current) {
              setLifeDropdownPosition(getActionDropdownPosition(lifeButtonRef.current))
              setIsLifeDropdownReady(true)
            }

            if ((showFeedStrip || showCleanStrip) && actionBarRef.current) {
              setStripPosition(getActionStripPosition(actionBarRef.current))
            }
          })
        })
      })

      return () => {
        window.cancelAnimationFrame(frame1)
        window.cancelAnimationFrame(frame2)
        window.cancelAnimationFrame(frame3)
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
    getActionStripPosition,
    isActionDropdownOpen,
    isBubbleOpen,
    isContextMenuOpen,
    resizeWindowForMode,
    showAnimDropdown,
    showCleanStrip,
    showFeedStrip,
    showLifeDropdown,
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
        setSettingsSection('ai')
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
        <div style={{ display: activePanel ? 'none' : 'block' }}>
          <div className="pet-home-stage">
          <div
            className="penguin-wrapper"
            ref={penguinWrapperRef}
            onMouseEnter={handlePetHover}
            onClick={(event) => {
              event.stopPropagation()
              handlePetHover()
            }}
          >
            {bubbleText && (
              <PetBubble
                text={bubbleText}
                duration={3000}
                onClose={() => setBubbleText(null)}
              />
            )}

            <div className="swf-player-container">
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
          </div>

          {!isContextMenuOpen && (
            <>
              <div ref={actionBarRef} className={`pet-actions ${showActions ? 'show' : ''}`}>
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
                <button
                  ref={lifeButtonRef}
                  className="action-btn"
                  onClick={handleToggleLifeDropdown}
                  title="互动"
                >
                  🎮
                </button>
                <button className="action-btn" onClick={handleCheckIn} title="签到">
                  ✅
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          ready={isContextMenuReady}
          items={menuItems}
          onClose={closeContextMenu}
        />
      )}

      {showFeedStrip && (
        <HorizontalScrollStrip
          items={feedStripItems}
          title="喂食"
          onClose={closeFeedStrip}
          className="feed-strip-positioned"
          style={stripPosition ?? undefined}
          meter={{
            label: '饥饿值',
            value: hunger,
            hint: '饥饿值会提升。',
          }}
        />
      )}

      {showCleanStrip && (
        <HorizontalScrollStrip
          items={cleanStripItems}
          title="清洁"
          onClose={closeCleanStrip}
          className="feed-strip-positioned"
          style={stripPosition ?? undefined}
          meter={{
            label: '清洁值',
            value: cleanliness,
            hint: '清洁值会提升。',
          }}
        />
      )}

      {showAnimDropdown && (
        <ActionDropdownMenu
          items={animationMenuItems}
          position={animDropdownPosition}
          ready={isAnimDropdownReady}
          onClose={closeAnimDropdown}
        />
      )}

      {showLifeDropdown && (
        <ActionDropdownMenu
          items={lifeMenuItems}
          position={lifeDropdownPosition}
          ready={isLifeDropdownReady}
          onClose={closeLifeDropdown}
        />
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {showSettingsPanel && (
        <SettingsPanel
          initialSection={settingsSection}
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
          onNotice={(message) => setToastMessage(message)}
          onGameSettingsSaved={(settings) => {
            setAnimationIntervalMs(settings.animationIntervalMs)
          }}
        />
      )}

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
