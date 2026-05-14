# FarmConnect SA — Database Schema

**ORM:** Prisma  
**Database:** PostgreSQL 15+

---

## Prisma Schema

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────────────────────────────

enum Role {
  FARMER
  BUYER
  FIELD_AGENT
  OPS_ADMIN
  PLATFORM_ADMIN
}

enum ProduceGrade {
  A   // Premium — uniform size, colour, no blemishes
  B   // Standard — minor size variation, <5% blemish
  C   // Processing — significant variation, >5% blemish
}

enum ListingStatus {
  DRAFT
  ACTIVE
  SOLD_OUT
  EXPIRED
  CANCELLED
}

enum OrderStatus {
  PENDING_PAYMENT
  CONFIRMED
  COLLECTION_SCHEDULED
  COLLECTED
  IN_TRANSIT
  DELIVERED
  DISPUTED
  CANCELLED
}

enum DeliveryStatus {
  PLANNED
  DISPATCHED
  IN_TRANSIT
  COMPLETED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED_REFUND
  RESOLVED_CREDIT
  REJECTED
}

enum NotificationChannel {
  WHATSAPP
  SMS
  EMAIL
}

// ─── CORE ENTITIES ────────────────────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  phone         String    @unique
  name          String
  role          Role
  passwordHash  String
  popiaConsent  Boolean   @default(false)
  popiaConsentAt DateTime?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  cooperative     Cooperative?
  buyer           Buyer?
  fieldAgentAssignments Collection[] @relation("FieldAgent")
  refreshTokens   RefreshToken[]
  auditLogs       AuditLog[]
  notifications   Notification[]

  @@index([role])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

// ─── SUPPLY SIDE ──────────────────────────────────────────────────────────────

model Cooperative {
  id            String  @id @default(cuid())
  userId        String  @unique
  name          String
  registrationNo String @unique  // CIPC number
  bbeeLevelCurrent Int?
  contactPhone  String
  contactEmail  String?
  addressLine1  String
  addressLine2  String?
  city          String
  province      String
  gpsLat        Float?
  gpsLng        Float?
  bankName      String
  bankAccountNo String   // Encrypted
  bankBranchCode String
  isVerified    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user      User      @relation(fields: [userId], references: [id])
  farms     Farm[]
  listings  Listing[]
  payments  Payment[] @relation("CooperativePayments")

  @@map("cooperatives")
}

model Farm {
  id            String  @id @default(cuid())
  cooperativeId String
  name          String
  gpsLat        Float?
  gpsLng        Float?
  hectares      Float?
  products      String[] // e.g. ["TOMATO", "AVOCADO"]
  createdAt     DateTime @default(now())

  cooperative Cooperative @relation(fields: [cooperativeId], references: [id])

  @@index([cooperativeId])
  @@map("farms")
}

model Listing {
  id              String        @id @default(cuid())
  cooperativeId   String
  product         String        // e.g. "TOMATO_ROMA"
  grade           ProduceGrade
  quantityKg      Float
  pricePerKgCents Int           // Store in cents to avoid float rounding
  availableFrom   DateTime
  availableUntil  DateTime
  description     String?
  status          ListingStatus @default(DRAFT)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  cooperative Cooperative  @relation(fields: [cooperativeId], references: [id])
  orderItems  OrderItem[]

  @@index([product, availableFrom, status])
  @@index([cooperativeId, status])
  @@map("listings")
}

// ─── DEMAND SIDE ──────────────────────────────────────────────────────────────

