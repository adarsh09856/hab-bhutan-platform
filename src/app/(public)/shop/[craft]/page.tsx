'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CRAFTS, SAMPLE_PRODUCTS } from '@/lib/data';
import ProductCard from '@/components/public/ProductCard';

export default function ShopGridPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const craftParam = params.craft as string;
  const isAll = !craftParam || craftParam === 'all';
  const currentCraft = CRAFTS.find((c) => c.key === craftParam);

  const [sortOrder, setSortOrder] = useState<'new' | 'low' | 'high'>('new');
  const collectionParam = searchParams.get('collection');

  // Filter products
  const filteredProducts = useMemo(() => {
    let prods = SAMPLE_PRODUCTS.filter((p) => {
      if (!isAll && p.craftKey !== craftParam) return false;
      if (collectionParam === 'under50' && p.price >= 50) return false;
      if (collectionParam === 'home' && !['tshazo', 'shagzo', 'dezo'].includes(p.craftKey)) return false;
      return true;
    });

    if (sortOrder === 'low') {
      prods = [...prods].sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'high') {
      prods = [...prods].sort((a, b) => b.price - a.price);
    }

    return prods;
  }, [craftParam, isAll, collectionParam, sortOrder]);

  // Craft counts
  const craftCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SAMPLE_PRODUCTS.forEach((p) => {
      counts[p.craftKey] = (counts[p.craftKey] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-16 sm:pb-24">
      {/* Breadcrumbs */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6 sm:mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <Link href="/shop" className="hover:underline">E-shop</Link> /{' '}
        <span>{isAll ? 'All crafts' : currentCraft?.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[246px_1fr] gap-8 lg:gap-11 items-start">
        {/* Left Filter Rail / Mobile Filter Bar */}
        <aside className="lg:sticky lg:top-[100px] flex flex-col gap-4 sm:gap-6">
          <div>
            <div className="font-figtree font-bold text-xs sm:text-[13.5px] text-[#33261F] uppercase tracking-[0.05em] mb-2 sm:mb-3">
              Craft category
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
                <span>All crafts</span>
                <span className="font-mono text-[10px] sm:text-[11px] text-[#6B5A4C] bg-white/70 px-1.5 py-0.5 rounded">
                  {SAMPLE_PRODUCTS.length}
                </span>
              </Link>

              {CRAFTS.map((c) => {
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
                        {c.name}
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
            </div>
          </div>

          {/* Sort Select */}
          <div className="flex sm:flex-col items-center sm:items-start justify-between gap-2">
            <label className="font-figtree font-bold text-xs sm:text-[13.5px] text-[#33261F] uppercase tracking-[0.05em] block mb-0 sm:mb-2 flex-none">
              Sort by
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full sm:w-full max-w-[200px] sm:max-w-none bg-[#FFFCF8] border border-[#CDBEA8] rounded-[8px] p-2 sm:p-2.5 font-figtree text-xs sm:text-[13.5px] text-[#33261F] outline-none"
            >
              <option value="new">Newest additions</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>

          {/* Shipping Policy Note */}
          <div className="hidden lg:block bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] p-4 text-[13px] font-lora text-[#6B5A4C] leading-[1.5]">
            EMS / Bhutan Post worldwide, 7–14 days. Duties and customs are payable on arrival — see the notes at checkout.
          </div>
        </aside>

        {/* Right Catalog Content */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-marcellus text-2xl sm:text-3xl lg:text-[42px] font-normal leading-[1.1] text-[#33261F] mb-2">
              {isAll ? 'The HAB e-shop' : `${currentCraft?.name} — ${currentCraft?.english}`}
            </h1>
            <p className="font-lora text-sm sm:text-base lg:text-[16.5px] text-[#6B5A4C] max-w-[70ch] leading-[1.55]">
              {isAll
                ? 'Every piece is bought from a registered member at a fair price and sold centrally by HAB. Browse by craft category.'
                : currentCraft?.description}
            </p>
          </div>

          {currentCraft && (
            <div data-cms-img className="aspect-[16/9] sm:aspect-[24/7] rounded-[12px] bg-[#E8E1D4] border border-[#E4DDD1] overflow-hidden relative shadow-sm">
              <img
                src={`/images/crafts/${currentCraft.key}.jpg`}
                alt={`${currentCraft.name} — ${currentCraft.english}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 sm:left-4 z-10 flex flex-wrap items-center gap-2 sm:gap-3 max-w-[90%]">
                <span className="font-figtree font-bold text-sm sm:text-[17px] text-white">
                  {currentCraft.name} ({currentCraft.dzongkha})
                </span>
                <span className="font-mono text-[10px] sm:text-[11px] text-[#F4F0E7]/90 bg-[#33261F]/80 backdrop-blur-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded truncate">
                  {currentCraft.english} · Living Zorig Chusum
                </span>
              </div>
            </div>
          )}

          {/* Product Grid or Empty State */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-[22px]">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.code}
                  code={p.code}
                  name={p.name}
                  priceUSD={p.price}
                  craftKey={p.craftKey}
                  region={p.region}
                  maker={p.maker}
                />
              ))}
            </div>
          ) : (
            /* Empty State Contract: Section 2.6.3 */
            <div className="border-2 border-dashed border-[#CDBEA8] rounded-[14px] p-6 sm:p-12 text-center flex flex-col items-center justify-center my-6">
              <h3 className="font-marcellus text-xl sm:text-[28px] font-normal text-[#33261F] mb-3">
                Nothing listed in {currentCraft?.name || 'this craft'} right now
              </h3>
              <p className="font-lora text-xs sm:text-[16px] text-[#6B5A4C] max-w-[58ch] mb-6 sm:mb-8 leading-[1.6]">
                HAB buys in batches from registered master artisans, so stock in this category rotates throughout the year. You can commission a custom piece directly or register for restock notifications.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/about#contact"
                  className="font-figtree font-semibold text-xs sm:text-[14.5px] bg-[#33261F] text-[#F4F0E7] px-6 py-3.5 rounded-[7px] hover:bg-[#8B2E24] transition-colors"
                >
                  Commission a piece
                </Link>
                <Link
                  href="/shop/all"
                  className="font-figtree font-semibold text-xs sm:text-[14.5px] border border-[#CDBEA8] text-[#33261F] px-6 py-3.5 rounded-[7px] hover:border-[#33261F] transition-colors"
                >
                  Browse all crafts →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
