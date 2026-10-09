'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { CRAFTS } from '@/lib/data';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import ProductQuickEdit from '@/components/public/ProductQuickEdit';

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

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCraft = searchParams.get('craft') || '';

  const { fmt } = useCurrency();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [catalogueState, setCatalogueState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedCraft, setSelectedCraft] = useState<string>(initialCraft);
  const [sortOrder, setSortOrder] = useState<'new' | 'low' | 'high'>('new');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [productEditorOpen, setProductEditorOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
    const craft = searchParams.get('craft');
    if (craft !== null) {
      setSelectedCraft(craft);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/products?shuffle=false', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('Catalogue unavailable')))
      .then((data) => {
        if (data?.success && Array.isArray(data.products)) {
          setProducts(
            data.products.map((p: any) => {
              let img = p.image_path || p.imageUrl || '/assets/photos/image-unavailable.svg';
              if (img.includes('placeholder') || img.includes('training_workshop')) img = '/assets/photos/image-unavailable.svg';
              return {
                code: p.code,
                name: p.name,
                craftKey: p.craftKey || 'craft',
                craft_name: p.craft?.name ? `${p.craft.name} · ${p.craft.english}` : p.craftKey,
                maker: typeof p.maker === 'object' ? (p.maker?.name || '') : (p.maker || ''),
                region: p.region || p.dzongkhag || '',
                price: Number(p.priceUSD ?? p.price ?? 0),
                priceUSD: Number(p.priceUSD ?? p.price ?? 0),
                image_path: img,
                slot: p.slot || p.code,
              };
            })
          );
          setCatalogueState('ready');
        } else {
          setCatalogueState('error');
        }
      })
      .catch(() => setCatalogueState('error'));
  }, []);

  const handleShuffle = () => {
    setProducts((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  };

  // Continuous 6-second auto-shuffle of catalog products (Item: auto 5-7s)
  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      handleShuffle();
    }, 6000);
    return () => clearInterval(interval);
  }, [products.length]);

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
      <section className="section relative" data-hab-section="shop">
        <SectionEditBadge label="Shop products: add / edit / remove" studioHref="/admin/products" onQuickEdit={() => setProductEditorOpen(true)} />
        <ProductQuickEdit isOpen={productEditorOpen} onClose={() => setProductEditorOpen(false)} />
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
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={handleShuffle}
                title="Shuffle products catalog"
                style={{ cursor: 'pointer', marginLeft: 'auto' }}
              >
                🔀 Shuffle Catalog
              </button>
            </div>

            {catalogueState === 'loading' ? (
              <div className="shopempty" role="status">Loading current products…</div>
            ) : catalogueState === 'error' ? (
              <div className="shopempty" role="alert">The product catalogue is temporarily unavailable. Please refresh this page shortly.</div>
            ) : filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid--3" id="shopProducts">
                {filteredAndSortedProducts.map((p) => (
                  <article key={p.code} className="card product">
                    <Link className="product__shot" href={`/product/${p.code}`}>
                      <figure className="frame frame--square has-image">
                        <img
                          src={p.image_path || '/assets/photos/image-unavailable.svg'}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes('/assets/photos/image-unavailable.svg')) target.src = '/assets/photos/image-unavailable.svg';
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
                      <p className="card__meta clamp-1">{[p.maker, p.region].filter(Boolean).join(' · ')}</p>
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
                  Nothing online in {activeCraftMeta ? activeCraftMeta.name : 'the shop'} yet
                </h2>
                <p className="shopempty__body">
                  {searchQuery.trim()
                    ? 'No saved products match this search. Try another term or browse all crafts.'
                    : 'No saved products are available in this view right now. Contact the Secretariat for craft enquiries.'}
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
            <p className="assurance__body">mBoB and bank transfers are reviewed by HAB. Online card processing is not configured.</p>
          </div>
        </div>
      </section>

    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<main id="main"><section className="section"><h1 className="display display--page">The HAB e-shop</h1><p>Loading shop…</p></section></main>}>
      <ShopContent />
    </Suspense>
  );
}
