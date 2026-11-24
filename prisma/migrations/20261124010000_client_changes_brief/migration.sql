-- Add fields and dedicated records needed for the client changes brief.
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "traderId" TEXT,
  ADD COLUMN IF NOT EXISTS "productType" TEXT,
  ADD COLUMN IF NOT EXISTS "availability" TEXT NOT NULL DEFAULT 'IN_STOCK';
CREATE INDEX IF NOT EXISTS "Product_traderId_idx" ON "Product"("traderId");
CREATE INDEX IF NOT EXISTS "Product_productType_idx" ON "Product"("productType");
CREATE INDEX IF NOT EXISTS "Product_availability_idx" ON "Product"("availability");

CREATE TABLE IF NOT EXISTS "TraderRecord" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "shopName" TEXT NOT NULL,
  "ownerName" TEXT,
  "registrationNumber" TEXT NOT NULL,
  "dzongkhag" TEXT NOT NULL,
  "town" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "mapUrl" TEXT,
  "openingHours" TEXT,
  "shortDescription" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "craftKeys" JSONB NOT NULL DEFAULT '[]',
  "productTypes" JSONB NOT NULL DEFAULT '[]',
  "productPhotoUrls" JSONB NOT NULL DEFAULT '[]',
  "bannerUrl" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE,
  "expiryNoticeSentAt" TIMESTAMP(3),
  "verifiedSince" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TraderRecord_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "TraderRecord" ADD COLUMN IF NOT EXISTS "quote" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "TraderRecord_slug_key" ON "TraderRecord"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "TraderRecord_registrationNumber_key" ON "TraderRecord"("registrationNumber");
CREATE INDEX IF NOT EXISTS "TraderRecord_dzongkhag_idx" ON "TraderRecord"("dzongkhag");
CREATE INDEX IF NOT EXISTS "TraderRecord_expiresAt_isVisible_idx" ON "TraderRecord"("expiresAt", "isVisible");
CREATE INDEX IF NOT EXISTS "TraderRecord_isVisible_sortOrder_idx" ON "TraderRecord"("isVisible", "sortOrder");
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Product_traderId_fkey'
      AND conrelid = '"Product"'::regclass
  ) THEN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_traderId_fkey"
      FOREIGN KEY ("traderId") REFERENCES "TraderRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

ALTER TABLE "HonourRecord"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT 'Master Craftsperson',
  ADD COLUMN IF NOT EXISTS "practisingSince" INTEGER,
  ADD COLUMN IF NOT EXISTS "shortDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "story" TEXT,
  ADD COLUMN IF NOT EXISTS "workPhotos" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "showHome" BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS "HonourRecord_slug_key" ON "HonourRecord"("slug");

ALTER TABLE "EventRecord" ADD COLUMN IF NOT EXISTS "shortSummary" TEXT;
