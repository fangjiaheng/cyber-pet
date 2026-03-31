import { useEffect, useMemo, useRef, useState } from 'react'
import type { AIProvider } from '../../ai/types'
import { useShallow } from 'zustand/react/shallow'
import { getModelsForProvider } from '../../ai/providerCatalog'
import { useWindowDrag } from '../hooks/useWindowDrag'
import { usePetStore } from '../stores/petStore'
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
    eyebrow: 'PROFILE',
    title: 'Pet Identity',
    subtitle: 'Update the pet name, owner name, and education profile stored in local save data.',
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
  const { profile, level, experience, coins, checkInStreak, updateProfile } = usePetStore(useShallow((state) => ({
    profile: state.profile,
    level: state.level,
    experience: state.experience,
    coins: state.coins,
    checkInStreak: state.checkInStreak,
    updateProfile: state.updateProfile,
  })))

  const [section, setSection] = useState<SettingsSection>(initialSection)
  const [settings, setSettings] = useState<StoredAISettings | null>(null)
  const [gameSettings, setGameSettings] = useState<PetGameSettings>({ animationIntervalMs: 2400, roamingEnabled: false })
  const [loading, setLoading] = useState(true)
  const [profileForm, setProfileForm] = useState({
    petName: profile.petName,
    ownerName: profile.ownerName,
    education: profile.education,
  })

  useWindowDrag(headerRef)

  useEffect(() => {
    setSection(initialSection)
  }, [initialSection])

  useEffect(() => {
    setProfileForm({
      petName: profile.petName,
      ownerName: profile.ownerName,
      education: profile.education,
    })
  }, [profile.education, profile.ownerName, profile.petName])

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
  const levelProgress = experience % 200
  const currentSectionCopy = SECTION_COPY[section]

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
      education: profileForm.education,
    })
    onNotice?.('Profile saved.')
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
            ['profile', 'Profile', 'Name and growth'],
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
                <span>Pet Name</span>
                <strong>{profile.petName}</strong>
              </div>
              <div className="settings-status-item">
                <span>Owner Name</span>
                <strong>{profile.ownerName}</strong>
              </div>
              <div className="settings-status-item">
                <span>Level / Experience</span>
                <strong>Lv.{level} / {levelProgress} / 200</strong>
              </div>
              <div className="settings-status-item">
                <span>Coins / Streak</span>
                <strong>{coins} / {checkInStreak} days</strong>
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
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">IDENTITY</span>
                    <h3>Name and Education</h3>
                  </div>
                </div>

                <div className="settings-form-grid">
                  <label className="settings-field">
                    <span>Pet Name</span>
                    <input
                      value={profileForm.petName}
                      onChange={(event) => setProfileForm((current) => ({ ...current, petName: event.target.value }))}
                    />
                  </label>

                  <label className="settings-field">
                    <span>Owner Name</span>
                    <input
                      value={profileForm.ownerName}
                      onChange={(event) => setProfileForm((current) => ({ ...current, ownerName: event.target.value }))}
                    />
                  </label>

                  <label className="settings-field settings-field--full">
                    <span>Education</span>
                    <select
                      value={profileForm.education}
                      onChange={(event) => setProfileForm((current) => ({ ...current, education: event.target.value }))}
                    >
                      {EDUCATION_OPTIONS.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="settings-tip-actions">
                  <button className="settings-primary-btn" onClick={handleProfileSave}>
                    Save Profile
                  </button>
                </div>
              </section>

              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">STATS</span>
                    <h3>Growth Snapshot</h3>
                  </div>
                </div>

                <div className="settings-stat-grid">
                  {[
                    ['Intelligence', profile.intelligence],
                    ['Strength', profile.strength],
                    ['Charm', profile.charm],
                    ['Coins', coins],
                  ].map(([label, value]) => (
                    <div key={label} className="settings-stat-card">
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>

                <div className="settings-progress-card">
                  <div className="settings-progress-header">
                    <span>Level Progress</span>
                    <strong>Lv.{level}</strong>
                  </div>
                  <div className="settings-progress-track">
                    <div className="settings-progress-fill" style={{ width: `${(levelProgress / 200) * 100}%` }} />
                  </div>
                  <p>Current EXP: {levelProgress} / 200. Check-in streak: {checkInStreak} days.</p>
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
