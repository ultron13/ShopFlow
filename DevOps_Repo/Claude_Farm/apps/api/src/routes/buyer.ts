import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const buyerRouter = Router();

buyerRouter.use(requireAuth('BUYER'));

buyerRouter.get('/profile', async (req, res, next) => {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: { userId: req.user!.id },
      include: { user: { select: { name: true, phone: true, email: true } } },
    });
    res.json({ buyer });
  } catch (err) {
    next(err);
  }
});

const profileSchema = z.object({
  businessName: z.string().min(1).optional(),
  vatNumber: z.string().optional(),
  contactPhone: z.string().optional(),
  deliveryAddress: z.string().min(1).optional(),
  deliveryCity: z.string().min(1).optional(),
});

buyerRouter.patch('/profile', validate(profileSchema), async (req, res, next) => {
  try {
    const existing = await prisma.buyer.findUnique({ where: { userId: req.user!.id } });
    if (!existing) throw new AppError(404, 'NOT_FOUND', { reason: 'No buyer profile found' });

    const buyer = await prisma.buyer.update({
      where: { userId: req.user!.id },
      data: req.body,
    });
    res.json({ buyer });
  } catch (err) {
    next(err);
  }
});

buyerRouter.get('/stats', async (req, res, next) => {
  try {
    const buyer = await prisma.buyer.findUnique({ where: { userId: req.user!.id } });
    if (!buyer) return res.json({ totalOrders: 0, activeOrders: 0, totalSpentCents: 0, openDisputes: 0 });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalOrders, activeOrders, spentThisMonth, openDisputes] = await prisma.$transaction([
      prisma.order.count({ where: { buyerId: buyer.id } }),
      prisma.order.count({
        where: { buyerId: buyer.id, status: { in: ['CONFIRMED', 'COLLECTION_SCHEDULED', 'COLLECTED', 'IN_TRANSIT'] } },
      }),
      prisma.order.aggregate({
        where: { buyerId: buyer.id, status: 'DELIVERED', createdAt: { gte: monthStart } },
        _sum: { totalAmountCents: true },
      }),
      prisma.dispute.count({
        where: { order: { buyerId: buyer.id }, status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      }),
    ]);

    res.json({
      totalOrders,
      activeOrders,
      spentThisMonthCents: spentThisMonth._sum.totalAmountCents ?? 0,
      openDisputes,
    });
  } catch (err) {
    next(err);
  }
});
