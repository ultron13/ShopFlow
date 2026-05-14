import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public details?: unknown,
  ) {
    super(code);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.code, details: err.details });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.flatten() });
  }

  logger.error(err, 'Unhandled error');
  res.status(500).json({ error: 'INTERNAL_ERROR' });
}
