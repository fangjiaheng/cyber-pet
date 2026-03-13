import React, { useEffect, useMemo, useRef, useState } from 'react'
import { availableModels } from '../../ai/config'
import { AIConfig, AIConfigForm } from './AIConfigForm'
import { useWindowDrag } from '../hooks/useWindowDrag'
import './SettingsPanel.css'

interface StoredAISettings {
  provider?: 'claude' | 'openclaw'
  apiKey?: string
  baseUrl?: string
  defaultModel?: string
}

interface SettingsPanelProps {
  onClose: () => void
  onSaved?: (config: AIConfig) => void
  onOpenChat?: () => void
}

function maskApiKey(apiKey?: string) {
  if (!apiKey) return '未设置'
  if (apiKey.length <= 10) return `${apiKey.slice(0, 3)}***`
  return `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`
}

export function SettingsPanel({ onClose, onSaved, onOpenChat }: SettingsPanelProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  const [settings, setSettings] = useState<StoredAISettings | null>(null)
  const [loading, setLoading] = useState(true)

  useWindowDrag(headerRef)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await window.electronAPI?.storage?.getAISettings?.()
        setSettings(stored ?? null)
      } catch (error) {
        console.error('加载 AI 设置失败:', error)
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

  const handleSaved = (config: AIConfig) => {
    setSettings({
      provider: 'claude',
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      defaultModel: config.model,
    })
    onSaved?.(config)
  }

  const configured = Boolean(settings?.apiKey && settings?.baseUrl)

  return (
    <div className="settings-panel">
      <div ref={headerRef} className="settings-panel-header">
        <div>
          <p className="settings-eyebrow">AI 助手配置</p>
          <h2>AI 助手配置</h2>
          <p className="settings-subtitle">在这里管理模型、Base URL 和 API Key。保存后会立即用于后续对话。</p>
        </div>
        <button
          className="settings-close-btn"
          data-window-drag-ignore="true"
          onClick={onClose}
          title="关闭 AI 助手配置"
        >
          ✕
        </button>
      </div>

      <div className="settings-panel-body">
        <section className="settings-card settings-card-hero">
          <div className="settings-card-header">
            <div>
              <span className="settings-card-kicker">连接状态</span>
              <h3>当前配置概览</h3>
            </div>
            <span className={`settings-badge ${configured ? 'ok' : 'warn'}`}>
              {loading ? '读取中...' : configured ? '已配置' : '未配置'}
            </span>
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
      </div>
    </div>
  )
}
