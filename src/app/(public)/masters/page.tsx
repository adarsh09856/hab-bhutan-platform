'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CLIENT_DATA } from '@/lib/client-data';

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const allRecognised = CLIENT_DATA.recognised;
  const filtered = activeTab === 'ALL'
    ? allRecognised
    : allRecognised.filter((r) => r.honour === activeTab);

  const totalRecognised = allRecognised.length;
  const masterCount = allRecognised.filter((r) => r.honour === 'Master Craftsperson').length;
  const uniqueCrafts = Array.from(new Set(allRecognised.map((r) => r.craft_key))).length;
  const earliestYear = Math.min(...allRecognised.map((r) => r.since || 2026));

  return (
    <main className="pb-24">
      {/* 1. Hero Section */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-14 items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3">
              Recognition
            </p>
            <h1 className="font-marcellus text-3xl sm:text-4xl lg:text-[52px] font-normal leading-[1.06] tracking-[-0.008em] mb-4 text-[#33261F]">
              Accreditations &amp; awards
            </h1>
            <p className="font-lora text-base sm:text-[18px] leading-[1.62] text-[#4A3C33] max-w-[54ch] mb-8">
              A small number of members are recognised individually — for mastery held over a lifetime, for standards that lifted a whole craft, and for the enterprises and young artisans changing how Bhutanese work reaches a market.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#holders" className="font-figtree font-semibold text-[13.5px] bg-[#33261F] text-[#F4F0E7] px-5 py-3 rounded-[7px] hover:bg-[#1E1713] transition-colors">
                See who holds them →
              </a>
              <a href="#nominate" className="font-figtree font-semibold text-[13.5px] border border-[#CDBEA8] text-[#33261F] px-5 py-3 rounded-[7px] hover:border-[#33261F] transition-colors">
                How to nominate
              </a>
            </div>
          </div>

          <div className="aspect-[4/3] rounded-[14px] overflow-hidden border border-[#E4DDD1] shadow-sm relative">
            <img
              src="/assets/photos/hero-1-weaving.jpg"
              alt="Master artisan at work"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <p className="font-mono text-xs text-[#F4F0E7]">Master weaver at backstrap loom · Khoma, Lhuentse</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Bar */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[#E4DDD1] border border-[#E4DDD1] rounded-[12px] overflow-hidden">
          <div className="bg-[#FFFCF8] p-4 sm:p-5">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#6B5A4C] block mb-1">Recognised members</span>
            <span className="font-figtree font-bold text-2xl sm:text-3xl text-[#33261F]">{totalRecognised}</span>
          </div>
          <div className="bg-[#FFFCF8] p-4 sm:p-5">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#6B5A4C] block mb-1">Master craftspeople</span>
            <span className="font-figtree font-bold text-2xl sm:text-3xl text-[#33261F]">{masterCount}</span>
          </div>
          <div className="bg-[#FFFCF8] p-4 sm:p-5">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#6B5A4C] block mb-1">Crafts represented</span>
            <span className="font-figtree font-bold text-2xl sm:text-3xl text-[#33261F]">{uniqueCrafts} of 13</span>
          </div>
          <div className="bg-[#FFFCF8] p-4 sm:p-5">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#6B5A4C] block mb-1">Practising since</span>
            <span className="font-figtree font-bold text-2xl sm:text-3xl text-[#33261F]">{earliestYear}</span>
          </div>
        </div>
      </section>

      {/* 3. Honours Conferred by HAB */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20">
        <div className="mb-8">
          <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-2">
            Conferred by HAB
          </p>
          <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.2] text-[#33261F] mb-3">
            Recognition given by the association
          </h2>
          <p className="font-lora text-[16px] text-[#6B5A4C] max-w-[68ch]">
            Each is conferred by the Board of Trustees on nomination, and each recognises something different. None can be applied for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CLIENT_DATA.honours.map((h) => (
            <div key={h.key} className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] text-[#8B2E24] tracking-widest uppercase font-semibold block mb-2">
                  {h.cadence}
                </span>
                <h3 className="font-marcellus text-xl sm:text-2xl text-[#33261F] mb-3">
                  {h.short}
                </h3>
                <p className="font-lora text-[15px] leading-[1.6] text-[#4A3C33] mb-4">
                  {h.criteria}
                </p>
              </div>
              <div className="pt-4 border-t border-[#EFE9DE] font-mono text-xs text-[#6B5A4C]">
                {h.what}
              </div>
            </div>
          ))}
        </div>

        {/* Best Enterprise Award Box */}
        <div className="mt-8 bg-[#FFFCF8] border border-[#CDBEA8] rounded-[16px] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
          <div>
            <span className="font-mono text-[11px] text-[#8B2E24] uppercase tracking-widest font-semibold block mb-2">
              Best Enterprise Award
            </span>
            <h3 className="font-marcellus text-2xl sm:text-3xl text-[#33261F] mb-3">
              Best Craft Enterprise of the Year
            </h3>
            <p className="font-lora text-[15.5px] leading-[1.62] text-[#4A3C33] mb-6 max-w-[56ch]">
              The association’s enterprise-level recognition. It is given to the member business that has changed how a craft trades — through a shared standard, a hallmark, a market opened, or fairer terms for the artisans it works with.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-lora text-[#6B5A4C] border-t border-[#EFE9DE] pt-4">
              <div>
                <strong className="font-figtree text-[#33261F] block mb-0.5">Eligibility:</strong>
                Any Craft Enterprise or Artisan Cluster in good standing with dues paid.
              </div>
              <div>
                <strong className="font-figtree text-[#33261F] block mb-0.5">Nomination:</strong>
                By two Active Sector Members or a Dzongkhag Chapter.
              </div>
            </div>
          </div>
          <div className="bg-[#F4F0E7] p-6 rounded-[12px] border border-[#E4DDD1] space-y-3">
            <h4 className="font-figtree font-bold text-sm text-[#33261F]">Also recognised here</h4>
            <ul className="text-xs text-[#6B5A4C] space-y-2 list-disc pl-4 font-lora">
              <li>Accreditations held by HAB and by members from government agencies</li>
              <li>Awards conferred by independent trade bodies and development partners</li>
              <li>Certifications of authenticity and origin carried by member enterprises</li>
            </ul>
            <Link
              href="/contact?topic=awards"
              className="inline-block mt-3 w-full text-center font-figtree font-semibold text-xs bg-[#8B2E24] text-white py-2.5 rounded-[7px] hover:bg-[#6E241C]"
            >
              Nominate an enterprise →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Who Holds Them */}
      <section id="holders" className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-2">
              Who holds them
            </p>
            <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.2] text-[#33261F]">
              Recognised members ({filtered.length})
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-figtree font-medium transition-colors ${
                activeTab === 'ALL' ? 'bg-[#8B2E24] text-white' : 'bg-[#FFFCF8] border border-[#E4DDD1] text-[#6B5A4C] hover:border-[#33261F]'
              }`}
            >
              All awards
            </button>
            {CLIENT_DATA.honours.map((h) => (
              <button
                key={h.key}
                onClick={() => setActiveTab(h.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-figtree font-medium transition-colors ${
                  activeTab === h.key ? 'bg-[#8B2E24] text-white' : 'bg-[#FFFCF8] border border-[#E4DDD1] text-[#6B5A4C] hover:border-[#33261F]'
                }`}
              >
                {h.short}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((person, idx) => (
            <div key={idx} className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F1E9DB] text-[#8B2E24] font-semibold uppercase">
                    {person.craft_key}
                  </span>
                  <span className="font-mono text-xs text-[#6B5A4C]">Since {person.since}</span>
                </div>
                <h4 className="font-figtree font-bold text-lg text-[#33261F] mb-1">
                  {person.name}
                </h4>
                <div className="text-xs font-mono text-[#8B2E24] font-semibold mb-3">
                  {person.honour} · {person.dzongkhag}
                </div>
                <p className="font-lora text-sm leading-[1.55] text-[#4A3C33]">
                  {person.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Nomination CTA */}
      <section id="nominate" className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20">
        <div className="bg-[#33261F] text-[#F4F0E7] rounded-[16px] p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-[62ch]">
            <h2 className="font-marcellus text-2xl sm:text-3xl mb-3 text-white">
              Nominate a craftsperson
            </h2>
            <p className="font-lora text-sm sm:text-base text-[#D2C2AE] leading-relaxed">
              Any two Active Sector Members, or a Dzongkhag Chapter, may put a name forward. Nominations go to the secretariat and are considered by the Board before the Annual Sector Forum.
            </p>
          </div>
          <Link
            href="/contact?topic=awards"
            className="font-figtree font-semibold text-sm bg-[#8B2E24] text-white px-6 py-3.5 rounded-[7px] hover:bg-[#6E241C] transition-colors whitespace-nowrap self-start md:self-center"
          >
            Write to secretariat →
          </Link>
        </div>
      </section>
    </main>
  );
}
