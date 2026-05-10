import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminHash = await bcrypt.hash('admin1234', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopflow.dev' },
    update: {},
    create: {
      email: 'admin@shopflow.dev',
      name: 'Admin User',
      role: 'ADMIN',
      passwordHash: adminHash,
    },
  })

  // Customer user
  const customerHash = await bcrypt.hash('customer123', 12)
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Jane Doe',
      role: 'CUSTOMER',
      passwordHash: customerHash,
    },
  })

  // Categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Gadgets, devices and tech accessories',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
    },
  })

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion for every occasion',
      imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
    },
  })

  const homeKitchen = await prisma.category.upsert({
    where: { slug: 'home-kitchen' },
    update: {},
    create: {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Everything for your home',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
    },
  })

  // Products
  const products = [
    {
      slug: 'wireless-noise-cancelling-headphones',
      name: 'Wireless Noise-Cancelling Headphones',
      description:
        'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and studio-quality sound.',
      price: 299.99,
      stock: 45,
      featured: true,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
      ],
    },
    {
      slug: 'mechanical-gaming-keyboard',
      name: 'Mechanical Gaming Keyboard',
      description:
        'RGB backlit mechanical keyboard with Cherry MX switches, full N-key rollover, and durable aluminum frame.',
      price: 149.99,
      stock: 30,
      featured: false,
      categoryId: electronics.id,
      images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800'],
    },
    {
      slug: 'classic-white-t-shirt',
      name: 'Classic White T-Shirt',
      description: '100% organic cotton essential tee. Relaxed fit, pre-shrunk, machine washable.',
      price: 29.99,
      stock: 200,
      featured: true,
      categoryId: clothing.id,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    },
    {
      slug: 'slim-fit-chinos',
      name: 'Slim Fit Chinos',
      description: 'Versatile slim-fit chinos made from stretch cotton blend. Perfect for work or weekend.',
      price: 69.99,
      stock: 80,
      featured: false,
      categoryId: clothing.id,
      images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800'],
    },
    {
      slug: 'ceramic-pour-over-coffee-set',
      name: 'Ceramic Pour Over Coffee Set',
      description:
        'Handcrafted ceramic dripper with matching carafe and two mugs. Includes a pack of paper filters.',
      price: 89.99,
      stock: 25,
      featured: true,
      categoryId: homeKitchen.id,
      images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'],
    },
    {
      slug: 'cast-iron-skillet-10inch',
      name: '10-inch Cast Iron Skillet',
      description:
        'Pre-seasoned cast iron skillet that gets better with every use. Compatible with all cooktops including induction.',
      price: 44.99,
      stock: 60,
      featured: false,
      categoryId: homeKitchen.id,
      images: ['https://images.unsplash.com/photo-1588591795084-1770cb3be374?w=800'],
    },
    {
      slug: '4k-usb-c-monitor',
      name: '27" 4K USB-C Monitor',
      description:
        '3840×2160 IPS display with 99% sRGB, 100W USB-C PD, and built-in KVM switch. Ideal for creators.',
      price: 549.99,
      comparePrice: 649.99,
      stock: 15,
      featured: true,
      categoryId: electronics.id,
      images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'],
    },
    {
      slug: 'merino-wool-sweater',
      name: 'Merino Wool Crew Sweater',
      description:
        'Lightweight yet warm 100% merino wool sweater. Temperature-regulating, odor-resistant, and machine washable.',
      price: 119.99,
      stock: 40,
      featured: false,
      categoryId: clothing.id,
      images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'],
    },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        comparePrice: (p as { comparePrice?: number }).comparePrice ?? null,
        stock: p.stock,
        featured: p.featured,
        categoryId: p.categoryId,
        images: p.images,
      },
    })
  }

  // Add size variants to clothing
  const tshirt = await prisma.product.findUnique({ where: { slug: 'classic-white-t-shirt' } })
  const sweater = await prisma.product.findUnique({ where: { slug: 'merino-wool-sweater' } })

  if (tshirt) {
    for (const size of ['XS', 'S', 'M', 'L', 'XL']) {
      await prisma.variant.upsert({
        where: { sku: `tshirt-${size.toLowerCase()}` },
        update: {},
        create: {
          productId: tshirt.id,
          name: 'Size',
          value: size,
          sku: `tshirt-${size.toLowerCase()}`,
          stock: 40,
        },
      })
    }
  }

  if (sweater) {
    for (const size of ['S', 'M', 'L', 'XL']) {
      await prisma.variant.upsert({
        where: { sku: `sweater-${size.toLowerCase()}` },
        update: {},
        create: {
          productId: sweater.id,
          name: 'Size',
          value: size,
          sku: `sweater-${size.toLowerCase()}`,
          stock: 10,
        },
      })
    }
  }

  // Coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off your first order',
      discount: 10,
      isPercent: true,
      maxUses: 1000,
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'SAVE20' },
    update: {},
    create: {
      code: 'SAVE20',
      description: '$20 off orders over $100',
      discount: 20,
      isPercent: false,
      minOrder: 100,
    },
  })

  console.log(`✅ Seed complete. Admin: admin@shopflow.dev / admin1234`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
