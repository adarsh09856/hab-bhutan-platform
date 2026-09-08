'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Pillar {
  id?: string;
  ref: string;
  title: string;
  description: string;
  activities: string[];
}

const STATUTORY_SCOPE = [
  {
    title: 'Input Supply & Equipment',
    items: ['Centralized yarn & vegetable dye procurement', 'Loom allocation & repair grants', 'Quality tool kits for graduating apprentices'],
  },
  {
    title: 'Standard Setting & Certification',
    items: ['National Seal of Bhutan testing benchmarks', 'Authenticity documentation & verification', 'Traditional botanical purity audits'],
  },
  {
    title: 'Market Linkage & Promotion',
    items: ['Official digital e-commerce platform', 'International trade expo delegations', 'Permanent artisanal outlet management'],
  },
  {
    title: 'Skill Development & Training',
    items: ['Master-apprentice living heritage programs', 'Contemporary product design residencies', 'Business literacy & financial bookkeeping'],
  },
  {
    title: 'Artisan Welfare & Protection',
    items: ['Dzongkhag chapter welfare funds', 'Emergency medical & relief assistance', 'Workplace ergonomics & eye care clinics'],
  },
  {
    title: 'Heritage Preservation & Research',
    items: ['Endangered craft technique oral archives', 'National craft census & economic studies', 'Intellectual property & GI registration'],
  },
];

const DELIVERY_CHAIN = [
  { n: 1, title: 'Constitutional Mandate', desc: 'Every program is derived directly from the 11 statutory objects set out in Article 3.2 of the Articles of Association.' },
  { n: 2, title: 'Regional Identification', desc: 'Twenty Dzongkhag chapters consult grassroots cooperatives to establish urgent material and training requirements.' },
  { n: 3, title: 'Secretariat Execution', desc: 'The Central Secretariat deploys technical trainers, procurement funds, and logistics with strict milestone verification.' },
  { n: 4, title: 'Audited Impact', desc: 'Outcomes are measured by artisan income increases, guild membership renewals, and statutory annual CSOA compliance audits.' },
];

const BENEFICIARY_GROUPS = [
  'Rural Handloom Weavers',
  'Master Woodcarvers & Carpenters (Zow & Shingzo)',
  'Traditional Sculptors & Clay Artisans (Jimzo)',
  'Cane & Bamboo Weavers (Tsharzo)',
  'Paper-makers (Dezo)',
  'Metalsmiths & Bronzecasters (Lugzo & Garzo)',
  'Youth Apprentices & Vocational Trainees',
  'Women-led Craft Cooperatives',
  'Seminomadic Highland Wool Processors',
];

