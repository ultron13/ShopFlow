import type { Request, Response } from 'express'
import { verifyOzowHash } from '../services/ozow'
import { prisma } from '@shopflow/db'
import { sendOrderConfirmation } from '../services/email'

export async function ozowWebhookHandler(req: Request, res: Response) {
  const body = req.body as Record<string, string>

  if (!verifyOzowHash(body)) {
    res.status(400).send('Invalid hash')
    return
  }

  const orderId = body['TransactionReference']
  const status = body['Status'] // 'Complete' | 'Cancelled' | 'Error' | 'PendingInvestigation'

  if (!orderId || status !== 'Complete') {
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
      data: { status: 'CONFIRMED', ozowTransactionId: body['TransactionId'] },
    })

    for (const item of order.items) {
      if (item.variantId) {
        await prisma.variant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } })
      } else {
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
      }
    }

    if (order.userId) await prisma.cartItem.deleteMany({ where: { userId: order.userId } })

    const toEmail = body['EmailAddress'] ?? order.guestEmail
    if (toEmail) {
      await sendOrderConfirmation({
        to: toEmail,
        orderNumber: order.id.slice(-8).toUpperCase(),
        items: order.items.map((i) => ({ name: i.productName, qty: i.quantity, price: Number(i.unitPrice) })),
        total: Number(order.total),
      }).catch((e) => console.error('Email send failed:', e))
    }
  } catch (err) {
    console.error('Ozow webhook error:', err)
    res.status(500).send('Error')
    return
  }

  res.send('OK')
}
