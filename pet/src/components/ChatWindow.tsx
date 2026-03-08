/**
 * AI 对话窗口组件
 * 让宠物能够通过对话来执行各种任务
 */

import React, { useState, useRef, useEffect } from 'react';
import { aiManager, tokenManager } from '../ai';
import { taskTypes, availableModels } from '../ai/config';
import type { TokenUsage } from '../ai/types';
import './ChatWindow.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  usage?: TokenUsage;
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState('chat');
  const [selectedModel, setSelectedModel] = useState(availableModels[0].id);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 聚焦输入框
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  // 添加消息
  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      },
    ]);
  };

  // 获取当前任务类型配置
  const currentTaskType = taskTypes.find((t) => t.id === selectedTaskType);

  // 发送消息
  const handleSend = async () => {
    const userInput = input.trim();
    if (!userInput || loading) return;

    // 添加用户消息
    addMessage({
      role: 'user',
      content: userInput,
    });

    setInput('');
    setLoading(true);

    try {
      let fullResponse = '';
      let responseUsage: TokenUsage | undefined;

      // 构建提示词（如果有系统提示）
      const prompt = currentTaskType?.systemPrompt
        ? `${currentTaskType.systemPrompt}\n\n用户输入：${userInput}`
        : userInput;

      // 使用流式响应
      await aiManager.executeStreamTask(
        prompt,
        {
          onStart: () => {
            // 添加空的助手消息
            addMessage({
              role: 'assistant',
              content: '',
            });
          },
          onContent: (delta) => {
            fullResponse += delta;
            // 更新最后一条消息
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content = fullResponse;
              }
              return newMessages;
            });
          },
          onComplete: (response) => {
            responseUsage = response.usage;

            // 更新最后一条消息的 usage
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.usage = responseUsage;
              }
              return newMessages;
            });

            // 记录 Token 使用
            tokenManager.addRecord('openclaw', selectedTaskType, response.usage, {
              prompt: userInput,
              response: fullResponse,
            });

            setLoading(false);
          },
          onError: (error) => {
            console.error('AI 响应错误:', error);
            addMessage({
              role: 'system',
              content: `❌ 错误: ${error.message}`,
            });
            setLoading(false);
          },
        },
        {
          temperature: currentTaskType?.temperature || 0.7,
          maxTokens: currentTaskType?.maxTokens || 2000,
          model: selectedModel,
        }
      );
    } catch (error: any) {
      console.error('发送失败:', error);
      addMessage({
        role: 'system',
        content: `❌ 发送失败: ${error.message}`,
      });
      setLoading(false);
    }
  };

  // 处理快捷键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter 发送
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // 清空对话
  const handleClear = () => {
    if (window.confirm('确定要清空所有对话记录吗？')) {
      setMessages([]);
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="chat-window">
      {/* 标题栏 */}
      <div className="chat-header">
        <div className="chat-title">
          <span className="pet-icon">🦞</span>
          <span>AI 助手</span>
        </div>
        <div className="chat-actions">
          <button
            className="icon-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="设置"
          >
            ⚙️
          </button>
          <button className="icon-btn" onClick={handleClear} title="清空对话">
            🗑️
          </button>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="chat-settings">
          <div className="setting-group">
            <label>任务类型</label>
            <div className="task-type-grid">
              {taskTypes.map((type) => (
                <button
                  key={type.id}
                  className={`task-type-btn ${
                    selectedTaskType === type.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedTaskType(type.id)}
                  title={type.name}
                >
                  <span className="task-icon">{type.icon}</span>
                  <span className="task-name">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label>AI 模型</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🦞</div>
            <p className="empty-text">你好！我是你的 AI 助手</p>
            <p className="empty-hint">
              选择任务类型开始对话，或直接输入你的问题
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' ? '👤' : message.role === 'assistant' ? '🦞' : 'ℹ️'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-footer">
                <span className="message-time">{formatTime(message.timestamp)}</span>
                {message.usage && (
                  <span className="message-tokens">
                    {message.usage.totalTokens} tokens
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-assistant">
            <div className="message-avatar">🦞</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="chat-input-area">
        <div className="current-task-indicator">
          {currentTaskType && (
            <span>
              {currentTaskType.icon} {currentTaskType.name}
            </span>
          )}
        </div>
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentTaskType?.id === 'chat'
                ? '输入消息... (Cmd/Ctrl + Enter 发送)'
                : `${currentTaskType?.name}...`
            }
            rows={3}
            disabled={loading}
            className="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="send-btn"
          >
            {loading ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
}
