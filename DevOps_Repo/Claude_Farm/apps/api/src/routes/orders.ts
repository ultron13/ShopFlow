import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const ordersRouter = Router();

const createSchema = z.object({
  items: z.array(z.object({ listingId: z.string(), quantityKg: z.number().positive() })).min(1),
  deliveryDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

ordersRouter.post('/', requireAuth('BUYER'), validate(createSchema), async (req, res, next) => {
  try {
    const buyer = await prisma.buyer.findUnique({ where: { userId: req.user!.id } });
    if (!buyer) throw new AppError(404, 'NOT_FOUND', { reason: 'Buyer profile not found' });

    const listingIds = req.body.items.map((i: { listingId: string }) => i.listingId);
    const listings = await prisma.listing.findMany({
      where: { id: { in: listingIds }, status: 'ACTIVE' },
    });

    if (listings.length !== listingIds.length) throw new AppError(409, 'CONFLICT', { reason: 'One or more listings unavailable' });

    const items = req.body.items.map((item: { listingId: string; quantityKg: number }) => {
      const listing = listings.find((l) => l.id === item.listingId)!;
      return { listingId: item.listingId, quantityKg: item.quantityKg, pricePerKgCents: listing.pricePerKgCents, subtotalCents: Math.round(item.quantityKg * listing.pricePerKgCents) };
    });

    const totalAmountCents = items.reduce((sum: number, i: { subtotalCents: number }) => sum + i.subtotalCents, 0);

    const order = await prisma.order.create({
      data: { buyerId: buyer.id, totalAmountCents, deliveryDate: req.body.deliveryDate, notes: req.body.notes, items: { create: items } },
      include: { items: true },
    });

    // TODO: create Ozow payment session and return paymentUrl
    const paymentUrl = `https://pay.ozow.com/mock?orderId=${order.id}`;
    res.status(201).json({ order, paymentUrl });
  } catch (err) {
    next(err);
  }
});

ordersRouter.get('/', requireAuth(), async (req, res, next) => {
  try {
    const isAdmin = ['OPS_ADMIN', 'PLATFORM_ADMIN'].includes(req.user!.role);
    const { status, page = '1', limit = '20' } = req.query;
    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;

    let buyerId: string | undefined;
    if (!isAdmin) {
      const buyer = await prisma.buyer.findUnique({ where: { userId: req.user!.id } });
      buyerId = buyer?.id;
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: { ...(buyerId && { buyerId }), ...(status && { status: status as string as any }) },
        include: { items: true, buyer: { select: { businessName: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.order.count({ where: { ...(buyerId && { buyerId }) } }),
    ]);

    res.json({ orders, meta: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (err) {
    next(err);
  }
});

ordersRouter.get('/:id', requireAuth(), async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { listing: { include: { cooperative: true } } } }, deliveryStop: { include: { delivery: true } }, payments: true, invoice: true, dispute: true },
    });
    if (!order) throw new AppError(404, 'NOT_FOUND');
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch('/:id/status', requireAuth('OPS_ADMIN', 'PLATFORM_ADMIN'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});
