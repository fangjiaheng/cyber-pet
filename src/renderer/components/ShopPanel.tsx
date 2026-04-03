import { useCallback, useMemo, useRef, useState } from 'react'
import { useWindowDrag } from '../hooks/useWindowDrag'
import { usePetStore } from '../stores/petStore'
import { useInventoryStore } from '../stores/inventoryStore'
import { useShallow } from 'zustand/react/shallow'
import {
  type ItemCategory,
  type ShopItem,
  getPurchasableItems,
} from '../../shared/itemCatalog'
import './ShopPanel.css'

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

interface ShopPanelProps {
  onClose: () => void
  onNotice?: (message: string) => void
}

export function ShopPanel({ onClose, onNotice }: ShopPanelProps) {
  const headerRef = useRef<HTMLDivElement | null>(null)
  useWindowDrag(headerRef)

  const { yuanbao, earnYuanbao } = usePetStore(useShallow((state) => ({
    yuanbao: state.yuanbao,
    earnYuanbao: state.earnYuanbao,
  })))

  const { addItem, getItemCount } = useInventoryStore()

  const [activeTab, setActiveTab] = useState<ItemCategory>('food')
  const [page, setPage] = useState(0)
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [buyFeedback, setBuyFeedback] = useState<string | null>(null)

  const items = useMemo(() => getPurchasableItems(activeTab), [activeTab])
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE))
  const pageItems = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const handleTabChange = useCallback((tab: ItemCategory) => {
    setActiveTab(tab)
    setPage(0)
    setSelectedItem(null)
  }, [])

  const handleBuy = useCallback((item: ShopItem) => {
    if (yuanbao < item.price) {
      setBuyFeedback('元宝不足！')
      setTimeout(() => setBuyFeedback(null), 1500)
      return
    }
    // 扣除元宝
    earnYuanbao(-item.price)
    addItem(item.id)
    setBuyFeedback(`成功购买 ${item.name}！`)
    onNotice?.(`购买了 ${item.name}`)
    setTimeout(() => setBuyFeedback(null), 1500)
  }, [yuanbao, earnYuanbao, addItem, onNotice])

  const formatStats = (item: ShopItem) => {
    const parts: string[] = []
    if (item.starve > 0) parts.push(`饥饿 +${item.starve}`)
    if (item.clean > 0) parts.push(`清洁 +${item.clean}`)
    if (item.charm > 0) parts.push(`魅力 +${item.charm}`)
    if (item.intel > 0) parts.push(`智力 +${item.intel}`)
    if (item.strong > 0) parts.push(`武力 +${item.strong}`)
    return parts.join('  ')
  }

  return (
    <div className="shop-panel">
      <div className="shop-panel-header" ref={headerRef}>
        <div>
          <p className="shop-eyebrow">商店</p>
          <h2>Q宠百货</h2>
          <p className="shop-yuanbao">元宝: {yuanbao}</p>
        </div>
        <button className="shop-close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Tab 栏 */}
      <div className="shop-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`shop-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 反馈消息 */}
      {buyFeedback && (
        <div className="shop-feedback">{buyFeedback}</div>
      )}

      {/* 商品列表 */}
      <div className="shop-items">
        {pageItems.map((item) => {
          const owned = getItemCount(item.id)
          const canAfford = yuanbao >= item.price
          return (
            <div
              key={item.id}
              className={`shop-item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="shop-item-icon">
                <img
                  src={resolveAssetUrl(item.iconPath)}
                  alt={item.name}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
              <div className="shop-item-info">
                <div className="shop-item-name">{item.name}</div>
                <div className="shop-item-stats">{formatStats(item) || (item.desc || '装饰物品')}</div>
                {owned > 0 && <div className="shop-item-owned">已有 ×{owned}</div>}
              </div>
              <div className="shop-item-actions">
                <span className="shop-item-price">{item.price} 元宝</span>
                <button
                  className={`shop-buy-btn ${!canAfford ? 'disabled' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleBuy(item) }}
                  disabled={!canAfford}
                >
                  购买
                </button>
              </div>
            </div>
          )
        })}
        {pageItems.length === 0 && (
          <div className="shop-empty">暂无商品</div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="shop-pagination">
          <button
            className="shop-page-btn"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            ◀
          </button>
          <span className="shop-page-info">{page + 1} / {totalPages}</span>
          <button
            className="shop-page-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            ▶
          </button>
        </div>
      )}

      {/* 选中商品的详细信息 */}
      {selectedItem && (
        <div className="shop-detail">
          <div className="shop-detail-name">{selectedItem.name}</div>
          <div className="shop-detail-stats">{formatStats(selectedItem)}</div>
          {selectedItem.desc && <div className="shop-detail-desc">{selectedItem.desc}</div>}
          {selectedItem.rectype && (
            <span className={`shop-badge shop-badge-${selectedItem.rectype}`}>
              {selectedItem.rectype === 'hot' ? '热卖' : selectedItem.rectype === 'new' ? '新品' : '推荐'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
