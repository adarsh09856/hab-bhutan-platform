'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { CRAFTS, CLIENT_VERBATIM } from '@/lib/data';

interface HeroSlide {
  id: string;
  imageUrl: string;
  caption: string;
  altText?: string;
  linkUrl?: string | null;
}

const SCENE_POOL = [
  '/assets/photos/hero-1-weaving.jpg',
  '/assets/photos/hero-4-textiles.jpg',
  '/assets/photos/hero-5-desho.jpg',
  '/assets/photos/hero-3-clay.jpg',
  '/assets/photos/hero-2-punakha.jpg',
  '/assets/photos/about-hab.jpg',
];

const PRODUCT_POOL = [
  '/assets/photos/product-sad03.jpg',
  '/assets/photos/product-hhb01.jpg',
  '/assets/photos/product-lud01.jpg',
  '/assets/photos/product-cam01.jpg',
];

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    imageUrl: '/assets/photos/hero-1-weaving.jpg',
    caption: 'photo 1 — artisan at the loom, Khoma',
    altText: 'Artisan at the backstrap loom in Khoma, Lhuentse',
  },
  {
    id: 'hero-2',
    imageUrl: '/assets/photos/hero-2-punakha.jpg',
    caption: 'photo 2 — the Punakha crafts market, stalls and buyers',
    altText: 'The Punakha crafts market, stalls and buyers',
  },
  {
    id: 'hero-3',
    imageUrl: '/assets/photos/hero-3-clay.jpg',
    caption: 'photo 3 — a natural dye training, Lhuentse',
    altText: 'Traditional clay sculpture and statue making in Bhutan',
  },
  {
    id: 'hero-4',
    imageUrl: '/assets/photos/hero-4-textiles.jpg',
    caption: 'photo 4 — carving workshop, Trashiyangtse',
    altText: 'Naturally dyed yathra and silk textiles in Bumthang',
  },
  {
    id: 'hero-5',
    imageUrl: '/assets/photos/hero-5-desho.jpg',
    caption: 'photo 5 — HAB outlet counter, Thimphu',
    altText: 'Handmade traditional desho paper workshop in Trashiyangtse',
  },
];

const PUNAKHA_SLIDES = [
  { img: '/assets/photos/hero-2-punakha.jpg', cap: 'photo 1 — Punakha Crafts Market, stalls and river' },
  { img: '/assets/photos/hero-1-weaving.jpg', cap: 'photo 2 — a stallholder with her own work' },
  { img: '/assets/photos/hero-4-textiles.jpg', cap: 'photo 3 — a weaving demonstration' },
  { img: '/assets/photos/hero-3-clay.jpg', cap: 'photo 4 — the market from the Khuruthang road' },
];

