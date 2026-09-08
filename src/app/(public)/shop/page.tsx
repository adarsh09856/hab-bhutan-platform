'use client';

import React from 'react';
import Link from 'next/link';
import { CRAFTS, SAMPLE_PRODUCTS } from '@/lib/data';
import ProductCard from '@/components/public/ProductCard';

export default function ShopLandingPage() {
  const newArrivals = SAMPLE_PRODUCTS.slice(0, 4);
  const bestSellers = SAMPLE_PRODUCTS.slice(4, 8);

  const collections = [
    {
      key: 'under50',
      name: 'Under $50',
      desc: 'Gifts and everyday treasures, hand-carved, woven, or folded by verified artisans.',
      count: '4 pieces',
      slot: 'Handmade Daphne Paper & Gifts',
      image: '/images/products/dez01.jpg',
      filterParam: 'collection=under50',
    },
    {
      key: 'textiles',
      name: 'Textiles & weaving',
      desc: 'Yathra wool, kisuthara silk, and backstrap-loom heritage from Bumthang and Lhuentse.',
      count: '4 pieces',
      slot: 'Master Weaving & Textiles',
      image: '/images/crafts/thagzo.jpg',
      filterParam: 'craft=thagzo',
    },
    {
      key: 'home',
      name: 'Home & table',
      desc: 'Turned maple dapa bowls, split bamboo baskets, and handmade daphne paper stationery.',
      count: '4 pieces',
      slot: 'Turned Maple Burl Tableware',
      image: '/images/products/dap02.jpg',
      filterParam: 'collection=home',
    },
  ];

  return (
    <main className="pb-24">
      {/* 1. Promo Hero Panel */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-12">
        <div className="bg-[#33261F] text-[#F1ECE2] rounded-[16px] overflow-hidden grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#C9A46A] mb-3 sm:mb-4">
              The HAB E-Shop
            </div>
            <h1 className="font-marcellus text-2xl sm:text-4xl lg:text-[52px] font-normal leading-[1.08] lg:leading-[1.04] tracking-[-0.008em] mb-4 sm:mb-5 [text-wrap:balance] text-white">
              Handmade in Bhutan, bought fairly, shipped worldwide
            </h1>
            <p className="font-lora text-sm sm:text-base lg:text-[17.5px] leading-[1.62] text-[#D2C2AE] mb-6 sm:mb-8 max-w-[50ch]">
              Every piece in the catalogue is purchased upfront from a registered member of the Handicrafts Association of Bhutan at an agreed price, supporting rural households across all 20 dzongkhags.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/shop/all"
                className="font-figtree font-semibold text-center text-[15px] bg-[#8B2E24] text-white px-6 py-3.5 rounded-[7px] hover:bg-[#6E241C] transition-colors"
              >
                Shop all products
              </Link>
              <a
                href="#shop-crafts"
                className="font-figtree font-semibold text-center text-[15px] border border-[#4E3D2E] text-[#F1ECE2] px-6 py-3.5 rounded-[7px] hover:border-white transition-colors"
              >
                Shop by craft ↓
              </a>
            </div>
          </div>

          <div data-cms-img className="relative min-h-[260px] sm:min-h-[420px] bg-[#42332A] flex items-end p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-[#4E3D2E] overflow-hidden">
            <img
              src="/images/outlets/thimphu.jpg"
              alt="Authentic Bhutanese Crafts Exhibition and Market"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
            <span className="relative z-10 font-mono text-[10.5px] sm:text-[11.5px] text-[#F4F0E7] bg-[#33261F]/90 backdrop-blur-sm px-2.5 py-1.5 rounded border border-white/20">
              Authentic Bhutanese artisan crafts collection
            </span>
          </div>
        </div>
      </section>

      {/* 2. Service Bar */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 mb-12 sm:mb-16">
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E4DDD1] p-4 sm:p-6 text-center gap-4 sm:gap-0">
          <div className="pt-2 sm:pt-0 sm:px-4">
            <div className="font-figtree font-bold text-sm sm:text-[15.5px] text-[#33261F] mb-1">
              Worldwide shipping
            </div>
            <div className="font-lora text-xs sm:text-[13.5px] text-[#6B5A4C]">
              EMS via Bhutan Post, tracked, 7–14 days. Free over $200.
            </div>
          </div>
          <div className="pt-4 sm:pt-0 sm:px-4">
            <div className="font-figtree font-bold text-sm sm:text-[15.5px] text-[#33261F] mb-1">
              Duty made clear
            </div>
            <div className="font-lora text-xs sm:text-[13.5px] text-[#6B5A4C]">
              Commercial invoice and craft certificate in every parcel.
            </div>
          </div>
          <div className="pt-4 sm:pt-0 sm:px-4">
            <div className="font-figtree font-bold text-sm sm:text-[15.5px] text-[#33261F] mb-1">
              14-day returns
            </div>
            <div className="font-lora text-xs sm:text-[13.5px] text-[#6B5A4C]">
              Unused authentic pieces returned within 14 days of delivery.
            </div>
          </div>
          <div className="pt-4 sm:pt-0 sm:px-4">
            <div className="font-figtree font-bold text-sm sm:text-[15.5px] text-[#33261F] mb-1">
              Secure payment
            </div>
            <div className="font-lora text-xs sm:text-[13.5px] text-[#6B5A4C]">
              3-D Secure cards, mBoB and bank transfer, USD or Nu.
            </div>
          </div>
        </div>
      </section>

      {/* 3. New Arrivals */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 mb-12 sm:mb-20">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.2] text-[#33261F] mb-1">
              New arrivals
            </h2>
            <div className="font-mono text-[11px] text-[#6B5A4C]">
              Added to the catalogue this month
            </div>
          </div>
          <Link
            href="/shop/all"
            className="font-figtree text-sm sm:text-[15px] font-semibold text-[#8B2E24] hover:underline"
          >
            All products →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-[22px]">
          {newArrivals.map((p) => (
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
      </section>

      {/* 4. Shop by Craft Grid */}
      <section id="shop-crafts" className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 mb-12 sm:mb-20">
        <div className="mb-6 sm:mb-8">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-2">
            The Thirteen Crafts
          </div>
          <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.2] text-[#33261F]">
            Shop by craft category
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {CRAFTS.map((c) => (
            <Link
              key={c.key}
              href={`/shop/${c.key}`}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] overflow-hidden p-3 sm:p-4 flex flex-col hover:border-[#33261F] transition-colors group"
            >
              <div data-cms-img className="aspect-[3/2] bg-[#E8E1D4] rounded-[6px] border border-[#E4DDD1] mb-3 overflow-hidden relative">
                <img
                  src={`/images/crafts/${c.key}.jpg`}
                  alt={`${c.name} — ${c.english}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2 left-2 z-10 font-mono text-[9px] sm:text-[10px] text-[#F4F0E7] bg-[#33261F]/80 backdrop-blur-sm px-2 py-0.5 rounded truncate max-w-[90%]">
                  {c.english}
                </span>
              </div>
              <div className="font-figtree font-bold text-sm sm:text-[16px] text-[#33261F] group-hover:text-[#8B2E24] transition-colors">
                {c.name}
              </div>
              <div className="font-lora text-xs sm:text-[13px] text-[#6B5A4C] mb-2 sm:mb-3 truncate">
                {c.english}
              </div>
              <div className="font-mono text-[10.5px] sm:text-[11px] text-[#8B2E24] mt-auto">
                Browse craft →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Collections */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 mb-12 sm:mb-20">
        <div className="mb-6 sm:mb-8">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-2">
            Curated Lines
          </div>
          <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.2] text-[#33261F]">
            Featured collections
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {collections.map((col) => (
            <div
              key={col.key}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] overflow-hidden flex flex-col p-5 sm:p-6"
            >
              <div data-cms-img className="aspect-[16/9] bg-[#E8E1D4] rounded-[8px] border border-[#E4DDD1] mb-4 sm:mb-5 overflow-hidden relative">
                <img
                  src={col.image}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2.5 left-2.5 z-10 font-mono text-[10px] sm:text-[10.5px] text-[#F4F0E7] bg-[#33261F]/85 backdrop-blur-sm px-2.5 py-1 rounded">
                  {col.slot}
                </span>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-figtree font-bold text-base sm:text-[19px] text-[#33261F]">
                  {col.name}
                </h3>
                <span className="font-mono text-[11.5px] text-[#8B2E24]">
                  {col.count}
                </span>
              </div>
              <p className="font-lora text-xs sm:text-[14.5px] leading-[1.55] text-[#6B5A4C] mb-6 flex-1">
                {col.desc}
              </p>
              <Link
                href={`/shop/all?${col.filterParam}`}
                className="font-figtree font-semibold text-xs sm:text-[14.5px] text-[#8B2E24] hover:underline"
              >
                Shop the collection →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Best Sellers */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 mb-12 sm:mb-20">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.2] text-[#33261F] mb-1">
              Most bought
            </h2>
            <div className="font-mono text-[11px] text-[#6B5A4C]">
              Popular pieces central to living Bhutanese traditions
            </div>
          </div>
          <Link
            href="/shop/all"
            className="font-figtree text-sm sm:text-[15px] font-semibold text-[#8B2E24] hover:underline"
          >
            All products →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-[22px]">
          {bestSellers.map((p) => (
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
      </section>

      {/* 7. Closing Split Panels */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#6B5A4C] mb-3">
                Behind the work
              </div>
              <h3 className="font-marcellus text-xl sm:text-[28px] font-normal text-[#33261F] mb-3">
                Meet the makers
              </h3>
              <p className="font-lora text-xs sm:text-[15px] text-[#4A3C33] leading-[1.6] mb-6">
                Discover the stories, weaving villages, and family woodcarving studios across Bhutan represented in the HAB catalogue.
              </p>
            </div>
            <Link
              href="/members"
              className="self-start font-figtree font-semibold text-xs sm:text-[14px] bg-[#33261F] text-[#F4F0E7] px-5 sm:px-6 py-3 sm:py-3.5 rounded-[7px] hover:bg-[#8B2E24] transition-colors"
            >
              Browse member directory →
            </Link>
          </div>

          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#6B5A4C] mb-3">
                Institutional &amp; Hospitality
              </div>
              <h3 className="font-marcellus text-xl sm:text-[28px] font-normal text-[#33261F] mb-3">
                Trade &amp; wholesale
              </h3>
              <p className="font-lora text-xs sm:text-[15px] text-[#4A3C33] leading-[1.6] mb-6">
                We supply luxury hotels, international galleries, and ethical retailers with authenticated, volume orders produced to consistent specification.
              </p>
            </div>
            <Link
              href="/about#contact"
              className="self-start font-figtree font-semibold text-xs sm:text-[14px] border border-[#33261F] text-[#33261F] px-5 sm:px-6 py-3 sm:py-3.5 rounded-[7px] hover:bg-[#33261F] hover:text-[#F4F0E7] transition-colors"
            >
              Request a wholesale quote →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
