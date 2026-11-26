import prisma from '@/lib/prisma';
import { CLIENT_VERBATIM, publishedHeroParagraph, publishedHeroSecondaryText } from '@/lib/data';
import { CARD_PAYMENT_UNAVAILABLE_COPY, removeUnavailableCardClaim } from '@/lib/payment-display';
import { bhutanDayStartUtc } from '@/lib/trader-expiry';
import HomePageClient from './HomePageClient';

export const dynamic = 'force-dynamic';

const DEFAULT_HOMEPAGE_SECTION_ORDER = [
  'hero', 'stats', 'buy', 'about', 'shop', 'assurance', 'outlets', 'crafts',
  'masters', 'programmes', 'support', 'membership', 'news', 'publications', 'partners',
];

function homepageSettings(setting: any, publicTraderCount: number | null) {
  setting = setting || {};
  const fallback = (key: string, value: string) => setting[key] || value;
  const aboutImage = String(setting.aboutBandImageUrl || '');
  const aboutCaption = String(setting.aboutBandImageCaption || '');
  const membershipLeftTitle = String(setting.membershipLeftTitle || '');
  const membershipLeftText = String(setting.membershipLeftText || '');
  const membershipRightTitle = String(setting.membershipRightTitle || '');
  const membershipRightText = String(setting.membershipRightText || '');
  const membershipRightCtaText = String(setting.membershipRightCtaText || '');
  const partners = Array.isArray(setting.partnersList)
    ? setting.partnersList
    : CLIENT_VERBATIM.partners;
  const sectionOrder = Array.isArray(setting.homepageSectionOrder)
    ? setting.homepageSectionOrder.filter((item: unknown): item is string => typeof item === 'string')
    : DEFAULT_HOMEPAGE_SECTION_ORDER;
  const trustBadges = setting.trustBadges && typeof setting.trustBadges === 'object' && !Array.isArray(setting.trustBadges)
    ? setting.trustBadges as Record<string, unknown>
    : {};
  const savedPages = trustBadges.pageOverrides && typeof trustBadges.pageOverrides === 'object' && !Array.isArray(trustBadges.pageOverrides)
    ? trustBadges.pageOverrides as Record<string, unknown>
    : {};
  const homeOverrides = savedPages['/'] && typeof savedPages['/'] === 'object' && !Array.isArray(savedPages['/'])
    ? savedPages['/'] as Record<string, unknown>
    : {};
  const quickEditText = (section: string, selector: string, locale: 'text' | 'textDz' = 'text') => {
    const index = sectionOrder.indexOf(section);
    if (index < 0) return undefined;
    const override = homeOverrides[`main/main:1/section:${index + 1}/${selector}`];
    if (!override || typeof override !== 'object' || Array.isArray(override)) return undefined;
    const value = (override as Record<string, unknown>)[locale];
    return typeof value === 'string' ? value : undefined;
  };
  const quickEditField = (section: string, selector: string, field: string) => {
    const index = sectionOrder.indexOf(section);
    if (index < 0) return undefined;
    const override = homeOverrides[`main/main:1/section:${index + 1}/${selector}`];
    if (!override || typeof override !== 'object' || Array.isArray(override)) return undefined;
    const value = (override as Record<string, unknown>)[field];
    return typeof value === 'string' ? value : undefined;
  };

  return {
    tagline: quickEditText('hero', 'div:1/h1:1') ?? fallback('tagline', CLIENT_VERBATIM.tagline),
    taglineDz: quickEditText('hero', 'div:1/h1:1', 'textDz') || '',
    heroParagraph: publishedHeroParagraph(setting.heroParagraph),
    heroEyebrow: fallback('heroEyebrow', 'Civil Society Organization · Bhutan'),
    heroCtaPrimaryText: fallback('heroCtaPrimaryText', 'Our mission'),
    heroCtaPrimaryLink: fallback('heroCtaPrimaryLink', '/about'),
    heroCtaSecondaryText: publishedHeroSecondaryText(setting.heroCtaSecondaryText),
    heroCtaSecondaryLink: fallback('heroCtaSecondaryLink', '/shop'),
    assurance1Title: fallback('assurance1Title', 'Tracked Origin'),
    assurance1Text: fallback('assurance1Text', 'Materials, makers, and worldwide shipping are 100% traceable.'),
    assurance2Title: fallback('assurance2Title', 'Registered Chain'),
    assurance2Text: fallback('assurance2Text', 'Every artisan, supplier, and input is strictly verified.'),
    assurance3Title: fallback('assurance3Title', 'Upfront & Fair'),
    assurance3Text: removeUnavailableCardClaim(setting.assurance3Text, CARD_PAYMENT_UNAVAILABLE_COPY),
    assurance4Title: /escrow|\bsecure\b|payment/i.test(setting.assurance4Title || '')
      ? 'Tracked worldwide'
      : fallback('assurance4Title', 'Tracked worldwide'),
    assurance4Text: removeUnavailableCardClaim(setting.assurance4Text, 'EMS via Bhutan Post with commercial invoice and craft certificate.'),
    stats: [
      { value: setting.stat1Number || '7,500', label: setting.stat1Label || 'Micro & small enterprises in the network', url: '' },
      { value: setting.stat2Number || '5,250', label: setting.stat2Label || 'Women-led enterprises', url: '' },
      { value: publicTraderCount && publicTraderCount > 0 ? String(publicTraderCount) : '', label: 'Affiliated stores across Bhutan', url: publicTraderCount && publicTraderCount > 0 ? '/traders' : '' },
      { value: setting.stat4Number || '13', label: setting.stat4Label || 'Arts & crafts of Zorig Chusum', url: '/shop' },
    ],
    aboutBandTitle: quickEditText('about', 'div:1/div:1/h2:1') ?? fallback('aboutBandTitle', 'A network built for artisans and everyone who brings a craft to market'),
    aboutBandTitleDz: quickEditText('about', 'div:1/div:1/h2:1', 'textDz') || '',
    aboutBandPara1: fallback('aboutBandPara1', 'HAB is dedicated to establishing a strong network for Bhutanese artisans that guarantees fair compensation for their handcrafted products and improved market accessibility. The organization not only invests in training and resources to enhance the quality of handmade crafts, but also advocates for the sector through dialogue with policymakers.'),
    aboutBandPara2: fallback('aboutBandPara2', 'HAB plays a critical role in the Bhutanese handicraft industry, with a network of 7,500 micro and small enterprises across the country — women-led (5,250) and men-led (2,250), formal and informal — and a growing directory of registered traders.'),
    aboutBandImageUrl: quickEditField('about', 'div:1/figure:1/img:1', 'src') || (!aboutImage || /training_workshop|placeholder/i.test(aboutImage) ? '/assets/photos/about-hab.jpg' : aboutImage),
    aboutBandImageAlt: quickEditField('about', 'div:1/figure:1/img:1', 'alt') || '',
    aboutBandImageCaption: !aboutCaption || /training_workshop/i.test(aboutCaption) ? 'photo — HAB training workshop' : aboutCaption,
    punakhaMarketTitle: quickEditText('outlets', 'article:1/div:2/h3:1') || '',
    punakhaMarketNotice: quickEditText('outlets', 'article:1/div:2/p:3') || fallback('punakhaMarketNotice', CLIENT_VERBATIM.punakhaMarket),
    outletCardImageOverrides: {
      'thimphu-outlet': quickEditField('outlets', 'div:2/a:1/figure:1/img:1', 'src') || '',
    },
    clusterCardImageOverrides: {
      khoma: quickEditField('outlets', 'div:4/a:1/figure:1/img:1', 'src') || '',
      trashiyangtse: quickEditField('outlets', 'div:4/a:3/figure:1/img:1', 'src') || '',
    },
    homeNewsThirdImage: quickEditField('news', 'div:3/div:1/article:3/figure:1/img:1', 'src') || '',
    publicationCategoryOverrides: [1, 2, 3, 4].map((index) => ({
      text: quickEditField('publications', `div:1/div:1/div:2/a:${index}/span:1`, 'text') || '',
      href: quickEditField('publications', `div:1/div:1/div:2/a:${index}/span:1`, 'href') || '',
    })),
    partnerLogoOverrides: [1, 2, 3].map((index) => ({
      src: quickEditField('partners', `div:1/a:${index}/div:1/img:1`, 'src') || '',
      alt: quickEditField('partners', `div:1/a:${index}/div:1/img:1`, 'alt') || '',
      href: quickEditField('partners', `div:1/a:${index}/div:1/img:1`, 'href') || '',
    })),
    membershipLeftTitle: /^(?:trader directory|find a member)$/i.test(membershipLeftTitle)
      ? 'Find a registered trader'
      : fallback('membershipLeftTitle', 'Find a registered trader'),
    membershipLeftText: /master craftspeople|member directory|verified weaving clusters|national directory/i.test(membershipLeftText)
      ? 'Find HAB-verified shops and traders across Bhutan by craft, product or dzongkhag.'
      : fallback('membershipLeftText', 'Find HAB-verified shops and traders across Bhutan by craft, product or dzongkhag.'),
    membershipRightTitle: /member|artisan|craft|directory/i.test(membershipRightTitle)
      ? 'List your shop with HAB'
      : fallback('membershipRightTitle', 'List your shop with HAB'),
    membershipRightText: /membership|mBoB|annual dues|vetted member directory/i.test(membershipRightText)
      ? 'Registered traders get a verified listing, buyer introductions and a place in HAB’s trader directory.'
      : fallback('membershipRightText', 'Registered traders get a verified listing, buyer introductions and a place in HAB’s trader directory.'),
    membershipRightCtaText: /member|apply/i.test(membershipRightCtaText)
      ? 'Register as a trader'
      : fallback('membershipRightCtaText', 'Register as a trader'),
    shopEyebrow: fallback('shopEyebrow', 'Latest arrivals'),
    shopHeading: fallback('shopHeading', 'New in the shop'),
    shopLede: quickEditText('shop', 'div:1/div:1/p:2') ?? fallback('shopLede', 'A working mix across the thirteen crafts, newest first — bought from the member at an agreed price and sold centrally by HAB.'),
    shopLedeDz: quickEditText('shop', 'div:1/div:1/p:2', 'textDz') || '',
    outletsLede: quickEditText('outlets', 'div:1/div:1/p:2') || 'Buy directly from the artisans, at the markets and clusters the association runs or validates.',
    outletsLedeDz: quickEditText('outlets', 'div:1/div:1/p:2', 'textDz') || '',
    homeCraftIntro: quickEditText('crafts', 'div:1/div:1/p:2') || 'First categorised in the 17th century. Each craft is a doorway into the shop — and into the members who practise it.',
    homeCraftIntroDz: quickEditText('crafts', 'div:1/div:1/p:2', 'textDz') || '',
    programmesHeading: quickEditText('programmes', 'div:1/div:1/h2:1') || 'Change lives, build a better community',
    programmesHeadingDz: quickEditText('programmes', 'div:1/div:1/h2:1', 'textDz') || '',
    shopCtaText: fallback('shopCtaText', 'Visit the shop →'),
    shopCtaLink: fallback('shopCtaLink', '/shop'),
    shopProductCodes: Array.isArray(setting.shopProductCodes) ? setting.shopProductCodes.map(String).slice(0, 8) : [],
    partnersList: partners,
    homepageSectionOrder: sectionOrder.length ? sectionOrder : DEFAULT_HOMEPAGE_SECTION_ORDER,
  };
}

