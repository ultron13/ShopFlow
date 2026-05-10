# ShopFlow — Full-Stack Ecommerce Platform

A production-ready ecommerce application built with Next.js, Node.js, and PostgreSQL.

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

## Features

### Storefront
- Product catalog with category, price, and rating filters
- Full-text product search with typo tolerance (pg_trgm)
- Product image gallery with zoom
- Stock availability display
- Related products carousel
- Persistent cart (synced to DB when logged in, localStorage as guest)
- Guest checkout with optional account creation on completion

### Customer Accounts
- Email/password and Google OAuth sign-in
- Order history with status tracking
- Address book management
- Wishlist / saved items
- Product reviews and star ratings (one per verified purchase)

### Checkout & Payments
- Stripe Checkout integration (cards, Apple Pay, Google Pay)
- Webhook-driven order confirmation (idempotent processing)
- Automatic tax calculation via Stripe Tax
- Coupon and discount code support
- Order confirmation emails via Resend

### Admin Dashboard (`/admin`)
- Product CRUD with image uploads to S3
- Inventory management and low-stock alerts
- Order management (view, update status, issue refunds)
- Customer list and detail view
- Revenue and sales analytics charts
- Discount code generator

### Infrastructure
- Redis caching for product listings and sessions
- Rate limiting on auth and checkout endpoints
- Optimistic UI updates with React Query
- Image optimization via Next.js `<Image>` + CloudFront
- Row-level security policies on the DB

---

## Project Structure

```
shopflow/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── (store)/        # Public storefront routes
│   │   │   ├── (auth)/         # Sign-in, sign-up
│   │   │   ├── account/        # Customer dashboard
│   │   │   ├── admin/          # Admin panel (protected)
│   │   │   └── api/            # Next.js route handlers
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   └── api/                    # Express + tRPC server
│       ├── src/
│       │   ├── routers/        # tRPC routers (products, orders, users)
│       │   ├── middleware/     # Auth, rate-limit, logging
│       │   ├── services/       # Business logic
│       │   ├── jobs/           # Background jobs (order processing, emails)
│       │   └── webhooks/       # Stripe webhook handlers
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
├── packages/
│   ├── db/                     # Shared Prisma client + types
│   ├── trpc/                   # Shared tRPC router types
│   └── ui/                     # Shared component library
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## Database Schema (key models)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(CUSTOMER)
  orders    Order[]
  reviews   Review[]
  wishlist  WishlistItem[]
  addresses Address[]
  createdAt DateTime @default(now())
}

model Product {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  price       Decimal  @db.Money
  stock       Int      @default(0)
  images      String[]
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  variants    Variant[]
  reviews     Review[]
  searchVector Unsupported("tsvector")?

  @@index([searchVector], type: Gin)
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

model Review {
  id        String   @id @default(cuid())
  userId    String
  productId String
  rating    Int      // 1–5
  body      String?
  verified  Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])

  @@unique([userId, productId])
}

enum Role        { CUSTOMER ADMIN }
enum OrderStatus { PENDING CONFIRMED SHIPPED DELIVERED CANCELLED REFUNDED }
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- Docker + Docker Compose
- AWS account (S3 bucket + CloudFront distribution)
- Stripe account
- Resend account

### 1. Clone and install

```bash
git clone https://github.com/your-org/shopflow.git
cd shopflow
npm install        # installs all workspace packages
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Database
DATABASE_URL="postgresql://shopflow:secret@localhost:5432/shopflow"
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
S3_BUCKET_NAME="shopflow-assets"
CLOUDFRONT_URL="https://cdn.yourdomain.com"

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="orders@yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
API_URL="http://localhost:4000"
```

### 3. Start infrastructure

```bash
docker compose up -d      # starts PostgreSQL and Redis
```

### 4. Set up the database

```bash
cd apps/api
npx prisma migrate dev    # runs migrations and seeds demo data
```

### 5. Start dev servers

```bash
# From repo root — starts both Next.js (3000) and Express (4000) in parallel
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin) (seeded admin: `admin@shopflow.dev` / `admin1234`).

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
npm run test:e2e      # end-to-end tests (Playwright)
npm run test:coverage
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
2. Import the `apps/web` directory into Vercel; set all `NEXT_PUBLIC_*` env vars.
3. Import the `apps/api` directory into Railway; add a Postgres and Redis plugin.
4. Set `API_URL` in Vercel to point to your Railway API service URL.
5. Add the production Stripe webhook endpoint in the Stripe dashboard.

