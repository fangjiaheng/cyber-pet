import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './ChatPanel.css'
import chongwuIcon from './assets/toolbar/qq-chongwu.png'
import gonggaoIcon from './assets/toolbar/qq-gonggao.png'
import richangIcon from './assets/toolbar/qq-richang.png'
import { usePetStore } from './stores/petStore'
import { HUNGER_MAX, CLEANLINESS_MAX } from './stores/petStore'
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
  getTaskGiftReward,
  type TaskGiftKind,
  type TaskGiftReward,
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
type OriginalStoreItem = {
  id: string
  name: string
  swfPath: string
  iconPath: string
  starve?: number
  clean?: number
  charm?: number
  intel?: number
  strong?: number
  desc?: string
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

const ACTION_STRIP_WIDTH = 280
const FLOATING_UI_VIEWPORT_PADDING = 16

function resolveRendererAssetUrl(assetPath: string) {
  const normalized = assetPath.replace(/^\/+/, '')

  if (typeof window === 'undefined') {
    return normalized
  }

  return new URL(normalized, window.location.href).toString()
}

// 新版素材路径
const NEW_SWF_BASE = '/assets/1.2.4source/Action/GG/Adult/'

const ORIGINAL_FOOD_ITEMS: OriginalStoreItem[] = [
  {
    id: '100010031',
    name: '雪泥爽',
    swfPath: NEW_SWF_BASE + 'Eat1.swf',
    iconPath: 'assets/1.2.4source/img_res/food/100010031.gif',
    starve: 720,
    intel: 8,
  },
  {
    id: '100010032',
    name: '小笼包',
    swfPath: NEW_SWF_BASE + 'Eat2.swf',
    iconPath: 'assets/1.2.4source/img_res/food/100010032.gif',
    starve: 500,
    charm: 100,
    intel: 100,
    strong: 100,
    desc: '一颗小笼包，原地爆炸三千里~',
  },
  {
    id: '100010033',
    name: '黑森林蛋糕',
    swfPath: NEW_SWF_BASE + 'Eat1.swf',
    iconPath: 'assets/1.2.4source/img_res/food/100010033.gif',
    starve: 720,
    charm: 8,
  },
  {
    id: '100010034',
    name: '鱼肉香肠',
    swfPath: NEW_SWF_BASE + 'Eat2.swf',
    iconPath: 'assets/1.2.4source/img_res/food/100010034.gif',
    starve: 1080,
    strong: 15,
  },
  {
    id: '100010035',
    name: '葡萄香槟',
    swfPath: NEW_SWF_BASE + 'Eat1.swf',
    iconPath: 'assets/1.2.4source/img_res/food/100010035.gif',
    starve: 900,
    intel: 12,
  },
  {
    id: '100010036',
    name: '八宝饭',
    swfPath: NEW_SWF_BASE + 'Eat2.swf',
    iconPath: 'assets/1.2.4source/img_res/food/100010036.gif',
    starve: 540,
    intel: 5,
  },
  {
    id: '100010037',
    name: '长寿面',
    swfPath: NEW_SWF_BASE + 'Eat1.swf',
    iconPath: 'assets/1.2.4source/img_res/food/100010037.gif',
    starve: 720,
    strong: 8,
  },
  {
    id: '100010038',
    name: '火腿汉堡',
    swfPath: NEW_SWF_BASE + 'Eat2.swf',
    iconPath: 'assets/1.2.4source/img_res/food/100010038.gif',
    starve: 720,
    charm: 8,
  },
  {
    id: '100010039',
    name: '饺子',
    swfPath: NEW_SWF_BASE + 'Eat1.swf',
    iconPath: 'assets/1.2.4source/img_res/food/100010039.gif',
    starve: 900,
    intel: 12,
  },
  {
    id: '100010040',
    name: '年糕',
    swfPath: NEW_SWF_BASE + 'Eat2.swf',
    iconPath: 'assets/1.2.4source/img_res/food/100010040.gif',
    starve: 900,
    strong: 12,
  },
]

const ORIGINAL_CLEAN_ITEMS: OriginalStoreItem[] = [
  {
    id: '102020011',
    name: '宝宝爽身粉',
    swfPath: NEW_SWF_BASE + 'Clean1.swf',
    iconPath: 'assets/1.2.4source/img_res/commodity/102020011.gif',
    clean: 1080,
  },
  {
    id: '102020012',
    name: '宝宝金水',
    swfPath: NEW_SWF_BASE + 'Clean2.swf',
    iconPath: 'assets/1.2.4source/img_res/commodity/102020012.gif',
    clean: 540,
  },
  {
    id: '102020013',
    name: '含香凝露',
    swfPath: NEW_SWF_BASE + 'Clean1.swf',
    iconPath: 'assets/1.2.4source/img_res/commodity/102020013.gif',
    clean: 720,
  },
  {
    id: '102020014',
    name: '啤酒香波',
    swfPath: NEW_SWF_BASE + 'Clean2.swf',
    iconPath: 'assets/1.2.4source/img_res/commodity/102020014.gif',
    clean: 2340,
  },
  {
    id: '102020015',
    name: '飘飘护发素',
    swfPath: NEW_SWF_BASE + 'Clean1.swf',
    iconPath: 'assets/1.2.4source/img_res/commodity/102020015.gif',
    clean: 1080,
  },
  {
    id: '102020016',
    name: '保湿啫喱',
    swfPath: NEW_SWF_BASE + 'Clean2.swf',
    iconPath: 'assets/1.2.4source/img_res/commodity/102020016.gif',
    clean: 2700,
  },
]

const ORIGINAL_HEAL_ITEMS: OriginalStoreItem[] = [
  {
    id: '10001',
    name: '板蓝根',
    swfPath: NEW_SWF_BASE + 'Cure1.swf',
    iconPath: 'assets/1.2.4source/img_res/medicine/10001.gif',
    desc: '用于治疗感冒',
  },
  {
    id: '10002',
    name: '消食片',
    swfPath: NEW_SWF_BASE + 'Cure1.swf',
    iconPath: 'assets/1.2.4source/img_res/medicine/10002.gif',
    desc: '用于治疗消化不良',
  },
  {
    id: '10003',
    name: '枇杷糖浆',
    swfPath: NEW_SWF_BASE + 'Cure1.swf',
    iconPath: 'assets/1.2.4source/img_res/medicine/10003.gif',
    desc: '用于治疗咳嗽',
  },
  {
    id: '10004',
    name: '清凉油',
    swfPath: NEW_SWF_BASE + 'Cure1.swf',
    iconPath: 'assets/1.2.4source/img_res/medicine/10004.gif',
    desc: '用于治疗头晕',
  },
  {
    id: '10005',
    name: '润肤露',
    swfPath: NEW_SWF_BASE + 'Cure1.swf',
    iconPath: 'assets/1.2.4source/img_res/medicine/10005.gif',
    desc: '用于治疗皮肤瘙痒',
  },
  {
    id: '20001',
    name: '银翘丸',
    swfPath: NEW_SWF_BASE + 'Cure2.swf',
    iconPath: 'assets/1.2.4source/img_res/medicine/20001.gif',
    desc: '用于治疗重感冒',
  },
  {
    id: '50001',
    name: '百草丹',
    swfPath: NEW_SWF_BASE + 'Cure2.swf',
    iconPath: 'assets/1.2.4source/img_res/medicine/50001.gif',
    desc: '包治百病，一粒见效',
  },
  {
    id: '60001',
    name: '还魂丹',
    swfPath: NEW_SWF_BASE + 'Revival.swf',
    iconPath: 'assets/1.2.4source/img_res/medicine/60001.gif',
    starve: 500,
    clean: 500,
    strong: 100,
    desc: '用于复活宠物，也可治百病,吃一颗长生不老！',
  },
]

function formatOriginalItemDescription(item: OriginalStoreItem) {
  const attributes = [
    item.charm ? `魅力 +${item.charm}` : null,
    item.intel ? `智力 +${item.intel}` : null,
    item.strong ? `武力 +${item.strong}` : null,
  ].filter(Boolean)

  return [
    `名称：${item.name}`,
    item.starve ? `饥饿值：+${item.starve}` : null,
    item.clean ? `清洁值：+${item.clean}` : null,
    attributes.length ? `属性：${attributes.join('  ')}` : null,
    item.desc ? `说明：${item.desc}` : null,
  ].filter(Boolean).join('\n')
}

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
  const animDropdownAnchorRef = useRef<HTMLButtonElement | null>(null)
  const dailyButtonRef = useRef<HTMLButtonElement | null>(null)
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
  const [showHealStrip, setShowHealStrip] = useState(false)
  const [taskStripKind, setTaskStripKind] = useState<TaskGiftKind | null>(null)
  const [showAnimDropdown, setShowAnimDropdown] = useState(false)
  const [showDailyDropdown, setShowDailyDropdown] = useState(false)
  const [showLifeDropdown, setShowLifeDropdown] = useState(false)
  const [showTaskDropdown, setShowTaskDropdown] = useState(false)
  const [animDropdownPosition, setAnimDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [dailyDropdownPosition, setDailyDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [lifeDropdownPosition, setLifeDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [taskDropdownPosition, setTaskDropdownPosition] = useState<{ left: number; top: number } | null>(null)
  const [stripPosition, setStripPosition] = useState<{ left: number; top: number } | null>(null)
  const [isContextMenuReady, setIsContextMenuReady] = useState(false)
  const [isAnimDropdownReady, setIsAnimDropdownReady] = useState(false)
  const [isDailyDropdownReady, setIsDailyDropdownReady] = useState(false)
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
  const showTaskStrip = taskStripKind !== null
  const isActionDropdownOpen = showAnimDropdown || showDailyDropdown || showLifeDropdown || showTaskDropdown || showFeedStrip || showCleanStrip || showHealStrip || showTaskStrip
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

  const closeHealStrip = useCallback(() => {
    setShowHealStrip(false)
    setStripPosition(null)
  }, [])

  const closeTaskStrip = useCallback(() => {
    setTaskStripKind(null)
    setStripPosition(null)
  }, [])

  const closeAnimDropdown = useCallback(() => {
    setShowAnimDropdown(false)
    setAnimDropdownPosition(null)
    setIsAnimDropdownReady(false)
  }, [])

  const closeDailyDropdown = useCallback(() => {
    setShowDailyDropdown(false)
    setDailyDropdownPosition(null)
    setIsDailyDropdownReady(false)
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
  }, [])

  const closeFloatingUi = useCallback(() => {
    closeContextMenu()
    closeFeedStrip()
    closeCleanStrip()
    closeHealStrip()
    closeTaskStrip()
    closeAnimDropdown()
    closeDailyDropdown()
    closeLifeDropdown()
    closeTaskDropdown()
    setShowActions(false)
  }, [closeAnimDropdown, closeCleanStrip, closeContextMenu, closeDailyDropdown, closeFeedStrip, closeHealStrip, closeLifeDropdown, closeTaskDropdown, closeTaskStrip])

  const openTaskStrip = useCallback((kind: TaskGiftKind) => {
    closeTaskDropdown()
    closeFeedStrip()
    closeCleanStrip()
    closeHealStrip()
    closeAnimDropdown()
    closeDailyDropdown()
    closeLifeDropdown()
    pinActionButtons()
    setTaskStripKind(kind)
  }, [closeAnimDropdown, closeCleanStrip, closeDailyDropdown, closeFeedStrip, closeHealStrip, closeLifeDropdown, closeTaskDropdown, pinActionButtons])

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
    closeDailyDropdown()
    closeLifeDropdown()
    closeTaskDropdown()
    closeTaskStrip()
    closeCleanStrip()
    closeHealStrip()
    pinActionButtons()
    setShowFeedStrip((current) => !current)
  }, [closeAnimDropdown, closeCleanStrip, closeDailyDropdown, closeHealStrip, closeLifeDropdown, closeTaskDropdown, closeTaskStrip, pinActionButtons])

  const handleClean = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation()
    closeAnimDropdown()
    closeDailyDropdown()
    closeLifeDropdown()
    closeTaskDropdown()
    closeTaskStrip()
    closeFeedStrip()
    closeHealStrip()
    pinActionButtons()
    setShowCleanStrip((current) => !current)
  }, [closeAnimDropdown, closeFeedStrip, closeDailyDropdown, closeHealStrip, closeLifeDropdown, closeTaskDropdown, closeTaskStrip, pinActionButtons])

  const handleToggleAnimDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    animDropdownAnchorRef.current = event.currentTarget
    closeFeedStrip()
    closeCleanStrip()
    closeHealStrip()
    closeTaskStrip()
    closeDailyDropdown()
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
  }, [closeAnimDropdown, closeCleanStrip, closeDailyDropdown, closeFeedStrip, closeHealStrip, closeLifeDropdown, closeTaskDropdown, closeTaskStrip, getActionDropdownPosition, pinActionButtons, showAnimDropdown])

  const handleToggleDailyDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    closeFeedStrip()
    closeCleanStrip()
    closeHealStrip()
    closeTaskStrip()
    closeAnimDropdown()
    closeLifeDropdown()
    closeTaskDropdown()
    pinActionButtons()

    if (showDailyDropdown) {
      closeDailyDropdown()
      return
    }

    setDailyDropdownPosition(getActionDropdownPosition(event.currentTarget))
    setIsDailyDropdownReady(false)
    setShowDailyDropdown(true)
  }, [closeAnimDropdown, closeCleanStrip, closeDailyDropdown, closeFeedStrip, closeHealStrip, closeLifeDropdown, closeTaskDropdown, closeTaskStrip, getActionDropdownPosition, pinActionButtons, showDailyDropdown])

  const handleToggleLifeDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    closeFeedStrip()
    closeCleanStrip()
    closeHealStrip()
    closeTaskStrip()
    closeAnimDropdown()
    closeDailyDropdown()
    closeTaskDropdown()
    pinActionButtons()

    if (showLifeDropdown) {
      closeLifeDropdown()
      return
    }

    setLifeDropdownPosition(getActionDropdownPosition(event.currentTarget))
    setIsLifeDropdownReady(false)
    setShowLifeDropdown(true)
  }, [closeAnimDropdown, closeCleanStrip, closeDailyDropdown, closeFeedStrip, closeHealStrip, closeLifeDropdown, closeTaskDropdown, closeTaskStrip, getActionDropdownPosition, pinActionButtons, showLifeDropdown])

  const handleToggleTaskDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    closeFeedStrip()
    closeCleanStrip()
    closeHealStrip()
    closeTaskStrip()
    closeAnimDropdown()
    closeDailyDropdown()
    closeLifeDropdown()
    pinActionButtons()

    if (showTaskDropdown) {
      closeTaskDropdown()
      return
    }

    setTaskDropdownPosition(getActionDropdownPosition(event.currentTarget))
    setIsTaskDropdownReady(false)
    setShowTaskDropdown(true)
  }, [
    closeAnimDropdown,
    closeCleanStrip,
    closeDailyDropdown,
    closeFeedStrip,
    closeHealStrip,
    closeLifeDropdown,
    closeTaskDropdown,
    closeTaskStrip,
    getActionDropdownPosition,
    pinActionButtons,
    showTaskDropdown,
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


  const feedStripItems: ScrollStripItem[] = useMemo(() => (
    ORIGINAL_FOOD_ITEMS.map((item, index) => ({
      id: item.id,
      imageSrc: resolveRendererAssetUrl(item.iconPath),
      imageAlt: item.name,
      label: item.name,
      description: formatOriginalItemDescription(item),
      accent: dropdownAccentColors[index % dropdownAccentColors.length],
      onSelect: () => {
        closeFeedStrip()
        runTimedInteraction({
          perform: feed,
          swfPath: item.swfPath,
          animationId: item.id,
          penguinAction: 'eat',
          baseDuration: 1400,
        })
      },
    }))
  ), [closeFeedStrip, feed, runTimedInteraction])

  const cleanStripItems: ScrollStripItem[] = useMemo(() => (
    ORIGINAL_CLEAN_ITEMS.map((item, index) => ({
      id: item.id,
      imageSrc: resolveRendererAssetUrl(item.iconPath),
      imageAlt: item.name,
      label: item.name,
      description: formatOriginalItemDescription(item),
      accent: dropdownAccentColors[(index + 1) % dropdownAccentColors.length],
      onSelect: () => {
        closeCleanStrip()
        runTimedInteraction({
          perform: clean,
          swfPath: item.swfPath,
          animationId: item.id,
          penguinAction: 'bathe',
          baseDuration: 1600,
        })
      },
    }))
  ), [clean, closeCleanStrip, runTimedInteraction])

  const healStripItems: ScrollStripItem[] = useMemo(() => (
    ORIGINAL_HEAL_ITEMS.map((item, index) => ({
      id: item.id,
      imageSrc: resolveRendererAssetUrl(item.iconPath),
      imageAlt: item.name,
      label: item.name,
      description: formatOriginalItemDescription(item),
      accent: dropdownAccentColors[(index + 2) % dropdownAccentColors.length],
      onSelect: () => {
        closeHealStrip()
        runTimedInteraction({
          perform: heal,
          swfPath: item.swfPath,
          animationId: item.id,
          penguinAction: 'happy',
          baseDuration: item.swfPath.includes('0241') ? 1600 : 1400,
        })
      },
    }))
  ), [closeHealStrip, heal, runTimedInteraction])

  const taskStripItems: ScrollStripItem[] = useMemo(() => {
    if (!taskStripKind) return []

    const activeGroup = taskGifts[taskStripKind]

    return activeGroup.slots.map((slot, index) => {
      const reward = getTaskGiftReward(taskStripKind, slot)
      const status = slot.isTake === 2 ? '已领取' : slot.isTake === 1 ? '可领取' : '未达成'
      const prefix = taskStripKind === 'sign' ? ('第' + slot.order + '天') : slot.seeTime
      const accent = slot.isTake === 2
        ? '#8f9aa7'
        : slot.isTake === 1
          ? dropdownAccentColors[(index + 2) % dropdownAccentColors.length]
          : '#7d6a72'

      return {
        id: `${taskStripKind}-${slot.order}`,
        icon: slot.isTake === 2 ? '领' : taskStripKind === 'sign' ? '登' : '在',
        label: taskStripKind === 'sign' ? ('第' + slot.order + '天') : ('在线' + slot.time + '分'),
        description: `${prefix}
状态: ${status}
奖励: ${formatTaskReward(reward)}`,
        accent,
        onSelect: () => {
          closeTaskStrip()
          handleClaimTaskGift(taskStripKind, index)
        },
      }
    })
  }, [closeTaskStrip, formatTaskReward, handleClaimTaskGift, taskGifts, taskStripKind])

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
        onSelect: () => window.setTimeout(() => openTaskStrip('sign'), 0),
      },
      {
        id: 'task-online',
        label: '在线送礼 ' + onlineClaimed + '/8，在线 ' + onlineDataTime + ' 分钟' + (onlineReady > 0 ? '，可领 ' + onlineReady : ''),
        icon: '时',
        accent: dropdownAccentColors[6],
        onSelect: () => window.setTimeout(() => openTaskStrip('online'), 0),
      },
    ]
  }, [onlineDataTime, openTaskStrip, taskGifts])

  const dailyMenuItems: ActionDropdownMenuItem[] = useMemo(() => ([
    {
      id: 'daily-feed',
      label: '食物',
      icon: '食',
      accent: dropdownAccentColors[0],
      onSelect: () => {
        closeDailyDropdown()
        setShowFeedStrip(true)
      },
    },
    {
      id: 'daily-clean',
      label: '清洁',
      icon: '洁',
      accent: dropdownAccentColors[1],
      onSelect: () => {
        closeDailyDropdown()
        setShowCleanStrip(true)
      },
    },
    {
      id: 'daily-heal',
      label: '治疗',
      icon: '医',
      accent: dropdownAccentColors[2],
      onSelect: () => {
        closeDailyDropdown()
        setShowHealStrip(true)
      },
    },
  ]), [closeDailyDropdown])

  const lifeMenuItems: ActionDropdownMenuItem[] = useMemo(() => ([
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
            swfPath: NEW_SWF_BASE + 'peaceful/play/P1.swf',
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
            swfPath: NEW_SWF_BASE + 'peaceful/play/P2.swf',
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
            swfPath: NEW_SWF_BASE + 'peaceful/play/P3.swf',
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
            swfPath: NEW_SWF_BASE + 'peaceful/play/P4.swf',
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
            swfPath: NEW_SWF_BASE + 'peaceful/play/P5.swf',
            animationId: '23',
            penguinAction: 'happy',
            baseDuration: 1800,
          }),
        },
      ],
    },
  ]), [petWork, runTimedInteraction, study, travel])

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
        { label: '食物', icon: '食', onClick: () => handleFeed() },
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
              onClick: () => openTaskStrip('sign'),
            },
            {
              label: '在线送礼' + (countReadyTaskGifts(taskGifts.online) > 0 ? ' 可领' : ''),
              icon: '在',
              onClick: () => openTaskStrip('online'),
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
  ]), [handleClean, handleFeed, handleHideToTray, handleOpenChat, handlePlay, handleQuit, handleRest, handleStopSwf, openSettingsSection, openTaskStrip, taskGifts])

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
            if (showAnimDropdown && animDropdownAnchorRef.current) {
              setAnimDropdownPosition(getActionDropdownPosition(animDropdownAnchorRef.current))
              setIsAnimDropdownReady(true)
            }

            if (showDailyDropdown && dailyButtonRef.current) {
              setDailyDropdownPosition(getActionDropdownPosition(dailyButtonRef.current))
              setIsDailyDropdownReady(true)
            }

            if (showLifeDropdown && lifeButtonRef.current) {
              setLifeDropdownPosition(getActionDropdownPosition(lifeButtonRef.current))
              setIsLifeDropdownReady(true)
            }

            if (showTaskDropdown) {
              setIsTaskDropdownReady(true)
            }

            if ((showFeedStrip || showCleanStrip || showHealStrip || showTaskStrip) && actionBarRef.current) {
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
    showDailyDropdown,
    showFeedStrip,
    showHealStrip,
    showLifeDropdown,
    showTaskStrip,
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
                  width={180}
                  height={180}
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
                  className="action-btn action-btn--qq action-btn--image"
                  onClick={handleToggleAnimDropdown}
                  title="动画"
                >
                  <span className="action-btn__ai-icon" aria-hidden="true">素</span>
                </button>
                <button
                  ref={dailyButtonRef}
                  className="action-btn action-btn--qq action-btn--image"
                  onClick={handleToggleDailyDropdown}
                  title="日常"
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
          title="食物"
          onClose={closeFeedStrip}
          className="feed-strip-positioned"
          style={stripPosition ?? undefined}
          meter={{
            label: '饥饿值',
            value: hunger,
            max: HUNGER_MAX,
            hint: '食物会提升饥饿值。',
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
            max: CLEANLINESS_MAX,
            hint: '清洁会提升清洁值。',
          }}
        />
      )}

      {showHealStrip && (
        <HorizontalScrollStrip
          items={healStripItems}
          title="治疗"
          onClose={closeHealStrip}
          className="feed-strip-positioned"
          style={stripPosition ?? undefined}
          meter={{
            label: '体力值',
            value: energy,
            hint: '治疗会帮助恢复体力值。',
          }}
        />
      )}

      {showTaskStrip && taskStripKind && (
        <HorizontalScrollStrip
          items={taskStripItems}
          title={taskStripKind === 'sign' ? '登录送礼' : '在线送礼'}
          onClose={closeTaskStrip}
          className="feed-strip-positioned"
          style={stripPosition ?? undefined}
          meter={taskStripKind === 'sign'
            ? {
                label: '领取进度',
                value: Math.round((countClaimedTaskGifts(taskGifts.sign) / Math.max(1, taskGifts.sign.slots.length)) * 100),
                hint: '点击礼物即可尝试领取当前奖励。',
              }
            : {
                label: '在线进度',
                value: Math.min(100, Math.round((onlineDataTime / 220) * 100)),
                hint: '在线时长达到对应分钟后即可领取。',
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

      {showDailyDropdown && (
        <ActionDropdownMenu
          items={dailyMenuItems}
          position={dailyDropdownPosition}
          ready={isDailyDropdownReady}
          onClose={closeDailyDropdown}
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
