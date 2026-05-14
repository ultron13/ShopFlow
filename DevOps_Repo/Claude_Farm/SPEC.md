# FarmConnect SA — Product Specification

**Version:** 1.0  
**Status:** Draft — Pre-Seed  
**Last Updated:** May 2026

---

## 1. Overview

FarmConnect SA is a logistics-enabled B2B agricultural marketplace connecting Limpopo tomato farmers and cooperatives directly to Gauteng restaurants. The platform handles end-to-end trade: produce listings, order management, quality grading, route-optimised logistics coordination, and 48-hour farmer payments.

**Primary corridor at launch:** Limpopo (supply) → Gauteng (demand), tomatoes only.

---

## 2. User Roles

| Role | Description | Primary Interface |
|------|-------------|------------------|
| **Farmer / Cooperative** | Lists produce, confirms collections, receives payments | WhatsApp + basic web |
| **Buyer (Restaurant)** | Browses listings, places weekly standing orders, tracks delivery | Web app + WhatsApp |
| **Field Agent** | Grades produce at collection point, photographs, confirms loads | Mobile web (offline-capable) |
| **Operations Admin** | Manages routes, dispatches loads, resolves disputes, monitors payments | Web admin dashboard |
| **Platform Admin** | User management, system configuration, financial reconciliation | Web admin dashboard |

---

## 3. MVP Feature Set (Corridor Launch — Months 1-3)

### 3.1 Farmer / Cooperative Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Cooperative onboarding | Register coop with CIPC number, bank details, contact info | P0 |
| Produce listing | Post available volume, grade, and price for tomatoes | P0 |
| Collection scheduling | Accept/decline pickup slot proposed by operations | P0 |
| Payment tracking | View payment status and history | P0 |
| WhatsApp notifications | SMS/WhatsApp alerts for order confirmations and payment | P0 |
| Demand visibility | See what buyers need before harvest | P1 |

### 3.2 Buyer (Restaurant) Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Buyer onboarding | Register restaurant, VAT number, delivery address, bank/card | P0 |
| Browse listings | View available produce with price, grade, and delivery date | P0 |
| Place order | One-time or standing weekly order | P0 |
| Delivery tracking | Real-time status updates (dispatched, en route, delivered) | P0 |
| Invoice & compliance docs | Auto-generated PDF invoice + B-BBEE certificate of supplier | P0 |
| WhatsApp ordering | Place/amend orders via WhatsApp | P1 |
| Quality dispute | Submit dispute with photo evidence within 24 hours of delivery | P0 |

### 3.3 Field Agent Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Grading form | Mobile web form to grade produce (size, colour, blemish %) | P0 |
| Photo capture | Upload up to 10 photos per collection against an order | P0 |
| Collection confirmation | Mark load as collected with weight and grade | P0 |
| Offline queue | Queue actions when connectivity is unavailable; sync on reconnect | P0 |

### 3.4 Operations Admin Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Order dashboard | View all active orders, assign to logistics runs | P0 |
| Route builder | Group orders into delivery routes; assign to contracted transport | P0 |
| Dispatch management | Mark loads dispatched, track ETA, confirm delivery | P0 |
| Payment processing | Trigger farmer payments after confirmed delivery | P0 |
| Dispute resolution | Review disputes, issue refunds or credits | P0 |
| Financial reconciliation | Daily report: GMV, commissions, payouts, outstanding | P0 |

---

## 4. Post-MVP Features (Months 4-12)

| Feature | Target | Priority |
|---------|--------|----------|
| Standing order management | Buyers set weekly recurring orders | P1 |
| Product expansion | Avocados, peppers, citrus beyond tomatoes | P1 |
| Mpumalanga corridor | Second supply corridor (subtropical produce) | P1 |
| B2G procurement portal | Government buyer interface with audit trail | P2 |
| Farmer demand forecast | Show predicted weekly demand per product | P2 |
| Route optimisation engine | Automated route suggestion based on order cluster | P2 |
| Mobile app (PWA) | Installable web app for field agents | P2 |
| Cooperative dashboard | Analytics for coop managers | P2 |
| API integrations | Connect to restaurant POS/ERP systems | P3 |

---

## 5. Non-Functional Requirements

