import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import type { Context } from './context'
import { verifyToken } from './middleware/auth'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.token) throw new TRPCError({ code: 'UNAUTHORIZED' })
  const user = await verifyToken(ctx.token, ctx.prisma)
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, user } })
})

const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.token) throw new TRPCError({ code: 'UNAUTHORIZED' })
  const user = await verifyToken(ctx.token, ctx.prisma)
  if (!user || user.role !== 'ADMIN') throw new TRPCError({ code: 'FORBIDDEN' })
  return next({ ctx: { ...ctx, user } })
})

export const protectedProcedure = t.procedure.use(isAuthed)
export const adminProcedure = t.procedure.use(isAdmin)
