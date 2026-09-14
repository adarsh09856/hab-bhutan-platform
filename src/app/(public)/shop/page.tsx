'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { CRAFTS } from '@/lib/data';

interface ProductItem {
  code: string;
  name: string;
  craftKey: string;
  craft_name?: string;
  maker: string;
  region?: string;
  price: number;
  priceUSD: number;
  image_path?: string;
  slot?: string;
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  { code: 'LHA01', name: 'Guru Rinpoche Mineral-Pigment Thangka', craftKey: 'lhazo', craft_name: 'Lhazo · Painting', maker: 'Sonam Thangka Studio', region: 'Paro', price: 260, priceUSD: 260, image_path: '/assets/photos/product-hhb01.jpg', slot: 'photo 1 — thangka, full view' },
  { code: 'SAD03', name: 'Yathra Wool Saddle Bag', craftKey: 'thagzo', craft_name: 'Thagzo · Weaving', maker: 'Chumey Yathra House', region: 'Bumthang', price: 120, priceUSD: 120, image_path: '/assets/photos/product-sad03.jpg', slot: 'photo 1 — saddle bag, full view' },
  { code: 'TRO04', name: 'Hand-Chased Silver Koma Clasp Pair', craftKey: 'troezo', craft_name: 'Troezo · Silver & Gold', maker: 'Zorig Silversmiths', region: 'Thimphu', price: 92, priceUSD: 92, image_path: '/assets/photos/product-cam01.jpg', slot: 'photo 1 — koma pair, full view' },
  { code: 'FTB04', name: 'Two-Tier Bangchung Basket', craftKey: 'tshazo', craft_name: 'Tshazo · Cane & Bamboo', maker: 'Kheng Bamboo Collective', region: 'Zhemgang', price: 34, priceUSD: 34, image_path: '/assets/photos/product-lud01.jpg', slot: 'photo 1 — bangchung basket, full view' },
  { code: 'DAP02', name: 'Turned Maple Burl Dapa Bowl with Lid', craftKey: 'shagzo', craft_name: 'Shagzo · Woodturning', maker: 'Yangtse Turning Works', region: 'Trashiyangtse', price: 48, priceUSD: 48, image_path: '/assets/photos/hero-5-desho.jpg', slot: 'photo 1 — dapa bowl, full view' },
  { code: 'DEZ01', name: 'Daphne Desho Handmade Paper (10 Sheets)', craftKey: 'dezo', craft_name: 'Dezo · Papermaking', maker: 'Jungshi Paper Works', region: 'Punakha', price: 18, priceUSD: 18, image_path: '/assets/photos/hero-4-textiles.jpg', slot: 'photo 1 — desho paper, full view' },
  { code: 'MAS01', name: 'Carved Wooden Garuda Dance Mask', craftKey: 'parzo', craft_name: 'Parzo · Woodcarving', maker: 'Kelzang Dorji Woodworks', region: 'Trashiyangtse', price: 68, priceUSD: 68, image_path: '/assets/photos/hero-3-clay.jpg', slot: 'photo 1 — dance mask, full view' },
  { code: 'CUS02', name: 'Raw Silk Supplementary Weft Cushion Cover', craftKey: 'thagzo', craft_name: 'Thagzo · Weaving', maker: 'Khoma Weavers Group', region: 'Lhuentse', price: 54, priceUSD: 54, image_path: '/assets/photos/hero-1-weaving.jpg', slot: 'photo 1 — silk cushion, full view' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCraft = searchParams.get('craft') || '';

  const { fmt } = useCurrency();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [selectedCraft, setSelectedCraft] = useState<string>(initialCraft);
  const [sortOrder, setSortOrder] = useState<'new' | 'low' | 'high'>('new');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');

const PRODUCT_POOL = [
  '/assets/photos/product-sad03.jpg',
  '/assets/photos/product-hhb01.jpg',
  '/assets/photos/product-lud01.jpg',
  '/assets/photos/product-cam01.jpg',
];

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(
            data.products.map((p: any, idx: number) => {
              let img = p.image_path || p.imageUrl;
              if (!img || img.includes('placeholder') || img.includes('training_workshop')) {
                img = `/images/products/${p.code.toLowerCase()}.jpg`;
              }
              return {
                code: p.code,
                name: p.name,
                craftKey: p.craftKey || 'craft',
                craft_name: p.craft?.name ? `${p.craft.name} · ${p.craft.english}` : p.craftKey,
                maker: typeof p.maker === 'object' ? p.maker?.name : (p.maker || 'Verified Member'),
                region: p.region || p.dzongkhag || 'Bhutan',
                price: p.priceUSD || p.price || 0,
                priceUSD: p.priceUSD || p.price || 0,
                image_path: img,
                slot: p.slot || p.code,
              };
            })
          );
        }
      })
      .catch(() => {});
  }, []);

  const craftCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.craftKey] = (counts[p.craftKey] || 0) + 1;
    });
    return counts;
  }, [products]);

  const activeCraftMeta = useMemo(() => {
    return CRAFTS.find((c) => c.key === selectedCraft);
  }, [selectedCraft]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.slice();

    if (selectedCraft) {
      result = result.filter((p) => p.craftKey === selectedCraft);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.maker.toLowerCase().includes(q) ||
        p.craftKey.toLowerCase().includes(q)
      );
    }

    if (sortOrder === 'low') {
      result.sort((a, b) => a.priceUSD - b.priceUSD);
    } else if (sortOrder === 'high') {
      result.sort((a, b) => b.priceUSD - a.priceUSD);
    }

    return result;
  }, [products, selectedCraft, searchQuery, sortOrder]);

  return (
    <main id="main">

      <section className="section">
        {/* 1. Breadcrumbs */}
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/shop" onClick={() => setSelectedCraft('')}>E-shop</Link> / <span>{activeCraftMeta ? activeCraftMeta.name : 'All crafts'}</span>
        </p>

        <div className="shopgrid">

          {/* 2. Left Rail: Categories & Sort */}
          <aside>
            <h2 className="railtitle">Craft category</h2>
            <div className="rail" id="shopRail">
              <button
                type="button"
                className={`rail__row ${!selectedCraft ? 'is-active' : ''}`}
                onClick={() => setSelectedCraft('')}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, cursor: 'pointer' }}
              >
                <span className="rail__name">All crafts</span>
                <span className="rail__n">{products.length}</span>
              </button>

              {CRAFTS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`rail__row ${selectedCraft === c.key ? 'is-active' : ''}`}
                  onClick={() => setSelectedCraft(c.key)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, cursor: 'pointer' }}
                >
                  <span>
                    <span className="rail__name">{c.name}</span>
                    <span className="rail__en">{c.english}</span>
                  </span>
                  <span className="rail__n">{craftCounts[c.key] || 0}</span>
                </button>
              ))}
            </div>

            <div className="railtitle" id="shopSortWrap" style={{ marginTop: '22px' }}>
              <label className="field__label" htmlFor="shopSort">Sort</label>
              <select
                className="input"
                id="shopSort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="new">Newest</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </div>
          </aside>

          {/* 3. Main Products Area */}
          <div>
            <p className="shopswitch">
              Buying for a shop, hotel or distributor? <Link href="/wholesale">See trade pricing and MOQs →</Link>
            </p>

            <h1 className="display display--band" id="shopTitle">
              {activeCraftMeta ? `${activeCraftMeta.name} — ${activeCraftMeta.english}` : 'The HAB e-shop'}
            </h1>

            <p className="section__lede" id="shopLede" style={{ marginBottom: '18px' }}>
              {activeCraftMeta
                ? `Work in ${activeCraftMeta.english.toLowerCase()}, one of the thirteen crafts of Zorig Chusum, bought from registered members at an agreed price and sold centrally by HAB.`
                : 'Every piece is bought from a registered member at a fair price and sold centrally by HAB. Browse by craft category on the left.'}
            </p>

            <div className="actions" style={{ marginBottom: '22px' }}>
              {selectedCraft && (
                <button
                  type="button"
                  className="btn btn--accent btn--sm"
                  onClick={() => setSelectedCraft('')}
                >
                  View all products
                </button>
              )}
              {selectedCraft && (
                <Link className="btn btn--outline btn--sm" href={`/craft/${selectedCraft}`}>
                  About this craft →
                </Link>
              )}
              <span className="craft__count" id="shopCount" style={{ margin: 0, alignSelf: 'center' }}>
                {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>

            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid--3" id="shopProducts">
                {filteredAndSortedProducts.map((p) => (
                  <article key={p.code} className="card product">
                    <Link className="product__shot" href={`/product/${p.code}`}>
                      <figure className="frame frame--square has-image">
                        <img
                          src={(p as any).image_path || ((p as any).images && (p as any).images[0]?.url) || `/assets/photos/product-${p.code.toLowerCase()}.jpg`}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes('/assets/photos/product-')) {
                              target.src = `/assets/photos/product-${p.code.toLowerCase()}.jpg`;
                            } else {
                              target.src = '/assets/photos/product-hhb01.jpg';
                            }
                          }}
                        />
                      </figure>
                      <span className="product__ref">{p.code}</span>
                    </Link>

                    <div className="card__body">
                      <p className="eyebrow eyebrow--accent eyebrow--sm">{p.craft_name || p.craftKey}</p>
                      <h3 className="card__title clamp-2">
                        <Link href={`/product/${p.code}`}>{p.name}</Link>
                      </h3>
                      <p className="card__meta clamp-1">{p.maker} · {p.region}</p>
                      <div className="card__foot">
                        <span className="price">{fmt(p.priceUSD)}</span>
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
                ))}
              </div>
            ) : (
              <div className="shopempty" id="shopEmpty">
                <h2 className="shopempty__title">
                  Nothing online in {activeCraftMeta ? activeCraftMeta.name : 'this category'} yet
                </h2>
                <p className="shopempty__body">
                  {activeCraftMeta?.description
                    ? `${activeCraftMeta.name} is commissioned rather than shipped. Send the secretariat your specification and we will match it to a member who practises it.`
                    : 'This craft is commissioned rather than shipped. Send the secretariat your specification and we will match it to a member who practises it.'}
                </p>
                <div className="actions" style={{ justifyContent: 'center' }}>
                  <Link
                    className="btn btn--accent"
                    href={`/contact?topic=commission${activeCraftMeta ? `&craft=${encodeURIComponent(activeCraftMeta.name)}` : ''}`}
                  >
                    Enquire about a commission
                  </Link>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => { setSelectedCraft(''); setSearchQuery(''); }}
                  >
                    Browse all crafts
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 4. Assurance Strip */}
      <section className="section section--last">
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

    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<main id="main"><section className="section"><p>Loading shop…</p></section></main>}>
      <ShopContent />
    </Suspense>
  );
}
