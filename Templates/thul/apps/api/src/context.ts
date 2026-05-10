import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { prisma } from '@shopflow/db'
import { redis } from './services/cache'

export function createContext({ req, res }: CreateExpressContextOptions) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  return { req, res, prisma, redis, token }
}

export type Context = Awaited<ReturnType<typeof createContext>>
