import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import crypto from 'crypto'

export const adminRouter = router({
  dashboard: adminProcedure.query(async ({ ctx }) => {
    const [totalOrders, totalRevenue, totalUsers, totalProducts, recentOrders, lowStock] =
      await Promise.all([
        ctx.prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
        ctx.prisma.order.aggregate({
          where: { status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] } },
          _sum: { total: true },
        }),
        ctx.prisma.user.count({ where: { role: 'CUSTOMER' } }),
        ctx.prisma.product.count({ where: { published: true } }),
        ctx.prisma.order.findMany({
          where: { status: { not: 'CANCELLED' } },
          include: { items: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        ctx.prisma.product.findMany({
          where: { stock: { lte: 5 }, published: true },
          orderBy: { stock: 'asc' },
          take: 10,
        }),
      ])

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.total ?? 0),
      totalUsers,
      totalProducts,
      recentOrders,
      lowStock,
    }
  }),

  ordersList: adminProcedure
    .input(
      z.object({
        status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = input.status ? { status: input.status } : {}
      const [orders, total] = await Promise.all([
        ctx.prisma.order.findMany({
          where,
          include: { items: true, user: { select: { email: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.order.count({ where }),
      ])
      return { orders, total, pages: Math.ceil(total / input.limit) }
    }),

  customerList: adminProcedure
    .input(z.object({ page: z.number().int().min(1).default(1) }))
    .query(async ({ ctx, input }) => {
      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where: { role: 'CUSTOMER' },
          select: { id: true, email: true, name: true, createdAt: true, _count: { select: { orders: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * 20,
          take: 20,
        }),
        ctx.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      ])
      return { users, total, pages: Math.ceil(total / 20) }
    }),

  generateCoupon: adminProcedure
    .input(
      z.object({
        discount: z.number().positive(),
        isPercent: z.boolean().default(true),
        minOrder: z.number().positive().optional(),
        maxUses: z.number().int().positive().optional(),
        expiresInDays: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 86400000)
        : undefined

      return ctx.prisma.coupon.create({
        data: {
          code,
          discount: input.discount,
          isPercent: input.isPercent,
          minOrder: input.minOrder ?? null,
          maxUses: input.maxUses ?? null,
          expiresAt: expiresAt ?? null,
        },
      })
    }),

  lowStockAlerts: adminProcedure
    .input(z.object({ threshold: z.number().int().default(5) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.product.findMany({
        where: { stock: { lte: input.threshold }, published: true },
        include: { category: true },
        orderBy: { stock: 'asc' },
      })
    }),
})
