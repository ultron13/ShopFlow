import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const paymentsRouter = Router();

paymentsRouter.post('/webhook/ozow', async (req, res) => {
  const signature = req.headers['x-ozow-signature'];
  const expected = crypto
    .createHmac('sha512', process.env.OZOW_PRIVATE_KEY!)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expected) return res.status(200).end();

  const { TransactionId, Status, TransactionReference } = req.body;

  if (Status === 'Complete') {
    await prisma.payment.updateMany({
      where: { pspReference: TransactionId },
      data: { status: 'COMPLETED', processedAt: new Date(), pspWebhookData: req.body },
    });

    const payment = await prisma.payment.findFirst({ where: { pspReference: TransactionId } });
    if (payment?.orderId) {
      await prisma.order.update({ where: { id: payment.orderId }, data: { status: 'CONFIRMED' } });
    }
  }

  res.status(200).end();
});

paymentsRouter.post('/webhook/stitch', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== process.env.STITCH_WEBHOOK_SECRET) return res.status(200).end();

  const { id, status } = req.body;

  await prisma.payment.updateMany({
    where: { pspReference: id },
    data: {
      status: status === 'succeeded' ? 'COMPLETED' : 'FAILED',
      processedAt: new Date(),
      pspWebhookData: req.body,
    },
  });

  res.status(200).end();
});

paymentsRouter.get('/', requireAuth(), async (req, res, next) => {
  try {
    const { status, type, page = '1', limit = '20' } = req.query;
    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;

    const payments = await prisma.payment.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(type && { type: String(type) }),
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    res.json({ payments });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.get('/queue', requireAuth('OPS_ADMIN', 'PLATFORM_ADMIN'), async (req, res, next) => {
  try {
    const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const pending = await prisma.payment.findMany({
      where: { type: 'FARMER_PAYOUT', status: 'PENDING', dueAt: { lte: in48h } },
      include: { cooperative: { select: { name: true } } },
      orderBy: { dueAt: 'asc' },
    });
    res.json({ pending });
  } catch (err) {
    next(err);
  }
});
