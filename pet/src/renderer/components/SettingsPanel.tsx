import React, { useEffect, useMemo, useRef, useState } from 'react'
import { availableModels } from '../../ai/config'
import { usePetStore } from '../stores/petStore'
import { useShallow } from 'zustand/react/shallow'
import { AIConfig, AIConfigForm } from './AIConfigForm'
import { useWindowDrag } from '../hooks/useWindowDrag'
import './SettingsPanel.css'

type SettingsSection = 'ai' | 'profile' | 'game' | 'about'

interface StoredAISettings {
  provider?: 'claude' | 'openclaw'
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
  if (!apiKey) return '未设置'
  if (apiKey.length <= 10) return `${apiKey.slice(0, 3)}***`
  return `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`
}

const SECTION_COPY: Record<SettingsSection, { eyebrow: string; title: string; subtitle: string }> = {
  ai: {
    eyebrow: 'AI 助手配置',
    title: '设置与宠物资料',
    subtitle: '管理模型连接、角色资料、动画节奏和项目说明。保存后会立即影响当前桌宠会话。',
  },
  profile: {
    eyebrow: '宠物资料',
    title: '设置与宠物资料',
    subtitle: '这里维护昵称、主人称呼、成长属性和当前养成进度，修改后会直接写入本地存档。',
  },
  game: {
    eyebrow: '互动设置',
    title: '设置与宠物资料',
    subtitle: '调节动画恢复节奏和少量桌宠行为参数，为下一轮更完整的状态机改造预留控制位。',
  },
  about: {
    eyebrow: '关于项目',
    title: '设置与宠物资料',
    subtitle: '查看当前版本定位、数据保存方式以及桌宠原型目前的能力边界。',
  },
}

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
        console.error('加载设置失败:', error)
        setSettings(null)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const currentModel = useMemo(() => {
    if (!settings?.defaultModel) return null
    return availableModels.find((item) => item.id === settings.defaultModel) ?? null
  }, [settings?.defaultModel])

  const configured = Boolean(settings?.apiKey && settings?.baseUrl)
  const levelProgress = experience % 200
  const currentSectionCopy = SECTION_COPY[section]

  const handleSaved = (config: AIConfig) => {
    setSettings({
      provider: 'claude',
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
    onNotice?.('宠物资料已更新')
  }

  const handleGameSettingsSave = async () => {
    await window.electronAPI?.storage?.saveSettings?.({
      pet: {
        animationIntervalMs: gameSettings.animationIntervalMs,
        roamingEnabled: gameSettings.roamingEnabled,
      },
    })
    onGameSettingsSaved?.({
      animationIntervalMs: gameSettings.animationIntervalMs ?? 2400,
      roamingEnabled: Boolean(gameSettings.roamingEnabled),
    })
    onNotice?.('互动设置已保存')
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
          title="关闭设置"
        >
          ✕
        </button>
      </div>

      <div className="settings-panel-body settings-shell">
        <aside className="settings-sidebar">
          {([
            ['ai', 'AI 配置', '模型与 API'],
            ['profile', '宠物资料', '昵称与成长'],
            ['game', '互动设置', '动画节奏'],
            ['about', '关于', '版本与说明'],
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
                <span className="settings-card-kicker">当前状态</span>
                <h3>桌宠总览</h3>
              </div>
              <span className={`settings-badge ${configured ? 'ok' : 'warn'}`}>
                {loading ? '读取中...' : configured ? 'AI 已配置' : 'AI 未配置'}
              </span>
            </div>

            <div className="settings-status-grid">
              <div className="settings-status-item">
                <span>宠物昵称</span>
                <strong>{profile.petName}</strong>
              </div>
              <div className="settings-status-item">
                <span>主人称呼</span>
                <strong>{profile.ownerName}</strong>
              </div>
              <div className="settings-status-item">
                <span>等级 / 经验</span>
                <strong>Lv.{level} / {levelProgress} / 200</strong>
              </div>
              <div className="settings-status-item">
                <span>元宝 / 连签</span>
                <strong>{coins} 元宝 / {checkInStreak} 天</strong>
              </div>
            </div>
          </section>

          {section === 'ai' && (
            <>
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">连接状态</span>
                    <h3>当前 AI 配置概览</h3>
                  </div>
                </div>

                <div className="settings-status-grid">
                  <div className="settings-status-item">
                    <span>Provider</span>
                    <strong>{settings?.provider === 'openclaw' ? 'OpenClaw' : 'Claude 直连'}</strong>
                  </div>
                  <div className="settings-status-item">
                    <span>默认模型</span>
                    <strong>{currentModel?.name ?? settings?.defaultModel ?? '未设置'}</strong>
                  </div>
                  <div className="settings-status-item">
                    <span>Base URL</span>
                    <strong>{settings?.baseUrl ?? '未设置'}</strong>
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
                    <span className="settings-card-kicker">编辑配置</span>
                    <h3>连接与模型</h3>
                  </div>
                </div>
                <AIConfigForm embedded onSaved={handleSaved} />
              </section>

              <section className="settings-card settings-card-tips">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">使用提示</span>
                    <h3>保存后怎么用</h3>
                  </div>
                </div>
                <div className="settings-tip-list">
                  <div className="settings-tip-item">保存后会立刻重新初始化 AI 引擎，不需要手动重启应用。</div>
                  <div className="settings-tip-item">测试连接会发送一条极短的探活请求，用来确认 URL、Key 和模型是否可用。</div>
                  <div className="settings-tip-item">配置保存在本地 `electron-store` 中，后续打开聊天面板会自动读取。</div>
                </div>
                <div className="settings-tip-actions">
                  <button className="settings-secondary-btn" onClick={onClose}>
                    稍后再说
                  </button>
                  <button className="settings-primary-btn" onClick={onOpenChat}>
                    打开 AI 助手
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
                    <span className="settings-card-kicker">基础资料</span>
                    <h3>昵称与学历</h3>
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

                  <label className="settings-field settings-field--full">
                    <span>当前学历</span>
                    <select
                      value={profileForm.education}
                      onChange={(event) => setProfileForm((current) => ({ ...current, education: event.target.value }))}
                    >
                      {['启蒙班', '小学', '初中', '高中', '大学', '研究生'].map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="settings-tip-actions">
                  <button className="settings-primary-btn" onClick={handleProfileSave}>
                    保存资料
                  </button>
                </div>
              </section>

              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">成长面板</span>
                    <h3>个性能力</h3>
                  </div>
                </div>

                <div className="settings-stat-grid">
                  {[
                    ['智力', profile.intelligence],
                    ['武力', profile.strength],
                    ['魅力', profile.charm],
                    ['元宝', coins],
                  ].map(([label, value]) => (
                    <div key={label} className="settings-stat-card">
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>

                <div className="settings-progress-card">
                  <div className="settings-progress-header">
                    <span>等级进度</span>
                    <strong>Lv.{level}</strong>
                  </div>
                  <div className="settings-progress-track">
                    <div className="settings-progress-fill" style={{ width: `${(levelProgress / 200) * 100}%` }} />
                  </div>
                  <p>当前经验 {levelProgress} / 200，连续签到 {checkInStreak} 天。</p>
                </div>
              </section>
            </>
          )}

          {section === 'game' && (
            <section className="settings-card">
              <div className="settings-card-header">
                <div>
                  <span className="settings-card-kicker">节奏控制</span>
                  <h3>动画与互动</h3>
                </div>
              </div>

              <div className="settings-form-grid">
                <label className="settings-field settings-field--full">
                  <span>动作回待机缓冲</span>
                  <input
                    type="range"
                    min={1200}
                    max={5000}
                    step={200}
                    value={gameSettings.animationIntervalMs ?? 2400}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setGameSettings((current) => ({ ...current, animationIntervalMs: value }))
                    }}
                  />
                  <small>{gameSettings.animationIntervalMs ?? 2400} ms</small>
                </label>

                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(gameSettings.roamingEnabled)}
                    onChange={(event) => {
                      setGameSettings((current) => ({ ...current, roamingEnabled: event.target.checked }))
                    }}
                  />
                  <span>预留漫游开关（本轮仅保存设置，不启动自动漫游）</span>
                </label>
              </div>

              <div className="settings-tip-actions">
                <button className="settings-primary-btn" onClick={handleGameSettingsSave}>
                  保存互动设置
                </button>
              </div>
            </section>
          )}

          {section === 'about' && (
            <>
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">项目定位</span>
                    <h3>关于当前版本</h3>
                  </div>
                </div>
                <div className="settings-tip-list">
                  <div className="settings-tip-item">当前版本仍是桌宠交互原型，重点在 SWF 动作验证、AI 对话和养成状态闭环。</div>
                  <div className="settings-tip-item">所有资料、等级、元宝、AI 配置都保存在本地 `electron-store`，不会自动上传。</div>
                  <div className="settings-tip-item">右键菜单里的商城仍是占位入口，后续才会接元宝消耗和物品系统。</div>
                </div>
              </section>

              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <span className="settings-card-kicker">版本信息</span>
                    <h3>当前能力边界</h3>
                  </div>
                </div>
                <div className="settings-status-grid">
                  <div className="settings-status-item">
                    <span>运行形态</span>
                    <strong>Electron + React + Vite</strong>
                  </div>
                  <div className="settings-status-item">
                    <span>动画播放</span>
                    <strong>Ruffle + `player.swf` 控制桥</strong>
                  </div>
                  <div className="settings-status-item">
                    <span>养成数据</span>
                    <strong>等级、经验、元宝、资料已本地持久化</strong>
                  </div>
                  <div className="settings-status-item">
                    <span>下一步</span>
                    <strong>动作状态机继续收敛，商城与原创化后续补齐</strong>
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
