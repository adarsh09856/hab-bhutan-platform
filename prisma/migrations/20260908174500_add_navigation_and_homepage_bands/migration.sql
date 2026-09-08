-- AlterTable SiteSetting
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "assurance1Title" TEXT NOT NULL DEFAULT 'Verified members only';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "assurance1Text" TEXT NOT NULL DEFAULT 'Every seller is a registered HAB member with documented craft credentials.';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "assurance2Title" TEXT NOT NULL DEFAULT 'Fair price, paid upfront';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "assurance2Text" TEXT NOT NULL DEFAULT 'HAB buys from the artisan at an agreed price before the piece is listed.';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "assurance3Title" TEXT NOT NULL DEFAULT 'Secure payment';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "assurance3Text" TEXT NOT NULL DEFAULT '3-D Secure cards, mBoB and bank transfer, in USD or Ngultrum.';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "assurance4Title" TEXT NOT NULL DEFAULT 'Tracked worldwide';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "assurance4Text" TEXT NOT NULL DEFAULT 'EMS via Bhutan Post with commercial invoice and craft certificate.';

ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "aboutBandTitle" TEXT NOT NULL DEFAULT 'A network built for the artisans, not the middlemen';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "aboutBandPara1" TEXT NOT NULL DEFAULT 'Handicrafts Association of Bhutan (HAB) plays a critical role in the Bhutanese handicrafts sector. We work towards creating a vibrant, sustainable, and inclusive craft ecosystem by bridging traditional techniques with modern markets, and ensuring fair compensation for our artisans.';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "aboutBandPara2" TEXT NOT NULL DEFAULT 'Our nationwide network supports more than 7,500 micro and small craft enterprises — 70% women-led — across all twenty dzongkhags. We provide capacity building, quality certification, and direct market access through our physical outlets and international e-shop.';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "aboutBandImageUrl" TEXT NOT NULL DEFAULT '/images/training_workshop.jpg';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "aboutBandImageCaption" TEXT NOT NULL DEFAULT 'HAB artisan training workshop · Thimphu';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "aboutBandCtaText" TEXT NOT NULL DEFAULT 'Read about our programmes →';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "aboutBandCtaLink" TEXT NOT NULL DEFAULT '/programmes';

ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "membershipLeftTitle" TEXT NOT NULL DEFAULT 'Find a member';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "membershipLeftText" TEXT NOT NULL DEFAULT 'Connect directly with master craftspeople, verified weaving clusters, and traditional workshops across Bhutan.';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "membershipLeftCtaText" TEXT NOT NULL DEFAULT 'Search member directory →';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "membershipLeftCtaLink" TEXT NOT NULL DEFAULT '/members';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "membershipRightTitle" TEXT NOT NULL DEFAULT 'Become a member';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "membershipRightText" TEXT NOT NULL DEFAULT 'Access product consignment in our central shop, participate in donor training programmes, and represent your craft in international trade fairs.';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "membershipRightCtaText" TEXT NOT NULL DEFAULT 'Apply for membership';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "membershipRightCtaLink" TEXT NOT NULL DEFAULT '/membership/apply';

-- CreateTable NavigationItem
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

-- CreateIndex
CREATE INDEX IF NOT EXISTS "NavigationItem_menuType_idx" ON "NavigationItem"("menuType");
CREATE INDEX IF NOT EXISTS "NavigationItem_sortOrder_idx" ON "NavigationItem"("sortOrder");