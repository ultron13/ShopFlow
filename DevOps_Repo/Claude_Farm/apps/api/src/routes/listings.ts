import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const listingsRouter = Router();

const createSchema = z.object({
  product: z.string().min(1),
  grade: z.enum(['A', 'B', 'C']),
  quantityKg: z.number().positive(),
  pricePerKgCents: z.number().int().positive(),
  availableFrom: z.coerce.date(),
  availableUntil: z.coerce.date(),
  description: z.string().optional(),
});

listingsRouter.get('/', requireAuth(), async (req, res, next) => {
  try {
    const { product, grade, availableFrom, minKg, page = '1', limit = '20' } = req.query;
    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;

    const [listings, total] = await prisma.$transaction([
      prisma.listing.findMany({
        where: {
          status: 'ACTIVE',
          ...(product && { product: String(product) }),
          ...(grade && { grade: grade as 'A' | 'B' | 'C' }),
          ...(availableFrom && { availableFrom: { gte: new Date(String(availableFrom)) } }),
          ...(minKg && { quantityKg: { gte: Number(minKg) } }),
        },
        include: { cooperative: { select: { name: true, city: true, province: true } } },
        orderBy: { availableFrom: 'asc' },
        take,
        skip,
      }),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
    ]);

    res.json({ listings, meta: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (err) {
    next(err);
  }
});

listingsRouter.get('/:id', requireAuth(), async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: { cooperative: true },
    });
    if (!listing) throw new AppError(404, 'NOT_FOUND');
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

listingsRouter.post('/', requireAuth('FARMER'), validate(createSchema), async (req, res, next) => {
  try {
    const cooperative = await prisma.cooperative.findUnique({ where: { userId: req.user!.id } });
    if (!cooperative?.isVerified) throw new AppError(403, 'FORBIDDEN', { reason: 'Cooperative not verified' });

    const listing = await prisma.listing.create({
      data: { ...req.body, cooperativeId: cooperative.id, status: 'ACTIVE' },
    });
    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
});

listingsRouter.patch('/:id', requireAuth('FARMER', 'OPS_ADMIN'), async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) throw new AppError(404, 'NOT_FOUND');

    const allowed = ['quantityKg', 'pricePerKgCents', 'availableUntil', 'description', 'status'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    const updated = await prisma.listing.update({ where: { id: req.params.id }, data });
    res.json({ listing: updated });
  } catch (err) {
    next(err);
  }
});
