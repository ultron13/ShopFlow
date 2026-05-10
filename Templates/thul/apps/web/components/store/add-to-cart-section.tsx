'use client'

import { useState } from 'react'
import { ShoppingCart, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import toast from 'react-hot-toast'

interface Variant {
  id: string
  name: string
  value: string
  stock: number
}

interface Product {
  id: string
  name: string
  price: number | string | { toNumber(): number }
  images: string[]
  stock: number
  variants: Variant[]
}

export function AddToCartSection({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined)
  const [qty, setQty] = useState(1)

  const variants = product.variants
  const activeStock =
    selectedVariant
      ? (variants.find((v) => v.id === selectedVariant)?.stock ?? 0)
      : product.stock

  const outOfStock = activeStock === 0

  function handleAdd() {
    if (variants.length > 0 && !selectedVariant) {
      toast.error('Please select an option')
      return
    }
    const price =
      typeof product.price === 'object' && 'toNumber' in product.price
        ? product.price.toNumber()
        : Number(product.price)

    addItem({
      productId: product.id,
      variantId: selectedVariant,
      quantity: qty,
      name: product.name,
      price,
      image: product.images[0] ?? '',
      variantInfo: selectedVariant
        ? variants.find((v) => v.id === selectedVariant)?.value
        : undefined,
    })
    toast.success('Added to cart!')
  }

  const variantGroups = variants.reduce<Record<string, Variant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = []
    acc[v.name]!.push(v)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(variantGroups).map(([groupName, opts]) => (
        <div key={groupName}>
          <label className="mb-2 block text-sm font-medium text-gray-700">{groupName}</label>
          <div className="flex flex-wrap gap-2">
            {opts.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v.id)}
                disabled={v.stock === 0}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:opacity-40 ${
                  selectedVariant === v.id
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-indigo-400'
                }`}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-lg border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-gray-500 hover:bg-gray-50"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(activeStock, q + 1))}
            disabled={qty >= activeStock}
            className="px-3 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>

        <button
          className="rounded-xl border p-3 text-gray-400 hover:border-red-300 hover:text-red-500"
          aria-label="Add to wishlist"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {!outOfStock && (
        <p className="text-xs text-gray-400">{activeStock} in stock</p>
      )}
    </div>
  )
}
