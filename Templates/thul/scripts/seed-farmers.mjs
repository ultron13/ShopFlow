import { PrismaClient } from '../node_modules/@prisma/client/index.js'

const prisma = new PrismaClient()

const FARMERS = [
  {
    user: { email: 'johannes.pretorius@shopflow.dev', name: 'Johannes Pretorius' },
    vendor: {
      businessName: 'Pretorius Family Farm',
      description: 'Third-generation family farm in the Magaliesberg growing tomatoes, onions, butternut and pumpkin. We supply Johannesburg fresh markets and sell direct to communities. No pesticides on our table-veg range.',
      category: 'Vegetable Farmer',
      province: 'North West',
      city: 'Magaliesburg',
      address: 'Plot 47, Magaliesburg Road, R24, Magaliesburg, 2805',
      phone: '0142345678',
      whatsapp: '0842345678',
      gpsLat: -26.0050,
      gpsLng: 27.5280,
      permitNumber: 'NW-FARM-2022-0081',
      vatNumber: '4521234567',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'agnes.sithole.farm@shopflow.dev', name: 'Agnes Sithole' },
    vendor: {
      businessName: 'Sithole Organic Vegetables',
      description: 'Small-scale organic vegetable farm in the Midlands. Growing spinach, kale, morogo, cabbage and sweet potato using traditional methods. Supplying Pietermaritzburg and surrounding areas. 100% chemical-free.',
      category: 'Organic Farmer',
      province: 'KwaZulu-Natal',
      city: 'Pietermaritzburg',
      address: 'Farm 12, Lions River Road, Currys Post, 3301',
      phone: '0332345678',
      whatsapp: '0812345678',
      gpsLat: -29.5230,
      gpsLng: 30.1890,
      permitNumber: 'KZN-FARM-2023-0142',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'daniel.van.wyk@shopflow.dev', name: 'Daniel van Wyk' },
    vendor: {
      businessName: 'Van Wyk Citrus Estate',
      description: 'Award-winning citrus estate near Citrusdal. Naartjies, Navels, Valencia oranges and lemons. Peak season May–Sep. We also press fresh orange juice by the 5L bottle. Export quality, local prices.',
      category: 'Fruit Farmer',
      province: 'Western Cape',
      city: 'Citrusdal',
      address: 'Skurfberg Farm, R365 Citrusdal, 7340',
      phone: '0226212345',
      whatsapp: '0726212345',
      gpsLat: -32.5890,
      gpsLng: 19.0120,
      permitNumber: 'WC-FARM-2021-0334',
      vatNumber: '4987654321',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'nomvula.dube@shopflow.dev', name: 'Nomvula Dube' },
    vendor: {
      businessName: "Nomvula's Banana & Pineapple Farm",
      description: 'Coastal KZN farm growing Cavendish bananas and Cayenne pineapples since 2008. Available year-round. We deliver to Durban markets every Tuesday and Friday. Community employment scheme — 12 local workers.',
      category: 'Fruit Farmer',
      province: 'KwaZulu-Natal',
      city: 'Port Shepstone',
      address: 'Banana Flats, Marburg Road, Port Shepstone, 4240',
      phone: '0392345678',
      whatsapp: '0762345678',
      gpsLat: -30.7390,
      gpsLng: 30.4530,
      permitNumber: 'KZN-FARM-2022-0267',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'pieter.joubert.farm@shopflow.dev', name: 'Pieter Joubert' },
    vendor: {
      businessName: 'Joubert Mango Orchards',
      description: 'Limpopo mango specialists — Peach, Tommy Atkins, Keitt and Valencia Pride. Harvest Dec–Mar. Sell by the crate (18kg) or individual. Based in the heart of the Tzaneen mango belt. Litchis also in season Dec–Jan.',
      category: 'Fruit Farmer',
      province: 'Limpopo',
      city: 'Tzaneen',
      address: 'Duiwelskloof Road, Haenertsburg, 0730',
      phone: '0152345678',
      whatsapp: '0722345678',
      gpsLat: -23.9480,
      gpsLng: 30.1340,
      permitNumber: 'LIM-FARM-2020-0019',
      vatNumber: '4112345678',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'thandi.nkosi.farm@shopflow.dev', name: 'Thandi Nkosi' },
    vendor: {
      businessName: 'Nkosi Community Garden Co-op',
      description: 'Women-led farming cooperative in Soweto growing leafy greens, tomatoes, peppers and herbs in raised urban beds. Partnered with 14 households. Fresh daily — pickup from our Meadowlands plot or order delivery to Soweto addresses.',
      category: 'Urban Farmer',
      province: 'Gauteng',
      city: 'Soweto',
      address: 'Plot 3A, Meadowlands Zone 9, Soweto, 1852',
      phone: '0112345670',
      whatsapp: '0832345670',
      gpsLat: -26.2356,
      gpsLng: 27.9012,
      isVerified: false,
      isActive: true,
    },
  },
  {
    user: { email: 'kobus.swanepoel@shopflow.dev', name: 'Kobus Swanepoel' },
    vendor: {
      businessName: 'Swanepoel Boer Pumpkin Farm',
      description: 'Specialist pumpkin and squash farm near Upington. Boer pumpkin, Hubbard, gem squash and butternut in season. Also grows samp maize and sugar beans. Sell by the bakkie load or individual units. Cold storage on-site.',
      category: 'Vegetable Farmer',
      province: 'Northern Cape',
      city: 'Upington',
      address: 'Farm Doringdraai, N14, Upington, 8800',
      phone: '0542345678',
      whatsapp: '0742345678',
      gpsLat: -28.3980,
      gpsLng: 21.1560,
      permitNumber: 'NC-FARM-2023-0055',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'sizwe.mahlangu@shopflow.dev', name: 'Sizwe Mahlangu' },
    vendor: {
      businessName: 'Mahlangu Herb & Chilli Farm',
      description: 'Growing peri-peri chillies, bird\'s eye, cayenne, fresh ginger and garlic in Mpumalanga. Supplying restaurants, spice traders and home cooks. Also sells dried and smoked chillies. Minimum order 500g.',
      category: 'Herb & Spice Farmer',
      province: 'Mpumalanga',
      city: 'Nelspruit',
      address: 'R40 White River Road, Hazyview Junction, 1242',
      phone: '0132345678',
      whatsapp: '0792345678',
      gpsLat: -25.4720,
      gpsLng: 31.0050,
      permitNumber: 'MP-FARM-2024-0088',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'maria.bezuidenhout@shopflow.dev', name: 'Maria Bezuidenhout' },
    vendor: {
      businessName: 'Bezuidenhout Free Range Farm',
      description: 'Mixed vegetable and herb farm in the Karoo producing garlic, onions, beetroot, carrots and dried herbs (rosemary, thyme, oregano). Also offers farm-dried raisins from our vineyard block. Weekly delivery to Cape Town.',
      category: 'Vegetable Farmer',
      province: 'Western Cape',
      city: 'Montagu',
      address: 'Nooitgedacht Farm, R62, Montagu, 6720',
      phone: '0232345678',
      whatsapp: '0832345678',
      gpsLat: -33.7820,
      gpsLng: 20.1180,
      permitNumber: 'WC-FARM-2022-0201',
      vatNumber: '4765432100',
      isVerified: true,
      isActive: true,
    },
  },
  {
    user: { email: 'lungelo.zulu@shopflow.dev', name: 'Lungelo Zulu' },
    vendor: {
      businessName: 'Zulu Amadumbe & Sweet Potato Co.',
      description: 'Indigenous root vegetable specialists in the KZN midlands. Amadumbe, sweet potato (orange and purple), and wild yam. Selling to Durban markets, schools and restaurants. Traditional planting methods, no artificial fertiliser.',
      category: 'Organic Farmer',
      province: 'KwaZulu-Natal',
      city: 'Greytown',
      address: 'Farm 8, Keates Drift Road, Greytown, 3250',
      phone: '0332456789',
      whatsapp: '0712456789',
      gpsLat: -29.0640,
      gpsLng: 30.5940,
      permitNumber: 'KZN-FARM-2023-0388',
      isVerified: false,
      isActive: true,
    },
  },
]

async function main() {
  console.log('Seeding farmers…')
  for (const { user, vendor } of FARMERS) {
    const u = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { email: user.email, name: user.name, role: 'CUSTOMER' },
    })
    await prisma.vendor.upsert({
      where: { userId: u.id },
      update: vendor,
      create: { ...vendor, userId: u.id },
    })
    console.log(`  ✓ ${vendor.businessName} — ${vendor.city}, ${vendor.province}`)
  }
  const total = await prisma.vendor.count()
  console.log(`\nDone — ${total} total vendors/farmers in database.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
