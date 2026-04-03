/**
 * 物品库存系统
 * 管理宠物拥有的物品及其数量
 */

import { create } from 'zustand'
import {
  type ItemCategory,
  type ShopItem,
  getItemById,
  STARTER_ITEMS,
} from '../../shared/itemCatalog'

// ============ 类型定义 ============

export interface InventoryState {
  /** 物品库存: itemId -> 数量 */
  items: Record<string, number>
}

export interface InventoryActions {
  /** 添加物品 */
  addItem: (itemId: string, quantity?: number) => void
  /** 移除物品，返回是否成功 */
  removeItem: (itemId: string, quantity?: number) => boolean
  /** 查询物品数量 */
  getItemCount: (itemId: string) => number
  /** 获取某分类下所有拥有的物品 */
  getItemsByCategory: (category: ItemCategory) => Array<{ item: ShopItem; quantity: number }>
  /** 是否拥有某物品 */
  hasItem: (itemId: string) => boolean
  /** 从持久化数据加载 */
  loadFromSaved: (saved: Record<string, number> | null | undefined) => void
  /** 获取持久化数据 */
  getPersistedData: () => Record<string, number>
}

// ============ Store ============

export const useInventoryStore = create<InventoryState & InventoryActions>((set, get) => ({
  items: { ...STARTER_ITEMS },

  addItem: (itemId, quantity = 1) => {
    set((state) => ({
      items: {
        ...state.items,
        [itemId]: (state.items[itemId] || 0) + quantity,
      },
    }))
  },

  removeItem: (itemId, quantity = 1) => {
    const current = get().items[itemId] || 0
    if (current < quantity) return false
    set((state) => {
      const newCount = (state.items[itemId] || 0) - quantity
      const newItems = { ...state.items }
      if (newCount <= 0) {
        delete newItems[itemId]
      } else {
        newItems[itemId] = newCount
      }
      return { items: newItems }
    })
    return true
  },

  getItemCount: (itemId) => {
    return get().items[itemId] || 0
  },

  getItemsByCategory: (category) => {
    const { items } = get()
    const result: Array<{ item: ShopItem; quantity: number }> = []
    for (const [itemId, quantity] of Object.entries(items)) {
      if (quantity <= 0) continue
      const item = getItemById(itemId)
      if (item && item.category === category) {
        result.push({ item, quantity })
      }
    }
    return result
  },

  hasItem: (itemId) => {
    return (get().items[itemId] || 0) > 0
  },

  loadFromSaved: (saved) => {
    if (!saved || Object.keys(saved).length === 0) {
      // 没有存档数据，使用初始物品
      set({ items: { ...STARTER_ITEMS } })
    } else {
      set({ items: { ...saved } })
    }
  },

  getPersistedData: () => {
    return { ...get().items }
  },
}))
