-- AlterTable SiteSetting
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportDispatchTitle" TEXT NOT NULL DEFAULT 'International Dispatch';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportDispatchHeading" TEXT NOT NULL DEFAULT 'EMS & Express Courier';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportDispatchBody" TEXT NOT NULL DEFAULT 'Orders are packaged at our Thimphu hub and dispatched via EMS Bhutan Post (7-14 days) or DHL Express (3-5 days). Orders over $200 qualify for free standard EMS shipping.';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportDispatchSubtext" TEXT NOT NULL DEFAULT 'Live tracking available at /track-order';

ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportCustomsTitle" TEXT NOT NULL DEFAULT 'Heritage Certification';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportCustomsHeading" TEXT NOT NULL DEFAULT 'Duty & Seal of Authenticity';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportCustomsBody" TEXT NOT NULL DEFAULT 'Each handicraft is officially certified under the 13 Traditional Arts & Crafts of Bhutan with an authenticity seal and export declaration. Import duties and taxes are subject to destination country regulations.';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportCustomsSubtext" TEXT NOT NULL DEFAULT 'Compliant with CSO Act 2007 Export Standards';

ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportReturnsTitle" TEXT NOT NULL DEFAULT 'Collector Guarantee';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportReturnsHeading" TEXT NOT NULL DEFAULT 'Returns & Replacements';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportReturnsBody" TEXT NOT NULL DEFAULT 'Because items are handcrafted by community artisans, organic variations are celebrated. If a piece arrives damaged in transit or exhibits craft defects, we arrange replacement or refund within 14 days.';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "supportReturnsSubtext" TEXT NOT NULL DEFAULT 'Contact officehab@gmail.com for claims';

ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "emailTemplates" JSONB;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "paymentGateways" JSONB;
