/**
 * 存储查看器组件
 * 显示存储位置和数据内容
 */

import React, { useState, useEffect } from 'react';

export function StorageViewer() {
  const [storagePath, setStoragePath] = useState('');
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    if (!window.electronAPI?.storage) return;

    try {
      // 获取统计信息
      const statistics = await window.electronAPI.storage.getStatistics();
      setStats(statistics);

      // 获取所有数据
      const allData = await window.electronAPI.storage.exportData();
      setData(allData);

      // 存储路径（根据平台）
      const platform = window.electronAPI.platform;
      let path = '';

      if (platform === 'darwin') {
        path = '~/Library/Application Support/Electron/config.json';
      } else if (platform === 'win32') {
        path = '%APPDATA%/Electron/config.json';
      } else {
        path = '~/.config/Electron/config.json';
      }

      setStoragePath(path);
    } catch (error) {
      console.error('加载存储信息失败:', error);
    }
  };

  const handleExport = () => {
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pet-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = async () => {
    if (!window.confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      return;
    }

    if (window.electronAPI?.storage) {
      window.electronAPI.storage.resetAll();
      alert('已清空所有数据！');
      loadStorageInfo();
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{ marginTop: 0 }}>📦 数据存储</h2>

      {/* 存储路径 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>存储位置</h3>
        <code style={{
          display: 'block',
          padding: '10px',
          background: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
          {storagePath}
        </code>
        <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
          💡 提示：可以在终端运行 <code>cat "{storagePath.replace('~', '$HOME')}"</code> 查看内容
        </p>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div style={{ marginBottom: '20px' }}>
          <h3>统计信息</h3>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0' }}>运行天数：</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{stats.totalDays} 天</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}>总任务数：</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{stats.totalTasks}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}>总 Token：</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{stats.totalTokens.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}>总成本：</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>${stats.totalCost.toFixed(4)}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', borderTop: '1px solid #eee' }}>今日任务：</td>
                <td style={{ textAlign: 'right', fontWeight: 600, borderTop: '1px solid #eee' }}>{stats.todayTasks}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}>今日 Token：</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{stats.todayTokens.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}>今日成本：</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>${stats.todayCost.toFixed(4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 数据预览 */}
      {data && (
        <div style={{ marginBottom: '20px' }}>
          <h3>数据预览</h3>
          <div style={{
            maxHeight: '200px',
            overflow: 'auto',
            background: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
          }}>
            <pre style={{ margin: 0 }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleExport}
          style={{
            flex: 1,
            padding: '10px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          导出数据
        </button>
        <button
          onClick={loadStorageInfo}
          style={{
            flex: 1,
            padding: '10px',
            background: '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          刷新
        </button>
        <button
          onClick={handleClearAll}
          style={{
            flex: 1,
            padding: '10px',
            background: '#f56565',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          清空数据
        </button>
      </div>
    </div>
  );
}
