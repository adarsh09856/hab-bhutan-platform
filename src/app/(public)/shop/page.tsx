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
      slot: 'photo — small gifts flat lay',
      filterParam: 'collection=under50',
    },
    {
      key: 'textiles',
      name: 'Textiles & weaving',
      desc: 'Yathra wool, kisuthara silk, and backstrap-loom heritage from Bumthang and Lhuentse.',
      count: '4 pieces',
      slot: 'photo — folded textiles',
      filterParam: 'craft=thagzo',
    },
    {
      key: 'home',
      name: 'Home & table',
      desc: 'Turned maple dapa bowls, split bamboo baskets, and handmade daphne paper stationery.',
      count: '4 pieces',
      slot: 'photo — table setting',
      filterParam: 'collection=home',
    },
  ];

  return (
    <main className="pb-24">
      {/* 1. Promo Hero Panel */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-10 pb-12">
        <div className="bg-[#33261F] text-[#F1ECE2] rounded-[16px] overflow-hidden grid grid-cols-[1.02fr_0.98fr]">
          <div className="p-14 flex flex-col justify-center">
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#C9A46A] mb-4">
              The HAB E-Shop
            </div>
            <h1 className="font-marcellus text-[52px] font-normal leading-[1.04] tracking-[-0.008em] mb-5 [text-wrap:balance] text-white">
              Handmade in Bhutan, bought fairly, shipped worldwide
            </h1>
            <p className="font-lora text-[17.5px] leading-[1.62] text-[#D2C2AE] mb-8 max-w-[50ch]">
              Every piece in the catalogue is purchased upfront from a registered member of the Handicrafts Association of Bhutan at an agreed price, supporting rural households across all 20 dzongkhags.
            </p>
            <div className="flex gap-4">
              <Link
                href="/shop/all"
                className="font-figtree font-semibold text-[15px] bg-[#8B2E24] text-white px-6 py-3.5 rounded-[7px] hover:bg-[#6E241C] transition-colors"
              >
                Shop all products
              </Link>
              <a
                href="#shop-crafts"
                className="font-figtree font-semibold text-[15px] border border-[#4E3D2E] text-[#F1ECE2] px-6 py-3.5 rounded-[7px] hover:border-white transition-colors"
              >
                Shop by craft ↓
              </a>
            </div>
          </div>

          <div className="ph-dark min-h-[420px] flex items-end p-8 border-l border-[#4E3D2E]">
            <span className="font-mono text-[11.5px] text-[#A8947F] bg-[#33261F] px-3 py-1.5 rounded border border-[#4E3D2E]">
              shop hero — seasonal collection, styled
            </span>
          </div>
        </div>
      </section>

      {/* 2. Service Bar */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 mb-16">
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] grid grid-cols-4 divide-x divide-[#E4DDD1] p-6 text-center">
          <div>
            <div className="font-figtree font-bold text-[15.5px] text-[#33261F] mb-1">
              Worldwide shipping
            </div>
            <div className="font-lora text-[13.5px] text-[#6B5A4C]">
              EMS via Bhutan Post, tracked, 7–14 days. Free over $200.
            </div>
          </div>
          <div>
            <div className="font-figtree font-bold text-[15.5px] text-[#33261F] mb-1">
              Duty made clear
            </div>
            <div className="font-lora text-[13.5px] text-[#6B5A4C]">
              Commercial invoice and craft certificate in every parcel.
            </div>
          </div>
          <div>
            <div className="font-figtree font-bold text-[15.5px] text-[#33261F] mb-1">
              14-day returns
            </div>
            <div className="font-lora text-[13.5px] text-[#6B5A4C]">
              Unused authentic pieces returned within 14 days of delivery.
            </div>
          </div>
          <div>
            <div className="font-figtree font-bold text-[15.5px] text-[#33261F] mb-1">
              Secure payment
            </div>
            <div className="font-lora text-[13.5px] text-[#6B5A4C]">
              3-D Secure cards, mBoB and bank transfer, USD or Nu.
            </div>
          </div>
        </div>
      </section>

      {/* 3. New Arrivals */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-marcellus text-[34px] font-normal leading-[1.2] text-[#33261F] mb-1">
              New arrivals
            </h2>
            <div className="font-mono text-[11px] text-[#6B5A4C]">
              Added to the catalogue this month
            </div>
          </div>
          <Link
            href="/shop/all"
            className="font-figtree text-[15px] font-semibold text-[#8B2E24] hover:underline"
          >
            All products →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-[22px]">
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
      <section id="shop-crafts" className="max-w-[1280px] min-w-[1200px] mx-auto px-10 mb-20">
        <div className="mb-8">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-2">
            The Thirteen Crafts
          </div>
          <h2 className="font-marcellus text-[34px] font-normal leading-[1.2] text-[#33261F]">
            Shop by craft category
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {CRAFTS.map((c) => (
            <Link
              key={c.key}
              href={`/shop/${c.key}`}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] overflow-hidden p-4 flex flex-col hover:border-[#33261F] transition-colors group"
            >
              <div className="aspect-[3/2] ph-light rounded-[6px] border border-[#E4DDD1] mb-3 p-2 flex items-end">
                <span className="font-mono text-[10px] text-[#86745F] bg-[#FFFCF8] px-2 py-0.5 rounded">
                  photo — {c.english.toLowerCase()}
                </span>
              </div>
              <div className="font-figtree font-bold text-[16px] text-[#33261F] group-hover:text-[#8B2E24] transition-colors">
                {c.name}
              </div>
              <div className="font-lora text-[13px] text-[#6B5A4C] mb-3">
                {c.english}
              </div>
              <div className="font-mono text-[11px] text-[#8B2E24] mt-auto">
                Browse craft →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Collections */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 mb-20">
        <div className="mb-8">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-2">
            Curated Lines
          </div>
          <h2 className="font-marcellus text-[34px] font-normal leading-[1.2] text-[#33261F]">
            Featured collections
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {collections.map((col) => (
            <div
              key={col.key}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] overflow-hidden flex flex-col p-6"
            >
              <div className="aspect-[16/9] ph-light rounded-[8px] border border-[#E4DDD1] mb-5 p-3 flex items-end">
                <span className="font-mono text-[10.5px] text-[#86745F] bg-[#FFFCF8] px-2 py-1 rounded">
                  {col.slot}
                </span>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-figtree font-bold text-[19px] text-[#33261F]">
                  {col.name}
                </h3>
                <span className="font-mono text-[11.5px] text-[#8B2E24]">
                  {col.count}
                </span>
              </div>
              <p className="font-lora text-[14.5px] leading-[1.55] text-[#6B5A4C] mb-6 flex-1">
                {col.desc}
              </p>
              <Link
                href={`/shop/all?${col.filterParam}`}
                className="font-figtree font-semibold text-[14.5px] text-[#8B2E24] hover:underline"
              >
                Shop the collection →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Best Sellers */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-marcellus text-[34px] font-normal leading-[1.2] text-[#33261F] mb-1">
              Most bought
            </h2>
            <div className="font-mono text-[11px] text-[#6B5A4C]">
              Popular pieces central to living Bhutanese traditions
            </div>
          </div>
          <Link
            href="/shop/all"
            className="font-figtree text-[15px] font-semibold text-[#8B2E24] hover:underline"
          >
            All products →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-[22px]">
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
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-8 flex flex-col justify-between">
            <div>
              <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#6B5A4C] mb-3">
                Behind the work
              </div>
              <h3 className="font-marcellus text-[28px] font-normal text-[#33261F] mb-3">
                Meet the makers
              </h3>
              <p className="font-lora text-[15px] text-[#4A3C33] leading-[1.6] mb-6">
                Discover the stories, weaving villages, and family woodcarving studios across Bhutan represented in the HAB catalogue.
              </p>
            </div>
            <Link
              href="/members"
              className="self-start font-figtree font-semibold text-[14px] bg-[#33261F] text-[#F4F0E7] px-6 py-3.5 rounded-[7px] hover:bg-[#8B2E24] transition-colors"
            >
              Browse member directory →
            </Link>
          </div>

          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-8 flex flex-col justify-between">
            <div>
              <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#6B5A4C] mb-3">
                Institutional &amp; Hospitality
              </div>
              <h3 className="font-marcellus text-[28px] font-normal text-[#33261F] mb-3">
                Trade &amp; wholesale
              </h3>
              <p className="font-lora text-[15px] text-[#4A3C33] leading-[1.6] mb-6">
                We supply luxury hotels, international galleries, and ethical retailers with authenticated, volume orders produced to consistent specification.
              </p>
            </div>
            <Link
              href="/about#contact"
              className="self-start font-figtree font-semibold text-[14px] border border-[#33261F] text-[#33261F] px-6 py-3.5 rounded-[7px] hover:bg-[#33261F] hover:text-[#F4F0E7] transition-colors"
            >
              Request a wholesale quote →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
