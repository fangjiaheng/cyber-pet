import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './ChatPanel.css'
import chongwuIcon from './assets/toolbar/qq-chongwu.png'
import gonggaoIcon from './assets/toolbar/qq-gonggao.png'
import richangIcon from './assets/toolbar/qq-richang.png'
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
import {
  countClaimedTaskGifts,
  countReadyTaskGifts,
  type TaskGiftKind,
  type TaskGiftReward,
  type TaskGiftSlot,
} from '../shared/taskGift'

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

type TaskDropdownMode = 'overview' | TaskGiftKind

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

const ACTION_STRIP_WIDTH = 280
const FLOATING_UI_VIEWPORT_PADDING = 16

function App() {
  const {
    hunger,
    cleanliness,
    energy,
    currentEmotion,
    onlineDataTime,
    taskGifts,
    feed,
    clean,
    play,
    rest,
    heal,
    study,
    work: petWork,
    travel,
    claimTaskGift,
    ensureTaskGiftState,
    cancelCurrentAction,
  } = usePetStore(useShallow((state) => ({
    hunger: state.hunger,
    cleanliness: state.cleanliness,
    energy: state.energy,
    currentEmotion: state.currentEmotion,
    onlineDataTime: state.onlineDataTime,
    taskGifts: state.taskGifts,
    feed: state.feed,
    clean: state.clean,
    play: state.play,
    rest: state.rest,
    heal: state.heal,
    study: state.study,
    work: state.work,
    travel: state.travel,
    claimTaskGift: state.claimTaskGift,
    ensureTaskGiftState: state.ensureTaskGiftState,
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
  const taskButtonRef = useRef<HTMLButtonElement | null>(null)
  const windowLayoutModeRef = useRef<WindowMode>('pet')

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
  const [showTaskDropdown, setShowTaskDropdown] = useState(false)
  const [taskDropdownMode, setTaskDropdownMode] = useState<TaskDropdownMode>('overview')
  const [animDropdownPosition, setAnimDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [lifeDropdownPosition, setLifeDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [taskDropdownPosition, setTaskDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [stripPosition, setStripPosition] = useState<{ left: number; top: number } | null>(null)
  const [isContextMenuReady, setIsContextMenuReady] = useState(false)
  const [isAnimDropdownReady, setIsAnimDropdownReady] = useState(false)
  const [isLifeDropdownReady, setIsLifeDropdownReady] = useState(false)
  const [isTaskDropdownReady, setIsTaskDropdownReady] = useState(false)
  const [animationIntervalMs, setAnimationIntervalMs] = useState(2400)
  const [playerCommand, setPlayerCommand] = useState<PlayerCommand>({
    playlist: IDLE_SWF_PATH,
    token: 0,
  })

  const showChat = activePanel === 'chat'
  const showSettingsPanel = activePanel === 'settings'
  const showPlayerSwfProbe = activePanel === 'probe'
  const isContextMenuOpen = contextMenu !== null
  const isActionDropdownOpen = showAnimDropdown || showLifeDropdown || showTaskDropdown || showFeedStrip || showCleanStrip
  const isBubbleOpen = bubbleText !== null

  useEffect(() => {
    initializeAI()
  }, [])

  useEffect(() => {
    const loadPetState = async () => {
      try {
        await usePetStore.getState().loadFromStorage()
      } catch (error) {
        console.error('闂傚倸鍊风粈渚€骞夐垾鎰佹綎缂備焦蓱閸欏繘鏌熼锝囦汗鐟滅増甯掗悙濠囨煃鐟欏嫬鍔ゅù婊堢畺閺屾盯鏁傜拠鎻掔闁哥喎鎲＄换婵嬪煕閳ь剟宕橀埡浣锋樊闂備浇顕栭崰鎺楀疾閻樿绠犳繝濠傛噹閺嬪牊淇婇婵囥€冨瑙勬礃缁绘稒娼忛崜褏蓱闂佽鍠涢崺鏍矉瀹ュ棛闄勯柛娑橈工娴?', error)
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
        console.error('闂傚倷娴囧畷鍨叏閺夋嚚娲煛閸滀焦鏅悷婊勫灴婵＄敻骞囬弶璺ㄥ€為梺闈浤涚仦楣冩暅闂傚倷绀佸﹢閬嶅磿閵堝鍨傚ù锝呭枤閺変粙姊绘担钘夊惞濠殿喖纾划鍫熸媴鐟欏嫭鐝锋繛瀵稿Т椤戝棝宕戦鍫熺厱闁斥晛鍘鹃鍡橆偨闁绘劕鎼痪褔鏌涢顐簻濞存粠鍨抽幃?', error)
      }
    }

    void loadWindowSettings()
  }, [])

  useEffect(() => {
    ensureTaskGiftState()
  }, [ensureTaskGiftState])

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

  const scheduleHideActions = useCallback((delay = 3000) => {
    clearHideActionsTimer()
    hideActionsTimer.current = window.setTimeout(() => {
      setShowActions(false)
      hideActionsTimer.current = null
    }, delay)
  }, [clearHideActionsTimer])

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

    return () => {
      window.clearTimeout(enterTimer)
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
      windowLayoutModeRef.current = mode
      return
    }

    if (mode === 'action-dropdown') {
      window.electronAPI.resizeWindow(ACTION_DROPDOWN_WINDOW_WIDTH, ACTION_DROPDOWN_WINDOW_HEIGHT)
      windowLayoutModeRef.current = mode
      return
    }

    if (mode === 'probe') {
      window.electronAPI.resizeWindow(CHAT_WINDOW_WIDTH, CHAT_WINDOW_HEIGHT, { fitToScreen: true })
      windowLayoutModeRef.current = mode
      return
    }

    if (mode === 'bubble') {
      // Pet and bubble use the same window size now 闂?no resize needed
      windowLayoutModeRef.current = mode
      return
    }

    if (mode === 'settings') {
      window.electronAPI.resizeWindow(SETTINGS_WINDOW_WIDTH, SETTINGS_WINDOW_HEIGHT, { fitToScreen: true })
      windowLayoutModeRef.current = mode
      return
    }

    if (mode === 'context-menu') {
      window.electronAPI.resizeWindow(CONTEXT_MENU_WINDOW_WIDTH, CONTEXT_MENU_WINDOW_HEIGHT)
      windowLayoutModeRef.current = mode
      return
    }

    // pet mode 闂?restore to default size
    window.electronAPI.resizeWindow(PET_WINDOW_WIDTH, PET_WINDOW_HEIGHT)
    windowLayoutModeRef.current = mode
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
    const viewportWidth = window.innerWidth
    const minLeft = ACTION_STRIP_WIDTH / 2 + FLOATING_UI_VIEWPORT_PADDING
    const maxLeft = viewportWidth - ACTION_STRIP_WIDTH / 2 - FLOATING_UI_VIEWPORT_PADDING
    const preferredLeft = rect.left + rect.width / 2
    const clampedLeft = Math.min(Math.max(preferredLeft, minLeft), maxLeft)

    return {
      left: Math.round(clampedLeft),
      top: Math.round(rect.bottom + 10),
    }
  }, [])

  const formatTaskReward = useCallback((reward: TaskGiftReward) => {
    const parts = [
      reward.experience > 0 ? '经验 +' + reward.experience : null,
      reward.coins > 0 ? '元宝 +' + reward.coins : null,
      reward.hunger > 0 ? '饥饿 +' + reward.hunger : null,
      reward.cleanliness > 0 ? '清洁 +' + reward.cleanliness : null,
      reward.mood > 0 ? '心情 +' + reward.mood : null,
      reward.energy > 0 ? '体力 +' + reward.energy : null,
    ].filter(Boolean)

    return parts.join('，')
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

  const closeTaskDropdown = useCallback(() => {
    setShowTaskDropdown(false)
    setTaskDropdownPosition(null)
    setIsTaskDropdownReady(false)
    setTaskDropdownMode('overview')
  }, [])

  const closeFloatingUi = useCallback(() => {
    closeContextMenu()
    closeFeedStrip()
    closeCleanStrip()
    closeAnimDropdown()
    closeLifeDropdown()
    closeTaskDropdown()
    setShowActions(false)
  }, [closeAnimDropdown, closeCleanStrip, closeContextMenu, closeFeedStrip, closeLifeDropdown, closeTaskDropdown])

  const openTaskDropdown = useCallback((mode: TaskDropdownMode, anchor?: { left: number; top: number } | null) => {
    closeFeedStrip()
    closeCleanStrip()
    closeAnimDropdown()
    closeLifeDropdown()
    pinActionButtons()

    const fallbackAnchor = anchor
      ?? taskDropdownPosition
      ?? (taskButtonRef.current ? getActionDropdownPosition(taskButtonRef.current) : null)
      ?? (lifeButtonRef.current ? getActionDropdownPosition(lifeButtonRef.current) : null)

    if (!fallbackAnchor) return

    setTaskDropdownMode(mode)
    setTaskDropdownPosition(fallbackAnchor)
    setIsTaskDropdownReady(false)
    setShowTaskDropdown(true)
  }, [
    closeAnimDropdown,
    closeCleanStrip,
    closeFeedStrip,
    closeLifeDropdown,
    getActionDropdownPosition,
    pinActionButtons,
    taskDropdownPosition,
  ])

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
    closeTaskDropdown()
    closeCleanStrip()
    pinActionButtons()
    setShowFeedStrip((current) => !current)
  }, [closeAnimDropdown, closeCleanStrip, closeLifeDropdown, closeTaskDropdown, pinActionButtons])

  const handleClean = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation()
    closeAnimDropdown()
    closeLifeDropdown()
    closeTaskDropdown()
    closeFeedStrip()
    pinActionButtons()
    setShowCleanStrip((current) => !current)
  }, [closeAnimDropdown, closeFeedStrip, closeLifeDropdown, closeTaskDropdown, pinActionButtons])

  const handleToggleAnimDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    closeFeedStrip()
    closeCleanStrip()
    closeLifeDropdown()
    closeTaskDropdown()
    pinActionButtons()

    if (showAnimDropdown) {
      closeAnimDropdown()
      return
    }

    setAnimDropdownPosition(getActionDropdownPosition(event.currentTarget))
    setIsAnimDropdownReady(false)
    setShowAnimDropdown(true)
  }, [closeAnimDropdown, closeCleanStrip, closeFeedStrip, closeLifeDropdown, closeTaskDropdown, getActionDropdownPosition, pinActionButtons, showAnimDropdown])

  const handleToggleLifeDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    closeFeedStrip()
    closeCleanStrip()
    closeAnimDropdown()
    closeTaskDropdown()
    pinActionButtons()

    if (showLifeDropdown) {
      closeLifeDropdown()
      return
    }

    setLifeDropdownPosition(getActionDropdownPosition(event.currentTarget))
    setIsLifeDropdownReady(false)
    setShowLifeDropdown(true)
  }, [closeAnimDropdown, closeCleanStrip, closeFeedStrip, closeLifeDropdown, closeTaskDropdown, getActionDropdownPosition, pinActionButtons, showLifeDropdown])

  const handleToggleTaskDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    closeFeedStrip()
    closeCleanStrip()
    closeAnimDropdown()
    closeLifeDropdown()
    pinActionButtons()

    if (showTaskDropdown && taskDropdownMode === 'overview') {
      closeTaskDropdown()
      return
    }

    setTaskDropdownPosition(getActionDropdownPosition(event.currentTarget))
    setTaskDropdownMode('overview')
    setIsTaskDropdownReady(false)
    setShowTaskDropdown(true)
  }, [
    closeAnimDropdown,
    closeCleanStrip,
    closeFeedStrip,
    closeLifeDropdown,
    closeTaskDropdown,
    getActionDropdownPosition,
    pinActionButtons,
    showTaskDropdown,
    taskDropdownMode,
  ])

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
    setPenguinAction('play')
    scheduleReturnToIdle(3000)
  }, [clearActionResetTimer, playSwfPath, scheduleReturnToIdle])

  const handleStopSwf = useCallback(() => {
    resetToIdle(true)
  }, [resetToIdle])

  const handleSwfLoad = useCallback(() => {
    console.log('SWF loaded:', playerCommand.playlist)
  }, [playerCommand.playlist])

  const handleSwfError = useCallback((error: Error) => {
    console.error('SWF load error:', error)
    setToastMessage('动画加载失败')
    handleStopSwf()
  }, [handleStopSwf])

  const handleClaimTaskGift = useCallback((kind: TaskGiftKind, index: number) => {
    const result = claimTaskGift(kind, index)

    if (!result.success || !result.reward) {
      if (result.reason === 'claimed') {
        setBubbleText('这个礼物已经领取过了。')
      } else if (result.reason === 'locked') {
        setBubbleText(kind === 'sign' ? '登录送礼还没到领取时间。' : '在线时长还不够，继续陪我一会儿。')
      } else {
        setBubbleText('这个礼物暂时不能领取。')
      }
      return
    }

    playSwfPath(
      kind === 'sign'
        ? '/assets/swf_original/102/1020060441.swf'
        : '/assets/swf_original/102/1022070141.swf',
      { animationId: kind === 'sign' ? '38' : '316' },
    )
    setPenguinAction('happy')
    setBubbleText((kind === 'sign' ? '登录送礼领取成功，' : '在线送礼领取成功，') + formatTaskReward(result.reward) + '。')
    scheduleReturnToIdle(1600)
  }, [claimTaskGift, formatTaskReward, playSwfPath, scheduleReturnToIdle])


  const handlePlay = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation()
    runTimedInteraction({
      perform: play,
      swfPath: '/assets/swf_original/102/1022070141.swf',
      animationId: '316',
      penguinAction: 'play',
      baseDuration: 1400,
    })
  }, [play, runTimedInteraction])

  const handleRest = useCallback(() => {
    runTimedInteraction({
      perform: rest,
      swfPath: '/assets/swf_original/102/1020030141.swf',
      animationId: '10',
      penguinAction: 'sleep',
      baseDuration: 2800,
    })
  }, [rest, runTimedInteraction])

  const handlePetHover = useCallback(() => {
    if (isContextMenuOpen || isActionDropdownOpen) return
    setShowActions(true)
    scheduleHideActions()
  }, [isActionDropdownOpen, isContextMenuOpen, scheduleHideActions])

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
    { id: '85', name: '吃 吃饭', path: '/assets/swf_original/102/1022010141.swf', emoji: '吃' },
    { id: '312', name: '喝 喝水', path: '/assets/swf_original/102/1022020141.swf', emoji: '喝' },
    { id: '313', name: '鱼 烤鱼', path: '/assets/swf_original/102/1023160141.swf', emoji: '鱼' },
    { id: '314', name: '咖 喝咖啡', path: '/assets/swf_original/102/1023160341.swf', emoji: '咖' },
    { id: '315', name: '饮 冷饮', path: '/assets/swf_original/102/1023160441.swf', emoji: '饮' },
    { id: '301', name: '杯 岛屿咖啡', path: '/assets/swf_original/102/1021001541.swf', emoji: '杯' },
    { id: '302', name: '果 果冻', path: '/assets/swf_original/102/1021001641.swf', emoji: '果' },
    { id: '307', name: '奶 奶茶', path: '/assets/swf_original/102/1021003841.swf', emoji: '奶' },
    { id: '308', name: '布 布丁', path: '/assets/swf_original/102/1021004141.swf', emoji: '布' },
    { id: '310', name: '面 意面', path: '/assets/swf_original/102/1022010241.swf', emoji: '面' },
  ]), [])

  const cleanAnimations = useMemo(() => ([
    { id: '87', name: '洗 洗澡', path: '/assets/swf_original/102/1022040141.swf', emoji: '洗' },
    { id: '304', name: '香 香氛沐浴', path: '/assets/swf_original/102/1023140141.swf', emoji: '香' },
    { id: '305', name: '皂 柠檬香皂', path: '/assets/swf_original/102/1023140241.swf', emoji: '皂' },
    { id: '306', name: '护 宝宝护肤', path: '/assets/swf_original/102/1023140341.swf', emoji: '护' },
    { id: '303', name: '喷 喷雾清洁', path: '/assets/swf_original/102/1021001941.swf', emoji: '喷' },
    { id: '309', name: '泡 泡泡矿泉', path: '/assets/swf_original/102/1021005241.swf', emoji: '泡' },
  ]), [])

  const feedStripItems: ScrollStripItem[] = useMemo(() => (
    feedAnimations.map((animation, index) => ({
      id: animation.id,
      icon: animation.emoji,
      label: animation.name.split(' ').slice(1).join(' ') || animation.name,
      description: `名称: ${animation.name.split(' ').slice(1).join(' ') || animation.name}
饥饿: +30`,
      accent: dropdownAccentColors[index % dropdownAccentColors.length],
      onSelect: () => {
        closeFeedStrip()
        runTimedInteraction({
          perform: feed,
          swfPath: animation.path,
          animationId: animation.id,
          penguinAction: 'eat',
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
      description: `名称: ${animation.name.split(' ').slice(1).join(' ') || animation.name}
清洁: +40`,
      accent: dropdownAccentColors[(index + 1) % dropdownAccentColors.length],
      onSelect: () => {
        closeCleanStrip()
        runTimedInteraction({
          perform: clean,
          swfPath: animation.path,
          animationId: animation.id,
          penguinAction: 'bathe',
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

  const taskDropdownItems: ActionDropdownMenuItem[] = useMemo(() => {
    const buildTaskSlotLabel = (kind: TaskGiftKind, slot: TaskGiftSlot) => {
      const prefix = kind === 'sign' ? ('第' + slot.order + '天') : slot.seeTime
      const status = slot.isTake === 2 ? '已领取' : slot.isTake === 1 ? '可领取' : '未达成'
      return prefix + ' ' + status
    }

    if (taskDropdownMode === 'overview') {
      const signReady = countReadyTaskGifts(taskGifts.sign)
      const signClaimed = countClaimedTaskGifts(taskGifts.sign)
      const onlineReady = countReadyTaskGifts(taskGifts.online)
      const onlineClaimed = countClaimedTaskGifts(taskGifts.online)

      return [
        {
          id: 'task-sign',
          label: '登录送礼 ' + signClaimed + '/12' + (signReady > 0 ? ' 可领 ' + signReady : ''),
          icon: '礼',
          accent: dropdownAccentColors[5],
          onSelect: () => window.setTimeout(() => openTaskDropdown('sign'), 0),
        },
        {
          id: 'task-online',
          label: '在线送礼 ' + onlineClaimed + '/8，在线 ' + onlineDataTime + ' 分钟' + (onlineReady > 0 ? '，可领 ' + onlineReady : ''),
          icon: '时',
          accent: dropdownAccentColors[6],
          onSelect: () => window.setTimeout(() => openTaskDropdown('online'), 0),
        },
      ]
    }

    const activeKind = taskDropdownMode
    const group = taskGifts[activeKind]

    return group.slots.map((slot, index) => ({
      id: activeKind + '-' + slot.order,
      label: buildTaskSlotLabel(activeKind, slot),
      icon: activeKind === 'sign' ? '登' : '在',
      accent: dropdownAccentColors[(index + (activeKind === 'sign' ? 2 : 4)) % dropdownAccentColors.length],
      onSelect: () => handleClaimTaskGift(activeKind, index),
    }))
  }, [handleClaimTaskGift, onlineDataTime, openTaskDropdown, taskDropdownMode, taskGifts])

  const lifeMenuItems: ActionDropdownMenuItem[] = useMemo(() => ([
    {
      id: 'feed',
      label: '喂食',
      icon: '食',
      accent: dropdownAccentColors[0],
      onSelect: () => {
        closeLifeDropdown()
        setShowFeedStrip(true)
      },
    },
    {
      id: 'clean',
      label: '清洁',
      icon: '洁',
      accent: dropdownAccentColors[1],
      onSelect: () => {
        closeLifeDropdown()
        setShowCleanStrip(true)
      },
    },
    {
      id: 'task',
      label: '任务',
      icon: '礼',
      accent: dropdownAccentColors[6],
      children: [
        {
          id: 'task-sign-entry',
          label: '登录送礼' + (countReadyTaskGifts(taskGifts.sign) > 0 ? ' 可领' : ''),
          icon: '登',
          accent: dropdownAccentColors[5],
          onSelect: () => openTaskDropdown('sign', lifeDropdownPosition),
        },
        {
          id: 'task-online-entry',
          label: '在线送礼' + (countReadyTaskGifts(taskGifts.online) > 0 ? ' 可领' : ''),
          icon: '在',
          accent: dropdownAccentColors[6],
          onSelect: () => openTaskDropdown('online', lifeDropdownPosition),
        },
      ],
    },
    {
      id: 'heal',
      label: '治疗',
      icon: '医',
      accent: dropdownAccentColors[2],
      children: [
        {
          id: 'heal-95',
          label: '吃药',
          icon: '药',
          accent: dropdownAccentColors[2],
          onSelect: () => runTimedInteraction({
            perform: heal,
            swfPath: '/assets/swf_original/102/1022050141.swf',
            animationId: '95',
            penguinAction: 'happy',
            baseDuration: 1400,
          }),
        },
        {
          id: 'heal-96',
          label: '打针',
          icon: '针',
          accent: dropdownAccentColors[2],
          onSelect: () => runTimedInteraction({
            perform: heal,
            swfPath: '/assets/swf_original/102/1022050241.swf',
            animationId: '96',
            penguinAction: 'happy',
            baseDuration: 1600,
          }),
        },
      ],
    },
    {
      id: 'study',
      label: '学习',
      icon: '学',
      accent: dropdownAccentColors[3],
      children: [
        {
          id: 'study-61',
          label: '看书',
          icon: '书',
          accent: dropdownAccentColors[3],
          onSelect: () => runTimedInteraction({
            perform: study,
            swfPath: '/assets/swf_original/102/1020060241.swf',
            animationId: '61',
            penguinAction: 'happy',
            baseDuration: 1800,
          }),
        },
        {
          id: 'study-69',
          label: '记笔记',
          icon: '记',
          accent: dropdownAccentColors[3],
          onSelect: () => runTimedInteraction({
            perform: study,
            swfPath: '/assets/swf_original/102/1020060541.swf',
            animationId: '69',
            penguinAction: 'happy',
            baseDuration: 1800,
          }),
        },
      ],
    },
    {
      id: 'work',
      label: '打工',
      icon: '工',
      accent: dropdownAccentColors[4],
      children: [
        {
          id: 'work-71',
          label: '办公',
          icon: '办',
          accent: dropdownAccentColors[4],
          onSelect: () => runTimedInteraction({
            perform: petWork,
            swfPath: '/assets/swf_original/102/1020060341.swf',
            animationId: '71',
            penguinAction: 'work',
            baseDuration: 2000,
          }),
        },
        {
          id: 'work-126',
          label: '做手工',
          icon: '手',
          accent: dropdownAccentColors[4],
          onSelect: () => runTimedInteraction({
            perform: petWork,
            swfPath: '/assets/swf_original/102/1022070441.swf',
            animationId: '126',
            penguinAction: 'work',
            baseDuration: 2000,
          }),
        },
      ],
    },
    {
      id: 'travel',
      label: '旅行',
      icon: '行',
      accent: dropdownAccentColors[5],
      children: [
        {
          id: 'travel-23',
          label: '钓鱼',
          icon: '鱼',
          accent: dropdownAccentColors[5],
          onSelect: () => runTimedInteraction({
            perform: travel,
            swfPath: '/assets/swf_original/102/1020040141.swf',
            animationId: '23',
            penguinAction: 'happy',
            baseDuration: 1800,
          }),
        },
      ],
    },
  ]), [closeLifeDropdown, heal, lifeDropdownPosition, openTaskDropdown, petWork, runTimedInteraction, study, taskGifts, travel])

  const menuItems: MenuItem[] = useMemo(() => ([
    {
      label: 'AI 助手',
      icon: 'AI',
      onClick: () => {},
      children: [
        { label: '打开聊天', icon: 'CH', onClick: () => handleOpenChat() },
        { label: 'AI 设置', icon: 'CF', onClick: () => openSettingsSection('ai') },
      ],
    },
    {
      label: '宠物互动',
      icon: '宠',
      onClick: () => {},
      children: [
        { label: '喂食', icon: '食', onClick: () => handleFeed() },
        { label: '清洁', icon: '洁', onClick: () => handleClean() },
        { label: '玩耍', icon: '玩', onClick: () => handlePlay() },
        { label: '休息', icon: '休', onClick: handleRest },
        {
          label: '任务',
          icon: '礼',
          onClick: () => {},
          children: [
            {
              label: '登录送礼' + (countReadyTaskGifts(taskGifts.sign) > 0 ? ' 可领' : ''),
              icon: '登',
              onClick: () => openTaskDropdown('sign', contextMenu ? { left: contextMenu.x, top: contextMenu.y } : null),
            },
            {
              label: '在线送礼' + (countReadyTaskGifts(taskGifts.online) > 0 ? ' 可领' : ''),
              icon: '在',
              onClick: () => openTaskDropdown('online', contextMenu ? { left: contextMenu.x, top: contextMenu.y } : null),
            },
          ],
        },
      ],
    },
    {
      label: '商城',
      icon: '商',
      onClick: () => setToastMessage('商城暂未开放。'),
    },
    {
      label: '选项',
      icon: '设',
      onClick: () => {},
      children: [
        { label: '设置', icon: '设', onClick: () => openSettingsSection('game') },
        { label: '资料', icon: '资', onClick: () => openSettingsSection('profile') },
        { label: '停止动画', icon: '停', onClick: handleStopSwf },
        { label: '关于', icon: '关', onClick: () => openSettingsSection('about') },
      ],
    },
    { divider: true, label: '', onClick: () => {} },
    {
      label: '隐藏宠物',
      icon: '隐',
      onClick: handleHideToTray,
    },
    {
      label: '退出宠物',
      icon: '退',
      onClick: handleQuit,
    },
  ]), [contextMenu, handleClean, handleFeed, handleHideToTray, handleOpenChat, handlePlay, handleQuit, handleRest, handleStopSwf, openSettingsSection, openTaskDropdown, taskGifts])

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
    if (!showActions) return
    if (activePanel !== null || isContextMenuOpen || isActionDropdownOpen || isBubbleOpen) return

    scheduleHideActions()

    return () => {
      clearHideActionsTimer()
    }
  }, [
    activePanel,
    clearHideActionsTimer,
    isActionDropdownOpen,
    isBubbleOpen,
    isContextMenuOpen,
    scheduleHideActions,
    showActions,
  ])

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

            if (showTaskDropdown) {
              setIsTaskDropdownReady(true)
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
    showTaskDropdown,
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
                <button className="action-btn action-btn--qq" onClick={handleOpenChat} title="AI 助手">
                  <span className="action-btn__ai-icon" aria-hidden="true">AI</span>
                </button>
                <button
                  ref={animButtonRef}
                  className="action-btn action-btn--qq action-btn--image"
                  onClick={handleToggleAnimDropdown}
                  title="动画"
                >
                  <img className="action-btn__group-image" src={richangIcon} alt="" aria-hidden="true" />
                </button>
                <button
                  ref={lifeButtonRef}
                  className="action-btn action-btn--qq action-btn--image"
                  onClick={handleToggleLifeDropdown}
                  title="互动"
                >
                  <img className="action-btn__group-image" src={chongwuIcon} alt="" aria-hidden="true" />
                </button>
                <button
                  ref={taskButtonRef}
                  className="action-btn action-btn--qq action-btn--image"
                  onClick={handleToggleTaskDropdown}
                  title="任务"
                >
                  <img className="action-btn__group-image" src={gonggaoIcon} alt="" aria-hidden="true" />
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
            hint: '喂食会提升饥饿值。',
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
            hint: '清洁会提升清洁值。',
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

      {showTaskDropdown && (
        <ActionDropdownMenu
          items={taskDropdownItems}
          position={taskDropdownPosition}
          ready={isTaskDropdownReady}
          onClose={closeTaskDropdown}
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
            setToastMessage('AI 设置已保存并立即生效')
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
            <span>AI 助手</span>
            <button
              className="close-chat-btn"
              data-window-drag-ignore="true"
              onClick={handleOpenChat}
            >
              x
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
