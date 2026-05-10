import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/lib/cart-store'

const item1 = {
  productId: 'prod-1',
  quantity: 2,
  name: 'Tomatoes',
  price: 25.0,
  image: '/tomatoes.jpg',
}

const item2 = {
  productId: 'prod-2',
  quantity: 1,
  name: 'Spinach',
  price: 15.5,
  image: '/spinach.jpg',
}

const item1Variant = {
  ...item1,
  productId: 'prod-1',
  variantId: 'var-a',
  name: 'Tomatoes (Large)',
  price: 35.0,
}

beforeEach(() => {
  useCartStore.getState().clear()
})

describe('addItem', () => {
  it('adds a new item to the cart', () => {
    useCartStore.getState().addItem(item1)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe('prod-1')
    expect(items[0].quantity).toBe(2)
  })

  it('increments quantity when same item added again', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().addItem({ ...item1, quantity: 3 })
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(5)
  })

  it('treats same product with different variant as separate item', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().addItem(item1Variant)
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  it('adds multiple distinct products', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().addItem(item2)
    expect(useCartStore.getState().items).toHaveLength(2)
  })
})

describe('removeItem', () => {
  it('removes an item by productId', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().addItem(item2)
    useCartStore.getState().removeItem('prod-1')
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe('prod-2')
  })

  it('removes a variant item without affecting other items', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().addItem(item1Variant)
    useCartStore.getState().removeItem('prod-1', 'var-a')
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].variantId).toBeUndefined()
  })

  it('does nothing when item not found', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().removeItem('nonexistent')
    expect(useCartStore.getState().items).toHaveLength(1)
  })
})

describe('updateQuantity', () => {
  it('updates the quantity of an item', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().updateQuantity('prod-1', undefined, 10)
    expect(useCartStore.getState().items[0].quantity).toBe(10)
  })

  it('removes item when quantity set to 0', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().updateQuantity('prod-1', undefined, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('removes item when quantity set to negative', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().updateQuantity('prod-1', undefined, -1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('updates quantity for a specific variant', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().addItem(item1Variant)
    useCartStore.getState().updateQuantity('prod-1', 'var-a', 5)
    const items = useCartStore.getState().items
    expect(items.find((i) => i.variantId === 'var-a')?.quantity).toBe(5)
    expect(items.find((i) => !i.variantId)?.quantity).toBe(2)
  })
})

describe('clear', () => {
  it('removes all items', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().addItem(item2)
    useCartStore.getState().clear()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('is idempotent on empty cart', () => {
    expect(() => useCartStore.getState().clear()).not.toThrow()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('count', () => {
  it('returns 0 for empty cart', () => {
    expect(useCartStore.getState().count()).toBe(0)
  })

  it('sums quantities across all items', () => {
    useCartStore.getState().addItem(item1)    // qty 2
    useCartStore.getState().addItem(item2)    // qty 1
    expect(useCartStore.getState().count()).toBe(3)
  })

  it('reflects updates after quantity change', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().updateQuantity('prod-1', undefined, 5)
    expect(useCartStore.getState().count()).toBe(5)
  })
})

describe('total', () => {
  it('returns 0 for empty cart', () => {
    expect(useCartStore.getState().total()).toBe(0)
  })

  it('calculates total correctly', () => {
    useCartStore.getState().addItem(item1)   // 2 * 25.00 = 50.00
    useCartStore.getState().addItem(item2)   // 1 * 15.50 = 15.50
    expect(useCartStore.getState().total()).toBeCloseTo(65.5, 2)
  })

  it('updates total after removing item', () => {
    useCartStore.getState().addItem(item1)
    useCartStore.getState().addItem(item2)
    useCartStore.getState().removeItem('prod-2')
    expect(useCartStore.getState().total()).toBeCloseTo(50.0, 2)
  })

  it('updates total after quantity change', () => {
    useCartStore.getState().addItem(item1)   // 2 * 25.00
    useCartStore.getState().updateQuantity('prod-1', undefined, 4)
    expect(useCartStore.getState().total()).toBeCloseTo(100.0, 2)
  })
})
