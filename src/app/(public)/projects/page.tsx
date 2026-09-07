'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Project {
  status: 'current' | 'past';
  name: string;
  partner: string;
  period: string;
  budget: string;
  progress?: number;
  summary: string;
  activities: string[];
  results: { n: string; l: string }[];
}

const PROJECTS: Project[] = [
  {
    status: "current",
    name: "Sustainable Bhutanese Handicrafts (SWITCH-Asia)",
    partner: "EU SWITCH-Asia · with GrAT and SHINE",
    period: "2024 – 2027",
    budget: "EUR 1.4 m",
    progress: 62,
    summary: "Shifting member enterprises to resource-efficient production: natural dyes, waste reduction and cleaner finishing, while holding craft quality.",
    activities: [
      "Cleaner-production audits in 240 workshops",
      "Natural dye and low-waste finishing training",
      "Green business plans and access to finance",
      "Eco-label criteria drafted with RGoB"
    ],
    results: [
      { n: "240", l: "Enterprises audited" },
      { n: "1,180", l: "Artisans trained" },
      { n: "31%", l: "Average waste reduction" }
    ]
  },
  {
    status: "current",
    name: "Market Access for Rural Artisans",
    partner: "Enhanced Integrated Framework (EIF)",
    period: "2025 – 2027",
    budget: "USD 620,000",
    progress: 38,
    summary: "Connecting rural producer groups to export buyers through the HAB e-shop, trade fairs and consolidated EMS shipping.",
    activities: [
      "Product photography and cataloguing for 400 items",
      "Export documentation clinics in six dzongkhags",
      "Buyer missions to India, Thailand and Japan",
      "Consolidated shipping desk at the secretariat"
    ],
    results: [
      { n: "400", l: "Products catalogued" },
      { n: "14", l: "Export buyers engaged" },
      { n: "6", l: "Dzongkhags covered" }
    ]
  },
  {
    status: "current",
    name: "Zorig Chusum Skills Transmission",
    partner: "UNDP GEF Small Grants Programme",
    period: "2026 – 2028",
    budget: "USD 180,000",
    progress: 12,
    summary: "Master-to-apprentice placements in the five crafts with the fewest practising members, to keep endangered techniques alive.",
    activities: [
      "Master craftspeople identified in Lugzo, Garzo, Jinzo, Dozo and Shingzo",
      "Two-year paid apprenticeships for 40 young artisans",
      "Technique documentation in video and print",
      "Curriculum shared with the Institute of Zorig Chusum"
    ],
    results: [
      { n: "40", l: "Apprenticeships opened" },
      { n: "5", l: "Endangered crafts covered" },
      { n: "18", l: "Masters engaged" }
    ]
  },
  {
    status: "past",
    name: "Women in Craft Enterprise",
    partner: "Government of Canada · Helvetas Bhutan",
    period: "2021 – 2024",
    budget: "CAD 900,000",
    progress: 100,
    summary: "Business and pricing capability for women-led craft enterprises, with a revolving fund for raw material purchase.",
    activities: [
      "Costing and pricing training for 2,100 women",
      "Revolving raw-material fund in 9 dzongkhags",
      "Producer groups formalised and registered",
      "Childcare support at training venues"
    ],
    results: [
      { n: "2,100", l: "Women trained" },
      { n: "64%", l: "Reported income increase" },
      { n: "312", l: "New enterprises registered" }
    ]
  },
  {
    status: "past",
    name: "COVID-19 Craft Sector Recovery",
    partner: "UNDP Bhutan · RGoB",
    period: "2020 – 2022",
    budget: "USD 450,000",
    progress: 100,
    summary: "Emergency income support and a first move to online selling when tourism arrivals stopped.",
    activities: [
      "Cash-for-craft procurement from 1,600 artisans",
      "HAB e-shop launched with payment gateway",
      "Domestic craft bazaars in four dzongkhags",
      "Raw material bulk purchase to hold prices"
    ],
    results: [
      { n: "1,600", l: "Artisans supported" },
      { n: "Nu. 24 m", l: "Craft purchased directly" },
      { n: "195", l: "Stores kept trading" }
    ]
  },
  {
    status: "past",
    name: "Craft Product Innovation Lab",
    partner: "BCCI · Ernst & Young (pro bono)",
    period: "2019 – 2021",
    budget: "USD 210,000",
    progress: 100,
    summary: "Pairing artisans with designers to develop contemporary lines from traditional technique for retail and hospitality.",
    activities: [
      "Six design–artisan cycles across four crafts",
      "Prototyping grants and material sourcing",
      "Hotel and retail buyer showcases",
      "Design rights guidance for participants"
    ],
    results: [
      { n: "38", l: "New products launched" },
      { n: "11", l: "Hotel and retail accounts" },
      { n: "4", l: "Crafts represented" }
    ]
  }
];

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');

  const filteredProjects = PROJECTS.filter((p) => p.status === activeTab);
  const currentCount = PROJECTS.filter((p) => p.status === 'current').length;
  const pastCount = PROJECTS.filter((p) => p.status === 'past').length;

  const projectTotals = [
    { n: "11", label: "Projects delivered since 2011" },
    { n: "7,500", label: "Artisans in the network reached" },
    { n: "USD 4.6 m", label: "Programme funding managed" },
    { n: "9", label: "Funding partners" }
  ];

  return (
    <main className="pb-24">
      {/* 1. Header & Summary Stats */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-10 pb-8">
        <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6">
          <Link href="/" className="hover:underline">Home</Link> / Projects
        </div>

        <div className="grid grid-cols-[1.1fr_0.9fr] gap-14 items-center mb-10">
          <div>
            <div className="font-mono text-[11.5px] tracking-[0.16em] uppercase text-[#8B2E24] mb-4">
              Donor &amp; Partner Delivery
            </div>
            <h1 className="font-marcellus text-[46px] font-normal tracking-[-0.008em] mb-4 text-[#33261F]">
              Projects
            </h1>
            <p className="font-lora text-[17.5px] leading-[1.62] text-[#4A3C33]">
              Funded interventions delivering skills, market linkage, clean production, and craft transmission across Bhutan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-[1px] bg-[#E4DDD1] border border-[#E4DDD1] rounded-[12px] overflow-hidden">
            {projectTotals.map((tot) => (
              <div key={tot.label} className="bg-[#FFFCF8] p-5">
                <div className="font-figtree font-bold text-[22px] text-[#33261F] mb-1">
                  {tot.n}
                </div>
                <div className="font-lora text-[13.5px] text-[#6B5A4C]">
                  {tot.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-[#E4DDD1] pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`font-figtree font-semibold text-[14px] px-5 py-2.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'current'
                ? 'bg-[#33261F] text-[#F4F0E7]'
                : 'bg-[#FFFCF8] border border-[#CDBEA8] text-[#33261F] hover:bg-[#EDE5D6]'
            }`}
          >
            Projects in hand ({currentCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`font-figtree font-semibold text-[14px] px-5 py-2.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'past'
                ? 'bg-[#33261F] text-[#F4F0E7]'
                : 'bg-[#FFFCF8] border border-[#CDBEA8] text-[#33261F] hover:bg-[#EDE5D6]'
            }`}
          >
            Completed projects ({pastCount})
          </button>
        </div>
      </section>

      {/* 2. Projects List */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 flex flex-col gap-8">
        {filteredProjects.map((proj) => (
          <div
            key={proj.name}
            className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] overflow-hidden grid grid-cols-[300px_1fr]"
          >
            {/* Left image */}
            <div data-cms-img className="relative min-h-[260px] bg-[#E8E1D4] border-r border-[#E4DDD1] overflow-hidden">
              <img
                src={proj.name.includes('SWITCH') ? '/images/programs/dye_training.jpg' : proj.name.includes('Rural') ? '/images/programs/trade.jpg' : '/images/programs/heritage.jpg'}
                alt={proj.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-4 left-4 z-10 font-mono text-[10.5px] text-[#F4F0E7] bg-[#33261F]/85 backdrop-blur-sm px-2.5 py-1.5 rounded-[5px] border border-white/20">
                {proj.name.split(' ').slice(0, 3).join(' ')}
              </span>
            </div>

            {/* Right details */}
            <div className="p-[28px_30px_30px]">
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`font-mono text-[11px] px-2.5 py-1 rounded ${
                    proj.status === 'current'
                      ? 'bg-[#F1E9DB] text-[#8B2E24]'
                      : 'bg-[#EFF0E4] text-[#4C6B41]'
                  }`}
                >
                  {proj.status === 'current' ? 'In progress' : 'Completed'}
                </span>
                <span className="font-mono text-[11.5px] text-[#6B5A4C]">
                  {proj.period} · Budget: {proj.budget}
                </span>
              </div>

              <h2 className="font-marcellus text-[26px] font-normal leading-[1.2] text-[#33261F] mb-1.5">
                {proj.name}
              </h2>
              <div className="font-figtree text-[14.5px] text-[#8B2E24] font-medium mb-3">
                {proj.partner}
              </div>
              <p className="font-lora text-[16px] leading-[1.6] text-[#4A3C33] max-w-[78ch] mb-6">
                {proj.summary}
              </p>

              <div className="grid grid-cols-[1.15fr_0.85fr] gap-8 border-t border-[#EFE9DE] pt-5">
                {/* Activities */}
                <div>
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6B5A4C] mb-3">
                    Key activities
                  </div>
                  <div className="flex flex-col divide-y divide-[#EFE9DE]">
                    {proj.activities.map((act, i) => (
                      <div key={act} className="py-2 flex items-baseline gap-2.5 text-[14.5px] font-lora text-[#33261F]">
                        <span className="font-mono text-[11px] text-[#8B2E24]">
                          0{i + 1}
                        </span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements panel */}
                <div className="bg-[#F4F0E7] rounded-[11px] p-5 flex flex-col justify-between">
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#6B5A4C] mb-3">
                    Achievements to date
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {proj.results.map((res) => (
                      <div key={res.l}>
                        <div className="font-figtree font-bold text-[22px] text-[#33261F]">
                          {res.n}
                        </div>
                        <div className="font-lora text-[12.5px] text-[#6B5A4C]">
                          {res.l}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    {/* Progress bar */}
                    <div className="w-full bg-[#EFE9DE] h-1.5 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-[#8B2E24] h-full rounded-full transition-all duration-300"
                        style={{ width: `${proj.progress || 100}%` }}
                      />
                    </div>
                    <div className="font-mono text-[11px] text-[#6B5A4C]">
                      {proj.status === 'current'
                        ? `${proj.progress}% of workplan delivered`
                        : 'Final report published'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Partner closing band */}
      <section className="max-w-[1280px] min-w-[1200px] mx-auto px-10 mt-16">
        <div className="bg-[#33261F] text-[#F1ECE2] rounded-[14px] p-10 flex items-center justify-between">
          <div>
            <h3 className="font-marcellus text-[28px] font-normal mb-2">
              Partner with us on the next one
            </h3>
            <p className="font-lora text-[16px] text-[#D2C2AE] max-w-[56ch]">
              We work with bilateral donors, UN agencies, and foundations to deliver impactful, audited development projects for Bhutan&apos;s artisans.
            </p>
          </div>
          <Link
            href="/about#contact"
            className="font-figtree font-semibold text-[14.5px] bg-[#8B2E24] text-white px-6 py-3.5 rounded-[7px] hover:bg-[#6E241C] transition-colors"
          >
            Contact the secretariat →
          </Link>
        </div>
      </section>
    </main>
  );
}
