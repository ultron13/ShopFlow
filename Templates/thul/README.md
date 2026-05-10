# Thul — SA Farmers & Street Vendor Marketplace

A production-ready marketplace connecting South African farmers and street vendors directly with buyers across all nine provinces — no agents, no middlemen.

---

## Vision

From Nomvula's banana farm in Port Shepstone to the Pretorius family vegetable plot in Magaliesburg, **Thul** lets any buyer across South Africa browse, filter, and order directly from verified farmers and informal traders. Every farmer gets their own discoverable profile; every order goes straight to the source.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, Server Components) |
| Backend | Node.js + Express + tRPC |
| Database | PostgreSQL 16 (via Prisma ORM) |
| Cache | Redis 7 |
| Auth | NextAuth.js v5 (OAuth + credentials) |
| Payments | Stripe (Checkout + Webhooks) |
| File Storage | AWS S3 + CloudFront CDN |
| Search | PostgreSQL full-text search + pg_trgm |
| Email | Resend |
| Containerization | Docker + Docker Compose |

---

## What Has Been Built

### Farmers Marketplace — `/farmers` (live)

The dedicated farmers page is a first-class feature:

- Fetches all vendors filtered to farmer categories server-side (ISR, 60 s revalidation)
- Filter by **province** (all 9 SA provinces) and **farmer category**
- Full-text **search** by farm name, city, or produce description
- Farmer cards show: verification badge, category icon, GPS location, contact, VAT status, permit number
- **WhatsApp to Order** button — pre-fills the country code so a buyer anywhere in SA can message the farmer in one tap
- **Register My Farm** CTA routes new farmers to `/vendor/dashboard` for onboarding

### Farmer Categories Supported

| Category | Icon | Description |
|---|---|---|
| Vegetable Farmer | 🥬 | Tomatoes, onions, butternut, cabbage, morogo |
| Fruit Farmer | 🍊 | Citrus, mangoes, bananas, pineapples |
| Organic Farmer | 🌱 | Chemical-free spinach, kale, amadumbe, sweet potato |
| Herb & Spice Farmer | 🌿 | Peri-peri chillies, ginger, garlic, dried herbs |
| Urban Farmer | 🏙️ | Township raised-bed gardens, community co-ops |

### Seeded Farmers (10 across SA)

| Farm | Province | City | Category |
|---|---|---|---|
| Pretorius Family Farm | North West | Magaliesburg | Vegetable Farmer |
| Sithole Organic Vegetables | KwaZulu-Natal | Pietermaritzburg | Organic Farmer |
| Van Wyk Citrus Estate | Western Cape | Citrusdal | Fruit Farmer |
| Nomvula's Banana & Pineapple Farm | KwaZulu-Natal | Port Shepstone | Fruit Farmer |
| Joubert Mango Orchards | Limpopo | Tzaneen | Fruit Farmer |
| Nkosi Community Garden Co-op | Gauteng | Soweto | Urban Farmer |
| Swanepoel Boer Pumpkin Farm | Northern Cape | Upington | Vegetable Farmer |
| Mahlangu Herb & Chilli Farm | Mpumalanga | Nelspruit | Herb & Spice Farmer |
| Bezuidenhout Free Range Farm | Western Cape | Montagu | Vegetable Farmer |
| Zulu Amadumbe & Sweet Potato Co. | KwaZulu-Natal | Greytown | Organic Farmer |

### Street Vendors — `/vendors` (live)

- 12 seeded street vendors across SA
- Filter by province and category
- Vendor detail pages at `/vendor/[id]`
- Interactive map at `/map` (Leaflet — no API key required)

### Storefront & Ordering

- 32 SA street-market products seeded across 5 categories
- Product catalogue at `/products` with category, price, and rating filters
- Full-text product search with typo tolerance (pg_trgm)
- **Ordering from any farmer** — buyers add produce from any farmer's product listing to a shared cart, pay via Stripe Checkout, and receive email + SMS confirmation
- Persistent cart (DB when logged in, localStorage as guest)
- Guest checkout with optional account creation on completion
- Order status tracking: `PENDING → CONFIRMED → SHIPPED → DELIVERED`

### Other Live Pages

| Route | What it does |
|---|---|
| `/seasonal` | SA seasonal produce calendar with accurate local produce data |
| `/map` | Interactive Leaflet map of all vendor/farmer GPS pins |
| `/stokvel` | Community group bulk-buying (create/join stokvels) |
| `/account` | Customer dashboard — order history, wishlist, address book |
| `/admin` | Admin panel — orders, inventory, vendor verification, analytics |
| `/vendor/dashboard` | Farmer / vendor self-onboarding form |

### Authentication

