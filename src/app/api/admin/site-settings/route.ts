import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff = user.roleSlug === 'super_admin' ||
                  user.roleSlug === 'staff_operator' ||
                  user.permissions?.includes('*') ||
                  user.permissions?.includes('content:edit');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
  return NextResponse.json({ success: true, setting });
}

// Resilient upsert helper that safely catches schema mismatches / ungenerated Prisma fields
async function safeUpsertSiteSetting(updateData: Record<string, any>, createData: Record<string, any>) {
  const curUpdate = { ...updateData };
  const curCreate = { ...createData };

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      return await prisma.siteSetting.upsert({
        where: { id: 'default' },
        update: curUpdate as any,
        create: curCreate as any,
      });
    } catch (err: any) {
      const msg = err?.message || '';
      // Match "Unknown argument `fieldName`" or "Unknown field `fieldName`"
      const unknownMatch = msg.match(/Unknown (?:argument|field) ['"`]?(\w+)['"`]?/i);
      if (unknownMatch && unknownMatch[1]) {
        const badField = unknownMatch[1];
        delete curUpdate[badField];
        delete curCreate[badField];
        console.warn(`[SiteSetting API] Prisma client schema drift: omitted unrecognized argument '${badField}' and retrying.`);
        continue;
      }
      throw err;
    }
  }
  return await prisma.siteSetting.findUnique({ where: { id: 'default' } });
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();

  try {
    const updatePayload: Record<string, any> = {
      ...(body.announcementText !== undefined && { announcementText: body.announcementText }),
      ...(body.announcementLink !== undefined && { announcementLink: body.announcementLink }),
      ...(body.isAnnouncementOn !== undefined && { isAnnouncementOn: Boolean(body.isAnnouncementOn) }),
      ...(body.tagline !== undefined && { tagline: body.tagline }),
      ...(body.heroParagraph !== undefined && { heroParagraph: body.heroParagraph }),
      ...(body.heroCtaPrimaryText !== undefined && { heroCtaPrimaryText: body.heroCtaPrimaryText }),
      ...(body.heroCtaPrimaryLink !== undefined && { heroCtaPrimaryLink: body.heroCtaPrimaryLink }),
      ...(body.heroCtaSecondaryText !== undefined && { heroCtaSecondaryText: body.heroCtaSecondaryText }),
      ...(body.heroCtaSecondaryLink !== undefined && { heroCtaSecondaryLink: body.heroCtaSecondaryLink }),
      ...(body.stat1Number !== undefined && { stat1Number: body.stat1Number }),
      ...(body.stat1Label !== undefined && { stat1Label: body.stat1Label }),
      ...(body.stat2Number !== undefined && { stat2Number: body.stat2Number }),
      ...(body.stat2Label !== undefined && { stat2Label: body.stat2Label }),
      ...(body.stat3Number !== undefined && { stat3Number: body.stat3Number }),
      ...(body.stat3Label !== undefined && { stat3Label: body.stat3Label }),
      ...(body.stat4Number !== undefined && { stat4Number: body.stat4Number }),
      ...(body.stat4Label !== undefined && { stat4Label: body.stat4Label }),
      ...(body.officeAddress !== undefined && { officeAddress: body.officeAddress }),
      ...(body.officePhone !== undefined && { officePhone: body.officePhone }),
      ...(body.edPhone !== undefined && { edPhone: body.edPhone }),
      ...(body.marketingPhone !== undefined && { marketingPhone: body.marketingPhone }),
      ...(body.officialEmail !== undefined && { officialEmail: body.officialEmail }),
      ...(body.footerAbout !== undefined && { footerAbout: body.footerAbout }),
      ...(body.csoRegistration !== undefined && { csoRegistration: body.csoRegistration }),
      ...(body.copyrightText !== undefined && { copyrightText: body.copyrightText }),
      ...(body.punakhaMarketNotice !== undefined && { punakhaMarketNotice: body.punakhaMarketNotice }),
      ...(body.partnersList !== undefined && { partnersList: body.partnersList }),
      // Homepage Assurances Band CMS
      ...(body.assurance1Title !== undefined && { assurance1Title: body.assurance1Title }),
      ...(body.assurance1Text !== undefined && { assurance1Text: body.assurance1Text }),
      ...(body.assurance2Title !== undefined && { assurance2Title: body.assurance2Title }),
      ...(body.assurance2Text !== undefined && { assurance2Text: body.assurance2Text }),
      ...(body.assurance3Title !== undefined && { assurance3Title: body.assurance3Title }),
      ...(body.assurance3Text !== undefined && { assurance3Text: body.assurance3Text }),
      ...(body.assurance4Title !== undefined && { assurance4Title: body.assurance4Title }),
      ...(body.assurance4Text !== undefined && { assurance4Text: body.assurance4Text }),
      // Homepage About Band CMS
      ...(body.aboutBandTitle !== undefined && { aboutBandTitle: body.aboutBandTitle }),
      ...(body.aboutBandPara1 !== undefined && { aboutBandPara1: body.aboutBandPara1 }),
      ...(body.aboutBandPara2 !== undefined && { aboutBandPara2: body.aboutBandPara2 }),
      ...(body.aboutBandImageUrl !== undefined && { aboutBandImageUrl: body.aboutBandImageUrl }),
      ...(body.aboutBandImageCaption !== undefined && { aboutBandImageCaption: body.aboutBandImageCaption }),
      ...(body.aboutBandCtaText !== undefined && { aboutBandCtaText: body.aboutBandCtaText }),
      ...(body.aboutBandCtaLink !== undefined && { aboutBandCtaLink: body.aboutBandCtaLink }),
      // Homepage Membership Callouts CMS
      ...(body.membershipLeftTitle !== undefined && { membershipLeftTitle: body.membershipLeftTitle }),
      ...(body.membershipLeftText !== undefined && { membershipLeftText: body.membershipLeftText }),
      ...(body.membershipLeftCtaText !== undefined && { membershipLeftCtaText: body.membershipLeftCtaText }),
      ...(body.membershipLeftCtaLink !== undefined && { membershipLeftCtaLink: body.membershipLeftCtaLink }),
      ...(body.membershipRightTitle !== undefined && { membershipRightTitle: body.membershipRightTitle }),
      ...(body.membershipRightText !== undefined && { membershipRightText: body.membershipRightText }),
      // Support & Logistics CMS
      ...(body.supportDispatchTitle !== undefined && { supportDispatchTitle: body.supportDispatchTitle }),
      ...(body.supportDispatchHeading !== undefined && { supportDispatchHeading: body.supportDispatchHeading }),
      ...(body.supportDispatchBody !== undefined && { supportDispatchBody: body.supportDispatchBody }),
      ...(body.supportDispatchSubtext !== undefined && { supportDispatchSubtext: body.supportDispatchSubtext }),
      ...(body.supportCustomsTitle !== undefined && { supportCustomsTitle: body.supportCustomsTitle }),
      ...(body.supportCustomsHeading !== undefined && { supportCustomsHeading: body.supportCustomsHeading }),
      ...(body.supportCustomsBody !== undefined && { supportCustomsBody: body.supportCustomsBody }),
      ...(body.supportCustomsSubtext !== undefined && { supportCustomsSubtext: body.supportCustomsSubtext }),
      ...(body.supportReturnsTitle !== undefined && { supportReturnsTitle: body.supportReturnsTitle }),
      ...(body.supportReturnsHeading !== undefined && { supportReturnsHeading: body.supportReturnsHeading }),
      ...(body.supportReturnsBody !== undefined && { supportReturnsBody: body.supportReturnsBody }),
      ...(body.supportReturnsSubtext !== undefined && { supportReturnsSubtext: body.supportReturnsSubtext }),
      // Gateways & Email Templates CMS
      ...(body.emailTemplates !== undefined && { emailTemplates: body.emailTemplates }),
      ...(body.paymentGateways !== undefined && { paymentGateways: body.paymentGateways }),
      // Wholesale & Bulk Orders CMS
      ...(body.wholesaleMoq !== undefined && { wholesaleMoq: Number(body.wholesaleMoq) || 5 }),
      ...(body.wholesaleLeadTime !== undefined && { wholesaleLeadTime: body.wholesaleLeadTime }),
      ...(body.wholesaleAssurances !== undefined && { wholesaleAssurances: body.wholesaleAssurances }),
      ...(body.wholesaleBuyerTypes !== undefined && { wholesaleBuyerTypes: body.wholesaleBuyerTypes }),
      ...(body.wholesaleTerms !== undefined && { wholesaleTerms: body.wholesaleTerms }),
      // Extended About Page CMS
      ...(body.aboutMandateText !== undefined && { aboutMandateText: body.aboutMandateText }),
      ...(body.aboutMandatePara2 !== undefined && { aboutMandatePara2: body.aboutMandatePara2 }),
      ...(body.aboutHistoryText !== undefined && { aboutHistoryText: body.aboutHistoryText }),
      ...(body.aboutObjectives !== undefined && { aboutObjectives: body.aboutObjectives }),
      ...(body.aboutValues !== undefined && { aboutValues: body.aboutValues }),
      ...(body.aboutStats !== undefined && { aboutStats: body.aboutStats }),
      // Extended Contact Page CMS
      ...(body.contactLede !== undefined && { contactLede: body.contactLede }),
      ...(body.contactDirections !== undefined && { contactDirections: body.contactDirections }),
      ...(body.contactDepartments !== undefined && { contactDepartments: body.contactDepartments }),
      ...(body.contactPoBox !== undefined && { contactPoBox: body.contactPoBox }),
      ...(body.contactHours !== undefined && { contactHours: body.contactHours }),
      // Extended Homepage Sections CMS
      ...(body.homeCraftIntro !== undefined && { homeCraftIntro: body.homeCraftIntro }),
      ...(body.homeClusterPromo !== undefined && { homeClusterPromo: body.homeClusterPromo }),
      ...(body.homeWholesalePromo !== undefined && { homeWholesalePromo: body.homeWholesalePromo }),
      ...(body.homeCsoText !== undefined && { homeCsoText: body.homeCsoText }),
      // Donate Page CMS
      ...(body.donateHeroTitle !== undefined && { donateHeroTitle: body.donateHeroTitle }),
      ...(body.donateHeroLede !== undefined && { donateHeroLede: body.donateHeroLede }),
      ...(body.donateTaxNotice !== undefined && { donateTaxNotice: body.donateTaxNotice }),
      // Checkout & Bank Wire CMS
      ...(body.checkoutBankName !== undefined && { checkoutBankName: body.checkoutBankName }),
      ...(body.checkoutAccountNumber !== undefined && { checkoutAccountNumber: body.checkoutAccountNumber }),
      ...(body.checkoutAccountTitle !== undefined && { checkoutAccountTitle: body.checkoutAccountTitle }),
      ...(body.checkoutSwiftCode !== undefined && { checkoutSwiftCode: body.checkoutSwiftCode }),
      ...(body.checkoutBankAddress !== undefined && { checkoutBankAddress: body.checkoutBankAddress }),
      // Shipping & Logistics Display CMS
      ...(body.shippingOriginText !== undefined && { shippingOriginText: body.shippingOriginText }),
      ...(body.shippingCarrierName !== undefined && { shippingCarrierName: body.shippingCarrierName }),
      ...(body.shippingTransitDays !== undefined && { shippingTransitDays: body.shippingTransitDays }),
      ...(body.shippingInsuranceNote !== undefined && { shippingInsuranceNote: body.shippingInsuranceNote }),
      // Order Confirmation & Post-Purchase CMS
      ...(body.orderConfirmationTitle !== undefined && { orderConfirmationTitle: body.orderConfirmationTitle }),
      ...(body.orderConfirmationLede !== undefined && { orderConfirmationLede: body.orderConfirmationLede }),
      ...(body.orderSupportEmail !== undefined && { orderSupportEmail: body.orderSupportEmail }),
      ...(body.orderSupportPhone !== undefined && { orderSupportPhone: body.orderSupportPhone }),
      // Global Trust & Authenticity Badges
      ...(body.trustBadges !== undefined && { trustBadges: body.trustBadges }),
    };

    const createPayload: Record<string, any> = {
      id: 'default',
      announcementText: body.announcementText || 'CSO/2011/043 · Handicrafts Association of Bhutan',
      announcementLink: body.announcementLink || '/about',
      isAnnouncementOn: body.isAnnouncementOn !== undefined ? Boolean(body.isAnnouncementOn) : true,
      tagline: body.tagline || 'Towards a vibrant & sustainable handicrafts sector',
      heroParagraph: body.heroParagraph || 'Handicrafts Association of Bhutan supports local artisans...',
      heroCtaPrimaryText: body.heroCtaPrimaryText || 'Our mission',
      heroCtaPrimaryLink: body.heroCtaPrimaryLink || '/about',
      heroCtaSecondaryText: body.heroCtaSecondaryText || 'Shop the crafts →',
      heroCtaSecondaryLink: body.heroCtaSecondaryLink || '/shop',
      stat1Number: body.stat1Number || '7,500',
      stat1Label: body.stat1Label || 'Micro & small enterprises in the network',
      stat2Number: body.stat2Number || '5,250',
      stat2Label: body.stat2Label || 'Women-led enterprises',
      stat3Number: body.stat3Number || '195',
      stat3Label: body.stat3Label || 'Affiliated stores across Bhutan',
      stat4Number: body.stat4Number || '13',
      stat4Label: body.stat4Label || 'Arts & crafts of Zorig Chusum',
      officeAddress: body.officeAddress || 'Metog Lam, Thimphu, Bhutan',
      officePhone: body.officePhone || '+975-2-338089',
      edPhone: body.edPhone || '+975-77654508',
      marketingPhone: body.marketingPhone || '+975-17462636 / 17881111',
      officialEmail: body.officialEmail || 'officehab@gmail.com',
      footerAbout: body.footerAbout || 'Handicrafts Association of Bhutan...',
      csoRegistration: body.csoRegistration || 'CSO Registration: CSO/2011/043',
      copyrightText: body.copyrightText || '© 2026 Handicrafts Association of Bhutan',
      punakhaMarketNotice: body.punakhaMarketNotice || 'Validated and managed by HAB',
      partnersList: body.partnersList || [],
      assurance1Title: body.assurance1Title || 'Verified members only',
      assurance1Text: body.assurance1Text || 'Every seller is a registered HAB member with documented craft credentials.',
      assurance2Title: body.assurance2Title || 'Fair price, paid upfront',
      assurance2Text: body.assurance2Text || 'HAB buys from the artisan at an agreed price before the piece is listed.',
      assurance3Title: body.assurance3Title || 'Secure payment',
      assurance3Text: body.assurance3Text || '3-D Secure cards, mBoB and bank transfer, in USD or Ngultrum.',
      assurance4Title: body.assurance4Title || 'Tracked worldwide',
      assurance4Text: body.assurance4Text || 'EMS via Bhutan Post with commercial invoice and craft certificate.',
      aboutBandTitle: body.aboutBandTitle || 'A network built for the artisans, not the middlemen',
      aboutBandPara1: body.aboutBandPara1 || 'Handicrafts Association of Bhutan (HAB) plays a critical role in the Bhutanese handicrafts sector. We work towards creating a vibrant, sustainable, and inclusive craft ecosystem by bridging traditional techniques with modern markets, and ensuring fair compensation for our artisans.',
      aboutBandPara2: body.aboutBandPara2 || 'Our nationwide network supports more than 7,500 micro and small craft enterprises — 70% women-led — across all twenty dzongkhags. We provide capacity building, quality certification, and direct market access through our physical outlets and international e-shop.',
      aboutBandImageUrl: body.aboutBandImageUrl || '/images/training_workshop.jpg',
      aboutBandImageCaption: body.aboutBandImageCaption || 'HAB artisan training workshop · Thimphu',
      aboutBandCtaText: body.aboutBandCtaText || 'Read about our programmes →',
      aboutBandCtaLink: body.aboutBandCtaLink || '/programmes',
      membershipLeftTitle: body.membershipLeftTitle || 'Find a member',
      membershipLeftText: body.membershipLeftText || 'Connect directly with master craftspeople, verified weaving clusters, and traditional workshops across Bhutan.',
      membershipLeftCtaText: body.membershipLeftCtaText || 'Search member directory →',
      membershipLeftCtaLink: body.membershipLeftCtaLink || '/members',
      membershipRightTitle: body.membershipRightTitle || 'Become a member',
      membershipRightText: body.membershipRightText || 'Access product consignment in our central shop, participate in donor training programmes, and represent your craft in international trade fairs.',
      membershipRightCtaText: body.membershipRightCtaText || 'Apply for membership',
      membershipRightCtaLink: body.membershipRightCtaLink || '/membership/apply',
      wholesaleMoq: Number(body.wholesaleMoq) || 5,
      wholesaleLeadTime: body.wholesaleLeadTime || '2-4 weeks',
    };

    const updated = await safeUpsertSiteSetting(updatePayload, createPayload);

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'SITE_SETTINGS_UPDATED',
      entityType: 'SiteSetting',
      entityId: 'default',
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error: any) {
    console.error('Error updating site settings:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to update site settings. If updating new fields, please run npx prisma generate on the server.' 
    }, { status: 500 });
  }
}