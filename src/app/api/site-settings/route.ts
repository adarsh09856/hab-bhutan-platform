import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CARD_PAYMENT_UNAVAILABLE_COPY, MEMBERSHIP_PAYMENT_COPY, removeUnavailableCardClaim } from '@/lib/payment-display';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    if (!setting) {
      return NextResponse.json(
        { success: false, error: 'Site settings have not been configured.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    if (setting) {
      if (!setting.aboutBandImageUrl || setting.aboutBandImageUrl.includes('training_workshop') || setting.aboutBandImageUrl.includes('placeholder')) {
        setting.aboutBandImageUrl = '/assets/photos/about-hab.jpg';
      }
      if (!setting.aboutBandImageCaption || setting.aboutBandImageCaption.includes('training_workshop')) {
        setting.aboutBandImageCaption = 'photo — HAB training workshop';
      }
    }
    
    // Extract localization safely from paymentGateways
    const pg = (setting?.paymentGateways as Record<string, any>) || {};
    const loc = pg.localization || {};
    const defaultCurrency = loc.defaultCurrency || 'USD';
    const defaultLanguage = loc.defaultLanguage || 'en';
    const supportedCurrencies = loc.supportedCurrencies || ['USD', 'BTN'];
    const supportedLanguages = loc.supportedLanguages || ['en', 'dz'];
    const fxRate = loc.fxRate || 84.0;

    const tb = (setting?.trustBadges as Record<string, any>) || {};
    const defaultTicker = [
      {
        text: setting?.announcementText || 'CSO/2011/043 · Handicrafts Association of Bhutan',
        dzText: 'CSO/2011/043 · འབྲུག་གི་ལག་བཟོ་ཚོགས་པ',
        link: setting?.announcementLink || '/about',
      },
      {
        text: 'Apex CSO Supporting 7,500+ Rural Artisans Across 20 Dzongkhags',
        dzText: 'རྫོང་ཁག་ ༢༠ གི་ གྲོང་གསེབ་ལག་བཟོ་པ་ ༧,༥༠༠+ ལུ་རྒྱབ་སྐྱོར་འབད་མི་ དབུ་འཁྲིད་ཚོགས་པ',
        link: '/about',
      },
      {
        text: 'Official Secretariat Hotline: +975-2-338089 · Thimphu',
        dzText: 'གཞུང་འབྲེལ་དྲུང་ཆེའི་ཡིག་ཚང་བརྒྱུད་འཕྲིན: +975-2-338089 · ཐིམ་ཕུག',
        link: '/contact',
      },
      {
        text: 'Track Orders Worldwide with Authentic Craft Certification',
        dzText: 'ངོ་མ་ཨིན་པའི་ལག་ཁྱེར་དང་བཅས་ འཛམ་གླིང་ཡོངས་ལུ་ བཀའ་རྒྱ་རྗེས་འདེད',
        link: '/track-order',
      },
    ];
    const tickerMessages = tb.tickerMessages && Array.isArray(tb.tickerMessages) && tb.tickerMessages.length > 0
      ? tb.tickerMessages
      : defaultTicker;

    const bobBanking = pg.bob || {};
    const bnbBanking = pg.bnb || {};

    const enriched = {
      ...setting,
      assurance3Text: removeUnavailableCardClaim(setting.assurance3Text, CARD_PAYMENT_UNAVAILABLE_COPY),
      assurance4Title: /escrow|secure\s+payment/i.test(setting.assurance4Title || '') ? 'Tracked worldwide' : setting.assurance4Title,
      assurance4Text: removeUnavailableCardClaim(setting.assurance4Text, 'EMS via Bhutan Post with commercial invoice and craft certificate.'),
      membershipRightText: removeUnavailableCardClaim(setting.membershipRightText, MEMBERSHIP_PAYMENT_COPY),
      defaultCurrency,
      defaultLanguage,
      supportedCurrencies,
      supportedLanguages,
      fxRate,
      aboutBannerImage: tb.aboutBannerImage || setting?.aboutBandImageUrl || '/assets/photos/about-hab.jpg',
      aboutBannerPosition: tb.aboutBannerPosition || 'center 12%',
      tickerMessages,
      topBarContactMode: tb.topBarContactMode || 'PHONE_ONLY',
      bobAccountNumber: pg.mbob?.accountNumber || bobBanking.accountNumber || setting?.checkoutAccountNumber || '',
      bobAccountTitle: bobBanking.accountTitle || setting?.checkoutAccountTitle || 'Handicrafts Association of Bhutan',
      bobBankName: bobBanking.bankName || setting?.checkoutBankName || 'Bank of Bhutan (BoB)',
      bobPhone: bobBanking.phone || '+975-2-338089',
      bobQrUrl: bobBanking.qrUrl || '',
      bnbAccountNumber: bnbBanking.accountNumber || '',
      bnbAccountTitle: bnbBanking.accountTitle || 'Handicrafts Association of Bhutan',
      bnbBankName: bnbBanking.bankName || 'Bhutan National Bank Limited (BNB)',
      bnbPhone: bnbBanking.phone || '+975-2-338089',
      bnbQrUrl: bnbBanking.qrUrl || '',
      homepageSectionOrder: (setting as any)?.homepageSectionOrder || (tb as any)?.homepageSectionOrder || null,
      shopEyebrow: tb.shopEyebrow || 'Latest arrivals',
      shopHeading: tb.shopHeading || 'New in the shop',
      shopLede: tb.shopLede || 'A working mix across the thirteen crafts, newest first — bought from the member at an agreed price and sold centrally by HAB.',
      shopCtaText: tb.shopCtaText || 'Visit the shop →',
      shopCtaLink: tb.shopCtaLink || '/shop',
      shopProductCodes: Array.isArray(tb.shopProductCodes) ? tb.shopProductCodes.map(String).slice(0, 8) : [],
    };

    const response = NextResponse.json({ success: true, setting: enriched, settings: enriched });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('Failed to load site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Site settings are temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
    }
}