model Buyer {
  id             String  @id @default(cuid())
  userId         String  @unique
  businessName   String
  vatNumber      String?
  contactPhone   String
  deliveryAddress String
  deliveryCity   String
  deliveryGpsLat Float?
  deliveryGpsLng Float?
  isVerified     Boolean @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user   User    @relation(fields: [userId], references: [id])
  orders Order[]

  @@map("buyers")
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

model Order {
  id              String      @id @default(cuid())
  buyerId         String
  status          OrderStatus @default(PENDING_PAYMENT)
  totalAmountCents Int
  deliveryDate    DateTime?
  notes           String?
  standingOrderId String?     // Link to recurring order if applicable
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  buyer         Buyer          @relation(fields: [buyerId], references: [id])
  items         OrderItem[]
  deliveryStop  DeliveryStop?
  payments      Payment[]
  invoice       Invoice?
  dispute       Dispute?

  @@index([buyerId, status, createdAt])
  @@map("orders")
}

model OrderItem {
  id           String @id @default(cuid())
  orderId      String
  listingId    String
  quantityKg   Float
  pricePerKgCents Int
  subtotalCents   Int

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  listing Listing @relation(fields: [listingId], references: [id])

  @@index([orderId])
  @@map("order_items")
}

// ─── LOGISTICS ────────────────────────────────────────────────────────────────

model Collection {
  id              String   @id @default(cuid())
  cooperativeId   String
  fieldAgentId    String?
  scheduledAt     DateTime
  confirmedAt     DateTime?
  actualWeightKg  Float?
  notes           String?
  createdAt       DateTime @default(now())

  cooperative Cooperative   @relation(fields: [cooperativeId], references: [id])  // implied via cooperative
  fieldAgent  User?         @relation("FieldAgent", fields: [fieldAgentId], references: [id])
  gradeRecord GradeRecord?
  photos      Photo[]
  deliveryStop DeliveryStop?

  @@index([cooperativeId])
  @@map("collections")
}

model GradeRecord {
  id            String       @id @default(cuid())
  collectionId  String       @unique
  grade         ProduceGrade
  blemishPct    Float        // 0-100
  uniformityPct Float        // 0-100
  moistureLoss  Float?       // estimated % weight loss
  fieldAgentNotes String?
  gradedAt      DateTime     @default(now())

  collection Collection @relation(fields: [collectionId], references: [id])

  @@map("grade_records")
}

model Delivery {
  id               String         @id @default(cuid())
  route            String         // Human-readable route name e.g. "N1-North-AM"
  scheduledDate    DateTime
  transportProvider String
  driverName       String?
  driverPhone      String?
  status           DeliveryStatus @default(PLANNED)
  dispatchedAt     DateTime?
  completedAt      DateTime?
  notes            String?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  stops DeliveryStop[]

  @@index([status, scheduledDate])
  @@map("deliveries")
}

model DeliveryStop {
  id            String    @id @default(cuid())
  deliveryId    String
  orderId       String    @unique
  collectionId  String?   @unique
  stopSequence  Int
  deliveredAt   DateTime?
  signedOffBy   String?

  delivery   Delivery    @relation(fields: [deliveryId], references: [id])
  order      Order       @relation(fields: [orderId], references: [id])
  collection Collection? @relation(fields: [collectionId], references: [id])

  @@index([deliveryId])
  @@map("delivery_stops")
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────

model Payment {
  id              String        @id @default(cuid())
  orderId         String?
  cooperativeId   String?
  type            String        // "BUYER_PAYMENT" | "FARMER_PAYOUT" | "REFUND"
  amountCents     Int
  currency        String        @default("ZAR")
  status          PaymentStatus @default(PENDING)
  pspProvider     String        // "OZOW" | "STITCH"
  pspReference    String?
  pspWebhookData  Json?
  dueAt           DateTime?
  processedAt     DateTime?
  failureReason   String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  order       Order?       @relation(fields: [orderId], references: [id])
  cooperative Cooperative? @relation("CooperativePayments", fields: [cooperativeId], references: [id])

  @@index([status, dueAt])
  @@index([orderId])
  @@map("payments")
}

model Invoice {
  id          String   @id @default(cuid())
  orderId     String   @unique
  invoiceNo   String   @unique // e.g. "FC-2026-001234"
  r2Key       String   // Cloudflare R2 object key for PDF
  vatAmountCents Int
  totalCents  Int
  issuedAt    DateTime @default(now())

  order Order @relation(fields: [orderId], references: [id])

  @@map("invoices")
}

// ─── DISPUTES ─────────────────────────────────────────────────────────────────

model Dispute {
  id          String        @id @default(cuid())
  orderId     String        @unique
  raisedBy    String        // userId
  reason      String
  description String
  status      DisputeStatus @default(OPEN)
  resolution  String?
  refundAmountCents Int?
  resolvedAt  DateTime?
  resolvedBy  String?       // userId
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  order  Order   @relation(fields: [orderId], references: [id])
  photos Photo[]

  @@map("disputes")
}

// ─── PHOTOS ───────────────────────────────────────────────────────────────────

model Photo {
  id           String  @id @default(cuid())
  r2Key        String  // Cloudflare R2 object key
  collectionId String?
  disputeId    String?
  uploadedBy   String  // userId
  takenAt      DateTime?
  createdAt    DateTime @default(now())

  collection Collection? @relation(fields: [collectionId], references: [id])
  dispute    Dispute?    @relation(fields: [disputeId], references: [id])

  @@index([collectionId])
  @@map("photos")
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

model Notification {
  id         String              @id @default(cuid())
  userId     String
  channel    NotificationChannel
  templateId String
  payload    Json
  status     String              @default("PENDING") // PENDING | SENT | FAILED
  sentAt     DateTime?
  createdAt  DateTime            @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
  @@map("notifications")
}

// ─── AUDIT ────────────────────────────────────────────────────────────────────

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  entityType  String   // "Order" | "Payment" | "User" etc.
  entityId    String
  action      String   // "CREATED" | "UPDATED" | "STATUS_CHANGED" etc.
  previousState Json?
  newState    Json?
  ipAddress   String?
  createdAt   DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([entityType, entityId, createdAt])
  @@map("audit_logs")
}
```

---

## Key Design Decisions

### Money as Integers
All monetary values are stored in cents (integer) to avoid floating-point rounding errors. The API layer converts to/from display format.

### Audit Log
Every state change to a core entity appends a row to `audit_logs`. This is the compliance backbone — it satisfies both POPIA audit requirements and government procurement traceability requirements.

### Encrypted Fields
`bankAccountNo` (and other PII) are encrypted at the application layer before writing to PostgreSQL. The Prisma field type is `String`, but the service layer handles encrypt/decrypt.

### Collection ↔ DeliveryStop ↔ Order
A `Collection` is when a field agent picks up produce from a cooperative. A `DeliveryStop` ties a `Collection` to an `Order` within a `Delivery` run. This allows one collection to serve one order, and makes the logistics dispatch explicit.

### Standing Orders
`Order.standingOrderId` references a future `StandingOrder` model (Phase 2). At MVP, this field is null — the column is in place to avoid a breaking migration later.
