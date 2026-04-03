import { useEffect, useMemo, useRef, useState } from 'react'
import type { AIProvider } from '../../ai/types'
import { useShallow } from 'zustand/react/shallow'
import { getModelsForProvider } from '../../ai/providerCatalog'
import { useWindowDrag } from '../hooks/useWindowDrag'
import { usePetStore } from '../stores/petStore'
import {
  getGrowthStage,
  getHungerMax,
  getCleanlinessMax,
  MOOD_MAX,
  ENERGY_MAX,
  HEALTH_MAX,
  EXPERIENCE_TABLE,
} from '../stores/growthConfig'
import { AIConfig, AIConfigForm } from './AIConfigForm'
import './SettingsPanel.css'

type SettingsSection = 'ai' | 'profile' | 'game' | 'about'

interface StoredAISettings {
  provider?: AIProvider
  apiKey?: string
  baseUrl?: string
  defaultModel?: string
}

interface PetGameSettings {
  animationIntervalMs: number
  roamingEnabled: boolean
}

interface SettingsPanelProps {
  onClose: () => void
  onSaved?: (config: AIConfig) => void
  onOpenChat?: () => void
  onNotice?: (message: string) => void
  initialSection?: SettingsSection
  onGameSettingsSaved?: (settings: { animationIntervalMs: number; roamingEnabled: boolean }) => void
}

function maskApiKey(apiKey?: string) {
  if (!apiKey) return 'Not set'
  if (apiKey.length <= 10) return `${apiKey.slice(0, 3)}***`
  return `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`
}

const SECTION_COPY: Record<SettingsSection, { eyebrow: string; title: string; subtitle: string }> = {
  ai: {
    eyebrow: 'AI CONFIG',
    title: 'Models and Connections',
    subtitle: 'Choose a provider, save credentials, and switch models without restarting the pet window.',
  },
  profile: {
    eyebrow: '宠物资料',
    title: '宠物档案',
    subtitle: '查看宠物的成长状态、属性和基本信息。',
  },
  game: {
    eyebrow: 'GAME',
    title: 'Interaction Settings',
    subtitle: 'Tune animation timing and keep future roaming settings ready for later gameplay updates.',
  },
  about: {
    eyebrow: 'ABOUT',
    title: 'Project Status',
    subtitle: 'See what is implemented now and where the desktop pet is still intentionally limited.',
  },
}

const EDUCATION_OPTIONS = ['Kindergarten', 'Primary School', 'Middle School', 'High School', 'University', 'Graduate']

