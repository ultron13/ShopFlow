import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';
import { AppError } from '../middleware/errorHandler.js';

interface RegisterInput {
  phone: string;
  name: string;
  role: Role;
  password: string;
  email?: string;
  popiaConsent: true;
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
    if (existing) throw new AppError(409, 'CONFLICT', { field: 'phone' });

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        phone: input.phone,
        name: input.name,
        role: input.role,
        email: input.email,
        passwordHash,
        popiaConsent: true,
        popiaConsentAt: new Date(),
      },
      select: { id: true, phone: true, name: true, role: true },
    });

    return { user, ...this.issueTokens(user.id, user.role) };
  }

  async login(phone: string, password: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !user.isActive) throw new AppError(401, 'UNAUTHORIZED');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'UNAUTHORIZED');

    return {
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
      ...this.issueTokens(user.id, user.role),
    };
  }

  async refresh(token: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new AppError(401, 'UNAUTHORIZED');
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: stored.userId } });
    const accessToken = this.signAccess(user.id, user.role);
    return { accessToken };
  }

  async logout(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await redis.del(`session:${userId}`);
  }

  private issueTokens(userId: string, role: Role) {
    const accessToken = this.signAccess(userId, role);
    const refreshToken = jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d',
    });

    prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private signAccess(userId: string, role: Role) {
    return jwt.sign({ sub: userId, role }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  }
}
