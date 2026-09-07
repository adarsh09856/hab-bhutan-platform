'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SAMPLE_MEMBERS, CRAFTS, SAMPLE_PRODUCTS } from '@/lib/data';
import ProductCard from '@/components/public/ProductCard';

export default function MemberProfilePage() {
  const params = useParams();
  const rawSlug = params.slug as string;
  const decodedName = decodeURIComponent(rawSlug || '');

  const member =
    SAMPLE_MEMBERS.find((m) => m.name.toLowerCase() === decodedName.toLowerCase()) ||
    SAMPLE_MEMBERS[0];

  const craft = CRAFTS.find((c) => c.key === member.craftKey) || CRAFTS[0];

  const memberProducts = SAMPLE_PRODUCTS.filter((p) => p.maker === member.name);

  return (
    <main className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-10 pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <Link href="/members" className="hover:underline">Members</Link> /{' '}
        <span>{member.name}</span>
      </div>

      {/* Profile Header */}
      <div className="grid grid-cols-[0.95fr_1.05fr] gap-[52px] items-start mb-20">
        {/* Left: Portrait */}
        <div data-cms-img className="aspect-square rounded-[14px] bg-[#E8E1D4] border border-[#E4DDD1] overflow-hidden relative shadow-sm">
          <img
            src={`/images/crafts/${craft.key}.jpg`}
            alt={`${member.name} — ${craft.name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <span className="absolute bottom-4 left-4 z-10 font-mono text-[11px] text-[#F4F0E7] bg-[#33261F]/85 backdrop-blur-sm px-3 py-1.5 rounded-[5px] border border-white/20">
            {member.name} · {craft.english}
          </span>
        </div>

        {/* Right: Info & Story */}
        <div className="flex flex-col">
          <div className="flex gap-2 items-center mb-3">
            <span className="font-mono text-[10.5px] bg-[#F1E9DB] text-[#8B2E24] px-2.5 py-1 rounded">
              {craft.name} · {craft.english}
            </span>
            <span className="font-mono text-[10.5px] bg-[#EFF0E4] text-[#4C6B41] px-2.5 py-1 rounded">
              HAB verified
            </span>
          </div>

          <h1 className="font-marcellus text-[44px] font-normal leading-[1.06] text-[#33261F] mb-3">
            {member.name}
          </h1>

          <div className="font-lora text-[15px] text-[#6B5A4C] mb-5">
            {member.dz}, Bhutan · HAB member since {member.year} · Reg. HAB-{member.year}-{100 + SAMPLE_MEMBERS.indexOf(member)}
          </div>

          <p className="font-lora text-[17px] leading-[1.62] text-[#4A3C33] mb-8">
            {member.bio} Working in living adherence to classical Bhutanese design treatises, utilizing sustainably harvested local materials and passing the heritage to apprentices in their community.
          </p>

          {/* Stat Strip */}
          <div className="grid grid-cols-3 border-t border-b border-[#E4DDD1] py-4 mb-8">
            <div>
              <div className="font-figtree font-bold text-[24px] text-[#33261F]">
                {memberProducts.length}
              </div>
              <div className="font-lora text-[13px] text-[#6B5A4C]">
                Products in shop
              </div>
            </div>
            <div>
              <div className="font-figtree font-bold text-[24px] text-[#33261F]">
                {2026 - member.year} yrs
              </div>
              <div className="font-lora text-[13px] text-[#6B5A4C]">
                Registered with HAB
              </div>
            </div>
            <div>
              <div className="font-figtree font-bold text-[24px] text-[#33261F]">
                {member.dz}
              </div>
              <div className="font-lora text-[13px] text-[#6B5A4C]">
                Dzongkhag
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex gap-4">
            <a
              href="#member-products"
              className="font-figtree font-semibold text-[14.5px] bg-[#33261F] text-[#F4F0E7] px-6 py-3.5 rounded-[7px] hover:bg-[#8B2E24] transition-colors"
            >
              Shop this member&apos;s work
            </a>
            <Link
              href="/about#contact"
              className="font-figtree font-semibold text-[14.5px] border border-[#33261F] text-[#33261F] px-6 py-3.5 rounded-[7px] hover:bg-[#33261F] hover:text-white transition-colors"
            >
              Request a wholesale quote
            </Link>
          </div>
        </div>
      </div>

      {/* Member Products in Shop */}
      <section id="member-products" className="border-t border-[#E4DDD1] pt-14">
        <div className="mb-8">
          <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#8B2E24] mb-2">
            In the HAB Shop
          </div>
          <h2 className="font-marcellus text-[32px] font-normal text-[#33261F]">
            Pieces made by {member.name}
          </h2>
        </div>

        {memberProducts.length > 0 ? (
          <div className="grid grid-cols-4 gap-[22px]">
            {memberProducts.map((p) => (
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
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-10 text-center text-[#6B5A4C] font-lora">
            This member&apos;s pieces are currently rotating in consignment. New batch arriving soon.
          </div>
        )}
      </section>
    </main>
  );
}
