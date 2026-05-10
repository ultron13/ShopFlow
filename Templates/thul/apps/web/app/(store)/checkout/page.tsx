'use client'

import { useCartStore } from '@/lib/cart-store'
import { trpc } from '@/lib/trpc'
import { formatPrice } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CheckoutPage() {
  const { items, total } = useCartStore()
  const { data: session } = useSession()
  const router = useRouter()
  const [guestEmail, setGuestEmail] = useState('')
  const [couponCode, setCouponCode] = useState('')

  const createOrder = trpc.orders.create.useMutation({
    onSuccess(data) {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    },
    onError(err) {
      toast.error(err.message)
    },
  })

  function handleCheckout() {
    if (!session && !guestEmail) {
      toast.error('Please enter your email to continue')
      return
    }
    createOrder.mutate({
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      couponCode: couponCode || undefined,
      guestEmail: guestEmail || undefined,
    })
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          {!session && (
            <div className="rounded-xl border bg-white p-5">
              <h2 className="font-semibold mb-3">Contact Information</h2>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <p className="mt-2 text-xs text-gray-400">
                Already have an account?{' '}
                <a href="/sign-in" className="text-indigo-600 hover:underline">
                  Sign in
                </a>
              </p>
            </div>
          )}

          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-3">Coupon Code</h2>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <p className="rounded-xl border bg-blue-50 p-4 text-sm text-blue-700">
            You'll enter your shipping address and payment details on the next secure Stripe page.
          </p>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                  <div className="relative h-14 w-14 flex-none overflow-hidden rounded-lg bg-gray-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-xs text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total())}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={createOrder.isPending}
            className="w-full rounded-xl bg-indigo-600 py-3.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {createOrder.isPending ? 'Redirecting to Stripe…' : 'Pay with Stripe →'}
          </button>
          <p className="text-center text-xs text-gray-400">
            Secured by Stripe · SSL encrypted
          </p>
        </div>
      </div>
    </div>
  )
}
