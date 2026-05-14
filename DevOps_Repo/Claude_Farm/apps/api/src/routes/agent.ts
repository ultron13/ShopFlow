import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const agentRouter = Router();

agentRouter.use(requireAuth('FIELD_AGENT'));

agentRouter.get('/collections', async (req, res, next) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { fieldAgentId: req.user!.id },
      include: {
        cooperative: { select: { name: true, city: true, province: true, addressLine1: true } },
        gradeRecord: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });

    // Derive status from data
    const enriched = collections.map((c) => ({
      ...c,
      derivedStatus: c.confirmedAt ? 'CONFIRMED' : c.gradeRecord ? 'GRADED' : 'PENDING',
    }));

    res.json({ collections: enriched });
  } catch (err) {
    next(err);
  }
});

agentRouter.get('/collections/:id', async (req, res, next) => {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: req.params.id },
      include: {
        cooperative: {
          select: {
            name: true, city: true, province: true, addressLine1: true,
            contactPhone: true, gpsLat: true, gpsLng: true,
          },
        },
        gradeRecord: true,
        photos: true,
      },
    });

    if (!collection) throw new AppError(404, 'NOT_FOUND');
    if (collection.fieldAgentId !== req.user!.id) throw new AppError(403, 'FORBIDDEN');

    res.json({
      collection: {
        ...collection,
        derivedStatus: collection.confirmedAt ? 'CONFIRMED' : collection.gradeRecord ? 'GRADED' : 'PENDING',
      },
    });
  } catch (err) {
    next(err);
  }
});
