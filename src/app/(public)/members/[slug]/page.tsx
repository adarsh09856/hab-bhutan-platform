'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CRAFTS } from '@/lib/data';
import ProductCard from '@/components/public/ProductCard';

export default function MemberProfilePage() {
  const params = useParams();
  const rawSlug = params.slug as string;
  const decodedName = decodeURIComponent(rawSlug || '');
  const [dbMember, setDbMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rawSlug) return;
    setLoading(true);
    fetch(`/api/members?slug=${encodeURIComponent(decodedName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.member) {
          setDbMember({
            name: data.member.name,
            craftKey: data.member.craftKey,
            dz: data.member.dzongkhag,
            village: data.member.dzongkhag || 'Central',
            year: data.member.joinYear || 2026,
            tier: data.member.tier || 'ACTIVE_SECTOR_MEMBER',
            productsCount: data.member.products?.length || 0,
            bio: data.member.bio || `Master artisan practicing ${data.member.craftKey} in ${data.member.dzongkhag}.`,
            verified: data.member.status === 'VERIFIED',
            regNumber: data.member.regNumber,
            dbProducts: data.member.products || [],
          });
        } else {
          setDbMember(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching live member profile:', err);
        setDbMember(null);
      })
      .finally(() => setLoading(false));
  }, [rawSlug, decodedName]);

  if (loading) {
    return (
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-24">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
          <div className="aspect-[4/3] bg-slate-200 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
            <div className="h-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (!dbMember) {
    return (
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 pb-24 text-center">
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-2xl p-12 max-w-lg mx-auto">
          <h1 className="font-marcellus text-2xl text-[#33261F] mb-3">Artisan Profile Not Found</h1>
          <p className="font-lora text-sm text-[#6B5A4C] mb-6">
            The requested member profile could not be found or has not yet completed accreditation.
          </p>
          <Link
            href="/members"
            className="inline-block px-5 py-2.5 bg-[#8B2E24] text-white rounded-lg text-sm font-medium hover:bg-[#72251D] transition-colors"
          >
            ← Return to Member Directory
          </Link>
        </div>
      </main>
    );
  }

  const member = dbMember;
  const craft = CRAFTS.find((c) => c.key === member.craftKey) || CRAFTS[0];
  const memberProducts = member.dbProducts;

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-16 sm:pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6 sm:mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <Link href="/members" className="hover:underline">Members</Link> /{' '}
        <span>{member.name}</span>
      </div>

      {/* Profile Header */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-[52px] items-start mb-12 sm:mb-20">
        {/* Left: Portrait */}
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[16px] overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center">
          <div data-cms-avatar className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#E8E1D4] border-2 border-[#E4DDD1] overflow-hidden mb-6 relative">
            <img
              src={`/images/crafts/${member.craftKey}.jpg`}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>

          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8B2E24] bg-[#F1E9DB] px-3 py-1 rounded-full mb-3">
            {craft?.name} · {craft?.english}
          </span>

          <h1 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal text-[#33261F] mb-2">
            {member.name}
          </h1>

          <div className="font-lora text-sm sm:text-base text-[#6B5A4C] mb-4">
            {member.dz} Dzongkhag · Member since {member.year}
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#4C6B41] bg-[#EFF0E4] px-3 py-1 rounded-full border border-[#D5DCBF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4C6B41]" />
            <span>HAB Accredited Artisan (Reg: {member.regNumber})</span>
          </div>
        </div>

        {/* Right: Bio & Curatorial Profile */}
        <div className="space-y-6">
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[16px] p-6 sm:p-8">
            <h2 className="font-marcellus text-xl sm:text-2xl text-[#33261F] mb-4">
              Artisan Profile &amp; Lineage
            </h2>
            <p className="font-lora text-base leading-[1.7] text-[#4A3C33] whitespace-pre-line">
              {member.bio}
            </p>
          </div>

          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[16px] p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-mono text-[11px] text-[#8B2E24] uppercase">Tradition</div>
              <div className="font-figtree font-bold text-base text-[#33261F] mt-1">{craft?.name}</div>
            </div>
            <div>
              <div className="font-mono text-[11px] text-[#8B2E24] uppercase">Location</div>
              <div className="font-figtree font-bold text-base text-[#33261F] mt-1">{member.dz}</div>
            </div>
            <div>
              <div className="font-mono text-[11px] text-[#8B2E24] uppercase">Works Listed</div>
              <div className="font-figtree font-bold text-base text-[#33261F] mt-1">{memberProducts.length} pieces</div>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Shop Works */}
      <section className="border-t border-[#E4DDD1] pt-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8B2E24] mb-2">
              Authentic Handcrafted Works
            </div>
            <h2 className="font-marcellus text-2xl sm:text-3xl text-[#33261F]">
              Pieces by {member.name}
            </h2>
          </div>
          <Link
            href="/shop"
            className="font-figtree text-sm font-semibold text-[#8B2E24] hover:underline"
          >
            All catalog items →
          </Link>
        </div>

        {memberProducts.length === 0 ? (
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-10 text-center">
            <p className="font-lora text-sm text-[#6B5A4C]">
              No active pieces currently in stock for this artisan. Inquire at officehab@gmail.com for custom commissions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {memberProducts.map((p: any) => (
              <ProductCard
                key={p.code}
                code={p.code}
                name={p.name}
                priceUSD={p.priceUSD}
                craftKey={p.craftKey || member.craftKey}
                region={p.region || member.dz}
                maker={member.name}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
