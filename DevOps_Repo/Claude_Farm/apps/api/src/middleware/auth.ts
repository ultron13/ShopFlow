import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AppError } from './errorHandler.js';

interface TokenPayload {
  sub: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

export function requireAuth(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new AppError(401, 'UNAUTHORIZED');

    const token = header.slice(7);
    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    } catch {
      throw new AppError(401, 'UNAUTHORIZED');
    }

    if (roles.length && !roles.includes(payload.role)) {
      throw new AppError(403, 'FORBIDDEN');
    }

    req.user = { id: payload.sub, role: payload.role };
    next();
  };
}
