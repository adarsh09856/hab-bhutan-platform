import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { ShieldCheck, BookOpen, Scale, Award, Users, Download, ArrowRight, CheckCircle2, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Our Mandate & Articles of Association · Handicrafts Association of Bhutan',
  description: 'Official statutory mandate and Articles of Association (AoA) governing the Handicrafts Association of Bhutan under the CSO Act of Bhutan 2007 (CSO/2011/043).',
};

const ARTICLES = [
  {
    num: 'Article I',
    title: 'Sovereign Heritage & Stewardship of Zorig Chusum',
    body: 'The Association is constituted as the peak civil society body entrusted with safeguarding, transmitting, and advocating for the thirteen traditional arts and crafts (Zorig Chusum) of the Kingdom of Bhutan, ensuring ancient techniques remain living, thriving economic pursuits rather than museum antiquities.',
    tags: ['Cultural Continuity', 'Zorig Chusum', 'Crown Heritage'],
  },
  {
    num: 'Article II',
    title: 'Artisan Economic Protection & Elimination of Middlemen',
    body: 'HAB holds a statutory mandate to eliminate unfair predatory trading by guaranteeing fair upfront purchase prices to rural creators. The Association operates non-profit consignment and direct market infrastructure, ensuring over 84% of turnover flows directly to artisan producers.',
    tags: ['Fair Trade', '7,500+ Artisans', 'Upfront Payment'],
  },
  {
    num: 'Article III',
    title: 'National Quality Standards & Royal Seal of Origin',
    body: 'Empowered to inspect, accredit, and certify traditional Bhutanese craft pieces with the official Seal of Authenticity. HAB enforces strict origin traceability to protect local makers against mass-produced counterfeit imports sold under Bhutanese names.',
    tags: ['Provenance Certification', 'Anti-Counterfeit', 'Origin Traceability'],
  },
  {
    num: 'Article IV',
    title: 'Fiduciary Governance & Public Financial Disclosure',
    body: 'Under Section 31 of the CSO Act of Bhutan 2007, HAB operates under audited double-entry accounts certified annually by independent Chartered Accountants. No portion of net earnings may inure to any private shareholder or individual trustee.',
    tags: ['CSO/2011/043', 'Independent Audits', 'Public Ledgers'],
  },
  {
    num: 'Article V',
    title: 'Nationwide Cluster Representation Across 20 Dzongkhags',
    body: 'The Association shall maintain democratic artisan representation from all twenty Dzongkhags of Bhutan, fostering self-governing village craft clusters, women-led weaving guilds, and youth apprenticeships with equal access to tools and donor interventions.',
    tags: ['20 Dzongkhags', '70% Women-Led', 'Village Clusters'],
  },
];

export default async function MandatePage() {
  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="mandate-hero">
        <SectionEditBadge label="Mandate page sections" studioHref="/admin/pages/sections?path=/mandate" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/about">About Us</Link> / Our Mandate &amp; AoA
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Statutory Constitution</p>
            <h1 className="display display--page">Our Mandate &amp; AoA</h1>
            <p className="lede">
              The Handicrafts Association of Bhutan was established in 2005 and formally registered under the Civil Society Organizations Act of Bhutan 2007 as CSO/2011/043. 
              Our Articles of Association establish the legal mandate protecting thousands of traditional craft practitioners across the Kingdom.
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Registration No.</span>
              <span className="craftfacts__val">CSO/2011/043</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Governing Statute</span>
              <span className="craftfacts__val">CSO Act of Bhutan 2007</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Legal Classification</span>
              <span className="craftfacts__val">Apex Public Benefit CSO</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Charter Review</span>
              <span className="craftfacts__val">AoA Statutory 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statutory Legal Foundation */}
      <section className="section" data-hab-section="mandate-statute">
        <div className="mb-8 pb-4 border-b border-stone-200">
          <p className="eyebrow eyebrow--brass">Legal Foundations</p>
          <h2 className="display display--sub">Constitutional Articles of Association</h2>
        </div>

        <div className="space-y-6">
          {ARTICLES.map((art, idx) => (
            <article 
              key={idx}
              className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 shadow-xs hover:border-[#8B2E24]/30 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-amber-50 text-[#8B2E24] text-xs font-bold rounded-full font-mono border border-amber-200">
                    {art.num}
                  </span>
                  <h3 className="font-serif text-lg lg:text-xl font-bold text-stone-900">
                    {art.title}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {art.tags.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs lg:text-sm text-stone-600 leading-relaxed pl-0 md:pl-1 mt-2">
                {art.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Democratic Governance Structure */}
      <section className="band" data-hab-section="mandate-structure">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass">Institutional Authority</p>
            <h2 className="display display--vm">Apex Oversight &amp; Accountability</h2>
            <p className="band__body">
              HAB is governed under a bicameral structure: a non-executive Board of Trustees that provides strategic and fiduciary oversight, 
              and a full-time professional Secretariat based in Thimphu that executes daily operations, certifications, and international logistics.
            </p>
          </div>
          <div className="vm__second space-y-3 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <strong className="text-white block text-sm mb-1">General Assembly of Members</strong>
              <span>Bi-annual convention where accredited craft guild delegates from all 20 Dzongkhags elect representatives and vote on sector policy priorities.</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <strong className="text-white block text-sm mb-1">CSO Authority Regulatory Filings</strong>
              <span>Complete annual statutory submissions including audited accounts, programmatic impact KPIs, and executive director reviews submitted without exception.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Banner */}
      <section className="section section--last" data-hab-section="mandate-links">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--accent">Related Governance Documents</p>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">Explore Code of Ethics &amp; Strategic Roadmap</h3>
            <p className="text-xs text-stone-600 mt-1">
              Read our operational ethics standards, five-year strategic plan, or meet the governing Board of Trustees.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/code-of-ethics" 
              className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" /> Code of Ethics
            </Link>
            <Link 
              href="/strategic-plan" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" /> Strategic Plan
            </Link>
            <Link 
              href="/board-of-trustees" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Board of Trustees
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