export default function HomePage() {
  const router = useRouter();
  const { currency, fmt } = useCurrency();
  const { addToCart } = useCart();

  // Dynamic States initialized with exact client reference fallbacks
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [currentHero, setCurrentHero] = useState(0);

  const [currentPunakha, setCurrentPunakha] = useState(0);

  const [siteSettings, setSiteSettings] = useState({
    tagline: CLIENT_VERBATIM.tagline,
    heroParagraph: CLIENT_VERBATIM.heroPara,
    heroEyebrow: 'Civil Society Organization · Bhutan',
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
    partnersList: CLIENT_VERBATIM.partners,
  });

  const [products, setProducts] = useState<any[]>([
    {
      code: 'LHA01',
      name: 'Guru Rinpoche Mineral-Pigment Thangka',
      craftKey: 'lhazo',
      craft_name: 'Lhazo · Painting',
      maker: 'Sonam Thangka Studio, Paro',
      price: 260,
      priceUSD: 260,
      image_path: '/assets/photos/product-sad03.jpg',
      slot: 'photo 1 — thangka, full view',
    },
    {
      code: 'SAD03',
      name: 'Yathra Wool Saddle Bag',
      craftKey: 'thagzo',
      craft_name: 'Thagzo · Weaving',
      maker: 'Chumey Yathra House, Bumthang',
      price: 120,
      priceUSD: 120,
      image_path: '/assets/photos/product-hhb01.jpg',
      slot: 'photo 1 — saddle bag, full view',
    },
    {
      code: 'TRO04',
      name: 'Hand-Chased Silver Koma Clasp Pair',
      craftKey: 'troezo',
      craft_name: 'Troezo · Silver & Gold',
      maker: 'Zorig Silversmiths, Thimphu',
      price: 92,
      priceUSD: 92,
      image_path: '/assets/photos/product-lud01.jpg',
      slot: 'photo 1 — koma pair, full view',
    },
    {
      code: 'FTB04',
      name: 'Two-Tier Bangchung Basket',
      craftKey: 'tshazo',
      craft_name: 'Tshazo · Cane & Bamboo',
      maker: 'Kheng Bamboo Collective, Zhemgang',
      price: 34,
      priceUSD: 34,
      image_path: '/assets/photos/product-cam01.jpg',
      slot: 'photo 1 — bangchung basket, full view',
    },
  ]);


  const [clusters, setClusters] = useState<any[]>([
    {
      key: 'khoma',
      name: 'Khoma Weaving Cluster',
      craft_name: 'Thagzo · Weaving',
      dzongkhag: 'Lhuentse',
      meta: '42 member weavers',
      summary: 'Forty-two women weaving kisuthara silk on backstrap looms, in the village the textile is named for.',
      image_path: '/assets/photos/hero-1-weaving.jpg',
      slot: 'photo — Khoma weavers at work',
    },
    {
      key: 'kheng',
      name: 'Kheng Bamboo Cluster',
      craft_name: 'Tshazo · Bamboo & Cane',
      dzongkhag: 'Zhemgang',
      meta: '36 member artisans',
      summary: 'Bamboo and cane workers across the Kheng villages, making bangchung baskets to a technique held locally.',
      image_path: '/assets/photos/hero-4-textiles.jpg',
      slot: 'photo — Kheng bamboo splitting',
    },
    {
      key: 'trashiyangtse',
      name: 'Trashiyangtse Turning Cluster',
      craft_name: 'Shagzo · Woodturning',
      dzongkhag: 'Trashiyangtse',
      meta: '24 member turners',
      summary: 'The country’s wood-turning centre — dapa bowls and phob cups turned from burl and lacquered.',
      image_path: '/assets/photos/hero-5-desho.jpg',
      slot: 'photo — Trashiyangtse lathe turning',
    },
  ]);

  const [masters, setMasters] = useState<any[]>([
    {
      name: 'Aum Karma Wangmo',
      honour: 'Master Craftsperson',
      meta: 'Thagzo · Lhuentse · Since 1974',
      note: 'Fifty-one years at the backstrap loom, and teacher to eleven of the weavers now working in the Khoma cluster.',
      image_path: '/assets/photos/hero-1-weaving.jpg',
      slot: 'photo — Aum Karma Wangmo at the loom',
    },
    {
      name: 'Lopen Ugyen Namgyel',
      honour: 'Master Craftsperson',
      meta: 'Lhazo · Paro · Since 1988',
      note: 'Thangka painter working only in mineral pigment, to the proportions set out in the classical treatises.',
      image_path: '/assets/photos/hero-3-clay.jpg',
      slot: 'photo — Lopen Ugyen Namgyel painting thangka',
    },
    {
      name: 'Sonam Dorji',
      honour: 'National Craft Award',
      meta: 'Tshazo · Zhemgang · Since 2019',
      note: 'Recognised for the grading standard now used across the Kheng bamboo cluster.',
      image_path: '/assets/photos/hero-4-textiles.jpg',
      slot: 'photo — Sonam Dorji weaving bangchung',
    },
  ]);

  const [programmes, setProgrammes] = useState<any[]>([
    {
      ref: 'a',
      title: 'Sector Representation and Advocacy',
      description: 'Represent and advance the collective interests of all handicrafts sector stakeholders before governmental, legislative and private sector bodies.',
      url: '/programmes/a',
    },
    {
      ref: 'b',
      title: 'Policy Development and Intervention',
      description: 'Engage with competent authorities on policies, laws, regulations and incentive frameworks affecting the craft sector in Bhutan.',
      url: '/programmes/b',
    },
    {
      ref: 'c',
      title: 'Trade Facilitation',
      description: 'Facilitate domestic and international trade through trade infrastructure, standards compliance, market linkages and export facilitation.',
      url: '/programmes/c',
    },
    {
      ref: 'd',
      title: 'Product Development',
      description: 'Support innovation, quality enhancement and product diversification through design interventions and artisan–designer collaborations.',
      url: '/programmes/d',
    },
    {
      ref: 'e',
      title: 'Branding and Market Development',
      description: 'Steward a credible sector brand identity for Bhutanese handicrafts, promoting authenticity, cultural provenance and export distribution.',
      url: '/programmes/e',
    },
    {
      ref: 'f',
      title: 'Capacity Development',
      description: 'Strengthen productive, entrepreneurial, managerial and technical capacity through vocational training, mentorship and masterclasses.',
      url: '/programmes/f',
    },
  ]);

  const [news, setNews] = useState<any[]>([
    {
      kind: 'Programmes',
      date: '28 Aug 2026',
      title: 'Trade facilitation desk opens for the autumn export season',
      blurb: 'Members can now book one-to-one sessions on export documentation, EMS rates and commercial invoicing at the HAB office in Thimphu.',
      slug: 'trade-facilitation-desk-autumn',
      image_path: '/assets/photos/hero-2-punakha.jpg',
      slot: 'photo — HAB trade facilitation desk',
    },
    {
      kind: 'Artisan support',
      date: '14 Aug 2026',
      title: 'Natural dye training concludes in Lhuentse',
      blurb: 'Twenty-six weavers from Khoma and Gangzur completed a ten-day course on madder, indigo and lac dye preparation.',
      slug: 'natural-dye-training-lhuentse',
      image_path: '/assets/photos/hero-1-weaving.jpg',
      slot: 'photo — natural dye preparation in Lhuentse',
    },
    {
      kind: 'Events',
      date: '02 Aug 2026',
      title: 'Zorig Chusum craft bazaar returns to Clock Tower Square',
      blurb: 'Forty member enterprises will exhibit across three days, with live demonstrations from each of the thirteen crafts.',
      slug: 'craft-bazaar-clock-tower',
      image_path: '/assets/photos/hero-4-textiles.jpg',
      slot: 'photo — Clock Tower Square craft bazaar',
    },
  ]);

  const [events, setEvents] = useState<any[]>([
    {
      day: '12',
      mon: 'SEP',
      title: 'Zorig Chusum craft bazaar',
      place: 'Clock Tower Square, Thimphu',
      url: '/events/craft-bazaar-2026',
    },
    {
      day: '27',
      mon: 'SEP',
      title: 'Export documentation clinic',
      place: 'HAB office, Metog Lam',
      url: '/events/export-clinic-sep',
    },
    {
      day: '08',
      mon: 'OCT',
      title: 'Annual Sector Forum',
      place: 'Thimphu',
      url: '/events/sector-forum-2026',
    },
  ]);

  const [publications, setPublications] = useState<any[]>([
    { kind: 'Latest · Annual report', title: 'Annual Report 2025', meta: 'PDF · 4.2 MB · English & Dzongkha', file_url: '/publications' },
    { kind: 'Strategy', title: 'Five-Year Strategic Plan 2026–2030', meta: 'PDF · 3.6 MB · Board approved', file_url: '/publications' },
    { kind: 'Sector study', title: 'Zorig Chusum Value Chain Assessment', meta: 'PDF · 2.8 MB · 96 pages', file_url: '/publications' },
    { kind: 'Accounts', title: 'Audited Financial Statements 2025', meta: 'PDF · 1.1 MB · Independent auditor', file_url: '/publications' },
  ]);

  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // 1. Dynamic API Bindings for Secretariat Admin Controls
  useEffect(() => {
    // A. Hero Slides from Admin
    fetch('/api/hero-slides')
      .then((r) => r.json())
      .then((d) => {
        if (d?.slides && Array.isArray(d.slides)) {
          if (d.slides.length >= 2) {
            setHeroSlides(d.slides);
          } else if (d.slides.length === 1) {
            setHeroSlides([d.slides[0], ...DEFAULT_HERO_SLIDES.slice(1)]);
          }
        }
      })
      .catch(() => {});

    // B. Site Settings from Admin
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((d) => {
        if (d?.setting) {
          setSiteSettings((prev) => ({
            ...prev,
            tagline: d.setting.tagline || prev.tagline,
            heroParagraph: d.setting.heroParagraph || prev.heroParagraph,
            heroEyebrow: d.setting.heroEyebrow || prev.heroEyebrow,
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
            partnersList: Array.isArray(d.setting.partnersList) && d.setting.partnersList.length > 0 ? d.setting.partnersList : prev.partnersList,
          }));
        }
      })
      .catch(() => {});

    // C. Products from Admin
    fetch('/api/products?limit=4')
      .then((r) => r.json())
      .then((d) => {
        if (d?.products && d.products.length > 0) {
          setProducts(d.products);
        }
      })
      .catch(() => {});

    // D. Clusters from Admin
    fetch('/api/clusters')
      .then((r) => r.json())
      .then((d) => {
        if (d?.clusters && d.clusters.length > 0) {
          setClusters(d.clusters.slice(0, 3));
        }
      })
      .catch(() => {});

    // E. Honours & Masters from Admin
    fetch('/api/honours')
      .then((r) => r.json())
      .then((d) => {
        if (d?.masters && d.masters.length > 0) {
          setMasters(d.masters.slice(0, 3));
        }
      })
      .catch(() => {});

    // F. Programmes from Admin
    fetch('/api/programmes')
      .then((r) => r.json())
      .then((d) => {
        if (d?.pillars && d.pillars.length > 0) {
          setProgrammes(d.pillars.slice(0, 6));
        }
      })
      .catch(() => {});

    // G. News from Admin
    fetch('/api/news')
      .then((r) => r.json())
      .then((d) => {
        if (d?.articles && d.articles.length > 0) {
          setNews(d.articles.slice(0, 3));
        }
      })
      .catch(() => {});

    // H. Events from Admin
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => {
        if (d?.events && d.events.length > 0) {
          setEvents(d.events.slice(0, 3));
        }
      })
      .catch(() => {});

    // I. Publications from Admin
    fetch('/api/publications')
      .then((r) => r.json())
      .then((d) => {
        if (d?.publications && d.publications.length > 0) {
          setPublications(d.publications.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  // Carousel Timers
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const t = setInterval(() => {
      setCurrentHero((c) => (c + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentPunakha((c) => (c + 1) % PUNAKHA_SLIDES.length);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  const handleMemberSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberSearchTerm.trim()) {
      router.push(`/members?q=${encodeURIComponent(memberSearchTerm.trim())}`);
    } else {
      router.push('/members');
    }
  };

  return (
    <main id="main">

      {/* ========================= 1. HERO ========================= */}
      <section className="section hero">
        <div className="hero__copy">
          <p className="eyebrow eyebrow--accent">{siteSettings.heroEyebrow}</p>
          <h1 className="display display--hero">{siteSettings.tagline}</h1>
          <p className="lede">
            Handicrafts Association of Bhutan supports <Link href="/members">local artisans</Link> in promoting their handicrafts in markets both within Bhutan and internationally, and supports <Link href="/programmes">skills development and capacity building</Link> of the craftspeople.
          </p>
          <div className="actions">
            <Link className="btn btn--accent" href="/masters">
              Meet the Makers →
            </Link>
          </div>
        </div>

        <div className="carousel" aria-label="Who we are and what we do">
          <div className="carousel__track">
            {heroSlides.map((s, idx) => (
              <div
                key={s.id || idx}
                className={`carousel__slide ${idx === currentHero ? 'is-on' : ''}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: idx === currentHero ? 1 : 0,
                  transition: 'opacity .6s ease',
                  zIndex: idx === currentHero ? 1 : 0,
                }}
              >
                <img
                  src={s.imageUrl}
                  alt={s.altText || s.caption}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = SCENE_POOL[idx % SCENE_POOL.length]; }}
                />
                <span className="carousel__cap">{s.caption}</span>
              </div>
            ))}
          </div>
          <button
            className="carousel__nav carousel__nav--prev"
            type="button"
            onClick={() => setCurrentHero((c) => (c - 1 + heroSlides.length) % heroSlides.length)}
            aria-label="Previous photograph"
          >
            ‹
          </button>
          <button
            className="carousel__nav carousel__nav--next"
            type="button"
            onClick={() => setCurrentHero((c) => (c + 1) % heroSlides.length)}
            aria-label="Next photograph"
          >
            ›
          </button>
          <div className="carousel__dots">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`carousel__dot ${idx === currentHero ? 'is-on' : ''}`}
                onClick={() => setCurrentHero(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================= 2. STATS ========================= */}
      <section className="section section--tight">
        <div className="stats">
          {siteSettings.stats.map((st, idx) => (
            <Link key={idx} href={st.url} className="stats__cell" style={{ color: 'inherit' }}>
              <span className="stats__num">{st.value}</span>
              <span className="stats__label">{st.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================= 3. B2C / B2B GATEWAY ========================= */}
      <section className="section section--tight" id="buy">
        <div className="buyband">
          <div className="buyband__copy">
            <p className="eyebrow eyebrow--accent">Two ways to buy</p>
            <h2 className="display display--sub">Retail or trade</h2>
          </div>
          <div className="buyband__actions">
            <Link className="buybtn" href="/shop">
              <span className="buybtn__label">Retail</span>
              <span className="buybtn__name">Visit the e-shop</span>
              <span className="buybtn__note">Single pieces, shipped worldwide</span>
            </Link>
            <Link className="buybtn buybtn--trade" href="/wholesale">
              <span className="buybtn__label">Trade</span>
              <span className="buybtn__name">Wholesale &amp; bulk</span>
              <span className="buybtn__note">Trade pricing on approval</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================= 4. ABOUT BAND ========================= */}
      <section className="band" id="about">
        <div className="band__inner about">
          <div>
            <p className="eyebrow eyebrow--brass">About us</p>
            <h2 className="display display--band">{siteSettings.aboutBandTitle}</h2>
            <p className="band__body">{siteSettings.aboutBandPara1}</p>
            <p className="band__body">{siteSettings.aboutBandPara2}</p>
            <Link className="link-brass" href="/programmes">
              Read about our programmes
            </Link>
          </div>
          <figure className="frame frame--square frame--dark">
            <img
              src={siteSettings.aboutBandImageUrl?.includes('training_workshop') ? '/assets/photos/about-hab.jpg' : (siteSettings.aboutBandImageUrl || '/assets/photos/about-hab.jpg')}
              alt={siteSettings.aboutBandImageCaption}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/about-hab.jpg'; }}
            />
            <figcaption className="frame__caption frame__caption--dark">
              {siteSettings.aboutBandImageCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ========================= 5. NEW IN THE SHOP ========================= */}
      <section className="section" id="shop">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Latest arrivals</p>
            <h2 className="display display--band">New in the shop</h2>
            <p className="section__lede">
              A working mix across the thirteen crafts, newest first — bought from the member at an agreed price and sold centrally by HAB.
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/shop">
            Visit the shop →
          </Link>
        </div>
        <div className="grid grid--4">
          {products.slice(0, 4).map((p, pIdx) => {
            const displayPrice = p.priceUSD || p.price || 0;
            const productImg = p.image_path || (p.images && p.images[0]?.url) || PRODUCT_POOL[pIdx % PRODUCT_POOL.length];
            return (
              <article key={p.code} className="card product">
                <Link className="product__shot" href={`/product/${p.code}`}>
                  <figure className="frame frame--square">
                    <img
                      src={productImg}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_POOL[pIdx % PRODUCT_POOL.length]; }}
                    />
                    <figcaption className="frame__caption frame__caption--sm">{p.slot || p.code}</figcaption>
                  </figure>
                  <span className="product__ref">{p.code}</span>
                </Link>
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{p.craft_name || p.craftKey}</p>
                  <h3 className="card__title clamp-2">
                    <Link href={`/product/${p.code}`}>{p.name}</Link>
                  </h3>

                  <p className="card__meta clamp-1">{typeof p.maker === 'object' ? p.maker?.name : p.maker}</p>
                  <div className="card__foot">
                    <span className="price">{fmt(displayPrice)}</span>
                    <button
                      className="btn btn--outline btn--xs"
                      type="button"
                      onClick={() => addToCart(p.code)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ========================= 6. ASSURANCE ========================= */}
      <section className="section section--tight">
        <div className="assurance">
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">T</span>
              <span>racked Origin</span>
            </h3>
            <p className="assurance__body">Materials, makers, and worldwide shipping are 100% traceable.</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">R</span>
              <span>egistered Chain</span>
            </h3>
            <p className="assurance__body">Every artisan, supplier, and input is strictly verified.</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">U</span>
              <span>pfront &amp; Fair</span>
            </h3>
            <p className="assurance__body">Pre-paid artisan pricing cuts out unethical markups.</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              <span className="assurance__initial">E</span>
              <span>ncrypted Escrow</span>
            </h3>
            <p className="assurance__body">Bulletproof 3-D Secure, mBoB, and bank transfers.</p>
          </div>
        </div>
      </section>

      {/* ========================= 7. OUTLETS & PUNAKHA MARKET ========================= */}
      <section className="section" id="outlets">
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

        <article className="outlet-lead" id="outletLead">
          <div className="carousel carousel--outlet" aria-label="Punakha Crafts Market">
            <div className="carousel__track">
              {PUNAKHA_SLIDES.map((sl, i) => (
                <div
                  key={i}
                  className={`carousel__slide ${i === currentPunakha ? 'is-on' : ''}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: i === currentPunakha ? 1 : 0,
                    transition: 'opacity .6s ease',
                    zIndex: i === currentPunakha ? 1 : 0,
                  }}
                >
                  <img
                    src={sl.img}
                    alt={sl.cap}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-2-punakha.jpg'; }}
                  />
                  <span className="carousel__cap">{sl.cap}</span>
                </div>
              ))}
            </div>
            <button
              className="carousel__nav carousel__nav--prev"
              type="button"
              onClick={() => setCurrentPunakha((c) => (c - 1 + PUNAKHA_SLIDES.length) % PUNAKHA_SLIDES.length)}
              aria-label="Previous photograph"
            >
              ‹
            </button>
            <button
              className="carousel__nav carousel__nav--next"
              type="button"
              onClick={() => setCurrentPunakha((c) => (c + 1) % PUNAKHA_SLIDES.length)}
              aria-label="Next photograph"
            >
              ›
            </button>
            <div className="carousel__dots">
              {PUNAKHA_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`carousel__dot ${i === currentPunakha ? 'is-on' : ''}`}
                  onClick={() => setCurrentPunakha(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="outlet-lead__body">
            <p className="badge badge--ink">
              <span aria-hidden="true">★</span> HAB validated &amp; managed
            </p>
            <h3 className="display display--panel">Punakha Crafts Market</h3>
            <p className="outlet-lead__place">Punakha · beside the Mo Chhu, on the Khuruthang road</p>
            <p className="outlet-lead__desc">
              The only authentic crafts market validated and managed by HAB. Every stall is a registered member selling their own work, priced as agreed with the association — no resellers, no imported copies.
            </p>
            <div className="factgrid">
              <div className="factgrid__cell">
                <span className="factgrid__key">Hours</span>
                <span className="factgrid__val clamp-2">Daily, 09:00 – 18:00</span>
              </div>
              <div className="factgrid__cell">
                <span className="factgrid__key">Stalls</span>
                <span className="factgrid__val clamp-2">32 member artisans</span>
              </div>
              <div className="factgrid__cell">
                <span className="factgrid__key">Crafts on site</span>
                <span className="factgrid__val clamp-2">Weaving, bamboo, wood turning, paper</span>
              </div>
              <div className="factgrid__cell">
                <span className="factgrid__key">Payment</span>
                <span className="factgrid__val clamp-2">Cash, mBoB, cards</span>
              </div>
            </div>
            <div className="actions">
              <Link className="btn btn--accent" href="/outlets/punakha-market">
                Get directions
              </Link>
              <Link className="btn btn--outline" href="/contact">
                Plan a group visit
              </Link>
              <Link className="btn btn--text" href="/outlets/punakha-market">
                Learn more →
              </Link>
            </div>
          </div>
        </article>

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
                  src={c.image_path || '/assets/photos/hero-1-weaving.jpg'}
                  alt={c.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-1-weaving.jpg'; }}
                />
                <figcaption className="frame__caption frame__caption--sm">{c.slot || c.name}</figcaption>
              </figure>
              <div className="card__body">
                <p className="eyebrow eyebrow--accent eyebrow--sm">{c.craft_name || c.craftKey}</p>
                <h3 className="cluster__name">{c.name}</h3>
                <p className="cluster__place">{c.dzongkhag} · {c.meta || 'Active Cluster'}</p>
                <p className="card__text cluster__summary">{c.summary}</p>
                <p className="cluster__read">Read the story →</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="footnote">
          195 affiliated stores across Bhutan also carry member work. Outlets and clusters are added here as they are validated.
        </p>
      </section>

      {/* ========================= 8. 13 CRAFTS ========================= */}
      <section className="section" id="crafts">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Zorig Chusum</p>
            <h2 className="display display--band">The 13 arts &amp; crafts of Bhutan</h2>
            <p className="section__lede">
              First categorised in the 17th century. Each craft is a doorway into the shop — and into the members who practise it.
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/shop">
            Shop all crafts →
          </Link>
        </div>

        <div className="grid grid--auto">
          {CRAFTS.map((craft, idx) => {
            const num = String(idx + 1).padStart(2, '0');
            return (
              <article key={craft.key} className="card craft">
                <figure className="frame frame--wide16" style={{ position: 'relative' }}>
                  <span className="craft__num">{num} / 13</span>
                  <img
                    src={SCENE_POOL[idx % SCENE_POOL.length]}
                    alt={craft.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-1-weaving.jpg'; }}
                  />
                  <figcaption className="frame__caption frame__caption--sm">{craft.name}</figcaption>

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
        </div>
      </section>

      {/* ========================= 9. MASTER CRAFTSPEOPLE ========================= */}
      <section className="section" id="masters">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Recognised by the association</p>
            <h2 className="display display--band">Master craftspeople</h2>
            <p className="section__lede">
              Members honoured for mastery of a Zorig Chusum craft, for national craft awards, and for the standards they set for everyone else working in it.
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/masters">
            All recognised members →
          </Link>
        </div>

        <div className="grid grid--3">
          {masters.map((m, idx) => (
            <Link key={idx} className="card honour" href="/masters" style={{ color: 'inherit' }}>
              <figure className="frame frame--square">
                <img
                  src={m.image_path || '/assets/photos/hero-1-weaving.jpg'}
                  alt={m.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-1-weaving.jpg'; }}
                />
                <figcaption className="frame__caption frame__caption--sm">{m.slot || m.name}</figcaption>
              </figure>
              <div className="card__body">
                <span className="honour__badge">{m.honour}</span>
                <h3 className="card__title">{m.name}</h3>
                <p className="card__meta">{m.meta}</p>
                <p className="card__text clamp-3">{m.note}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================= 10. PROGRAMMES ========================= */}
      <section className="section" id="programmes">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Programmes &amp; projects</p>
            <h2 className="display display--band">Change lives, build a better community</h2>
            <p className="section__lede">
              Every programme runs against one or more of the objects set out in Article 3.2 of the Articles of Association.
            </p>
          </div>
          <Link className="link-accent" href="/programmes">
            All eleven programme areas →
          </Link>
        </div>

        <div className="grid grid--3">
          {programmes.map((p, idx) => (
            <article key={p.ref || idx} className="card programme">
              <div className="programme__head">
                <span className="badge badge--ref">Art. 3.2({p.ref})</span>
                <h3 className="card__title clamp-3">{p.title}</h3>
              </div>
              <p className="card__text programme__desc">{p.description}</p>
              <Link className="link-accent programme__toggle" href={`/programmes/${p.ref}`}>
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ========================= 11. SUPPORT US ========================= */}
      <section className="section support" id="support">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Support us</p>
            <h2 className="display display--band">Support the Living Heritage of Bhutan</h2>
            <p className="section__lede">
              We empower the entire craft value chain. Your support directly sustains rural creators, safeguards ancestral arts, and protects our natural landscapes.
            </p>
          </div>
          <Link className="btn btn--accent" href="/donate">
            Donate now
          </Link>
        </div>

        <div className="pillars" id="supportPillars">
          <article className="pillar">
            <h3 className="pillar__title">
              <span className="pillar__initial">G</span>
              <span>rassroots Benefit</span>
            </h3>
            <p className="pillar__line">Keeps rural creators trading through the lean season.</p>
            <p className="pillar__body">Every ngultrum stays in the sector. Your gift funds vital market access, export logistics, and fair-price advocacy that keeps rural enterprises viable.</p>
            <Link className="pillar__give" href="/donate?pillar=grassroots">
              Give Now →
            </Link>
          </article>
          <article className="pillar">
            <h3 className="pillar__title">
              <span className="pillar__initial">I</span>
              <span>mpact Crowdfunding &amp; Enterprise</span>
            </h3>
            <p className="pillar__line">Buys the raw materials an artisan cannot afford upfront.</p>
            <p className="pillar__body">Artisans lose orders due to upfront material costs. This revolving fund buys their supplies; they repay upon sale, cycling your money continuously to the next entrepreneur.</p>
            <Link className="pillar__give" href="/donate?pillar=impact">
              Give Now →
            </Link>
          </article>
          <article className="pillar">
            <h3 className="pillar__title">
              <span className="pillar__initial">V</span>
              <span>ital Cultural Preservation</span>
            </h3>
            <p className="pillar__line">Funds critical master-to-apprentice placements.</p>
            <p className="pillar__body">Several of Bhutan’s traditional crafts face critical decline. Paid apprenticeships are the only way youth can afford to learn and save these sacred arts.</p>
            <Link className="pillar__give" href="/donate?pillar=cultural">
              Give Now →
            </Link>
          </article>
          <article className="pillar">
            <h3 className="pillar__title">
              <span className="pillar__initial">E</span>
              <span>nvironmental &amp; Landscape Conservation</span>
            </h3>
            <p className="pillar__line">Replants the natural materials our crafts grow from.</p>
            <p className="pillar__body">Craft demand can outrun forest regrowth. We fund local artisan clusters to manage ecological replanting, ensuring both the heritage and our hillsides thrive.</p>
            <Link className="pillar__give" href="/donate?pillar=environment">
              Give Now →
            </Link>
          </article>
        </div>
      </section>

      {/* ========================= 12. MEMBERSHIP DUO ========================= */}
      <section className="section" id="membership">
        <div className="duo">
          <div className="panel">
            <p className="eyebrow eyebrow--muted">Search the crafts</p>
            <h3 className="display display--panel">Find a craft, a maker or a piece</h3>
            <p className="panel__body">
              Search the thirteen crafts, our award-winning craftspeople, the artisan clusters and everything in the shop.
            </p>
            <form className="inline-form" onSubmit={handleMemberSearch}>
              <label className="visually-hidden" htmlFor="memberSearch">Search crafts, makers, clusters and products</label>
              <input
                className="input"
                id="memberSearch"
                type="search"
                placeholder="Try weaving, Lhuentse, bowl, Khoma…"
                autoComplete="off"
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
              />
              <button className="btn btn--ink" type="submit">Search</button>
            </form>
          </div>
          <div className="panel panel--accent">
            <p className="eyebrow eyebrow--onaccent">Join HAB</p>
            <h3 className="display display--panel display--onaccent">Become a member</h3>
            <p className="panel__body panel__body--onaccent">
              Apply online, pay your annual dues by card, mBoB or bank transfer, and get listed in the public directory once approved.
            </p>
            <div className="actions">
              <Link className="btn btn--light" href="/membership/apply">
                Apply for membership
              </Link>
              <Link className="btn btn--ghost" href="/login">
                Member login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= 13. NEWSROOM & EVENTS ========================= */}
      <section className="section" id="news">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Newsroom</p>
            <h2 className="display display--band">News, events &amp; reports</h2>
            <p className="section__lede">
              The three most recent updates, newest first. Stay informed, stay empowered.
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/news">
            All updates →
          </Link>
        </div>

        <div className="newsrow">
          <div className="grid grid--3">
            {news.map((item, idx) => (
              <article key={item.slug || idx} className="card news">
                <figure className="frame frame--wide16">
                  <img
                    src={item.image_path || '/assets/photos/hero-2-punakha.jpg'}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-2-punakha.jpg'; }}
                  />
                  <figcaption className="frame__caption frame__caption--sm">{item.slot || item.title}</figcaption>
                </figure>
                <div className="card__body">
                  <div className="news__meta">
                    <span className="tag">{item.kind || 'News'}</span>
                    <span className="news__date">{item.date || item.published_at || 'Recent'}</span>
                  </div>
                  <h3 className="news__title clamp-2">{item.title}</h3>
                  <p className="card__text clamp-4">{item.blurb}</p>
                  <Link className="news__more" href={`/news/${item.slug}`}>
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <aside className="newsaside">
            <div className="newsaside__block">
              <div className="newsaside__head">
                <h3 className="newsaside__title">Upcoming events</h3>
                <Link className="link-accent" href="/events">
                  All events →
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
                      <span className="eventrow__place clamp-1">{ev.place}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="newsaside__block newsaside__block--dark">
              <h3 className="newsaside__title newsaside__title--light">Reports &amp; publications</h3>
              <p className="newsaside__body">
                Annual reports, audited accounts, sector studies and the Zorig Chusum catalogue — free to download.
              </p>
              <Link className="link-brass" href="/publications">
                Browse all reports
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ========================= 14. PUBLICATIONS ========================= */}
      <section className="section" id="publications">
        <div className="rule-top">
          <div className="pubs">
            <div>
              <p className="eyebrow eyebrow--accent">Accountability</p>
              <h2 className="display display--sub">Reports &amp; publications</h2>
              <p className="section__lede">
                HAB publishes programme outcomes, sector research and audited accounts every year, in English and Dzongkha.
              </p>
              <Link className="link-accent" href="/publications">
                All publications →
              </Link>
            </div>
            <div className="grid grid--2">
              {publications.map((pb, idx) => (
                <Link key={idx} className="card pub" href={pb.file_url || '/publications'}>
                  <span className="eyebrow eyebrow--accent eyebrow--sm">{pb.kind}</span>
                  <span className="pub__title clamp-3">{pb.title}</span>
                  <span className="pub__meta">{pb.meta}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================= 15. PARTNERS ========================= */}
      <section className="section section--last">
        <p className="eyebrow eyebrow--muted">Development Partners</p>
        <div className="partners">
          {siteSettings.partnersList.map((partner: any, idx: number) => {
            const name = typeof partner === 'string' ? partner : partner.name;
            return (
              <div key={idx} className="partners__cell">
                <span className="partners__name">{name}</span>
              </div>
            );
          })}
        </div>
      </section>

    </main>
  );
}
