/**
 * React 组件集成示例
 * 展示如何在 React 组件中使用 AI 引擎
 */

import React, { useState, useEffect } from 'react';
import { aiManager, tokenManager } from '../index';
import type { TokenStatistics } from '../TokenManager';

// ============ 示例 1: 简单聊天组件 ============

export function SimpleChatComponent() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await aiManager.executeTask(message, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      setResponse(result.content);

      // 记录 Token 使用
      tokenManager.addRecord('openclaw', 'chat', result.usage, {
        prompt: message,
        response: result.content,
      });
    } catch (err: any) {
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h3>简单聊天</h3>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入你的问题..."
        rows={4}
        style={{ width: '100%', marginBottom: '10px' }}
      />

      <button onClick={handleSend} disabled={loading}>
        {loading ? '发送中...' : '发送'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          错误: {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
          <strong>回复:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

// ============ 示例 2: 流式聊天组件 ============

export function StreamChatComponent() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');

    try {
      await aiManager.executeStreamTask(
        message,
        {
          onStart: () => {
            console.log('开始接收响应');
          },
          onContent: (delta) => {
            setResponse((prev) => prev + delta);
          },
          onComplete: (result) => {
            console.log('响应完成', result.usage);

            // 记录 Token 使用
            tokenManager.addRecord('openclaw', 'stream-chat', result.usage, {
              prompt: message,
              response: result.content,
            });

            setLoading(false);
          },
          onError: (err) => {
            setError(err.message);
            setLoading(false);
          },
        },
        {
          temperature: 0.7,
          maxTokens: 2000,
        }
      );
    } catch (err: any) {
      setError(err.message || '请求失败');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h3>流式聊天</h3>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入你的问题..."
        rows={4}
        style={{ width: '100%', marginBottom: '10px' }}
        disabled={loading}
      />

      <button onClick={handleSend} disabled={loading}>
        {loading ? '接收中...' : '发送'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          错误: {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
          <strong>回复:</strong>
          <p style={{ whiteSpace: 'pre-wrap' }}>{response}</p>
        </div>
      )}
    </div>
  );
}

// ============ 示例 3: Token 统计面板 ============

export function TokenStatsPanel() {
  const [stats, setStats] = useState<TokenStatistics[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const todayStats = tokenManager.getTodayStatistics();
    setStats(todayStats);
  }, [refreshKey]);

  const refresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Token 使用统计</h3>
        <button onClick={refresh}>刷新</button>
      </div>

      {stats.length === 0 ? (
        <p>暂无数据</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>引擎</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>任务数</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>总 Token</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>平均</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>成本</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => (
              <tr key={stat.provider} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{stat.provider}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>{stat.taskCount}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  {stat.totalTokens.toLocaleString()}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  {stat.averageTokensPerTask.toFixed(0)}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  ${stat.totalCost.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ============ 示例 4: AI 任务助手组件 ============

type TaskType = 'email' | 'code-review' | 'translate' | 'summarize' | 'custom';

export function AITaskAssistant() {
  const [taskType, setTaskType] = useState<TaskType>('custom');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const taskPrompts: Record<TaskType, (input: string) => string> = {
    email: (content) => `请帮我整理以下邮件，提取关键信息和待办事项：\n\n${content}`,
    'code-review': (code) => `请审查以下代码，指出问题和改进建议：\n\n${code}`,
    translate: (text) => `请将以下内容翻译成英文：\n\n${text}`,
    summarize: (text) => `请用 3-5 句话总结以下内容：\n\n${text}`,
    custom: (text) => text,
  };

  const handleExecute = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setOutput('');

    const prompt = taskPrompts[taskType](input);

    try {
      await aiManager.executeStreamTask(
        prompt,
        {
          onContent: (delta) => {
            setOutput((prev) => prev + delta);
          },
          onComplete: (result) => {
            tokenManager.addRecord('openclaw', taskType, result.usage);
            setLoading(false);
          },
          onError: () => {
            setLoading(false);
          },
        },
        {
          temperature: taskType === 'code-review' ? 0.3 : 0.7,
          maxTokens: 2000,
        }
      );
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h3>AI 任务助手</h3>

      <div style={{ marginBottom: '10px' }}>
        <label>任务类型：</label>
        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value as TaskType)}
          style={{ marginLeft: '10px' }}
        >
          <option value="email">邮件整理</option>
          <option value="code-review">代码审查</option>
          <option value="translate">翻译</option>
          <option value="summarize">内容摘要</option>
          <option value="custom">自定义</option>
        </select>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入内容..."
        rows={8}
        style={{ width: '100%', marginBottom: '10px' }}
        disabled={loading}
      />

      <button onClick={handleExecute} disabled={loading}>
        {loading ? '处理中...' : '执行任务'}
      </button>

      {output && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
          <strong>结果:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{output}</pre>
        </div>
      )}
    </div>
  );
}

// ============ 示例 5: 完整的应用示例 ============

export function AIIntegrationDemo() {
  const [activeTab, setActiveTab] = useState<'simple' | 'stream' | 'task' | 'stats'>('simple');

  // 初始化 OpenClaw 引擎
  useEffect(() => {
    try {
      aiManager.registerEngine({
        provider: 'openclaw',
        apiKey: 'your-token-here',  // 从环境变量或配置中读取
        baseUrl: 'http://localhost:8181',
        model: 'gpt-4',
      });
      aiManager.setDefaultEngine('openclaw');
      console.log('OpenClaw 引擎初始化成功');
    } catch (error) {
      console.error('初始化失败:', error);
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>AI 引擎集成演示</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('simple')}>简单聊天</button>
        <button onClick={() => setActiveTab('stream')} style={{ marginLeft: '10px' }}>
          流式聊天
        </button>
        <button onClick={() => setActiveTab('task')} style={{ marginLeft: '10px' }}>
          任务助手
        </button>
        <button onClick={() => setActiveTab('stats')} style={{ marginLeft: '10px' }}>
          统计面板
        </button>
      </div>

      {activeTab === 'simple' && <SimpleChatComponent />}
      {activeTab === 'stream' && <StreamChatComponent />}
      {activeTab === 'task' && <AITaskAssistant />}
      {activeTab === 'stats' && <TokenStatsPanel />}
    </div>
  );
}
