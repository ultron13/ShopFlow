# ShopFlow SA — Street Vendor Marketplace

A production-ready marketplace built for South African street vendors and farmers — from fruit stalls in Thohoyandou to urban gardens in Soweto.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, Server Components) |
| Backend | Node.js + Express + tRPC v11 |
| Database | PostgreSQL 16 (via Prisma ORM) |
| Cache | Redis 7 |
| Auth | NextAuth.js v5 (OAuth + credentials, JWT strategy) |
| Payments | PayFast · Ozow EFT · SnapScan QR · Cash on Delivery · Stripe |
| File Storage | AWS S3 + CloudFront CDN |
| Search | PostgreSQL full-text search (pg_trgm) |
| Email | Resend |
| Maps | Leaflet + react-leaflet (no API key required) |
| Containerization | Docker + Docker Compose |

---

## Features

### SA Street Vendor Storefront
- 32 SA produce products across 5 categories (Fresh Vegetables, Fresh Fruit, Herbs & Spices, Grains & Staples, Cooked & Ready)
- Full-text product search with typo tolerance
- Product image gallery with stock availability
- Persistent cart (localStorage guest → DB on sign-in)
- Prices in ZAR (R) throughout

### Find Vendors
- Browse 22 SA street vendors across all 9 provinces
- Filter by province and category
- Province / search filters via URL params (SSR-rendered)
- Verified badge, permit number, WhatsApp ordering button

### Find Farmers
- Dedicated `/farmers` page for farm-direct produce
- 10 farmers seeded across 7 provinces (Vegetable, Fruit, Organic, Herb & Spice, Urban)
- Category quick-filter pills, WhatsApp-to-order CTA
- Province filter, farm permit and VAT badge display

### Interactive Vendor Map (`/map`)
- Leaflet map centred on South Africa
- Pins for every active vendor and farmer with GPS coordinates
- Popup cards with business name, category, city and WhatsApp link
- "Locate me" button uses browser geolocation
- Layer toggle: All / Vendors only / Farmers only
- Accessible on mobile without an API key

### Seasonal Produce Calendar (`/seasonal`)
- 30 SA produce items with 12-month harvest bars
- Correct SA seasons (not northern hemisphere)
- Includes indigenous produce: amadumbe, morogo, marula, naartjie

### Checkout & Payments
- **PayFast** — SA's leading payment gateway (cards, EFT, Mobicred)
- **SnapScan** — QR code generated at checkout; modal with live QR
- **Ozow** — instant bank EFT (no card needed)
- **Cash on Delivery** — with collection point support
- **Stripe** — international cards (fallback)
- Coupon / discount code support
- Webhook-driven order confirmation

### Stokvel Bulk Buying (`/stokvel`)
- Community savings group creation and management
- Pool orders across group members
- Contribution tracking per member

### Accessibility & Connectivity
- **Data-light mode** — toggle in navbar reduces bandwidth usage
- **Load shedding banner** — stage display with next outage time
- **PWA** — installable, app icons (192×192, 512×512), manifest
- **7 SA languages** — English, isiZulu, Afrikaans, Tshivenda, isiXhosa, Sepedi, Sesotho

### Compliance
- **POPIA consent** banner with Learn More link
- **VAT vendor flag** on vendor/farmer cards
- **Permit number** display for licensed vendors

### Customer Accounts
- Email/password and Google OAuth sign-in
- Order history, address book, wishlist
- Product reviews (one per verified purchase)

### Admin Dashboard (`/admin`)
- Product CRUD with S3 image uploads
- Inventory management, low-stock alerts
- Order management — view, update status, issue refunds
- Revenue and sales analytics

---

## Project Structure

```
shopflow/
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── app/
│   │   │   ├── (store)/              # Public storefront
│   │   │   │   ├── products/         # Product catalog + filters
│   │   │   │   ├── checkout/         # Multi-payment checkout
│   │   │   │   └── cart/
│   │   │   ├── (auth)/               # Sign-in, sign-up
│   │   │   ├── account/              # Customer dashboard
│   │   │   ├── admin/                # Admin panel (protected)
│   │   │   ├── farmers/              # Farm-direct produce page
│   │   │   ├── vendors/              # Street vendor discovery
│   │   │   ├── map/                  # Interactive vendor map (Leaflet)
│   │   │   ├── seasonal/             # SA seasonal produce calendar
│   │   │   ├── stokvel/              # Community savings groups
│   │   │   └── api/auth/             # NextAuth route handler
│   │   ├── components/
│   │   │   ├── layout/               # Navbar, Footer
│   │   │   └── store/                # ProductCard, CartSidebar, etc.
│   │   ├── lib/
│   │   │   ├── utils.ts              # formatPrice (ZAR), slugify, cn
│   │   │   ├── cart-store.ts         # Zustand persistent cart
│   │   │   ├── i18n.tsx              # 7-language provider
│   │   │   └── auth.ts               # NextAuth config
│   │   ├── __tests__/                # Vitest unit tests (67 tests)
│   │   ├── public/                   # PWA icons, manifest
│   │   └── e2e/ → ../../e2e/         # Playwright tests (31 tests)
│   └── api/                          # Express + tRPC server (port 4000)
│       └── src/
│           ├── routers/              # products, vendors, orders, stokvel, …
│           ├── services/             # payfast, ozow, stripe, snapscan, sms
│           └── webhooks/             # PayFast IPN, Ozow, Stripe
├── packages/
│   └── db/                           # Shared Prisma client + migrations
├── scripts/
│   ├── seed-vendors.mjs              # 12 SA street vendors
│   ├── seed-farmers.mjs              # 10 SA farmers across 7 provinces
│   └── seed-products.mjs             # 32 SA produce products
├── e2e/                              # Playwright E2E tests (31)
├── playwright.config.ts
├── turbo.json
└── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- Docker + Docker Compose (for PostgreSQL and Redis)

### 1. Clone and install

```bash
git clone https://github.com/ultron13/ShopFlow.git
cd ShopFlow
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then create `apps/web/.env.local` (Next.js reads from its own directory, not the monorepo root):

