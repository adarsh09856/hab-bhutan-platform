import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { ShieldCheck, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Statutory Policies & Governance · Handicrafts Association of Bhutan',
  description: 'Official policies, artisan rights charter, terms of service, and CSO governance standards of HAB.',
};

export default async function PoliciesIndexPage() {
  let dbPolicies: any[] = [];
  try {
    dbPolicies = await prisma.policyPage.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (err) {
    console.error('Error fetching policies index:', err);
  }

  const defaultPolicies = [
    {
      slug: 'terms',
      title: 'Terms of Service & Artisan Buy-Out Charter',
      description: 'The statutory terms governing website operations, outright upfront artisan purchases, and membership.',
      category: 'Governance & AoA 2026',
      href: '/policies/terms',
      updatedAt: 'September 2026',
    },
    {
      slug: 'shipping-policy',
      title: 'Shipping, Tracking & Heritage Certification Policy',
      description: 'International EMS & DHL dispatch, origin certification seals, customs declarations, and returns protocol.',
      category: 'Trade & Logistics',
      href: '/policies/shipping-policy',
      updatedAt: 'September 2026',
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy & Member Data Protection',
      description: 'Protection of member records, purchase history, and zero commercial monetization of artisan information.',
      category: 'Data Protection',
      href: '/policies/privacy',
      updatedAt: 'August 2026',
    },
  ];

  // Merge database policies
  const allPolicies: Array<{
    slug: string;
    title: string;
    description: string;
    category: string;
    href: string;
    updatedAt: string;
    isCustom?: boolean;
  }> = [...defaultPolicies];

  dbPolicies.forEach((dbp) => {
    const existingIdx = allPolicies.findIndex((p) => p.slug === dbp.slug);
    const dateFormatted = new Date(dbp.updatedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (existingIdx >= 0) {
      allPolicies[existingIdx] = {
        ...allPolicies[existingIdx],
        title: dbp.title || allPolicies[existingIdx].title,
        updatedAt: dateFormatted,
      };
    } else {
      allPolicies.push({
        slug: dbp.slug,
        title: dbp.title,
        description: dbp.content ? dbp.content.slice(0, 160).replace(/[#*_-]/g, '').trim() + '...' : 'Official statutory policy.',
        category: 'Statutory Charter',
        href: `/policies/${dbp.slug}`,
        updatedAt: dateFormatted,
        isCustom: true,
      });
    }
  });

  return (
    <main id="main">
      <section className="section relative" data-hab-section="policies-hub">
        <SectionEditBadge
          label="Policies Studio"
          studioHref="/admin/policies"
          className="top-3 right-3 sm:right-6"
        />

        <p className="crumbs">
          <Link href="/">Home</Link> / <span>Policies</span>
        </p>

        <h1 className="display display--page">Statutory Policies &amp; Legal Framework</h1>
        <p className="lede">
          Official statutory charters, fair-trade guarantees, member protections, and compliance standards governed under the Civil Society Organizations Act of Bhutan 2007.
        </p>
      </section>

      <section className="section section--last">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allPolicies.map((pol) => (
            <div
              key={pol.slug}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#8B2E24]/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10.5px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    {pol.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Updated {pol.updatedAt}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                  <Link href={pol.href} className="hover:text-[#8B2E24] transition-colors">
                    {pol.title}
                  </Link>
                </h2>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {pol.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enacted &amp; Active</span>
                </div>

                <Link
                  href={pol.href}
                  className="text-xs font-semibold text-[#8B2E24] hover:underline flex items-center gap-1"
                >
                  <span>Read Full Policy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B2E24] text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900">CSO Regulatory Registration</div>
              <div>CSO Registration: CSO/2011/043 · Thimphu, Kingdom of Bhutan</div>
            </div>
          </div>

          <div className="text-right sm:self-center text-slate-500">
            Governed by HAB Articles of Association (AoA 2026)
          </div>
        </div>
      </section>
    </main>
  );
}
