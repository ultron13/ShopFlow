import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FarmConnect SA...');

  // ── Users ─────────────────────────────────────────────────────────────────
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  const farmerUser = await prisma.user.upsert({
    where: { phone: '+27151000001' },
    update: {},
    create: {
      phone: '+27151000001',
      name: 'Sipho Nkosi',
      role: 'FARMER',
      passwordHash: hash('farmer123'),
      email: 'sipho@mahela.co.za',
      popiaConsent: true,
      popiaConsentAt: new Date(),
    },
  });

  const buyerUser = await prisma.user.upsert({
    where: { phone: '+27111000002' },
    update: {},
    create: {
      phone: '+27111000002',
      name: 'Ntombi Dlamini',
      role: 'BUYER',
      passwordHash: hash('buyer123'),
      email: 'ntombi@rosebankkitchen.co.za',
      popiaConsent: true,
      popiaConsentAt: new Date(),
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { phone: '+27761000003' },
    update: {},
    create: {
      phone: '+27761000003',
      name: 'Tebogo Mokoena',
      role: 'FIELD_AGENT',
      passwordHash: hash('agent123'),
      popiaConsent: true,
      popiaConsentAt: new Date(),
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { phone: '+27111000004' },
    update: {},
    create: {
      phone: '+27111000004',
      name: 'Operations Admin',
      role: 'OPS_ADMIN',
      passwordHash: hash('admin123'),
      email: 'ops@farmconnect.co.za',
      popiaConsent: true,
      popiaConsentAt: new Date(),
    },
  });

  // ── Cooperative ───────────────────────────────────────────────────────────
  const cooperative = await prisma.cooperative.upsert({
    where: { registrationNo: 'CK2010/123456' },
    update: {},
    create: {
      userId: farmerUser.id,
      name: 'Mahela Fresh Produce Cooperative',
      registrationNo: 'CK2010/123456',
      contactPhone: '+27152345678',
      contactEmail: 'info@mahela.co.za',
      addressLine1: 'Farm 45, Tzaneen Road',
      city: 'Tzaneen',
      province: 'Limpopo',
      gpsLat: -23.8320,
      gpsLng: 30.1571,
      bankName: 'First National Bank',
      bankAccountNo: '62123456789',
      bankBranchCode: '250655',
      isVerified: true,
      bbeeLevelCurrent: 1,
    },
  });

  await prisma.farm.upsert({
    where: { id: 'seed-farm-001' },
    update: {},
    create: {
      id: 'seed-farm-001',
      cooperativeId: cooperative.id,
      name: 'Nkosi Family Farm',
      gpsLat: -23.8400,
      gpsLng: 30.1600,
      hectares: 12.5,
      products: ['TOMATO_ROMA', 'TOMATO_CHERRY'],
    },
  });

  // ── Listings ──────────────────────────────────────────────────────────────
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await prisma.listing.upsert({
    where: { id: 'seed-listing-001' },
    update: {},
    create: {
      id: 'seed-listing-001',
      cooperativeId: cooperative.id,
      product: 'TOMATO_ROMA',
      grade: 'A',
      quantityKg: 8000,
      pricePerKgCents: 550,
      availableFrom: new Date(),
      availableUntil: nextWeek,
      description: 'Premium Roma tomatoes, harvested Monday. Excellent uniformity, 95%+ grade pass.',
      status: 'ACTIVE',
    },
  });

  await prisma.listing.upsert({
    where: { id: 'seed-listing-002' },
    update: {},
    create: {
      id: 'seed-listing-002',
      cooperativeId: cooperative.id,
      product: 'TOMATO_ROMA',
      grade: 'B',
      quantityKg: 3500,
      pricePerKgCents: 420,
      availableFrom: new Date(),
      availableUntil: nextWeek,
      description: 'Standard Roma grade B — ideal for sauces and catering.',
      status: 'ACTIVE',
    },
  });

  await prisma.listing.upsert({
    where: { id: 'seed-listing-003' },
    update: {},
    create: {
      id: 'seed-listing-003',
      cooperativeId: cooperative.id,
      product: 'TOMATO_CHERRY',
      grade: 'A',
      quantityKg: 1200,
      pricePerKgCents: 980,
      availableFrom: nextWeek,
      availableUntil: twoWeeks,
      description: 'Cherry tomatoes — sweet, uniform size. Available from next week.',
      status: 'ACTIVE',
    },
  });

  // ── Buyer profile ─────────────────────────────────────────────────────────
  const buyer = await prisma.buyer.upsert({
    where: { userId: buyerUser.id },
    update: {},
    create: {
      userId: buyerUser.id,
      businessName: 'Rosebank Kitchen',
      vatNumber: '4120123456',
      contactPhone: '+27111000002',
      deliveryAddress: '12 Bath Ave, Rosebank',
      deliveryCity: 'Johannesburg',
      deliveryGpsLat: -26.1452,
      deliveryGpsLng: 28.0436,
      isVerified: true,
    },
  });

  // ── A sample confirmed order ───────────────────────────────────────────────
  const existingOrder = await prisma.order.findFirst({ where: { buyerId: buyer.id } });
  if (!existingOrder) {
    await prisma.order.create({
      data: {
        buyerId: buyer.id,
        status: 'CONFIRMED',
        totalAmountCents: 110_000,
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        notes: 'Please deliver before 7am',
        items: {
          create: [
            {
              listingId: 'seed-listing-001',
              quantityKg: 200,
              pricePerKgCents: 550,
              subtotalCents: 110_000,
            },
          ],
        },
      },
    });
  }

  console.log('');
  console.log('Seed complete. Test credentials:');
  console.log('  Farmer      +27151000001 / farmer123');
  console.log('  Buyer       +27111000002 / buyer123');
  console.log('  Field Agent +27761000003 / agent123');
  console.log('  Ops Admin   +27111000004 / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
