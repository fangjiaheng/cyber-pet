import { useRef } from 'react'
import { useWindowDrag } from '../hooks/useWindowDrag'
import { usePetStore } from '../stores/petStore'
import { useActivityStore } from '../stores/activitySystem'
import { useShallow } from 'zustand/react/shallow'
import { getHungerMax, getCleanlinessMax, MOOD_MAX, HEALTH_MAX, getGrowthStage } from '../stores/growthConfig'
import { levelForExperience } from '../stores/growthConfig'
import { getCurrentDiseaseInfo } from '../stores/diseaseSystem'
import './StateInfoPanel.css'

interface StateInfoPanelProps {
  onClose: () => void
}

function barColor(ratio: number) {
  if (ratio > 0.6) return '#9ef0a5'
  if (ratio > 0.3) return '#ffd770'
  return '#ff8a7a'
}

function healthLabel(h: number) {
  if (h >= 5) return '健康'
  if (h >= 4) return '微恙'
  if (h >= 3) return '不适'
  if (h >= 2) return '生病'
  if (h >= 1) return '重病'
  return '死亡'
}

const STAGE_NAMES: Record<string, string> = { egg: '蛋', kid: '幼年', adult: '成年' }

export function StateInfoPanel({ onClose }: StateInfoPanelProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  useWindowDrag(headerRef)

  const {
    hunger, cleanliness, mood, energy, health, level, experience, onlineDataTime, diseaseState, profile,
  } = usePetStore(useShallow((s) => ({
    hunger: s.hunger,
    cleanliness: s.cleanliness,
    mood: s.mood,
    energy: s.energy,
    health: s.health,
    level: s.level,
    experience: s.experience,
    onlineDataTime: s.onlineDataTime,
    diseaseState: s.diseaseState,
    profile: s.profile,
  })))

  const { active } = useActivityStore()

  const hungerMax = getHungerMax(level)
  const cleanMax = getCleanlinessMax(level)
  const growthStage = getGrowthStage(level)
  const diseaseInfo = getCurrentDiseaseInfo(diseaseState)

  // 计算经验进度
  const currentLevelExp = levelForExperience(level)
  const nextLevelExp = levelForExperience(level + 1)
  const expProgress = nextLevelExp > currentLevelExp
    ? (experience - currentLevelExp) / (nextLevelExp - currentLevelExp)
    : 1

  const onlineHours = Math.floor(onlineDataTime / 60)
  const onlineMins = onlineDataTime % 60

  const bars = [
    { label: '饥饿', value: hunger, max: hungerMax },
    { label: '清洁', value: cleanliness, max: cleanMax },
    { label: '心情', value: mood, max: MOOD_MAX },
    { label: '体力', value: energy, max: 100 },
  ]

  return (
    <div className="stateinfo-panel">
      <div className="stateinfo-header" ref={headerRef}>
        <div>
          <p className="stateinfo-eyebrow">状态</p>
          <h2>{profile.petName}</h2>
          <p className="stateinfo-sub">Lv.{level} | {STAGE_NAMES[growthStage] || growthStage}</p>
        </div>
        <button className="stateinfo-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="stateinfo-body">
        {/* 经验进度 */}
        <div className="stateinfo-exp">
          <div className="stateinfo-exp-label">
            <span>成长进度</span>
            <span className="stateinfo-exp-value">Lv.{level} → Lv.{level + 1}</span>
          </div>
          <div className="stateinfo-bar-track exp">
            <div className="stateinfo-bar-fill" style={{ width: `${expProgress * 100}%`, background: '#b4b8ff' }} />
          </div>
          <div className="stateinfo-exp-nums">{experience} / {nextLevelExp}</div>
        </div>

        {/* 属性条 */}
        {bars.map(({ label, value, max }) => {
          const ratio = max > 0 ? value / max : 0
          return (
            <div key={label} className="stateinfo-stat">
              <div className="stateinfo-stat-label">
                <span>{label}</span>
                <span className="stateinfo-stat-nums">{Math.round(value)} / {max}</span>
              </div>
              <div className="stateinfo-bar-track">
                <div className="stateinfo-bar-fill" style={{ width: `${ratio * 100}%`, background: barColor(ratio) }} />
              </div>
            </div>
          )
        })}

        {/* 健康 */}
        <div className="stateinfo-stat">
          <div className="stateinfo-stat-label">
            <span>健康</span>
            <span className="stateinfo-stat-nums" style={{ color: health >= 4 ? '#9ef0a5' : health >= 2 ? '#ffd770' : '#ff8a7a' }}>
              {healthLabel(health)} ({health}/{HEALTH_MAX})
            </span>
          </div>
          <div className="stateinfo-bar-track">
            <div className="stateinfo-bar-fill" style={{ width: `${(health / HEALTH_MAX) * 100}%`, background: health >= 4 ? '#9ef0a5' : health >= 2 ? '#ffd770' : '#ff8a7a' }} />
          </div>
          {diseaseInfo && <div className="stateinfo-disease">当前疾病: {diseaseInfo.name}</div>}
        </div>

        {/* 在线时长 */}
        <div className="stateinfo-info-row">
          <span>在线时长</span>
          <span>{onlineHours}小时{onlineMins}分钟</span>
        </div>

        {/* 当前活动 */}
        <div className="stateinfo-info-row">
          <span>当前状态</span>
          <span>{active ? `${active.name}中...` : diseaseInfo ? `生病: ${diseaseInfo.name}` : '成长中~'}</span>
        </div>
      </div>
    </div>
  )
}
