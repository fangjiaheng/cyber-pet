/**
 * SWF 动画画廊
 * 展示和测试所有原版 Flash 动画
 */

import React, { useState } from 'react'
import { RufflePlayer } from './RufflePlayer'
import './SwfGallery.css'

// SWF 动画分类
const swfCategories = {
  chang: {
    name: '常规动作',
    icon: '🐧',
    files: [
      { id: '1', name: '动作1', path: '/assets/swf_original/GG/chang/1.swf' },
      { id: '2', name: '动作2', path: '/assets/swf_original/GG/chang/2.swf' },
      { id: '3', name: '动作3', path: '/assets/swf_original/GG/chang/3.swf' },
      { id: '4', name: '动作4', path: '/assets/swf_original/GG/chang/4.swf' },
      { id: '5', name: '动作5', path: '/assets/swf_original/GG/chang/5.swf' },
      { id: '6', name: '动作6', path: '/assets/swf_original/GG/chang/6.swf' },
      { id: '7', name: '动作7', path: '/assets/swf_original/GG/chang/7.swf' },
      { id: '8', name: '动作8', path: '/assets/swf_original/GG/chang/8.swf' },
      { id: '9', name: '动作9', path: '/assets/swf_original/GG/chang/9.swf' },
      { id: '10', name: '动作10', path: '/assets/swf_original/GG/chang/10.swf' },
      { id: '11', name: '动作11', path: '/assets/swf_original/GG/chang/11.swf' },
      { id: '12', name: '动作12', path: '/assets/swf_original/GG/chang/12.swf' },
      { id: 'drag', name: '拖拽', path: '/assets/swf_original/GG/chang/drag.swf' },
      { id: 'drop', name: '掉落', path: '/assets/swf_original/GG/chang/drop.swf' },
      { id: 'land', name: '着陆', path: '/assets/swf_original/GG/chang/land.swf' },
      { id: 'ok', name: '确认', path: '/assets/swf_original/GG/chang/ok.swf' },
    ],
  },
  e: {
    name: '饮食活动',
    icon: '🍖',
    files: [
      { id: 'chi1', name: '吃饭1', path: '/assets/swf_original/GG/e/chi1.swf' },
      { id: 'chi2', name: '吃饭2', path: '/assets/swf_original/GG/e/chi2.swf' },
      { id: 'chi3', name: '吃饭3', path: '/assets/swf_original/GG/e/chi3.swf' },
      { id: 'he1', name: '喝水1', path: '/assets/swf_original/GG/e/he1.swf' },
      { id: 'he2', name: '喝水2', path: '/assets/swf_original/GG/e/he2.swf' },
      { id: 'he3', name: '喝水3', path: '/assets/swf_original/GG/e/he3.swf' },
      { id: 'xizao', name: '洗澡', path: '/assets/swf_original/GG/e/xizao.swf' },
      { id: 'study', name: '学习', path: '/assets/swf_original/GG/e/study.swf' },
      { id: 'work', name: '工作', path: '/assets/swf_original/GG/e/work.swf' },
    ],
  },
  bing: {
    name: '生病状态',
    icon: '🤒',
    files: [
      { id: '1', name: '生病1', path: '/assets/swf_original/GG/bing/1.swf' },
      { id: '2', name: '生病2', path: '/assets/swf_original/GG/bing/2.swf' },
      { id: '3', name: '生病3', path: '/assets/swf_original/GG/bing/3.swf' },
    ],
  },
  other: {
    name: '特殊动作',
    icon: '✨',
    files: [
      { id: 'lai0', name: '入场0', path: '/assets/swf_original/GG/other/lai0.swf' },
      { id: 'lai1', name: '入场1', path: '/assets/swf_original/GG/other/lai1.swf' },
      { id: 'lai2', name: '入场2', path: '/assets/swf_original/GG/other/lai2.swf' },
      { id: 'lai3', name: '入场3', path: '/assets/swf_original/GG/other/lai3.swf' },
      { id: 'qu0', name: '离开0', path: '/assets/swf_original/GG/other/qu0.swf' },
      { id: 'qu1', name: '离开1', path: '/assets/swf_original/GG/other/qu1.swf' },
      { id: 'shengji', name: '升级', path: '/assets/swf_original/GG/other/shengji.swf' },
      { id: 'si0', name: '死亡0', path: '/assets/swf_original/GG/other/si0.swf' },
      { id: 'si1', name: '死亡1', path: '/assets/swf_original/GG/other/si1.swf' },
    ],
  },
  zt: {
    name: '状态',
    icon: '💭',
    files: [
      { id: 'e', name: '饿', path: '/assets/swf_original/GG/zt/e.swf' },
      { id: 'yang', name: '养育', path: '/assets/swf_original/GG/zt/yang.swf' },
    ],
  },
}

export const SwfGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof swfCategories>('chang')
  const [selectedSwf, setSelectedSwf] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const currentCategory = swfCategories[selectedCategory]

  return (
    <div className="swf-gallery">
      <div className="gallery-header">
        <h2>🎬 Flash 动画画廊</h2>
        <p>原版 QQ 宠物 .swf 动画测试</p>
      </div>

      {/* 分类选择 */}
      <div className="category-tabs">
        {Object.entries(swfCategories).map(([key, category]) => (
          <button
            key={key}
            className={`category-tab ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(key as keyof typeof swfCategories)
              setSelectedSwf(null)
            }}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* 动画列表 */}
      <div className="animation-list">
        {currentCategory.files.map((file) => (
          <button
            key={file.id}
            className={`animation-item ${selectedSwf === file.path ? 'active' : ''}`}
            onClick={() => {
              setSelectedSwf(file.path)
              setLoadError(null)
            }}
          >
            {file.name}
          </button>
        ))}
      </div>

      {/* 播放器 */}
      <div className="player-container">
        {selectedSwf ? (
          <>
            <div className="player-info">
              <span>当前播放: {selectedSwf.split('/').pop()}</span>
            </div>
            <div className="player-wrapper">
              <RufflePlayer
                key={selectedSwf}
                src={selectedSwf}
                width={200}
                height={200}
                scale={1.5}
                onError={(error) => setLoadError(error.message)}
              />
            </div>
            {loadError && (
              <div className="error-message">
                加载失败: {loadError}
              </div>
            )}
          </>
        ) : (
          <div className="empty-player">
            <div className="empty-icon">🎬</div>
            <p>选择一个动画开始播放</p>
          </div>
        )}
      </div>
    </div>
  )
}
