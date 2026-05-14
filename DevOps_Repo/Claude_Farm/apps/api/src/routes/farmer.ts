import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const farmerRouter = Router();

farmerRouter.use(requireAuth('FARMER'));

async function getCooperative(userId: string) {
  const coop = await prisma.cooperative.findUnique({ where: { userId } });
  if (!coop) throw new AppError(404, 'NOT_FOUND', { reason: 'No cooperative linked to this account' });
  return coop;
}

farmerRouter.get('/stats', async (req, res, next) => {
  try {
    const coop = await getCooperative(req.user!.id);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [activeListings, totalActiveKg, ordersInProgress, soldThisMonth, nextPayout] =
      await prisma.$transaction([
        prisma.listing.count({ where: { cooperativeId: coop.id, status: 'ACTIVE' } }),
        prisma.listing.aggregate({
          where: { cooperativeId: coop.id, status: 'ACTIVE' },
          _sum: { quantityKg: true },
        }),
        prisma.order.count({
          where: {
            status: { in: ['CONFIRMED', 'COLLECTION_SCHEDULED', 'COLLECTED', 'IN_TRANSIT'] },
            items: { some: { listing: { cooperativeId: coop.id } } },
          },
        }),
        prisma.orderItem.aggregate({
          where: {
            listing: { cooperativeId: coop.id },
            order: {
              status: 'DELIVERED',
              createdAt: { gte: monthStart },
            },
          },
          _sum: { subtotalCents: true },
        }),
        prisma.payment.findFirst({
          where: { cooperativeId: coop.id, type: 'FARMER_PAYOUT', status: 'PENDING' },
          orderBy: { dueAt: 'asc' },
        }),
      ]);

    res.json({
      activeListings,
      activeKg: totalActiveKg._sum.quantityKg ?? 0,
      ordersInProgress,
      soldThisMonthCents: soldThisMonth._sum.subtotalCents ?? 0,
      nextPayoutCents: nextPayout?.amountCents ?? 0,
      nextPayoutDue: nextPayout?.dueAt ?? null,
    });
  } catch (err) {
    next(err);
  }
});

farmerRouter.get('/listings', async (req, res, next) => {
  try {
    const coop = await getCooperative(req.user!.id);
    const { status } = req.query;

    const listings = await prisma.listing.findMany({
      where: {
        cooperativeId: coop.id,
        ...(status && { status: String(status) as any }),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ listings, cooperativeId: coop.id, isVerified: coop.isVerified });
  } catch (err) {
    next(err);
  }
});

const createListingSchema = z.object({
  product: z.string().min(1),
  grade: z.enum(['A', 'B', 'C']),
  quantityKg: z.number().positive(),
  pricePerKgCents: z.number().int().positive(),
  availableFrom: z.coerce.date(),
  availableUntil: z.coerce.date(),
  description: z.string().optional(),
});

farmerRouter.post('/listings', validate(createListingSchema), async (req, res, next) => {
  try {
    const coop = await getCooperative(req.user!.id);
    if (!coop.isVerified) throw new AppError(403, 'FORBIDDEN', { reason: 'Cooperative not yet verified' });

    const listing = await prisma.listing.create({
      data: { ...req.body, cooperativeId: coop.id, status: 'ACTIVE' },
    });
    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
});

farmerRouter.patch('/listings/:id', async (req, res, next) => {
  try {
    const coop = await getCooperative(req.user!.id);
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) throw new AppError(404, 'NOT_FOUND');
    if (listing.cooperativeId !== coop.id) throw new AppError(403, 'FORBIDDEN');

    const allowed = ['quantityKg', 'pricePerKgCents', 'availableUntil', 'description', 'status'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    const updated = await prisma.listing.update({ where: { id: req.params.id }, data });
    res.json({ listing: updated });
  } catch (err) {
    next(err);
  }
});

farmerRouter.get('/orders', async (req, res, next) => {
  try {
    const coop = await getCooperative(req.user!.id);
    const { status, page = '1', limit = '20' } = req.query;
    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: {
          items: { some: { listing: { cooperativeId: coop.id } } },
          ...(status && { status: String(status) as any }),
        },
        include: {
          buyer: { select: { businessName: true, deliveryCity: true } },
          items: {
            where: { listing: { cooperativeId: coop.id } },
            include: { listing: { select: { product: true, grade: true } } },
          },
          deliveryStop: {
            include: {
              delivery: { select: { route: true, scheduledDate: true, status: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.order.count({
        where: {
          items: { some: { listing: { cooperativeId: coop.id } } },
          ...(status && { status: String(status) as any }),
        },
      }),
    ]);

    res.json({ orders, meta: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (err) {
    next(err);
  }
});

farmerRouter.get('/payouts', async (req, res, next) => {
  try {
    const coop = await getCooperative(req.user!.id);
    const { page = '1', limit = '20' } = req.query;
    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;

    const [payouts, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where: { cooperativeId: coop.id, type: 'FARMER_PAYOUT' },
        include: { order: { select: { id: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.payment.count({ where: { cooperativeId: coop.id, type: 'FARMER_PAYOUT' } }),
    ]);

    res.json({ payouts, meta: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (err) {
    next(err);
  }
});
