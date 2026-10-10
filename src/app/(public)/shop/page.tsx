'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import ProductQuickEdit from '@/components/public/ProductQuickEdit';
import { useLanguage } from '@/context/LanguageContext';

interface ShopCraft {
  key: string;
  name: string;
  english: string;
  dzongkha?: string;
  description?: string;
}

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
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const initialCraft = searchParams.get('craft') || '';

  const { fmt } = useCurrency();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [crafts, setCrafts] = useState<ShopCraft[]>([]);
  const [craftsState, setCraftsState] = useState<'loading' | 'ready' | 'error'>('loading');
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
    fetch('/api/crafts', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Crafts unavailable')))
      .then(data => {
        if (!data?.success || !Array.isArray(data.crafts)) throw new Error('Crafts unavailable');
        setCrafts(data.crafts);
        setCraftsState('ready');
      })
      .catch(() => setCraftsState('error'));
  }, []);

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
    return crafts.find((c) => c.key === selectedCraft);
  }, [crafts, selectedCraft]);

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
          <Link href="/">{t('nav.home')}</Link> / <Link href="/shop" onClick={() => setSelectedCraft('')}>{t('shop.title')}</Link> / <span>{activeCraftMeta ? language === 'dz' && activeCraftMeta.dzongkha ? activeCraftMeta.dzongkha : activeCraftMeta.name : t('shop.all_crafts')}</span>
        </p>

        <div className="shopgrid">

          {/* 2. Left Rail: Categories & Sort */}
          <aside>
            <h2 className="railtitle">{t('shop.filter_by_craft')}</h2>
            <div className="rail" id="shopRail">
              <button
                type="button"
                className={`rail__row ${!selectedCraft ? 'is-active' : ''}`}
                onClick={() => setSelectedCraft('')}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, cursor: 'pointer' }}
              >
                <span className="rail__name">{t('shop.all_crafts')}</span>
                <span className="rail__n">{products.length}</span>
              </button>

              {crafts.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`rail__row ${selectedCraft === c.key ? 'is-active' : ''}`}
                  onClick={() => setSelectedCraft(c.key)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, cursor: 'pointer' }}
                >
                  <span>
                    <span className="rail__name">{language === 'dz' && c.dzongkha ? c.dzongkha : c.name}</span>
                    <span className="rail__en">{c.english}</span>
                  </span>
                  <span className="rail__n">{craftCounts[c.key] || 0}</span>
                </button>
              ))}
              {craftsState !== 'ready' && <p className="px-3 py-2 text-sm" role="status">{craftsState === 'loading' ? t('shop.loading_craft') : t('shop.craft_error')}</p>}
              {craftsState === 'ready' && crafts.length === 0 && <p className="px-3 py-2 text-sm">{t('shop.no_crafts')}</p>}
            </div>

            <div className="railtitle" id="shopSortWrap" style={{ marginTop: '22px' }}>
              <label className="field__label" htmlFor="shopSort">{t('shop.sort_by')}</label>
              <select
                className="input"
                id="shopSort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="new">{t('shop.sort_new')}</option>
                <option value="low">{t('shop.sort_low')}</option>
                <option value="high">{t('shop.sort_high')}</option>
              </select>
            </div>
          </aside>

          {/* 3. Main Products Area */}
          <div>
            <p className="shopswitch">
              {t('shop.trade_prompt')} <Link href="/wholesale">{t('shop.trade_link')}</Link>
            </p>

            <h1 className="display display--band" id="shopTitle">
              {selectedCraft ? activeCraftMeta ? language === 'dz' && activeCraftMeta.dzongkha ? activeCraftMeta.dzongkha : `${activeCraftMeta.name} — ${activeCraftMeta.english}` : craftsState === 'loading' ? t('shop.loading_craft') : t('shop.craft_unavailable') : t('shop.title')}
            </h1>

            <p className="section__lede" id="shopLede" style={{ marginBottom: '18px' }}>
              {selectedCraft
                ? activeCraftMeta?.description || ''
                : t('shop.intro')}
            </p>

            <div className="actions" style={{ marginBottom: '22px' }}>
              {selectedCraft && (
                <button
                  type="button"
                  className="btn btn--accent btn--sm"
                  onClick={() => setSelectedCraft('')}
                >
                  {t('menu.all_products')}
                </button>
              )}
              {selectedCraft && (
                <Link className="btn btn--outline btn--sm" href={`/craft/${selectedCraft}`}>
                  {t('shop.about_craft')}
                </Link>
              )}
              <span className="craft__count" id="shopCount" style={{ margin: 0, alignSelf: 'center' }}>
                {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? t('shop.product_one') : t('shop.product_many')}
              </span>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={handleShuffle}
                title="Shuffle products catalog"
                style={{ cursor: 'pointer', marginLeft: 'auto' }}
              >
                🔀 {t('shop.shuffle')}
              </button>
            </div>

            {catalogueState === 'loading' ? (
              <div className="shopempty" role="status">{t('shop.loading_products')}</div>
            ) : catalogueState === 'error' ? (
              <div className="shopempty" role="alert">{t('shop.catalogue_error')}</div>
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
                          {t('shop.add_to_cart')}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="shopempty" id="shopEmpty">
                <h2 className="shopempty__title">
                  {t('shop.empty_online')} {activeCraftMeta ? language === 'dz' && activeCraftMeta.dzongkha ? activeCraftMeta.dzongkha : activeCraftMeta.name : t('shop.the_shop')}
                </h2>
                <p className="shopempty__body">
                  {searchQuery.trim()
                    ? t('shop.no_search_results')
                    : t('shop.no_products')}
                </p>
                <div className="actions" style={{ justifyContent: 'center' }}>
                  <Link
                    className="btn btn--accent"
                    href={`/contact?topic=commission${activeCraftMeta ? `&craft=${encodeURIComponent(activeCraftMeta.name)}` : ''}`}
                  >
                    {t('shop.enquire_commission')}
                  </Link>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => { setSelectedCraft(''); setSearchQuery(''); }}
                  >
                    {t('shop.all_crafts')}
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
              {language === 'en' && <span className="assurance__initial">T</span>}
              <span>{language === 'en' ? 'racked Origin' : t('shop.origin_title')}</span>
            </h3>
            <p className="assurance__body">{t('shop.origin_body')}</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              {language === 'en' && <span className="assurance__initial">R</span>}
              <span>{language === 'en' ? 'egistered Chain' : t('shop.registered_title')}</span>
            </h3>
            <p className="assurance__body">{t('shop.registered_body')}</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              {language === 'en' && <span className="assurance__initial">U</span>}
              <span>{language === 'en' ? 'pfront & Fair' : t('shop.fair_title')}</span>
            </h3>
            <p className="assurance__body">{t('shop.fair_body')}</p>
          </div>
          <div className="assurance__cell">
            <h3 className="assurance__title">
              {language === 'en' && <span className="assurance__initial">E</span>}
              <span>{language === 'en' ? 'vidence-Based Payment' : t('shop.escrow_title')}</span>
            </h3>
            <p className="assurance__body">{t('shop.escrow_body')}</p>
          </div>
        </div>
      </section>

    </main>
  );
}

export default function ShopPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<main id="main"><section className="section"><h1 className="display display--page">{t('shop.title')}</h1><p>{t('shop.loading_products')}</p></section></main>}>
      <ShopContent />
    </Suspense>
  );
}
