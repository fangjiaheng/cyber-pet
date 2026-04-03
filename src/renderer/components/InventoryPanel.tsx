import { useMemo, useRef, useState } from 'react'
import { useWindowDrag } from '../hooks/useWindowDrag'
import { useInventoryStore } from '../stores/inventoryStore'
import { type ItemCategory } from '../../shared/itemCatalog'
import './InventoryPanel.css'

const TABS: { key: ItemCategory; label: string }[] = [
  { key: 'food', label: '食物' },
  { key: 'commodity', label: '清洁' },
  { key: 'medicine', label: '药品' },
  { key: 'background', label: '背景' },
]

const ITEMS_PER_PAGE = 8

function resolveAssetUrl(path: string) {
  if (typeof window === 'undefined') return path
  return new URL(path.replace(/^\/+/, ''), window.location.href).toString()
}

interface InventoryPanelProps {
  onClose: () => void
}

export function InventoryPanel({ onClose }: InventoryPanelProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  useWindowDrag(headerRef)

  const { getItemsByCategory } = useInventoryStore()
  const [activeTab, setActiveTab] = useState<ItemCategory>('food')
  const [page, setPage] = useState(0)

  const items = useMemo(() => getItemsByCategory(activeTab), [getItemsByCategory, activeTab])
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE))
  const pageItems = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="inventory-panel">
      <div className="inventory-header" ref={headerRef}>
        <div>
          <p className="inventory-eyebrow">背包</p>
          <h2>我的物品</h2>
        </div>
        <button className="inventory-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="inventory-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`inventory-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.key); setPage(0) }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="inventory-count">{activeTab === 'food' ? '食物' : activeTab === 'commodity' ? '清洁' : activeTab === 'medicine' ? '药品' : '背景'} 共 {totalCount} 件</div>

      <div className="inventory-items">
        {pageItems.map(({ item, quantity }) => (
          <div key={item.id} className="inventory-item-card">
            <div className="inventory-item-icon">
              <img
                src={resolveAssetUrl(item.iconPath)}
                alt={item.name}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
            <div className="inventory-item-info">
              <div className="inventory-item-name">{item.name}</div>
              <div className="inventory-item-stats">
                {[
                  item.starve > 0 && `饥饿+${item.starve}`,
                  item.clean > 0 && `清洁+${item.clean}`,
                  item.charm > 0 && `魅力+${item.charm}`,
                  item.intel > 0 && `智力+${item.intel}`,
                  item.strong > 0 && `武力+${item.strong}`,
                ].filter(Boolean).join('  ') || (item.desc || '装饰物品')}
              </div>
            </div>
            <span className="inventory-item-qty">×{quantity}</span>
          </div>
        ))}
        {pageItems.length === 0 && (
          <div className="inventory-empty">暂无物品</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="inventory-pagination">
          <button className="inventory-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>◀</button>
          <span className="inventory-page-info">{page + 1} / {totalPages}</span>
          <button className="inventory-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>▶</button>
        </div>
      )}
    </div>
  )
}
