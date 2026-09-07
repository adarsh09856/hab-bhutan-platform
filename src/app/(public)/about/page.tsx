'use client';

import React from 'react';
import Link from 'next/link';
import { OBJECTIVES, VALUES, AOA_GOVERNANCE } from '@/lib/data';

export default function AboutPage() {
  const aboutFacts = [
    { k: "Established", v: "2005" },
    { k: "Registered CSO", v: "2011 · CSO/2011/043" },
    { k: "Member enterprises", v: "7,500" },
    { k: "Affiliated stores", v: "195" },
  ];

  return (
    <main className="pb-24">
      {/* 1. Hero & Facts */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-10">
        <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6">
          <Link href="/" className="hover:underline">Home</Link> / About us
        </div>

        <div className="grid grid-cols-[1.1fr_0.9fr] gap-14 items-end pb-11">
          <div>
            <div className="font-mono text-[11.5px] tracking-[0.16em] uppercase text-[#8B2E24] mb-5">
              Who we are
            </div>
            <h1 className="font-marcellus text-[56px] font-normal leading-[1.06] tracking-[-0.008em] mb-5 [text-wrap:balance] text-[#33261F]">
              A pioneer centre for Bhutanese handicrafts
            </h1>
            <p className="font-lora text-[18.5px] leading-[1.62] text-[#4A3C33] max-w-[56ch] [text-wrap:pretty]">
              Handicrafts Association of Bhutan (HAB) was established in 2005 and got formally registered as Civil Society Organization in 2011 under the CSO act of Bhutan 2007 as a pioneer centre for the promotion of vibrant and sustainable Bhutanese handicrafts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-[1px] bg-[#E4DDD1] border border-[#E4DDD1] rounded-[12px] overflow-hidden">
            {aboutFacts.map((af) => (
              <div key={af.k} className="bg-[#FFFCF8] p-[20px_22px]">
                <div className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-[#6B5A4C] mb-[7px]">
                  {af.k}
                </div>
                <div className="font-figtree font-bold text-[19px] tracking-[-0.01em] text-[#33261F]">
                  {af.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div data-cms-img className="aspect-[24/7] rounded-[16px] bg-[#E8E1D4] border border-[#E4DDD1] overflow-hidden relative mb-20 shadow-sm">
          <img
            src="/images/about_hero.jpg"
            alt="Artisans, Traditional Workshops, and Heritage of Bhutan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <span className="absolute bottom-4 left-5 z-10 font-mono text-[11.5px] text-[#F4F0E7] bg-[#33261F]/85 backdrop-blur-sm px-3 py-1.5 rounded-[5px] border border-white/20">
            Artisans, traditional craft clusters, and communities across Bhutan
          </span>
        </div>
      </section>

      {/* 2. Vision & Mission (Dark Surface) */}
      <section className="bg-[#33261F] text-[#F1ECE2] py-20">
        <div className="max-w-[1280px] min-w-[1200px] mx-auto px-10 grid grid-cols-2 gap-14">
          <div>
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#D2C2AE] mb-[18px]">
              Vision
            </div>
            <h2 className="font-marcellus text-[36px] font-normal leading-[1.18] tracking-[-0.008em] mb-4 text-[#F1ECE2]">
              Towards a vibrant &amp; sustainable handicrafts sector
            </h2>
            <p className="font-lora text-[17px] leading-[1.62] text-[#D2C2AE] max-w-[46ch]">
              A Bhutan where the thirteen crafts remain in daily practice, and where making them is a livelihood a young person would choose.
            </p>
          </div>

          <div className="border-l border-[#4E3D2E] pl-14">
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#D2C2AE] mb-[18px]">
              Mission
            </div>
            <h2 className="font-marcellus text-[36px] font-normal leading-[1.18] tracking-[-0.008em] mb-4 text-[#F1ECE2]">
              Promoting sustainability, inclusiveness and resilience
            </h2>
            <p className="font-lora text-[17px] leading-[1.62] text-[#D2C2AE] max-w-[46ch]">
              HAB supports local artisans by providing resources, training and policy interventions to improve their skills and increase their chances of success in local communities and the tourism industry.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Objectives */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-20">
        <div className="grid grid-cols-[0.8fr_1.2fr] gap-14 items-start">
          <div>
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3.5">
              Objectives
            </div>
            <h2 className="font-marcellus text-[34px] font-normal leading-[1.2] tracking-[-0.008em] mb-3.5 text-[#33261F]">
              What we set out to do
            </h2>
            <p className="font-lora text-[16px] leading-[1.6] text-[#6B5A4C]">
              Six objectives carried in the strategic plan 2026–2030, against which the Board reviews performance each year.
            </p>
          </div>

          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] overflow-hidden">
            {OBJECTIVES.map((obj, i) => (
              <div
                key={obj}
                className="flex gap-[18px] items-start p-[20px_24px] border-b border-[#EFE9DE] last:border-b-0"
              >
                <span className="font-mono text-[11px] text-[#8B2E24] flex-none pt-1">
                  0{i + 1}
                </span>
                <span className="font-lora text-[16.5px] leading-[1.5] text-[#33261F]">
                  {obj}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Values */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-20">
        <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3.5">
          Values
        </div>
        <h2 className="font-marcellus text-[34px] font-normal tracking-[-0.008em] mb-7 text-[#33261F]">
          How we work
        </h2>
        <div className="grid grid-cols-5 gap-[1px] bg-[#E4DDD1] border border-[#E4DDD1] rounded-[14px] overflow-hidden">
          {VALUES.map((val) => (
            <div key={val.t} className="bg-[#FFFCF8] p-[26px_22px] flex flex-col justify-between">
              <div>
                <div className="font-figtree font-bold text-[16.5px] tracking-[-0.01em] mb-2 text-[#33261F]">
                  {val.t}
                </div>
                <p className="font-lora text-[14.5px] leading-[1.55] text-[#6B5A4C]">
                  {val.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Governance Overhaul (AoA 2026 Model) */}
      <section id="governance" className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-20">
        <div className="mb-8">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3.5">
            Governance &amp; Constitution
          </div>
          <h2 className="font-marcellus text-[34px] font-normal text-[#33261F] mb-3">
            Articles of Association (2026 AGM Endorsed)
          </h2>
          <p className="font-lora text-[16px] text-[#6B5A4C] max-w-[76ch]">
            Constituted as a Public Benefit Organisation under the CSOA 2007 (as amended 2022). Governance is anchored by the Board of Trustees, Dzongkhag Chapters, Annual Sector Forum, and the Endowment Fund.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-5 mb-14">
          {AOA_GOVERNANCE.tiers.map((tier) => (
            <div
              key={tier.tier}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-6 flex flex-col"
            >
              <span className="font-mono text-[11px] text-[#8B2E24] mb-1">
                TIER 0{tier.n}
              </span>
              <h3 className="font-figtree font-bold text-[19px] text-[#33261F] mb-2">
                {tier.tier}
              </h3>
              <p className="font-lora text-[14.5px] leading-[1.5] text-[#6B5A4C] mb-4 flex-1">
                {tier.note}
              </p>
              <div className="pt-3 border-t border-[#EFE9DE] flex flex-col gap-1 text-[13px] font-figtree text-[#33261F]">
                {tier.items.map((item) => (
                  <div key={item} className="flex gap-2 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B2E24]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Board of Trustees and Secretariat roster */}
        <div className="grid grid-cols-2 gap-10">
          <div>
            <h3 className="font-marcellus text-[26px] font-normal text-[#33261F] mb-4">
              Board of Trustees
            </h3>
            <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] divide-y divide-[#EFE9DE]">
              {AOA_GOVERNANCE.board.map((b) => (
                <div key={b.role} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-figtree font-bold text-[15.5px] text-[#33261F]">
                      {b.role}
                    </div>
                    <div className="font-lora text-[13.5px] text-[#6B5A4C]">
                      {b.note}
                    </div>
                  </div>
                  <span className="font-mono text-[11.5px] text-[#8B2E24] bg-[#F1E9DB] px-2.5 py-1 rounded">
                    {b.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-marcellus text-[26px] font-normal text-[#33261F] mb-4">
              Secretariat Team
            </h3>
            <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] divide-y divide-[#EFE9DE]">
              {AOA_GOVERNANCE.team.map((t) => (
                <div key={t.role} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-figtree font-bold text-[15.5px] text-[#33261F]">
                      {t.role}
                    </div>
                    <div className="font-lora text-[13.5px] text-[#6B5A4C]">
                      {t.note}
                    </div>
                  </div>
                  <span className="font-mono text-[11.5px] text-[#8B2E24] bg-[#F1E9DB] px-2.5 py-1 rounded">
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Milestones */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-20">
        <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3.5">
          History
        </div>
        <h2 className="font-marcellus text-[34px] font-normal text-[#33261F] mb-8">
          Milestones since founding
        </h2>
        <div className="grid grid-cols-6 gap-4">
          {AOA_GOVERNANCE.milestones.map((m) => (
            <div
              key={m.y}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] p-5 flex flex-col justify-between"
            >
              <div className="font-figtree font-bold text-[24px] text-[#8B2E24] mb-2">
                {m.y}
              </div>
              <p className="font-lora text-[13.5px] leading-[1.5] text-[#4A3C33]">
                {m.t}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
