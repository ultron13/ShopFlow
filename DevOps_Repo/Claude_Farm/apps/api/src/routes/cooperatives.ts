import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const cooperativesRouter = Router();

const createSchema = z.object({
  name: z.string().min(2),
  registrationNo: z.string().min(5),
  contactPhone: z.string(),
  contactEmail: z.string().email().optional(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  province: z.string(),
  gpsLat: z.number().optional(),
  gpsLng: z.number().optional(),
  bankName: z.string(),
  bankAccountNo: z.string(),
  bankBranchCode: z.string(),
});

cooperativesRouter.post('/', requireAuth('FARMER'), validate(createSchema), async (req, res, next) => {
  try {
    const existing = await prisma.cooperative.findUnique({ where: { userId: req.user!.id } });
    if (existing) throw new AppError(409, 'CONFLICT', { reason: 'Cooperative already registered for this user' });

    const cooperative = await prisma.cooperative.create({
      data: { ...req.body, userId: req.user!.id },
    });
    res.status(201).json({ cooperative });
  } catch (err) {
    next(err);
  }
});

cooperativesRouter.get('/:id', requireAuth(), async (req, res, next) => {
  try {
    const cooperative = await prisma.cooperative.findUnique({
      where: { id: req.params.id },
      include: { farms: true },
    });
    if (!cooperative) throw new AppError(404, 'NOT_FOUND');

    const isOwner = cooperative.userId === req.user!.id;
    const isAdmin = ['OPS_ADMIN', 'PLATFORM_ADMIN'].includes(req.user!.role);
    if (!isOwner && !isAdmin) throw new AppError(403, 'FORBIDDEN');

    res.json({ cooperative });
  } catch (err) {
    next(err);
  }
});

cooperativesRouter.patch('/:id/verify', requireAuth('OPS_ADMIN', 'PLATFORM_ADMIN'), async (req, res, next) => {
  try {
    const cooperative = await prisma.cooperative.update({
      where: { id: req.params.id },
      data: { isVerified: true },
    });
    res.json({ cooperative });
  } catch (err) {
    next(err);
  }
});
