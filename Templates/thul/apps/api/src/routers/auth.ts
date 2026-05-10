import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'
import { generateSessionToken } from '../middleware/auth'

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(80),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({ where: { email: input.email } })
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered' })

      const passwordHash = await bcrypt.hash(input.password, 12)
      const user = await ctx.prisma.user.create({
        data: { name: input.name, email: input.email, passwordHash },
      })

      const token = generateSessionToken()
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await ctx.prisma.session.create({
        data: { userId: user.id, sessionToken: token, expires },
      })

      return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
    }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({ where: { email: input.email } })
      if (!user?.passwordHash)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' })

      const valid = await bcrypt.compare(input.password, user.passwordHash)
      if (!valid) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' })

      const token = generateSessionToken()
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      await ctx.prisma.session.create({
        data: { userId: user.id, sessionToken: token, expires },
      })

      return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.token) {
      await ctx.prisma.session.deleteMany({ where: { sessionToken: ctx.token } })
    }
    return { success: true }
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      role: ctx.user.role,
      image: ctx.user.image,
    }
  }),
})
