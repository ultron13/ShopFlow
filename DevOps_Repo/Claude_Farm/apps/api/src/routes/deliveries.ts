import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { payoutQueue } from '../jobs/processPayment.job.js';

export const deliveriesRouter = Router();

const createSchema = z.object({
  route: z.string(),
  scheduledDate: z.coerce.date(),
  transportProvider: z.string(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
});

deliveriesRouter.post('/', requireAuth('OPS_ADMIN'), validate(createSchema), async (req, res, next) => {
  try {
    const delivery = await prisma.delivery.create({ data: req.body });
    res.status(201).json({ delivery });
  } catch (err) {
    next(err);
  }
});

deliveriesRouter.post('/:id/stops', requireAuth('OPS_ADMIN'), async (req, res, next) => {
  try {
    const { orderId, collectionId, stopSequence } = z.object({
      orderId: z.string(),
      collectionId: z.string().optional(),
      stopSequence: z.number().int().positive(),
    }).parse(req.body);

    const stop = await prisma.deliveryStop.create({
      data: { deliveryId: req.params.id, orderId, collectionId, stopSequence },
    });
    res.status(201).json({ stop });
  } catch (err) {
    next(err);
  }
});

deliveriesRouter.patch('/:id/dispatch', requireAuth('OPS_ADMIN'), async (req, res, next) => {
  try {
    const delivery = await prisma.delivery.update({
      where: { id: req.params.id },
      data: { status: 'DISPATCHED', dispatchedAt: new Date() },
    });
    res.json({ delivery });
  } catch (err) {
    next(err);
  }
});

deliveriesRouter.patch('/:id/stops/:stopId/deliver', requireAuth('OPS_ADMIN'), async (req, res, next) => {
  try {
    const { signedOffBy } = z.object({ signedOffBy: z.string().optional() }).parse(req.body);
    const stop = await prisma.deliveryStop.update({
      where: { id: req.params.stopId },
      data: { deliveredAt: new Date(), signedOffBy },
      include: { order: { include: { items: { include: { listing: true } } } } },
    });

    await prisma.order.update({ where: { id: stop.orderId }, data: { status: 'DELIVERED' } });

    if (stop.collectionId) {
      const collection = await prisma.collection.findUnique({
        where: { id: stop.collectionId },
        include: { cooperative: true },
      });
      if (collection) {
        const amountCents = Math.round(
          (collection.actualWeightKg ?? 0) *
            stop.order.items.reduce((s, i) => s + i.pricePerKgCents, 0) / stop.order.items.length,
        );

        const payoutJob = await payoutQueue.add(
          'payout',
          { orderId: stop.orderId, cooperativeId: collection.cooperativeId, amountCents },
          { delay: 0, attempts: 3, backoff: { type: 'exponential', delay: 60_000 } },
        );
        return res.json({ stop, payoutJobId: payoutJob.id });
      }
    }

    res.json({ stop });
  } catch (err) {
    next(err);
  }
});
