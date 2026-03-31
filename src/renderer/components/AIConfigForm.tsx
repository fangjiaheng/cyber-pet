/**
 * AI 配置表单 - 可复用
 * 用于：1. 聊天页未配置时的引导界面  2. 设置面板
 */

import React, { useEffect, useMemo, useState } from 'react'
import { getDefaultBaseUrlForProvider, getDefaultModelForProvider, getModelsForProvider, getProviderDefinition, getProviderOptions } from '../../ai/providerCatalog'
import type { AIProvider } from '../../ai/types'
import { initializeAI } from '../aiInit'
import './AIConfigForm.css'

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  baseUrl: string
  model: string
}

interface AIConfigFormProps {
  // 保存成功后回调
  onSaved?: (config: AIConfig) => void
  // 是否内嵌在设置面板中（影响样式）
  embedded?: boolean
}

export const AIConfigForm: React.FC<AIConfigFormProps> = ({ onSaved, embedded = false }) => {
  const [provider, setProvider] = useState<AIProvider>('claude')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState(getDefaultBaseUrlForProvider('claude'))
  const [model, setModel] = useState(getDefaultModelForProvider('claude'))
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null)
  const [showKey, setShowKey] = useState(false)
  const providerOptions = useMemo(() => getProviderOptions(), [])
  const providerDefinition = useMemo(() => getProviderDefinition(provider), [provider])
  const modelOptions = useMemo(() => getModelsForProvider(provider), [provider])

  // 加载已保存的配置
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await window.electronAPI?.storage?.getAISettings?.()
        if (stored?.provider) setProvider(stored.provider)
        if (stored?.apiKey) setApiKey(stored.apiKey)
        if (stored?.baseUrl) setBaseUrl(stored.baseUrl)
        if (stored?.defaultModel) setModel(stored.defaultModel)
      } catch {}
    }
    load()
  }, [])

  const handleProviderChange = (nextProvider: AIProvider) => {
    const currentDefaultBaseUrl = getDefaultBaseUrlForProvider(provider)
    const currentDefaultModel = getDefaultModelForProvider(provider)

    setProvider(nextProvider)

    if (!baseUrl.trim() || baseUrl === currentDefaultBaseUrl) {
      setBaseUrl(getDefaultBaseUrlForProvider(nextProvider))
    }

    if (!model.trim() || model === currentDefaultModel) {
      setModel(getDefaultModelForProvider(nextProvider))
    }

    setTestResult(null)
  }

  const handleSave = async () => {
    if (!apiKey.trim() || !baseUrl.trim() || !model.trim()) return
    setSaving(true)
    setTestResult(null)
    try {
      // 保存到存储
      await window.electronAPI?.storage?.saveAISettings?.({
        provider,
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim(),
        defaultModel: model.trim(),
      })
      // 用新配置重新初始化引擎
      await initializeAI({ provider, apiKey: apiKey.trim(), baseUrl: baseUrl.trim(), model: model.trim() })
      onSaved?.({ provider, apiKey: apiKey.trim(), baseUrl: baseUrl.trim(), model: model.trim() })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!apiKey.trim() || !baseUrl.trim() || !model.trim()) return
    setTesting(true)
    setTestResult(null)
    try {
      await initializeAI({ provider, apiKey: apiKey.trim(), baseUrl: baseUrl.trim(), model: model.trim() })
      // 发一条测试消息
      const { aiManager } = await import('../../ai')
      let ok = false
      await aiManager.executeStreamTask('回复"ok"即可', {
        onStart: () => {},
        onContent: () => { ok = true },
        onComplete: () => {},
        onError: () => { ok = false },
      }, { maxTokens: 10, model: model.trim() })
      setTestResult(ok ? 'success' : 'fail')
    } catch {
      setTestResult('fail')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className={`ai-config-form ${embedded ? 'embedded' : 'standalone'}`}>
      {!embedded && (
        <div className="config-header">
          <div className="config-icon">🦞</div>
          <h3>配置 AI 助手</h3>
          <p>请填写 API 信息以开始使用</p>
        </div>
      )}

      <div className="config-fields">
        <div className="field-group">
          <label>Provider</label>
          <select
            value={provider}
            onChange={e => handleProviderChange(e.target.value as AIProvider)}
            className="config-input"
          >
            {providerOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
          <small className="field-hint">
            {providerDefinition.region === 'global' ? 'Global provider' : 'Mainland-friendly provider'}
          </small>
        </div>

        <div className="field-group">
          <label>Base URL</label>
          <input
            type="text"
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder={providerDefinition.baseUrlPlaceholder}
            className="config-input"
          />
        </div>

        <div className="field-group">
          <label>API Key</label>
          <div className="key-input-wrapper">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-... 或 cr_..."
              className="config-input"
            />
            <button
              className="toggle-key-btn"
              onClick={() => setShowKey(v => !v)}
              title={showKey ? '隐藏' : '显示'}
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="field-group">
          <label>模型</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="config-input"
          >
            {modelOptions.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {testResult && (
        <div className={`test-result ${testResult}`}>
          {testResult === 'success' ? '✅ 连接成功' : '❌ 连接失败，请检查 URL 和 Key'}
        </div>
      )}

      <div className="config-actions">
        <button
          className="test-btn"
          onClick={handleTest}
          disabled={testing || !apiKey.trim() || !baseUrl.trim() || !model.trim()}
        >
          {testing ? '测试中...' : '测试连接'}
        </button>
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving || !apiKey.trim() || !baseUrl.trim() || !model.trim()}
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