---

## API Overview

All endpoints go through tRPC. Key routers:

| Router | Procedures |
|---|---|
| `products` | `list`, `bySlug`, `search`, `create`, `update`, `delete` |
| `cart` | `get`, `addItem`, `updateItem`, `removeItem`, `clear` |
| `orders` | `create`, `list`, `byId`, `updateStatus`, `refund` |
| `reviews` | `list`, `create`, `delete` |
| `auth` | handled by NextAuth route handler |
| `admin` | `dashboard`, `lowStockAlerts`, `generateCoupon` |

REST endpoint (for Stripe):

```
POST /webhooks/stripe
```

---

## Roadmap — South African Street Vendor Market

Built with informal traders in mind — from the fruit stalls of Thohoyandou in Limpopo to the bustling markets of Soweto, Khayelitsha, and Durban's Victoria Street Market.

### Payments & Currency
- [ ] ZAR (South African Rand) as primary currency with multi-currency display
- [ ] PayFast integration (South Africa's leading payment gateway)
- [ ] SnapScan QR code payments (widely adopted at informal markets)
- [ ] Ozow instant EFT (no card needed — bank account only)
- [ ] Cash on Delivery with collection point support
- [ ] Stokvel (community savings group) bulk-buying pools

### Connectivity & Accessibility
- [ ] Offline-first mode — browse and cart items without data; sync when connected
- [ ] Data-light mode — compressed images, minimal JS bundle for low-end Android devices
- [ ] USSD storefront (`*120*SHOPFLOW#`) for feature phones with no internet access
- [ ] Load shedding schedule integration — notify vendors and customers of blackout windows
- [ ] SMS order notifications and confirmations (Twilio / BulkSMS SA)

### Communication
- [ ] WhatsApp Business API — order updates, vendor chat, and catalogue sharing
- [ ] Multi-language support for all 11 official SA languages (isiZulu, isiXhosa, Tshivenda, Sepedi/Northern Sotho, Sesotho, Setswana, siSwati, Xitsonga, isiNdebele, Afrikaans, English)
- [ ] Voice assistant prompts in local languages for low-literacy users

### Vendor & Market Management
- [ ] Multi-vendor marketplace — individual stall owners each manage their own inventory and orders
- [ ] Geolocation-based vendor discovery — find nearby fruit and veg stalls on an interactive map
- [ ] Hawker's licence and vendor permit verification and display
- [ ] Seasonal produce calendar with local pricing benchmarks (e.g. mangoes in season in Limpopo, butternut in the Cape)
- [ ] Daily/weekly price updates synced from local municipal market rates (e.g. Johannesburg Fresh Produce Market)
- [ ] Vendor dashboard optimised for Android (dominant device platform in SA townships)

### Logistics & Delivery
- [ ] Township and informal settlement delivery — flexible address input for areas without formal street addresses (GPS pin drop)
- [ ] Integration with SA-local couriers: Pudo locker network, The Courier Guy, Aramex SA, Fastway SA
- [ ] Click-and-collect at designated community pickup points (schools, churches, spaza shops)
- [ ] Real-time order tracking with WhatsApp status updates

### Compliance & Trust
- [ ] POPIA (Protection of Personal Information Act) compliance — consent management, data subject rights, and breach notifications
- [ ] SARS VAT registration flag for vendors who are VAT vendors (15% VAT)
- [ ] Customer rating and review system for vendor accountability

### Mobile
- [ ] React Native + Expo mobile app — Android-first, optimised for entry-level smartphones
- [ ] PWA (Progressive Web App) install prompt for customers on low-end devices

---

## License

MIT
