import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, Clock, Mail, Phone, Package, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Returns & Refunds Policy · Handicrafts Association of Bhutan',
  description: 'Official return and refund standards for handcrafted pieces purchased through the Handicrafts Association of Bhutan e-shop and outlets.',
};

export default async function ReturnsPolicyPage() {
  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="returns-hero">
        <SectionEditBadge label="Policies CMS" studioHref="/admin/policies" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/policies">Policies</Link> / Returns &amp; Refunds Policy
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Consumer Protection &amp; Guarantees</p>
            <h1 className="display display--page">Returns &amp; Refunds Policy</h1>
            <p className="lede">
              We stand behind every authentic handicraft created by our network of over 7,500 rural artisans. 
              Our return process is designed to protect both the patron and the traditional maker.
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Notice Window</span>
              <span className="craftfacts__val">14 Days from Delivery</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Return Window</span>
              <span className="craftfacts__val">30 Days from Dispatch</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Refund Processing</span>
              <span className="craftfacts__val">10 Working Days</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Damage Claims</span>
              <span className="craftfacts__val">Within 48 Hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Step-by-Step Return Process */}
      <section className="section" data-hab-section="returns-process">
        <div className="mb-8 pb-4 border-b border-stone-200">
          <p className="eyebrow eyebrow--brass">Step-by-Step</p>
          <h2 className="display display--sub">How to Request a Return</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 relative">
            <span className="w-8 h-8 rounded-full bg-[#8B2E24] text-white text-xs font-bold flex items-center justify-center mb-4">
              1
            </span>
            <h3 className="font-serif text-base font-bold text-stone-900 mb-2">Notify Secretariat</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Contact us within 14 days of receiving your package via <strong className="text-stone-800">officehab@gmail.com</strong> with your order confirmation number and photographs.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 relative">
            <span className="w-8 h-8 rounded-full bg-[#8B2E24] text-white text-xs font-bold flex items-center justify-center mb-4">
              2
            </span>
            <h3 className="font-serif text-base font-bold text-stone-900 mb-2">Receive RMA Slip</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We issue a Return Merchandise Authorisation (RMA) with our designated Thimphu return intake address and customs documentation slips.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 relative">
            <span className="w-8 h-8 rounded-full bg-[#8B2E24] text-white text-xs font-bold flex items-center justify-center mb-4">
              3
            </span>
            <h3 className="font-serif text-base font-bold text-stone-900 mb-2">Ship via Tracked Carrier</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Securely package the unused piece in its original packaging and dispatch via a tracked international service (DHL, FedEx, or national postal EMS).
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 relative">
            <span className="w-8 h-8 rounded-full bg-[#8B2E24] text-white text-xs font-bold flex items-center justify-center mb-4">
              4
            </span>
            <h3 className="font-serif text-base font-bold text-stone-900 mb-2">Inspection &amp; Refund</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Upon physical receipt and condition verification at our Thimphu facility, your refund is processed to your original payment method within 10 working days.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Conditions & Handmade Variations */}
      <section className="band" data-hab-section="returns-conditions">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass">Handcrafted Authenticity</p>
            <h2 className="display display--vm">Nature of Handmade Crafts</h2>
            <p className="band__body">
              Every item sold by HAB is crafted by hand using natural materials such as vegetable dyes, mountain wool, silk, bamboo, and indigenous timber. 
              Subtle variations in weave tension, pigment tone, and wood grain are natural markers of handcrafted heritage, not defects.
            </p>
          </div>
          <div className="vm__second space-y-4 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Non-Returnable Items
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-stone-300 mt-2">
                <li>Commissioned, made-to-order, or custom monogrammed pieces.</li>
                <li>Items altered, tailored, or washed after delivery.</li>
                <li>Pieces damaged through improper storage, direct sunlight, or handling.</li>
              </ul>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Damage or Loss in Transit
              </h4>
              <p>
                If your parcel arrives with physical transit damage, notify us within 48 hours with photos of both the outer carton and the inner piece. 
                We will immediately lodge a carrier insurance claim and either replace the work or issue a 100% refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Contact & Related Policies */}
      <section className="section section--last" data-hab-section="returns-contact">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--accent">RMA Desk Contact</p>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">Need to Open a Return Request?</h3>
            <p className="text-xs text-stone-600 mt-1">
              Contact our retail returns coordinator directly by telephone or through the dedicated order support portal.
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
              <Package className="w-3.5 h-3.5" /> Shipping Policy
            </Link>
            <Link 
              href="/customs-policy" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Customs Policy
            </Link>
            <Link 
              href="/track-order" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" /> Track Order
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
