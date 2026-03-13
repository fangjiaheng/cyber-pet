/**
 * SWF 动画画廊（测试用）
 */

import React, { useState } from 'react'
import { swfCategories } from '../swfData'
import './SwfGallery.css'

interface SwfGalleryProps {
  onPlaySwf?: (swfUrl: string) => void
}

export const SwfGallery: React.FC<SwfGalleryProps> = ({ onPlaySwf }) => {
  const [selectedCategory, setSelectedCategory] = useState(swfCategories[0].key)
  const [selectedSwf, setSelectedSwf] = useState<string | null>(null)

  const currentCategory = swfCategories.find(c => c.key === selectedCategory)!

  return (
    <div className="swf-gallery">
      {/* 分类选择 */}
      <div className="category-tabs">
        {swfCategories.map((category) => (
          <button
            key={category.key}
            className={`category-tab ${selectedCategory === category.key ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(category.key)
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
              onPlaySwf?.(file.path)
            }}
          >
            {file.name}
          </button>
        ))}
      </div>
    </div>
  )
}
