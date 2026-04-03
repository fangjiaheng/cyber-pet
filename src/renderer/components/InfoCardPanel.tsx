import { useRef, useState, useCallback } from 'react'
import { useWindowDrag } from '../hooks/useWindowDrag'
import { usePetStore } from '../stores/petStore'
import { useActivityStore } from '../stores/activitySystem'
import { useShallow } from 'zustand/react/shallow'
import { type StudySubject } from '../../shared/itemCatalog'
import './InfoCardPanel.css'

interface InfoCardPanelProps {
  onClose: () => void
  onNotice?: (message: string) => void
}

const SUBJECT_NAMES: Record<StudySubject, string> = {
  chinese: '语文', mathematics: '数学', politics: '政治',
  music: '音乐', art: '艺术', manner: '礼仪',
  pe: '体育', labouring: '劳技', wushu: '武术',
}

function formatDate(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function InfoCardPanel({ onClose, onNotice }: InfoCardPanelProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  useWindowDrag(headerRef)

  const { profile, level, experience, yuanbao, createdAt, onlineDataTime, updateProfile } = usePetStore(useShallow((s) => ({
    profile: s.profile,
    level: s.level,
    experience: s.experience,
    yuanbao: s.yuanbao,
    createdAt: s.createdAt,
    onlineDataTime: s.onlineDataTime,
    updateProfile: s.updateProfile,
  })))

  const { studyProgress, getSchoolLevel } = useActivityStore()

  const [editingName, setEditingName] = useState(false)
  const [editingOwner, setEditingOwner] = useState(false)
  const [nameInput, setNameInput] = useState(profile.petName)
  const [ownerInput, setOwnerInput] = useState(profile.ownerName)

  const saveName = useCallback(() => {
    if (nameInput.trim()) {
      updateProfile({ petName: nameInput.trim() })
      onNotice?.('宠物名已更新')
    }
    setEditingName(false)
  }, [nameInput, updateProfile, onNotice])

  const saveOwner = useCallback(() => {
    if (ownerInput.trim()) {
      updateProfile({ ownerName: ownerInput.trim() })
      onNotice?.('主人名已更新')
    }
    setEditingOwner(false)
  }, [ownerInput, updateProfile, onNotice])

  const onlineHours = Math.floor(onlineDataTime / 60)
  const onlineMins = onlineDataTime % 60

  return (
    <div className="infocard-panel">
      <div className="infocard-header" ref={headerRef}>
        <div>
          <p className="infocard-eyebrow">宠物资料</p>
          <h2>档案卡</h2>
        </div>
        <button className="infocard-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="infocard-body">
        {/* 基本信息 */}
        <div className="infocard-section">
          <h3>基本信息</h3>
          <div className="infocard-row">
            <span className="infocard-label">宠物名</span>
            {editingName ? (
              <span className="infocard-edit">
                <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveName()} autoFocus />
                <button onClick={saveName}>确定</button>
              </span>
            ) : (
              <span className="infocard-value clickable" onClick={() => { setNameInput(profile.petName); setEditingName(true) }}>{profile.petName} ✎</span>
            )}
          </div>
          <div className="infocard-row">
            <span className="infocard-label">主人名</span>
            {editingOwner ? (
              <span className="infocard-edit">
                <input value={ownerInput} onChange={(e) => setOwnerInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveOwner()} autoFocus />
                <button onClick={saveOwner}>确定</button>
              </span>
            ) : (
              <span className="infocard-value clickable" onClick={() => { setOwnerInput(profile.ownerName); setEditingOwner(true) }}>{profile.ownerName} ✎</span>
            )}
          </div>
          <div className="infocard-row">
            <span className="infocard-label">生日</span>
            <span className="infocard-value">{formatDate(createdAt)}</span>
          </div>
          <div className="infocard-row">
            <span className="infocard-label">等级</span>
            <span className="infocard-value">{level} 级</span>
          </div>
          <div className="infocard-row">
            <span className="infocard-label">经验</span>
            <span className="infocard-value">{experience}</span>
          </div>
          <div className="infocard-row">
            <span className="infocard-label">元宝</span>
            <span className="infocard-value gold">{yuanbao}</span>
          </div>
          <div className="infocard-row">
            <span className="infocard-label">在线时长</span>
            <span className="infocard-value">{onlineHours}小时{onlineMins}分钟</span>
          </div>
        </div>

        {/* 属性 */}
        <div className="infocard-section">
          <h3>属性</h3>
          <div className="infocard-attrs">
            <div className="infocard-attr">
              <span className="infocard-attr-label">智力</span>
              <span className="infocard-attr-value">{profile.intelligence}</span>
            </div>
            <div className="infocard-attr">
              <span className="infocard-attr-label">武力</span>
              <span className="infocard-attr-value">{profile.strength}</span>
            </div>
            <div className="infocard-attr">
              <span className="infocard-attr-label">魅力</span>
              <span className="infocard-attr-value">{profile.charm}</span>
            </div>
          </div>
        </div>

        {/* 学历 */}
        <div className="infocard-section">
          <h3>学历</h3>
          <div className="infocard-edu-grid">
            {(Object.entries(SUBJECT_NAMES) as [StudySubject, string][]).map(([key, name]) => {
              const hours = studyProgress.hours[key] || 0
              const level = getSchoolLevel(key)
              return (
                <div key={key} className="infocard-edu-item">
                  <span className="infocard-edu-name">{name}</span>
                  <span className="infocard-edu-level">{level}</span>
                  <span className="infocard-edu-hours">{hours}学时</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
