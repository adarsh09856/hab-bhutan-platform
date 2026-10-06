import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { Globe, FileCheck, ShieldAlert, Award, Plane, Phone, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Duties, Taxes & Customs Policy · Handicrafts Association of Bhutan',
  description: 'Official customs clearance, import tax disclosures, and origin certifications for international exports from the Kingdom of Bhutan.',
};

export default async function CustomsPolicyPage() {
  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="customs-hero">
        <SectionEditBadge label="Policies CMS" studioHref="/admin/policies" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/policies">Policies</Link> / Duties &amp; Customs Policy
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">International Trade &amp; Compliance</p>
            <h1 className="display display--page">Duties, Taxes &amp; Customs</h1>
            <p className="lede">
              Every parcel sent by the Handicrafts Association of Bhutan is dispatched directly from the Kingdom of Bhutan with official governmental craft origin certifications, commercial invoices, and statutory clearances.
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Export Origin</span>
              <span className="craftfacts__val">Thimphu, Bhutan</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Customs Declaration</span>
              <span className="craftfacts__val">CN22 / CN23 Statutory</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Valuation Basis</span>
              <span className="craftfacts__val">100% Transparent</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Documentation</span>
              <span className="craftfacts__val">Authenticity Seal Included</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Import Rules */}
      <section className="section" data-hab-section="customs-rules">
        <div className="mb-8 pb-4 border-b border-stone-200">
          <p className="eyebrow eyebrow--brass">Patron Guidelines</p>
          <h2 className="display display--sub">Import Duty &amp; Local Tax Responsibilities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#8B2E24] flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900 mb-2">Destination Taxes (VAT / GST)</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Product prices displayed on this platform exclude import VAT, GST, customs excise, and local clearance fees. 
              These levies are determined solely by your national customs authority and are collected by the courier (DHL or Bhutan Post partner) prior to delivery.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#8B2E24] flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900 mb-2">Authentic Origin Documents</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              All consignments leave Thimphu accompanied by an official HAB Certificate of Origin verifying that the article was handcrafted within the Kingdom of Bhutan under CSO/2011/043, which often qualifies for preferential handicraft tariff brackets.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#8B2E24] flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900 mb-2">Statutory Valuation Code</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              As an accredited apex Civil Society Organization, HAB strictly complies with international trade treaties. 
              We cannot falsify values, under-declare invoices, or mark commercial merchandise as personal gifts under any circumstances.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Cultural Clearances & Species Statements */}
      <section className="band" data-hab-section="customs-clearance">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass">Cultural Heritage &amp; Ecology</p>
            <h2 className="display display--vm">Antiquity &amp; CITES Compliance</h2>
            <p className="band__body">
              The Kingdom of Bhutan enforces strict statutory controls on national treasures and natural materials. 
              Every piece sold by HAB is certified modern artisanal production and holds all required clearances before export.
            </p>
          </div>
          <div className="vm__second space-y-4 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Department of Culture Antiquity Clearance
              </h4>
              <p>
                Sacred thangkas, consecrated metalwork, and heirloom textiles undergo Department of Culture inspection to certify they are non-antiquities permitted for permanent international export.
              </p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sustainable Forestry &amp; Plant Clearances
              </h4>
              <p>
                Wooden masks (dapa), bamboo cane articles (tshazo), and handmade daphne desho papers carry Bhutanese phytosanitary documentation verifying legal forest harvesting and international plant quarantine compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Contact & Support */}
      <section className="section section--last" data-hab-section="customs-contact">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--accent">Export Trade Desk</p>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">Questions on Customs Documentation?</h3>
            <p className="text-xs text-stone-600 mt-1">
              Contact our international freight and customs coordinator for specific country tariff codes or wholesale clearance paperwork.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-stone-700">
              <span className="flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-[#8B2E24]" /> +975-2-338089
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-[#8B2E24]" /> officehab@gmail.com
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/shipping-policy" 
              className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
            >
              <Plane className="w-3.5 h-3.5" /> Shipping Policy
            </Link>
            <Link 
              href="/returns-policy" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" /> Returns Policy
            </Link>
            <Link 
              href="/track-order" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              Track Consignment
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
