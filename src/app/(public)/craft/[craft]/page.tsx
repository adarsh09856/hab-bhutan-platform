'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  CLIENT_DATA, 
  getCraftByKey, 
  getProductsForCraft,
  CraftData
} from '@/lib/client-data';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function CraftProfilePage() {
  const params = useParams();
  const craftKey = (params.craft as string) || 'thagzo';

  const [craft, setCraft] = useState<CraftData>(() => getCraftByKey(craftKey) || CLIENT_DATA.crafts[0]);

  const [products, setProducts] = useState<any[]>(() => getProductsForCraft(craft.key));
  const [clusters, setClusters] = useState<any[]>(() => CLIENT_DATA.clusters.filter((c) => c.craft_key === craft.key));
  const [members, setMembers] = useState<any[]>(() => (CLIENT_DATA.members || []).filter((m: any) => m.craft_key === craft.key));

  useEffect(() => {
    fetch(`/api/crafts?key=${encodeURIComponent(craftKey)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.craft) setCraft(d.craft);
      })
      .catch(() => {});

    // Fetch live products for this craft
    fetch(`/api/products?craft=${encodeURIComponent(craftKey)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.products && Array.isArray(d.products) && d.products.length > 0) {
          setProducts(
            d.products.map((p: any) => ({
              code: p.code,
              name: p.name,
              craft_key: p.craftKey || p.craft_key,
              region: p.region || 'Bhutan',
              maker: p.maker?.name || p.maker || 'Registered Master',
              price: p.priceUSD || p.price,
              hero_image: p.images?.[0]?.url || p.hero_image || 'assets/photos/hero-1-weaving.jpg',
              summary: p.description || p.summary || '',
            }))
          );
        }
      })
      .catch(() => {});

    // Fetch live clusters for this craft
    fetch('/api/clusters')
      .then((r) => r.json())
      .then((d) => {
        if (d?.clusters && Array.isArray(d.clusters)) {
          const matching = d.clusters.filter((c: any) => (c.craftKey || c.craft_key) === craftKey);
          if (matching.length > 0) {
            setClusters(
              matching.map((c: any) => ({
                key: c.key,
                name: c.name,
                craft_key: c.craftKey || c.craft_key,
                dzongkhag: c.dzongkhag,
                members: c.members,
                summary: c.summary,
              }))
            );
          }
        }
      })
      .catch(() => {});
  }, [craftKey]);

  const craftIndex = CLIENT_DATA.crafts.findIndex((c) => c.key === craft.key);
  const totalCrafts = CLIENT_DATA.crafts.length;

  const prevCraft = CLIENT_DATA.crafts[(craftIndex - 1 + totalCrafts) % totalCrafts];
  const nextCraft = CLIENT_DATA.crafts[(craftIndex + 1) % totalCrafts];

  const [activeSlide, setActiveSlide] = useState(0);
  const { addToCart } = useCart();
  const { fmt } = useCurrency();

  // Auto-flipper
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slideCaptions = [
    `photo 1 — ${craft.english.toLowerCase()}, the work in progress`,
    `photo 2 — ${craft.english.toLowerCase()}, tools and materials`,
    `photo 3 — ${craft.english.toLowerCase()}, a finished piece`,
  ];

  const triptychCaptions = [
    `large photo — a ${craft.name} workshop`,
    'photo — detail of the technique',
    'photo — the maker at work',
  ];

  const historyParas = (craft.history || '')
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);

  const longDescParas = (craft.long_description || craft.description || '')
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);

  const historyWordCount = (craft.history || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const badgeNum = ('0' + craft.sort_order).slice(-2) + '/13 · ZORIG CHUSUM';

  return (
    <main id="main">
      {/* 1. Hero & Breadcrumbs */}
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/#crafts">Zorig Chusum</Link> / <span>{craft.name}</span>
        </p>

        <div className="craftpage-hero">
          <div>
            <span className="craftpage-hero__badge">{badgeNum}</span>
            <h1 className="display display--hero">{craft.name}</h1>
            <p className="craftpage-hero__en">{craft.english}</p>
            <p className="craftpage-hero__lede">{craft.description}</p>
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
            {slideCaptions.map((cap, i) => (
              <div
                key={i}
                className={`flipper__slide ${activeSlide === i ? 'is-on' : ''}`}
                data-cms-img
              >
                <img
                  src={`/images/crafts/${craft.key}.jpg`}
                  alt={cap}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `/images/hero-${(i % 5) + 1}.jpg`;
                  }}
                />
                <span className="flipper__cap">{cap}</span>
              </div>
            ))}
            <div className="flipper__dots">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`flipper__dot ${activeSlide === i ? 'is-on' : ''}`}
                  onClick={() => setActiveSlide(i)}
                  aria-label={`Show photograph ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Facts Strip */}
      <section className="section section--tight">
        <div className="craftfacts">
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Craft</span>
            <span className="craftfacts__val">{craft.name} · {craft.english}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Technique</span>
            <span className="craftfacts__val">{craft.technique || 'Traditional artisanal method'}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Materials</span>
            <span className="craftfacts__val">{craft.materials || 'Locally sourced Bhutanese materials'}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Practised in</span>
            <span className="craftfacts__val">{craft.practised_in || 'Across Bhutanese Dzongkhags'}</span>
          </div>
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
              <p className="section__lede">
                Written for HAB. Around {Math.round(historyWordCount / 10) * 10} words.
              </p>
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
      <section className="section section--tight">
        <div className="triptych">
          {triptychCaptions.map((cap, i) => (
            <div key={i} className="triptych__cell">
              <figure className="frame frame--wide16 has-image" data-cms-img>
                <img
                  src={i === 0 ? `/images/hero-1.jpg` : i === 1 ? `/images/product-sad03.jpg` : `/images/hero-3.jpg`}
                  alt={cap}
                  className="w-full h-full object-cover"
                />
                <figcaption className="frame__caption frame__caption--sm">{cap}</figcaption>
              </figure>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Products in the shop / Made to commission */}
      <section className="section" id="craftShop">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">
              {products.length > 0
                ? `${products.length} ${products.length === 1 ? 'piece' : 'pieces'} in the HAB shop`
                : 'Not sold online'}
            </p>
            <h2 className="display display--sub">In the shop</h2>
          </div>
          <Link className="btn btn--ink btn--sm" href="/shop">
            All products →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid--4" data-cms-repeat>
            {products.map((p) => (
              <article key={p.code} className="card product" data-cms-item data-code={p.code}>
                <Link className="product__shot" href={`/product/${p.code}`}>
                  <figure className="frame frame--square has-image" data-cms-img>
                    <img
                      src={p.image_path || `/images/product-sad03.jpg`}
                      alt={p.name}
                      loading="lazy"
                    />
                    <figcaption className="frame__caption frame__caption--sm">
                      photo — {p.name.toLowerCase()}
                    </figcaption>
                  </figure>
                  <span className="product__ref">{p.code}</span>
                </Link>
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{craft.name}</p>
                  <h3 className="card__title clamp-2">
                    <Link href={`/product/${p.code}`}>{p.name}</Link>
                  </h3>
                  <p className="card__meta clamp-1">
                    {p.maker} · {p.region}
                  </p>
                  <div className="card__foot">
                    <span className="price">{fmt(p.price_usd)}</span>
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
            <h3 className="shopempty__title">Made to commission</h3>
            <p className="shopempty__body">
              {craft.shop_note ||
                `${craft.name} is commissioned rather than shipped. Send the secretariat your specification and we will match it to a member who practises it.`}
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
                      src={`/images/hero-${(c.sort_order || 1) % 5 + 1}.jpg`}
                      alt={c.name}
                      loading="lazy"
                    />
                    <figcaption className="frame__caption frame__caption--sm">
                      {c.name}
                    </figcaption>
                  </figure>
                </Link>
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{c.dzongkhag}</p>
                  <h3 className="card__title">
                    <Link href={`/clusters/${c.key}`}>{c.name}</Link>
                  </h3>
                  <p className="card__text clamp-3">{c.summary}</p>
                  <p className="card__meta">
                    {c.members} artisans · Established {c.established}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 8. Members Section */}
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
                    <Link href={`/members/${encodeURIComponent(m.name)}`}>{m.name}</Link>
                  </h3>
                  <p className="card__text clamp-3">{m.blurb}</p>
                  <p className="card__meta">HAB member since {m.member_since}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 9. Next / Prev Bottom Navigation */}
      <section className="section section--last">
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
      </section>
    </main>
  );
}
