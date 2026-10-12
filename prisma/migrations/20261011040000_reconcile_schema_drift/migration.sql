-- Reconcile columns and constraints introduced by db push but absent from the tracked migrations.
-- Additions are conditional so this bridge is safe for an already-synced production schema.

-- AlterEnum
ALTER TYPE "ActorType" ADD VALUE IF NOT EXISTS 'WHOLESALE';

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'COD';

-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN IF NOT EXISTS     "placeDz" TEXT,
ADD COLUMN IF NOT EXISTS     "titleDz" TEXT;

-- AlterTable
ALTER TABLE "Craft" ADD COLUMN IF NOT EXISTS     "history" TEXT,
ADD COLUMN IF NOT EXISTS     "longDescription" TEXT,
ADD COLUMN IF NOT EXISTS     "materials" TEXT,
ADD COLUMN IF NOT EXISTS     "practisedIn" TEXT,
ADD COLUMN IF NOT EXISTS     "shopNote" TEXT,
ADD COLUMN IF NOT EXISTS     "technique" TEXT,
ADD COLUMN IF NOT EXISTS     "typicalProducts" TEXT;

-- AlterTable
ALTER TABLE "GovernanceRecord" ADD COLUMN IF NOT EXISTS     "bio" TEXT,
ADD COLUMN IF NOT EXISTS     "email" TEXT,
ADD COLUMN IF NOT EXISTS     "phone" TEXT,
ADD COLUMN IF NOT EXISTS     "photoUrl" TEXT;

-- AlterTable
ALTER TABLE "Inquiry" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN IF NOT EXISTS     "blurbDz" TEXT,
ADD COLUMN IF NOT EXISTS     "contentDz" TEXT,
ADD COLUMN IF NOT EXISTS     "documentTitle" TEXT,
ADD COLUMN IF NOT EXISTS     "documentType" TEXT DEFAULT 'PDF',
ADD COLUMN IF NOT EXISTS     "documentUrl" TEXT,
ADD COLUMN IF NOT EXISTS     "imageUrl" TEXT,
ADD COLUMN IF NOT EXISTS     "kindDz" TEXT,
ADD COLUMN IF NOT EXISTS     "slug" TEXT,
ADD COLUMN IF NOT EXISTS     "subCategory" TEXT,
ADD COLUMN IF NOT EXISTS     "titleDz" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS     "internalNotes" TEXT,
ADD COLUMN IF NOT EXISTS     "wholesaleBuyerId" TEXT;

-- AlterTable
ALTER TABLE "PolicyPage" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS     "care" TEXT,
ADD COLUMN IF NOT EXISTS     "lead" TEXT,
ADD COLUMN IF NOT EXISTS     "materials" TEXT,
ADD COLUMN IF NOT EXISTS     "size" TEXT,
ADD COLUMN IF NOT EXISTS     "weight" TEXT;

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN IF NOT EXISTS     "kindDz" TEXT,
ADD COLUMN IF NOT EXISTS     "metaDetailsDz" TEXT,
ADD COLUMN IF NOT EXISTS     "summaryDz" TEXT,
ADD COLUMN IF NOT EXISTS     "titleDz" TEXT;

