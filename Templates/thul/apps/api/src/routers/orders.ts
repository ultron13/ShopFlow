import { z } from 'zod'
import { router, protectedProcedure, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { createCheckoutSession, refundPaymentIntent } from '../services/stripe'

export const ordersRouter = router({
  create: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({ productId: z.string(), variantId: z.string().optional(), quantity: z.number().int().min(1) })
        ),
        couponCode: z.string().optional(),
        guestEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.token ? (await import('../middleware/auth.js').then((m) => m.verifyToken(ctx.token!, ctx.prisma)))?.id : undefined

      // Resolve products
      const productIds = input.items.map((i) => i.productId)
      const products = await ctx.prisma.product.findMany({
        where: { id: { in: productIds }, published: true },
      })

      if (products.length !== productIds.length)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'One or more products not found' })

      // Validate coupon
      let coupon = null
      if (input.couponCode) {
        coupon = await ctx.prisma.coupon.findUnique({ where: { code: input.couponCode, active: true } })
        if (!coupon) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid coupon code' })
        if (coupon.expiresAt && coupon.expiresAt < new Date())
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Coupon has expired' })
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Coupon usage limit reached' })
      }

      // Build order
      const orderItems = input.items.map((item) => {
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

      const subtotal = orderItems.reduce((sum, i) => sum + i.total, 0)
      let discount = 0
      if (coupon) {
        discount = coupon.isPercent
          ? (subtotal * Number(coupon.discount)) / 100
          : Number(coupon.discount)
        discount = Math.min(discount, subtotal)
      }

      const total = subtotal - discount

      // Placeholder order (confirmed by webhook)
      const order = await ctx.prisma.order.create({
        data: {
          userId: userId ?? null,
          guestEmail: input.guestEmail ?? null,
          stripeSessionId: 'pending',
          subtotal,
          discount,
          total,
          shippingAddress: {},
          couponId: coupon?.id ?? null,
          items: {
            create: orderItems,
          },
        },
      })

      const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
      const session = await createCheckoutSession({
        lineItems: orderItems.map((item) => ({
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(item.unitPrice * 100),
            product_data: { name: item.productName },
          },
          quantity: item.quantity,
        })),
        orderId: order.id,
        customerEmail: input.guestEmail,
        successUrl: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${appUrl}/cart`,
      })

      await ctx.prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      })

      return { checkoutUrl: session.url }
    }),

  list: protectedProcedure
    .input(z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().default(10) }))
    .query(async ({ ctx, input }) => {
      const [orders, total] = await Promise.all([
        ctx.prisma.order.findMany({
          where: { userId: ctx.user.id },
          include: { items: true },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.order.count({ where: { userId: ctx.user.id } }),
      ])
      return { orders, total, pages: Math.ceil(total / input.limit) }
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findFirst({
        where: { id: input.id, userId: ctx.user.id },
        include: { items: { include: { product: true } }, coupon: true },
      })
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' })
      return order
    }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.string(), status: z.enum(['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.order.update({ where: { id: input.id }, data: { status: input.status } })
    }),

  refund: adminProcedure
    .input(z.object({ id: z.string(), amount: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({ where: { id: input.id } })
      if (!order?.stripePaymentIntentId)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No payment intent on this order' })

      await refundPaymentIntent(
        order.stripePaymentIntentId,
        input.amount ? Math.round(input.amount * 100) : undefined
      )

      return ctx.prisma.order.update({ where: { id: input.id }, data: { status: 'REFUNDED' } })
    }),
})
