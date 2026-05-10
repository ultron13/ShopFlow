import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const cartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1),
})

const memberSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  shareAmount: z.number().positive(),
})

export const stokvelRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        description: z.string().optional(),
        targetAmount: z.number().positive(),
        cartItems: z.array(cartItemSchema).min(1),
        members: z.array(memberSchema).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const totalShares = input.members.reduce((sum, m) => sum + m.shareAmount, 0)
      if (Math.abs(totalShares - input.targetAmount) > 0.01)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Member shares (R${totalShares.toFixed(2)}) must equal target amount (R${input.targetAmount.toFixed(2)})`,
        })

      return ctx.prisma.stokvelGroup.create({
        data: {
          name: input.name,
          description: input.description,
          targetAmount: input.targetAmount,
          cartItems: input.cartItems,
          createdById: ctx.user.id,
          members: { create: input.members },
        },
        include: { members: true },
      })
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.prisma.stokvelGroup.findUnique({
        where: { id: input.id },
        include: {
          members: { include: { contributions: true } },
          contributions: { orderBy: { createdAt: 'desc' } },
        },
      })
      if (!group) throw new TRPCError({ code: 'NOT_FOUND' })
      return group
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.stokvelGroup.findMany({
      where: {
        OR: [
          { createdById: ctx.user.id },
          { members: { some: { email: ctx.user.email } } },
        ],
      },
      include: {
        members: { select: { email: true, shareAmount: true } },
        contributions: { select: { status: true, amount: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  contribute: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
        memberEmail: z.string().email(),
        amount: z.number().positive(),
        paymentMethod: z.enum(['PAYFAST', 'OZOW', 'SNAPSCAN', 'COD']),
        paymentRef: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.stokvelGroup.findUnique({
        where: { id: input.groupId, status: 'COLLECTING' },
        include: { members: true },
      })
      if (!group) throw new TRPCError({ code: 'NOT_FOUND', message: 'Group not found or no longer collecting' })

      const member = group.members.find((m) => m.email === input.memberEmail)
      if (!member) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Not a member of this group' })

      if (input.amount > Number(member.shareAmount))
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Amount exceeds your share of R${Number(member.shareAmount).toFixed(2)}`,
        })

      return ctx.prisma.stokvelContribution.create({
        data: {
          groupId: input.groupId,
          memberId: member.id,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          paymentRef: input.paymentRef,
          status: 'CONFIRMED',
        },
      })
    }),

  placeOrder: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.stokvelGroup.findUnique({
        where: { id: input.groupId, createdById: ctx.user.id, status: 'COLLECTING' },
        include: {
          members: true,
          contributions: { where: { status: 'CONFIRMED' } },
        },
      })
      if (!group) throw new TRPCError({ code: 'NOT_FOUND' })

      const totalContributed = group.contributions.reduce((sum, c) => sum + Number(c.amount), 0)
      const needed = Number(group.targetAmount) - totalContributed
      if (needed > 0.01)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Still need R${needed.toFixed(2)} before the order can be placed`,
        })

      const cartItems = group.cartItems as Array<{ productId: string; variantId?: string; quantity: number }>
      const products = await ctx.prisma.product.findMany({
        where: { id: { in: cartItems.map((i) => i.productId) }, published: true },
      })

      const orderItems = cartItems.map((item) => {
        const product = products.find((p) => p.id === item.productId)!
        const unitPrice = Number(product.price)
        return {
          productId: item.productId,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
          unitPrice,
          total: unitPrice * item.quantity,
          productName: product.name,
        }
      })

      const total = orderItems.reduce((sum, i) => sum + i.total, 0)

      const order = await ctx.prisma.order.create({
        data: {
          userId: ctx.user.id,
          paymentMethod: 'STOKVEL',
          status: 'CONFIRMED',
          subtotal: total,
          total,
          shippingAddress: {},
          stokvelGroupId: group.id,
          items: { create: orderItems },
        },
      })

      await ctx.prisma.stokvelGroup.update({
        where: { id: group.id },
        data: { status: 'COMPLETED' },
      })

      return { orderId: order.id }
    }),
})
