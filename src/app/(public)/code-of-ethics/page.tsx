import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { ShieldCheck, HeartHandshake, Leaf, Scale, Users, AlertTriangle, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Code of Ethics & Fair Dealing Charter · Handicrafts Association of Bhutan',
  description: 'Ethical standards, artisan welfare commitments, anti-exploitation charters, and ecological harvesting principles enforced by the Handicrafts Association of Bhutan.',
};

const ETHICAL_PILLARS = [
  {
    icon: HeartHandshake,
    title: 'Upfront Fair Remuneration',
    body: 'Artisans are paid an agreed fair wholesale rate upon product handover in Thimphu or regional clusters. Payment is strictly never contingent on final retail sale, eliminating inventory risk for grassroots craft families.',
  },
  {
    icon: Scale,
    title: 'Prohibition of Middlemen & Exploitation',
    body: 'HAB directly engages producer households and clusters. Intermediary broker fees and unregulated commissions are strictly banned across our e-shop, physical outlets, and donor consignment programs.',
  },
  {
    icon: Award,
    title: 'Sacred Iconography & Cultural Reverence',
    body: 'Traditional religious arts—including consecrated bronze statues, ceremonial wood masks, and sacred thangkas—must adhere strictly to Department of Culture proportions and Buddhist aesthetic canons.',
  },
  {
    icon: Users,
    title: 'Gender Parity & Dignified Workspaces',
    body: 'Over 70% of HAB-affiliated enterprises are women-led. We enforce zero harassment, equal pay, safe ventilation in dyeing/forging facilities, and child-safe home cluster environments.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Ecological Harvesting',
    body: 'All wild craft materials—including Daphne bark for Desho paper, bamboo cane roots, and plant dyestuffs—must be gathered sustainably in compliance with national community forestry guidelines.',
  },
  {
    icon: ShieldCheck,
    title: 'Zero Tolerance for Counterfeits',
    body: 'Imported factory goods or machine-embroidered textiles falsely branded as traditional Bhutanese crafts result in immediate revocation of member credentials, store clearance, and CSO statutory referral.',
  },
];

export default async function CodeOfEthicsPage() {
  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="ethics-hero">
        <SectionEditBadge label="Ethics page sections" studioHref="/admin/pages/sections?path=/code-of-ethics" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/about">About Us</Link> / Code of Ethics
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Integrity &amp; Artisan Welfare</p>
            <h1 className="display display--page">Code of Ethics</h1>
            <p className="lede">
              The ethical charter governing every member, enterprise, secretariat officer, and retail partnership of the Handicrafts Association of Bhutan. 
              We protect traditional artisans from predatory commercialization and uphold the sanctity of living heritage.
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Charter Standard</span>
              <span className="craftfacts__val">Fair Trade &amp; CSO 2026</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Payment Policy</span>
              <span className="craftfacts__val">100% Upfront Fair Price</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Women Leadership</span>
              <span className="craftfacts__val">70%+ Female Guilds</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Origin Verification</span>
              <span className="craftfacts__val">Authentic Provenance</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 6 Pillars Grid */}
      <section className="section" data-hab-section="ethics-pillars">
        <div className="mb-8 pb-4 border-b border-stone-200">
          <p className="eyebrow eyebrow--brass">Ethical Standards</p>
          <h2 className="display display--sub">Core Pillars of Fair Dealing</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ETHICAL_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <article 
                key={idx}
                className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 shadow-xs hover:border-[#8B2E24]/30 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#8B2E24] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {pillar.body}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced Across All 20 Dzongkhags
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. Whistleblower & Grievance Band */}
      <section className="band" data-hab-section="ethics-whistleblower">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass">Oversight &amp; Redress</p>
            <h2 className="display display--vm">Artisan Whistleblower Hotline</h2>
            <p className="band__body">
              Any artisan, cluster member, or wholesale patron who encounters deceptive practices, underpayment, unauthorized consignment deductions, or counterfeit merchandise can report directly to the Secretariat or Board of Trustees in complete confidentiality.
            </p>
          </div>
          <div className="vm__second space-y-3 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Confidential Ethics Desk</strong>
                <span className="font-mono text-xs">+975-2-338089 (Direct Hotline) · +975-77654508 (Executive Director)</span>
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Direct Email Reporting</strong>
                <span className="font-mono text-xs">officehab@gmail.com · Subject: &quot;CONFIDENTIAL ETHICS REPORT&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Banner */}
      <section className="section section--last" data-hab-section="ethics-links">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--accent">Related Governance</p>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">Explore Mandate &amp; Strategic Vision</h3>
            <p className="text-xs text-stone-600 mt-1">
              Read our constitutional Articles of Association or review the 2025–2030 strategic development roadmap.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/mandate" 
              className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" /> Our Mandate &amp; AoA
            </Link>
            <Link 
              href="/strategic-plan" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              Strategic Plan
            </Link>
            <Link 
              href="/board-of-trustees" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              Board of Trustees
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
