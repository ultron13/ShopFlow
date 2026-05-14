# FarmConnect SA — Implementation Plan

**Version:** 1.0  
**Last Updated:** May 2026

---

## Overview

Implementation is structured in four phases tied directly to business milestones. The rule: **prove before building more**. Phase 1 must show working corridor operations before Phase 2 adds features or corridors.

---

## Phase 0 — Foundation (Weeks 1-2)

**Goal:** Working development environment, deployed staging, core data models in the database.

### Tasks

#### Infrastructure
- [ ] Provision Fly.io apps: `farmconnect-api-staging`, `farmconnect-api-prod`
- [ ] Provision managed PostgreSQL (Fly Postgres or Supabase)
- [ ] Provision Redis (Upstash for BullMQ)
- [ ] Configure Cloudflare R2 bucket for photo storage
- [ ] Set up Sentry project (API + Web)
- [ ] Configure GitHub Actions CI pipeline (lint → test → deploy to staging on merge to main)
- [ ] Set `.env.example` with all required variables documented

#### Backend
- [ ] Initialise Express.js + TypeScript monorepo structure
- [ ] Configure Prisma with initial schema (all MVP entities)
- [ ] Run first migration and seed with test data
- [ ] Set up BullMQ worker process
- [ ] Health check endpoint: `GET /health`
- [ ] Structured JSON logging (pino)
- [ ] Error handling middleware with Sentry integration

#### Frontend
- [ ] Initialise React + Vite + TailwindCSS project
- [ ] Set up React Router for page routing
- [ ] Configure API client (`lib/api.ts` with Axios)
- [ ] Deploy to Fly.io or Cloudflare Pages (staging)

#### Auth
- [ ] JWT-based authentication (access token + refresh token)
- [ ] Registration + login endpoints
- [ ] Role-based middleware (FARMER, BUYER, FIELD_AGENT, OPS_ADMIN, PLATFORM_ADMIN)
- [ ] POPIA consent captured and recorded on registration

### Definition of Done
- Staging environment is live and accessible
- All data models exist in the database with correct relationships
- Health check returns 200
- A test user can register and receive a JWT

---

## Phase 1 — Corridor MVP (Weeks 3-8)

**Goal:** End-to-end flow works for at least one cooperative, one restaurant, one field agent, and one ops admin. Manual processes are acceptable where software is incomplete.

### Backend Tasks

#### Cooperative & Listing
- [ ] `POST /api/cooperatives` — register cooperative
- [ ] `POST /api/listings` — create produce listing
- [ ] `GET /api/listings` — list available produce (with filters: product, date, grade)
- [ ] `PATCH /api/listings/:id` — update quantity or price

#### Orders
- [ ] `POST /api/orders` — buyer places order
- [ ] `GET /api/orders` — list orders (buyer: own orders; admin: all)
- [ ] `GET /api/orders/:id` — order detail
- [ ] `PATCH /api/orders/:id/status` — admin updates order status

#### Collections & Grading
- [ ] `POST /api/collections` — create collection (linked to order)
- [ ] `POST /api/collections/:id/grade` — field agent submits grade record
- [ ] `POST /api/collections/:id/photos` — field agent uploads photos to R2
- [ ] `PATCH /api/collections/:id/confirm` — field agent confirms collection

#### Deliveries
- [ ] `POST /api/deliveries` — ops creates delivery run
- [ ] `POST /api/deliveries/:id/stops` — add delivery stop (order)
- [ ] `PATCH /api/deliveries/:id/dispatch` — mark dispatched
- [ ] `PATCH /api/deliveries/:id/stops/:stopId/deliver` — confirm stop delivered

#### Payments
- [ ] Ozow webhook handler — receive payment confirmation from buyer
- [ ] Stitch payout trigger — initiate farmer payout after delivery confirmed
- [ ] Payment record creation and status tracking
- [ ] BullMQ job: `process-payout` (runs after delivery confirmed, 48hr SLA)

#### Notifications
- [ ] Clickatell WhatsApp template: order confirmation (buyer)
- [ ] Clickatell WhatsApp template: collection scheduled (farmer)
- [ ] Clickatell WhatsApp template: delivery dispatched (buyer)
- [ ] Clickatell WhatsApp template: payment sent (farmer)

#### Invoicing
- [ ] Auto-generate PDF invoice on order delivery confirmation
- [ ] Store invoice PDF in R2, attach to order record
- [ ] Email invoice to buyer via SendGrid

#### Disputes
- [ ] `POST /api/disputes` — buyer raises dispute with photos
- [ ] `PATCH /api/disputes/:id/resolve` — admin resolves with refund or credit

### Frontend Tasks

#### Buyer Web App
- [ ] Login / registration page
- [ ] Listings browse page (product cards with price, grade, delivery date)
- [ ] Order placement flow (select quantity → confirm → payment redirect)
- [ ] Order history page with status tracking
- [ ] Dispute submission form

#### Field Agent Mobile Web
- [ ] Login page (mobile-optimised)
- [ ] Collection list (pending collections assigned to this agent)
- [ ] Grading form (inputs: weight, grade A/B/C, blemish %, notes)
- [ ] Photo upload (camera integration, multi-photo)
- [ ] Offline service worker: queue form submissions; sync on reconnect

