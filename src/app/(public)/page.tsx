'use client';

import React from 'react';
import Link from 'next/link';
import {
  CRAFTS,
  CLIENT_VERBATIM,
  SAMPLE_PRODUCTS,
} from '@/lib/data';
import CraftCard from '@/components/public/CraftCard';
import ProductCard from '@/components/public/ProductCard';
import HeroSlider from '@/components/public/HeroSlider';

export default function HomePage() {
  const newInShop = SAMPLE_PRODUCTS.slice(0, 4);

  const programs = [
    {
      title: "Trade facilitation",
      desc: "Trade infrastructure, market linkage, export facilitation and certification frameworks so members can compete in real markets.",
      slot: "Trade facilitation & export",
      image: "/images/programs/trade.jpg",
    },
    {
      title: "Artisan support",
      desc: "Craft skills, business management, financial literacy and export procedures, through training, mentorship and peer exchange.",
      slot: "Natural dye & capacity training",
      image: "/images/programs/dye_training.jpg",
    },
    {
      title: "Education & awareness",
      desc: "Documenting and transmitting the Zorig Chusum, and protecting origin through geographical indication and certification.",
      slot: "Heritage & apprenticeship",
      image: "/images/programs/heritage.jpg",
    },
    {
      title: "Product innovation",
      desc: "Design interventions, technical upgradation and artisan–designer collaboration that diversify what the sector can sell.",
      slot: "Product design laboratory",
      image: "/images/programs/design_lab.jpg",
    },
  ];

  const newsItems = [
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
  ];

  const publications = [
    { kind: "Latest · Annual report", title: "Annual Report 2025", meta: "PDF · 4.2 MB · English & Dzongkha" },
    { kind: "Strategy", title: "Five-Year Strategic Plan 2026–2030", meta: "PDF · 3.6 MB · Board approved" },
    { kind: "Sector study", title: "Zorig Chusum Value Chain Assessment", meta: "PDF · 2.8 MB · 96 pages" },
    { kind: "Accounts", title: "Audited Financial Statements 2025", meta: "PDF · 1.1 MB · Independent auditor" },
  ];

  return (
    <main className="w-full">
      {/* 1. Hero Section */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 pt-8 sm:pt-14 pb-5 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-14 items-center">
        <div>
          <div className="font-mono text-[10.5px] sm:text-[11.5px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3 sm:mb-5">
            Civil Society Organization · Bhutan
          </div>
          <h1 className="font-marcellus text-[36px] sm:text-[48px] lg:text-[58px] font-normal leading-[1.06] tracking-[-0.01em] mb-4 sm:mb-[22px] [text-wrap:balance] text-[#33261F]">
            {CLIENT_VERBATIM.tagline}
          </h1>
          <p className="font-lora text-[16px] sm:text-[18px] leading-[1.62] text-[#4A3C33] mb-6 sm:mb-[30px] max-w-[52ch]">
            {CLIENT_VERBATIM.heroPara}
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/about"
              className="font-figtree text-[14px] sm:text-[15px] font-semibold bg-[#33261F] text-[#F4F0E7] px-5 sm:px-6 py-3 sm:py-[15px] rounded-[8px] whitespace-nowrap hover:bg-[#8B2E24] hover:text-white transition-colors"
            >
              Our mission
            </Link>
            <Link
              href="/shop"
              className="font-figtree text-[14px] sm:text-[15px] font-semibold border border-[#CDBEA8] text-[#8B2E24] px-5 sm:px-6 py-3 sm:py-[15px] rounded-[8px] bg-[#FFFCF8] whitespace-nowrap hover:border-[#33261F] transition-colors"
            >
              Shop the crafts →
            </Link>
            <Link
              href="/members"
              className="font-figtree text-[14px] sm:text-[15px] font-semibold text-[#8B2E24] px-3 py-3 sm:py-[15px] whitespace-nowrap hover:underline"
            >
              Find a member
            </Link>
          </div>
        </div>

        <HeroSlider />
      </section>

      {/* 2. Stat Row */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-[34px]">
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-[#E4DDD1] divide-y sm:divide-y-0 divide-[#EFE9DE]">
          {CLIENT_VERBATIM.stats.map((s) => (
            <div key={s.label} className="py-4 sm:py-[26px] pr-4 sm:pr-6 pl-0">
              <div className="font-figtree font-bold text-[28px] sm:text-[38px] tracking-[-0.03em] leading-none text-[#33261F]">
                {s.n}
              </div>
              <div className="font-lora text-[13px] sm:text-[14.5px] text-[#6B5A4C] mt-1.5 sm:mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Assurance Band */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 pb-10 sm:pb-16">
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-[#EFE9DE] p-5 sm:p-[26px] gap-4 sm:gap-0">
          <div className="sm:px-4 lg:px-5 first:pl-0 last:pr-0">
            <div className="font-figtree font-bold text-[15px] sm:text-[15.5px] text-[#33261F] mb-1">
              Verified members only
            </div>
            <div className="font-lora text-[13.5px] sm:text-[14px] text-[#6B5A4C] leading-[1.5]">
              Every seller is a registered HAB member with documented craft credentials.
            </div>
          </div>
          <div className="sm:px-4 lg:px-5 pt-3 sm:pt-0">
            <div className="font-figtree font-bold text-[15px] sm:text-[15.5px] text-[#33261F] mb-1">
              Fair price, paid upfront
            </div>
            <div className="font-lora text-[13.5px] sm:text-[14px] text-[#6B5A4C] leading-[1.5]">
              HAB buys from the artisan at an agreed price before the piece is listed.
            </div>
          </div>
          <div className="sm:px-4 lg:px-5 pt-3 sm:pt-0">
            <div className="font-figtree font-bold text-[15px] sm:text-[15.5px] text-[#33261F] mb-1">
              Secure payment
            </div>
            <div className="font-lora text-[13.5px] sm:text-[14px] text-[#6B5A4C] leading-[1.5]">
              3-D Secure cards, mBoB and bank transfer, in USD or Ngultrum.
            </div>
          </div>
          <div className="sm:px-4 lg:px-5 pt-3 sm:pt-0">
            <div className="font-figtree font-bold text-[15px] sm:text-[15.5px] text-[#33261F] mb-1">
              Tracked worldwide
            </div>
            <div className="font-lora text-[13.5px] sm:text-[14px] text-[#6B5A4C] leading-[1.5]">
              EMS via Bhutan Post with commercial invoice and craft certificate.
            </div>
          </div>
        </div>
      </section>

      {/* 4. About Band */}
      <section id="about" className="bg-[#33261F] text-[#D2C2AE] py-14 sm:py-[86px]">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <div className="font-mono text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase text-[#C9A46A] mb-3 sm:mb-[18px]">
              About Us
            </div>
            <h2 className="font-marcellus text-[30px] sm:text-[40px] font-normal leading-[1.15] tracking-[-0.01em] text-[#F1ECE2] mb-4 sm:mb-6">
              A network built for the artisans, not the middlemen
            </h2>
            <p className="font-lora text-[15.5px] sm:text-[17px] leading-[1.62] text-[#D2C2AE] mb-4 sm:mb-5">
              Handicrafts Association of Bhutan (HAB) plays a critical role in the Bhutanese handicrafts sector. We work towards creating a vibrant, sustainable, and inclusive craft ecosystem by bridging traditional techniques with modern markets, and ensuring fair compensation for our artisans.
            </p>
            <p className="font-lora text-[15.5px] sm:text-[17px] leading-[1.62] text-[#D2C2AE] mb-6 sm:mb-8">
              Our nationwide network supports more than 7,500 micro and small craft enterprises — 70% women-led — across all twenty dzongkhags. We provide capacity building, quality certification, and direct market access through our physical outlets and international e-shop.
            </p>
            <Link
              href="/programmes"
              className="font-figtree text-[14.5px] sm:text-[15px] font-semibold text-[#F1ECE2] border-b border-[#8B2E24] pb-1 hover:text-white transition-colors inline-block"
            >
              Read about our programmes →
            </Link>
          </div>
          <div data-cms-img className="aspect-video sm:aspect-square rounded-[14px] bg-[#42332A] border border-[#4E3D2E] overflow-hidden relative shadow-md">
            <img
              src="/images/training_workshop.jpg"
              alt="HAB Traditional Craft Training Workshop in Thimphu"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <span className="font-mono text-[10.5px] sm:text-[11px] text-[#F4F0E7] bg-[#33261F]/90 backdrop-blur-sm px-3 py-1.5 rounded border border-white/20 inline-block">
                HAB artisan training workshop · Thimphu
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Zorig Chusum — 13 Crafts */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-[86px] pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="font-mono text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-2 sm:mb-3">
              Zorig Chusum
            </div>
            <h2 className="font-marcellus text-[30px] sm:text-[40px] font-normal leading-[1.1] tracking-[-0.01em] text-[#33261F] mb-2">
              The 13 arts &amp; crafts of Bhutan
            </h2>
            <p className="font-lora text-[15px] sm:text-[17px] text-[#6B5A4C] max-w-[65ch]">
              Living traditions codified in the seventeenth century, each craft holds a specific place in Bhutanese material and religious culture.
            </p>
          </div>
          <Link
            href="/shop"
            className="font-figtree text-[14px] sm:text-[15px] font-semibold text-[#8B2E24] hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            Browse all crafts →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CRAFTS.map((craft, idx) => (
            <CraftCard
              key={craft.key}
              craftKey={craft.key}
              name={craft.name}
              english={craft.english}
              description={craft.description}
              index={idx}
              memberCount={idx % 2 === 0 ? 2 : 1}
              productCount={idx % 3 === 0 ? 3 : 1}
            />
          ))}
        </div>
      </section>

      {/* 6. New in the Shop */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h2 className="font-marcellus text-[28px] sm:text-[34px] font-normal leading-[1.2] tracking-[-0.01em] text-[#33261F] mb-1">
              New in the shop
            </h2>
            <div className="font-mono text-[10.5px] sm:text-[11px] text-[#6B5A4C]">
              Added to the catalogue this month · EMS tracked worldwide
            </div>
          </div>
          <Link
            href="/shop"
            className="font-figtree text-[14px] sm:text-[15px] font-semibold text-[#8B2E24] hover:underline self-start sm:self-auto"
          >
            All products →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newInShop.map((p) => (
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

      {/* 7. Programmes & Projects */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="font-mono text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-2 sm:mb-3">
            Programmes &amp; projects
          </div>
          <h2 className="font-marcellus text-[30px] sm:text-[40px] font-normal leading-[1.1] tracking-[-0.01em] text-[#33261F]">
            {CLIENT_VERBATIM.sectionLines.programs}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {programs.map((prog) => (
            <div
              key={prog.title}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] overflow-hidden flex flex-col p-4 sm:p-5 hover:border-[#33261F] transition-colors"
            >
              <div data-cms-img className="aspect-[16/10] bg-[#E8E1D4] rounded-[8px] border border-[#E4DDD1] mb-3 sm:mb-4 overflow-hidden relative">
                <img
                  src={prog.image}
                  alt={prog.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2 left-2 z-10 font-mono text-[9.5px] sm:text-[10px] text-[#F4F0E7] bg-[#33261F]/85 backdrop-blur-sm px-2 py-1 rounded">
                  {prog.slot}
                </span>
              </div>
              <h3 className="font-figtree font-bold text-[16px] sm:text-[17px] text-[#33261F] mb-1.5">
                {prog.title}
              </h3>
              <p className="font-lora text-[13.5px] sm:text-[14.5px] text-[#6B5A4C] leading-[1.55] mb-4 flex-1">
                {prog.desc}
              </p>
              <Link
                href="/programmes"
                className="font-figtree text-[13px] sm:text-[13.5px] font-semibold text-[#8B2E24] hover:underline pt-3 border-t border-[#EFE9DE]"
              >
                Read more →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Membership Double Panel */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Left panel: Find a member */}
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="font-mono text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase text-[#6B5A4C] mb-2 sm:mb-3">
                Membership Database
              </div>
              <h3 className="font-marcellus text-[26px] sm:text-[30px] font-normal leading-[1.2] text-[#33261F] mb-3">
                Find a member
              </h3>
              <p className="font-lora text-[14.5px] sm:text-[15.5px] text-[#4A3C33] leading-[1.6] mb-6">
                Connect directly with master craftspeople, verified weaving clusters, and traditional workshops across Bhutan.
              </p>
            </div>
            <Link
              href="/members"
              className="self-start font-figtree font-semibold text-[14px] sm:text-[14.5px] bg-[#33261F] text-[#F4F0E7] px-5 sm:px-6 py-3 sm:py-3.5 rounded-[7px] hover:bg-[#8B2E24] transition-colors"
            >
              Search member directory →
            </Link>
          </div>

          {/* Right panel: Become a member */}
          <div className="bg-[#8B2E24] text-white rounded-[14px] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="font-mono text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase text-[#F0C4BD] mb-2 sm:mb-3">
                Join HAB
              </div>
              <h3 className="font-marcellus text-[26px] sm:text-[30px] font-normal leading-[1.2] text-white mb-3">
                Become a member
              </h3>
              <p className="font-lora text-[14.5px] sm:text-[15.5px] text-[#F6DED9] leading-[1.6] mb-6">
                Access product consignment in our central shop, participate in donor training programmes, and represent your craft in international trade fairs.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/membership/apply"
                className="font-figtree font-semibold text-[14px] sm:text-[14.5px] bg-white text-[#8B2E24] px-5 sm:px-6 py-3 sm:py-3.5 rounded-[7px] hover:bg-[#F4F0E7] transition-colors"
              >
                Apply for membership
              </Link>
              <Link
                href="/login"
                className="font-figtree font-semibold text-[14px] sm:text-[14.5px] border border-white text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-[7px] hover:bg-white/10 transition-colors"
              >
                Member login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. News & Events */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h2 className="font-marcellus text-[28px] sm:text-[34px] font-normal text-[#33261F] mb-1">
              News &amp; events
            </h2>
            <div className="font-lora text-[15px] sm:text-[16px] text-[#6B5A4C]">
              {CLIENT_VERBATIM.sectionLines.news}
            </div>
          </div>
          <Link
            href="/news"
            className="font-figtree text-[14px] sm:text-[15px] font-semibold text-[#8B2E24] hover:underline self-start sm:self-auto"
          >
            All updates →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {newsItems.map((news) => (
            <Link
              key={news.title}
              href="/news"
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6 flex flex-col hover:border-[#33261F] transition-colors group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[10px] sm:text-[10.5px] bg-[#F1E9DB] text-[#8B2E24] px-2 py-0.5 rounded">
                  {news.kind}
                </span>
                <span className="font-mono text-[10.5px] sm:text-[11px] text-[#6B5A4C]">
                  {news.date}
                </span>
              </div>
              <h3 className="font-figtree font-semibold text-[16.5px] sm:text-[18px] text-[#33261F] leading-[1.3] mb-2.5 group-hover:text-[#8B2E24] transition-colors">
                {news.title}
              </h3>
              <p className="font-lora text-[13.5px] sm:text-[14.5px] text-[#6B5A4C] leading-[1.5] flex-1">
                {news.blurb}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. Reports & Publications */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16 border-t border-[#E4DDD1]">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-[52px]">
          <div>
            <div className="font-mono text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-2 sm:mb-3">
              Accountability
            </div>
            <h2 className="font-marcellus text-[28px] sm:text-[34px] font-normal leading-[1.2] text-[#33261F] mb-3 sm:mb-4">
              Reports &amp; publications
            </h2>
            <p className="font-lora text-[15px] sm:text-[16px] text-[#6B5A4C] leading-[1.6] mb-5 sm:mb-6">
              HAB publishes annual programme reports, audited financial accounts, value-chain studies, and technical training manuals.
            </p>
            <Link
              href="/publications"
              className="font-figtree font-semibold text-[14px] sm:text-[14.5px] text-[#8B2E24] hover:underline"
            >
              All publications →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {publications.map((pub) => (
              <Link
                key={pub.title}
                href="/publications"
                className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] p-4 sm:p-5 flex flex-col justify-between hover:border-[#33261F] transition-colors"
              >
                <div>
                  <div className="font-mono text-[10px] sm:text-[10.5px] text-[#8B2E24] mb-2 uppercase">
                    {pub.kind}
                  </div>
                  <div className="font-figtree font-semibold text-[15px] sm:text-[16px] text-[#33261F] leading-[1.3] mb-4">
                    {pub.title}
                  </div>
                </div>
                <div className="font-mono text-[10.5px] sm:text-[11px] text-[#6B5A4C] pt-2.5 sm:pt-3 border-t border-[#EFE9DE]">
                  {pub.meta} ↓
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Partners & Funders */}
      <section className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-20 pt-6">
        <div className="font-mono text-[10.5px] sm:text-[11px] tracking-[0.16em] uppercase text-[#6B5A4C] mb-4 text-center">
          Partners &amp; Funders
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[1px] bg-[#E4DDD1] border border-[#E4DDD1] rounded-[10px] overflow-hidden">
          {CLIENT_VERBATIM.partners.map((partner) => (
            <div
              key={partner}
              className="h-[68px] sm:h-[78px] bg-white flex items-center justify-center p-3 text-center"
            >
              <span className="font-mono text-[10.5px] sm:text-[11px] text-[#33261F]">
                {partner}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
