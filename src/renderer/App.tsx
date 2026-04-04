import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import './ChatPanel.css'
import chongwuIcon from './assets/toolbar/qq-chongwu.png'
import gonggaoIcon from './assets/toolbar/qq-gonggao.png'
import richangIcon from './assets/toolbar/qq-richang.png'
import menuIconFood from '/assets/1.2.4source/control/icons/richang.png'
import menuIconClean from '/assets/1.2.4source/control/icons/qingjie.png'
import menuIconHeal from '/assets/1.2.4source/control/icons/zhibing.png'
import menuIconStudy from '/assets/1.2.4source/control/icons/xuexi.png'
import menuIconWork from '/assets/1.2.4source/control/icons/dagong.png'
import menuIconTravel from '/assets/1.2.4source/control/icons/lvyou.png'
import menuIconTask from '/assets/1.2.4source/control/icons/renwu.png'
import { usePetStore } from './stores/petStore'
import { useInventoryStore } from './stores/inventoryStore'
import { useActivityStore } from './stores/activitySystem'
import { getItemById, UNIVERSAL_MEDICINES } from '../shared/itemCatalog'
import { getCurrentDiseaseInfo, applyMedicine } from './stores/diseaseSystem'
import { getHungerMax, getCleanlinessMax, MOOD_MAX, HEALTH_MAX } from './stores/growthConfig'
import { useShallow } from 'zustand/react/shallow'
import { usePetDecay } from './hooks/usePetDecay'
import { usePetDialogue } from './hooks/usePetDialogue'
import { ActionDropdownMenu, ActionDropdownMenuItem } from './components/ActionDropdownMenu'
import HorizontalScrollStrip, { ScrollStripItem } from './components/HorizontalScrollStrip'
import { ContextMenu, MenuItem } from './components/ContextMenu'
import { Toast } from './components/Toast'
import { PetBubble } from './components/PetBubble'
import { RufflePlayer } from './components/RufflePlayer'
import { PlayerSwfProbePanel } from './components/PlayerSwfProbePanel'
import { ChatWindow } from '../components/ChatWindow'
import { SettingsPanel } from './components/SettingsPanel'
import { ShopPanel } from './components/ShopPanel'
import { WorkPanel } from './components/WorkPanel'
import { StudyPanel } from './components/StudyPanel'
import { InfoCardPanel } from './components/InfoCardPanel'
import { StateInfoPanel } from './components/StateInfoPanel'
import { InventoryPanel } from './components/InventoryPanel'
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
import { getPetAnchorOffset, type PetWindowLayoutMode } from '@shared/petWindowLayout'
import { swfCategories } from './swfData'
import { buildLoadlistsPlaylist, ENTER_PLAYLIST, IDLE_SWF_PATH, getStageIdlePath, getStageEnterPlaylist, getStageHidePath } from './utils/swfPlaylist'
import { getGrowthStage, getMoodAppearance, type GrowthStage } from './stores/growthConfig'
import { getTransitionSwfPath, getRandomPlaySwfPath } from './utils/stageSwfResolver'
// stageSwfResolver 的直接引用将在后续 Phase 中启用
// import { getActionSwfPath, toPlaylistPath } from './utils/stageSwfResolver'
import {
  countClaimedTaskGifts,
  countReadyTaskGifts,
  getTaskGiftReward,
  typeKeyToIconPath,
  type TaskGiftKind,
  type TaskGiftReward,
} from '../shared/taskGift'

const BADGE_CLAIMED = 'assets/1.2.4source/tip/gift/60.svg'
const BADGE_CLAIMABLE = 'assets/1.2.4source/tip/gift/61.svg'
const CHAT_FUNCTION_ICON = '/assets/chat.png'

type PenguinAction =
  | 'idle' | 'walk' | 'run' | 'sit' | 'sleep'
  | 'eat' | 'bathe' | 'play' | 'work'
  | 'happy' | 'sad' | 'angry'

