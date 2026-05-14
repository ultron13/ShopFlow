import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const adminRouter = Router();

adminRouter.use(requireAuth('PLATFORM_ADMIN', 'OPS_ADMIN'));

adminRouter.get('/metrics', async (_req, res, next) => {
  try {
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const [gmv, activeListings, pendingOrders, deliveriesToday, payoutsDue, openDisputes] =
      await prisma.$transaction([
        prisma.payment.aggregate({ where: { type: 'BUYER_PAYMENT', status: 'COMPLETED' }, _sum: { amountCents: true } }),
        prisma.listing.count({ where: { status: 'ACTIVE' } }),
        prisma.order.count({ where: { status: { in: ['CONFIRMED', 'COLLECTION_SCHEDULED', 'COLLECTED', 'IN_TRANSIT'] } } }),
        prisma.delivery.count({ where: { scheduledDate: { gte: new Date(now.setHours(0, 0, 0, 0)), lt: new Date(now.setHours(23, 59, 59, 999)) } } }),
        prisma.payment.count({ where: { type: 'FARMER_PAYOUT', status: 'PENDING', dueAt: { lte: in48h } } }),
        prisma.dispute.count({ where: { status: 'OPEN' } }),
      ]);

    res.json({
      gmvCents: gmv._sum.amountCents ?? 0,
      activeListings,
      pendingOrders,
      deliveriesToday,
      payoutsDue48h: payoutsDue,
      openDisputes,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/users', requireAuth('PLATFORM_ADMIN'), async (req, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({ select: { id: true, name: true, phone: true, email: true, role: true, isActive: true, createdAt: true }, take, skip }),
      prisma.user.count(),
    ]);
    res.json({ users, meta: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/users/:id/deactivate', requireAuth('PLATFORM_ADMIN'), async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false }, select: { id: true, isActive: true } });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/audit-logs', requireAuth('PLATFORM_ADMIN'), async (req, res, next) => {
  try {
    const { entityType, entityId, userId, from, to, page = '1', limit = '50' } = req.query;
    const take = Math.min(Number(limit), 200);
    const skip = (Number(page) - 1) * take;

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(entityType && { entityType: String(entityType) }),
        ...(entityId && { entityId: String(entityId) }),
        ...(userId && { userId: String(userId) }),
        ...(from && { createdAt: { gte: new Date(String(from)) } }),
        ...(to && { createdAt: { lte: new Date(String(to)) } }),
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});
