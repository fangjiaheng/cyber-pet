import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { useWindowDrag } from '../hooks/useWindowDrag'
import { usePetStore } from '../stores/petStore'
import { useActivityStore } from '../stores/activitySystem'
import { useShallow } from 'zustand/react/shallow'
import { WORK_ENTRIES, type WorkEntry } from '../../shared/itemCatalog'
import './WorkPanel.css'

interface WorkPanelProps {
  onClose: () => void
  onNotice?: (message: string) => void
  onWorkComplete?: () => void
}

export function WorkPanel({ onClose, onNotice, onWorkComplete }: WorkPanelProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  useWindowDrag(headerRef)

  const { level, coins } = usePetStore(useShallow((s) => ({
    level: s.level,
    coins: s.coins,
  })))

  const { active, startWork, completeActivity, cancelActivity, meetsEducation, isActive } = useActivityStore()

  const [selectedWork, setSelectedWork] = useState<WorkEntry | null>(null)
  const [timeLeft, setTimeLeft] = useState('')

  // 可用工作：按等级和学历过滤
  const availableWorks = useMemo(() =>
    WORK_ENTRIES.filter(w => w.need <= level),
  [level])

  // 计时器
  useEffect(() => {
    if (!active) { setTimeLeft(''); return }
    const tick = () => {
      const remaining = active.endTime - Date.now()
      if (remaining <= 0) {
        setTimeLeft('完成！')
        return
      }
      const mins = Math.floor(remaining / 60000)
      const secs = Math.floor((remaining % 60000) / 1000)
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [active])

  const handleStartWork = useCallback((work: WorkEntry) => {
    if (!meetsEducation(work.education)) {
      onNotice?.('学历不足，无法从事该工作')
      return
    }
    if (startWork(work)) {
      onNotice?.(`开始${work.tolkName}...`)
    }
  }, [startWork, meetsEducation, onNotice])

  const handleComplete = useCallback(() => {
    const completed = completeActivity()
    if (completed) {
      // 发放奖励
      const store = usePetStore.getState()
      store.earnCoins(completed.rewards.yb || 0)
      store.updateProfile({
        charm: store.profile.charm + (completed.rewards.charm || 0),
        intelligence: store.profile.intelligence + (completed.rewards.intel || 0),
        strength: store.profile.strength + (completed.rewards.strong || 0),
      })
      onNotice?.(`${completed.name}完成！获得 ${completed.rewards.yb || 0} 元宝`)
      onWorkComplete?.()
    }
  }, [completeActivity, onNotice, onWorkComplete])

  const formatEducation = (edu: Partial<Record<string, number>>) => {
    const names: Record<string, string> = {
      chinese: '语文', mathematics: '数学', politics: '政治',
      music: '音乐', art: '艺术', manner: '礼仪',
      pe: '体育', labouring: '劳技', wushu: '武术',
    }
    return Object.entries(edu)
      .filter(([, v]) => v && v > 0)
      .map(([k, v]) => `${names[k] || k} ${v}`)
      .join('、')
  }

  return (
    <div className="work-panel">
      <div className="work-panel-header" ref={headerRef}>
        <div>
          <p className="work-eyebrow">打工</p>
          <h2>工作列表</h2>
          <p className="work-coins">元宝: {coins} | 等级: {level}</p>
        </div>
        <button className="work-close-btn" onClick={onClose}>✕</button>
      </div>

      {/* 当前活动状态 */}
      {active && active.type === 'work' && (
        <div className="work-active">
          <div className="work-active-info">
            <span className="work-active-name">正在{active.name}...</span>
            <span className="work-active-time">{timeLeft}</span>
          </div>
          {Date.now() >= active.endTime ? (
            <button className="work-complete-btn" onClick={handleComplete}>领取奖励</button>
          ) : (
            <button className="work-cancel-btn" onClick={cancelActivity}>取消</button>
          )}
        </div>
      )}

      {/* 工作列表 */}
      <div className="work-list">
        {availableWorks.map((work) => {
          const eduMet = meetsEducation(work.education)
          const eduStr = formatEducation(work.education)
          const isBusy = isActive()
          return (
            <div
              key={work.id}
              className={`work-card ${selectedWork?.id === work.id ? 'selected' : ''} ${!eduMet ? 'locked' : ''}`}
              onClick={() => setSelectedWork(work)}
            >
              <div className="work-card-info">
                <div className="work-card-name">{work.name}</div>
                <div className="work-card-desc">{work.desc}</div>
                <div className="work-card-meta">
                  <span>时长: {work.useTime}分钟</span>
                  <span>收益: {work.yb} 元宝</span>
                  {work.need > 0 && <span>等级: {work.need}</span>}
                </div>
                {eduStr && <div className="work-card-edu">学历要求: {eduStr}</div>}
                {!eduMet && <div className="work-card-lock">学历不足</div>}
              </div>
              <button
                className="work-start-btn"
                disabled={!eduMet || isBusy}
                onClick={(e) => { e.stopPropagation(); handleStartWork(work) }}
              >
                {isBusy ? '忙碌中' : !eduMet ? '不可用' : '开始'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
