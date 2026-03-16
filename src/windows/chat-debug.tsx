/**
 * 调试版对话窗口 - 逐步加载组件
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('🔍 Step 1: 模块加载开始');

// Step 1: 测试导入
let ChatWindow: any;
let aiManager: any;
let claudeConfig: any;

try {
  console.log('🔍 Step 2: 导入 ChatWindow 组件...');
  const chatWindowModule = await import('../components/ChatWindow');
  ChatWindow = chatWindowModule.ChatWindow;
  console.log('✅ ChatWindow 导入成功');
} catch (error) {
  console.error('❌ ChatWindow 导入失败:', error);
}

try {
  console.log('🔍 Step 3: 导入 AI 模块...');
  const aiModule = await import('../ai');
  aiManager = aiModule.aiManager;
  console.log('✅ AI 模块导入成功');
} catch (error) {
  console.error('❌ AI 模块导入失败:', error);
}

try {
  console.log('🔍 Step 4: 导入配置...');
  const configModule = await import('../ai/config');
  claudeConfig = configModule.claudeConfig;
  console.log('✅ 配置导入成功');
} catch (error) {
  console.error('❌ 配置导入失败:', error);
}

// Step 2: 测试初始化
function initializeAI() {
  try {
    console.log('🔍 Step 5: 初始化 AI 引擎...');

    if (!aiManager) {
      throw new Error('aiManager 未定义');
    }

    if (!claudeConfig) {
      throw new Error('claudeConfig 未定义');
    }

    console.log('配置内容:', claudeConfig);

    const engine = aiManager.registerEngine(claudeConfig);
    aiManager.setDefaultEngine('claude');

    console.log('✅ AI 引擎初始化成功:', engine.name);

    engine.checkAvailability().then((available: boolean) => {
      if (available) {
        console.log('✅ AI 引擎可用');
      } else {
        console.error('❌ AI 引擎不可用');
      }
    }).catch((err: any) => {
      console.error('❌ 可用性检查失败:', err);
    });
  } catch (error) {
    console.error('❌ AI 引擎初始化失败:', error);
  }
}

// Step 3: 测试渲染
function render() {
  console.log('🔍 Step 6: 开始渲染...');

  const root = ReactDOM.createRoot(document.getElementById('root')!);

  if (ChatWindow) {
    console.log('✅ 使用完整版 ChatWindow');
    root.render(
      <React.StrictMode>
        <ChatWindow />
      </React.StrictMode>
    );
  } else {
    console.log('⚠️ ChatWindow 不可用，使用降级版本');
    root.render(
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        fontFamily: 'system-ui',
      }}>
        <div>
          <h1>❌ ChatWindow 组件加载失败</h1>
          <p>请查看控制台了解详情</p>
        </div>
      </div>
    );
  }

  console.log('✅ 渲染完成');
}

// 执行
console.log('🔍 开始调试流程...');
initializeAI();
render();
