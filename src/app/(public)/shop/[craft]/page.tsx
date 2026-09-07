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
    <main className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-10 pb-24">
      {/* Breadcrumbs */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <Link href="/shop" className="hover:underline">E-shop</Link> /{' '}
        <span>{isAll ? 'All crafts' : currentCraft?.name}</span>
      </div>

      <div className="grid grid-cols-[246px_1fr] gap-11 items-start">
        {/* Left Sticky Filter Rail */}
        <aside className="sticky top-[100px] flex flex-col gap-6">
          <div>
            <div className="font-figtree font-bold text-[13.5px] text-[#33261F] uppercase tracking-[0.05em] mb-3">
              Craft category
            </div>
            <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] divide-y divide-[#EFE9DE] overflow-hidden">
              <Link
                href="/shop/all"
                className={`p-[10px_14px] flex justify-between items-center text-[13.5px] font-figtree transition-colors ${
                  isAll
                    ? 'bg-[#F1E9DB] font-bold text-[#8B2E24]'
                    : 'text-[#33261F] hover:bg-[#F4F0E7]'
                }`}
              >
                <span>All crafts</span>
                <span className="font-mono text-[11px] text-[#6B5A4C]">
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
                    className={`p-[10px_14px] flex justify-between items-center transition-colors ${
                      isActive
                        ? 'bg-[#F1E9DB] text-[#8B2E24]'
                        : 'text-[#33261F] hover:bg-[#F4F0E7]'
                    }`}
                  >
                    <div>
                      <div className={`font-figtree text-[13.5px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                        {c.name}
                      </div>
                      <div className="font-lora text-[11.5px] text-[#6B5A4C]">
                        {c.english}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-[#6B5A4C]">
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sort Select */}
          <div>
            <label className="font-figtree font-bold text-[13.5px] text-[#33261F] uppercase tracking-[0.05em] block mb-2">
              Sort by
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full bg-[#FFFCF8] border border-[#CDBEA8] rounded-[8px] p-2.5 font-figtree text-[13.5px] text-[#33261F] outline-none"
            >
              <option value="new">Newest additions</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>

          {/* Shipping Policy Note */}
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] p-4 text-[13px] font-lora text-[#6B5A4C] leading-[1.5]">
            EMS / Bhutan Post worldwide, 7–14 days. Duties and customs are payable on arrival — see the notes at checkout.
          </div>
        </aside>

        {/* Right Catalog Content */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-marcellus text-[42px] font-normal leading-[1.06] text-[#33261F] mb-2">
              {isAll ? 'The HAB e-shop' : `${currentCraft?.name} — ${currentCraft?.english}`}
            </h1>
            <p className="font-lora text-[16.5px] text-[#6B5A4C] max-w-[70ch] leading-[1.55]">
              {isAll
                ? 'Every piece is bought from a registered member at a fair price and sold centrally by HAB. Browse by craft category on the left.'
                : currentCraft?.description}
            </p>
          </div>

          {/* Product Grid or Empty State */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-3 gap-[22px]">
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
            <div className="border-2 border-dashed border-[#CDBEA8] rounded-[14px] p-12 text-center flex flex-col items-center justify-center my-6">
              <h3 className="font-marcellus text-[28px] font-normal text-[#33261F] mb-3">
                Nothing listed in {currentCraft?.name || 'this craft'} right now
              </h3>
              <p className="font-lora text-[16px] text-[#6B5A4C] max-w-[58ch] mb-8 leading-[1.6]">
                HAB buys in batches from registered master artisans, so stock in this category rotates throughout the year. You can commission a custom piece directly or register for restock notifications.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/about#contact"
                  className="font-figtree font-semibold text-[14.5px] bg-[#33261F] text-[#F4F0E7] px-6 py-3.5 rounded-[7px] hover:bg-[#8B2E24] transition-colors"
                >
                  Commission a piece
                </Link>
                <Link
                  href="/shop/all"
                  className="font-figtree font-semibold text-[14.5px] border border-[#CDBEA8] text-[#33261F] px-6 py-3.5 rounded-[7px] hover:border-[#33261F] transition-colors"
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
