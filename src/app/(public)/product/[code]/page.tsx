'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { SAMPLE_PRODUCTS, CRAFTS, SAMPLE_MEMBERS } from '@/lib/data';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/public/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { fmt, alt } = useCurrency();
  const { addToCart } = useCart();

  const code = params.code as string;
  const product = SAMPLE_PRODUCTS.find((p) => p.code === code) || SAMPLE_PRODUCTS[0];
  const craft = CRAFTS.find((c) => c.key === product.craftKey) || CRAFTS[0];
  const makerMember = SAMPLE_MEMBERS.find((m) => m.name === product.maker);

  const relatedProducts = SAMPLE_PRODUCTS.filter(
    (p) => p.craftKey === product.craftKey && p.code !== product.code
  ).concat(SAMPLE_PRODUCTS.filter((p) => p.code !== product.code)).slice(0, 4);

  const handleBuyNow = () => {
    addToCart(product.code);
    router.push('/basket');
  };

  return (
    <main className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-10 pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <Link href="/shop" className="hover:underline">E-shop</Link> /{' '}
        <Link href={`/shop/${craft.key}`} className="hover:underline">{craft.name}</Link> /{' '}
        <span>{product.code}</span>
      </div>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-14 items-start mb-24">
        {/* Left: Gallery */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 aspect-[4/3] rounded-[12px] ph-light border border-[#E4DDD1] flex items-end p-4">
            <span className="font-mono text-[11px] text-[#86745F] bg-[#FFFCF8] px-2.5 py-1 rounded-[5px]">
              product shot 1 — {product.code} primary angle
            </span>
          </div>
          <div className="aspect-square rounded-[12px] ph-light border border-[#E4DDD1] flex items-end p-3">
            <span className="font-mono text-[10px] text-[#86745F] bg-[#FFFCF8] px-2 py-0.5 rounded">
              shot 2 — craft detail
            </span>
          </div>
          <div className="aspect-square rounded-[12px] ph-light border border-[#E4DDD1] flex items-end p-3">
            <span className="font-mono text-[10px] text-[#86745F] bg-[#FFFCF8] px-2 py-0.5 rounded">
              shot 3 — in use / context
            </span>
          </div>
        </div>

        {/* Right: Buy Column */}
        <div className="flex flex-col">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8B2E24] mb-2">
            {craft.name} · {craft.english}
          </div>
          <h1 className="font-marcellus text-[38px] font-normal leading-[1.08] text-[#33261F] mb-3">
            {product.name}
          </h1>

          <div className="mb-6">
            <div className="font-figtree font-bold text-[26px] text-[#33261F]">
              {fmt(product.price)}
            </div>
            <div className="font-lora text-[13.5px] text-[#6B5A4C]">
              {alt(product.price)} · duties and local taxes payable on arrival
            </div>
          </div>

          <p className="font-lora text-[16.5px] leading-[1.6] text-[#4A3C33] mb-8">
            {product.desc}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => addToCart(product.code)}
              className="flex-1 font-figtree font-semibold text-[15px] bg-[#8B2E24] text-white p-4 rounded-[9px] hover:bg-[#6E241C] transition-colors cursor-pointer"
            >
              Add to basket
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="font-figtree font-semibold text-[15px] border border-[#33261F] text-[#33261F] px-6 py-4 rounded-[9px] hover:bg-[#33261F] hover:text-white transition-colors cursor-pointer"
            >
              Buy now
            </button>
          </div>

          {/* Spec Table */}
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] divide-y divide-[#EFE9DE] mb-8">
            <div className="flex justify-between p-[13px_16px] text-[14px]">
              <span className="text-[#6B5A4C] font-lora">Reference</span>
              <span className="font-mono text-[13px] text-[#33261F]">{product.code}</span>
            </div>
            <div className="flex justify-between p-[13px_16px] text-[14px]">
              <span className="text-[#6B5A4C] font-lora">Craft</span>
              <span className="font-figtree text-[#33261F]">{craft.name} · {craft.english}</span>
            </div>
            <div className="flex justify-between p-[13px_16px] text-[14px]">
              <span className="text-[#6B5A4C] font-lora">Origin</span>
              <span className="font-figtree text-[#33261F]">{product.region}, Bhutan</span>
            </div>
            <div className="flex justify-between p-[13px_16px] text-[14px]">
              <span className="text-[#6B5A4C] font-lora">Made by</span>
              <span className="font-figtree text-[#33261F]">{product.maker}</span>
            </div>
            <div className="flex justify-between p-[13px_16px] text-[14px]">
              <span className="text-[#6B5A4C] font-lora">Lead time</span>
              <span className="font-figtree text-[#33261F]">Ships in 2 working days</span>
            </div>
          </div>

          {/* Maker Card */}
          <Link
            href={`/members/${encodeURIComponent(product.maker)}`}
            className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-[18px] flex items-center gap-4 hover:border-[#33261F] transition-colors group"
          >
            <div className="w-[54px] h-[54px] rounded-full ph-light border border-[#E4DDD1] flex-none" />
            <div className="flex-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B5A4C]">
                Made by
              </div>
              <div className="font-figtree font-semibold text-[16px] text-[#33261F] group-hover:text-[#8B2E24] transition-colors">
                {product.maker}
              </div>
              <div className="font-lora text-[13.5px] text-[#6B5A4C]">
                {product.region} · HAB verified member
              </div>
            </div>
            <span className="text-[#8B2E24] text-[18px] group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Related Products */}
      <section className="border-t border-[#E4DDD1] pt-14">
        <h2 className="font-marcellus text-[30px] font-normal text-[#33261F] mb-8">
          More from {craft.name}
        </h2>
        <div className="grid grid-cols-4 gap-[22px]">
          {relatedProducts.map((p) => (
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
    </main>
  );
}
