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

const ITEMS_PER_PAGE = 9 // 3×3 网格

const BADGE_LABEL: Record<string, string> = {
  hot: 'Hot',
  new: 'New',
  recommand: '推荐',
}

function resolveAssetUrl(path: string) {
  if (typeof window === 'undefined') return path
  return new URL(path.replace(/^\/+/, ''), window.location.href).toString()
}

interface ShopPanelProps {
  onClose: () => void
  onNotice?: (message: string) => void
}

export function ShopPanel({ onClose, onNotice }: ShopPanelProps) {
  const dragRef = useRef<HTMLDivElement | null>(null)
  useWindowDrag(dragRef)

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
  const emptySlots = ITEMS_PER_PAGE - pageItems.length

  // 推荐商品（取前 2 个有 rectype 的）
  const featuredItems = useMemo(() => {
    const all = [
      ...getPurchasableItems('food'),
      ...getPurchasableItems('commodity'),
      ...getPurchasableItems('medicine'),
    ]
    return all.filter((i) => i.rectype).slice(0, 2)
  }, [])

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
      {/* 顶部 */}
      <header className="shop-header" ref={dragRef}>
        <div className="shop-header-title">
          <span className="shop-header-eyebrow">SHOP</span>
          <h2>宠物商城</h2>
        </div>
        <div className="shop-header-actions">
          <div className="shop-yuanbao-pill">{yuanbao.toLocaleString()} 元宝</div>
          <button className="shop-close-btn" onClick={onClose}>✕</button>
        </div>
      </header>

      {/* 主区 */}
      <div className="shop-main">
        {/* 分类 tabs */}
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

        {/* 推荐区 */}
        {featuredItems.length > 0 && (
          <section className="shop-featured">
            <div className="shop-featured-title">热门推荐</div>
            <div className="shop-featured-cards">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="shop-featured-card"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="shop-featured-card-icon">
                    <img
                      src={resolveAssetUrl(item.iconPath)}
                      alt={item.name}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                  <div className="shop-featured-card-info">
                    <div className="shop-featured-card-name">{item.name}</div>
                    <div className="shop-featured-card-price">{item.price} 元宝</div>
                  </div>
                  {item.rectype && BADGE_LABEL[item.rectype] && (
                    <div className="shop-featured-card-badge">{BADGE_LABEL[item.rectype]}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 商品网格 */}
        <div className="shop-items-area">
          {pageItems.map((item) => {
            const owned = getItemCount(item.id)
            return (
              <div
                key={item.id}
                className={`shop-item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedItem(item)}
                title={item.name}
              >
                <div className="shop-item-icon">
                  <img
                    src={resolveAssetUrl(item.iconPath)}
                    alt={item.name}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
                <div className="shop-item-name">{item.name}</div>
                <div className="shop-item-price">{item.price}</div>
                {item.rectype && BADGE_LABEL[item.rectype] && (
                  <div className="shop-item-badge" data-kind={item.rectype}>
                    {BADGE_LABEL[item.rectype]}
                  </div>
                )}
                {owned > 0 && <div className="shop-item-owned">x{owned}</div>}
              </div>
            )
          })}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${i}`} className="shop-item-card shop-item-card-empty" />
          ))}
        </div>
      </div>

      {/* 底部分页 */}
      <footer className="shop-footer">
        <button
          className="shop-page-btn"
          disabled={page === 0}
          onClick={() => setPage(0)}
          title="第一页"
        >
          «
        </button>
        <button
          className="shop-page-btn"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          title="上一页"
        >
          ‹
        </button>
        <span className="shop-page-info">
          第 {page + 1} / {totalPages} 页
        </span>
        <button
          className="shop-page-btn"
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => p + 1)}
          title="下一页"
        >
          ›
        </button>
        <button
          className="shop-page-btn"
          disabled={page >= totalPages - 1}
          onClick={() => setPage(totalPages - 1)}
          title="末页"
        >
          »
        </button>
      </footer>

      {/* 右侧详情 */}
      <aside className="shop-detail-area">
        {selectedItem ? (
          <>
            <div className="shop-detail-icon">
              <img
                src={resolveAssetUrl(selectedItem.iconPath)}
                alt={selectedItem.name}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
            <div className="shop-detail-name">{selectedItem.name}</div>
            {formatStats(selectedItem) && (
              <div className="shop-detail-stats">{formatStats(selectedItem)}</div>
            )}
            {selectedItem.desc && (
              <div className="shop-detail-desc">{selectedItem.desc}</div>
            )}
            {selectedItem.rectype && BADGE_LABEL[selectedItem.rectype] && (
              <div className="shop-detail-badge" data-kind={selectedItem.rectype}>
                {BADGE_LABEL[selectedItem.rectype]}
              </div>
            )}
            <div className="shop-detail-price">
              <span className="shop-detail-price-icon">◈</span>
              <span className="shop-detail-price-num">{selectedItem.price}</span>
              <span className="shop-detail-price-unit">元宝</span>
            </div>
            {getItemCount(selectedItem.id) > 0 && (
              <div className="shop-detail-owned">已拥有 x{getItemCount(selectedItem.id)}</div>
            )}
            <button
              className="shop-buy-btn"
              disabled={yuanbao < selectedItem.price}
              onClick={() => handleBuy(selectedItem)}
            >
              立即购买
            </button>
          </>
        ) : (
          <div className="shop-detail-empty">
            从左侧选择商品<br />查看详情和购买
          </div>
        )}
      </aside>

      {buyFeedback && <div className="shop-feedback">{buyFeedback}</div>}
    </div>
  )
}
