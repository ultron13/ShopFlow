'use client'

import { useCartStore } from '@/lib/cart-store'
import { trpc } from '@/lib/trpc'
import { formatPrice } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type PaymentMethod = 'STRIPE' | 'PAYFAST' | 'OZOW' | 'SNAPSCAN' | 'COD'

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; description: string; icon: string }[] = [
  { id: 'STRIPE',   label: 'Credit / Debit Card', description: 'Visa, Mastercard via Stripe',      icon: '💳' },
  { id: 'PAYFAST',  label: 'PayFast',              description: "SA's leading payment gateway",     icon: '🔵' },
  { id: 'OZOW',     label: 'Ozow EFT',             description: 'Instant bank transfer — no card',  icon: '🏦' },
  { id: 'SNAPSCAN', label: 'SnapScan',             description: 'Scan the QR with your app',        icon: '📱' },
  { id: 'COD',      label: 'Cash on Delivery',     description: 'Pay when your order arrives',      icon: '💵' },
]

export default function CheckoutPage() {
  const { items, total, clear } = useCartStore()
  const { data: session } = useSession()
  const router = useRouter()
  const [guestEmail, setGuestEmail] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAYFAST')
  const [snapScanUrl, setSnapScanUrl] = useState<string | null>(null)
  const payfastFormRef = useRef<HTMLFormElement>(null)
  const [payfastData, setPayfastData] = useState<{ url: string; params: Record<string, string> } | null>(null)

  const createOrder = trpc.orders.create.useMutation({
    onSuccess(data) {
      if (data.paymentMethod === 'STRIPE' && 'checkoutUrl' in data) {
        window.location.href = data.checkoutUrl
      } else if (data.paymentMethod === 'PAYFAST' && 'payfastUrl' in data) {
        setPayfastData({ url: data.payfastUrl, params: data.payfastParams })
        // Submit the hidden form on next tick after state is set
        setTimeout(() => payfastFormRef.current?.submit(), 50)
      } else if (data.paymentMethod === 'OZOW' && 'redirectUrl' in data) {
        window.location.href = data.redirectUrl
      } else if (data.paymentMethod === 'SNAPSCAN' && 'snapScanUrl' in data) {
        setSnapScanUrl(data.snapScanUrl)
      } else if (data.paymentMethod === 'COD') {
        clear()
        router.push('/checkout/success')
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
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      couponCode: couponCode || undefined,
      guestEmail: guestEmail || undefined,
      paymentMethod,
    })
  }

  function handleSnapScanPaid() {
    clear()
    router.push('/checkout/success')
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

      {/* Hidden PayFast form — submitted programmatically */}
      {payfastData && (
        <form ref={payfastFormRef} method="POST" action={payfastData.url} className="hidden">
          {Object.entries(payfastData.params).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      {/* SnapScan QR modal */}
      {snapScanUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Pay with SnapScan</h2>
            <p className="mt-1 text-sm text-gray-500">Open your SnapScan app and scan the QR code below</p>
            <div className="mt-5 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(snapScanUrl)}`}
                alt="SnapScan QR code"
                width={200}
                height={200}
                className="rounded-xl"
              />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-700">
              Amount: <span className="text-green-600">{formatPrice(total())}</span>
            </p>
            <button
              onClick={handleSnapScanPaid}
              className="mt-5 w-full rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
            >
              I've paid ✓
            </button>
            <button
              onClick={() => setSnapScanUrl(null)}
              className="mt-2 w-full rounded-xl py-2 text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          {/* Contact info for guests */}
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
                <a href="/sign-in" className="text-indigo-600 hover:underline">Sign in</a>
              </p>
            </div>
          )}

          {/* Payment method selection */}
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-4">Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border p-3.5 transition ${
                    paymentMethod === opt.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="accent-indigo-600"
                  />
                  <span className="text-xl">{opt.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-3">Coupon Code</h2>
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="WELCOME10"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {paymentMethod === 'COD' && (
            <p className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              Cash on Delivery — you'll pay the driver when your order arrives. Confirmation SMS will be sent.
            </p>
          )}
          {paymentMethod === 'SNAPSCAN' && (
            <p className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              A SnapScan QR code will appear after placing the order. Scan it with your SnapScan app to pay.
            </p>
          )}
        </div>

        {/* Order summary */}
        <div className="space-y-4 lg:col-span-2">
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
            {createOrder.isPending
              ? 'Processing…'
              : paymentMethod === 'COD'
              ? 'Place Order (Cash on Delivery)'
              : paymentMethod === 'SNAPSCAN'
              ? 'Generate SnapScan QR →'
              : `Pay with ${PAYMENT_OPTIONS.find((o) => o.id === paymentMethod)?.label} →`}
          </button>
          <p className="text-center text-xs text-gray-400">
            {paymentMethod === 'STRIPE' && 'Secured by Stripe · SSL encrypted'}
            {paymentMethod === 'PAYFAST' && 'Secured by PayFast · SSL encrypted'}
            {paymentMethod === 'OZOW' && 'Instant EFT via Ozow · Bank-grade security'}
            {paymentMethod === 'SNAPSCAN' && 'Pay securely with SnapScan'}
            {paymentMethod === 'COD' && 'No upfront payment required'}
          </p>
        </div>
      </div>
    </div>
  )
}
