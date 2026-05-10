'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-gray-400">
        <ShoppingBag className="h-16 w-16 opacity-25" />
        <p className="text-xl font-medium">Your cart is empty</p>
        <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:underline">
          Continue Shopping →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y rounded-xl border bg-white">
            {items.map((item) => (
              <li key={`${item.productId}-${item.variantId}`} className="flex gap-4 p-4">
                <div className="relative h-20 w-20 flex-none overflow-hidden rounded-lg bg-gray-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.variantInfo && <p className="text-sm text-gray-400">{item.variantInfo}</p>}
                  <p className="text-sm font-semibold text-indigo-600">{formatPrice(item.price)}</p>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-lg border text-sm">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="px-2.5 py-1 text-gray-500 hover:bg-gray-50"
                      >−</button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="px-2.5 py-1 text-gray-500 hover:bg-gray-50"
                      >+</button>
                    </div>
                    <span className="ml-auto font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-5 h-fit space-y-4">
          <h2 className="font-semibold text-gray-900">Order Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">{formatPrice(total())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className="font-medium text-green-600">
              {total() >= 50 ? 'Free' : formatPrice(9.99)}
            </span>
          </div>
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(total() >= 50 ? total() : total() + 9.99)}</span>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Coupon Code</label>
            <div className="flex gap-2">
              <input
                placeholder="WELCOME10"
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200">
                Apply
              </button>
            </div>
          </div>

          <Link
            href="/checkout"
            className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
