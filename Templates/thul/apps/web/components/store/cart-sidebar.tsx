'use client'

import { X, ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'

interface CartSidebarProps {
  open: boolean
  onClose: () => void
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, total } = useCartStore()

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="h-5 w-5 text-indigo-600" />
            Your Cart
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
            <ShoppingBag className="h-12 w-12 opacity-30" />
            <p className="text-sm">Your cart is empty</p>
            <Link
              href="/products"
              onClick={onClose}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Start shopping →
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-4">
              {items.map((item) => (
                <li key={`${item.productId}-${item.variantId}`} className="flex gap-3 py-4">
                  <div className="relative h-16 w-16 flex-none overflow-hidden rounded-lg bg-gray-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                    {item.variantInfo && (
                      <p className="text-xs text-gray-400">{item.variantInfo}</p>
                    )}
                    <div className="mt-auto flex items-center gap-2">
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.productId, item.variantId, Number(e.target.value))
                        }
                        className="rounded border border-gray-200 px-1.5 py-0.5 text-sm"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <span className="ml-auto text-sm font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-gray-300 hover:text-red-500"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t px-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(total())}</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">Shipping & taxes calculated at checkout</p>
              <Link
                href="/checkout"
                onClick={onClose}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="mt-2 flex w-full items-center justify-center rounded-xl border py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
