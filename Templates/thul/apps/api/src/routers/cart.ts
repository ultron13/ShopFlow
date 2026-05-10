import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const cartRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.cartItem.findMany({
      where: { userId: ctx.user.id },
      include: { product: true, variant: true },
      orderBy: { createdAt: 'asc' },
    })
  }),

  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({ where: { id: input.productId } })
      if (!product || !product.published) throw new TRPCError({ code: 'NOT_FOUND' })

      const stockCheck = input.variantId
        ? await ctx.prisma.variant.findUnique({ where: { id: input.variantId } })
        : product

      if (!stockCheck || stockCheck.stock < input.quantity)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient stock' })

      return ctx.prisma.cartItem.upsert({
        where: {
          userId_productId_variantId: {
            userId: ctx.user.id,
            productId: input.productId,
            variantId: input.variantId ?? null,
          },
        },
        update: { quantity: { increment: input.quantity } },
        create: {
          userId: ctx.user.id,
          productId: input.productId,
          variantId: input.variantId ?? null,
          quantity: input.quantity,
        },
        include: { product: true, variant: true },
      })
    }),

  updateItem: protectedProcedure
    .input(z.object({ id: z.string(), quantity: z.number().int().min(0) }))
    .mutation(async ({ ctx, input }) => {
      if (input.quantity === 0) {
        await ctx.prisma.cartItem.deleteMany({
          where: { id: input.id, userId: ctx.user.id },
        })
        return { deleted: true }
      }
      return ctx.prisma.cartItem.updateMany({
        where: { id: input.id, userId: ctx.user.id },
        data: { quantity: input.quantity },
      })
    }),

  removeItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.cartItem.deleteMany({ where: { id: input.id, userId: ctx.user.id } })
      return { success: true }
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.cartItem.deleteMany({ where: { userId: ctx.user.id } })
    return { success: true }
  }),
})
