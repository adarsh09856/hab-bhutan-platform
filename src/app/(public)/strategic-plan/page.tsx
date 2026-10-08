import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import prisma from '@/lib/prisma';
import { STRATEGIC_PILLARS } from '@/lib/governance-page-defaults';
import { Target, TrendingUp, Users, Sparkles, Download, ArrowRight, ShieldCheck, CheckCircle2, Leaf, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Strategic Plan 2025–2030 · Handicrafts Association of Bhutan',
  description: 'The Five-Year Strategic Development Framework of the Handicrafts Association of Bhutan, detailing national craft cluster economic development and heritage preservation.',
};

export default async function StrategicPlanPage() {
  const saved = await prisma.governancePageCard.findMany({ where: { section: 'strategic' }, orderBy: { sortOrder: 'asc' } }).catch(() => []);
  const pillars = saved.length ? saved.filter((card) => card.isActive).map((card) => ({ num: card.number || '', title: card.title, desc: card.body, metric: card.metric || '' })) : STRATEGIC_PILLARS;
  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="strategic-hero">
        <SectionEditBadge label="Strategic page sections" studioHref="/admin/pages/sections?path=/strategic-plan" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/about">About Us</Link> / Strategic Plan 2025–2030
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Five-Year Development Framework</p>
            <h1 className="display display--page">Strategic Plan 2025–2030</h1>
            <p className="lede">
              Towards a vibrant, sustainable, and high-value handicrafts economy in the Kingdom of Bhutan. 
              Our five-year roadmap unifies cultural heritage preservation, fair artisan remuneration, and modernized export infrastructure.
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Strategic Horizon</span>
              <span className="craftfacts__val">2025 – 2030</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Target Artisans</span>
              <span className="craftfacts__val">10,000+ Practitioners</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Dzongkhags Covered</span>
              <span className="craftfacts__val">All 20 Districts</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Lead Alignment</span>
              <span className="craftfacts__val">CSO Authority of Bhutan</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 5 Strategic Pillars */}
      <section className="section relative" data-hab-section="strategic-pillars">
        <SectionEditBadge label="Strategic pillars" studioHref="/admin/pages/governance-cards?section=strategic" sectionType="strategic-cards" />
        <div className="mb-8 pb-4 border-b border-stone-200">
          <p className="eyebrow eyebrow--brass">Strategic Pillars</p>
          <h2 className="display display--sub">Five Core Growth Interventions</h2>
        </div>

        <div className="space-y-6">
          {pillars.map((p, idx) => (
            <article 
              key={idx}
              className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 shadow-xs hover:border-[#8B2E24]/30 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-amber-50 text-[#8B2E24] text-xs font-bold font-mono flex items-center justify-center border border-amber-200">
                    {p.num}
                  </span>
                  <h3 className="font-serif text-lg lg:text-xl font-bold text-stone-900">
                    {p.title}
                  </h3>
                </div>
                <p className="text-xs lg:text-sm text-stone-600 leading-relaxed pl-0 lg:pl-12">
                  {p.desc}
                </p>
              </div>

              <div className="flex-shrink-0 lg:text-right pl-0 lg:pl-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">2030 Key Milestone</span>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold font-mono">
                  {p.metric}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Measuring Impact & Annual Verification */}
      <section className="band" data-hab-section="strategic-monitoring">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass">Rigorous Monitoring</p>
            <h2 className="display display--vm">Annual Progress Audits</h2>
            <p className="band__body">
              Every milestone in the 2025–2030 framework is subjected to independent annual monitoring. 
              The Executive Director reports progress bi-annually to the Board of Trustees, and published outcomes are incorporated directly into our public Annual Reports.
            </p>
          </div>
          <div className="vm__second space-y-3 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <strong className="text-white block text-sm mb-1">Grassroots Verification Missions</strong>
              <span>Bi-annual field visits conducted by Secretariat coordinators to inspect cluster workshops, tool maintenance, and artisan wage books across eastern and southern Bhutan.</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <strong className="text-white block text-sm mb-1">Donor Co-Financing Audits</strong>
              <span>Program budgets funded by international development partners undergo separate international standard audit inspections to verify capital disbursement fidelity.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Banner */}
      <section className="section section--last" data-hab-section="strategic-links">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--accent">Related Governance</p>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">Explore Annual Reports &amp; Mandate</h3>
            <p className="text-xs text-stone-600 mt-1">
              Read how previous five-year targets were met in our published Annual Reports or review our statutory AoA.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/annual-reports" 
              className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
            >
              Annual Reports
            </Link>
            <Link 
              href="/mandate" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              Our Mandate &amp; AoA
            </Link>
            <Link 
              href="/code-of-ethics" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              Code of Ethics
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
