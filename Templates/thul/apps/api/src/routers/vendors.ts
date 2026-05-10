import { z } from 'zod'
import { router, protectedProcedure, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const vendorsRouter = router({
  register: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(2).max(100),
        description: z.string().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        province: z.string().default('Limpopo'),
        gpsLat: z.number().optional(),
        gpsLng: z.number().optional(),
        category: z.string().optional(),
        permitNumber: z.string().optional(),
        vatNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.vendor.findUnique({ where: { userId: ctx.user.id } })
      if (existing) {
        return ctx.prisma.vendor.update({ where: { userId: ctx.user.id }, data: input })
      }
      return ctx.prisma.vendor.create({ data: { ...input, userId: ctx.user.id } })
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.vendor.findUnique({ where: { userId: ctx.user.id } })
  }),

  list: publicProcedure
    .input(
      z.object({
        province: z.string().optional(),
        category: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.vendor.findMany({
        where: {
          isActive: true,
          ...(input?.province ? { province: input.province } : {}),
          ...(input?.category ? { category: input.category } : {}),
        },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
      })
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { id: input.id },
        include: { user: { select: { name: true, image: true } } },
      })
      if (!vendor) throw new TRPCError({ code: 'NOT_FOUND' })
      return vendor
    }),

  verify: adminProcedure
    .input(z.object({ id: z.string(), verified: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.vendor.update({ where: { id: input.id }, data: { isVerified: input.verified } })
    }),
})