#### Ops Admin Dashboard
- [ ] Orders overview table (all orders, filter by status)
- [ ] Delivery route builder (drag collections onto delivery runs)
- [ ] Dispatch button with confirmation
- [ ] Payment queue (deliveries confirmed, awaiting payout)
- [ ] Dispute queue

### Definition of Done
- One cooperative listed tomatoes
- One restaurant placed and paid for an order
- Field agent graded the collection with photos
- Delivery was dispatched and confirmed
- Farmer was paid within 48 hours
- Invoice was generated and emailed

---

## Phase 2 — Commercial Launch (Months 2-4)

**Goal:** 25-30 restaurants ordering weekly. 54,400 kg/month. Corridor breakeven.

### Tasks

#### Growth Features
- [ ] Standing order configuration (buyer sets recurring weekly order)
- [ ] Buyer referral tracking (chef-to-chef referral incentive)
- [ ] Price comparison widget (our price vs. market price — use NAMC data feed)
- [ ] Demand forecast view for farmers (aggregate buyer standing orders)

#### Operations
- [ ] Route optimisation — group stops by geography (manual + Mapbox-assisted)
- [ ] Cold chain verification — temperature log linked to delivery
- [ ] SMS fallback for farmers without WhatsApp

#### Reporting
- [ ] Weekly GMV report (auto-emailed to ops team)
- [ ] Farmer payment reconciliation report
- [ ] Buyer order history export (CSV)
- [ ] Unit economics dashboard (contribution margin per kg, per route)

#### Compliance
- [ ] B-BBEE supplier certificate generation for each cooperative
- [ ] POPIA privacy portal (data subject requests)
- [ ] VAT return-ready transaction export

### Definition of Done
- 30+ active restaurants with at least one completed order each
- 5+ cooperatives actively supplying
- Contribution margin per kg > R1.00 consistently
- Zero payment SLA breaches (all farmers paid within 48 hours)

---

## Phase 3 — B2B Scale & B2G Preparation (Months 4-12)

**Goal:** 100+ restaurants, 10+ cooperatives, Mpumalanga corridor open, B2G pilot contract signed.

### B2B Scale
- [ ] Mpumalanga corridor infrastructure (field agent hire, cold room partnerships)
- [ ] Product range expansion (avocados, peppers, citrus)
- [ ] Cooperative mobile app (PWA for farmer-facing features)
- [ ] API integrations with restaurant POS systems (Lightspeed, Pilot POS)

### B2G Preparation
- [ ] Government buyer onboarding flow (procurement officer registration)
- [ ] Audit trail module (immutable, exportable log of all transactions)
- [ ] Public tender response capabilities (price schedule, delivery SLA commitments)
- [ ] B-BBEE scorecard report (automated from existing supplier data)
- [ ] School nutrition programme pilot: 1 municipality, 10 schools

### Technical Hardening
- [ ] Load testing: simulate 500 concurrent users
- [ ] Database indexing review and query optimisation
- [ ] Redis caching layer for listing catalogue
- [ ] Automated database backups with tested restore process
- [ ] Penetration test (external, scoped to API)
- [ ] POPIA audit (external DPO review)

### Definition of Done
- Series A trigger metrics met (see BUSINESS_PLAN.md Section 15)
- B2G pilot contract signed and at least one delivery completed
- Platform handles 10x current load without degradation

---

## Team Responsibilities by Phase

| Phase | Dev | Ops Admin | Field Agent | Sales |
|-------|-----|-----------|-------------|-------|
| Phase 0 | Backend + infra setup | — | — | — |
| Phase 1 | Core API + frontend | Build routes manually | Onboard + test | — |
| Phase 2 | Growth features + standing orders | Run corridor daily | Limpopo operations | Restaurant acquisition |
| Phase 3 | Scale features + B2G | Add Mpumalanga | Second agent hired | B2G pipeline |

---

## Technology Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Monolith | Complexity overhead of microservices is unjustified at this stage |
| Deployment | Fly.io | Low ops overhead; existing fly.toml; global anycast |
| Payments | Ozow + Stitch | SA-native instant EFT; no holding of client funds |
| Messaging | Clickatell | WhatsApp Business API + SMS in single SDK; SA-focused |
| Photo storage | Cloudflare R2 | No egress fees; S3-compatible API |
| Job queue | BullMQ + Redis | Reliable, well-documented; recovers from crashes |
| ORM | Prisma | Type-safe; migration tooling; matches existing stack |
| Frontend | React + Vite + Tailwind | Fast iteration; existing stack match; no SSR needed at launch |

---

## Risk Mitigations in Implementation

| Risk | Mitigation |
|------|-----------|
| Connectivity failures (field agents) | Offline-first service worker with action queue |
| Payment PSP downtime | Ozow as primary, Stitch as fallback; manual payout if both fail |
| R2 upload failures | Client-side retry with exponential backoff; max 3 attempts |
| Database corruption | Daily automated snapshots; tested restore procedure |
| Clickatell rate limits | BullMQ queue with configurable concurrency; SMS fallback |
| Logistics no-show | Ops admin phone escalation protocol; backup transporter list |
