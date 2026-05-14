# FarmConnect SA — System Architecture

**Version:** 1.0  
**Last Updated:** May 2026

---

## 1. Guiding Principles

1. **Monolith until proven otherwise** — no microservices until a single service is genuinely bottlenecked
2. **WhatsApp-first** — every critical farmer and buyer notification must work via WhatsApp/SMS
3. **Offline-capable** — field agent flows must function without connectivity
4. **Manual before automated** — build software only where volume demands it
5. **No money holding** — all payment flows pass through licensed PSPs; FarmConnect retains commission via settlement instruction

---

## 2. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│                                                                  │
│  [Buyer Web App]  [Field Agent Mobile]  [Admin Dashboard]       │
│  React/Vite SPA   React/Vite PWA        React/Vite SPA          │
│                                                                  │
│  [WhatsApp/SMS]  ←── Farmer & buyer notifications               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / TLS 1.3
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FARMCONNECT API                              │
│              Express.js / TypeScript (Fly.io)                    │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Routes  │  │Middleware│  │ Services │  │ BullMQ Jobs  │   │
│  │ /auth    │  │ JWT Auth │  │ Listings │  │ process-pay  │   │
│  │ /listings│  │ Role ACL │  │ Orders   │  │ send-notif   │   │
│  │ /orders  │  │ Error    │  │ Payments │  │ gen-invoice  │   │
│  │ /deliver │  │ Handler  │  │ Logistics│  │ sync-photos  │   │
│  │ /payments│  │ Rate Lim │  │ Notif    │  └──────────────┘   │
│  └──────────┘  └──────────┘  └──────────┘                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
          ┌────────────┴─────────────┐
          │                          │
          ▼                          ▼
┌─────────────────┐      ┌──────────────────────┐
│   PostgreSQL    │      │        Redis           │
│   (Fly Postgres │      │   (Upstash — BullMQ   │
│    or Supabase) │      │    job queues +        │
│                 │      │    session cache)       │
│  Prisma ORM     │      └──────────────────────┘
└─────────────────┘

External Services:
  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌─────────┐
  │  Ozow    │  │  Stitch  │  │  Clickatell  │  │Cloudflare│
  │ (EFT     │  │ (Account │  │  (WhatsApp   │  │   R2     │
  │  payment)│  │  payout) │  │   / SMS)     │  │ (Photos) │
  └──────────┘  └──────────┘  └──────────────┘  └─────────┘
  ┌──────────┐  ┌──────────┐
  │ SendGrid │  │  Sentry  │
  │ (Email)  │  │ (Errors) │
  └──────────┘  └──────────┘
```

---

## 3. Backend Architecture

### 3.1 Application Structure

```
apps/api/
├── src/
│   ├── server.ts              # Express app bootstrap
│   ├── routes/
│   │   ├── index.ts           # Route registration
│   │   ├── auth.ts
│   │   ├── cooperatives.ts
│   │   ├── listings.ts
│   │   ├── orders.ts
│   │   ├── collections.ts
│   │   ├── deliveries.ts
│   │   ├── payments.ts
│   │   ├── disputes.ts
│   │   └── admin.ts
│   ├── controllers/           # Route handlers (thin — delegate to services)
│   ├── services/              # Business logic
│   │   ├── listing.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   ├── logistics.service.ts
│   │   ├── notification.service.ts
│   │   └── invoice.service.ts
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification + role check
│   │   ├── errorHandler.ts    # Global error handler
│   │   └── rateLimit.ts
│   ├── jobs/                  # BullMQ job definitions
│   │   ├── processPayment.job.ts
│   │   ├── sendNotification.job.ts
│   │   └── generateInvoice.job.ts
│   ├── types/
│   │   └── index.ts           # Shared TypeScript types
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton
│       ├── redis.ts           # Redis client
│       ├── r2.ts              # Cloudflare R2 client
│       ├── clickatell.ts      # WhatsApp/SMS client
│       └── logger.ts          # Pino logger
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── package.json
```

### 3.2 Request Lifecycle

```
HTTP Request
    │
    ▼
Rate Limiter (express-rate-limit)
    │
    ▼
Auth Middleware (verify JWT, attach user to req)
    │
    ▼
Role Guard (check user.role against route requirement)
    │
    ▼
Route Handler / Controller (validates input with Zod)
    │
    ▼
Service Layer (business logic, DB via Prisma)
    │
    ├──→ Database (PostgreSQL via Prisma)
    ├──→ BullMQ (enqueue async jobs)
    └──→ Response (JSON)
```

### 3.3 Job Queue Architecture

All async operations (payments, notifications, invoice generation) go through BullMQ:

```
Trigger (e.g., delivery confirmed)
    │
    ▼
BullMQ Producer (in service layer)
    │
    ▼
Redis Queue
    │
    ▼
BullMQ Worker (separate process)
    │
    ├── process-payout → Stitch API → Payment record updated
    ├── send-notification → Clickatell API → Notification logged
    └── generate-invoice → PDF generation → R2 upload → SendGrid
