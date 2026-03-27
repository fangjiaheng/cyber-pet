/**
 * 简化版对话窗口 - 用于测试
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

function SimpleChat() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🦞</div>
      <h1 style={{ margin: '0 0 10px 0' }}>AI 助手</h1>
      <p style={{ margin: '0 0 20px 0', opacity: 0.9 }}>简化测试版本</p>
      <div style={{
        background: 'white',
        color: '#333',
        padding: '20px',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '100%',
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 600 }}>测试状态：</p>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>✅ React 渲染正常</li>
          <li>✅ 样式加载正常</li>
          <li>✅ 窗口显示正常</li>
        </ul>
      </div>
    </div>
  );
}

console.log('🚀 开始渲染简化版聊天窗口...');

try {
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <SimpleChat />
    </React.StrictMode>
  );
  console.log('✅ 渲染成功');
} catch (error) {
  console.error('❌ 渲染失败:', error);
}
