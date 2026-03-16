/**
 * AI 配置表单 - 可复用
 * 用于：1. 聊天页未配置时的引导界面  2. 设置面板
 */

import React, { useState, useEffect } from 'react'
import { availableModels } from '../../ai/config'
import { initializeAI } from '../aiInit'
import './AIConfigForm.css'

export interface AIConfig {
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
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://api.anthropic.com')
  const [model, setModel] = useState(availableModels[0].id)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null)
  const [showKey, setShowKey] = useState(false)

  // 加载已保存的配置
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await window.electronAPI?.storage?.getAISettings?.()
        if (stored?.apiKey) setApiKey(stored.apiKey)
        if (stored?.baseUrl) setBaseUrl(stored.baseUrl)
        if (stored?.defaultModel) setModel(stored.defaultModel)
      } catch (e) {}
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!apiKey.trim() || !baseUrl.trim()) return
    setSaving(true)
    setTestResult(null)
    try {
      // 保存到存储
      await window.electronAPI?.storage?.saveAISettings?.({
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim(),
        defaultModel: model,
        provider: 'claude',
      })
      // 用新配置重新初始化引擎
      await initializeAI({ apiKey: apiKey.trim(), baseUrl: baseUrl.trim(), model })
      onSaved?.({ apiKey: apiKey.trim(), baseUrl: baseUrl.trim(), model })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!apiKey.trim() || !baseUrl.trim()) return
    setTesting(true)
    setTestResult(null)
    try {
      await initializeAI({ apiKey: apiKey.trim(), baseUrl: baseUrl.trim(), model })
      // 发一条测试消息
      const { aiManager } = await import('../../ai')
      let ok = false
      await aiManager.executeStreamTask('回复"ok"即可', {
        onStart: () => {},
        onContent: () => { ok = true },
        onComplete: () => {},
        onError: () => { ok = false },
      }, { maxTokens: 10, model })
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
          <label>Base URL</label>
          <input
            type="text"
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="https://api.anthropic.com"
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
            {availableModels.map(m => (
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
          disabled={testing || !apiKey.trim() || !baseUrl.trim()}
        >
          {testing ? '测试中...' : '测试连接'}
        </button>
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving || !apiKey.trim() || !baseUrl.trim()}
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
