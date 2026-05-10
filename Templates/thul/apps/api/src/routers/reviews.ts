import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { cacheDelPattern } from '../services/cache'

export const reviewsRouter = router({
  list: publicProcedure
    .input(z.object({ productId: z.string(), page: z.number().int().min(1).default(1) }))
    .query(async ({ ctx, input }) => {
      const [reviews, total] = await Promise.all([
        ctx.prisma.review.findMany({
          where: { productId: input.productId },
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * 10,
          take: 10,
        }),
        ctx.prisma.review.count({ where: { productId: input.productId } }),
      ])
      return { reviews, total, pages: Math.ceil(total / 10) }
    }),

  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(100).optional(),
        body: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify purchased (optional but enforces "verified" flag)
      const hasPurchased = await ctx.prisma.orderItem.findFirst({
        where: {
          productId: input.productId,
          order: { userId: ctx.user.id, status: 'DELIVERED' },
        },
      })

      const review = await ctx.prisma.review.create({
        data: { ...input, userId: ctx.user.id, verified: !!hasPurchased },
      })
      await cacheDelPattern(`products:slug:*`)
      return review
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.findUnique({ where: { id: input.id } })
      if (!review) throw new TRPCError({ code: 'NOT_FOUND' })
      await ctx.prisma.review.delete({ where: { id: input.id } })
      await cacheDelPattern('products:slug:*')
      return { success: true }
    }),
})