export default async function HomePage() {
  let initialSettings = {};
  let initialSetting: any = null;
  let initialHeroSlides: Array<{ id: string; imageUrl: string; caption: string; altText?: string; linkUrl?: string | null }> = [];
  let initialSettingsLoaded = false;
  let initialHeroSlidesLoaded = false;

  try {
    initialSetting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    // Treat homepage settings independently from hero media. A slide-query
    // failure must not make the client replace server-rendered copy later.
    initialSettingsLoaded = true;
  } catch (error) {
    console.error('Could not preload homepage settings:', error);
  }

  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, imageUrl: true, caption: true, altText: true, linkUrl: true },
    });
    initialHeroSlides = slides.map((slide) => ({
      ...slide,
      imageUrl: slide.imageUrl && !/placeholder/i.test(slide.imageUrl)
        ? slide.imageUrl
        : '/assets/photos/image-unavailable.svg',
      caption: slide.caption || '',
      altText: slide.altText || '',
    }));
    initialHeroSlidesLoaded = true;
  } catch (error) {
    console.error('Could not preload homepage slides:', error);
  }

  // The public directory count is computed on the server using the same
  // visibility and Bhutan-day expiry rules as /traders, so no stale CMS
  // number is rendered while the client hydrates.
  try {
    const publicTraderCount = await prisma.traderRecord.count({
      where: { isVisible: true, expiresAt: { gte: bhutanDayStartUtc() } },
    });
    initialSettings = homepageSettings(initialSetting, publicTraderCount);
  } catch {
    // Leave the count blank if its authoritative data source is unavailable.
    initialSettings = homepageSettings(initialSetting, null);
  }

  return (
    <HomePageClient
      initialSettings={initialSettings}
      initialHeroSlides={initialHeroSlides}
      initialSettingsLoaded={initialSettingsLoaded}
      initialHeroSlidesLoaded={initialHeroSlidesLoaded}
    />
  );
}
