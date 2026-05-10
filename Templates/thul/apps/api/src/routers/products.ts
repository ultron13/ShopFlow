import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { cacheGet, cacheSet, cacheDelPattern } from '../services/cache'
import { TRPCError } from '@trpc/server'

const productInclude = {
  category: true,
  variants: true,
  reviews: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: 'desc' as const }, take: 20 },
  _count: { select: { reviews: true } },
}

export const productsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        featured: z.boolean().optional(),
        sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'rating']).default('newest'),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const cacheKey = `products:list:${JSON.stringify(input)}`
      const cached = await cacheGet<unknown>(cacheKey)
      if (cached) return cached

      const where = {
        published: true,
        ...(input.categorySlug && { category: { slug: input.categorySlug } }),
        ...(input.featured !== undefined && { featured: input.featured }),
        ...(input.minPrice !== undefined || input.maxPrice !== undefined
          ? { price: { gte: input.minPrice, lte: input.maxPrice } }
          : {}),
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: 'insensitive' as const } },
            { description: { contains: input.search, mode: 'insensitive' as const } },
          ],
        }),
      }

      const orderBy =
        input.sortBy === 'price_asc' ? { price: 'asc' as const }
        : input.sortBy === 'price_desc' ? { price: 'desc' as const }
        : { createdAt: 'desc' as const }

      const [products, total] = await Promise.all([
        ctx.prisma.product.findMany({
          where,
          include: { category: true, _count: { select: { reviews: true } }, variants: true },
          orderBy,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.product.count({ where }),
      ])

      const result = { products, total, pages: Math.ceil(total / input.limit) }
      await cacheSet(cacheKey, result, 120)
      return result
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const cacheKey = `products:slug:${input.slug}`
      const cached = await cacheGet<unknown>(cacheKey)
      if (cached) return cached

      const product = await ctx.prisma.product.findUnique({
        where: { slug: input.slug, published: true },
        include: productInclude,
      })
      if (!product) throw new TRPCError({ code: 'NOT_FOUND' })

      await cacheSet(cacheKey, product, 300)
      return product
    }),

  related: publicProcedure
    .input(z.object({ categoryId: z.string(), excludeId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.product.findMany({
        where: { categoryId: input.categoryId, id: { not: input.excludeId }, published: true },
        include: { category: true, variants: true },
        take: 4,
      })
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().min(2),
        description: z.string(),
        price: z.number().positive(),
        comparePrice: z.number().positive().optional(),
        stock: z.number().int().min(0),
        categoryId: z.string(),
        images: z.array(z.string()).min(1),
        featured: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.create({ data: input })
      await cacheDelPattern('products:*')
      return product
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        comparePrice: z.number().positive().nullable().optional(),
        stock: z.number().int().min(0).optional(),
        images: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const product = await ctx.prisma.product.update({ where: { id }, data })
      await cacheDelPattern('products:*')
      return product
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.product.update({
        where: { id: input.id },
        data: { published: false },
      })
      await cacheDelPattern('products:*')
      return { success: true }
    }),

  getUploadUrl: adminProcedure
    .input(z.object({ contentType: z.string() }))
    .mutation(async ({ input }) => {
      const { getPresignedUploadUrl } = await import('../services/s3.js')
      return getPresignedUploadUrl(input.contentType)
    }),
})