### 5.1 Performance
- API response time: < 500ms at p95 under 100 concurrent users
- Page load: < 3 seconds on 3G connection
- Uptime: 99.5% (planned maintenance windows excluded)
- Photo upload: < 10 seconds per image on 3G

### 5.2 Offline / Connectivity
- Field agent grading form must work fully offline
- Queued actions sync automatically on reconnect
- WhatsApp notifications as fallback for any web notification

### 5.3 Security
- All data in transit: TLS 1.3
- All data at rest: AES-256 encryption
- PII encrypted at column level in PostgreSQL
- POPIA-compliant consent management from day one
- FICA/KYC data collected for all transacting parties
- Multi-factor authentication for admin roles

### 5.4 Accessibility & Localisation
- English primary language (MVP)
- Sepedi and Afrikaans for farmer-facing copy (Phase 2)
- WCAG 2.1 AA for buyer web interface

### 5.5 Compliance
- POPIA data processing agreement on registration
- B-BBEE supplier data captured for all cooperatives
- VAT invoices auto-generated (service fee at 15%; fresh produce zero-rated)
- All payment flows via licensed PSP (Ozow / Stitch)

---

## 6. Third-Party Integrations

| Service | Purpose | Priority |
|---------|---------|----------|
| **Ozow** | Instant EFT payments from buyers | P0 |
| **Stitch** | Account-to-account payouts to farmers | P0 |
| **Clickatell** | WhatsApp Business API + SMS notifications | P0 |
| **Cloudflare R2** | Photo storage (field agent produce photos) | P0 |
| **BullMQ + Redis** | Async job processing (payments, notifications) | P0 |
| **Sentry** | Error monitoring and alerting | P0 |
| **Fly.io** | Application hosting and deployment | P0 |
| **SendGrid** | Transactional email (invoices, onboarding) | P1 |
| **Mapbox / OpenStreetMap** | Route visualisation for operations | P1 |
| **Loom / Lark** | Field agent training videos | P2 |

---

## 7. Data Requirements

### 7.1 Entities (MVP)
- `User` — all platform users with role
- `Cooperative` — farmer cooperative (supplier)
- `Farm` — individual farm linked to a cooperative
- `Listing` — produce available for sale
- `Buyer` — restaurant or institutional buyer
- `Order` — buyer purchase of one or more listings
- `OrderItem` — line item on an order
- `Delivery` — logistics run (one truck, multiple orders)
- `DeliveryStop` — individual drop within a delivery
- `Collection` — pickup event at cooperative
- `GradeRecord` — field agent quality grading data
- `Photo` — image attached to a collection or dispute
- `Payment` — money movement (payout to farmer or receipt from buyer)
- `Invoice` — auto-generated PDF reference
- `Dispute` — quality or delivery issue raised by buyer
- `Notification` — log of all WhatsApp/SMS/email messages sent
- `AuditLog` — immutable record of all state changes

### 7.2 Retention
- Transaction data: 7 years (SARS requirement)
- PII: retained while account is active + 1 year after closure
- Photo data: 12 months rolling

---

## 8. Platform Constraints

1. **No physical product handling** — FarmConnect is a technology intermediary; we never take title to produce. This avoids HACCP and market agent licensing requirements.
2. **No money holding** — all funds move through licensed PSPs. FarmConnect retains commission via settlement instruction, not escrow.
3. **WhatsApp-first for farmers** — the farmer web portal is a fallback. All farmer-critical flows must work via WhatsApp Business API.
4. **Manual before automated** — if a flow can be done manually by the ops admin without software, build the software later. Speed to revenue beats feature completeness.

---

## 9. Acceptance Criteria — Corridor Launch

The corridor MVP is complete when:
- [ ] A cooperative can register and list available tomato volume
- [ ] A restaurant can place an order and receive a confirmed delivery date
- [ ] A field agent can record a collection with photos from a mobile device offline
- [ ] The ops admin can assign a collection to a logistics run and dispatch it
- [ ] The buyer receives a delivery status update via WhatsApp
- [ ] The farmer is paid within 48 hours of delivery confirmation
- [ ] A VAT-compliant invoice is auto-generated and emailed to the buyer
- [ ] A quality dispute can be raised and resolved within 24 hours
- [ ] All data is retained in compliance with POPIA
