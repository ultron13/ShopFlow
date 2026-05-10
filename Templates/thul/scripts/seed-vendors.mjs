/**
 * Seeds 12 realistic SA street vendors across provinces.
 * Each vendor gets a user row first (vendors table requires a userId FK).
 */

import { PrismaClient } from '../node_modules/@prisma/client/index.js'

const prisma = new PrismaClient()

const VENDORS = [
  {
    user: { email: 'nomsa.dlamini@shopflow.dev', name: 'Nomsa Dlamini' },
    vendor: {
      businessName: "Nomsa's Fresh Produce",
      description: 'Tomatoes, spinach, morogo and amadumbe sourced daily from local farmers in the Vhembe district. No preservatives, no middleman.',
      category: 'Fruits & Vegetables',
      province: 'Limpopo',
      city: 'Thohoyandou',
      address: 'Stall 7, Mvusuludzo Market, Thohoyandou, 0950',
      phone: '0823456789',
      whatsapp: '0823456789',
      gpsLat: -22.9384,
      gpsLng: 30.4666,
      permitNumber: 'LIM-2024-0042',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'sipho.ndlovu@shopflow.dev', name: 'Sipho Ndlovu' },
    vendor: {
      businessName: 'Sipho Mango King',
      description: 'Premium Limpopo mangoes — Peach, Valencia Pride and Tommy Atkins. Seasonal Dec–Mar. Also litchis and guavas when in season.',
      category: 'Fruits & Vegetables',
      province: 'Limpopo',
      city: 'Tzaneen',
      address: 'N1 Road, Tzaneen Fresh Market, opposite Checkers',
      phone: '0761234567',
      whatsapp: '0761234567',
      gpsLat: -23.8330,
      gpsLng: 30.1610,
      permitNumber: 'LIM-2024-0117',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'zanele.mthembu@shopflow.dev', name: 'Zanele Mthembu' },
    vendor: {
      businessName: 'Zanele Herbs & Spices',
      description: 'Dried and fresh herbs: umhlonyane, wild garlic, impepho, chillies, ginger. Traditional and culinary uses. We also stock rooibos in bulk.',
      category: 'Spices & Herbs',
      province: 'KwaZulu-Natal',
      city: 'Durban',
      address: 'Victoria Street Market, Stall 34, Durban CBD, 4001',
      phone: '0312456789',
      whatsapp: '0798765432',
      gpsLat: -29.8587,
      gpsLng: 31.0218,
      permitNumber: 'KZN-2023-0589',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'thabo.molefe@shopflow.dev', name: 'Thabo Molefe' },
    vendor: {
      businessName: 'Thabo Vegetables — Soweto',
      description: 'Serving Soweto families since 2011. Cabbages, onions, potatoes, carrots and butternut every day. Bulk deals available for stokvels.',
      category: 'Fruits & Vegetables',
      province: 'Gauteng',
      city: 'Soweto',
      address: 'Phiri Taxi Rank, next to Nandos, Phiri, Soweto, 1818',
      phone: '0114567890',
      whatsapp: '0825551234',
      gpsLat: -26.2700,
      gpsLng: 27.8580,
      isVerified: false,
      isActive: true,
    },
  },
  {
    user: { email: 'lindiwe.khumalo@shopflow.dev', name: 'Lindiwe Khumalo' },
    vendor: {
      businessName: "Lindiwe's Amadumbe & More",
      description: 'Specialists in KZN indigenous produce — amadumbe, imifino, umdumba and green bananas. Home delivery to Umlazi and surrounding areas.',
      category: 'Fruits & Vegetables',
      province: 'KwaZulu-Natal',
      city: 'Umlazi',
      address: 'V Section, Umlazi Market, opposite Home Affairs, 4031',
      phone: '0315678901',
      whatsapp: '0735678901',
      gpsLat: -29.9800,
      gpsLng: 30.8820,
      permitNumber: 'KZN-2024-0231',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'petrus.van.der.berg@shopflow.dev', name: 'Petrus van der Berg' },
    vendor: {
      businessName: 'Boland Farm Stall',
      description: 'Certified Western Cape apricots, peaches, plums and naartjies in season. Year-round: garlic, lemons, gem squash and potatoes from our farm outside Paarl.',
      category: 'Fruits & Vegetables',
      province: 'Western Cape',
      city: 'Paarl',
      address: 'N1 Motorway Farmstall, Klein Drakenstein, Paarl, 7646',
      phone: '0218234567',
      whatsapp: '0728234567',
      gpsLat: -33.7280,
      gpsLng: 18.9580,
      permitNumber: 'WC-2023-1102',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'grace.mokoena@shopflow.dev', name: 'Grace Mokoena' },
    vendor: {
      businessName: "Mama Grace's Kitchen Stall",
      description: 'Freshly cooked pap, chakalaka, tripe and mogodu. Also selling uncooked offal and bulk maize meal. Open Mon–Sat 6am–4pm.',
      category: 'Cooked Food',
      province: 'Gauteng',
      city: 'Alexandra',
      address: '18th Ave Market, Alexandra Township, 2090',
      phone: '0117654321',
      whatsapp: '0827654321',
      gpsLat: -26.1025,
      gpsLng: 28.0994,
      isVerified: false,
      isActive: true,
    },
  },
  {
    user: { email: 'beauty.sithole@shopflow.dev', name: 'Beauty Sithole' },
    vendor: {
      businessName: 'Beauty Tomatoes — Tembisa',
      description: 'Wholesale and retail tomatoes, green peppers and chillies. We supply spaza shops in Tembisa, Kempton Park and Ivory Park. Order by the crate.',
      category: 'Fruits & Vegetables',
      province: 'Gauteng',
      city: 'Tembisa',
      address: 'Rabie Ridge Fresh Produce Market, Stall B-12, Tembisa, 1628',
      phone: '0119876543',
      whatsapp: '0829876543',
      gpsLat: -25.9967,
      gpsLng: 28.2286,
      permitNumber: 'GP-2024-0778',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'elizabeth.plaatjie@shopflow.dev', name: 'Elizabeth Plaatjie' },
    vendor: {
      businessName: 'Northern Cape Sweet Raisins',
      description: 'Sun-dried sultanas, Muscat raisins, dried apricots and currants from the Orange River vineyards. Best prices in the Northern Cape.',
      category: 'Fruits & Vegetables',
      province: 'Northern Cape',
      city: 'Upington',
      address: 'Orange River Market, Le Roux Street, Upington, 8800',
      phone: '0545678912',
      whatsapp: '0725678912',
      gpsLat: -28.4510,
      gpsLng: 21.2561,
      permitNumber: 'NC-2023-0044',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'vusi.shabangu@shopflow.dev', name: 'Vusi Shabangu' },
    vendor: {
      businessName: "Vusi's Mpumalanga Avocados",
      description: 'Haas and Fuerte avocados from the Hazyview highlands. Picked to order — call a day ahead for same-day collection. Also papaya and litchi when in season.',
      category: 'Fruits & Vegetables',
      province: 'Mpumalanga',
      city: 'Hazyview',
      address: 'R40, Hazyview Fruit Market, opposite Caltex, 1242',
      phone: '0137891234',
      whatsapp: '0797891234',
      gpsLat: -24.9430,
      gpsLng: 31.1290,
      permitNumber: 'MP-2024-0315',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'miriam.tau@shopflow.dev', name: 'Miriam Tau' },
    vendor: {
      businessName: "Miriam's Kasi Kiosk — Mafikeng",
      description: 'Seasonal maize, pumpkin and morogo from North West farms. Also stockist of fat cakes ingredients (flour, oil, yeast) in bulk.',
      category: 'Fruits & Vegetables',
      province: 'North West',
      city: 'Mafikeng',
      address: 'Montshiwa Stad Market, Cnr Sekame & Cooke, Mafikeng, 2745',
      phone: '0189001234',
      whatsapp: '0829001234',
      gpsLat: -25.8534,
      gpsLng: 25.6407,
      isVerified: false,
      isActive: true,
    },
  },
  {
    user: { email: 'andile.mhlanga@shopflow.dev', name: 'Andile Mhlanga' },
    vendor: {
      businessName: 'East London Pineapple & Citrus',
      description: 'Fresh pineapples from the KZN coast plus Eastern Cape naartjies, oranges and lemons in season. Bulk orders for schools and restaurants welcome.',
      category: 'Fruits & Vegetables',
      province: 'Eastern Cape',
      city: 'East London',
      address: 'Oxford Street Fresh Market, East London CBD, 5201',
      phone: '0431234567',
      whatsapp: '0761234580',
      gpsLat: -32.9993,
      gpsLng: 27.9054,
      permitNumber: 'EC-2024-0201',
      isVerified: true,
      isActive: true,
    },
  },
]

async function main() {
  console.log('Seeding vendors…')

  for (const { user, vendor } of VENDORS) {
    // Upsert the user (ignore duplicates)
    const u = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        role: 'CUSTOMER',
      },
    })

    // Upsert the vendor
    await prisma.vendor.upsert({
      where: { userId: u.id },
      update: vendor,
      create: { ...vendor, userId: u.id },
    })

    console.log(`  ✓ ${vendor.businessName} (${vendor.city}, ${vendor.province})`)
  }

  const total = await prisma.vendor.count()
  console.log(`\nDone — ${total} vendors in database.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
