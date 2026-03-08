/**
 * AI 对话窗口入口文件
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWindow } from '../components/ChatWindow';
import { aiManager } from '../ai';
import { claudeConfig } from '../ai/config';

// 初始化 AI 引擎
function initializeAI() {
  try {
    console.log('正在初始化 AI 引擎...');

    // 注册 Claude 引擎（直接调用，无需 OpenClaw Gateway）
    const engine = aiManager.registerEngine(claudeConfig);

    // 设为默认引擎
    aiManager.setDefaultEngine('claude');

    console.log('AI 引擎初始化成功:', engine.name);

    // 检查可用性
    engine.checkAvailability().then((available) => {
      if (available) {
        console.log('✅ AI 引擎可用');
      } else {
        console.error('❌ AI 引擎不可用，请检查 API Key 和网络连接');
      }
    });
  } catch (error) {
    console.error('AI 引擎初始化失败:', error);
  }
}

// 初始化
initializeAI();

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ChatWindow />
  </React.StrictMode>
);
