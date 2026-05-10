'use client'

import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'

export default function CheckoutSuccessPage() {
  const clear = useCartStore((s) => s.clear)

  useEffect(() => {
    clear()
  }, [clear])

  return (
    <div className="flex flex-col items-center justify-center py-28 text-center px-4">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <h1 className="mt-6 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
      <p className="mt-3 max-w-md text-gray-500">
        Thank you for your purchase. A confirmation email is on its way to you. We'll notify you
        when your order ships.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/account/orders"
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          View Orders
        </Link>
        <Link
          href="/products"
          className="rounded-xl border px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