- Email/password and Google OAuth via NextAuth.js v5
- Role-based access: `CUSTOMER`, `ADMIN`
- Product reviews (one per verified purchase)

### Infrastructure

- Redis caching for product listings and sessions
- Rate limiting on auth and checkout endpoints
- Optimistic UI updates with React Query
- Image optimisation via Next.js `<Image>` + CloudFront

---

## Project Structure

```
thul/
├── apps/
│   ├── web/                         # Next.js frontend
│   │   └── app/
│   │       ├── farmers/             # Dedicated farmers page (SSR + filters)
│   │       │   ├── page.tsx
│   │       │   └── farmer-filters.tsx
│   │       ├── vendors/             # Street vendors listing
│   │       │   ├── page.tsx
│   │       │   └── vendor-filters.tsx
│   │       ├── vendor/[id]/         # Individual vendor / farmer profile
│   │       ├── map/                 # Interactive vendor + farmer map
│   │       ├── seasonal/            # SA seasonal produce calendar
│   │       ├── stokvel/             # Community savings group buying
│   │       ├── (store)/             # Public storefront
│   │       │   ├── products/
│   │       │   ├── cart/
│   │       │   └── checkout/
│   │       ├── (auth)/              # Sign-in, sign-up
│   │       ├── account/             # Customer dashboard
│   │       ├── admin/               # Admin panel (protected)
│   │       └── vendor/dashboard/    # Farmer / vendor onboarding
│   └── api/                         # Express + tRPC server
│       └── src/
│           ├── routers/
│           │   ├── vendors.ts       # list, byId, register, me, verify
│           │   ├── products.ts
│           │   ├── orders.ts
│           │   ├── cart.ts
│           │   ├── stokvel.ts
│           │   └── loadshedding.ts
│           ├── services/
│           │   ├── payfast.ts
│           │   ├── ozow.ts
│           │   ├── sms.ts
│           │   └── ...
│           └── webhooks/
├── packages/
│   ├── db/                          # Shared Prisma client + types
│   ├── trpc/                        # Shared tRPC router types
│   └── ui/                          # Shared component library
├── scripts/
│   ├── seed-farmers.mjs             # Seeds 10 farmers across SA provinces
│   ├── seed-vendors.mjs             # Seeds 12 street vendors
│   └── seed-products.mjs            # Seeds 32 SA market products
├── e2e/
│   ├── farmers.spec.ts
│   ├── vendors.spec.ts
│   ├── products.spec.ts
│   └── cart.spec.ts
├── docker-compose.yml
└── .env.example
```

---

## Database Schema (key models)

```prisma
model Vendor {
  id           String   @id @default(cuid())
  userId       String   @unique
  businessName String
  description  String?
  category     String?  // "Vegetable Farmer", "Fruit Farmer", etc.
  province     String?
  city         String?
  address      String?
  phone        String?
  whatsapp     String?
  gpsLat       Float?
  gpsLng       Float?
  permitNumber String?
  vatNumber    String?
  isVerified   Boolean  @default(false)
  isActive     Boolean  @default(true)
  user         User     @relation(fields: [userId], references: [id])
  products     Product[]
  createdAt    DateTime @default(now())
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(CUSTOMER)
  orders    Order[]
  reviews   Review[]
  wishlist  WishlistItem[]
  addresses Address[]
  vendor    Vendor?
  createdAt DateTime @default(now())
}

model Order {
  id              String      @id @default(cuid())
  userId          String?
  status          OrderStatus @default(PENDING)
  stripeSessionId String      @unique
  items           OrderItem[]
  total           Decimal     @db.Money
  shippingAddress Json
  couponId        String?
  createdAt       DateTime    @default(now())
}

enum Role        { CUSTOMER ADMIN }
enum OrderStatus { PENDING CONFIRMED SHIPPED DELIVERED CANCELLED REFUNDED }
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- Docker + Docker Compose
- Stripe account
- Resend account
- AWS account (S3 bucket + CloudFront distribution)

### 1. Clone and install

```bash
git clone https://github.com/your-org/thul.git
cd thul
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Key variables:

```env
DATABASE_URL="postgresql://thul:secret@localhost:5432/thul"
REDIS_URL="redis://localhost:6379"

NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="af-south-1"
S3_BUCKET_NAME="thul-assets"
CLOUDFRONT_URL="https://cdn.yourdomain.com"

RESEND_API_KEY="re_..."
EMAIL_FROM="orders@yourdomain.com"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
API_URL="http://localhost:4000"
```

### 3. Start infrastructure

```bash
docker compose up -d
```

### 4. Run migrations

```bash
cd apps/api && npx prisma migrate dev
```

### 5. Seed data