type ActivePanel = 'chat' | 'settings' | 'probe' | 'shop' | 'work' | 'study' | 'info' | 'state' | 'inventory' | null
type SettingsSection = 'ai' | 'profile' | 'about'
type WindowMode = 'pet' | 'chat' | 'settings' | 'probe' | 'shop' | 'work' | 'study' | 'info' | 'state' | 'inventory' | 'context-menu' | 'action-dropdown' | 'bubble'
type PlayerCommand = {
  playlist: string
  token: number
}
type WindowPosition = {
  x: number
  y: number
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
    mood,
    level,
    profile,
    yuanbao,
    currentEmotion,
    onlineDataTime,
    taskGifts,
    travel,
    feedWithItem,
    cleanWithItem,
    healWithItem,
    claimTaskGift,
    ensureTaskGiftState,
    health,
    diseaseState,
    cancelCurrentAction,
  } = usePetStore(useShallow((state) => ({
    hunger: state.hunger,
    cleanliness: state.cleanliness,
    energy: state.energy,
    mood: state.mood,
    health: state.health,
    level: state.level,
    profile: state.profile,
    yuanbao: state.yuanbao,
    currentEmotion: state.currentEmotion,
    onlineDataTime: state.onlineDataTime,
    taskGifts: state.taskGifts,
    travel: state.travel,
    feedWithItem: state.feedWithItem,
    cleanWithItem: state.cleanWithItem,
    healWithItem: state.healWithItem,
    diseaseState: state.diseaseState,
    claimTaskGift: state.claimTaskGift,
    ensureTaskGiftState: state.ensureTaskGiftState,
    cancelCurrentAction: state.cancelCurrentAction,
  })))

  const { removeItem, getItemCount } = useInventoryStore()

  usePetDecay()

  // 托盘图标状态同步
  useEffect(() => {
    if (!window.electronAPI?.updateTrayIcon) return
    const active = useActivityStore.getState().active
    let trayState = 'normal'
    if (health === 0) trayState = 'dead'
    else if (diseaseState.activeDisease) trayState = 'ill'
    else if (active?.type === 'work') trayState = 'work'
    else if (active?.type === 'study') trayState = 'study'
    else if (active?.type === 'travel') trayState = 'travel'
    else if (hunger < 720) trayState = 'hungry'
    else if (cleanliness < 1080) trayState = 'dirty'
    window.electronAPI.updateTrayIcon(trayState)
  }, [hunger, cleanliness, health, diseaseState])

  // 成长阶段和心情外观
  const growthStage = getGrowthStage(level)
  const moodAppearance = getMoodAppearance(mood)
  const currentIdlePath = getStageIdlePath(growthStage, moodAppearance)
  const currentEnterPlaylist = getStageEnterPlaylist(growthStage, moodAppearance)

  const isDragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const hideActionsTimer = useRef<number | null>(null)
  const actionResetTimer = useRef<number | null>(null)
  const actionSequence = useRef(0)
  const idlePlayTimer = useRef<number | null>(null)
  const chatHeaderRef = useRef<HTMLDivElement | null>(null)
  const penguinWrapperRef = useRef<HTMLDivElement | null>(null)
  const actionBarRef = useRef<HTMLDivElement | null>(null)
  const animDropdownAnchorRef = useRef<HTMLButtonElement | null>(null)
  const dailyButtonRef = useRef<HTMLButtonElement | null>(null)
  const lifeButtonRef = useRef<HTMLButtonElement | null>(null)
  const taskButtonRef = useRef<HTMLButtonElement | null>(null)
  const windowLayoutModeRef = useRef<WindowMode>('pet')
  const petWindowPositionBeforeChatRef = useRef<WindowPosition | null>(null)

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('ai')
  const [penguinAction, setPenguinAction] = useState<PenguinAction>('idle')
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const { showFeedDialogue, showCleanDialogue } = usePetDialogue({ setBubbleText })
  const [showFeedStrip, setShowFeedStrip] = useState(false)
  const [showCleanStrip, setShowCleanStrip] = useState(false)
  const [showHealStrip, setShowHealStrip] = useState(false)
  const [showStudyStrip, setShowStudyStrip] = useState(false)
  const [showWorkStrip, setShowWorkStrip] = useState(false)
  const [showTravelStrip, setShowTravelStrip] = useState(false)
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
  const showShop = activePanel === 'shop'
  const isContextMenuOpen = contextMenu !== null
  const showTaskStrip = taskStripKind !== null
  const isActionDropdownOpen = showAnimDropdown || showDailyDropdown || showLifeDropdown || showTaskDropdown || showFeedStrip || showCleanStrip || showHealStrip || showStudyStrip || showWorkStrip || showTravelStrip || showTaskStrip
  const isBubbleOpen = bubbleText !== null

  useEffect(() => {
    initializeAI()
  }, [])

  useEffect(() => {
    const loadPetState = async () => {
      try {
        await usePetStore.getState().loadFromStorage()
      } catch (error) {
        console.error('❌ 加载宠物状态失败:', error)
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
        console.error('❌ 加载窗口设置失败:', error)
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
    playPlaylist(buildLoadlistsPlaylist(swfPath, {
      ...options,
      idlePath: options?.idlePath ?? currentIdlePath,
    }))
  }, [currentIdlePath, playPlaylist])

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
      playPlaylist(currentIdlePath)
    }
  }, [cancelCurrentAction, clearActionResetTimer, currentIdlePath, playPlaylist])

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

  // 入场动画：数据加载后播放对应阶段的入场动画
  const hasPlayedEnter = useRef(false)
  const enterPlaylistRef = useRef(currentEnterPlaylist)
  enterPlaylistRef.current = currentEnterPlaylist
  useEffect(() => {
    if (hasPlayedEnter.current) return

    // 延迟播放，确保 storage 数据已加载并更新了 enterPlaylistRef
    const enterTimer = window.setTimeout(() => {
      if (hasPlayedEnter.current) return
      hasPlayedEnter.current = true
      playPlaylist(enterPlaylistRef.current)
    }, 1500)

    return () => {
      window.clearTimeout(enterTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 阶段转变动画
  const prevStageRef = useRef<GrowthStage>(growthStage)
  useEffect(() => {
    const prevStage = prevStageRef.current
    if (prevStage !== growthStage) {
      const transitionSwf = getTransitionSwfPath(prevStage, growthStage)
      if (transitionSwf) {
        playSwfPath(transitionSwf, { animationId: `transition-${prevStage}-${growthStage}` })
        // 过渡动画播完后切到新阶段的待机
        window.setTimeout(() => {
          playPlaylist(currentIdlePath)
        }, 3000)
      }
      prevStageRef.current = growthStage
    }
  }, [growthStage, currentIdlePath, playSwfPath, playPlaylist])

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

  const isAnchoredPetMode = useCallback((mode: WindowMode): mode is PetWindowLayoutMode => {
    return mode === 'pet' || mode === 'bubble' || mode === 'action-dropdown' || mode === 'context-menu' || mode === 'chat'
  }, [])

  const resolvePetWindowPosition = useCallback((mode: WindowMode, position: WindowPosition) => {
    if (!isAnchoredPetMode(mode)) return null

    const toPetOffset = getPetAnchorOffset(mode, 'pet')
    return {
      x: position.x + toPetOffset.x,
      y: position.y + toPetOffset.y,
    }
  }, [isAnchoredPetMode])

  const resizeWindowForMode = useCallback(async (mode: WindowMode) => {
    if (!window.electronAPI?.resizeWindow) return
    const currentMode = windowLayoutModeRef.current

    if (mode === 'chat') {
      const [currentX, currentY] = await window.electronAPI.getWindowPosition()
      const currentPosition = { x: currentX, y: currentY }
      const petPosition = resolvePetWindowPosition(currentMode, currentPosition)

      if (petPosition) {
        petWindowPositionBeforeChatRef.current = petPosition
      }

      const openFromPetOffset = getPetAnchorOffset('pet', 'chat')
      const offsetX = petPosition
        ? petPosition.x + openFromPetOffset.x - currentX
        : openFromPetOffset.x
      const offsetY = petPosition
        ? petPosition.y + openFromPetOffset.y - currentY
        : openFromPetOffset.y

      window.electronAPI.resizeWindow(CHAT_WINDOW_WIDTH, CHAT_WINDOW_HEIGHT, {
        fitToScreen: true,
        offsetX,
        offsetY,
      })
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
      // 宠物和气泡使用相同窗口大小，无需调整
      windowLayoutModeRef.current = mode
      return
    }

    if (mode === 'settings' || mode === 'shop' || mode === 'work' || mode === 'study' || mode === 'info' || mode === 'state' || mode === 'inventory') {
      window.electronAPI.resizeWindow(SETTINGS_WINDOW_WIDTH, SETTINGS_WINDOW_HEIGHT, { fitToScreen: true })
      windowLayoutModeRef.current = mode
      return
    }

    if (mode === 'context-menu') {
      window.electronAPI.resizeWindow(CONTEXT_MENU_WINDOW_WIDTH, CONTEXT_MENU_WINDOW_HEIGHT)
      windowLayoutModeRef.current = mode
      return
    }

    // 宠物模式 - 恢复默认大小
    if (currentMode === 'chat' && petWindowPositionBeforeChatRef.current) {
      const [currentX, currentY] = await window.electronAPI.getWindowPosition()
      const { x, y } = petWindowPositionBeforeChatRef.current

      window.electronAPI.resizeWindow(PET_WINDOW_WIDTH, PET_WINDOW_HEIGHT, {
        offsetX: x - currentX,
        offsetY: y - currentY,
      })
      petWindowPositionBeforeChatRef.current = null
      windowLayoutModeRef.current = mode
      return
    }

    window.electronAPI.resizeWindow(PET_WINDOW_WIDTH, PET_WINDOW_HEIGHT)
    petWindowPositionBeforeChatRef.current = null
    windowLayoutModeRef.current = mode
  }, [isAnchoredPetMode, resolvePetWindowPosition])

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
      reward.yuanbao > 0 ? '元宝 +' + reward.yuanbao : null,
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

  const closeStudyStrip = useCallback(() => {
    setShowStudyStrip(false)
    setStripPosition(null)
  }, [])

  const closeWorkStrip = useCallback(() => {
    setShowWorkStrip(false)
    setStripPosition(null)
  }, [])

  const closeTravelStrip = useCallback(() => {
    setShowTravelStrip(false)
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
    closeStudyStrip()
    closeWorkStrip()
    closeTravelStrip()
    closeTaskStrip()
    closeAnimDropdown()
    closeDailyDropdown()
    closeLifeDropdown()
    closeTaskDropdown()
    setShowActions(false)
  }, [closeAnimDropdown, closeCleanStrip, closeContextMenu, closeDailyDropdown, closeFeedStrip, closeHealStrip, closeLifeDropdown, closeStudyStrip, closeTaskDropdown, closeTaskStrip, closeTravelStrip, closeWorkStrip])

  const openTaskStrip = useCallback((kind: TaskGiftKind) => {
    closeTaskDropdown()
    closeFeedStrip()
    closeCleanStrip()
    closeHealStrip()
    closeStudyStrip()
    closeWorkStrip()
    closeTravelStrip()
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
    closeStudyStrip()
    closeWorkStrip()
    closeTravelStrip()
    pinActionButtons()
    setShowFeedStrip((current) => !current)
  }, [closeAnimDropdown, closeCleanStrip, closeDailyDropdown, closeHealStrip, closeLifeDropdown, closeStudyStrip, closeTaskDropdown, closeTaskStrip, closeTravelStrip, closeWorkStrip, pinActionButtons])

  const handleClean = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation()
    closeAnimDropdown()
    closeDailyDropdown()
    closeLifeDropdown()
    closeTaskDropdown()
    closeTaskStrip()
    closeFeedStrip()
    closeHealStrip()
    closeStudyStrip()
    closeWorkStrip()
    closeTravelStrip()
    pinActionButtons()
    setShowCleanStrip((current) => !current)
  }, [closeAnimDropdown, closeFeedStrip, closeDailyDropdown, closeHealStrip, closeLifeDropdown, closeStudyStrip, closeTaskDropdown, closeTaskStrip, closeTravelStrip, closeWorkStrip, pinActionButtons])

  const handleHeal = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation()
    closeAnimDropdown()
    closeDailyDropdown()
    closeLifeDropdown()
    closeTaskDropdown()
    closeTaskStrip()
    closeFeedStrip()
    closeCleanStrip()
    closeStudyStrip()
    closeWorkStrip()
    closeTravelStrip()
    pinActionButtons()
    setShowHealStrip((current) => !current)
  }, [closeAnimDropdown, closeCleanStrip, closeDailyDropdown, closeFeedStrip, closeLifeDropdown, closeStudyStrip, closeTaskDropdown, closeTaskStrip, closeTravelStrip, closeWorkStrip, pinActionButtons])

  const handleToggleAnimDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    animDropdownAnchorRef.current = event.currentTarget
    closeFeedStrip()
    closeCleanStrip()
    closeHealStrip()
    closeStudyStrip()
    closeWorkStrip()
    closeTravelStrip()
    closeTaskStrip()
    closeDailyDropdown()
    closeLifeDropdown()
    closeTaskDropdown()
    pinActionButtons()

    setAnimDropdownPosition(getActionDropdownPosition(event.currentTarget))
    setIsAnimDropdownReady(false)
    setShowAnimDropdown(true)
  }, [closeAnimDropdown, closeCleanStrip, closeDailyDropdown, closeFeedStrip, closeHealStrip, closeLifeDropdown, closeStudyStrip, closeTaskDropdown, closeTaskStrip, closeTravelStrip, closeWorkStrip, getActionDropdownPosition, pinActionButtons])

  const handleToggleDailyDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    closeFeedStrip()
    closeCleanStrip()
    closeHealStrip()
    closeStudyStrip()
    closeWorkStrip()
    closeTravelStrip()
    closeTaskStrip()
    closeAnimDropdown()
    closeLifeDropdown()
    closeTaskDropdown()
    pinActionButtons()

    setDailyDropdownPosition(getActionDropdownPosition(event.currentTarget))
    setIsDailyDropdownReady(false)
    setShowDailyDropdown(true)
  }, [closeAnimDropdown, closeCleanStrip, closeDailyDropdown, closeFeedStrip, closeHealStrip, closeLifeDropdown, closeStudyStrip, closeTaskDropdown, closeTaskStrip, closeTravelStrip, closeWorkStrip, getActionDropdownPosition, pinActionButtons])

  const handleToggleLifeDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    closeFeedStrip()
    closeCleanStrip()
    closeHealStrip()
    closeStudyStrip()
    closeWorkStrip()
    closeTravelStrip()
    closeTaskStrip()
    closeAnimDropdown()
    closeDailyDropdown()
    closeTaskDropdown()
    pinActionButtons()

    setLifeDropdownPosition(getActionDropdownPosition(event.currentTarget))
    setIsLifeDropdownReady(false)
    setShowLifeDropdown(true)
  }, [closeAnimDropdown, closeCleanStrip, closeDailyDropdown, closeFeedStrip, closeHealStrip, closeLifeDropdown, closeStudyStrip, closeTaskDropdown, closeTaskStrip, closeTravelStrip, closeWorkStrip, getActionDropdownPosition, pinActionButtons])

  const handleToggleTaskDropdown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    closeFeedStrip()
    closeCleanStrip()
    closeHealStrip()
    closeStudyStrip()
    closeWorkStrip()
    closeTravelStrip()
    closeTaskStrip()
    closeAnimDropdown()
    closeDailyDropdown()
    closeLifeDropdown()
    pinActionButtons()

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
    closeStudyStrip,
    closeTaskDropdown,
    closeTaskStrip,
    closeTravelStrip,
    closeWorkStrip,
    getActionDropdownPosition,
    pinActionButtons,
  ])

  const handleOpenChat = useCallback((event?: React.MouseEvent) => {
    event?.stopPropagation()
    openPanel('chat')
  }, [openPanel])

  const handleHideToTray = useCallback(() => {
    // 播放对应阶段的隐藏动画，动画结束后再隐藏到托盘
    const hidePath = getStageHidePath(growthStage, moodAppearance)
    playPlaylist(hidePath)
    window.setTimeout(() => {
      window.electronAPI?.hideToTray?.()
    }, 2500)
  }, [growthStage, moodAppearance, playPlaylist])

  const handleQuit = useCallback(() => {
    // 播放对应阶段的隐藏动画，动画结束后再关闭窗口
    const hidePath = getStageHidePath(growthStage, moodAppearance)
    playPlaylist(hidePath)
    window.setTimeout(() => {
      window.electronAPI?.closeWindow?.()
    }, 2500)
  }, [growthStage, moodAppearance, playPlaylist])

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
    ORIGINAL_FOOD_ITEMS.map((item, index) => {
      const catalogItem = getItemById(item.id)
      const count = getItemCount(item.id)
      return {
        id: item.id,
        imageSrc: resolveRendererAssetUrl(item.iconPath),
        imageAlt: item.name,
        label: `${item.name}${count > 0 ? ` ×${count}` : ''}`,
        description: formatOriginalItemDescription(item),
        accent: dropdownAccentColors[index % dropdownAccentColors.length],
        disabled: count <= 0,
        onSelect: () => {
          if (!removeItem(item.id)) {
            setBubbleText('没有这个物品了，去商店买吧~')
            return
          }
          closeFeedStrip()
          const effects = catalogItem || item
          runTimedInteraction({
            perform: () => feedWithItem({
              starve: effects.starve || 0,
              charm: effects.charm,
              intel: effects.intel,
              strong: effects.strong,
            }),
            swfPath: item.swfPath,
            animationId: item.id,
            penguinAction: 'eat',
            baseDuration: 1400,
          })
          setTimeout(showFeedDialogue, 1800)
        },
      }
    })
  ), [closeFeedStrip, feedWithItem, runTimedInteraction, removeItem, getItemCount, showFeedDialogue])

  const cleanStripItems: ScrollStripItem[] = useMemo(() => (
    ORIGINAL_CLEAN_ITEMS.map((item, index) => {
      const catalogItem = getItemById(item.id)
      const count = getItemCount(item.id)
      return {
        id: item.id,
        imageSrc: resolveRendererAssetUrl(item.iconPath),
        imageAlt: item.name,
        label: `${item.name}${count > 0 ? ` ×${count}` : ''}`,
        description: formatOriginalItemDescription(item),
        accent: dropdownAccentColors[(index + 1) % dropdownAccentColors.length],
        disabled: count <= 0,
        onSelect: () => {
          if (!removeItem(item.id)) {
            setBubbleText('没有这个物品了，去商店买吧~')
            return
          }
          closeCleanStrip()
          const effects = catalogItem || item
          runTimedInteraction({
            perform: () => cleanWithItem({
              clean: effects.clean || 0,
              charm: effects.charm,
              intel: effects.intel,
              strong: effects.strong,
            }),
            swfPath: item.swfPath,
            animationId: item.id,
            penguinAction: 'bathe',
            baseDuration: 1600,
          })
          setTimeout(showCleanDialogue, 2000)
        },
      }
    })
  ), [cleanWithItem, closeCleanStrip, runTimedInteraction, removeItem, getItemCount, showCleanDialogue])

  const healStripItems: ScrollStripItem[] = useMemo(() => {
    const diseaseInfo = getCurrentDiseaseInfo(diseaseState)
    const neededMedicineId = diseaseInfo?.medicineId ?? null

    return ORIGINAL_HEAL_ITEMS.map((item, index) => {
      const catalogItem = getItemById(item.id)
      const count = getItemCount(item.id)
      const isNeeded = neededMedicineId === item.id
      const isUniversal = UNIVERSAL_MEDICINES.includes(item.id)
      const isUseful = !diseaseInfo || isNeeded || isUniversal

      // 生病时标注对症药品
      let label = item.name
      if (count > 0) label += ` ×${count}`
      if (isNeeded && diseaseInfo) label += ' ★对症'

      return {
        id: item.id,
        imageSrc: resolveRendererAssetUrl(item.iconPath),
        imageAlt: item.name,
        label,
        description: diseaseInfo && !isUseful
          ? `当前需要：${getItemById(neededMedicineId!)?.name ?? '对症药品'}`
          : formatOriginalItemDescription(item),
        accent: isNeeded ? '#ff9ab6' : dropdownAccentColors[(index + 2) % dropdownAccentColors.length],
        disabled: count <= 0,
        onSelect: () => {
          if (!removeItem(item.id)) {
            setBubbleText('没有这个物品了，去商店买吧~')
            return
          }
          closeHealStrip()

          // 尝试治疗疾病
          if (diseaseInfo) {
            const result = applyMedicine(diseaseState, item.id)
            if (result.wrongMedicine) {
              setBubbleText(`这个药不对症，我需要的是${getItemById(neededMedicineId!)?.name ?? '对症药品'}~`)
            } else if (result.cured) {
              setBubbleText('我痊愈啦！谢谢主人~')
              usePetStore.setState({ diseaseState: result.state, health: 5 })
            } else {
              const newInfo = getCurrentDiseaseInfo(result.state)
              setBubbleText(newInfo ? `好了一些，但还有${newInfo.name}...` : '感觉好多了~')
              usePetStore.setState({ diseaseState: result.state })
            }
          }

          const effects = catalogItem || item
          runTimedInteraction({
            perform: () => healWithItem({
              starve: effects.starve,
              clean: effects.clean,
              strong: effects.strong,
            }),
            swfPath: item.swfPath,
            animationId: item.id,
            penguinAction: 'happy',
            baseDuration: item.swfPath.includes('0241') ? 1600 : 1400,
          })
        },
      }
    })
  }, [closeHealStrip, healWithItem, runTimedInteraction, removeItem, getItemCount, diseaseState])

  // 学习活动 strip 数据 — 现在打开学习面板
  const studyStripItems: ScrollStripItem[] = useMemo(() => ([
    {
      id: 'study-panel',
      icon: '学',
      label: '进入学习',
      description: '打开学习面板，选择科目和学校',
      accent: dropdownAccentColors[3],
      onSelect: () => {
        closeStudyStrip()
        openPanel('study')
      },
    },
  ]), [closeStudyStrip, openPanel])

  // 打工活动 strip 数据 — 现在打开打工面板
  const workStripItems: ScrollStripItem[] = useMemo(() => ([
    {
      id: 'work-panel',
      icon: '工',
      label: '进入打工',
      description: '打开工作面板，选择工种',
      accent: dropdownAccentColors[4],
      onSelect: () => {
        closeWorkStrip()
        openPanel('work')
      },
    },
  ]), [closeWorkStrip, openPanel])

  // 旅行活动 strip 数据
  const travelStripItems: ScrollStripItem[] = useMemo(() => {
    const isBusy = useActivityStore.getState().isActive()
    const destinations = [
      { id: 'travel-park', icon: '园', name: '公园', desc: '心情+150 魅力+5', time: 20, mood: 150, charm: 5, starve: 200, clean: 100 },
      { id: 'travel-beach', icon: '海', name: '海滩', desc: '心情+200 魅力+10', time: 30, mood: 200, charm: 10, starve: 300, clean: 200 },
      { id: 'travel-mountain', icon: '山', name: '登山', desc: '心情+250 武力+10', time: 45, mood: 250, strong: 10, starve: 400, clean: 300 },
      { id: 'travel-library', icon: '馆', name: '图书馆', desc: '心情+100 智力+15', time: 25, mood: 100, intel: 15, starve: 150, clean: 50 },
    ]
    return destinations.map((dest) => ({
      id: dest.id,
      icon: dest.icon,
      label: dest.name,
      description: dest.desc + ` (${dest.time}分钟)`,
      accent: dropdownAccentColors[5],
      disabled: isBusy,
      onSelect: () => {
        closeTravelStrip()
        const actStore = useActivityStore.getState()
        if (actStore.isActive()) {
          setBubbleText('正在忙碌中，不能出发~')
          return
        }
        const now = Date.now()
        actStore.active = null // 确保清空
        useActivityStore.setState({
          active: {
            type: 'travel',
            id: dest.id,
            name: `去${dest.name}旅行`,
            startTime: now,
            endTime: now + dest.time * 60 * 1000,
            rewards: { charm: dest.charm || 0, intel: dest.intel || 0, strong: dest.strong || 0 },
            costs: { starve: dest.starve, clean: dest.clean, mood: -(dest.mood) },
          },
        })
        setBubbleText(`出发去${dest.name}啦~`)
        // 播放离开动画
        runTimedInteraction({
          perform: travel,
          swfPath: NEW_SWF_BASE + 'peaceful/play/P5.swf',
          animationId: dest.id,
          penguinAction: 'happy',
          baseDuration: 1800,
        })
      },
    }))
  }, [closeTravelStrip, runTimedInteraction, travel])

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

      const badgePath = slot.isTake === 2
        ? BADGE_CLAIMED
        : slot.isTake === 1
          ? BADGE_CLAIMABLE
          : undefined

      return {
        id: `${taskStripKind}-${slot.order}`,
        imageSrc: resolveRendererAssetUrl(typeKeyToIconPath(slot.typeKey)),
        imageAlt: slot.typeKey,
        badgeSrc: badgePath ? resolveRendererAssetUrl(badgePath) : undefined,
        badgeAlt: status,
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
        label: '登录送礼 ',
        icon: <img src={menuIconTask} alt="登录送礼" />,
        accent: dropdownAccentColors[5],
        onSelect: () => window.setTimeout(() => openTaskStrip('sign'), 0),
      },
      {
        id: 'task-online',
        label: '在线送礼 ',
        icon: <img src={menuIconTask} alt="在线送礼" />,
        accent: dropdownAccentColors[6],
        onSelect: () => window.setTimeout(() => openTaskStrip('online'), 0),
      },
    ]
  }, [onlineDataTime, openTaskStrip, taskGifts])

  const dailyMenuItems: ActionDropdownMenuItem[] = useMemo(() => ([
    {
      id: 'daily-feed',
      label: '食物',
      icon: <img src={menuIconFood} alt="食物" />,
      accent: dropdownAccentColors[0],
      onSelect: () => {
        closeDailyDropdown()
        setShowFeedStrip(true)
      },
    },
    {
      id: 'daily-clean',
      label: '清洁',
      icon: <img src={menuIconClean} alt="清洁" />,
      accent: dropdownAccentColors[1],
      onSelect: () => {
        closeDailyDropdown()
        setShowCleanStrip(true)
      },
    },
    {
      id: 'daily-heal',
      label: '治疗',
      icon: <img src={menuIconHeal} alt="治疗" />,
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
      icon: <img src={menuIconStudy} alt="学习" />,
      accent: dropdownAccentColors[3],
      onSelect: () => {
        closeLifeDropdown()
        setShowStudyStrip(true)
      },
    },
    {
      id: 'work',
      label: '打工',
      icon: <img src={menuIconWork} alt="打工" />,
      accent: dropdownAccentColors[4],
      onSelect: () => {
        closeLifeDropdown()
        setShowWorkStrip(true)
      },
    },
    {
      id: 'travel',
      label: '旅行',
      icon: <img src={menuIconTravel} alt="旅行" />,
      accent: dropdownAccentColors[5],
      onSelect: () => {
        closeLifeDropdown()
        setShowTravelStrip(true)
      },
    },
  ]), [closeLifeDropdown])

  const menuItems: MenuItem[] = useMemo(() => ([
    {
      label: 'AI 助手',
      onClick: () => { },
      children: [
        { label: '打开聊天', onClick: () => handleOpenChat() },
        { label: 'AI 设置', onClick: () => openSettingsSection('ai') },
      ],
    },
    {
      label: '宠物互动',
      onClick: () => { },
      children: [
        { label: '食物', onClick: () => handleFeed() },
        { label: '清洁', onClick: () => handleClean() },
        { label: '治疗', onClick: () => handleHeal() },
      ],
    },
    {
      label: '商城',
      onClick: () => openPanel('shop'),
    },
    {
      label: '宠物信息',
      onClick: () => { },
      children: [
        { label: '宠物资料', onClick: () => openPanel('info') },
        { label: '宠物状态', onClick: () => openPanel('state') },
        { label: '背包', onClick: () => openPanel('inventory') },
      ],
    },
    {
      label: '设置',
      onClick: () => openSettingsSection('profile'),
    },
    { divider: true, label: '', onClick: () => { } },
    {
      label: '隐藏宠物',
      onClick: handleHideToTray,
    },
    {
      label: '退出宠物',
      onClick: handleQuit,
    },
  ]), [handleClean, handleFeed, handleHeal, handleHideToTray, handleOpenChat, handleQuit, handleStopSwf, openPanel, openSettingsSection])

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

  // 站立状态下定时播放随机玩耍动画
  useEffect(() => {
    if (idlePlayTimer.current) {
      window.clearTimeout(idlePlayTimer.current)
      idlePlayTimer.current = null
    }

    if (penguinAction !== 'idle') return

    // 随机间隔 60~90 秒播放一次，避免过度打扰用户
    const delay = 60_000 + Math.random() * 30_000
    idlePlayTimer.current = window.setTimeout(() => {
      idlePlayTimer.current = null
      // 再次确认仍在 idle 状态
      if (penguinAction !== 'idle') return
      const playPath = getRandomPlaySwfPath(growthStage, moodAppearance)
      playSwfPath(playPath)
      scheduleReturnToIdle(3000)
    }, delay)

    return () => {
      if (idlePlayTimer.current) {
        window.clearTimeout(idlePlayTimer.current)
        idlePlayTimer.current = null
      }
    }
  }, [penguinAction, growthStage, moodAppearance, playSwfPath, scheduleReturnToIdle])

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

            if ((showFeedStrip || showCleanStrip || showHealStrip || showStudyStrip || showWorkStrip || showTravelStrip || showTaskStrip) && actionBarRef.current) {
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

    // 气泡关闭时不需要重新调整窗口，避免位置偏移
    if (windowLayoutModeRef.current === 'bubble') {
      windowLayoutModeRef.current = 'pet'
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
    showStudyStrip,
    showTaskStrip,
    showTaskDropdown,
    showTravelStrip,
    showWorkStrip,
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
                    <img className="action-btn__icon action-btn__icon--chat" src={CHAT_FUNCTION_ICON} alt="" aria-hidden="true" />
                  </button>
                  <button
                    className="action-btn action-btn--qq action-btn--image"
                    onClick={handleToggleAnimDropdown}
                    onMouseEnter={handleToggleAnimDropdown}
                    title="动画"
                  >
                    <span className="action-btn__ai-icon" aria-hidden="true">素</span>
                  </button>
                  <button
                    ref={dailyButtonRef}
                    className="action-btn action-btn--qq action-btn--image"
                    onClick={handleToggleDailyDropdown}
                    onMouseEnter={handleToggleDailyDropdown}
                    title="日常"
                  >
                    <img className="action-btn__group-image" src={richangIcon} alt="" aria-hidden="true" />
                  </button>
                  <button
                    ref={lifeButtonRef}
                    className="action-btn action-btn--qq action-btn--image"
                    onClick={handleToggleLifeDropdown}
                    onMouseEnter={handleToggleLifeDropdown}
                    title="互动"
                  >
                    <img className="action-btn__group-image" src={chongwuIcon} alt="" aria-hidden="true" />
                  </button>
                  <button
                    ref={taskButtonRef}
                    className="action-btn action-btn--qq action-btn--image"
                    onClick={handleToggleTaskDropdown}
                    onMouseEnter={handleToggleTaskDropdown}
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
            max: getHungerMax(level),
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
            max: getCleanlinessMax(level),
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
            label: '健康值',
            value: health,
            max: HEALTH_MAX,
          }}
        />
      )}

      {showStudyStrip && (
        <HorizontalScrollStrip
          items={studyStripItems}
          title="学习"
          onClose={closeStudyStrip}
          className="feed-strip-positioned"
          style={stripPosition ?? undefined}
          meter={{
            label: '智力值',
            value: profile.intelligence,
          }}
        />
      )}

      {showWorkStrip && (
        <HorizontalScrollStrip
          items={workStripItems}
          title="打工"
          onClose={closeWorkStrip}
          className="feed-strip-positioned"
          style={stripPosition ?? undefined}
          meter={{
            label: '元宝',
            value: yuanbao,
          }}
        />
      )}

      {showTravelStrip && (
        <HorizontalScrollStrip
          items={travelStripItems}
          title="旅行"
          onClose={closeTravelStrip}
          className="feed-strip-positioned"
          style={stripPosition ?? undefined}
          meter={{
            label: '心情值',
            value: mood,
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
            }
            : {
              label: '在线进度',
              value: Math.min(100, Math.round((onlineDataTime / 220) * 100)),
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
          treeLines
        />
      )}

      {showDailyDropdown && (
        <ActionDropdownMenu
          items={dailyMenuItems}
          position={dailyDropdownPosition}
          ready={isDailyDropdownReady}
          onClose={closeDailyDropdown}
          treeLines
        />
      )}

      {showTaskDropdown && (
        <ActionDropdownMenu
          items={taskDropdownItems}
          position={taskDropdownPosition}
          ready={isTaskDropdownReady}
          onClose={closeTaskDropdown}
          treeLines
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

      {showShop && (
        <ShopPanel
          onClose={() => {
            setActivePanel(null)
            resizeWindowForMode('pet')
          }}
          onNotice={(message) => setToastMessage(message)}
        />
      )}

      {activePanel === 'work' && (
        <WorkPanel
          onClose={() => {
            setActivePanel(null)
            resizeWindowForMode('pet')
          }}
          onNotice={(message) => setToastMessage(message)}
        />
      )}

      {activePanel === 'study' && (
        <StudyPanel
          onClose={() => {
            setActivePanel(null)
            resizeWindowForMode('pet')
          }}
          onNotice={(message) => setToastMessage(message)}
        />
      )}

      {activePanel === 'info' && (
        <InfoCardPanel
          onClose={() => {
            setActivePanel(null)
            resizeWindowForMode('pet')
          }}
          onNotice={(message) => setToastMessage(message)}
        />
      )}

      {activePanel === 'state' && (
        <StateInfoPanel
          onClose={() => {
            setActivePanel(null)
            resizeWindowForMode('pet')
          }}
        />
      )}

      {activePanel === 'inventory' && (
        <InventoryPanel
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
