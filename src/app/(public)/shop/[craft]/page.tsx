'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/public/ProductCard';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import ProductQuickEdit from '@/components/public/ProductQuickEdit';
import { useLanguage } from '@/context/LanguageContext';

interface ShopCraft {
  key: string;
  name: string;
  english: string;
  dzongkha?: string;
  description?: string;
  bannerUrl?: string;
}

function ShopGridContent() {
  const { language, t } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();

  const craftParam = params.craft as string;
  const isAll = !craftParam || craftParam === 'all';
  const [crafts, setCrafts] = useState<ShopCraft[]>([]);
  const [craftsLoading, setCraftsLoading] = useState(true);
  const [craftsError, setCraftsError] = useState(false);
  const currentCraft = crafts.find((c) => c.key === craftParam);

  const [sortOrder, setSortOrder] = useState<'new' | 'low' | 'high'>('new');
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState(false);
  const [productEditorOpen, setProductEditorOpen] = useState(false);
  const collectionParam = searchParams.get('collection');

  React.useEffect(() => {
    fetch('/api/crafts', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Crafts unavailable')))
      .then(data => {
        if (!data?.success || !Array.isArray(data.crafts)) throw new Error('Crafts unavailable');
        setCrafts(data.crafts);
      })
      .catch(() => setCraftsError(true))
      .finally(() => setCraftsLoading(false));
  }, []);

  React.useEffect(() => {
    fetch('/api/products?shuffle=false', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('Catalogue unavailable')))
      .then((data) => {
        if (data?.success && Array.isArray(data.products)) {
          setProductsList(data.products);
          setCatalogueError(false);
        } else throw new Error('Invalid catalogue response');
      })
      .catch(() => setCatalogueError(true))
      .finally(() => setLoading(false));
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let prods = productsList.filter((p) => {
      const price = p.priceUSD || p.price || 0;
      if (!isAll && p.craftKey !== craftParam) return false;
      if (collectionParam === 'under50' && price >= 50) return false;
      if (collectionParam === 'home' && !['tsharo-zo', 'shag-zo', 'de-zo', 'tshazo', 'shagzo', 'dezo'].includes(p.craftKey)) return false;
      return true;
    });

    if (sortOrder === 'low') {
      prods = [...prods].sort((a, b) => (a.priceUSD || a.price) - (b.priceUSD || b.price));
    } else if (sortOrder === 'high') {
      prods = [...prods].sort((a, b) => (b.priceUSD || b.price) - (a.priceUSD || a.price));
    }

    return prods;
  }, [productsList, craftParam, isAll, collectionParam, sortOrder]);

  // Craft counts
  const craftCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productsList.forEach((p) => {
      counts[p.craftKey] = (counts[p.craftKey] || 0) + 1;
    });
    return counts;
  }, [productsList]);

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-16 sm:pb-24 relative" data-hab-section="shop-craft">
      <SectionEditBadge label="Craft products: add / edit / remove" studioHref="/admin/products" onQuickEdit={() => setProductEditorOpen(true)} />
      <ProductQuickEdit isOpen={productEditorOpen} onClose={() => setProductEditorOpen(false)} />
      {/* Breadcrumbs */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6 sm:mb-8">
        <Link href="/" className="hover:underline">{t('nav.home')}</Link> /{' '}
        <Link href="/shop" className="hover:underline">{t('shop.title')}</Link> /{' '}
        <span>{isAll ? t('shop.all_crafts') : language === 'dz' ? currentCraft?.dzongkha || currentCraft?.name : currentCraft?.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[246px_1fr] gap-8 lg:gap-11 items-start">
        {/* Left Filter Rail / Mobile Filter Bar */}
        <aside className="lg:sticky lg:top-[100px] flex flex-col gap-4 sm:gap-6">
          <div>
            <div className="font-figtree font-bold text-xs sm:text-[13.5px] text-[#33261F] uppercase tracking-[0.05em] mb-2 sm:mb-3">
              {t('shop.filter_by_craft')}
            </div>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-1.5 lg:gap-0 bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] p-2 lg:p-0 lg:divide-y lg:divide-[#EFE9DE] no-scrollbar">
              <Link
                href="/shop/all"
                className={`p-2 sm:p-[10px_14px] flex-none lg:flex-initial flex items-center justify-between gap-2 text-xs sm:text-[13.5px] font-figtree rounded-lg lg:rounded-none transition-colors ${
                  isAll
                    ? 'bg-[#F1E9DB] font-bold text-[#8B2E24]'
                    : 'text-[#33261F] hover:bg-[#F4F0E7]'
                }`}
              >
                <span>{t('shop.all_crafts')}</span>
                <span className="font-mono text-[10px] sm:text-[11px] text-[#6B5A4C] bg-white/70 px-1.5 py-0.5 rounded">
                  {productsList.length}
                </span>
              </Link>

              {crafts.map((c) => {
                const isActive = craftParam === c.key;
                const count = craftCounts[c.key] || 0;
                return (
                  <Link
                    key={c.key}
                    href={`/shop/${c.key}`}
                    className={`p-2 sm:p-[10px_14px] flex-none lg:flex-initial flex items-center justify-between gap-3 rounded-lg lg:rounded-none transition-colors ${
                      isActive
                        ? 'bg-[#F1E9DB] text-[#8B2E24]'
                        : 'text-[#33261F] hover:bg-[#F4F0E7]'
                    }`}
                  >
                    <div>
                      <div className={`font-figtree text-xs sm:text-[13.5px] whitespace-nowrap lg:whitespace-normal ${isActive ? 'font-bold' : 'font-medium'}`}>
                        {language === 'dz' ? c.dzongkha || c.name : c.name}
                      </div>
                      <div className="hidden lg:block font-lora text-[11.5px] text-[#6B5A4C]">
                        {c.english}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] sm:text-[11px] text-[#6B5A4C] bg-white/70 px-1.5 py-0.5 rounded">
                      {count}
                    </span>
                  </Link>
                );
              })}
              {craftsError && <p className="p-3 text-sm" role="alert">{t('shop.craft_error')}</p>}
            </div>
          </div>

          {/* Sort Select */}
          <div className="flex sm:flex-col items-center sm:items-start justify-between gap-2">
            <label className="font-figtree font-bold text-xs sm:text-[13.5px] text-[#33261F] uppercase tracking-[0.05em] block mb-0 sm:mb-2 flex-none">
              {t('shop.sort_by')}
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full sm:w-full max-w-[200px] sm:max-w-none bg-[#FFFCF8] border border-[#CDBEA8] rounded-[8px] p-2 sm:p-2.5 font-figtree text-xs sm:text-[13.5px] text-[#33261F] outline-none"
            >
              <option value="new">{t('shop.sort_new')}</option>
              <option value="low">{t('shop.sort_low')}</option>
              <option value="high">{t('shop.sort_high')}</option>
            </select>
          </div>

          {/* Shipping Policy Note */}
          <div className="hidden lg:block bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] p-4 text-[13px] font-lora text-[#6B5A4C] leading-[1.5]">
            {t('shop.shipping_note')}
          </div>
        </aside>

        {/* Right Catalog Content */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-marcellus text-2xl sm:text-3xl lg:text-[42px] font-normal leading-[1.1] text-[#33261F] mb-2">
              {isAll ? t('shop.title') : currentCraft ? language === 'dz' && currentCraft.dzongkha ? currentCraft.dzongkha : `${currentCraft.name} — ${currentCraft.english}` : craftsLoading ? t('shop.loading_craft') : t('shop.craft_unavailable')}
            </h1>
            <p className="font-lora text-sm sm:text-base lg:text-[16.5px] text-[#6B5A4C] max-w-[70ch] leading-[1.55]">
              {isAll
                ? t('shop.intro')
                : currentCraft?.description || ''}
            </p>
          </div>

          {currentCraft && (
            <div data-cms-img className="aspect-[16/9] sm:aspect-[24/7] rounded-[12px] bg-[#E8E1D4] border border-[#E4DDD1] overflow-hidden relative shadow-sm">
              <img
                src={currentCraft.bannerUrl || '/assets/photos/image-unavailable.svg'}
                alt={`${currentCraft.name} — ${currentCraft.english}`}
                className="w-full h-full object-cover"
                onError={event => { (event.currentTarget as HTMLImageElement).src = '/assets/photos/image-unavailable.svg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 sm:left-4 z-10 flex flex-wrap items-center gap-2 sm:gap-3 max-w-[90%]">
                <span className="font-figtree font-bold text-sm sm:text-[17px] text-white">
                  {currentCraft.name}{currentCraft.dzongkha?.trim() ? ` (${currentCraft.dzongkha})` : ''}
                </span>
                <span className="font-mono text-[10px] sm:text-[11px] text-[#F4F0E7]/90 bg-[#33261F]/80 backdrop-blur-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded truncate">
                  {currentCraft.english} · {t('shop.living_zorig')}
                </span>
              </div>
            </div>
          )}

          {/* Product Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-[22px]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : catalogueError ? (
            <div className="border border-[#CDBEA8] rounded-[14px] p-6 sm:p-12 text-center my-6" role="alert">
              {t('shop.catalogue_error')}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-[22px]">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.code}
                  code={p.code}
                  name={p.name}
                  priceUSD={p.priceUSD ?? p.price}
                  craftKey={p.craftKey}
                  region={p.region}
                  maker={typeof p.maker === 'object' ? p.maker?.name : p.maker}
                  imageUrl={p.imageUrl || p.image_path || (p.images && p.images[0]?.url)}
                  images={p.images}
                  stock={p.stock}
                />
              ))}
            </div>
          ) : (
            /* Empty State Contract: Section 2.6.3 */
            <div className="border-2 border-dashed border-[#CDBEA8] rounded-[14px] p-6 sm:p-12 text-center flex flex-col items-center justify-center my-6">
              <h3 className="font-marcellus text-xl sm:text-[28px] font-normal text-[#33261F] mb-3">
                {t('shop.empty_title')} {language === 'dz' ? currentCraft?.dzongkha || currentCraft?.name : currentCraft?.name || t('shop.this_craft')}
              </h3>
              <p className="font-lora text-xs sm:text-[16px] text-[#6B5A4C] max-w-[58ch] mb-6 sm:mb-8 leading-[1.6]">
                {t('shop.empty_body')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href={`/contact?topic=commission${currentCraft ? `&craft=${encodeURIComponent(currentCraft.name)}` : ''}`}
                  className="font-figtree font-semibold text-xs sm:text-[14.5px] bg-[#33261F] text-[#F4F0E7] px-6 py-3.5 rounded-[7px] hover:bg-[#8B2E24] transition-colors"
                >
                  {t('shop.commission')}
                </Link>
                <Link
                  href="/shop/all"
                  className="font-figtree font-semibold text-xs sm:text-[14.5px] border border-[#CDBEA8] text-[#33261F] px-6 py-3.5 rounded-[7px] hover:border-[#33261F] transition-colors"
                >
                  {t('shop.browse_all')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ShopGridPage() {
  const { t } = useLanguage();
  return (
    <React.Suspense fallback={<div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-sm font-mono text-[#6B5A4C]">{t('shop.loading_craft')}</div>}>
      <ShopGridContent />
    </React.Suspense>
  );
}
