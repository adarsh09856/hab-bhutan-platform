'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { removeRepeatedLead } from '@/lib/display-copy';
import { selectFeaturedProducts } from '@/lib/featured-products';
import { CARD_PAYMENT_UNAVAILABLE_COPY, MEMBERSHIP_PAYMENT_COPY, removeUnavailableCardClaim } from '@/lib/payment-display';
import { useCart } from '@/context/CartContext';
import { CLIENT_VERBATIM } from '@/lib/data';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import OutletGallery from '@/components/public/OutletGallery';
import UniversalLiveSectionEditor, { SectionType } from '@/components/public/UniversalLiveSectionEditor';


interface HeroSlide {
  id: string;
  imageUrl: string;
  caption: string;
  altText?: string;
  linkUrl?: string | null;
}

const DEFAULT_HOMEPAGE_SECTION_ORDER: string[] = [
  'hero',
  'stats',
  'buy',
  'about',
  'shop',
  'assurance',
  'outlets',
  'crafts',
  'masters',
  'programmes',
  'support',
  'membership',
  'news',
  'publications',
  'partners',
];

export default function HomePage() {
  const router = useRouter();
  const { currency, fmt } = useCurrency();
  const { language, t } = useLanguage();
  const isDz = language === 'dz';
  const { addToCart } = useCart();

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroSlidesState, setHeroSlidesState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [currentHero, setCurrentHero] = useState(0);

  const [siteSettings, setSiteSettings] = useState({
    tagline: CLIENT_VERBATIM.tagline,
    heroParagraph: CLIENT_VERBATIM.heroPara,
    heroEyebrow: 'Civil Society Organization · Bhutan',
    heroCtaPrimaryText: 'Meet the Makers →',
    heroCtaPrimaryLink: '/masters',
    assurance1Title: 'Tracked Origin',
    assurance1Text: 'Materials, makers, and worldwide shipping are 100% traceable.',
    assurance2Title: 'Registered Chain',
    assurance2Text: 'Every artisan, supplier, and input is strictly verified.',
    assurance3Title: 'Upfront & Fair',
    assurance3Text: 'Pre-paid artisan pricing cuts out unethical markups.',
    assurance4Title: 'Tracked worldwide',
    assurance4Text: 'EMS via Bhutan Post with commercial invoice and craft certificate.',
    stats: [
      { value: '7,500', label: 'Micro & small enterprises in the network', url: '/members' },
      { value: '5,250', label: 'Women-led enterprises', url: '/members' },
      { value: '195', label: 'Affiliated stores across Bhutan', url: '/outlets' },
      { value: '13', label: 'Arts & crafts of Zorig Chusum', url: '/shop' },
    ],
    aboutBandTitle: 'A network built for artisans and everyone who brings a craft to market',
    aboutBandPara1: 'HAB is dedicated to establishing a strong network for Bhutanese artisans that guarantees fair compensation for their handcrafted products and improved market accessibility. The organization not only invests in training and resources to enhance the quality of handmade crafts, but also advocates for the sector through dialogue with policymakers.',
    aboutBandPara2: 'HAB plays a critical role in the Bhutanese handicraft industry, with a network of 7,500 micro and small enterprises across the country — women-led (5,250) and men-led (2,250), formal and informal — and 195 affiliated stores exhibiting more than 100 unique handcrafted products.',
    aboutBandImageUrl: '/assets/photos/about-hab.jpg',
    aboutBandImageCaption: 'photo — HAB training workshop',
    punakhaMarketNotice: CLIENT_VERBATIM.punakhaMarket,
    membershipLeftTitle: 'Find a member',
    membershipLeftText: 'Search the thirteen crafts, our award-winning craftspeople, the artisan clusters and everything in the shop.',
    membershipRightTitle: 'Become a member',
    membershipRightText: MEMBERSHIP_PAYMENT_COPY,
    membershipRightCtaText: 'Apply for membership',
    shopEyebrow: 'Latest arrivals',
    shopHeading: 'New in the shop',
    shopLede: 'A working mix across the thirteen crafts, newest first — bought from the member at an agreed price and sold centrally by HAB.',
    shopCtaText: 'Visit the shop →',
    shopCtaLink: '/shop',
    shopProductCodes: [] as string[],
    partnersList: CLIENT_VERBATIM.partners,
    homepageSectionOrder: DEFAULT_HOMEPAGE_SECTION_ORDER,
  });

  const [productsState, setProductsState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [allProductsPool, setAllProductsPool] = useState<any[]>([]);
  const [productOffset, setProductOffset] = useState(0);

  const [allOutletsPool, setAllOutletsPool] = useState<any[]>([]);
  const [outletOffset, setOutletOffset] = useState(0);

  const [outletsState, setOutletsState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [clusters, setClusters] = useState<any[]>([]);
  const [clustersState, setClustersState] = useState<'loading' | 'ready' | 'error'>('loading');

  const displayedProducts = React.useMemo(() => {
    const pool = allProductsPool;
    if (pool.length === 0) return [];
    const selection = selectFeaturedProducts(siteSettings.shopProductCodes, pool);
    if (selection.manual) return selection.products;
    const count = Math.min(8, pool.length);
    const res = [];
    for (let i = 0; i < count; i++) {
      res.push(pool[(productOffset + i) % pool.length]);
    }
    return res;
  }, [allProductsPool, productOffset, siteSettings.shopProductCodes]);

  const displayedOutlets = React.useMemo(() => {
    const pool = allOutletsPool;
    if (pool.length === 0) return [];
    const count = Math.min(3, pool.length);
    const res = [];
    for (let i = 0; i < count; i++) {
      res.push(pool[(outletOffset + i) % pool.length]);
    }
    return res;
  }, [allOutletsPool, outletOffset]);

  const [masters, setMasters] = useState<any[]>([]);

  const [supportPillars, setSupportPillars] = useState<any[]>([]);
  const [supportPillarsState, setSupportPillarsState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [craftsList, setCraftsList] = useState<any[]>([]);
  const [craftsState, setCraftsState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [punakhaOutlet, setPunakhaOutlet] = useState<any>(null);

  const [programmes, setProgrammes] = useState<any[]>([]);
  const [programmesState, setProgrammesState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [news, setNews] = useState<any[]>([]);
  const [newsState, setNewsState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [events, setEvents] = useState<any[]>([]);
  const [eventsState, setEventsState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [publications, setPublications] = useState<any[]>([]);
  const [publicationsState, setPublicationsState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [liveEditorOpen, setLiveEditorOpen] = useState(false);
  const [liveEditorType, setLiveEditorType] = useState<SectionType>('hero');
  const [liveEditorTitle, setLiveEditorTitle] = useState('');
  const [liveEditorStudio, setLiveEditorStudio] = useState('');

  const openQuickEdit = (type: SectionType, title?: string, studio?: string) => {
    setLiveEditorType(type);
    setLiveEditorTitle(title || '');
    setLiveEditorStudio(studio || '');
    setLiveEditorOpen(true);
  };

  // 1. Dynamic API Bindings for Secretariat Admin Controls
  useEffect(() => {
    // A. Hero Slides from Admin
    const loadHeroSlides = () => {
      fetch('/api/hero-slides', { cache: 'no-store' })
        .then((r) => {
          if (!r.ok) throw new Error('Homepage slides unavailable');
          return r.json();
        })
        .then((d) => {
          if (!d?.success || !Array.isArray(d.slides)) throw new Error('Homepage slides unavailable');
          setHeroSlides(d.slides);
          setCurrentHero(0);
          setHeroSlidesState('ready');
        })
        .catch(() => setHeroSlidesState('error'));
    };

    // B. Site Settings from Admin
    const loadSiteSettings = () => {
      fetch('/api/site-settings', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          if (d?.setting) {
            setSiteSettings((prev) => ({
              ...prev,
              tagline: d.setting.tagline || prev.tagline,
              heroParagraph: d.setting.heroParagraph || prev.heroParagraph,
              heroEyebrow: d.setting.heroEyebrow || prev.heroEyebrow,
              heroCtaPrimaryText: d.setting.heroCtaPrimaryText || prev.heroCtaPrimaryText,
              heroCtaPrimaryLink: d.setting.heroCtaPrimaryLink || prev.heroCtaPrimaryLink,
              assurance1Title: d.setting.assurance1Title || prev.assurance1Title,
              assurance1Text: d.setting.assurance1Text || prev.assurance1Text,
              assurance2Title: d.setting.assurance2Title || prev.assurance2Title,
              assurance2Text: d.setting.assurance2Text || prev.assurance2Text,
              assurance3Title: d.setting.assurance3Title || prev.assurance3Title,
              assurance3Text: removeUnavailableCardClaim(d.setting.assurance3Text, CARD_PAYMENT_UNAVAILABLE_COPY),
              assurance4Title: /escrow|\bsecure\b|payment/i.test(d.setting.assurance4Title || '') ? prev.assurance4Title : (d.setting.assurance4Title || prev.assurance4Title),
              assurance4Text: removeUnavailableCardClaim(d.setting.assurance4Text, prev.assurance4Text),
              stats: [
                { value: d.setting.stat1Number || '7,500', label: d.setting.stat1Label || 'Micro & small enterprises in the network', url: '/members' },
                { value: d.setting.stat2Number || '5,250', label: d.setting.stat2Label || 'Women-led enterprises', url: '/members' },
                { value: d.setting.stat3Number || '195', label: d.setting.stat3Label || 'Affiliated stores across Bhutan', url: '/outlets' },
                { value: d.setting.stat4Number || '13', label: d.setting.stat4Label || 'Arts & crafts of Zorig Chusum', url: '/shop' },
              ],
              aboutBandTitle: d.setting.aboutBandTitle || prev.aboutBandTitle,
              aboutBandPara1: d.setting.aboutBandPara1 || prev.aboutBandPara1,
              aboutBandPara2: d.setting.aboutBandPara2 || prev.aboutBandPara2,
              aboutBandImageUrl: d.setting.aboutBandImageUrl || prev.aboutBandImageUrl,
              aboutBandImageCaption: d.setting.aboutBandImageCaption || prev.aboutBandImageCaption,
              punakhaMarketNotice: d.setting.punakhaMarketNotice || prev.punakhaMarketNotice,
              membershipLeftTitle: d.setting.membershipLeftTitle || prev.membershipLeftTitle,
              membershipLeftText: d.setting.membershipLeftText || prev.membershipLeftText,
              membershipRightTitle: d.setting.membershipRightTitle || prev.membershipRightTitle,
              membershipRightText: removeUnavailableCardClaim(d.setting.membershipRightText, MEMBERSHIP_PAYMENT_COPY),
              membershipRightCtaText: d.setting.membershipRightCtaText || prev.membershipRightCtaText,
              shopEyebrow: d.setting.shopEyebrow || prev.shopEyebrow,
              shopHeading: d.setting.shopHeading || prev.shopHeading,
              shopLede: d.setting.shopLede || prev.shopLede,
              shopCtaText: d.setting.shopCtaText || prev.shopCtaText,
              shopCtaLink: d.setting.shopCtaLink || prev.shopCtaLink,
              shopProductCodes: Array.isArray(d.setting.shopProductCodes) ? d.setting.shopProductCodes.map(String).slice(0, 8) : [],
              partnersList: Array.isArray(d.setting.partnersList) && d.setting.partnersList.length > 0 ? d.setting.partnersList : prev.partnersList,
              homepageSectionOrder: Array.isArray(d.setting.homepageSectionOrder) && d.setting.homepageSectionOrder.length > 0 ? d.setting.homepageSectionOrder : prev.homepageSectionOrder,
            }));
          }
        })
        .catch(() => {});
    };

    loadHeroSlides();
    loadSiteSettings();

    // C. Products from Admin (up to 24 products for continuous 5-second dynamic rotation)
    fetch('/api/products?limit=24', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Product catalogue unavailable');
        return r.json();
      })
      .then((d) => {
        if (!d?.success || !Array.isArray(d.products)) throw new Error('Product catalogue unavailable');
        const mappedProducts = d.products.map((p: any) => ({
            ...p,
            price: p.priceUSD || p.price || 0,
            priceUSD: p.priceUSD || p.price || 0,
            craft_name: (p.craft?.name || p.craftKey || '').toUpperCase(),
            image_path: p.image_path || p.imageUrl || p.images?.[0]?.url || '/assets/photos/image-unavailable.svg',
          }));
        setAllProductsPool(mappedProducts);
        setProductsState('ready');
      })
      .catch(() => setProductsState('error'));

    // Outlets from Admin for continuous 5-second dynamic rotation
    fetch('/api/outlets?shuffle=false', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Outlet directory unavailable');
        return r.json();
      })
      .then((d) => {
        if (!d?.success || !Array.isArray(d.outlets)) throw new Error('Outlet directory unavailable');
        const mappedOutlets = d.outlets.map((outlet: any) => ({
          ...outlet,
          image_path: outlet.imageUrl || '/assets/photos/image-unavailable.svg',
          galleryImages: outlet.galleryImages || [],
        }));
        setAllOutletsPool(mappedOutlets);
        setPunakhaOutlet(mappedOutlets.find((outlet: any) => outlet.key === 'punakha-market') || null);
        setOutletsState('ready');
      })
      .catch(() => setOutletsState('error'));

    // D. Clusters from Admin
    fetch('/api/clusters', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Cluster directory unavailable');
        return r.json();
      })
      .then((d) => {
        if (!d?.success || !Array.isArray(d.clusters)) throw new Error('Cluster directory unavailable');
        setClusters(d.clusters.slice(0, 3).map((cluster: any) => ({
          ...cluster,
          image_path: cluster.imageUrl || '/assets/photos/image-unavailable.svg',
          meta: Number(cluster.members) > 0 ? `${cluster.members} members` : '',
        })));
        setClustersState('ready');
      })
      .catch(() => setClustersState('error'));

    // E. Honours & Masters from Admin (mapped accurately to prevent blank badges and duplicate Taktsang photos)
    fetch('/api/honours', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Honours directory unavailable');
        return r.json();
      })
      .then((d) => {
        if (d?.masters && d.masters.length > 0) {
          const formattedMasters = d.masters
            .filter((m: any) => typeof m?.name === 'string' && m.name.trim() && !/^(name to confirm|to be confirmed|undefined|null)$/i.test(m.name.trim()))
            .slice(0, 3)
            .map((m: any) => {
            const details = [m.craft, m.dzongkhag, m.yearAwarded ? `Since ${m.yearAwarded}` : null].filter((value) => typeof value === 'string' && value.trim());
            const awardLabel = m.awardType === 'NationalMaster' 
              ? 'National Craft Award' 
              : (m.awardType === 'RoyalSeal' ? 'Master Craftsperson' : (m.honour || 'Master Craftsperson'));
            return {
              name: m.name.trim(),
              honour: awardLabel,
              meta: details.join(' · '),
              note: m.citation || m.note || '',
              image_path: m.portraitUrl || '',
              slot: `photo — ${m.name}`,
            };
          });
          setMasters(formattedMasters);
        }
      })
      .catch(() => setMasters([]));

    // F. Programmes from Admin (ONLY 1 row = 3 cards)
    fetch('/api/programmes', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Programmes unavailable');
        return r.json();
      })
      .then((d) => {
        if (!d?.success || !Array.isArray(d.pillars)) throw new Error('Programmes unavailable');
        const mappedProgrammes = d.pillars.slice(0, 3).map((p: any) => ({
            ref: p.ref || 'a',
            title: p.title,
            description: p.description,
            url: `/programmes/${p.ref || 'a'}`,
          }));
        setProgrammes(mappedProgrammes);
        setProgrammesState('ready');
      })
      .catch(() => setProgrammesState('error'));

    // G. News from Admin
    fetch('/api/news', { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data?.success === false) throw new Error('News unavailable');
        return data;
      })
      .then((d) => {
        if (Array.isArray(d?.articles)) {
          const mappedNews = d.articles.slice(0, 3).map((a: any) => ({
            id: a.id,
            slug: a.slug || a.id,
            kind: a.kind || 'Notice',
            title: a.title,
            blurb: a.blurb || a.summary || '',
            date: a.dateString || a.date || a.published_at || '',
            published_at: a.dateString || a.published_at || '',
            image_path: a.image_path || a.imageUrl || '',
          }));
          setNews(mappedNews);
        }
        setNewsState('ready');
      })
      .catch(() => setNewsState('error'));

    // H. Upcoming events come only from saved records with an explicit future start date.
    fetch('/api/events', { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data?.success === false) throw new Error('Events unavailable');
        return data;
      })
      .then((d) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = (Array.isArray(d?.events) ? d.events : [])
          .map((event: any) => ({ event, date: event.startDate ? new Date(event.startDate) : null }))
          .filter(({ event, date }: { event: any; date: Date | null }) =>
            date && !Number.isNaN(date.getTime()) && date >= today && typeof event.title === 'string' && event.title.trim(),
          )
          .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
          .slice(0, 3)
          .map(({ event, date }: { event: any; date: Date }) => ({
            day: String(date.getDate()).padStart(2, '0'),
            mon: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
            title: event.title,
            place: event.place || event.location || event.venue || '',
            time: event.time || '',
            url: event.url || `/events/${event.key || event.id}`,
          }));
        setEvents(upcoming);
        setEventsState('ready');
      })
      .catch(() => setEventsState('error'));

    // I. Publications from Admin
    const loadPublications = () => {
      fetch('/api/publications?featured=true', { cache: 'no-store' })
        .then((r) => {
          if (!r.ok) throw new Error('Publications unavailable');
          return r.json();
        })
        .then((d) => {
          if (!d?.success || !Array.isArray(d.publications)) throw new Error('Publications unavailable');
          const mapped = d.publications.filter((p: any) => p.isFeatured !== false).slice(0, 4).map((p: any) => ({
            ...p,
            kind: p.kind || 'Publication',
            meta: p.metaDetails || p.meta || '',
            file_url: p.fileUrl || p.file_url || '',
          }));
          setPublications(mapped);
          setPublicationsState('ready');
        })
        .catch(() => setPublicationsState('error'));
    };
    loadPublications();

    // J. Crafts from Admin
    fetch('/api/crafts', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Craft catalogue unavailable');
        return r.json();
      })
      .then((d) => {
        if (!d?.success || !Array.isArray(d.crafts)) throw new Error('Craft catalogue unavailable');
        setCraftsList(d.crafts);
        setCraftsState('ready');
      })
      .catch(() => setCraftsState('error'));

    // K. Support Pillars from Admin
    fetch('/api/support-pillars', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Support information unavailable');
        return r.json();
      })
      .then((d) => {
        if (!d?.success || !Array.isArray(d.pillars)) throw new Error('Support information unavailable');
        const mapped = d.pillars.map((p: any) => {
            const isGrassroots = p.key === 'grassroots';
            const description = p.description || p.body || '';
            const line = p.tagline || p.line || (description ? `${description.split('.')[0]}.` : '');
            return {
              key: p.key,
              letter: isGrassroots ? 'leaf' : '',
              title: p.title,
              line,
              body: removeRepeatedLead(line, description),
            };
          });
        setSupportPillars(mapped);
        setSupportPillarsState('ready');
      })
      .catch(() => setSupportPillarsState('error'));

    // Listen for live updates broadcast from admin studios
    window.addEventListener('hab:hero-slides-updated', loadHeroSlides);
    window.addEventListener('hab:settings-updated', loadSiteSettings);
    window.addEventListener('hab:publication-updated', loadPublications);
    window.addEventListener('hab:content-updated', loadPublications);

    return () => {
      window.removeEventListener('hab:hero-slides-updated', loadHeroSlides);
      window.removeEventListener('hab:settings-updated', loadSiteSettings);
      window.removeEventListener('hab:publication-updated', loadPublications);
      window.removeEventListener('hab:content-updated', loadPublications);
    };
  }, []);

  // Carousel Timers
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const t = setInterval(() => {
      setCurrentHero((c) => (c + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  // 5-second continuous auto-rotation for Shop Products
  useEffect(() => {
    const poolLength = allProductsPool.length;
    if (poolLength <= 1) return;
    const t = setInterval(() => {
      setProductOffset((prev) => (prev + 1) % poolLength);
    }, 5000);
    return () => clearInterval(t);
  }, [allProductsPool.length]);

  // 5-second continuous auto-rotation for Outlets
  useEffect(() => {
    const poolLength = allOutletsPool.length;
    if (poolLength <= 1) return;
    const t = setInterval(() => {
      setOutletOffset((prev) => (prev + 1) % poolLength);
    }, 5000);
    return () => clearInterval(t);
  }, [allOutletsPool.length]);

  const handleMemberSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberSearchTerm.trim()) {
      router.push(`/members?q=${encodeURIComponent(memberSearchTerm.trim())}`);
    } else {
      router.push('/members');
    }
  };

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const currentOrder = [
      ...(Array.isArray(siteSettings.homepageSectionOrder) && siteSettings.homepageSectionOrder.length > 0
        ? siteSettings.homepageSectionOrder
        : DEFAULT_HOMEPAGE_SECTION_ORDER),
    ];
    const idx = currentOrder.indexOf(sectionId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentOrder.length) return;

    const temp = currentOrder[idx];
    currentOrder[idx] = currentOrder[targetIdx];
    currentOrder[targetIdx] = temp;

    setSiteSettings((prev) => ({
      ...prev,
      homepageSectionOrder: currentOrder,
    }));

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hab_homepage_section_order', JSON.stringify(currentOrder));
      }
    } catch {}

    try {
      await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homepageSectionOrder: currentOrder,
        }),
      });
      window.dispatchEvent(new CustomEvent('hab:settings-updated'));
    } catch (err) {
      console.warn('Failed to save section order to API:', err);
    }
  };

  const getMoveProps = (sectionId: string) => {
    const order =
      Array.isArray(siteSettings.homepageSectionOrder) && siteSettings.homepageSectionOrder.length > 0
        ? siteSettings.homepageSectionOrder
        : DEFAULT_HOMEPAGE_SECTION_ORDER;
    const idx = order.indexOf(sectionId);
    return {
      onMoveUp: () => handleMoveSection(sectionId, 'up'),
      onMoveDown: () => handleMoveSection(sectionId, 'down'),
      canMoveUp: idx > 0,
      canMoveDown: idx !== -1 && idx < order.length - 1,
    };
  };

  const sectionComponents: Record<string, React.ReactNode> = {
    'hero': (
<section className="section hero relative" data-hab-section="hero">
        <SectionEditBadge
          label="Hero & Mission"
          studioHref="/admin/hero"
          onQuickEdit={() => openQuickEdit('hero', 'Hero Section & Mission', '/admin/hero')}
          {...getMoveProps('hero')}
        />
        <div className="hero__copy">
          <p className="eyebrow eyebrow--accent">{isDz ? t('home.hero_eyebrow', 'འབྲུག་གི་མི་སྡེ་ཚོགས་པ') : siteSettings.heroEyebrow}</p>
          <h1 className="display display--hero">{isDz ? t('home.hero_tagline', 'འབྲུག་གི་ལག་བཟོ་སྡེ་ཚན་གྱི་གོང་འཕེལ་དང་ཡུན་བརྟན') : siteSettings.tagline}</h1>
          <p className="lede">
            {isDz ? t('home.hero_intro', 'འབྲུག་ལག་བཟོ་ཚོགས་པ་གིས་ ས་གནས་ཀྱི་ལག་བཟོ་པ་ཚུ་ལུ་ རྒྱལ་ཁབ་ནང་དང་ཕྱི་རྒྱལ་གྱི་ཁྲོམ་ར་ནང་ ལག་བཟོ་ཚུ་ཁྱབ་སྤེལ་གཏང་ནི་ལུ་རྒྱབ་སྐྱོར་འབདཝ་ཨིན། དེ་མ་ཚད་ ལག་བཟོ་པ་ཚུའི་རིག་རྩལ་གོང་འཕེལ་དང་ནུས་ཤུགས་ཡར་སེང་ལུ་ཡང་རྒྱབ་སྐྱོར་འབདཝ་ཨིན།') : <>
              Handicrafts Association of Bhutan supports <Link href="/members">local artisans</Link> in promoting their handicrafts in markets both within Bhutan and internationally, and supports <Link href="/programmes">skills development and capacity building</Link> of the craftspeople.
            </>}
          </p>
          <div className="actions flex flex-wrap items-center gap-3">
            <Link className="btn btn--ink" href="/about">
              {isDz ? 'ང་བཅས་ཀྱི་དམིགས་ཡུལ' : (siteSettings.heroCtaPrimaryText || 'Our mission')}
            </Link>
            <Link className="btn btn--outline" href="/shop">
              {isDz ? 'ལག་བཟོ་ཚོང་ཉོ →' : ((siteSettings as any).heroCtaSecondaryText || 'Shop the crafts →')}
            </Link>
            <Link className="font-semibold text-[#8B2E24] hover:underline px-2 text-sm sm:text-base cursor-pointer" href="/members">
              {isDz ? 'འཐུས་མི་འཚོལ' : 'Find a member'}
            </Link>
          </div>
        </div>

        <div className="hero__visual">
          <figure className="frame frame--hero has-image relative overflow-hidden rounded-[16px] shadow-sm group">
            <img
              src={heroSlides[currentHero]?.imageUrl || '/assets/photos/image-unavailable.svg'}
              alt={heroSlides[currentHero]?.altText || heroSlides[currentHero]?.caption || ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(event) => { (event.currentTarget as HTMLImageElement).src = '/assets/photos/image-unavailable.svg'; }}
            />

            {heroSlides.length === 0 && (
              <p className="absolute inset-x-4 bottom-4 z-10 rounded-lg bg-black/60 px-3 py-2 text-sm text-white" role={heroSlidesState === 'error' ? 'alert' : 'status'}>
                {heroSlidesState === 'loading' ? 'Loading homepage images…' : heroSlidesState === 'error' ? 'Homepage images are temporarily unavailable.' : 'No homepage images have been published yet.'}
              </p>
            )}

            {/* Gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Top-right slide counter & craft tag */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-2">
              <span className="font-mono text-[10px] sm:text-[11px] text-white/90 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
                {currentHero + 1} / {heroSlides.length}
              </span>
            </div>

            {/* Bottom caption overlay */}
            {heroSlides[currentHero]?.caption && (
              <div className="absolute bottom-11 sm:bottom-12 left-3 sm:left-4 right-14 z-10 pointer-events-none">
                <span className="inline-block text-[11px] sm:text-xs text-white/95 font-medium bg-black/60 backdrop-blur-xs px-3 py-1 rounded-lg border border-white/15 line-clamp-1 shadow-sm">
                  {heroSlides[currentHero].caption}
                </span>
              </div>
            )}

            {/* Navigation Chevrons */}
            {heroSlides.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentHero((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
                  className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center text-lg sm:text-xl z-10 transition-all backdrop-blur-xs cursor-pointer select-none border border-white/10"
                  aria-label="Previous slide"
                  type="button"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentHero((prev) => (prev + 1) % heroSlides.length)}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center text-lg sm:text-xl z-10 transition-all backdrop-blur-xs cursor-pointer select-none border border-white/10"
                  aria-label="Next slide"
                  type="button"
                >
                  ›
                </button>
              </>
            )}

            {/* Floating bottom-left dots pill — Dynamic for all slides */}
            {heroSlides.length > 1 && (
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xs max-w-[85%] overflow-x-auto no-scrollbar border border-white/10">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    className={`h-2 rounded-full transition-all cursor-pointer flex-shrink-0 ${
                      i === currentHero
                        ? 'bg-[#8B2E24] w-4.5 ring-1 ring-white/60'
                        : 'bg-white/60 hover:bg-white w-2'
                    }`}
                    onClick={() => setCurrentHero(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    type="button"
                  />
                ))}
              </div>
            )}
          </figure>
        </div>
      </section>
    ),
    'stats': (
<section className="section section--tight relative" data-hab-section="stats">
        <SectionEditBadge
          label="Stats & Impact Counters"
          studioHref="/admin/site-settings"
          onQuickEdit={() => openQuickEdit('stats', 'Stats & Impact Counters', '/admin/site-settings')}
          {...getMoveProps('stats')}
        />
        <div className="stats">
          {siteSettings.stats.map((st, idx) => (
            <Link key={idx} href={st.url} className="stats__cell" style={{ color: 'inherit' }}>
              <span className="stats__num">{st.value}</span>
              <span className="stats__label">{isDz ? t(`home.stat_${idx + 1}`, st.label) : st.label}</span>
            </Link>
          ))}
        </div>
      </section>
    ),
    'buy': (
<section className="section section--tight relative" id="buy" data-hab-section="buy">
        <SectionEditBadge
          label="Retail & Trade Gateway"
          studioHref="/admin/trade"
          onQuickEdit={() => openQuickEdit('buy', 'Retail & Trade Gateways', '/admin/trade')}
          {...getMoveProps('buy')}
        />
        <div className="buyband">
          <div className="buyband__copy">
            <p className="eyebrow eyebrow--accent">{isDz ? 'ཉོ་ཐངས་ལམ་ལུགས་གཉིས' : 'Two ways to buy'}</p>
            <h2 className="display display--sub">{isDz ? 'སྡེབ་ཚོང་དང་ཆོས་ཉོ' : 'Retail or trade'}</h2>
          </div>
          <div className="buyband__actions">
            <Link className="buybtn" href="/shop">
              <span className="buybtn__label">{isDz ? 'ཆོས་ཉོ' : 'Retail'}</span>
              <span className="buybtn__name">{isDz ? 'གློག་རྡུལ་ཚོང་ཁང་ནང་གཟིགས' : 'Visit the e-shop'}</span>
              <span className="buybtn__note">{isDz ? 'འཛམ་གླིང་ཡོངས་ལུ་སྐྱེལ་འདྲེན་ཡོད' : 'Single pieces, shipped worldwide'}</span>
            </Link>
            <Link className="buybtn buybtn--trade" href="/wholesale">
              <span className="buybtn__label">{isDz ? 'སྡེབ་ཚོང' : 'Trade'}</span>
              <span className="buybtn__name">{isDz ? 'སྡེབ་ཚོང་དང་བཀའ་རྒྱ་ཆེན་པོ' : 'Wholesale & bulk'}</span>
              <span className="buybtn__note">{isDz ? 'ཚོང་འབྲེལ་རིན་གོང་གནང་ཡོད' : 'Trade pricing on approval'}</span>
            </Link>
          </div>
        </div>
      </section>
    ),
    'about': (
<section className="band relative" id="about" data-hab-section="about">
        <SectionEditBadge
          label="About HAB Band"
          studioHref="/admin/pages/about"
          onQuickEdit={() => openQuickEdit('about', 'About HAB Band', '/admin/pages/about')}
          {...getMoveProps('about')}
        />

        <div className="band__inner about">
          <div>
            <p className="eyebrow eyebrow--brass">{isDz ? 'ང་བཅས་ཀྱི་སྐོར' : 'About us'}</p>
            <h2 className="display display--band">{isDz ? 'འབྲུག་གི་ལག་བཟོ་ཚོགས་པ' : siteSettings.aboutBandTitle}</h2>
            <p className="band__body">{isDz ? 'འབྲུག་ལག་བཟོ་ཚོགས་པ་འདི་གིས་ ས་གནས་ཀྱི་ལག་བཟོ་བ་ཚུ་ལུ་རྒྱབ་སྐྱོར་འབད་དེ་ རྒྱལ་ཁབ་ནང་འཁོད་དང་ རྒྱལ་སྤྱིའི་ཁྲོམ་རའི་ནང་ ལག་བཟོ་གོང་འཕེལ་གཏང་ནི་དང་ ལག་རྩལ་ཡར་རྒྱས་གཏང་ནི་ལུ་ ཕྱག་ཞུ་དོ་ཡོད།' : siteSettings.aboutBandPara1}</p>
            <p className="band__body">{isDz ? 'ང་བཅས་ཀྱིས་ འབྲུག་གི་སྔར་སྲོལ་ཟོ་རིག་བཅུ་གསུམ་གྱི་རིག་གཞུང་ཉམས་པ་སོར་ཆུད་དང་ མི་རབས་གསར་པ་ཚུ་ལུ་ ལག་རྩལ་སྤྲོད་ནིའི་ལས་རིམ་ཚུ་ འགོ་འདྲེན་འཐབ་ཨིན།' : siteSettings.aboutBandPara2}</p>
            <Link className="link-brass" href="/programmes">
              {isDz ? 'ལས་རིམ་སྐོར་ལྷག་པར་གཟིགས →' : 'Read about our programmes'}
            </Link>
          </div>
          <figure className="frame frame--square frame--dark">
            <img
              src={siteSettings.aboutBandImageUrl?.includes('training_workshop') ? '/assets/photos/about-hab.jpg' : (siteSettings.aboutBandImageUrl || '/assets/photos/about-hab.jpg')}
              alt={siteSettings.aboutBandImageCaption}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/about-hab.jpg'; }}
            />
          </figure>
        </div>
      </section>
    ),
    'shop': (
      <section className="section relative" id="shop" data-hab-section="shop">
        <SectionEditBadge
          label="Featured Crafts Shop"
          studioHref="/admin/products"
          onQuickEdit={() => openQuickEdit('products', 'New in the Shop (Latest Arrivals)', '/admin/products')}
          {...getMoveProps('shop')}
        />
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">{isDz ? t('home.latest_arrivals', 'Latest arrivals') : (siteSettings.shopEyebrow || t('home.latest_arrivals', 'Latest arrivals'))}</p>
            <h2 className="display display--band">{isDz ? t('home.new_in_shop', 'New in the shop') : (siteSettings.shopHeading || t('home.new_in_shop', 'New in the shop'))}</h2>
            <p className="section__lede">
              {isDz ? t('home.shop_intro', 'ཟོ་རིག་བཅུ་གསུམ་གྱི་ལག་བཟོ་ཅ་ཆས་གསར་ཤོས་ཚུ་འདིར་གཟིགས། HAB གིས་འཐུས་མི་ལས་གོང་ཚད་གཏན་འཁེལ་ཐོག་ཉོ་སྟེ་ ཚོང་ཁང་བརྒྱུད་དེ་ཚོང་འབྲེལ་འཐབ་ཨིན།') : (siteSettings.shopLede || 'A working mix across the thirteen crafts, newest first — bought from the member at an agreed price and sold centrally by HAB.')}
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href={siteSettings.shopCtaLink || '/shop'}>
            {isDz ? t('home.visit_shop', 'Visit the shop →') : (siteSettings.shopCtaText || t('home.visit_shop', 'Visit the shop →'))}
          </Link>
        </div>
        <div className="grid grid--4">
          {displayedProducts.map((p, pIdx) => {
            const displayPrice = p.priceUSD || p.price || 0;
            const productImg = p.image_path || p.imageUrl || p.images?.[0]?.url || '/assets/photos/image-unavailable.svg';
            const makerName = typeof p.maker === 'object' ? p.maker?.name : p.maker;
            return (
              <article key={`${p.code}-${pIdx}`} className="card product">
                <Link className="product__shot" href={`/product/${p.code}`}>
                  <figure className="frame frame--square has-image">
                    <img
                      src={productImg}
                      alt={productImg === '/images/crafts/thagzo.jpg' ? 'Illustrative photograph of Bhutanese weaving' : p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/photos/image-unavailable.svg'; }}
                    />
                  </figure>
                  <span className="product__ref">{p.code}</span>
                </Link>
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{p.craft_name || p.craftKey}</p>
                  <h3 className="card__title clamp-2">
                    <Link href={`/product/${p.code}`}>{p.name}</Link>
                  </h3>

                  {makerName && <p className="card__meta clamp-1">{makerName}</p>}
                  <div className="card__foot">
                    <span className="price">{fmt(displayPrice)}</span>
                    <button
                      className="btn btn--outline btn--xs"
                      type="button"
                      onClick={() => addToCart(p.code)}
                    >
                      {t('home.add_to_cart', 'Add')}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {displayedProducts.length === 0 && <p className="section__lede" role={productsState === 'error' ? 'alert' : 'status'}>
            {productsState === 'loading' ? 'Loading the shop catalogue…' : productsState === 'error' ? 'The shop catalogue is temporarily unavailable.' : 'No published products are available yet.'}
          </p>}
        </div>
      </section>
    ),
    'assurance': (
<section className="section section--tight relative" data-hab-section="assurance">
        <SectionEditBadge
          label="Trust & Assurances"
          studioHref="/admin/site-settings"
          onQuickEdit={() => openQuickEdit('assurances', 'Quality Assurances Band', '/admin/site-settings')}
          {...getMoveProps('assurance')}
        />
        <div className="assurance">
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">{isDz ? 'འ' : (siteSettings.assurance1Title?.charAt(0) || 'T')}</span>
              <span>{isDz ? 'བྱུང་ཁུངས་རྗེས་འདེད' : (siteSettings.assurance1Title ? siteSettings.assurance1Title.slice(1) : 'racked Origin')}</span>
            </h3>
            <p className="assurance__body">{isDz ? 'རྒྱུ་ཆ་དང་བཟོ་མི་ཚུ་ ༡༠༠% རྗེས་འདེད་འབད་བཏུབ།' : (siteSettings.assurance1Text || 'Materials, makers, and worldwide shipping are 100% traceable.')}</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">{isDz ? 'ཐ' : (siteSettings.assurance2Title?.charAt(0) || 'R')}</span>
              <span>{isDz ? 'ོ་བཀོད་འབྲེལ་མཐུད' : (siteSettings.assurance2Title ? siteSettings.assurance2Title.slice(1) : 'egistered Chain')}</span>
            </h3>
            <p className="assurance__body">{isDz ? 'ལག་བཟོ་པ་དང་མཁོ་སྤྲོད་པ་ཆ་མཉམ་ ཞིབ་བཤེར་འབད་ཡོད།' : (siteSettings.assurance2Text || 'Every artisan, supplier, and input is strictly verified.')}</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">{isDz ? 'ད' : (siteSettings.assurance3Title?.charAt(0) || 'U')}</span>
              <span>{isDz ? 'ྲང་བདེན་རིན་གོང' : (siteSettings.assurance3Title ? siteSettings.assurance3Title.slice(1) : 'pfront & Fair')}</span>
            </h3>
            <p className="assurance__body">{isDz ? 'ལག་བཟོ་པ་ཚུ་ལུ་ སྔོན་འགྲོའི་དྲང་བདེན་རིན་གོང་སྤྲོདཔ་ཨིན།' : (siteSettings.assurance3Text || 'Pre-paid artisan pricing cuts out unethical markups.')}</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">{isDz ? 'ཉ' : (siteSettings.assurance4Title?.charAt(0) || 'E')}</span>
              <span>{isDz ? 'འཛམ་གླིང་ཡོངས་ལུ་རྗེས་འདེད' : (siteSettings.assurance4Title ? siteSettings.assurance4Title.slice(1) : 'racked worldwide')}</span>
            </h3>
            <p className="assurance__body">{isDz ? 'འབྲུག་གི་སྤྲིངས་འབྱོར་ EMS ཞབས་ཏོག་བརྒྱུད་ལམ་བཏངམ་ཨིན། ཚོང་འབྲེལ་ཡིག་ཆ་དང་ལག་ཁྱེར་མཉམ་དུ་གཏངམ་ཨིན།' : siteSettings.assurance4Text}</p>
          </div>
        </div>
      </section>
    ),
    'outlets': (
<section className="section relative" id="outlets" data-hab-section="outlets">
        <SectionEditBadge label="Outlets & Punakha Market" studioHref="/admin/clusters-outlets" {...getMoveProps('outlets')} />

        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Visit us in person</p>
            <h2 className="display display--band">Our physical outlets &amp; clusters</h2>
            <p className="section__lede">
              Buy directly from the artisans, at the markets and clusters the association runs or validates.
            </p>
          </div>
          <Link className="link-accent" href="/shop">
            Or shop online →
          </Link>
        </div>

        {punakhaOutlet && (
          <article className="outlet-lead" id="outletLead">
            <OutletGallery image={punakhaOutlet.image_path} galleryImages={punakhaOutlet.galleryImages} name={punakhaOutlet.name} />
            <div className="outlet-lead__body">
              <p className="badge badge--ink">{punakhaOutlet.type || 'Outlet'}</p>
              <h3 className="display display--panel">{punakhaOutlet.name}</h3>
              {punakhaOutlet.place && <p className="outlet-lead__place">{punakhaOutlet.place}</p>}
              {(punakhaOutlet.description || punakhaOutlet.note) && (
                <p className="outlet-lead__desc">{punakhaOutlet.description || punakhaOutlet.note}</p>
              )}
              {(punakhaOutlet.hours || punakhaOutlet.stalls || punakhaOutlet.craftsOnSite || punakhaOutlet.payment) && (
                <div className="factgrid">
                  {punakhaOutlet.hours && <div className="factgrid__cell"><span className="factgrid__key">Hours</span><span className="factgrid__val clamp-2">{punakhaOutlet.hours}</span></div>}
                  {punakhaOutlet.stalls && <div className="factgrid__cell"><span className="factgrid__key">Stalls</span><span className="factgrid__val clamp-2">{punakhaOutlet.stalls}</span></div>}
                  {punakhaOutlet.craftsOnSite && <div className="factgrid__cell"><span className="factgrid__key">Crafts on site</span><span className="factgrid__val clamp-2">{punakhaOutlet.craftsOnSite}</span></div>}
                  {punakhaOutlet.payment && <div className="factgrid__cell"><span className="factgrid__key">Payment</span><span className="factgrid__val clamp-2">{punakhaOutlet.payment}</span></div>}
                </div>
              )}
              <div className="actions">
                <Link className="btn btn--accent" href={`/outlets/${punakhaOutlet.key}`}>View outlet</Link>
                <Link className="btn btn--text" href="/outlets">All outlets →</Link>
              </div>
            </div>
          </article>
        )}

        {/* Physical outlets grid (3 columns matching index.html lines 346-360 & Image 2) */}
        <div className="grid grid--3" style={{ marginBottom: '48px', marginTop: '32px' }}>
          {displayedOutlets.map((o, oIdx) => (
            <Link key={`${o.key}-${oIdx}`} className="card outlet" href={`/outlets/${o.key}`} style={{ color: 'inherit' }}>
              <figure className="frame frame--wide16">
                <img
                  src={o.image_path || '/assets/photos/image-unavailable.svg'}
                  alt={o.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/image-unavailable.svg'; }}
                />
                <figcaption className="frame__caption frame__caption--sm">{o.name}</figcaption>
              </figure>
              <div className="card__body">
                <span className="tag">{o.type || 'Outlet'}</span>
                <h3 className="card__title clamp-2">{o.name}</h3>
                {o.place && <p className="card__meta clamp-1">{o.place}</p>}
                {(o.note || o.description) && <p className="card__text clamp-3">{o.note || o.description}</p>}
                {o.hours && <p className="outlet__hours">{o.hours}</p>}
              </div>
            </Link>
          ))}
          {allOutletsPool.length === 0 && <p className="section__lede" role={outletsState === 'error' ? 'alert' : 'status'}>
            {outletsState === 'loading' ? 'Loading outlet directory…' : outletsState === 'error' ? 'Outlets are temporarily unavailable.' : 'No outlets have been published yet.'}
          </p>}
        </div>

        {/* Artisan clusters subhead */}
        <div className="subhead" id="clusters">
          <div>
            <p className="eyebrow eyebrow--accent">Artisan clusters</p>
            <p className="subhead__lede">
              A cluster is a village or valley where one craft is concentrated, and where members hold a common price, buy materials together and receive visitors.
            </p>
          </div>
          <Link className="btn btn--outline btn--sm" href="/clusters">
            Visit more clusters →
          </Link>
        </div>

        <div className="grid grid--3">
          {clusters.map((c) => (
            <Link key={c.key} className="card cluster" href={`/clusters/${c.key}`}>
              <figure className="frame frame--wide16">
                <img
                  src={c.image_path || '/assets/photos/image-unavailable.svg'}
                  alt={c.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/image-unavailable.svg'; }}
                />
              </figure>
              <div className="card__body">
                <p className="eyebrow eyebrow--accent eyebrow--sm">{c.craft_name || c.craftKey}</p>
                <h3 className="cluster__name">{c.name}</h3>
                <p className="cluster__place">{[c.dzongkhag, c.meta].filter(Boolean).join(' · ')}</p>
                <p className="card__text cluster__summary">{c.summary}</p>
                <p className="cluster__read">Read the story →</p>
              </div>
            </Link>
          ))}
          {clusters.length === 0 && <p className="section__lede" role={clustersState === 'error' ? 'alert' : 'status'}>
            {clustersState === 'loading' ? 'Loading artisan clusters…' : clustersState === 'error' ? 'Artisan clusters are temporarily unavailable.' : 'No artisan clusters have been published yet.'}
          </p>}
        </div>
      </section>
    ),
    'crafts': (
      <section className="section relative" id="crafts" data-hab-section="crafts">
        <SectionEditBadge label="13 Crafts of Bhutan" studioHref="/admin/crafts" {...getMoveProps('crafts')} />
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">{isDz ? 'བཟོ་རིག་བཅུ་གསུམ' : 'Zorig Chusum'}</p>
            <h2 className="display display--band">{isDz ? 'འབྲུག་གི་བཟོ་རིག་བཅུ་གསུམ' : 'The 13 arts & crafts of Bhutan'}</h2>
            <p className="section__lede">
              {isDz
                ? 'དུས་རབས་ ༡༧ པ་ལུ་ གཞུང་འབྲེལ་དབྱེ་ཁག་ཕྱེས་ཡོད་པའི་ ལག་བཟོ་བཅུ་གསུམ་གྱི་ ཐོན་སྐྱེད་ཚུ་ ཚོང་ཁང་ནང་ལས་ ཐད་ཀར་དུ་ཉོ་བཏུབ།'
                : 'First categorised in the 17th century. Each craft is a doorway into the shop — and into the members who practise it.'}
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/shop">
            {isDz ? 'ལག་བཟོ་ཆ་མཉམ་གཟིགས →' : 'Shop all crafts →'}
          </Link>
        </div>

        <div className="grid grid--auto">
          {craftsList.map((craft, idx) => {
            const num = String(idx + 1).padStart(2, '0');
            return (
              <article key={craft.key} className="card craft">
                <figure className="frame frame--wide16" style={{ position: 'relative' }}>
                  <span className="craft__num">{num} / 13</span>
                  <img
                  src={craft.image_path || craft.bannerUrl || '/assets/photos/image-unavailable.svg'}
                    alt={craft.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/image-unavailable.svg'; }}
                  />
                </figure>
                <div className="card__body">
                  <div className="craft__heading">
                    <h3 className="craft__name">{craft.name}</h3>
                    <span className="craft__en">{craft.english}</span>
                  </div>
                  <p className="card__text craft__desc">{craft.description}</p>
                  <div className="craft__foot">
                    <Link className="craft__about" href={`/craft/${craft.key}`}>
                      About this craft →
                    </Link>
                    <Link className="craft__shop" href={`/shop/${craft.key}`}>
                      Shop {craft.name}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
          {craftsList.length === 0 && <p className="section__lede" role={craftsState === 'error' ? 'alert' : 'status'}>
            {craftsState === 'loading' ? 'Loading the craft catalogue…' : craftsState === 'error' ? 'The craft catalogue is temporarily unavailable.' : 'No active crafts are available yet.'}
          </p>}
        </div>
      </section>
    ),
    'masters': (
      <section className="section relative" id="masters" data-hab-section="masters">
        <SectionEditBadge label="Living Treasures & Honours" studioHref="/admin/honours" {...getMoveProps('masters')} />
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">{isDz ? 'ཚོགས་པ་གིས་ངོས་འཛིན་འབད་ཡོད' : 'Recognised by the association'}</p>
            <h2 className="display display--band">{isDz ? 'མཁས་དབང་ལག་བཟོ་བ' : 'Master craftspeople'}</h2>
            <p className="section__lede">
              {isDz
                ? 'ཟོ་རིག་བཅུ་གསུམ་གྱི་ རིག་གནས་ལུ་མཁས་པའི་ རྒྱལ་ཡོངས་ལག་བཟོའི་གཟེངས་བསྟོད་ཐོབ་མི་ ཚོགས་མི་ཚུ།'
                : 'Members honoured for mastery of a Zorig Chusum craft, for national craft awards, and for the standards they set for everyone else working in it.'}
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/masters">
            {isDz ? 'མཁས་དབང་ཆ་མཉམ་གཟིགས →' : 'All recognised members →'}
          </Link>
        </div>

        {masters.length > 0 ? <div className="grid grid--3">
          {masters.map((m, idx) => (
            <Link key={idx} className="card honour" href="/masters" style={{ color: 'inherit' }}>
              {m.image_path && !/\/assets\/photos\/(?:hero-[^/]+|about-hab\.jpg)(?:[?#].*)?$/i.test(m.image_path) && (
                <figure className="frame frame--square has-image" style={{ position: 'relative', overflow: 'hidden' }}>
                  <img src={m.image_path} alt={`${m.name}, master craftsperson`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </figure>
              )}
              <div className="card__body">
                <span className="honour__badge">{m.honour}</span>
                <h3 className="card__title">{m.name}</h3>
                {m.meta && <p className="card__meta">{m.meta}</p>}
                {m.note && <p className="card__text clamp-3">{m.note}</p>}
              </div>
            </Link>
          ))}
        </div> : <p className="section__lede">{isDz ? 'ངོས་འཛིན་ཐོབ་པའི་མཁས་དབང་གི་གསལ་བཤད་ཚུ་གསར་བཅོས་འབད་དོ།' : 'Confirmed master-craftsperson profiles are being updated.'}</p>}
      </section>
    ),
    'programmes': (
      <section className="section relative" id="programmes" data-hab-section="programmes">
        <SectionEditBadge label="Training Programmes (A–K)" studioHref="/admin/programmes" {...getMoveProps('programmes')} />

        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">{isDz ? 'ལས་རིམ་དང་ལས་འགུལ' : 'Programmes & projects'}</p>
            <h2 className="display display--band">{isDz ? 'མི་ཚེ་སོར་བསྒྱུར་དང་ མི་སྡེ་གོང་འཕེལ' : 'Change lives, build a better community'}</h2>
            <p className="section__lede">
              {isDz
                ? 'ལས་རིམ་རེ་རེ་བཞིན་དུ་ འབྲུག་ལག་བཟོ་ཚོགས་པའི་ རྩ་ཁྲིམས་དོན་ཚན་ ༣.༢ པའི་དམིགས་ཡུལ་དང་འཁྲིལ་ཏེ་ ལག་ལེན་འཐབ་ཨིན།'
                : 'Every programme runs against one or more of the objects set out in Article 3.2 of the Articles of Association.'}
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/programmes">
            {isDz ? 'ལས་རིམ་ ༡༡ ཆ་མཉམ་གཟིགས →' : 'All eleven programme areas →'}
          </Link>
        </div>

        <div className="grid grid--3">
          {programmes.slice(0, 3).map((p, idx) => (
            <article key={p.ref || idx} className="card programme">
              <div className="programme__head">
                <span className="badge badge--ref">{String(p.ref || '').toUpperCase()}</span>
                <h3 className="card__title clamp-3">{p.title}</h3>
              </div>
              <p className="card__text programme__desc">{p.description}</p>
              <Link className="link-accent programme__toggle" href={`/programmes/${p.ref}`}>
                {isDz ? 'ལྷག་པར་གཟིགས →' : 'Read more →'}
              </Link>
            </article>
          ))}
          {programmes.length === 0 && <p className="section__lede" role={programmesState === 'error' ? 'alert' : 'status'}>
            {programmesState === 'loading' ? 'Loading programmes…' : programmesState === 'error' ? 'Programmes are temporarily unavailable.' : 'No active programmes have been published yet.'}
          </p>}
        </div>
      </section>
    ),
    'support': (
      <section className="section support relative" id="support" data-hab-section="support">
        <SectionEditBadge label="Donor Support Pillars" studioHref="/admin/donate-settings" sectionType="donate" {...getMoveProps('support')} />
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">{isDz ? 'རྒྱབ་སྐྱོར་གནང' : 'Support us'}</p>
            <h2 className="display display--band">{isDz ? 'འབྲུག་གི་གསོན་པོའི་རིག་གཞུང་ལུ་རྒྱབ་སྐྱོར་གནང' : 'Support the Living Heritage of Bhutan'}</h2>
            <p className="section__lede">
              {isDz
                ? 'ཁྱོད་ཀྱི་རྒྱབ་སྐྱོར་གྱིས་ གུང་གསེབ་ཀྱི་ལག་བཟོ་བ་ཚུ་ལུ་ ཐད་ཀར་རྒྱབ་སྐྱོར་དང་ སྔར་སྲོལ་ལག་རྩལ་ཉམས་སྲུང་འབད་ཚུགས།'
                : 'We empower the entire craft value chain. Your support directly sustains rural creators, safeguards ancestral arts, and protects our natural landscapes.'}
            </p>
          </div>
          <Link className="btn btn--accent" href="/donate">
            {isDz ? 'ད་ལྟོ་ཞལ་འདེབས་ཕུལ' : 'Donate now'}
          </Link>
        </div>

        <div className="pillars" id="supportPillars">
          {supportPillars.map((pillar) => {
            const isGrassroots = pillar.key === 'grassroots';
            return (
              <article key={pillar.key} className="pillar">
                <h3 className="pillar__title" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  {isGrassroots && (
                    <span
                      className="pillar__initial"
                      style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        color: 'var(--accent, #8b2500)',
                        fontWeight: 700,
                        letterSpacing: '0',
                      }}
                    >
                      leaf
                    </span>
                  )}
                  <span>{pillar.title}</span>
                </h3>
                <p className="pillar__line">{pillar.line}</p>
                <p className="pillar__body">{pillar.body}</p>
                <Link className="pillar__give" href={`/donate?pillar=${pillar.key}`}>
                  Give Now →
                </Link>
              </article>
            );
          })}
          {supportPillars.length === 0 && <p className="section__lede" role={supportPillarsState === 'error' ? 'alert' : 'status'}>
            {supportPillarsState === 'loading' ? 'Loading support information…' : supportPillarsState === 'error' ? 'Support information is temporarily unavailable.' : 'No support options have been published yet.'}
          </p>}
        </div>
      </section>
    ),
    'membership': (
      <section className="section relative" id="membership" data-hab-section="membership">
        <SectionEditBadge
          label="Artisan Directory & Apply"
          studioHref="/admin/members"
          onQuickEdit={() => openQuickEdit('membership', 'Membership Callouts', '/admin/membership-categories')}
          {...getMoveProps('membership')}
        />
        <div className="duo">
          <div className="panel">
            <p className="eyebrow eyebrow--muted">{isDz ? 'ལག་བཟོ་འཚོལ' : 'Search the crafts'}</p>
            <h3 className="display display--panel">{isDz ? 'ལག་བཟོ་དང་ བཟོ་མི་འཚོལ' : (siteSettings.membershipLeftTitle || 'Find a craft, a maker or a piece')}</h3>
            <p className="panel__body">
              {isDz
                ? 'བཟོ་རིག་བཅུ་གསུམ་དང་ གཟེངས་བསྟོད་ཐོབ་མི་ལག་བཟོ་པ ལག་བཟོའི་གླིང་ཚུ་ འཚོལ་ཞིབ་འབད།'
                : (siteSettings.membershipLeftText || 'Search the thirteen crafts, our award-winning craftspeople, the artisan clusters and everything in the shop.')}
            </p>
            <form className="inline-form" onSubmit={handleMemberSearch}>
              <label className="visually-hidden" htmlFor="memberSearch">Search crafts, makers, clusters and products</label>
              <input
                className="input"
                id="memberSearch"
                type="search"
                placeholder={isDz ? 'ཐག་བཟོ ལྷུན་རྩེ་ ཕོར་པ ཁོ་མ…' : 'Try weaving, Lhuentse, bowl, Khoma…'}
                autoComplete="off"
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
              />
              <button className="btn btn--ink" type="submit">{isDz ? 'འཚོལ་ཞིབ' : 'Search'}</button>
            </form>
          </div>
          <div className="panel panel--accent">
            <p className="eyebrow eyebrow--onaccent">{isDz ? 'འཐུས་མི་འགྱུར' : 'Join HAB'}</p>
            <h3 className="display display--panel display--onaccent">{isDz ? 'འཐུས་མིའི་ཐོ་བཀོད' : (siteSettings.membershipRightTitle || 'Become a member')}</h3>
            <p className="panel__body panel__body--onaccent">
              {isDz
                ? 'དྲ་ཐོག་ལས་ཞུ་བ་ཕུལ། ལོ་བསྟར་འཐུས་ mBoB ཡང་ན་དངུལ་ཁང་གི་སྤྲོད་ལམ་ཐོག་ལས་སྤྲོད། ད་ལྟོ་དྲ་ཐོག་ཀརཌི་སྤྲོད་ལམ་མི་འཐོབ།'
              : removeUnavailableCardClaim(siteSettings.membershipRightText, MEMBERSHIP_PAYMENT_COPY)}
            </p>
            <div className="actions">
              <Link className="btn btn--light" href="/register">
                {isDz ? 'འཐུས་མིའི་ཞུ་བ་ཕུལ' : (siteSettings.membershipRightCtaText || 'Apply for membership')}
              </Link>
              <Link className="btn btn--ghost" href="/login">
                {isDz ? 'འཐུས་མི་ནང་འཛུལ' : 'Member login'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    ),
    'news': (
      <section className="section relative" id="news" data-hab-section="news">
        <SectionEditBadge label="News & Events" studioHref="/admin/content" {...getMoveProps('news')} />
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">{isDz ? 'གནས་ཚུལ་ཁང' : 'Newsroom'}</p>
            <h2 className="display display--band">{isDz ? 'གནས་ཚུལ་དང་བྱུང་རིམ' : 'News, events & reports'}</h2>
            <p className="section__lede">
              {isDz
                ? 'འབྲུག་ལག་བཟོ་ཚོགས་པའི་ ལས་རིམ་དང་ སྦྱོང་བརྡར་ དེ་ལས་ བྱུང་རིམ་གྱི་གནས་ཚུལ་ཚུ།'
                : 'Dispatches from programmes, announcements of upcoming markets and trainings, and sector policy updates.'}
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/news">
            {isDz ? 'གནས་ཚུལ་ཆ་མཉམ་གཟིགས →' : 'All news & events →'}
          </Link>
        </div>

        <div className="newsrow">
          <div className="grid grid--3">
            {news.map((item, idx) => (
              <article key={item.slug || idx} className="card news">
                <figure className="frame frame--wide16">
                  <img
                    src={item.image_path || '/assets/photos/image-unavailable.svg'}
                    alt={item.image_path ? item.title : ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/image-unavailable.svg'; }}
                  />
                </figure>
                <div className="card__body">
                  <div className="news__meta">
                    <span className="tag">{item.kind || 'News'}</span>
                    {(item.date || item.published_at) && <span className="news__date">{item.date || item.published_at}</span>}
                  </div>
                  <h3 className="news__title clamp-2">{item.title}</h3>
                  <p className="card__text clamp-4">{item.blurb}</p>
                  <Link className="news__more" href={`/news/${item.slug}`}>
                    {isDz ? 'ལྷག་པར་གཟིགས →' : 'Read more →'}
                  </Link>
                </div>
              </article>
            ))}
            {news.length === 0 && (
              <p className="section__lede">
                {newsState === 'loading'
                  ? (isDz ? 'གསར་འགྱུར་འཚོལ་བཞིན་ཡོད།' : 'Loading updates…')
                  : newsState === 'error'
                    ? (isDz ? 'གསར་འགྱུར་ད་ལྟ་ལྟ་མི་ཚུགས།' : 'News is temporarily unavailable.')
                    : (isDz ? 'གསར་འགྱུར་ད་ལྟ་མེད།' : 'No published updates yet.')}
              </p>
            )}
          </div>

          <aside className="newsaside">
            <div className="newsaside__block">
              <div className="newsaside__head">
                <h3 className="newsaside__title">{isDz ? 'འབྱུང་ལ་ཉེ་བའི་བྱུང་རིམ' : 'Upcoming events'}</h3>
                <Link className="link-accent" href="/events">
                  {isDz ? 'བྱུང་རིམ་ཆ་མཉམ →' : 'All events →'}
                </Link>
              </div>
              <div>
                {events.map((ev, idx) => (
                  <Link key={idx} className="eventrow" href={ev.url || '/events'}>
                    <span className="eventrow__date">
                      <strong>{ev.day}</strong>
                      <span>{ev.mon}</span>
                    </span>
                    <span className="eventrow__body">
                      <span className="eventrow__title clamp-2">{ev.title}</span>
                      <span className="eventrow__place clamp-1">
                        {ev.place}{ev.time && ev.time !== 'All day' ? ` · ${ev.time}` : ''}
                      </span>
                    </span>
                  </Link>
                ))}
                {(eventsState !== 'ready' || events.length === 0) && (
                  <p className="newsaside__body">
                    {eventsState === 'loading'
                      ? (isDz ? 'བྱུང་རིམ་འཚོལ་བཞིན་ཡོད།' : 'Loading events…')
                      : eventsState === 'error'
                        ? (isDz ? 'བྱུང་རིམ་ད་ལྟ་ལྟ་མི་ཚུགས།' : 'Events are temporarily unavailable.')
                        : (isDz ? 'མ་འོངས་པའི་བྱུང་རིམ་བཀོད་མི་འདུག' : 'No upcoming events are listed yet.')}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    ),
    'publications': (
      <section className="section relative" id="publications" data-hab-section="publications">
        <SectionEditBadge label="Reports & Publications" studioHref="/admin/publications" {...getMoveProps('publications')} />
        <div className="rule-top">
          <div className="pubs">
            <div>
              <p className="eyebrow eyebrow--accent">{isDz ? 'འགན་འཁྲི' : 'Accountability'}</p>
              <h2 className="display display--sub">{isDz ? 'སྙན་ཞུ་དང་དཔེ་སྐྲུན' : 'Reports & publications'}</h2>
              <p className="section__lede">
                {isDz
                  ? 'འབྲུག་ལག་བཟོ་ཚོགས་པ་གིས་ ལོ་བསྟར་ལས་རིམ་གྲུབ་འབྲས་དང་ རྩིས་ཞིབ་སྙན་ཞུ་ཚུ་ དབྱིན་སྐད་དང་རྫོང་ཁ་གཉིས་ཆ་རའི་ནང་ དཔེ་སྐྲུན་འབདཝ་ཨིན།'
                  : 'HAB publishes programme outcomes, sector research and audited accounts every year, in English and Dzongkha.'}
              </p>
              <Link className="link-accent" href="/publications">
                {isDz ? 'དཔེ་སྐྲུན་ཆ་མཉམ་གཟིགས →' : 'All publications →'}
              </Link>
            </div>
            <div className="grid grid--2">
              {publications.slice(0, 4).map((pb, idx) => {
                const metaText = pb.metaDetails || pb.meta || '';
                const fileLink = pb.fileUrl || pb.file_url;
                const kindText = (pb.kind || 'Publication').replace(/^Latest\s*·\s*/i, '');
                return (
                  <Link key={pb.id || idx} className="card pub" href={fileLink || '/publications'}>
                    <span className="eyebrow eyebrow--accent eyebrow--sm">{kindText}</span>
                    <span className="pub__title clamp-3">{pb.title}</span>
                    {metaText && <span className="pub__meta">{metaText}{fileLink ? ' ↓' : ''}</span>}
                  </Link>
                );
              })}
              {publications.length === 0 && <p className="section__lede" role={publicationsState === 'error' ? 'alert' : 'status'}>
                {publicationsState === 'loading' ? 'Loading publications…' : publicationsState === 'error' ? 'Publications are temporarily unavailable.' : 'No featured publications are available yet.'}
              </p>}
            </div>
          </div>
        </div>
      </section>
    ),
    'partners': (
      <section className="section section--last relative" data-hab-section="partners">
        <SectionEditBadge label="Development Partners" studioHref="/admin/site-settings" {...getMoveProps('partners')} />

        <p className="eyebrow eyebrow--muted">{isDz ? 'གོང་འཕེལ་མཉམ་འབྲེལ་པ' : 'Development Partners'}</p>
        <div className="partners">
          {siteSettings.partnersList.map((partner: any, idx: number) => {
            const name = typeof partner === 'string' ? partner : partner.name;
            const logoUrl = typeof partner === 'object' ? (partner.logoUrl || partner.logo_path) : null;
            const websiteUrl = typeof partner === 'object' ? (partner.websiteUrl || partner.url) : null;

            const cell = (
              <div key={idx} className="partners__cell" title={name}>
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={name}
                    className="partners__logo"
                  />
                ) : (
                  <span className="partners__name">{name}</span>
                )}
              </div>
            );

            if (websiteUrl) {
              return (
                <a
                  key={idx}
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-90 transition-opacity"
                  title={`${name} — Visit partner site`}
                >
                  {cell}
                </a>
              );
            }

            return cell;
          })}
        </div>
      </section>
    ),
  };

  const activeOrder = Array.isArray(siteSettings.homepageSectionOrder) && siteSettings.homepageSectionOrder.length > 0
    ? siteSettings.homepageSectionOrder
    : DEFAULT_HOMEPAGE_SECTION_ORDER;

  return (
    <main id="main">
      {activeOrder.map((sectionId) => (
        <React.Fragment key={sectionId}>
          {sectionComponents[sectionId] || null}
        </React.Fragment>
      ))}

      <UniversalLiveSectionEditor
        isOpen={liveEditorOpen}
        onClose={() => setLiveEditorOpen(false)}
        sectionType={liveEditorType}
        sectionTitle={liveEditorTitle}
        onSaved={(updated) => {
          if (updated) {
            setSiteSettings((prev) => ({
              ...prev,
              ...updated,
              stats: [
                { value: updated.stat1Number || prev.stats[0]?.value, label: updated.stat1Label || prev.stats[0]?.label, url: '/members' },
                { value: updated.stat2Number || prev.stats[1]?.value, label: updated.stat2Label || prev.stats[1]?.label, url: '/members' },
                { value: updated.stat3Number || prev.stats[2]?.value, label: updated.stat3Label || prev.stats[2]?.label, url: '/outlets' },
                { value: updated.stat4Number || prev.stats[3]?.value, label: updated.stat4Label || prev.stats[3]?.label, url: '/shop' },
              ],
            }));
          }
        }}
      />
    </main>
  );
}
