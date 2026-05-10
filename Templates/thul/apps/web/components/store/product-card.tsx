'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/cart-store'
import toast from 'react-hot-toast'

interface Product {
  id: string
  slug: string
  name: string
  price: number | string | { toString(): string }
  comparePrice?: number | string | null
  images: string[]
  stock: number
  category: { name: string }
  _count?: { reviews: number }
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const image = product.images[0] ?? '/placeholder.png'
  const price = Number(product.price)
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    addItem({
      productId: product.id,
      quantity: 1,
      name: product.name,
      price,
      image,
    })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-indigo-300">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          {comparePrice && comparePrice > price && (
            <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
              SALE
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-white">
                Out of stock
              </span>
            </div>
          )}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="absolute bottom-2 right-2 rounded-full bg-indigo-600 p-2 text-white opacity-0 shadow-lg transition hover:bg-indigo-700 group-hover:opacity-100 disabled:opacity-50"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-gray-400 opacity-0 shadow transition hover:text-red-500 group-hover:opacity-100"
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <p className="text-xs text-gray-400">{product.category.name}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-800">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-gray-900">{formatPrice(price)}</span>
              {comparePrice && comparePrice > price && (
                <span className="text-xs text-gray-400 line-through">{formatPrice(comparePrice)}</span>
              )}
            </div>
            {product._count && product._count.reviews > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {product._count.reviews}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
