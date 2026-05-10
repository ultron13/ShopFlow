import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const wishlistRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.wishlistItem.findMany({
      where: { userId: ctx.user.id },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }),

  toggle: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.wishlistItem.findUnique({
        where: { userId_productId: { userId: ctx.user.id, productId: input.productId } },
      })
      if (existing) {
        await ctx.prisma.wishlistItem.delete({ where: { id: existing.id } })
        return { added: false }
      }
      await ctx.prisma.wishlistItem.create({
        data: { userId: ctx.user.id, productId: input.productId },
      })
      return { added: true }
    }),
})
