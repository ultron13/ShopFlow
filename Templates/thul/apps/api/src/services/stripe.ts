import Stripe from 'stripe'

let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env['STRIPE_SECRET_KEY']
    if (!key || key.startsWith('sk_test_placeholder')) {
      if (process.env['NODE_ENV'] !== 'production') {
        console.warn('⚠️  STRIPE_SECRET_KEY not set — Stripe calls will fail')
      }
    }
    _stripe = new Stripe(key ?? 'sk_test_placeholder', {
      apiVersion: '2024-12-18.acacia',
    })
  }
  return _stripe
}

export { getStripe as stripe }

export interface CreateCheckoutParams {
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]
  orderId: string
  customerEmail?: string
  couponId?: string
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
  return getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: params.lineItems,
    customer_email: params.customerEmail,
    metadata: { orderId: params.orderId },
    discounts: params.couponId ? [{ coupon: params.couponId }] : undefined,
    shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
    automatic_tax: { enabled: true },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  })
}

export async function refundPaymentIntent(paymentIntentId: string, amount?: number) {
  return getStripe().refunds.create({
    payment_intent: paymentIntentId,
    amount,
  })
}
