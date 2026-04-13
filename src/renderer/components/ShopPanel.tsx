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

const ITEMS_PER_PAGE = 6

// 原版素材路径
const SHOP_ASSETS = 'assets/1.2.4source/shop/store/Store_img'

// 徽章类型到素材文件的映射
const BADGE_MAP: Record<string, string> = {
  hot: `${SHOP_ASSETS}/hot.gif`,
  new: `${SHOP_ASSETS}/new.gif`,
  recommand: `${SHOP_ASSETS}/recommand.gif`,
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

  // 推荐商品（取前2个有 rectype 的）
  const featuredItems = useMemo(() => {
    const all = [
      ...getPurchasableItems('food'),
      ...getPurchasableItems('commodity'),
      ...getPurchasableItems('medicine'),
    ]
    return all.filter(i => i.rectype).slice(0, 2)
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

  // 填充空卡位
  const emptySlots = ITEMS_PER_PAGE - pageItems.length

  return (
    <div className="shop-panel-wrapper" ref={dragRef}>
    <div className="shop-panel">
      {/* 拖拽区 */}
      <div className="shop-drag-handle" />
      <button className="shop-close-btn" onClick={onClose}>✕</button>

      {/* 推荐区（左上羊皮纸） */}
      <div className="shop-featured">
        <div className="shop-featured-title">-- 热门推荐 --</div>
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
              {item.rectype && BADGE_MAP[item.rectype] && (
                <div className="shop-featured-card-badge">
                  <img src={resolveAssetUrl(BADGE_MAP[item.rectype])} alt={item.rectype} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 分类 Tab 栏 */}
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

      {/* 商品网格 */}
      <div className="shop-items-area">
        {pageItems.map((item) => {
          const owned = getItemCount(item.id)
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
                <div className="shop-item-stats">{formatStats(item) || item.desc || '装饰物品'}</div>
                <div className="shop-item-price">{item.price} 元宝</div>
                {owned > 0 && <div className="shop-item-owned">已有 x{owned}</div>}
              </div>
              {item.rectype && BADGE_MAP[item.rectype] && (
                <div className="shop-item-badge">
                  <img src={resolveAssetUrl(BADGE_MAP[item.rectype])} alt={item.rectype} />
                </div>
              )}
            </div>
          )
        })}
        {/* 空卡位 */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} className="shop-item-card shop-item-card-empty" />
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="shop-pagination">
          <button
            className="shop-page-btn shop-page-btn--first"
            disabled={page === 0}
            onClick={() => setPage(0)}
          />
          <button
            className="shop-page-btn shop-page-btn--prev"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          />
          <span className="shop-page-info">{page + 1} / {totalPages}</span>
          <button
            className="shop-page-btn shop-page-btn--next"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          />
          <button
            className="shop-page-btn shop-page-btn--last"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(totalPages - 1)}
          />
        </div>
      )}

      {/* 右侧详情区 */}
      <div className="shop-detail-area">
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
            <div className="shop-detail-stats">{formatStats(selectedItem)}</div>
            {selectedItem.desc && (
              <div className="shop-detail-desc">{selectedItem.desc}</div>
            )}
            {selectedItem.rectype && BADGE_MAP[selectedItem.rectype] && (
              <div className="shop-detail-badge">
                <img src={resolveAssetUrl(BADGE_MAP[selectedItem.rectype])} alt={selectedItem.rectype} />
              </div>
            )}
            <div className="shop-detail-price">{selectedItem.price} 元宝</div>
            {getItemCount(selectedItem.id) > 0 && (
              <div className="shop-detail-owned">已拥有 x{getItemCount(selectedItem.id)}</div>
            )}
            <button
              className="shop-buy-btn"
              disabled={yuanbao < selectedItem.price}
              onClick={() => handleBuy(selectedItem)}
            >
              购买
            </button>
          </>
        ) : (
          <div className="shop-detail-empty">请选择商品查看详情</div>
        )}
      </div>

      {/* 元宝底栏 */}
      <div className="shop-yuanbao-bar">
        <span className="shop-yuanbao-label">元宝:</span>
        <span className="shop-yuanbao-value">{yuanbao}</span>
      </div>

      {/* 反馈浮层 */}
      {buyFeedback && (
        <div className="shop-feedback">{buyFeedback}</div>
      )}
    </div>
    </div>
  )
}
