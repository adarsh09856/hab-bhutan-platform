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
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10">
        <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6">
          <Link href="/" className="hover:underline">Home</Link> / About us
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-14 items-end pb-11">
          <div>
            <div className="font-mono text-[11.5px] tracking-[0.16em] uppercase text-[#8B2E24] mb-4 sm:mb-5">
              Who we are
            </div>
            <h1 className="font-marcellus text-3xl sm:text-4xl lg:text-[56px] font-normal leading-[1.08] lg:leading-[1.06] tracking-[-0.008em] mb-5 [text-wrap:balance] text-[#33261F]">
              A pioneer centre for Bhutanese handicrafts
            </h1>
            <p className="font-lora text-base sm:text-[18.5px] leading-[1.62] text-[#4A3C33] max-w-[56ch] [text-wrap:pretty]">
              Handicrafts Association of Bhutan (HAB) was established in 2005 and got formally registered as Civil Society Organization in 2011 under the CSO act of Bhutan 2007 as a pioneer centre for the promotion of vibrant and sustainable Bhutanese handicrafts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-[1px] bg-[#E4DDD1] border border-[#E4DDD1] rounded-[12px] overflow-hidden">
            {aboutFacts.map((af) => (
              <div key={af.k} className="bg-[#FFFCF8] p-4 sm:p-[20px_22px]">
                <div className="font-mono text-[10px] sm:text-[10.5px] tracking-[0.12em] uppercase text-[#6B5A4C] mb-[7px]">
                  {af.k}
                </div>
                <div className="font-figtree font-bold text-base sm:text-[19px] tracking-[-0.01em] text-[#33261F]">
                  {af.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div data-cms-img className="aspect-[16/9] sm:aspect-[24/7] rounded-[16px] bg-[#E8E1D4] border border-[#E4DDD1] overflow-hidden relative mb-12 sm:mb-20 shadow-sm">
          <img
            src="/images/about_hero.jpg"
            alt="Artisans, Traditional Workshops, and Heritage of Bhutan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-5 z-10 font-mono text-[10.5px] sm:text-[11.5px] text-[#F4F0E7] bg-[#33261F]/85 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-[5px] border border-white/20 max-w-[90%] truncate">
            Artisans, traditional craft clusters, and communities across Bhutan
          </span>
        </div>
      </section>

      {/* 2. Vision & Mission (Dark Surface) */}
      <section className="bg-[#33261F] text-[#F1ECE2] py-12 sm:py-20">
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
          <div>
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#D2C2AE] mb-3 sm:mb-[18px]">
              Vision
            </div>
            <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[36px] font-normal leading-[1.18] tracking-[-0.008em] mb-4 text-[#F1ECE2]">
              Towards a vibrant &amp; sustainable handicrafts sector
            </h2>
            <p className="font-lora text-sm sm:text-[17px] leading-[1.62] text-[#D2C2AE] max-w-[46ch]">
              A Bhutan where the thirteen crafts remain in daily practice, and where making them is a livelihood a young person would choose.
            </p>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-[#4E3D2E] pt-8 md:pt-0 md:pl-14">
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#D2C2AE] mb-3 sm:mb-[18px]">
              Mission
            </div>
            <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[36px] font-normal leading-[1.18] tracking-[-0.008em] mb-4 text-[#F1ECE2]">
              Promoting sustainability, inclusiveness and resilience
            </h2>
            <p className="font-lora text-sm sm:text-[17px] leading-[1.62] text-[#D2C2AE] max-w-[46ch]">
              HAB supports local artisans by providing resources, training and policy interventions to improve their skills and increase their chances of success in local communities and the tourism industry.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Objectives */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-14 items-start">
          <div>
            <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3.5">
              Objectives
            </div>
            <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.2] tracking-[-0.008em] mb-3.5 text-[#33261F]">
              What we set out to do
            </h2>
            <p className="font-lora text-sm sm:text-[16px] leading-[1.6] text-[#6B5A4C]">
              Six objectives carried in the strategic plan 2026–2030, against which the Board reviews performance each year.
            </p>
          </div>

          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] overflow-hidden">
            {OBJECTIVES.map((obj, i) => (
              <div
                key={obj}
                className="flex gap-[18px] items-start p-4 sm:p-[20px_24px] border-b border-[#EFE9DE] last:border-b-0"
              >
                <span className="font-mono text-[11px] text-[#8B2E24] flex-none pt-1">
                  0{i + 1}
                </span>
                <span className="font-lora text-sm sm:text-[16.5px] leading-[1.5] text-[#33261F]">
                  {obj}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Values */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-20">
        <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3.5">
          Values
        </div>
        <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal tracking-[-0.008em] mb-7 text-[#33261F]">
          How we work
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[1px] bg-[#E4DDD1] border border-[#E4DDD1] rounded-[14px] overflow-hidden">
          {VALUES.map((val) => (
            <div key={val.t} className="bg-[#FFFCF8] p-5 sm:p-[26px_22px] flex flex-col justify-between">
              <div>
                <div className="font-figtree font-bold text-base sm:text-[16.5px] tracking-[-0.01em] mb-2 text-[#33261F]">
                  {val.t}
                </div>
                <p className="font-lora text-xs sm:text-[14.5px] leading-[1.55] text-[#6B5A4C]">
                  {val.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Governance Overhaul (AoA 2026 Model) */}
      <section id="governance" className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-20">
        <div className="mb-8">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3.5">
            Governance &amp; Constitution
          </div>
          <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal text-[#33261F] mb-3">
            Articles of Association (2026 AGM Endorsed)
          </h2>
          <p className="font-lora text-sm sm:text-[16px] text-[#6B5A4C] max-w-[76ch]">
            Constituted as a Public Benefit Organisation under the CSOA 2007 (as amended 2022). Governance is anchored by the Board of Trustees, Dzongkhag Chapters, Annual Sector Forum, and the Endowment Fund.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {AOA_GOVERNANCE.tiers.map((tier) => (
            <div
              key={tier.tier}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6 flex flex-col"
            >
              <span className="font-mono text-[11px] text-[#8B2E24] mb-1">
                TIER 0{tier.n}
              </span>
              <h3 className="font-figtree font-bold text-lg sm:text-[19px] text-[#33261F] mb-2">
                {tier.tier}
              </h3>
              <p className="font-lora text-xs sm:text-[14.5px] leading-[1.5] text-[#6B5A4C] mb-4 flex-1">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <div>
            <h3 className="font-marcellus text-xl sm:text-[26px] font-normal text-[#33261F] mb-4">
              Board of Trustees
            </h3>
            <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] divide-y divide-[#EFE9DE]">
              {AOA_GOVERNANCE.board.map((b) => (
                <div key={b.role} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <div className="font-figtree font-bold text-[15.5px] text-[#33261F]">
                      {b.role}
                    </div>
                    <div className="font-lora text-[13.5px] text-[#6B5A4C]">
                      {b.note}
                    </div>
                  </div>
                  <span className="font-mono text-[11.5px] text-[#8B2E24] bg-[#F1E9DB] px-2.5 py-1 rounded self-start sm:self-center">
                    {b.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-marcellus text-xl sm:text-[26px] font-normal text-[#33261F] mb-4">
              Secretariat Team
            </h3>
            <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] divide-y divide-[#EFE9DE]">
              {AOA_GOVERNANCE.team.map((t) => (
                <div key={t.role} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <div className="font-figtree font-bold text-[15.5px] text-[#33261F]">
                      {t.role}
                    </div>
                    <div className="font-lora text-[13.5px] text-[#6B5A4C]">
                      {t.note}
                    </div>
                  </div>
                  <span className="font-mono text-[11.5px] text-[#8B2E24] bg-[#F1E9DB] px-2.5 py-1 rounded self-start sm:self-center">
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Milestones */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-20">
        <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3.5">
          History
        </div>
        <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal text-[#33261F] mb-8">
          Milestones since founding
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {AOA_GOVERNANCE.milestones.map((m) => (
            <div
              key={m.y}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] p-4 sm:p-5 flex flex-col justify-between"
            >
              <div className="font-figtree font-bold text-xl sm:text-[24px] text-[#8B2E24] mb-2">
                {m.y}
              </div>
              <p className="font-lora text-xs sm:text-[13.5px] leading-[1.5] text-[#4A3C33]">
                {m.t}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Shipping, Customs & Returns Support */}
      <section id="support" className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-20">
        <div className="mb-8">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3.5">
            Collector Services &amp; Fulfillment
          </div>
          <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal text-[#33261F] mb-3">
            Shipping, Customs &amp; Returns
          </h2>
          <p className="font-lora text-sm sm:text-[16px] text-[#6B5A4C] max-w-[76ch]">
            Every consignment dispatched from our Thimphu secretariat represents direct support to Bhutanese master artisans and rural craft communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6 flex flex-col">
            <span className="font-mono text-[11px] text-[#8B2E24] uppercase mb-2">
              International Dispatch
            </span>
            <h3 className="font-figtree font-bold text-lg sm:text-[18px] text-[#33261F] mb-2">
              EMS &amp; Express Courier
            </h3>
            <p className="font-lora text-xs sm:text-[14.5px] leading-[1.6] text-[#4A3C33] mb-4 flex-1">
              Orders are packaged at our Thimphu hub and dispatched via EMS Bhutan Post (7–14 days) or DHL Express (3–5 days). Orders over $200 qualify for free standard EMS shipping.
            </p>
            <div className="font-mono text-[12px] text-[#6B5A4C] pt-3 border-t border-[#EFE9DE]">
              Live tracking available at /track-order
            </div>
          </div>

          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6 flex flex-col">
            <span className="font-mono text-[11px] text-[#8B2E24] uppercase mb-2">
              Heritage Certification
            </span>
            <h3 className="font-figtree font-bold text-lg sm:text-[18px] text-[#33261F] mb-2">
              Duty &amp; Seal of Authenticity
            </h3>
            <p className="font-lora text-xs sm:text-[14.5px] leading-[1.6] text-[#4A3C33] mb-4 flex-1">
              Each handicraft is officially certified under the 13 Traditional Arts &amp; Crafts of Bhutan with an authenticity seal and export declaration. Import duties and taxes are subject to destination country regulations.
            </p>
            <div className="font-mono text-[12px] text-[#6B5A4C] pt-3 border-t border-[#EFE9DE]">
              Compliant with CSO Act 2007 Export Standards
            </div>
          </div>

          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6 flex flex-col">
            <span className="font-mono text-[11px] text-[#8B2E24] uppercase mb-2">
              Collector Guarantee
            </span>
            <h3 className="font-figtree font-bold text-lg sm:text-[18px] text-[#33261F] mb-2">
              Returns &amp; Replacements
            </h3>
            <p className="font-lora text-xs sm:text-[14.5px] leading-[1.6] text-[#4A3C33] mb-4 flex-1">
              Because items are handcrafted by community artisans, organic variations are celebrated. If a piece arrives damaged in transit or exhibits craft defects, we arrange replacement or refund within 14 days.
            </p>
            <div className="font-mono text-[12px] text-[#6B5A4C] pt-3 border-t border-[#EFE9DE]">
              Contact officehab@gmail.com for claims
            </div>
          </div>
        </div>
      </section>

      {/* 8. Secretariat Office & Chapter Contact */}
      <section id="contact" className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-20">
        <div className="mb-8">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3.5">
            Headquarters &amp; Field Chapters
          </div>
          <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal text-[#33261F] mb-3">
            Contact the Secretariat
          </h2>
          <p className="font-lora text-sm sm:text-[16px] text-[#6B5A4C] max-w-[76ch]">
            Reach out to our executive secretariat in Thimphu or our regional coordinators across the 20 Dzongkhags.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6">
            <h3 className="font-figtree font-bold text-base sm:text-[17px] text-[#33261F] mb-3">
              National Secretariat
            </h3>
            <div className="font-lora text-xs sm:text-[14.5px] leading-[1.7] text-[#4A3C33] space-y-1">
              <div>Handicrafts Association of Bhutan</div>
              <div>Metog Lam, Post Box 1284</div>
              <div>Thimphu, Kingdom of Bhutan</div>
              <div className="font-mono text-[13px] text-[#8B2E24] pt-2">
                Tel: +975-2-338089
              </div>
              <div className="font-mono text-[13px] text-[#8B2E24]">
                Email: officehab@gmail.com
              </div>
            </div>
          </div>

          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6">
            <h3 className="font-figtree font-bold text-base sm:text-[17px] text-[#33261F] mb-3">
              Operating Hours
            </h3>
            <div className="font-lora text-xs sm:text-[14.5px] leading-[1.7] text-[#4A3C33] space-y-1">
              <div>Monday – Friday: 09:00 – 17:00 BST</div>
              <div>Saturday (Artisan Desk): 09:00 – 13:00 BST</div>
              <div>Sunday &amp; National Holidays: Closed</div>
              <div className="font-mono text-[12px] text-[#6B5A4C] pt-2">
                Timezone: GMT+6 (Bhutan Time)
              </div>
            </div>
          </div>

          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6">
            <h3 className="font-figtree font-bold text-base sm:text-[17px] text-[#33261F] mb-3">
              Regional Dzongkhag Chapters
            </h3>
            <div className="font-lora text-xs sm:text-[14.5px] leading-[1.7] text-[#4A3C33] space-y-1">
              <div>Western Cluster: Paro, Haa, Punakha</div>
              <div>Central Cluster: Bumthang, Trongsa</div>
              <div>Eastern Cluster: Trashiyangtse, Trashigang</div>
              <div className="font-mono text-[12px] text-[#8B2E24] pt-2">
                Liaison: chapters@handicraftsbhutan.org
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
