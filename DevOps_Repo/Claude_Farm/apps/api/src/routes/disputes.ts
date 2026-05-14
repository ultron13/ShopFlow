import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const disputesRouter = Router();

const createSchema = z.object({
  orderId: z.string(),
  reason: z.enum(['QUALITY', 'QUANTITY', 'NOT_DELIVERED', 'WRONG_PRODUCT', 'OTHER']),
  description: z.string().min(10),
});

const resolveSchema = z.object({
  resolution: z.enum(['REFUND', 'CREDIT', 'REJECTED']),
  refundAmountCents: z.number().int().positive().optional(),
  notes: z.string(),
});

disputesRouter.post('/', requireAuth('BUYER'), validate(createSchema), async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.body.orderId } });
    if (!order) throw new AppError(404, 'NOT_FOUND');

    if (order.status !== 'DELIVERED') throw new AppError(422, 'BUSINESS_RULE_VIOLATION', { reason: 'Can only dispute delivered orders' });

    const deliveredAt = await prisma.deliveryStop.findUnique({
      where: { orderId: order.id },
      select: { deliveredAt: true },
    });
    const hoursElapsed = deliveredAt?.deliveredAt
      ? (Date.now() - deliveredAt.deliveredAt.getTime()) / 3_600_000
      : 0;
    if (hoursElapsed > 24) throw new AppError(422, 'BUSINESS_RULE_VIOLATION', { reason: '24-hour dispute window has closed' });

    const dispute = await prisma.dispute.create({
      data: { orderId: req.body.orderId, raisedBy: req.user!.id, reason: req.body.reason, description: req.body.description },
    });
    await prisma.order.update({ where: { id: order.id }, data: { status: 'DISPUTED' } });

    res.status(201).json({ dispute });
  } catch (err) {
    next(err);
  }
});

disputesRouter.patch('/:id/resolve', requireAuth('OPS_ADMIN'), validate(resolveSchema), async (req, res, next) => {
  try {
    const statusMap: Record<string, 'RESOLVED_REFUND' | 'RESOLVED_CREDIT' | 'REJECTED'> = {
      REFUND: 'RESOLVED_REFUND',
      CREDIT: 'RESOLVED_CREDIT',
      REJECTED: 'REJECTED',
    };
    const dispute = await prisma.dispute.update({
      where: { id: req.params.id },
      data: {
        status: statusMap[req.body.resolution],
        resolution: req.body.notes,
        refundAmountCents: req.body.refundAmountCents,
        resolvedAt: new Date(),
        resolvedBy: req.user!.id,
      },
    });
    res.json({ dispute });
  } catch (err) {
    next(err);
  }
});