export function SettingsPanel({
  onClose,
  onSaved,
  onOpenChat,
  onNotice,
  initialSection = 'ai',
  onGameSettingsSaved,
}: SettingsPanelProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const {
    profile, level, experience, coins, checkInStreak, updateProfile,
    hunger, cleanliness, mood, energy, health, createdAt, onlineDataTime,
  } = usePetStore(useShallow((state) => ({
    profile: state.profile,
    level: state.level,
    experience: state.experience,
    coins: state.coins,
    checkInStreak: state.checkInStreak,
    updateProfile: state.updateProfile,
    hunger: state.hunger,
    cleanliness: state.cleanliness,
    mood: state.mood,
    energy: state.energy,
    health: state.health,
    createdAt: state.createdAt,
    onlineDataTime: state.onlineDataTime,
  })))

  const [section, setSection] = useState<SettingsSection>(initialSection)
  const [settings, setSettings] = useState<StoredAISettings | null>(null)
  const [gameSettings, setGameSettings] = useState<PetGameSettings>({ animationIntervalMs: 2400, roamingEnabled: false })
  const [loading, setLoading] = useState(true)
  const [profileForm, setProfileForm] = useState({
    petName: profile.petName,
    ownerName: profile.ownerName,
  })

  useWindowDrag(headerRef)

  useEffect(() => {
    setSection(initialSection)
  }, [initialSection])

  useEffect(() => {
    setProfileForm({
      petName: profile.petName,
      ownerName: profile.ownerName,
    })
  }, [profile.ownerName, profile.petName])

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [storedAI, storedSettings] = await Promise.all([
          window.electronAPI?.storage?.getAISettings?.(),
          window.electronAPI?.storage?.getSettings?.(),
        ])

        setSettings(storedAI ?? null)
        setGameSettings({
          animationIntervalMs: storedSettings?.pet?.animationIntervalMs ?? 2400,
          roamingEnabled: storedSettings?.pet?.roamingEnabled ?? false,
        })
      } catch (error) {
        console.error('Failed to load settings:', error)
        setSettings(null)
      } finally {
        setLoading(false)
      }
    }

    void loadSettings()
  }, [])

  const currentModel = useMemo(() => {
    if (!settings?.defaultModel) return null
    return getModelsForProvider(settings.provider).find((item) => item.id === settings.defaultModel) ?? null
  }, [settings?.defaultModel, settings?.provider])

  const configured = Boolean(settings?.apiKey && settings?.baseUrl)
  const currentSectionCopy = SECTION_COPY[section]

  // 正确的经验进度计算
  const tableIndex = Math.min(level - 1, EXPERIENCE_TABLE.length - 1)
  const currentLevelExp = EXPERIENCE_TABLE[tableIndex]
  const nextLevelExp = tableIndex + 1 < EXPERIENCE_TABLE.length
    ? EXPERIENCE_TABLE[tableIndex + 1]
    : currentLevelExp + 10000
  const levelProgress = experience - currentLevelExp
  const levelTotal = nextLevelExp - currentLevelExp

  // 成长阶段中文
  const growthStage = getGrowthStage(level)
  const STAGE_LABELS: Record<string, string> = { egg: '蛋', kid: '幼年', adult: '成年' }

  // 宠物年龄（天数）
  const petAgeDays = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24))

  // 属性上限
  const hungerMax = getHungerMax(level)
  const cleanlinessMax = getCleanlinessMax(level)

  const handleSaved = (config: AIConfig) => {
    setSettings({
      provider: config.provider,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      defaultModel: config.model,
    })
    onSaved?.(config)
  }

  const handleProfileSave = () => {
    updateProfile({
      petName: profileForm.petName.trim() || profile.petName,
      ownerName: profileForm.ownerName.trim() || profile.ownerName,
    })
    onNotice?.('资料已保存')
  }

  const handleGameSettingsSave = async () => {
    await window.electronAPI?.storage?.saveSettings?.({
      pet: {
        animationIntervalMs: gameSettings.animationIntervalMs,
        roamingEnabled: gameSettings.roamingEnabled,
      },
    })

    onGameSettingsSaved?.({
      animationIntervalMs: gameSettings.animationIntervalMs,
      roamingEnabled: gameSettings.roamingEnabled,
    })
    onNotice?.('Interaction settings saved.')
  }

  return (
    <div className="settings-panel">
      <div ref={headerRef} className="settings-panel-header">
        <div>
          <p className="settings-eyebrow">{currentSectionCopy.eyebrow}</p>
          <h2>{currentSectionCopy.title}</h2>
          <p className="settings-subtitle">{currentSectionCopy.subtitle}</p>
        </div>
        <button
          className="settings-close-btn"
          data-window-drag-ignore="true"
          onClick={onClose}
          title="Close settings"
        >
          x
        </button>
      </div>

      <div className="settings-panel-body settings-shell">
        <aside className="settings-sidebar">
          {([
            ['ai', 'AI Config', 'Provider and model'],
            ['profile', '资料', '成长与属性'],
            ['game', 'Game', 'Animation timing'],
            ['about', 'About', 'Status and limits'],
          ] as Array<[SettingsSection, string, string]>).map(([key, title, description]) => (
            <button
              key={key}
              type="button"
              className={`settings-nav-btn ${section === key ? 'active' : ''}`}
              onClick={() => setSection(key)}
            >
              <strong>{title}</strong>
              <span>{description}</span>
            </button>
          ))}
        </aside>

        <div className="settings-content">
          <section className="settings-card settings-card-hero">
            <div className="settings-card-header">
              <div>
                <span className="settings-card-kicker">CURRENT STATUS</span>
                <h3>Desktop Pet Overview</h3>
              </div>
              <span className={`settings-badge ${configured ? 'ok' : 'warn'}`}>
                {loading ? 'Loading...' : configured ? 'AI configured' : 'AI not configured'}
              </span>
            </div>

            <div className="settings-status-grid">
              <div className="settings-status-item">
                <span>宠物昵称</span>
                <strong>{profile.petName}</strong>
              </div>
              <div className="settings-status-item">
                <span>主人昵称</span>
                <strong>{profile.ownerName}</strong>
              </div>
              <div className="settings-status-item">
                <span>等级 / 经验</span>
                <strong>Lv.{level} / {levelProgress} / {levelTotal}</strong>
              </div>
              <div className="settings-status-item">
                <span>金币 / 签到</span>
                <strong>{coins} / {checkInStreak} 天</strong>
              </div>
            </div>
          </section>

          {section === 'ai' && (
            <>
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">CONNECTION</span>
                    <h3>Saved AI Settings</h3>
                  </div>
                </div>

                <div className="settings-status-grid">
                  <div className="settings-status-item">
                    <span>Provider</span>
                    <strong>{settings?.provider ?? 'Not set'}</strong>
                  </div>
                  <div className="settings-status-item">
                    <span>Default Model</span>
                    <strong>{currentModel?.name ?? settings?.defaultModel ?? 'Not set'}</strong>
                  </div>
                  <div className="settings-status-item">
                    <span>Base URL</span>
                    <strong>{settings?.baseUrl ?? 'Not set'}</strong>
                  </div>
                  <div className="settings-status-item">
                    <span>API Key</span>
                    <strong>{maskApiKey(settings?.apiKey)}</strong>
                  </div>
                </div>
              </section>

              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">EDIT</span>
                    <h3>Provider and Model</h3>
                  </div>
                </div>
                <AIConfigForm embedded onSaved={handleSaved} />
              </section>

              <section className="settings-card settings-card-tips">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">NOTES</span>
                    <h3>How it Works</h3>
                  </div>
                </div>
                <div className="settings-tip-list">
                  <div className="settings-tip-item">Saving applies the new provider immediately. You do not need to restart the pet app.</div>
                  <div className="settings-tip-item">Use the test button before saving when switching between Claude, OpenAI, Bailian, or GLM.</div>
                  <div className="settings-tip-item">All AI credentials are stored locally through electron-store on this machine.</div>
                </div>
                <div className="settings-tip-actions">
                  <button className="settings-secondary-btn" onClick={onClose}>
                    Close
                  </button>
                  <button className="settings-primary-btn" onClick={onOpenChat}>
                    Open Chat
                  </button>
                </div>
              </section>
            </>
          )}

          {section === 'profile' && (
            <>
              {/* Card 1 — 基本信息 */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">基本信息</span>
                    <h3>宠物档案</h3>
                  </div>
                </div>

                <div className="settings-form-grid">
                  <label className="settings-field">
                    <span>宠物昵称</span>
                    <input
                      value={profileForm.petName}
                      onChange={(event) => setProfileForm((current) => ({ ...current, petName: event.target.value }))}
                    />
                  </label>

                  <label className="settings-field">
                    <span>主人昵称</span>
                    <input
                      value={profileForm.ownerName}
                      onChange={(event) => setProfileForm((current) => ({ ...current, ownerName: event.target.value }))}
                    />
                  </label>
                </div>

                <div className="profile-info-grid">
                  <div className="profile-info-row">
                    <span>等级</span>
                    <strong>Lv.{level}</strong>
                  </div>
                  <div className="profile-info-row">
                    <span>成长阶段</span>
                    <strong>{STAGE_LABELS[growthStage] ?? growthStage}</strong>
                  </div>
                  <div className="profile-info-row">
                    <span>学历</span>
                    <strong>{profile.education}</strong>
                  </div>
                  <div className="profile-info-row">
                    <span>宠物年龄</span>
                    <strong>{petAgeDays} 天</strong>
                  </div>
                </div>

                <div className="settings-progress-card">
                  <div className="settings-progress-header">
                    <span>经验进度</span>
                    <strong>{levelProgress} / {levelTotal}</strong>
                  </div>
                  <div className="settings-progress-track">
                    <div className="settings-progress-fill" style={{ width: `${Math.min(100, (levelProgress / levelTotal) * 100)}%` }} />
                  </div>
                </div>

                <div className="settings-tip-actions">
                  <button className="settings-primary-btn" onClick={handleProfileSave}>
                    保存资料
                  </button>
                </div>
              </section>

              {/* Card 2 — 成长属性 */}
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">属性面板</span>
                    <h3>成长属性</h3>
                  </div>
                </div>

                <div className="profile-stat-grid">
                  {([
                    ['智力', profile.intelligence],
                    ['力量', profile.strength],
                    ['魅力', profile.charm],
                    ['金币', coins],
                    ['签到', `${checkInStreak} 天`],
                    ['在线', `${Math.floor(onlineDataTime / 60)}小时${onlineDataTime % 60}分`],
                  ] as Array<[string, string | number]>).map(([label, value]) => (
                    <div key={label} className="settings-stat-card">
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>

                <div className="profile-status-section">
                  {([
                    ['饱食度', hunger, hungerMax, 'green'],
                    ['清洁度', cleanliness, cleanlinessMax, 'blue'],
                    ['心情', mood, MOOD_MAX, 'purple'],
                    ['能量', energy, ENERGY_MAX, 'orange'],
                    ['健康', health, HEALTH_MAX, 'red'],
                  ] as Array<[string, number, number, string]>).map(([label, current, max, color]) => (
                    <div key={label} className="profile-status-row">
                      <div className="profile-status-header">
                        <span>{label}</span>
                        <span>{current} / {max}</span>
                      </div>
                      <div className="profile-status-track">
                        <div
                          className={`profile-status-fill profile-status-fill--${color}`}
                          style={{ width: `${Math.min(100, (current / max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {section === 'game' && (
            <section className="settings-card">
              <div className="settings-card-header">
                <div>
                  <span className="settings-card-kicker">INTERACTION</span>
                  <h3>Animation and Roaming</h3>
                </div>
              </div>

              <div className="settings-form-grid">
                <label className="settings-field settings-field--full">
                  <span>Animation cooldown</span>
                  <input
                    type="range"
                    min={1200}
                    max={5000}
                    step={200}
                    value={gameSettings.animationIntervalMs}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setGameSettings((current) => ({ ...current, animationIntervalMs: value }))
                    }}
                  />
                  <small>{gameSettings.animationIntervalMs} ms</small>
                </label>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={gameSettings.roamingEnabled}
                    onChange={(event) => {
                      setGameSettings((current) => ({ ...current, roamingEnabled: event.target.checked }))
                    }}
                  />
                  <span>Keep roaming enabled in saved settings. This only stores the flag for now.</span>
                </label>
              </div>

              <div className="settings-tip-actions">
                <button className="settings-primary-btn" onClick={handleGameSettingsSave}>
                  Save Interaction Settings
                </button>
              </div>
            </section>
          )}

          {section === 'about' && (
            <>
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">STATUS</span>
                    <h3>Current Project Scope</h3>
                  </div>
                </div>
                <div className="settings-tip-list">
                  <div className="settings-tip-item">The desktop pet already supports SWF playback, status decay, local saves, and AI chat.</div>
                  <div className="settings-tip-item">The store and some long-term progression systems are still placeholders.</div>
                  <div className="settings-tip-item">Settings, chat history, and token records are stored locally through electron-store.</div>
                </div>
              </section>

              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">STACK</span>
                    <h3>Technical Snapshot</h3>
                  </div>
                </div>
                <div className="settings-status-grid">
                  <div className="settings-status-item">
                    <span>Runtime</span>
                    <strong>Electron + React + Vite</strong>
                  </div>
                  <div className="settings-status-item">
                    <span>Animation</span>
                    <strong>Ruffle + player.swf controller</strong>
                  </div>
                  <div className="settings-status-item">
                    <span>Persistence</span>
                    <strong>Local save data, chat history, and AI config</strong>
                  </div>
                  <div className="settings-status-item">
                    <span>Next</span>
                    <strong>More gameplay loops, more content, and better progression systems</strong>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
