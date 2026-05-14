import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const collectionsRouter = Router();

const createSchema = z.object({
  cooperativeId: z.string(),
  fieldAgentId: z.string().optional(),
  scheduledAt: z.coerce.date(),
});

const gradeSchema = z.object({
  grade: z.enum(['A', 'B', 'C']),
  blemishPct: z.number().min(0).max(100),
  uniformityPct: z.number().min(0).max(100),
  moistureLoss: z.number().optional(),
  fieldAgentNotes: z.string().optional(),
});

collectionsRouter.post('/', requireAuth('OPS_ADMIN'), validate(createSchema), async (req, res, next) => {
  try {
    const collection = await prisma.collection.create({ data: req.body });
    res.status(201).json({ collection });
  } catch (err) {
    next(err);
  }
});

collectionsRouter.post('/:id/grade', requireAuth('FIELD_AGENT'), validate(gradeSchema), async (req, res, next) => {
  try {
    const existing = await prisma.gradeRecord.findUnique({ where: { collectionId: req.params.id } });
    if (existing) throw new AppError(409, 'CONFLICT', { reason: 'Grade record already submitted' });

    const gradeRecord = await prisma.gradeRecord.create({
      data: { collectionId: req.params.id, ...req.body },
    });
    res.status(201).json({ gradeRecord });
  } catch (err) {
    next(err);
  }
});

collectionsRouter.patch('/:id/confirm', requireAuth('FIELD_AGENT'), async (req, res, next) => {
  try {
    const { actualWeightKg } = z.object({ actualWeightKg: z.number().positive() }).parse(req.body);
    const collection = await prisma.collection.update({
      where: { id: req.params.id },
      data: { confirmedAt: new Date(), actualWeightKg },
    });
    res.json({ collection });
  } catch (err) {
    next(err);
  }
});
