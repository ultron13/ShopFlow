'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GuestCartItem {
  productId: string
  variantId?: string
  quantity: number
  name: string
  price: number
  image: string
  variantInfo?: string
}

interface CartStore {
  items: GuestCartItem[]
  addItem: (item: GuestCartItem) => void
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void
  removeItem: (productId: string, variantId?: string) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem(item) {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },
      updateQuantity(productId, variantId, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
          ),
        }))
      },
      removeItem(productId, variantId) {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }))
      },
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'shopflow-cart' }
  )
)
