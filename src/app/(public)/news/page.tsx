'use client';

import React from 'react';
import Link from 'next/link';

interface NewsItem {
  kind: string;
  date: string;
  title: string;
  blurb: string;
}

interface EventItem {
  day: string;
  mon: string;
  title: string;
  place: string;
}

const NEWS_ARTICLES: NewsItem[] = [
  {
    kind: "Programs",
    date: "28 Aug 2026",
    title: "Trade facilitation desk opens for the autumn export season",
    blurb: "Members can now book one-to-one sessions on export documentation, EMS rates and commercial invoicing at the HAB office in Thimphu.",
  },
  {
    kind: "Artisan support",
    date: "14 Aug 2026",
    title: "Natural dye training concludes in Lhuentse",
    blurb: "Twenty-six weavers from Khoma and Gangzur completed a ten-day course on madder, indigo and lac dye preparation.",
  },
  {
    kind: "Events",
    date: "02 Aug 2026",
    title: "Zorig Chusum craft bazaar returns to Clock Tower Square",
    blurb: "Forty member enterprises will exhibit across three days, with live demonstrations from each of the thirteen crafts.",
  },
  {
    kind: "Publications",
    date: "19 Jul 2026",
    title: "Annual report 2025 available to download",
    blurb: "Sector figures, programme outcomes and audited accounts for the year, published in English and Dzongkha.",
  },
  {
    kind: "Projects",
    date: "30 Jun 2026",
    title: "Product innovation lab pairs six artisans with designers",
    blurb: "A six-month cycle developing new homeware lines from bamboo, yathra and desho paper for international retail.",
  },
];

const UPCOMING_EVENTS: EventItem[] = [
  { day: "12", mon: "SEP", title: "Craft bazaar, day one", place: "Clock Tower Square, Thimphu" },
  { day: "27", mon: "SEP", title: "Export documentation clinic", place: "HAB office, Metog Lam" },
  { day: "08", mon: "OCT", title: "Members' annual sector forum", place: "Thimphu" },
];

export default function NewsPage() {
  return (
    <main className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-10 pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <span>News &amp; events</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-marcellus text-[44px] font-normal leading-[1.06] text-[#33261F] mb-2">
          News &amp; events
        </h1>
        <p className="font-lora text-[17px] text-[#6B5A4C]">
          Stay informed, stay empowered.
        </p>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-8 items-start">
        {/* Left Column: Articles */}
        <div className="flex flex-col gap-5">
          {NEWS_ARTICLES.map((article) => (
            <div
              key={article.title}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] overflow-hidden grid grid-cols-[200px_1fr]"
            >
              <div className="ph-light min-h-[150px] border-r border-[#E4DDD1] p-3 flex items-end">
                <span className="font-mono text-[10px] text-[#86745F] bg-[#FFFCF8] px-2 py-0.5 rounded border border-[#E4DDD1]">
                  news photo
                </span>
              </div>

              <div className="p-[22px_24px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10.5px] bg-[#F1E9DB] text-[#8B2E24] px-2 py-0.5 rounded">
                      {article.kind}
                    </span>
                    <span className="font-mono text-[11px] text-[#6B5A4C]">
                      {article.date}
                    </span>
                  </div>
                  <h2 className="font-figtree font-bold text-[20px] leading-[1.28] text-[#33261F] mb-2">
                    {article.title}
                  </h2>
                  <p className="font-lora text-[15px] leading-[1.55] text-[#6B5A4C]">
                    {article.blurb}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EFE9DE] mt-4">
                  <span className="font-figtree font-semibold text-[13.5px] text-[#8B2E24] hover:underline cursor-pointer">
                    Continue reading →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Sticky Events & Downloads */}
        <div className="sticky top-[100px] flex flex-col gap-6">
          {/* Upcoming Events Card */}
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-6">
            <h3 className="font-figtree font-bold text-[18px] text-[#33261F] mb-4">
              Upcoming events
            </h3>
            <div className="divide-y divide-[#EFE9DE]">
              {UPCOMING_EVENTS.map((ev) => (
                <div key={ev.title} className="py-3.5 flex items-center gap-4 first:pt-0 last:pb-0">
                  <div className="w-[44px] h-[44px] bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] flex flex-col items-center justify-center flex-none">
                    <span className="font-figtree font-bold text-[14px] text-[#33261F] leading-none">
                      {ev.day}
                    </span>
                    <span className="font-mono text-[10px] text-[#8B2E24] font-bold">
                      {ev.mon}
                    </span>
                  </div>
                  <div>
                    <div className="font-figtree font-semibold text-[15px] text-[#33261F]">
                      {ev.title}
                    </div>
                    <div className="font-lora text-[13px] text-[#6B5A4C]">
                      {ev.place}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publications Promo */}
          <div className="bg-[#33261F] text-[#F1ECE2] rounded-[12px] p-6">
            <h3 className="font-marcellus text-[22px] font-normal text-white mb-2">
              Annual Reports &amp; Studies
            </h3>
            <p className="font-lora text-[14px] text-[#D2C2AE] mb-4 leading-[1.5]">
              Download full audited accounts, strategic blueprints, and value-chain assessments.
            </p>
            <Link
              href="/publications"
              className="font-figtree font-semibold text-[13.5px] text-[#F1ECE2] border-b border-[#8B2E24] pb-0.5 hover:text-white transition-colors"
            >
              Browse downloads →
            </Link>
          </div>

          <div className="font-mono text-[11px] text-[#6B5A4C] p-2">
            Sample content — updated weekly from the HAB communications desk.
          </div>
        </div>
      </div>
    </main>
  );
}