```env
AUTH_SECRET="generate-with: openssl rand -base64 32"
DATABASE_URL="postgresql://shopflow:secret@localhost:5433/shopflow"
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_placeholder"
```

### 3. Start infrastructure

```bash
docker compose up -d        # PostgreSQL (5433) + Redis (6379)
```

### 4. Set up the database and seed data

```bash
cd packages/db
npx prisma migrate deploy

cd ../../
node scripts/seed-vendors.mjs    # 12 SA street vendors
node scripts/seed-farmers.mjs    # 10 SA farmers
node scripts/seed-products.mjs   # 32 SA produce products
```

### 5. Start dev servers

```bash
npm run dev        # starts web (3001) + api (4000) via Turborepo
```

Open [http://localhost:3001](http://localhost:3001)

---

## Running Tests

```bash
# Unit tests (Vitest) — 67 tests, 100% line coverage on lib/
cd apps/web
npm run test
npm run test:coverage

# E2E tests (Playwright) — 31 tests across 5 pages
# Requires dev server running on port 3002 (or set BASE_URL)
cd ../..
npx playwright test
npx playwright test --reporter=html    # open HTML report
```

### Coverage summary (unit tests)

| File | Lines | Functions | Branches |
|------|-------|-----------|----------|
| `lib/utils.ts` | 100% | 100% | 100% |
| `lib/cart-store.ts` | 100% | 100% | 93.75% |
| `lib/i18n.tsx` | 100% | 94.73% | 100% |
| **Overall** | **100%** | **97.5%** | **95.45%** |

---

## Roadmap — South African Market

### Payments & Currency
- [x] ZAR (South African Rand) as primary currency with `formatPrice`
- [x] PayFast integration (SA's leading payment gateway)
- [x] SnapScan QR code payments (modal with generated QR at checkout)
- [x] Ozow instant EFT (no card needed)
- [x] Cash on Delivery with collection point support
- [x] Stokvel community savings group bulk-buying

### Connectivity & Accessibility
- [x] Data-light mode (toggle in navbar, reduced bandwidth)
- [x] Load shedding schedule integration (stage banner with next outage)
- [x] PWA install prompt with SA-branded app icons
- [ ] Offline-first mode — service worker caching for browse + cart
- [ ] USSD storefront (`*120*SHOPFLOW#`) for feature phones

### Communication
- [x] WhatsApp order buttons on vendor and farmer cards
- [x] Multi-language: 7 of 11 SA languages (EN, ZU, AF, VE, XH, NSO, ST)
- [ ] Remaining 4 languages (siSwati, Xitsonga, isiNdebele, Setswana)
- [ ] WhatsApp Business API — order updates and vendor chat
- [ ] SMS order notifications (BulkSMS SA)

### Vendor & Market Management
- [x] Vendor marketplace (`/vendors`) — 12 SA street vendors, province + category filter
- [x] Farmer marketplace (`/farmers`) — 10 SA farmers, category pills, WhatsApp CTA
- [x] Interactive vendor + farmer map (`/map`) — Leaflet, locate-me, layer toggle
- [x] Seasonal produce calendar (`/seasonal`) — 30 SA produce items, harvest bars
- [x] Hawker's permit and VAT vendor display on vendor cards
- [ ] Daily price sync from SA municipal fresh produce markets
- [ ] Vendor dashboard optimised for entry-level Android

### Logistics & Delivery
- [ ] Township + informal settlement delivery (GPS pin drop, no street address needed)
- [ ] SA courier integrations: Pudo locker, The Courier Guy, Aramex SA
- [ ] Click-and-collect at community pickup points
- [ ] Real-time order tracking with WhatsApp status updates

### Compliance & Trust
- [x] POPIA consent banner
- [x] SARS VAT vendor flag (15%)
- [x] Customer reviews (one per verified purchase)

### Mobile
- [x] PWA (installable, works offline for static assets)
- [ ] React Native + Expo app (Android-first)

---

## API Overview

All endpoints go through tRPC (port 4000). Key routers:

| Router | Public Procedures | Protected Procedures |
|--------|-------------------|----------------------|
| `products` | `list`, `bySlug` | `create`, `update`, `delete` (admin) |
| `vendors` | `list`, `byId` | `register`, `me` |
| `orders` | `create` (guest + auth) | `list`, `byId`, `updateStatus` |
| `stokvel` | — | `list`, `create`, `join`, `contribute` |
| `reviews` | `list` | `create`, `delete` |
| `loadshedding` | `status` | — |
| `admin` | — | `dashboard`, `lowStock`, `generateCoupon` |

Webhook endpoints (REST):
```
POST /webhooks/stripe
POST /webhooks/payfast
POST /webhooks/ozow
```

---

## Deployment

### Docker (self-hosted)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Vercel + Railway (recommended)

| Service | Platform |
|---|---|
| Next.js frontend | Vercel (deploy `apps/web`) |
| Express API | Railway |
| PostgreSQL | Railway managed Postgres |
| Redis | Railway managed Redis |

Set `NEXT_PUBLIC_API_URL` in Vercel to point to your Railway API URL.

---

## License

MIT