-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS     "aboutHistoryText" TEXT,
ADD COLUMN IF NOT EXISTS     "aboutMandatePara2" TEXT,
ADD COLUMN IF NOT EXISTS     "aboutMandateText" TEXT,
ADD COLUMN IF NOT EXISTS     "aboutObjectives" JSONB,
ADD COLUMN IF NOT EXISTS     "aboutStats" JSONB,
ADD COLUMN IF NOT EXISTS     "aboutValues" JSONB,
ADD COLUMN IF NOT EXISTS     "checkoutAccountNumber" TEXT DEFAULT '1009234810293',
ADD COLUMN IF NOT EXISTS     "checkoutAccountTitle" TEXT DEFAULT 'Handicrafts Association of Bhutan',
ADD COLUMN IF NOT EXISTS     "checkoutBankAddress" TEXT DEFAULT 'Corporate Branch, Norzin Lam, Thimphu, Bhutan',
ADD COLUMN IF NOT EXISTS     "checkoutBankName" TEXT DEFAULT 'Bank of Bhutan Ltd',
ADD COLUMN IF NOT EXISTS     "checkoutSwiftCode" TEXT DEFAULT 'BOBBBT22',
ADD COLUMN IF NOT EXISTS     "contactDepartments" JSONB,
ADD COLUMN IF NOT EXISTS     "contactDirections" TEXT,
ADD COLUMN IF NOT EXISTS     "contactHours" TEXT DEFAULT 'Monday – Friday: 9:00 AM – 5:00 PM BST (UTC+6)',
ADD COLUMN IF NOT EXISTS     "contactLede" TEXT,
ADD COLUMN IF NOT EXISTS     "contactPoBox" TEXT DEFAULT 'PO Box 1129, Thimphu',
ADD COLUMN IF NOT EXISTS     "donateHeroLede" TEXT,
ADD COLUMN IF NOT EXISTS     "donateHeroTitle" TEXT DEFAULT 'Direct Support for Bhutanese Artisans',
ADD COLUMN IF NOT EXISTS     "donateTaxNotice" TEXT,
ADD COLUMN IF NOT EXISTS     "emailSettings" JSONB,
ADD COLUMN IF NOT EXISTS     "facebookUrl" TEXT,
ADD COLUMN IF NOT EXISTS     "homeClusterPromo" JSONB,
ADD COLUMN IF NOT EXISTS     "homeCraftIntro" TEXT,
ADD COLUMN IF NOT EXISTS     "homeCsoText" TEXT,
ADD COLUMN IF NOT EXISTS     "homeWholesalePromo" JSONB,
ADD COLUMN IF NOT EXISTS     "homepageSectionOrder" JSONB,
ADD COLUMN IF NOT EXISTS     "instagramUrl" TEXT,
ADD COLUMN IF NOT EXISTS     "orderConfirmationLede" TEXT,
ADD COLUMN IF NOT EXISTS     "orderConfirmationTitle" TEXT DEFAULT 'Order Confirmed!',
ADD COLUMN IF NOT EXISTS     "orderSupportEmail" TEXT DEFAULT 'officehab@gmail.com',
ADD COLUMN IF NOT EXISTS     "orderSupportPhone" TEXT DEFAULT '+975-2-338089',
ADD COLUMN IF NOT EXISTS     "policyPopupEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS     "policyPopupText" TEXT DEFAULT 'Welcome to the Handicrafts Association of Bhutan. Please review our official policies on verified artisan standards, shipping, terms, and returns.',
ADD COLUMN IF NOT EXISTS     "secretaryEmail" TEXT NOT NULL DEFAULT 'officehab@gmail.com',
ADD COLUMN IF NOT EXISTS     "secretaryPhone" TEXT NOT NULL DEFAULT '+975-2-338089',
ADD COLUMN IF NOT EXISTS     "shippingCarrierName" TEXT DEFAULT 'Bhutan Post International Express (EMS) / DHL',
ADD COLUMN IF NOT EXISTS     "shippingInsuranceNote" TEXT,
ADD COLUMN IF NOT EXISTS     "shippingOriginText" TEXT DEFAULT 'Metog Lam, Kawajangsa, Thimphu, Kingdom of Bhutan',
ADD COLUMN IF NOT EXISTS     "shippingTransitDays" TEXT DEFAULT '7-14 business days',
ADD COLUMN IF NOT EXISTS     "tiktokUrl" TEXT,
ADD COLUMN IF NOT EXISTS     "trustBadges" JSONB,
ADD COLUMN IF NOT EXISTS     "twitterUrl" TEXT,
ADD COLUMN IF NOT EXISTS     "wholesaleAssurances" JSONB,
ADD COLUMN IF NOT EXISTS     "wholesaleBuyerTypes" JSONB,
ADD COLUMN IF NOT EXISTS     "wholesaleLeadTime" TEXT NOT NULL DEFAULT '2 to 4 weeks depending on batch size',
ADD COLUMN IF NOT EXISTS     "wholesaleMoq" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS     "wholesaleTerms" JSONB,
ADD COLUMN IF NOT EXISTS     "youtubeUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "NewsArticle_slug_key" ON "NewsArticle"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_wholesaleBuyerId_idx" ON "Order"("wholesaleBuyerId");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Order_wholesaleBuyerId_fkey') THEN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_wholesaleBuyerId_fkey" FOREIGN KEY ("wholesaleBuyerId") REFERENCES "WholesaleBuyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

