# FarmConnect SA — API Specification

**Base URL:** `https://api.farmconnect.co.za/api/v1`  
**Auth:** Bearer JWT in `Authorization` header  
**Content-Type:** `application/json`  
**Error format:** `{ "error": "MESSAGE", "details": {...} }`

---

## Authentication

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "phone": "+27821234567",
  "name": "Sipho Ndlovu",
  "role": "BUYER",
  "password": "...",
  "email": "sipho@restaurant.co.za",
  "popiaConsent": true
}
```

**Response 201:**
```json
{
  "user": { "id": "...", "phone": "...", "role": "BUYER" },
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

### POST /auth/login
```json
{ "phone": "+27821234567", "password": "..." }
```
**Response 200:** Same as register.

---

### POST /auth/refresh
```json
{ "refreshToken": "..." }
```
**Response 200:** `{ "accessToken": "..." }`

---

### POST /auth/logout
Revokes the refresh token. Requires Bearer auth.  
**Response 204**

---

## Cooperatives

### POST /cooperatives
Register a cooperative. Requires `FARMER` role.

**Body:**
```json
{
  "name": "Mahela Fresh Produce Cooperative",
  "registrationNo": "CK2010/123456",
  "contactPhone": "+27152345678",
  "addressLine1": "Farm 45",
  "city": "Tzaneen",
  "province": "Limpopo",
  "bankName": "First National Bank",
  "bankAccountNo": "62123456789",
  "bankBranchCode": "250655"
}
```
**Response 201:** `{ "cooperative": { ... } }`

---

### GET /cooperatives/:id
Returns cooperative profile. Accessible to OPS_ADMIN and the cooperative's own FARMER user.

---

### PATCH /cooperatives/:id/verify
Admin-only. Set `isVerified: true` after manual KYC check.  
**Response 200:** `{ "cooperative": { "isVerified": true, ... } }`

---

## Listings

### POST /listings
Create a produce listing. Requires FARMER role and verified cooperative.

**Body:**
```json
{
  "product": "TOMATO_ROMA",
  "grade": "A",
  "quantityKg": 5000,
  "pricePerKgCents": 550,
  "availableFrom": "2026-06-01T06:00:00Z",
  "availableUntil": "2026-06-03T18:00:00Z",
  "description": "First-grade Roma, harvested Monday"
}
```
**Response 201:** `{ "listing": { ... } }`

---

### GET /listings
Browse active listings. Public-ish (requires auth but any role).

**Query params:**
- `product` — filter by product code
- `grade` — A | B | C
- `availableFrom` — ISO date
- `minKg` — minimum quantity available
- `page`, `limit`

**Response 200:**
```json
{
  "listings": [ { "id": "...", "product": "...", "grade": "A", "quantityKg": 5000, "pricePerKgCents": 550, "cooperative": { "name": "..." }, ... } ],
  "total": 42,
  "page": 1
}
```

---

### GET /listings/:id
**Response 200:** Full listing detail including cooperative info.

---

### PATCH /listings/:id
Update listing (owner cooperative or OPS_ADMIN only).  
Allowed fields: `quantityKg`, `pricePerKgCents`, `availableUntil`, `description`, `status`

---

## Orders

### POST /orders
Place an order. Requires BUYER role.

**Body:**
```json
{
  "items": [
    { "listingId": "...", "quantityKg": 200 }
  ],
  "deliveryDate": "2026-06-02",
  "notes": "Deliver before 7am please"
}
```
**Response 201:**
```json
{
  "order": { "id": "...", "status": "PENDING_PAYMENT", "totalAmountCents": 320000 },
  "paymentUrl": "https://pay.ozow.com/..."
}
```

---

### GET /orders
List orders.  
- BUYER: own orders only  
- OPS_ADMIN / PLATFORM_ADMIN: all orders  

**Query params:** `status`, `from`, `to`, `buyerId` (admin only), `page`, `limit`

---

### GET /orders/:id
Full order detail including items, delivery status, payment status, invoice link.

---

### PATCH /orders/:id/status
OPS_ADMIN only. Manually advance order status.  
**Body:** `{ "status": "CONFIRMED" }`

---

## Collections

### POST /collections
OPS_ADMIN creates a collection (links cooperative to an order).

**Body:**
```json
{
  "cooperativeId": "...",
  "fieldAgentId": "...",
  "scheduledAt": "2026-06-01T08:00:00Z"
}
```
**Response 201:** `{ "collection": { ... } }`

---

### POST /collections/:id/grade
Field agent submits grade record. Requires FIELD_AGENT role.

**Body:**
```json
{
  "grade": "A",
  "blemishPct": 2.5,
  "uniformityPct": 92,
  "fieldAgentNotes": "Excellent batch, no visible disease"
}
```
**Response 201:** `{ "gradeRecord": { ... } }`

---

### POST /collections/:id/photos
Field agent uploads photos. `multipart/form-data`.  
Field: `photos` (up to 10 files, max 10MB each, JPEG/PNG only)  
**Response 201:** `{ "photos": [ { "id": "...", "url": "..." } ] }`

---

### PATCH /collections/:id/confirm
Field agent confirms collection with actual weight.  
**Body:** `{ "actualWeightKg": 198.5 }`  
**Response 200:** `{ "collection": { "confirmedAt": "...", "actualWeightKg": 198.5 } }`

---

## Deliveries

### POST /deliveries
OPS_ADMIN creates a delivery run.

**Body:**
```json
{
  "route": "N1-North-AM",
  "scheduledDate": "2026-06-02",
  "transportProvider": "Limpopo Cold Transport CC",
  "driverName": "Thabo Mokoena",
  "driverPhone": "+27769876543"
}
```
**Response 201:** `{ "delivery": { ... } }`

---

### POST /deliveries/:id/stops
Add an order/collection to a delivery run.

**Body:** `{ "orderId": "...", "collectionId": "...", "stopSequence": 1 }`  
**Response 201:** `{ "stop": { ... } }`

---

### PATCH /deliveries/:id/dispatch
Mark delivery as dispatched. OPS_ADMIN only.  
**Response 200:** `{ "delivery": { "status": "DISPATCHED", "dispatchedAt": "..." } }`

---

### PATCH /deliveries/:id/stops/:stopId/deliver
Confirm a stop as delivered. OPS_ADMIN.  
**Body:** `{ "signedOffBy": "Chef Ntombi" }`  
Triggers: 48-hour payout job queued for the cooperative.  
**Response 200:** `{ "stop": { "deliveredAt": "..." }, "payoutJobId": "..." }`

---

## Payments

### POST /payments/webhook/ozow
Ozow payment confirmation webhook. Verifies HMAC signature.  
**Response 200** (always, to prevent retry storms — log errors internally)

---

### POST /payments/webhook/stitch
Stitch payout status webhook.  
**Response 200**

---

### GET /payments
OPS_ADMIN: list all payments with filters.  
FARMER: own cooperative's payouts only.  
BUYER: own order payments only.

**Query params:** `status`, `type`, `from`, `to`

---

### GET /payments/queue
OPS_ADMIN only. Payouts due within 48 hours that are still PENDING.  
**Response 200:** `{ "pending": [ { "cooperativeId": "...", "amountCents": 10450, "dueAt": "..." } ] }`

---

## Disputes

### POST /disputes
Buyer raises a dispute. Requires BUYER role. Must be within 24 hours of delivery.

**Body:**
```json
{
  "orderId": "...",
  "reason": "QUALITY",
  "description": "Tomatoes were grade C, ordered grade A. Photos attached."
}
```
Then upload photos via `POST /disputes/:id/photos` (same as collection photos endpoint, multipart).  
**Response 201:** `{ "dispute": { "id": "...", "status": "OPEN" } }`

---

### PATCH /disputes/:id/resolve
OPS_ADMIN resolves a dispute.

**Body:**
```json
{
  "resolution": "REFUND",
  "refundAmountCents": 15000,
  "notes": "Grade verified from photos — grade B supplied, grade A charged. Partial refund issued."
}
```
**Response 200:** `{ "dispute": { "status": "RESOLVED_REFUND", ... } }`

---

## Admin

### GET /admin/metrics
PLATFORM_ADMIN. Key metrics snapshot.

**Response 200:**
```json
{
  "gmvCents": 150000000,
  "activeListings": 12,
  "pendingOrders": 8,
  "deliveriesToday": 3,
  "payoutsDue48h": 5,
  "openDisputes": 1
}
```

---

### GET /admin/users
PLATFORM_ADMIN. Paginated user list with filters.

---

### PATCH /admin/users/:id/deactivate
PLATFORM_ADMIN. Soft-delete a user account.

---

### GET /admin/audit-logs
PLATFORM_ADMIN. Query audit log.  
**Query params:** `entityType`, `entityId`, `userId`, `from`, `to`

---

## Error Codes

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | VALIDATION_ERROR | Invalid request body |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Token valid but role insufficient |
| 404 | NOT_FOUND | Resource does not exist |
| 409 | CONFLICT | e.g. listing already sold out |
| 422 | BUSINESS_RULE_VIOLATION | e.g. dispute window expired |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error (logged to Sentry) |

---

## Pagination

All list endpoints return:
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```
Default: `page=1`, `limit=20`. Max limit: `100`.

---

## Webhook Security

**Ozow:** HMAC-SHA512 signature in `X-Ozow-Signature` header. Computed over the request body using the Ozow private key.

**Stitch:** Bearer token in `Authorization` header matching a pre-configured secret.

Both webhooks return `200` immediately and process asynchronously via BullMQ to prevent timeout-based retries.