export default function ProgrammesPage() {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedObjects, setExpandedObjects] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/programmes')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.pillars)) {
          setPillars(data.pillars);
        }
      })
      .catch((err) => console.error('Error fetching programmes:', err))
      .finally(() => setLoading(false));
  }, []);

  const toggleObject = (ref: string) => {
    setExpandedObjects((prev) => ({
      ...prev,
      [ref]: !prev[ref],
    }));
  };

  return (
    <main className="pb-24 font-figtree bg-[#FBF9F5]">
      {/* 1. Header & Mandate */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-12 sm:pb-16">
        <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6">
          <Link href="/" className="hover:underline">Home</Link> / Programmes
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-8 lg:gap-14 items-end">
          <div>
            <div className="font-mono text-[11.5px] tracking-[0.16em] uppercase text-[#8B2E24] mb-4 sm:mb-5 font-bold">
              Institutional Mandate
            </div>
            <h1 className="font-marcellus text-3xl sm:text-4xl lg:text-[52px] font-normal leading-[1.08] text-[#33261F] mb-4">
              Eleven objects, one national mission
            </h1>
            <p className="font-lora text-sm sm:text-base lg:text-[18px] leading-[1.62] text-[#4A3C33] mb-4 max-w-[58ch]">
              HAB operates as the national apex Public Benefit Organization for Bhutan&apos;s handicrafts sector, advancing the productive, economic, cultural, and social well-being of actors across the value chain.
            </p>
            <p className="font-lora text-xs sm:text-sm text-[#6B5A4C] max-w-[58ch]">
              Constituted under Article 3 of the Articles of Association (2026 Edition) and Civil Society Organizations Act of Bhutan 2007.
            </p>
          </div>

          <div className="bg-[#8B2E24] text-white rounded-[16px] p-6 sm:p-9 shadow-lg">
            <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[#F0D2C9] mb-3 sm:mb-4">
              Governing principles
            </div>
            <p className="font-lora text-base sm:text-[17px] leading-[1.62] text-[#F6E7E2] mb-4 sm:mb-5">
              Public Benefit · Cultural Stewardship · Integrity · Inclusivity · Independence
            </p>
            <div className="border-t border-[#A85246] pt-[18px] text-xs sm:text-[14px] leading-[1.55] text-[#EBC9C2] font-lora">
              National jurisdiction across all twenty dzongkhags. Certified non-political and non-sectarian by constitution.
            </div>
          </div>
        </div>
      </section>

      {/* 2. Programme Types (11 Dynamic Objects from Database) */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-8 mb-6 sm:mb-7">
          <div>
            <h2 className="font-marcellus text-2xl sm:text-3xl text-[#33261F] mb-1">
              Statutory Programme Objects
            </h2>
            <p className="font-lora text-xs sm:text-sm text-[#6B5A4C] max-w-[74ch]">
              All activities deployed by the Secretariat are formally registered against Article 3.2.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-[#E4DDD1] p-6 animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillars.map((po) => {
              const isExpanded = Boolean(expandedObjects[po.ref]);
              return (
                <div
                  key={po.ref}
                  className="bg-white border border-[#E4DDD1] rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:border-[#8B2E24]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-[#8B2E24] bg-[#8B2E24]/10 px-2.5 py-0.5 rounded-full">
                        Article {po.ref}
                      </span>
                    </div>

                    <h3 className="font-marcellus text-base sm:text-lg text-[#33261F] mb-2 leading-snug">
                      {po.title}
                    </h3>

                    <p className="font-lora text-xs sm:text-[13.5px] leading-[1.6] text-[#6B5A4C]">
                      {po.description}
                    </p>

                    {/* Expandable Activities */}
                    {isExpanded && Array.isArray(po.activities) && po.activities.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-[#EDE5D6] space-y-2">
                        <div className="font-mono text-[10.5px] uppercase tracking-wider text-[#33261F] font-bold">
                          Core Interventions:
                        </div>
                        <ul className="space-y-1.5 text-xs text-[#6B5A4C]">
                          {po.activities.map((act, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#8B2E24] font-bold flex-none">•</span>
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleObject(po.ref)}
                    className="text-left font-figtree font-semibold text-xs text-[#8B2E24] hover:underline mt-4 pt-3 border-t border-[#EDE5D6]"
                  >
                    {isExpanded ? 'Show less ↑' : 'View interventions ↓'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Scope of Activities */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-16">
        <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-2 font-bold">
          Scope of activities
        </div>
        <h2 className="font-marcellus text-2xl sm:text-3xl text-[#33261F] mb-6">
          Six Operational Pillars in Practice
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STATUTORY_SCOPE.map((ac) => (
            <div
              key={ac.title}
              className="bg-white border border-[#E4DDD1] rounded-2xl p-6 shadow-xs"
            >
              <h3 className="font-figtree font-bold text-sm sm:text-base text-[#33261F] mb-3">
                {ac.title}
              </h3>
              <div className="space-y-2 text-xs text-[#6B5A4C] font-lora">
                {ac.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[#8B2E24] flex-none">—</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Delivery Chain Band */}
      <section className="bg-[#8B2E24] text-white py-14 mt-16">
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#F0D2C9] mb-2">
            Delivery Chain
          </div>
          <h2 className="font-marcellus text-2xl sm:text-3xl text-white mb-2">
            How Programmes Reach Rural Gewogs
          </h2>
          <p className="font-lora text-xs sm:text-sm text-[#F6E7E2] mb-8 max-w-2xl">
            From national mandate to audited results, every project follows an unbroken chain of accountability.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DELIVERY_CHAIN.map((step) => (
              <div
                key={step.n}
                className="bg-[#7A2820] border border-[#A85246] rounded-2xl p-6 flex flex-col"
              >
                <span className="font-mono text-xs font-bold text-[#F0D2C9] mb-2">
                  Step 0{step.n}
                </span>
                <div className="font-figtree font-bold text-base text-white mb-2">
                  {step.title}
                </div>
                <p className="font-lora text-xs text-[#F6E7E2] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Beneficiary Groups */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-16">
        <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-2 font-bold">
          Beneficiaries
        </div>
        <h2 className="font-marcellus text-2xl sm:text-3xl text-[#33261F] mb-6">
          Who Our Programmes Serve
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {BENEFICIARY_GROUPS.map((b) => (
            <span
              key={b}
              className="bg-white border border-[#E4DDD1] font-lora text-xs sm:text-sm text-[#33261F] px-4 py-2.5 rounded-xl shadow-xs"
            >
              {b}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
