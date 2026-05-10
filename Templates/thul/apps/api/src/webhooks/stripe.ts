import type { Request, Response } from 'express'
import { stripe as getStripe } from '../services/stripe'
import { prisma } from '@shopflow/db'
import { sendOrderConfirmation } from '../services/email'
import { sendSms, orderConfirmedSms } from '../services/sms'

export async function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers['stripe-signature']
  if (!sig || !process.env['STRIPE_WEBHOOK_SECRET']) {
    res.status(400).send('Missing signature')
    return
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(
      req.body as Buffer,
      sig,
      process.env['STRIPE_WEBHOOK_SECRET']
    )
  } catch {
    res.status(400).send('Webhook signature verification failed')
    return
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session.metadata?.['orderId']
      if (!orderId) { res.json({ received: true }); return }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
      if (!order || order.status !== 'PENDING') { res.json({ received: true }); return }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          stripePaymentIntentId: session.payment_intent as string | null,
          shippingAddress: session.shipping_details ?? {},
        },
      })

      // Decrement stock
      for (const item of order.items) {
        if (item.variantId) {
          await prisma.variant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          })
        } else {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }

      // Clear user cart if signed-in purchase
      if (order.userId) {
        await prisma.cartItem.deleteMany({ where: { userId: order.userId } })
      }

      // SMS notification
      const orderNum = order.id.slice(-8).toUpperCase()
      const phone = session.customer_details?.phone
      if (phone) {
        await sendSms(phone, orderConfirmedSms(orderNum, Number(order.total))).catch(() => {})
      }

      // Send confirmation email
      const toEmail = session.customer_details?.email ?? order.guestEmail
      if (toEmail) {
        await sendOrderConfirmation({
          to: toEmail,
          orderNumber: order.id.slice(-8).toUpperCase(),
          items: order.items.map((i) => ({
            name: i.productName,
            qty: i.quantity,
            price: Number(i.unitPrice),
          })),
          total: Number(order.total),
        }).catch((e) => console.error('Email send failed:', e))
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    res.status(500).json({ error: 'Webhook processing failed' })
    return
  }

  res.json({ received: true })
}
