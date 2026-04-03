import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { useWindowDrag } from '../hooks/useWindowDrag'
import { useActivityStore } from '../stores/activitySystem'
import { STUDY_ENTRIES, type StudyEntry } from '../../shared/itemCatalog'
import './StudyPanel.css'

interface StudyPanelProps {
  onClose: () => void
  onNotice?: (message: string) => void
  onStudyComplete?: () => void
}

const SCHOOL_TABS = ['小学', '中学', '大学', '研究生'] as const

export function StudyPanel({ onClose, onNotice, onStudyComplete }: StudyPanelProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  useWindowDrag(headerRef)

  const { active, startStudy, completeActivity, cancelActivity, studyProgress, getSchoolLevel, isActive } = useActivityStore()

  const [selectedSchool, setSelectedSchool] = useState<string>('小学')
  const [timeLeft, setTimeLeft] = useState('')

  // 当前学校等级的科目列表
  const entries = useMemo(() =>
    STUDY_ENTRIES.filter(e => e.school === selectedSchool),
  [selectedSchool])

  // 计时器
  useEffect(() => {
    if (!active || active.type !== 'study') { setTimeLeft(''); return }
    const tick = () => {
      const remaining = active.endTime - Date.now()
      if (remaining <= 0) { setTimeLeft('完成！'); return }
      const mins = Math.floor(remaining / 60000)
      const secs = Math.floor((remaining % 60000) / 1000)
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [active])

  const handleStartStudy = useCallback((entry: StudyEntry) => {
    const hours = studyProgress.hours[entry.subject] || 0
    if (hours < entry.classNumUp) {
      onNotice?.(`需要先完成前置学业（已修 ${hours}/${entry.classNumUp} 学时）`)
      return
    }
    if (hours >= entry.classNum) {
      onNotice?.('该科目已修满学时')
      return
    }
    if (startStudy(entry)) {
      onNotice?.(`开始学习${entry.tolkName}...`)
    }
  }, [startStudy, studyProgress, onNotice])

  const handleComplete = useCallback(() => {
    const completed = completeActivity()
    if (completed) {
      onNotice?.(`${completed.name}学习完成！`)
      onStudyComplete?.()
    }
  }, [completeActivity, onNotice, onStudyComplete])

  return (
    <div className="study-panel">
      <div className="study-panel-header" ref={headerRef}>
        <div>
          <p className="study-eyebrow">学习</p>
          <h2>学业进修</h2>
        </div>
        <button className="study-close-btn" onClick={onClose}>✕</button>
      </div>

      {/* 当前活动 */}
      {active && active.type === 'study' && (
        <div className="study-active">
          <div className="study-active-info">
            <span className="study-active-name">正在{active.name}...</span>
            <span className="study-active-time">{timeLeft}</span>
          </div>
          {Date.now() >= active.endTime ? (
            <button className="study-complete-btn" onClick={handleComplete}>完成学习</button>
          ) : (
            <button className="study-cancel-btn" onClick={cancelActivity}>取消</button>
          )}
        </div>
      )}

      {/* 学校等级选择 */}
      <div className="study-tabs">
        {SCHOOL_TABS.map((school) => (
          <button
            key={school}
            className={`study-tab ${selectedSchool === school ? 'active' : ''}`}
            onClick={() => setSelectedSchool(school)}
          >
            {school}
          </button>
        ))}
      </div>

      {/* 科目列表 */}
      <div className="study-list">
        {entries.map((entry) => {
          const hours = studyProgress.hours[entry.subject] || 0
          const canStart = hours >= entry.classNumUp && hours < entry.classNum
          const completed = hours >= entry.classNum
          const isBusy = isActive()
          const level = getSchoolLevel(entry.subject)

          return (
            <div key={entry.key} className={`study-card ${completed ? 'completed' : ''}`}>
              <div className="study-card-info">
                <div className="study-card-name">
                  {entry.subjectName}
                  <span className="study-card-level">{level}</span>
                </div>
                <div className="study-card-progress">
                  学时: {hours} / {entry.classNum}
                  {entry.classNumUp > 0 && ` (前置: ${entry.classNumUp})`}
                </div>
                <div className="study-card-meta">
                  <span>时长: {entry.classTime}分</span>
                  {entry.intel > 0 && <span>智力 +{entry.intel}</span>}
                  {entry.charm > 0 && <span>魅力 +{entry.charm}</span>}
                  {entry.strong > 0 && <span>武力 +{entry.strong}</span>}
                </div>
              </div>
              <div className="study-card-bar">
                <div
                  className="study-card-bar-fill"
                  style={{ width: `${Math.min(100, (hours / entry.classNum) * 100)}%` }}
                />
              </div>
              <button
                className="study-start-btn"
                disabled={!canStart || isBusy}
                onClick={() => handleStartStudy(entry)}
              >
                {completed ? '已修满' : isBusy ? '忙碌中' : !canStart ? '未解锁' : '学习'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
