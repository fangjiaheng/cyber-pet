/**
 * 宠物对话 hook
 * 定时显示闲聊、状态提醒、事件触发对话
 */

import { useEffect, useRef, useCallback } from 'react'
import { usePetStore } from '../stores/petStore'
import { getHungerMax, getCleanlinessMax } from '../stores/growthConfig'
import {
  pickDialogue,
  ENTER_DIALOGUES,
  EAT_DIALOGUES,
  CLEAN_DIALOGUES,
  LEVUP_DIALOGUES,
  SMALLTALK_DIALOGUES,
  STATE_EAT_DIALOGUES,
  STATE_CLEAN_DIALOGUES,
  STATE_OVER_WORK_DIALOGUES,
  STATE_OVER_STUDY_DIALOGUES,
} from '../../shared/communication'

interface UsePetDialogueOptions {
  /** 设置气泡文案 */
  setBubbleText: (text: string) => void
  /** 闲聊间隔（毫秒），默认 4 分钟 */
  chatInterval?: number
}

export function usePetDialogue({ setBubbleText, chatInterval = 4 * 60 * 1000 }: UsePetDialogueOptions) {
  const ownerName = usePetStore((s) => s.profile.ownerName)
  const level = usePetStore((s) => s.level)

  const hasShownEnter = useRef(false)
  const lastLevel = useRef(level)
  const chatTimerRef = useRef<number | null>(null)

  // 启动时显示一条进入对话
  useEffect(() => {
    if (hasShownEnter.current) return
    hasShownEnter.current = true
    const timer = window.setTimeout(() => {
      const d = pickDialogue(ENTER_DIALOGUES, ownerName)
      setBubbleText(d.tolk)
    }, 2000) // 延迟 2s 等动画播完
    return () => window.clearTimeout(timer)
  }, [ownerName, setBubbleText])

  // 定时闲聊
  useEffect(() => {
    const tick = () => {
      const state = usePetStore.getState()
      const hungerMax = getHungerMax(state.level)
      const cleanMax = getCleanlinessMax(state.level)
      const name = state.profile.ownerName

      // 优先级：饥饿提醒 > 脏乱提醒 > 随机闲聊
      if (state.hunger < hungerMax * 0.25) {
        const d = pickDialogue(STATE_EAT_DIALOGUES, name)
        setBubbleText(d.tolk)
      } else if (state.cleanliness < cleanMax * 0.25) {
        const d = pickDialogue(STATE_CLEAN_DIALOGUES, name)
        setBubbleText(d.tolk)
      } else {
        const d = pickDialogue(SMALLTALK_DIALOGUES, name)
        setBubbleText(d.tolk)
      }
    }

    chatTimerRef.current = window.setInterval(tick, chatInterval)
    return () => {
      if (chatTimerRef.current) window.clearInterval(chatTimerRef.current)
    }
  }, [chatInterval, setBubbleText])

  // 升级时对话
  useEffect(() => {
    if (level > lastLevel.current) {
      const d = pickDialogue(LEVUP_DIALOGUES, ownerName)
      setBubbleText(d.tolk)
    }
    lastLevel.current = level
  }, [level, ownerName, setBubbleText])

  // 事件触发对话
  const showFeedDialogue = useCallback(() => {
    const d = pickDialogue(EAT_DIALOGUES, ownerName)
    setBubbleText(d.tolk)
  }, [ownerName, setBubbleText])

  const showCleanDialogue = useCallback(() => {
    const d = pickDialogue(CLEAN_DIALOGUES, ownerName)
    setBubbleText(d.tolk)
  }, [ownerName, setBubbleText])

  const showWorkCompleteDialogue = useCallback(() => {
    const d = pickDialogue(STATE_OVER_WORK_DIALOGUES, ownerName)
    setBubbleText(d.tolk)
  }, [ownerName, setBubbleText])

  const showStudyCompleteDialogue = useCallback(() => {
    const d = pickDialogue(STATE_OVER_STUDY_DIALOGUES, ownerName)
    setBubbleText(d.tolk)
  }, [ownerName, setBubbleText])

  return {
    showFeedDialogue,
    showCleanDialogue,
    showWorkCompleteDialogue,
    showStudyCompleteDialogue,
  }
}
