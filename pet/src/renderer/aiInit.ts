/**
 * AI 引擎初始化
 * 在主窗口启动时初始化
 */

import { aiManager } from '../ai';
import { claudeConfig } from '../ai/config';

let initialized = false;

export function initializeAI() {
  if (initialized) {
    console.log('⚠️ AI 引擎已初始化，跳过');
    return;
  }

  try {
    console.log('🚀 正在初始化 AI 引擎...');

    // 注册 Claude 引擎
    const engine = aiManager.registerEngine(claudeConfig);

    // 设为默认引擎
    aiManager.setDefaultEngine('claude');

    console.log('✅ AI 引擎初始化成功:', engine.name);

    // 检查可用性（异步）
    engine.checkAvailability().then((available) => {
      if (available) {
        console.log('✅ AI 引擎可用');
      } else {
        console.error('❌ AI 引擎不可用，请检查 API Key 和网络连接');
      }
    }).catch((err) => {
      console.error('❌ 可用性检查失败:', err);
    });

    initialized = true;
  } catch (error) {
    console.error('❌ AI 引擎初始化失败:', error);
  }
}
