-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'PAYFAST', 'OZOW', 'SNAPSCAN', 'COD', 'STOKVEL');

-- CreateEnum
CREATE TYPE "StokvelStatus" AS ENUM ('COLLECTING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- AlterTable: orders — make stripeSessionId optional, add SA payment + delivery columns
ALTER TABLE "orders"
  ALTER COLUMN "stripeSessionId" DROP NOT NULL,
  ADD COLUMN "paymentMethod"       "PaymentMethod" NOT NULL DEFAULT 'STRIPE',
  ADD COLUMN "payfastToken"        TEXT,
  ADD COLUMN "ozowTransactionId"   TEXT,
  ADD COLUMN "deliveryGpsLat"      DOUBLE PRECISION,
  ADD COLUMN "deliveryGpsLng"      DOUBLE PRECISION,
  ADD COLUMN "deliveryNotes"       TEXT,
  ADD COLUMN "courierService"      TEXT,
  ADD COLUMN "isClickAndCollect"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "collectPointId"      TEXT,
  ADD COLUMN "stokvelGroupId"      TEXT;

-- CreateTable: collect_points
CREATE TABLE "collect_points" (
    "id"       TEXT NOT NULL,
    "name"     TEXT NOT NULL,
    "address"  TEXT NOT NULL,
    "city"     TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "gpsLat"   DOUBLE PRECISION,
    "gpsLng"   DOUBLE PRECISION,
    "type"     TEXT NOT NULL DEFAULT 'spaza',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "collect_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable: stokvel_groups
CREATE TABLE "stokvel_groups" (
    "id"           TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "description"  TEXT,
    "targetAmount" DECIMAL(10,2) NOT NULL,
    "cartItems"    JSONB NOT NULL,
    "status"       "StokvelStatus" NOT NULL DEFAULT 'COLLECTING',
    "createdById"  TEXT NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stokvel_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable: stokvel_members
CREATE TABLE "stokvel_members" (
    "id"          TEXT NOT NULL,
    "groupId"     TEXT NOT NULL,
    "email"       TEXT NOT NULL,
    "name"        TEXT,
    "shareAmount" DECIMAL(10,2) NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stokvel_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable: stokvel_contributions
CREATE TABLE "stokvel_contributions" (
    "id"            TEXT NOT NULL,
    "groupId"       TEXT NOT NULL,
    "memberId"      TEXT NOT NULL,
    "amount"        DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentRef"    TEXT,
    "status"        "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stokvel_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: vendors
CREATE TABLE "vendors" (
    "id"           TEXT NOT NULL,
    "userId"       TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "description"  TEXT,
    "phone"        TEXT,
    "whatsapp"     TEXT,
    "address"      TEXT,
    "city"         TEXT,
    "province"     TEXT NOT NULL DEFAULT 'Limpopo',
    "gpsLat"       DOUBLE PRECISION,
    "gpsLng"       DOUBLE PRECISION,
    "category"     TEXT,
    "imageUrl"     TEXT,
    "permitNumber" TEXT,
    "vatNumber"    TEXT,
    "vatRate"      DECIMAL(4,2) NOT NULL DEFAULT 0,
    "isVerified"   BOOLEAN NOT NULL DEFAULT false,
    "isActive"     BOOLEAN NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "orders_paymentMethod_idx" ON "orders"("paymentMethod");

-- CreateIndex
CREATE UNIQUE INDEX "orders_stokvelGroupId_key" ON "orders"("stokvelGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "stokvel_members_groupId_email_key" ON "stokvel_members"("groupId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_userId_key" ON "vendors"("userId");

-- CreateIndex
CREATE INDEX "vendors_province_idx" ON "vendors"("province");

-- CreateIndex
CREATE INDEX "vendors_isActive_idx" ON "vendors"("isActive");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_collectPointId_fkey"
  FOREIGN KEY ("collectPointId") REFERENCES "collect_points"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_stokvelGroupId_fkey"
  FOREIGN KEY ("stokvelGroupId") REFERENCES "stokvel_groups"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stokvel_members" ADD CONSTRAINT "stokvel_members_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "stokvel_groups"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stokvel_contributions" ADD CONSTRAINT "stokvel_contributions_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "stokvel_groups"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stokvel_contributions" ADD CONSTRAINT "stokvel_contributions_memberId_fkey"
  FOREIGN KEY ("memberId") REFERENCES "stokvel_members"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
