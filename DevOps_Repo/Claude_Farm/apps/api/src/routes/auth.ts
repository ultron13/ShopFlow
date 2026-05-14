import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { AuthService } from '../services/auth.service.js';

export const authRouter = Router();
const authService = new AuthService();

const registerSchema = z.object({
  phone: z.string().regex(/^\+27\d{9}$/),
  name: z.string().min(2),
  role: z.enum(['FARMER', 'BUYER', 'FIELD_AGENT']),
  password: z.string().min(8),
  email: z.string().email().optional(),
  popiaConsent: z.literal(true),
});

const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

authRouter.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body.phone, req.body.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', requireAuth(), async (req, res, next) => {
  try {
    await authService.logout(req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