```

Workers run as a separate Fly.io machine (`farmconnect-worker`), allowing independent scaling.

---

## 4. Frontend Architecture

### 4.1 Application Structure

```
apps/web/
├── src/
│   ├── main.tsx
│   ├── App.tsx               # Router setup
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── buyer/
│   │   │   ├── Listings.tsx  # Browse produce
│   │   │   ├── OrderFlow.tsx # Place order
│   │   │   ├── Orders.tsx    # Order history
│   │   │   └── Dispute.tsx
│   │   ├── field-agent/
│   │   │   ├── Collections.tsx
│   │   │   └── GradingForm.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── Routes.tsx
│   │       ├── Payments.tsx
│   │       └── Disputes.tsx
│   ├── components/
│   │   ├── ui/               # Reusable UI primitives
│   │   ├── Navbar.tsx
│   │   ├── ProduceCard.tsx
│   │   ├── OrderStatusBadge.tsx
│   │   └── PhotoUploader.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useOfflineQueue.ts # Service worker integration
│   │   └── useApi.ts
│   ├── lib/
│   │   ├── api.ts            # Axios instance with interceptors
│   │   └── auth.ts           # Token storage and refresh
│   └── service-worker.ts     # Offline queue for field agents
└── package.json
```

### 4.2 Offline Strategy (Field Agents)

The field agent interface uses a service worker to queue form submissions when offline:

```
Field Agent Action (grade, photo, confirm)
    │
    ▼
useOfflineQueue hook
    │
    ├── Online → POST to API immediately
    └── Offline → Serialize to IndexedDB queue
                       │
                       ▼ (on connectivity restored)
                  Service Worker
                       │
                       ▼
                  Replay queued requests in order
                       │
                       ▼
                  Update UI with server response
```

---

## 5. Database Design

### 5.1 Core Entity Relationships

```
User ──< Role
  │
  ├── Cooperative ──< Farm
  │       └──< Listing ──< OrderItem >── Order ──< DeliveryStop >── Delivery
  │               └──< Collection ──< GradeRecord
  │                           └──< Photo
  │
  ├── Buyer (Restaurant) ──< Order ──< Payment
  │                               └──< Invoice
  │                               └──< Dispute ──< Photo
  │
  └── FieldAgent ──< Collection (assigned)
```

### 5.2 Key Indexes

- `listings`: `(product, available_from, status)` — for browse/filter queries
- `orders`: `(buyer_id, status, created_at)` — for buyer order history
- `deliveries`: `(status, scheduled_date)` — for ops dispatch view
- `payments`: `(status, due_at)` — for payment SLA monitoring
- `audit_logs`: `(entity_type, entity_id, created_at)` — for compliance queries

---

## 6. Authentication & Authorisation

- **JWT** with 15-minute access token + 7-day refresh token
- Refresh tokens stored in Redis (invalidatable on logout/breach)
- Role-based access control enforced at middleware level:

| Role | Access |
|------|--------|
| `FARMER` | Own cooperative, own listings, own payments |
| `BUYER` | Listings (read), own orders, own disputes |
| `FIELD_AGENT` | Assigned collections, grading, photo upload |
| `OPS_ADMIN` | All orders, deliveries, payment queue, disputes |
| `PLATFORM_ADMIN` | Full access including user management |

---

## 7. Infrastructure

### 7.1 Fly.io Setup

```
fly.toml (API):
  app = farmconnect-api
  primary_region = jnb          # Johannesburg
  [http_service]
    internal_port = 3000
    min_machines_running = 1
  [env]
    NODE_ENV = production

fly.toml (Worker):
  app = farmconnect-worker
  [processes]
    worker = "node dist/worker.js"
```

### 7.2 Environment Variables

See `.env.example` for the full list. Critical variables:

```
DATABASE_URL          # PostgreSQL connection string
REDIS_URL             # Upstash Redis URL
CLOUDFLARE_R2_*       # R2 bucket credentials
OZOW_*                # Ozow API keys
STITCH_*              # Stitch API keys
CLICKATELL_API_KEY    # WhatsApp Business API
SENDGRID_API_KEY
SENTRY_DSN
JWT_SECRET
JWT_REFRESH_SECRET
```

### 7.3 CI/CD Pipeline

```
Push to main branch
    │
    ▼
GitHub Actions
    ├── npm ci
    ├── tsc --noEmit (type check)
    ├── eslint
    ├── vitest (unit tests)
    ├── prisma migrate deploy (staging)
    └── flyctl deploy (staging)

Manual trigger / tag:
    └── flyctl deploy (production)
```

---

## 8. Scalability Path

The monolith is designed to be split if needed. Natural boundaries for future extraction:

| Service | Trigger to extract |
|---------|--------------------|
| Notification Worker | When notification volume exceeds 10K/day |
| Payment Processing | When regulatory complexity demands isolation |
| Logistics Engine | When route optimisation becomes computationally heavy |
| Farmer Portal | When farmer feature set diverges significantly from core |

Database read replicas should be added before service extraction — most early scaling issues are database-level.

---

## 9. Security Checklist

- [ ] TLS 1.3 enforced (Fly.io handles this at the edge)
- [ ] All PII fields encrypted at rest (PostgreSQL column encryption)
- [ ] JWT secrets rotated quarterly
- [ ] Refresh token invalidation on suspicious activity
- [ ] Rate limiting: 100 req/min per IP (unauthenticated), 500/min (authenticated)
- [ ] SQL injection: prevented by Prisma (parameterised queries)
- [ ] XSS: prevented by React's default escaping; CSP headers on API
- [ ] File uploads: type validation + size limit (10MB per photo); stored in R2 (not served from API)
- [ ] Webhook signatures verified for Ozow and Stitch callbacks
- [ ] POPIA: all PII access logged in `audit_logs`
- [ ] Annual external penetration test scheduled (Month 12)
