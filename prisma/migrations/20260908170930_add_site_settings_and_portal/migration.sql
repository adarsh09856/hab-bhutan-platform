-- AlterTable
ALTER TABLE "Craft" ADD COLUMN "dzongkha" TEXT,
ADD COLUMN "bannerUrl" TEXT,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "announcementText" TEXT NOT NULL DEFAULT 'CSO/2011/043 · Handicrafts Association of Bhutan · Apex Civil Society Organization',
    "announcementLink" TEXT,
    "isAnnouncementOn" BOOLEAN NOT NULL DEFAULT true,
    "tagline" TEXT NOT NULL DEFAULT 'Towards a vibrant & sustainable handicrafts sector',
    "heroParagraph" TEXT NOT NULL,
    "heroCtaPrimaryText" TEXT NOT NULL DEFAULT 'Our mission',
    "heroCtaPrimaryLink" TEXT NOT NULL DEFAULT '/about',
    "heroCtaSecondaryText" TEXT NOT NULL DEFAULT 'Shop the crafts ->',
    "heroCtaSecondaryLink" TEXT NOT NULL DEFAULT '/shop',
    "stat1Number" TEXT NOT NULL DEFAULT '7,500',
    "stat1Label" TEXT NOT NULL DEFAULT 'Micro & small enterprises in the network',
    "stat2Number" TEXT NOT NULL DEFAULT '5,250',
    "stat2Label" TEXT NOT NULL DEFAULT 'Women-led enterprises',
    "stat3Number" TEXT NOT NULL DEFAULT '195',
    "stat3Label" TEXT NOT NULL DEFAULT 'Affiliated stores across Bhutan',
    "stat4Number" TEXT NOT NULL DEFAULT '13',
    "stat4Label" TEXT NOT NULL DEFAULT 'Arts & crafts of Zorig Chusum',
    "officeAddress" TEXT NOT NULL DEFAULT 'Metog Lam, Thimphu, Bhutan',
    "officePhone" TEXT NOT NULL DEFAULT '+975-2-338089',
    "edPhone" TEXT NOT NULL DEFAULT '+975-77654508',
    "marketingPhone" TEXT NOT NULL DEFAULT '+975-17462636 / 17881111',
    "officialEmail" TEXT NOT NULL DEFAULT 'officehab@gmail.com',
    "footerAbout" TEXT NOT NULL,
    "csoRegistration" TEXT NOT NULL DEFAULT 'CSO Registration: CSO/2011/043 · Thimphu, Kingdom of Bhutan',
    "copyrightText" TEXT NOT NULL DEFAULT '© 2026 Handicrafts Association of Bhutan. All rights reserved.',
    "punakhaMarketNotice" TEXT NOT NULL DEFAULT 'The only authentic crafts market validated and managed by HAB',
    "partnersList" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammePillar" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "activities" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgrammePillar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "activeDuesBTN" INTEGER NOT NULL DEFAULT 1200,
    "associateDuesBTN" INTEGER NOT NULL DEFAULT 2500,
    "institutionalDuesBTN" INTEGER NOT NULL DEFAULT 10000,
    "bankName" TEXT NOT NULL DEFAULT 'Bank of Bhutan (BoB)',
    "accountNumber" TEXT NOT NULL DEFAULT '200847291038',
    "accountTitle" TEXT NOT NULL DEFAULT 'Handicrafts Association of Bhutan',
    "mbobQrUrl" TEXT DEFAULT '/images/mbob_qr_placeholder.png',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammePillar_ref_key" ON "ProgrammePillar"("ref");

-- CreateIndex
CREATE INDEX "ProgrammePillar_sortOrder_idx" ON "ProgrammePillar"("sortOrder");