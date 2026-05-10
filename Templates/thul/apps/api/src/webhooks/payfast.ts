import type { Request, Response } from 'express'
import { verifyPayfastSignature } from '../services/payfast'
import { prisma } from '@shopflow/db'
import { sendOrderConfirmation } from '../services/email'
import { sendSms, orderConfirmedSms } from '../services/sms'

export async function payfastWebhookHandler(req: Request, res: Response) {
  const params = req.body as Record<string, string>

  if (!verifyPayfastSignature(params)) {
    res.status(400).send('Invalid signature')
    return
  }

  const orderId = params['m_payment_id']
  if (!orderId || params['payment_status'] !== 'COMPLETE') {
    res.send('OK')
    return
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    if (!order || order.status !== 'PENDING') {
      res.send('OK')
      return
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED', payfastToken: params['pf_payment_id'] ?? order.payfastToken },
    })

    for (const item of order.items) {
      if (item.variantId) {
        await prisma.variant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } })
      } else {
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
      }
    }

    if (order.userId) await prisma.cartItem.deleteMany({ where: { userId: order.userId } })

    const orderNum = order.id.slice(-8).toUpperCase()
    const phone = params['cell_number']
    if (phone) await sendSms(phone, orderConfirmedSms(orderNum, Number(order.total))).catch(() => {})

    const toEmail = params['email_address'] ?? order.guestEmail
    if (toEmail) {
      await sendOrderConfirmation({
        to: toEmail,
        orderNumber: order.id.slice(-8).toUpperCase(),
        items: order.items.map((i) => ({ name: i.productName, qty: i.quantity, price: Number(i.unitPrice) })),
        total: Number(order.total),
      }).catch((e) => console.error('Email send failed:', e))
    }
  } catch (err) {
    console.error('PayFast IPN error:', err)
    res.status(500).send('Error')
    return
  }

  res.send('OK')
}
