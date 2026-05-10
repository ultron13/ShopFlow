/**
 * Seeds SA street market produce categories and products.
 * Clears old demo products first, keeps categories clean.
 */
import { PrismaClient } from '../node_modules/@prisma/client/index.js'

const prisma = new PrismaClient()

const CATEGORIES = [
  { name: 'Fresh Vegetables', slug: 'vegetables',   description: 'Locally grown vegetables from SA street markets' },
  { name: 'Fresh Fruit',      slug: 'fruit',         description: 'Seasonal fruit direct from SA farms and markets' },
  { name: 'Herbs & Spices',   slug: 'herbs-spices',  description: 'Fresh and dried herbs, spices and traditional roots' },
  { name: 'Grains & Staples', slug: 'grains',        description: 'Maize meal, rice, beans and dry goods' },
  { name: 'Cooked & Ready',   slug: 'cooked-food',   description: 'Ready-to-eat street food and prepared goods' },
]

// Unsplash images — real produce photography
const PRODUCTS = [
  // ── Fresh Vegetables ──────────────────────────────────────────────────────
  {
    cat: 'vegetables',
    name: 'Tomatoes — loose kg',
    slug: 'tomatoes-loose-kg',
    description: 'Ripe, juicy tomatoes picked fresh from Limpopo farms. Sold per kilogram — perfect for chakalaka, salads and cooking.',
    price: 14.99, comparePrice: 19.99, stock: 200, featured: true,
    images: ['https://images.unsplash.com/photo-1546470427-e26264be0b11?w=600'],
  },
  {
    cat: 'vegetables',
    name: 'Spinach — large bunch',
    slug: 'spinach-large-bunch',
    description: 'Fresh dark-leaf spinach, harvested this morning. One bunch feeds a family of four. Great for morogo or creamed spinach.',
    price: 8.99, stock: 150, featured: true,
    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600'],
  },
  {
    cat: 'vegetables',
    name: 'Cabbage — whole head',
    slug: 'cabbage-whole-head',
    description: 'Crisp drumhead cabbage, approx 1.5kg. A South African kitchen staple — braised, stewed or raw in coleslaw.',
    price: 12.99, stock: 120,
    images: ['https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600'],
  },
  {
    cat: 'vegetables',
    name: 'Butternut Squash — each',
    slug: 'butternut-squash-each',
    description: 'Sweet, dense butternut squash from the Northern Cape. Roast, soup or mash — the winter staple of every SA home.',
    price: 16.99, comparePrice: 22.00, stock: 80, featured: true,
    images: ['https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=600'],
  },
  {
    cat: 'vegetables',
    name: 'Gem Squash — bag of 4',
    slug: 'gem-squash-bag-4',
    description: 'Four small gem squash, perfect for stuffing with mince or cheese. A uniquely South African vegetable.',
    price: 18.99, stock: 60,
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600'],
  },
  {
    cat: 'vegetables',
    name: 'Sweet Potato — 2kg bag',
    slug: 'sweet-potato-2kg',
    description: 'Orange-flesh sweet potatoes from KwaZulu-Natal. Naturally sweet, great for boiling, roasting or making vetkoek filling.',
    price: 24.99, stock: 90,
    images: ['https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=600'],
  },
  {
    cat: 'vegetables',
    name: 'Onions — 3kg bag',
    slug: 'onions-3kg-bag',
    description: 'South African brown onions from the Northern Cape. The foundation of every SA meal — braai, potjie or stew.',
    price: 19.99, comparePrice: 26.00, stock: 200,
    images: ['https://images.unsplash.com/photo-1508747703725-719777637510?w=600'],
  },
  {
    cat: 'vegetables',
    name: 'Green Pepper — 500g',
    slug: 'green-pepper-500g',
    description: 'Crisp green peppers, sold in 500g packs. Essential in chakalaka, stews and braai salads.',
    price: 11.99, stock: 100,
    images: ['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600'],
  },
  {
    cat: 'vegetables',
    name: 'Amadumbe (Taro Root) — kg',
    slug: 'amadumbe-taro-kg',
    description: 'Indigenous KZN taro root — starchy, nutty and deeply nourishing. Boil or steam like potato. A Zulu household staple.',
    price: 22.99, stock: 40,
    images: ['https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=600'],
  },
  {
    cat: 'vegetables',
    name: 'Pumpkin — half (Boer)',
    slug: 'pumpkin-half-boer',
    description: 'Traditional Boer pumpkin (Hubbard), sold by the half. For pampoenkoekies (fritters), soup or as a side to your braai.',
    price: 15.99, stock: 35,
    images: ['https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600'],
  },
  {
    cat: 'vegetables',
    name: 'Beetroot — bunch of 4',
    slug: 'beetroot-bunch-4',
    description: 'Fresh beetroot with leaves still on. Boil, pickle or grate raw. A South African braai side that no one skips.',
    price: 13.99, stock: 70,
    images: ['https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600'],
  },
  {
    cat: 'vegetables',
    name: 'Fresh Chillies — 250g',
    slug: 'fresh-chillies-250g',
    description: "Mixed red and green chillies from Limpopo. Bird's eye and long variety. For chakalaka, peri-peri sauces and pap garnish.",
    price: 9.99, stock: 80,
    images: ['https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=600'],
  },

  // ── Fresh Fruit ───────────────────────────────────────────────────────────
  {
    cat: 'fruit',
    name: 'Mangoes — Peach variety, each',
    slug: 'mango-peach-each',
    description: 'Sweet Peach mangoes from Thohoyandou, Limpopo. Picked at peak ripeness Dec–Feb. Juicy, aromatic and seedling-thin skin.',
    price: 7.99, comparePrice: 10.00, stock: 150, featured: true,
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=600'],
  },
  {
    cat: 'fruit',
    name: 'Avocados — bag of 4 (Haas)',
    slug: 'avocado-haas-bag-4',
    description: 'Creamy Haas avocados from the Tzaneen highlands. Ready to eat within 1–2 days. Best avo season Mar–Jun.',
    price: 34.99, comparePrice: 44.00, stock: 80, featured: true,
    images: ['https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=600'],
  },
  {
    cat: 'fruit',
    name: 'Naartjies — 1kg bag',
    slug: 'naartjies-1kg-bag',
    description: 'Sweet, easy-peel naartjies (SA tangerine) from the Western Cape. In season May–Aug — the definitive winter lunchbox fruit.',
    price: 17.99, stock: 120, featured: true,
    images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600'],
  },
  {
    cat: 'fruit',
    name: 'Bananas — large bunch (~1.5kg)',
    slug: 'bananas-large-bunch',
    description: 'Sweet Cavendish bananas from KwaZulu-Natal South Coast. Year-round availability. Perfect for the school lunchbox.',
    price: 21.99, stock: 200,
    images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600'],
  },
  {
    cat: 'fruit',
    name: 'Watermelon — whole (5–7kg)',
    slug: 'watermelon-whole',
    description: 'Big, sweet watermelon from Limpopo. Perfect for summer braais. Order ahead — limited stock daily.',
    price: 44.99, comparePrice: 60.00, stock: 25,
    images: ['https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=600'],
  },
  {
    cat: 'fruit',
    name: 'Litchis — 500g punnet',
    slug: 'litchis-500g-punnet',
    description: 'Fresh Mauritius litchis from Hazyview and Tzaneen. Only available Dec–Jan — order early, they sell out fast.',
    price: 29.99, comparePrice: 39.99, stock: 30,
    images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600'],
  },
  {
    cat: 'fruit',
    name: 'Guavas — 1kg bag',
    slug: 'guavas-1kg-bag',
    description: 'Pink-flesh guavas from Mpumalanga. Eat fresh, make guava juice or boil into guava jam. In season Feb–May.',
    price: 15.99, stock: 50,
    images: ['https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600'],
  },
  {
    cat: 'fruit',
    name: 'Lemons — 6-pack',
    slug: 'lemons-6-pack',
    description: 'Thin-skinned Eureka lemons from Limpopo. Year-round. Juicy and fragrant — for drinks, cooking and marinades.',
    price: 13.99, stock: 150,
    images: ['https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600'],
  },
  {
    cat: 'fruit',
    name: 'Pineapple — each',
    slug: 'pineapple-each',
    description: 'Fresh pineapple from the KZN South Coast. Golden, sweet and ready to cut. Great with braai or fresh juice.',
    price: 22.99, stock: 60,
    images: ['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600'],
  },

  // ── Herbs & Spices ────────────────────────────────────────────────────────
  {
    cat: 'herbs-spices',
    name: 'Fresh Ginger Root — 200g',
    slug: 'fresh-ginger-200g',
    description: 'Knobbly fresh ginger from KZN. Grate into curries, stews or hot drinks. Anti-inflammatory and aromatic.',
    price: 12.99, stock: 80,
    images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600'],
  },
  {
    cat: 'herbs-spices',
    name: 'Garlic — full head (5-pack)',
    slug: 'garlic-5-head-pack',
    description: 'Cured garlic heads from the Western Cape. Strong flavour, long shelf life. Braai marinade essential.',
    price: 16.99, stock: 100,
    images: ['https://images.unsplash.com/photo-1537986902979-1a84f3e02eed?w=600'],
  },
  {
    cat: 'herbs-spices',
    name: 'Mixed Dried Chillies — 100g',
    slug: 'dried-chillies-100g',
    description: "Sun-dried bird's eye and cayenne chillies. Crush or grind for peri-peri, chakalaka or braai rubs.",
    price: 18.99, stock: 60,
    images: ['https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600'],
  },
  {
    cat: 'herbs-spices',
    name: 'Fresh Coriander — bunch',
    slug: 'fresh-coriander-bunch',
    description: 'Fragrant coriander (dhania) bunch. Freshly cut. Widely used in Cape Malay cooking, curries and fresh salads.',
    price: 7.99, stock: 90,
    images: ['https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600'],
  },
  {
    cat: 'herbs-spices',
    name: 'Braai Spice Mix — 150g',
    slug: 'braai-spice-mix-150g',
    description: 'Traditional SA braai spice blend: paprika, coriander, garlic, cumin and black pepper. Works on chicken, boerewors and chops.',
    price: 22.99, comparePrice: 28.00, stock: 45, featured: true,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'],
  },

  // ── Grains & Staples ──────────────────────────────────────────────────────
  {
    cat: 'grains',
    name: 'White Maize Meal — 5kg',
    slug: 'white-maize-meal-5kg',
    description: 'Fine white maize meal for smooth pap. The cornerstone of South African cooking. Goes with everything — vleis, morogo, chakalaka.',
    price: 49.99, comparePrice: 64.00, stock: 100, featured: true,
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600'],
  },
  {
    cat: 'grains',
    name: 'Dried Sugar Beans — 2kg',
    slug: 'dried-sugar-beans-2kg',
    description: 'Speckled sugar beans, a South African favourite. Cook slowly with pork trotters or serve as a side to braai.',
    price: 34.99, stock: 80,
    images: ['https://images.unsplash.com/photo-1547496502-affa22d38842?w=600'],
  },
  {
    cat: 'grains',
    name: 'Samp — 2kg bag',
    slug: 'samp-2kg-bag',
    description: 'Stamped maize kernels for samp and beans (umngqusho). A traditional staple, slow-cooked until soft and buttery.',
    price: 39.99, stock: 55,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'],
  },
  {
    cat: 'grains',
    name: 'Mealie Cobs — bag of 6',
    slug: 'mealie-cobs-bag-6',
    description: 'Fresh green mealies from Limpopo — Feb to April. Roast on the braai or boil with salt. Seasonal — get them while you can.',
    price: 19.99, comparePrice: 24.00, stock: 40,
    images: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600'],
  },

  // ── Cooked & Ready ────────────────────────────────────────────────────────
  {
    cat: 'cooked-food',
    name: 'Chakalaka — 500ml jar',
    slug: 'chakalaka-500ml-jar',
    description: 'Homemade spicy chakalaka — carrots, peppers, baked beans and chilli. Made fresh by Mama Grace. The perfect braai relish.',
    price: 29.99, comparePrice: 35.00, stock: 30, featured: true,
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600'],
  },
  {
    cat: 'cooked-food',
    name: 'Magwinya (Fat Cakes) — bag of 6',
    slug: 'magwinya-bag-6',
    description: 'Freshly fried fat cakes — airy, golden and slightly sweet. A South African street food classic. Best eaten warm.',
    price: 15.99, stock: 20,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'],
  },
]

async function main() {
  console.log('Clearing old demo products…')
  await prisma.orderItem.deleteMany({})
  await prisma.cartItem.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.wishlistItem.deleteMany({})
  await prisma.variant.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.category.deleteMany({})

  console.log('Seeding categories…')
  const catMap = {}
  for (const c of CATEGORIES) {
    const cat = await prisma.category.create({
      data: { name: c.name, slug: c.slug, description: c.description },
    })
    catMap[c.slug] = cat.id
    console.log(`  ✓ ${c.name}`)
  }

  console.log('\nSeeding products…')
  let count = 0
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        stock: p.stock,
        images: p.images,
        featured: p.featured ?? false,
        published: true,
        categoryId: catMap[p.cat],
      },
    })
    count++
    console.log(`  ✓ ${p.name} — R${p.price}`)
  }

  console.log(`\nDone — ${count} products across ${CATEGORIES.length} categories.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
