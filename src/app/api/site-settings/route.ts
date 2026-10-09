import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_VERBATIM } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    if (!setting) {
      setting = await prisma.siteSetting.create({
        data: {
          id: 'default',
          announcementText: 'CSO/2011/043 · Handicrafts Association of Bhutan · Apex Civil Society Organization',
          announcementLink: '/about',
          isAnnouncementOn: true,
          tagline: CLIENT_VERBATIM.tagline,
          heroParagraph: CLIENT_VERBATIM.heroPara,
          heroCtaPrimaryText: 'Our mission',
          heroCtaPrimaryLink: '/about',
          heroCtaSecondaryText: 'Shop the crafts →',
          heroCtaSecondaryLink: '/shop',
          stat1Number: CLIENT_VERBATIM.stats[0]?.n || '7,500',
          stat1Label: CLIENT_VERBATIM.stats[0]?.label || 'Micro & small enterprises in the network',
          stat2Number: CLIENT_VERBATIM.stats[1]?.n || '5,250',
          stat2Label: CLIENT_VERBATIM.stats[1]?.label || 'Women-led enterprises',
          stat3Number: CLIENT_VERBATIM.stats[2]?.n || '195',
          stat3Label: CLIENT_VERBATIM.stats[2]?.label || 'Affiliated stores across Bhutan',
          stat4Number: CLIENT_VERBATIM.stats[3]?.n || '13',
          stat4Label: CLIENT_VERBATIM.stats[3]?.label || 'Arts & crafts of Zorig Chusum',
          officeAddress: CLIENT_VERBATIM.contactBlock.address,
          officePhone: CLIENT_VERBATIM.contactBlock.office,
          secretaryPhone: '+975-2-338089',
          secretaryEmail: 'officehab@gmail.com',
          edPhone: CLIENT_VERBATIM.contactBlock.ed,
          marketingPhone: CLIENT_VERBATIM.contactBlock.marketing,
          officialEmail: CLIENT_VERBATIM.contactBlock.email,
          policyPopupEnabled: true,
          policyPopupText: 'Welcome to the Handicrafts Association of Bhutan. Please review our official policies on verified artisan standards, shipping, terms, and returns.',
          footerAbout: 'Handicrafts Association of Bhutan is the apex civil society organization stewarding Bhutan’s thirteen traditional arts and crafts (Zorig Chusum). We empower rural craftspeople, safeguard indigenous cultural heritage, and open international market access.',
          csoRegistration: 'CSO Registration: CSO/2011/043 · Thimphu, Kingdom of Bhutan',
          copyrightText: '© 2026 Handicrafts Association of Bhutan. All rights reserved.',
          punakhaMarketNotice: CLIENT_VERBATIM.punakhaMarket,
          partnersList: CLIENT_VERBATIM.partners,
          assurance1Title: 'Verified members only',
          assurance1Text: 'Every seller is a registered HAB member with documented craft credentials.',
          assurance2Title: 'Fair price, paid upfront',
          assurance2Text: 'HAB buys from the artisan at an agreed price before the piece is listed.',
          assurance3Title: 'Secure payment',
          assurance3Text: '3-D Secure cards, mBoB and bank transfer, in USD or Ngultrum.',
          assurance4Title: 'Tracked worldwide',
          assurance4Text: 'EMS via Bhutan Post with commercial invoice and craft certificate.',
          aboutBandTitle: 'A network built for the artisans, not the middlemen',
          aboutBandPara1: 'Handicrafts Association of Bhutan (HAB) plays a critical role in the Bhutanese handicrafts sector. We work towards creating a vibrant, sustainable, and inclusive craft ecosystem by bridging traditional techniques with modern markets, and ensuring fair compensation for our artisans.',
          aboutBandPara2: 'Our nationwide network supports more than 7,500 micro and small craft enterprises — 70% women-led — across all twenty dzongkhags. We provide capacity building, quality certification, and direct market access through our physical outlets and international e-shop.',
          aboutBandImageUrl: '/assets/photos/about-hab.jpg',
          aboutBandImageCaption: 'photo — HAB training workshop',
          aboutBandCtaText: 'Read about our programmes →',
          aboutBandCtaLink: '/programmes',
          membershipLeftTitle: 'Find a member',
          membershipLeftText: 'Connect directly with master craftspeople, verified weaving clusters, and traditional workshops across Bhutan.',
          membershipLeftCtaText: 'Search member directory →',
          membershipLeftCtaLink: '/members',
          membershipRightTitle: 'Become a member',
          membershipRightText: 'Access product consignment in our central shop, participate in donor training programmes, and represent your craft in international trade fairs.',
          membershipRightCtaText: 'Apply for membership',
          membershipRightCtaLink: '/membership/apply',
        },
      });
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
      defaultCurrency,
      defaultLanguage,
      supportedCurrencies,
      supportedLanguages,
      fxRate,
      aboutBannerImage: tb.aboutBannerImage || setting?.aboutBandImageUrl || '/assets/photos/about-hab.jpg',
      aboutBannerPosition: tb.aboutBannerPosition || 'center 12%',
      tickerMessages,
      topBarContactMode: tb.topBarContactMode || 'PHONE_ONLY',
      bobAccountNumber: bobBanking.accountNumber || setting?.checkoutAccountNumber || '200847291038',
      bobAccountTitle: bobBanking.accountTitle || setting?.checkoutAccountTitle || 'Handicrafts Association of Bhutan',
      bobBankName: bobBanking.bankName || setting?.checkoutBankName || 'Bank of Bhutan (BoB)',
      bobPhone: bobBanking.phone || '+975-2-338089',
      bobQrUrl: bobBanking.qrUrl || '',
      bnbAccountNumber: bnbBanking.accountNumber || '0000028471019',
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

    const fallback = {
      announcementText: 'CSO/2011/043 · Handicrafts Association of Bhutan',
      announcementLink: '/about',
      isAnnouncementOn: true,
        tagline: CLIENT_VERBATIM.tagline,
        heroParagraph: CLIENT_VERBATIM.heroPara,
        heroCtaPrimaryText: 'Our mission',
        heroCtaPrimaryLink: '/about',
        heroCtaSecondaryText: 'Shop the crafts →',
        heroCtaSecondaryLink: '/shop',
        stat1Number: '7,500',
        stat1Label: 'Micro & small enterprises in the network',
        stat2Number: '5,250',
        stat2Label: 'Women-led enterprises',
        stat3Number: '195',
        stat3Label: 'Affiliated stores across Bhutan',
        stat4Number: '13',
        stat4Label: 'Arts & crafts of Zorig Chusum',
        officeAddress: CLIENT_VERBATIM.contactBlock.address,
        officePhone: CLIENT_VERBATIM.contactBlock.office,
        secretaryPhone: CLIENT_VERBATIM.contactBlock.office,
        secretaryEmail: CLIENT_VERBATIM.contactBlock.email,
        topBarContactMode: 'PHONE_ONLY',
        tickerMessages: [
          {
            text: 'CSO/2011/043 · Handicrafts Association of Bhutan',
            dzText: 'CSO/2011/043 · འབྲུག་གི་ལག་བཟོ་ཚོགས་པ',
            link: '/about',
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
        ],
        edPhone: CLIENT_VERBATIM.contactBlock.ed,
        marketingPhone: CLIENT_VERBATIM.contactBlock.marketing,
        officialEmail: CLIENT_VERBATIM.contactBlock.email,
        footerAbout: 'Handicrafts Association of Bhutan is the apex civil society organization stewarding Bhutan’s traditional crafts.',
        csoRegistration: 'CSO Registration: CSO/2011/043 · Thimphu, Kingdom of Bhutan',
        copyrightText: '© 2026 Handicrafts Association of Bhutan. All rights reserved.',
        punakhaMarketNotice: CLIENT_VERBATIM.punakhaMarket,
        partnersList: CLIENT_VERBATIM.partners,
        assurance1Title: 'Verified members only',
        assurance1Text: 'Every seller is a registered HAB member with documented craft credentials.',
        assurance2Title: 'Fair price, paid upfront',
        assurance2Text: 'HAB buys from the artisan at an agreed price before the piece is listed.',
        assurance3Title: 'Secure payment',
        assurance3Text: '3-D Secure cards, mBoB and bank transfer, in USD or Ngultrum.',
        assurance4Title: 'Tracked worldwide',
        assurance4Text: 'EMS via Bhutan Post with commercial invoice and craft certificate.',
        aboutBandTitle: 'A network built for the artisans, not the middlemen',
        aboutBandPara1: 'Handicrafts Association of Bhutan (HAB) plays a critical role in the Bhutanese handicrafts sector. We work towards creating a vibrant, sustainable, and inclusive craft ecosystem by bridging traditional techniques with modern markets, and ensuring fair compensation for our artisans.',
        aboutBandPara2: 'Our nationwide network supports more than 7,500 micro and small craft enterprises — 70% women-led — across all twenty dzongkhags. We provide capacity building, quality certification, and direct market access through our physical outlets and international e-shop.',
        aboutBandImageUrl: '/assets/photos/about-hab.jpg',
        aboutBandImageCaption: 'photo — HAB training workshop',

        aboutBandCtaText: 'Read about our programmes →',
        aboutBandCtaLink: '/programmes',
        membershipLeftTitle: 'Find a member',
        membershipLeftText: 'Connect directly with master craftspeople, verified weaving clusters, and traditional workshops across Bhutan.',
        membershipLeftCtaText: 'Search member directory →',
        membershipLeftCtaLink: '/members',
        membershipRightTitle: 'Become a member',
        membershipRightText: 'Access product consignment in our central shop, participate in donor training programmes, and represent your craft in international trade fairs.',
        membershipRightCtaText: 'Apply for membership',
        membershipRightCtaLink: '/membership/apply',
        aboutBannerImage: '/assets/photos/about-hab.jpg',
        aboutBannerPosition: 'center 12%',
        defaultCurrency: 'USD',
        defaultLanguage: 'en',
        supportedCurrencies: ['USD', 'BTN'],
        supportedLanguages: ['en', 'dz'],
        fxRate: 84.0,
        bobAccountNumber: '200847291038',
        bobAccountTitle: 'Handicrafts Association of Bhutan',
        bobBankName: 'Bank of Bhutan (BoB)',
        bobPhone: '+975-2-338089',
        bobQrUrl: '',
        bnbAccountNumber: '0000028471019',
        bnbAccountTitle: 'Handicrafts Association of Bhutan',
        bnbBankName: 'Bhutan National Bank Limited (BNB)',
        bnbPhone: '+975-2-338089',
        bnbQrUrl: '',
        homepageSectionOrder: null,
        shopEyebrow: 'Latest arrivals',
        shopHeading: 'New in the shop',
        shopLede: 'A working mix across the thirteen crafts, newest first — bought from the member at an agreed price and sold centrally by HAB.',
        shopCtaText: 'Visit the shop →',
        shopCtaLink: '/shop',
        shopProductCodes: [],
      };
      const response = NextResponse.json({
        success: true,
        setting: fallback,
        settings: fallback,
      });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
}