```bash
# From repo root
node scripts/seed-farmers.mjs   # 10 farmers across SA
node scripts/seed-vendors.mjs   # 12 street vendors
node scripts/seed-products.mjs  # 32 SA market products
```

### 6. Start dev servers

```bash
npm run dev
```

| URL | Page |
|---|---|
| http://localhost:3000 | Home |
| http://localhost:3000/farmers | Farmers marketplace |
| http://localhost:3000/vendors | Street vendors |
| http://localhost:3000/map | Interactive map |
| http://localhost:3000/seasonal | Seasonal produce |
| http://localhost:3000/admin | Admin panel (`admin@thul.dev` / `admin1234`) |

---

## Stripe Webhook (local testing)

```bash
stripe listen --forward-to http://localhost:4000/webhooks/stripe
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

---

## Running Tests

```bash
npm run test          # unit tests (Vitest)
npm run test:e2e      # Playwright e2e — includes farmers.spec.ts
npm run test:coverage
```

---

## API Overview

All endpoints go through tRPC:

| Router | Procedures |
|---|---|
| `vendors` | `list`, `byId`, `register`, `me`, `verify` |
| `products` | `list`, `bySlug`, `search`, `create`, `update`, `delete` |
| `cart` | `get`, `addItem`, `updateItem`, `removeItem`, `clear` |
| `orders` | `create`, `list`, `byId`, `updateStatus`, `refund` |
| `reviews` | `list`, `create`, `delete` |
| `stokvel` | community bulk-buy group management |
| `loadshedding` | load shedding schedule integration |
| `admin` | `dashboard`, `lowStockAlerts`, `generateCoupon` |

The `vendors.list` procedure accepts `province` and `category` filters. The farmers page uses these to scope results to farmer categories only (`Vegetable Farmer`, `Fruit Farmer`, `Organic Farmer`, `Herb & Spice Farmer`, `Urban Farmer`).

REST endpoint (Stripe webhook):

```
POST /webhooks/stripe
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
| Next.js frontend | Vercel |
| Express API | Railway |
| PostgreSQL | Railway (managed Postgres) |
| Redis | Railway (managed Redis) |

1. Push to GitHub.
2. Import `apps/web` into Vercel; set all `NEXT_PUBLIC_*` env vars.
3. Import `apps/api` into Railway; add a Postgres and Redis plugin.
4. Set `API_URL` in Vercel to your Railway API URL.
5. Add the production Stripe webhook endpoint in the Stripe dashboard.

---

## Roadmap

### Farmer Experience (next priority)
- [ ] Individual farmer profile pages (`/farmers/[id]`) — full produce listing, reviews, and order CTA
- [ ] In-app ordering directly from farmer profiles — cart integration without WhatsApp redirect
- [ ] Farmer dashboard — manage produce listings, view and fulfil orders, update availability and stock
- [ ] Seasonal availability toggle — auto-hide out-of-season produce per farmer
- [ ] Farmer-to-buyer direct messaging (WhatsApp Business API)
- [ ] Farm GPS pin with directions link on each farmer card

### Ordering & Payments
- [ ] ZAR (South African Rand) as primary display currency
- [ ] PayFast integration (SA's leading payment gateway)
- [ ] SnapScan QR code payments
- [ ] Ozow instant EFT (no card needed)
- [ ] Cash on Delivery with community collection points
- [ ] Stokvel group bulk-buy ordering pools

### Connectivity & Accessibility
- [ ] Offline-first mode — browse and add to cart without data; sync on reconnect
- [ ] Data-light mode — compressed images and minimal JS for low-end Android devices
- [ ] USSD storefront (`*120*THUL#`) for feature phones without internet
- [ ] Load shedding schedule integration — notify farmers and buyers of blackout windows
- [ ] SMS order confirmations via BulkSMS SA

### Communication
- [ ] WhatsApp Business API — order updates and catalogue sharing
- [ ] Multi-language support for all 11 official SA languages
- [ ] Voice prompts in local languages for low-literacy users

### Logistics
- [ ] GPS pin-drop addressing for townships and informal settlements
- [ ] SA courier integrations: Pudo, The Courier Guy, Aramex SA, Fastway SA
- [ ] Click-and-collect at community pickup points (schools, spaza shops)
- [ ] Real-time tracking with WhatsApp status updates

### Compliance
- [ ] POPIA compliance — consent management, data subject rights, breach notifications
- [ ] SARS VAT registration flag (15% VAT) per farmer
- [ ] Farmer verification document upload (permit, ID)

### Mobile
- [ ] React Native + Expo — Android-first for entry-level smartphones
- [ ] PWA install prompt for low-end devices

---

## License

MIT
