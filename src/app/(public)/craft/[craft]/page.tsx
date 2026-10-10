'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { CraftData } from '@/lib/client-data';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import UniversalLiveSectionEditor from '@/components/public/UniversalLiveSectionEditor';
import { getCraftFacts } from '@/lib/craft-facts';
import { useLanguage } from '@/context/LanguageContext';

export default function CraftProfilePage() {
  const { language } = useLanguage();
  const params = useParams();
  const craftKey = (params.craft as string) || 'thagzo';

  const [craft, setCraft] = useState<CraftData | null>(null);
  const [crafts, setCrafts] = useState<CraftData[]>([]);
  const [craftState, setCraftState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [relatedErrors, setRelatedErrors] = useState({ products: false, clusters: false, members: false });
  const [relatedLoading, setRelatedLoading] = useState({ products: true, clusters: true, members: true });
  const [editorOpen, setEditorOpen] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async (path: string) => {
      const response = await fetch(path, { cache: 'no-store', signal: controller.signal });
      const body = await response.json();
      if (!response.ok || body.success === false) throw new Error(`Could not load ${path}`);
      return body;
    };
    setCraft(null);
    setCraftState('loading');
    setCrafts([]);
    setProducts([]);
    setClusters([]);
    setMembers([]);
    setRelatedErrors({ products: false, clusters: false, members: false });
    setRelatedLoading({ products: true, clusters: true, members: true });

    load('/api/crafts').then((data) => {
      if (controller.signal.aborted) return;
      const savedCrafts: CraftData[] = Array.isArray(data.crafts) ? data.crafts : [];
      setCrafts(savedCrafts);
      const selected = savedCrafts.find((item) => item.key === craftKey) || null;
      setCraft(selected);
      setCraftState(selected ? 'ready' : 'missing');
    }).catch(() => { if (!controller.signal.aborted) setCraftState('error'); });

    load(`/api/products?craft=${encodeURIComponent(craftKey)}`).then((data) => {
      if (controller.signal.aborted) return;
      setProducts((Array.isArray(data.products) ? data.products : []).map((p: any) => ({
        code: p.code, name: p.name, craft_key: p.craftKey || p.craft_key,
        region: p.region || p.maker?.dzongkhag || '', maker: p.maker?.name || (typeof p.maker === 'string' ? p.maker : ''),
        price_usd: p.priceUSD ?? p.price ?? p.price_usd,
        image_path: p.image_path || p.imageUrl || p.images?.[0]?.url || '/assets/photos/image-unavailable.svg',
        hero_image: p.image_path || p.imageUrl || p.images?.[0]?.url || '/assets/photos/image-unavailable.svg',
        summary: p.description || p.summary || '',
      })));
      setRelatedLoading((state) => ({ ...state, products: false }));
    }).catch(() => { if (!controller.signal.aborted) { setRelatedErrors((state) => ({ ...state, products: true })); setRelatedLoading((state) => ({ ...state, products: false })); } });

    load('/api/clusters').then((data) => {
      if (controller.signal.aborted) return;
      setClusters((Array.isArray(data.clusters) ? data.clusters : [])
        .filter((item: any) => (item.craftKey || item.craft_key) === craftKey)
        .map((item: any) => ({ ...item, craft_key: item.craftKey || item.craft_key })));
      setRelatedLoading((state) => ({ ...state, clusters: false }));
    }).catch(() => { if (!controller.signal.aborted) { setRelatedErrors((state) => ({ ...state, clusters: true })); setRelatedLoading((state) => ({ ...state, clusters: false })); } });

    load(`/api/members?craft=${encodeURIComponent(craftKey)}`).then((data) => {
      if (controller.signal.aborted) return;
      setMembers((Array.isArray(data.members) ? data.members : []).map((member: any) => ({
        name: member.name, regNumber: member.regNumber, dzongkhag: member.dzongkhag,
        blurb: member.bio, member_since: member.joinYear,
      })));
      setRelatedLoading((state) => ({ ...state, members: false }));
    }).catch(() => { if (!controller.signal.aborted) { setRelatedErrors((state) => ({ ...state, members: true })); setRelatedLoading((state) => ({ ...state, members: false })); } });
    return () => controller.abort();
  }, [craftKey]);

  const [activeSlide, setActiveSlide] = useState(0);
  const { addToCart } = useCart();
  const { fmt } = useCurrency();
  const galleryCount = (craft?.bannerUrl || craft?.image_path ? 1 : 0)
    + products.slice(0, 2).filter((product) => product.hero_image && product.hero_image !== '/assets/photos/image-unavailable.svg').length;

  // Auto-flipper
  useEffect(() => {
    setActiveSlide(0);
    if (galleryCount <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % galleryCount);
    }, 4500);
    return () => clearInterval(timer);
  }, [galleryCount]);

  if (!craft || craft.key !== craftKey) {
    const message = craftState === 'error' ? 'The craft catalogue is temporarily unavailable. Please try again shortly.'
      : craftState === 'missing' ? 'This craft is not listed.' : 'Loading craft details…';
    return <main id="main"><section className="section"><h1 className="display display--page">Craft</h1><p role={craftState === 'error' ? 'alert' : undefined}>{message}</p><Link href="/crafts">View all crafts</Link></section></main>;
  }

  const craftIndex = crafts.findIndex((item) => item.key === craft.key);
  const prevCraft = craftIndex >= 0 && crafts.length > 1 ? crafts[(craftIndex - 1 + crafts.length) % crafts.length] : null;
  const nextCraft = craftIndex >= 0 && crafts.length > 1 ? crafts[(craftIndex + 1) % crafts.length] : null;

  const galleryImages = [
    ...(craft.bannerUrl || craft.image_path ? [{ src: craft.bannerUrl || craft.image_path!, alt: craft.image_alt || `${craft.name} craft` }] : []),
    ...products.slice(0, 2).filter((product) => product.hero_image && product.hero_image !== '/assets/photos/image-unavailable.svg')
      .map((product) => ({ src: product.hero_image as string, alt: product.name as string })),
  ];

  const historyText = language === 'dz' && craft.historyDz ? craft.historyDz : craft.history || '';
  const descriptionText = language === 'dz' && craft.descriptionDz ? craft.descriptionDz : craft.description;
  const longDescriptionText = language === 'dz' && craft.longDescriptionDz
    ? craft.longDescriptionDz
    : craft.long_description || craft.description || '';

  const historyParas = historyText
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);

  const longDescParas = longDescriptionText
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);

  const badgeNum = ('0' + craft.sort_order).slice(-2) + `/${crafts.length} · ZORIG CHUSUM`;
  const craftFacts = getCraftFacts(craft);

  return (
    <main id="main">
      {/* 1. Hero & Breadcrumbs */}
      <section className="section relative" data-hab-section="craft">
        <SectionEditBadge
          label={`Quick Edit: ${craft.name}`}
          studioHref="/admin/crafts"
          sectionType="crafts"
          onEdit={() => setEditorOpen(true)}
        />
        
        {/* Blueprint Backbar */}
        <div className="backbar">
          <Link className="backbar__link" href="/#crafts">
            <span aria-hidden="true">←</span> Back to the crafts
          </Link>
        </div>

        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/#crafts">Zorig Chusum</Link> / <span>{craft.name}</span>
        </p>

        <div className="craftpage-hero">
          <div>
            <span className="craftpage-hero__badge">{badgeNum}</span>
            <h1 className="display display--hero">{language === 'dz' && craft.dzongkha ? craft.dzongkha : craft.name}</h1>
            <p className="craftpage-hero__en">{craft.english}</p>
            <p className="craftpage-hero__lede">{descriptionText}</p>
            <div className="actions">
              <Link className="btn btn--accent" href={`/shop/${craft.key}`}>
                Shop {craft.name} →
              </Link>
              <Link className="btn btn--outline" href="/shop">
                Visit the whole shop
              </Link>
            </div>
          </div>

          {/* Crossfading Flipper */}
          <div className="flipper" tabIndex={0} aria-label="Photographs of this craft">
            {(galleryImages.length ? galleryImages : [{ src: '/assets/photos/image-unavailable.svg', alt: 'Craft image not available' }]).map(({ src, alt }, i) => {
              return (
                <div
                  key={i}
                  className={`flipper__slide ${activeSlide === i ? 'is-on' : ''}`}
                  data-cms-img
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: activeSlide === i ? 1 : 0,
                    transition: 'opacity 0.8s ease',
                    pointerEvents: activeSlide === i ? 'auto' : 'none',
                    zIndex: activeSlide === i ? 2 : 1,
                  }}
                >
                  <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/assets/photos/image-unavailable.svg';
                    }}
                  />
                  <span className="flipper__cap">{alt}</span>
                </div>
              );
            })}
            {galleryImages.length > 1 && <div className="flipper__dots">
              {galleryImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`flipper__dot ${activeSlide === i ? 'is-on' : ''}`}
                  onClick={() => setActiveSlide(i)}
                  aria-label={`Show photograph ${i + 1}`}
                />
              ))}
            </div>}
          </div>
        </div>
      </section>

      {/* 2. Facts Strip */}
      <section className="section section--tight">
        <div className="craftfacts">
          {craftFacts.map((fact) => (
            <div className="craftfacts__cell" key={fact.label}>
              <span className="craftfacts__key">{fact.label}</span>
              <span className="craftfacts__val">{fact.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. The Craft: How it is made */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">The craft</p>
            <h2 className="display display--sub">How it is made</h2>
          </div>
          <div>
            {longDescParas.map((para: string, i: number) => (
              <p key={i} className="longread__body">{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* 4. History */}
      {historyParas.length > 0 && (
        <section className="section">
          <div className="longread">
            <div>
              <p className="eyebrow eyebrow--accent">Where it comes from</p>
              <h2 className="display display--sub">History of the craft</h2>
            </div>
            <div>
              {historyParas.map((para: string, i: number) => (
                <p key={i} className="longread__body">{para}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Visual Triptych */}
      {galleryImages.length > 1 && <section className="section section--tight">
        <div className="triptych">
          {galleryImages.map(({ src, alt }, i) => {
            return (
              <div key={i} className="triptych__cell">
                <figure className="frame frame--wide16 has-image" data-cms-img>
                  <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/assets/photos/image-unavailable.svg';
                    }}
                  />
                </figure>
              </div>
            );
          })}
        </div>
      </section>}

      {/* 6. Products in the shop / Made to commission */}
      <section className="section" id="craftShop">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">
              {relatedLoading.products ? 'Loading shop items' : relatedErrors.products ? 'Shop items unavailable' : products.length > 0
                ? `${products.length} ${products.length === 1 ? 'piece' : 'pieces'} in the HAB shop`
                : 'No published pieces'}
            </p>
            <h2 className="display display--sub">In the shop</h2>
          </div>
          <Link className="btn btn--ink btn--sm" href="/shop">
            All products →
          </Link>
        </div>

        {relatedLoading.products ? <p>Loading shop items…</p> : relatedErrors.products ? <p role="alert">The craft shop items are temporarily unavailable. Please try again shortly.</p> : products.length > 0 ? (
          <div className="grid grid--4" data-cms-repeat>
            {products.map((p) => (
              <article key={p.code} className="card product" data-cms-item data-code={p.code}>
                <Link className="product__shot" href={`/product/${p.code}`}>
                  <figure className="frame frame--square has-image" data-cms-img>
                    <img
                      src={p.image_path || '/assets/photos/image-unavailable.svg'}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/assets/photos/image-unavailable.svg';
                      }}
                    />
                  </figure>
                  <span className="product__ref">{p.code}</span>
                </Link>
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{craft.name}</p>
                  <h3 className="card__title clamp-2">
                    <Link href={`/product/${p.code}`}>{p.name}</Link>
                  </h3>
                  <p className="card__meta clamp-1">
                    {[p.maker, p.region].filter(Boolean).join(' · ')}
                  </p>
                  <div className="card__foot">
                    <span className="price">{fmt(p.price_usd ?? p.price ?? p.priceUSD ?? 0)}</span>
                    <button
                      type="button"
                      className="btn btn--outline btn--xs"
                      onClick={() => addToCart(p.code)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="shopempty">
            <h3 className="shopempty__title">No pieces published yet</h3>
            <p className="shopempty__body">
              {craft.shop_note ||
                `There are no ${craft.name} pieces in the online catalogue at present. Contact the secretariat to ask about availability or a commission.`}
            </p>
            <Link
              className="btn btn--accent"
              href={`/contact?topic=commission&craft=${encodeURIComponent(craft.name)}`}
            >
              Enquire about a commission
            </Link>
          </div>
        )}
      </section>

      {/* 7. Clusters Section */}
      {relatedErrors.clusters && <section className="section"><p role="alert">Cluster listings are temporarily unavailable.</p></section>}
      {clusters.length > 0 && (
        <section className="section">
          <div className="section__head">
            <div>
              <p className="eyebrow eyebrow--accent">Where it is concentrated</p>
              <h2 className="display display--sub">Clusters working this craft</h2>
            </div>
            <Link className="link-accent" href="/clusters">
              All clusters →
            </Link>
          </div>
          <div className="grid grid--3">
            {clusters.map((c) => (
              <article key={c.key} className="card cluster">
                <Link className="card__shot" href={`/clusters/${c.key}`}>
                  <figure className="frame frame--wide16 has-image" data-cms-img>
                    <img
                      src={
                        c.imageUrl ||
                        '/assets/photos/image-unavailable.svg'
                      }
                      alt={c.name}
                      loading="lazy"
                    />
                  </figure>
                </Link>
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{c.dzongkhag}</p>
                  <h3 className="card__title">
                    <Link href={`/clusters/${c.key}`}>{c.name}</Link>
                  </h3>
                  <p className="card__text clamp-3">{c.summary}</p>
                  {(c.members > 0 || (c.established && c.established !== 2026)) && <p className="card__meta">
                    {[c.members > 0 ? `${c.members} artisans` : null, c.established && c.established !== 2026 ? `Established ${c.established}` : null].filter(Boolean).join(' · ')}
                  </p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 8. Members Section */}
      {relatedErrors.members && <section className="section"><p role="alert">Member listings are temporarily unavailable.</p></section>}
      {members.length > 0 && (
        <section className="section">
          <div className="section__head">
            <div>
              <p className="eyebrow eyebrow--accent">Members</p>
              <h2 className="display display--sub">Who practises it</h2>
            </div>
            <Link className="link-accent" href="/members">
              Search the directory →
            </Link>
          </div>
          <div className="grid grid--3">
            {members.map((m: any, i: number) => (
              <article key={i} className="card">
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{m.dzongkhag}</p>
                  <h3 className="card__title">
                    <Link href={`/members/${encodeURIComponent(m.regNumber || m.name)}`}>{m.name}</Link>
                  </h3>
                  <p className="card__text clamp-3">{m.blurb}</p>
                  {m.member_since && <p className="card__meta">HAB member since {m.member_since}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 9. Next / Prev Bottom Navigation */}
      {prevCraft && nextCraft && <section className="section section--last">
        <nav className="craftnav" aria-label="Other crafts">
          <Link className="craftnav__link" href={`/craft/${prevCraft.key}`}>
            <span className="craftnav__hint">← Previous craft</span>
            <span>{prevCraft.name} · {prevCraft.english}</span>
          </Link>
          <Link className="craftnav__link craftnav__link--next" href={`/craft/${nextCraft.key}`}>
            <span className="craftnav__hint">Next craft →</span>
            <span>{nextCraft.name} · {nextCraft.english}</span>
          </Link>
        </nav>
      </section>}

      <UniversalLiveSectionEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        sectionType="crafts"
        sectionTitle={`${craft.name} · ${craft.english}`}
        studioHref="/admin/crafts"
      />
    </main>
  );
}
