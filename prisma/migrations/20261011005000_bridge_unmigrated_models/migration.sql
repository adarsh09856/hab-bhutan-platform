-- Bridge the models previously created only by prisma db push.

-- Placed before the later HonourRecord and OutletRecord column migrations.

-- Existing production tables and indexes are preserved.



-- CreateTable
CREATE TABLE IF NOT EXISTS "WholesaleProductTerms" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "moq" INTEGER NOT NULL DEFAULT 5,
    "leadTime" TEXT NOT NULL DEFAULT '4–6 weeks',
    "tiers" JSONB NOT NULL,
    "customisation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WholesaleProductTerms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "NavigationItem" (
    "id" TEXT NOT NULL,
    "menuType" TEXT NOT NULL,
    "column" TEXT,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "parent" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PolicyPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ClusterRecord" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "craftKey" TEXT NOT NULL,
    "dzongkhag" TEXT NOT NULL,
    "members" INTEGER NOT NULL DEFAULT 0,
    "established" INTEGER NOT NULL DEFAULT 2026,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "visitorNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClusterRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "OutletRecord" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OUTLET',
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "place" TEXT NOT NULL,
    "note" TEXT,
    "description" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "hours" TEXT NOT NULL DEFAULT '09:00 - 18:00 daily',
    "stalls" TEXT,
    "craftsOnSite" TEXT,
    "payment" TEXT,
    "gettingThere" TEXT,
    "facilities" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutletRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EventRecord" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleDz" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Exhibition',
    "categoryDz" TEXT,
    "dateDisplay" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "locationDz" TEXT,
    "venue" TEXT,
    "venueDz" TEXT,
    "craft" TEXT,
    "organiser" TEXT,
    "subCategory" TEXT,
    "documentUrl" TEXT,
    "documentType" TEXT DEFAULT 'PDF',
    "documentTitle" TEXT,
    "imageUrl" TEXT,
    "description" TEXT NOT NULL,
    "descriptionDz" TEXT,
    "summaryDz" TEXT,
    "schedule" JSONB,
    "speakers" JSONB,
    "registration" TEXT,
    "registrationDz" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TenderRecord" (
    "id" TEXT NOT NULL,
    "tenderNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Procurement',
    "description" TEXT NOT NULL,
    "openingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closingDate" TIMESTAMP(3) NOT NULL,
    "documentUrl" TEXT,
    "documentType" TEXT DEFAULT 'PDF',
    "documentTitle" TEXT DEFAULT 'Tender Terms & Conditions Document',
    "submissionEmail" TEXT NOT NULL DEFAULT 'officehab@gmail.com',
    "contactPerson" TEXT DEFAULT 'Secretary Desk, HAB',
    "contactPhone" TEXT DEFAULT '+975-2-338089',
    "estimatedBudget" TEXT,
    "eligibility" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenderRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SupportPillar" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAmountUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "raisedAmountUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "iconEmoji" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportPillar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "HonourRecord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "craft" TEXT NOT NULL,
    "dzongkhag" TEXT NOT NULL,
    "awardType" TEXT NOT NULL,
    "yearAwarded" INTEGER NOT NULL DEFAULT 2026,
    "citation" TEXT NOT NULL,
    "portraitUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HonourRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MembershipCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "duesBTN" INTEGER NOT NULL DEFAULT 1200,
    "duesUSD" INTEGER NOT NULL DEFAULT 15,
    "description" TEXT NOT NULL,
    "eligibility" JSONB,
    "benefits" JSONB,
    "documents" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DonationRecord" (
    "id" TEXT NOT NULL,
    "pillarKey" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "amountUSD" DOUBLE PRECISION NOT NULL,
    "amountBTN" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "frequency" TEXT NOT NULL DEFAULT 'ONE_TIME',
    "paymentMethod" TEXT DEFAULT 'MBOB',
    "proofUrl" TEXT,
    "journalRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "receiptNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CustomPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "subCategory" TEXT,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "videoUrl" TEXT,
    "galleryImages" JSONB,
    "socialLinks" JSONB,
    "ctaButton" JSONB,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "showInHeaderNav" BOOLEAN NOT NULL DEFAULT false,
    "showInFooterNav" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PublicPageBlock" (
    "id" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "buttonLabel" TEXT,
    "buttonHref" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicPageBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GovernancePageCard" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "number" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "titleDz" TEXT,
    "bodyDz" TEXT,
    "metric" TEXT,
    "metricDz" TEXT,
    "tags" TEXT,
    "tagsDz" TEXT,
    "iconKey" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernancePageCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WholesaleBuyer" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Bhutan',
    "city" TEXT,
    "taxId" TEXT,
    "discountTier" INTEGER NOT NULL DEFAULT 20,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WholesaleBuyer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WholesaleProductTerms_productId_key" ON "WholesaleProductTerms"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WholesaleProductTerms_isActive_idx" ON "WholesaleProductTerms"("isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "NavigationItem_menuType_idx" ON "NavigationItem"("menuType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "NavigationItem_sortOrder_idx" ON "NavigationItem"("sortOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Inquiry_status_idx" ON "Inquiry"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Inquiry_email_idx" ON "Inquiry"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PolicyPage_slug_key" ON "PolicyPage"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PolicyPage_slug_idx" ON "PolicyPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ClusterRecord_key_key" ON "ClusterRecord"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClusterRecord_craftKey_idx" ON "ClusterRecord"("craftKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClusterRecord_dzongkhag_idx" ON "ClusterRecord"("dzongkhag");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "OutletRecord_key_key" ON "OutletRecord"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OutletRecord_type_idx" ON "OutletRecord"("type");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EventRecord_key_key" ON "EventRecord"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventRecord_category_idx" ON "EventRecord"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventRecord_isActive_idx" ON "EventRecord"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TenderRecord_tenderNumber_key" ON "TenderRecord"("tenderNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TenderRecord_status_idx" ON "TenderRecord"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TenderRecord_category_idx" ON "TenderRecord"("category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SupportPillar_key_key" ON "SupportPillar"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SupportPillar_isActive_idx" ON "SupportPillar"("isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HonourRecord_awardType_idx" ON "HonourRecord"("awardType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HonourRecord_craft_idx" ON "HonourRecord"("craft");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MembershipCategory_key_key" ON "MembershipCategory"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MembershipCategory_isActive_idx" ON "MembershipCategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DonationRecord_receiptNumber_key" ON "DonationRecord"("receiptNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DonationRecord_pillarKey_idx" ON "DonationRecord"("pillarKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DonationRecord_donorEmail_idx" ON "DonationRecord"("donorEmail");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CustomPage_slug_key" ON "CustomPage"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CustomPage_slug_idx" ON "CustomPage"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CustomPage_isPublished_idx" ON "CustomPage"("isPublished");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CustomPage_category_idx" ON "CustomPage"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PublicPageBlock_pathname_sortOrder_idx" ON "PublicPageBlock"("pathname", "sortOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GovernancePageCard_section_sortOrder_idx" ON "GovernancePageCard"("section", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WholesaleBuyer_username_key" ON "WholesaleBuyer"("username");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WholesaleBuyer_email_key" ON "WholesaleBuyer"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WholesaleBuyer_username_idx" ON "WholesaleBuyer"("username");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WholesaleBuyer_email_idx" ON "WholesaleBuyer"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WholesaleBuyer_status_idx" ON "WholesaleBuyer"("status");

-- AddForeignKey (safe when this bridge runs against an existing db-push database)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WholesaleProductTerms_productId_fkey') THEN
    ALTER TABLE "WholesaleProductTerms" ADD CONSTRAINT "WholesaleProductTerms_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey (safe when this bridge runs against an existing db-push database)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DonationRecord_pillarKey_fkey') THEN
    ALTER TABLE "DonationRecord" ADD CONSTRAINT "DonationRecord_pillarKey_fkey" FOREIGN KEY ("pillarKey") REFERENCES "SupportPillar"("key") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

