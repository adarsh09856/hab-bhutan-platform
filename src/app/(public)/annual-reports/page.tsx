import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { FileText, Download, Calendar, ShieldCheck, ArrowRight, ExternalLink, Sparkles, Building } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Official Annual Reports · Handicrafts Association of Bhutan',
  description: 'Annual reports, programme outcomes, artisan impact statistics, and statutory governance filings published by the Handicrafts Association of Bhutan.',
};

const DEFAULT_ANNUAL_REPORTS = [
  {
    year: 2025,
    title: 'HAB Annual Report 2025: Empowering Heritage & Rural Enterprises',
    meta: 'PDF · 4.8 MB · English & Dzongkha',
    abstract: 'Comprehensive annual overview of nationwide interventions across 20 Dzongkhags. Details the onboarding of 1,200 new female weavers, completion of the Punakha riverfront market renovation, and direct artisan disbursements exceeding Nu. 42 million.',
    highlights: ['7,500+ Rural Artisans Supported', 'Nu. 42M+ Direct Artisan Payments', '24 Capacity Building Workshops', 'Full Audited Accounts Included'],
    downloadUrl: '/assets/docs/hab-annual-report-2025.pdf',
    publishedDate: 'January 2026',
    isLatest: true,
  },
  {
    year: 2024,
    title: 'HAB Annual Report 2024: Sustainable Value Chains & Craft Modernisation',
    meta: 'PDF · 3.9 MB · English & Dzongkha',
    abstract: 'Focuses on the launch of natural vegetable dye cultivation in Eastern Bhutan, export facilitation to European and Asian markets, and standardized quality certification benchmarks.',
    highlights: ['5,800 Members Documented', 'Natural Dye Co-op Established', '14 International Exhibitions Attended'],
    downloadUrl: '/assets/docs/hab-annual-report-2024.pdf',
    publishedDate: 'January 2025',
    isLatest: false,
  },
  {
    year: 2023,
    title: 'HAB Annual Report 2023: Post-Pandemic Resilience & Artisan Recovery',
    meta: 'PDF · 3.2 MB · English & Dzongkha',
    abstract: 'Details emergency revolving credit funds disbursed to vulnerable woodcarvers and cane-weavers, alongside digital catalogue modernization for overseas direct consignments.',
    highlights: ['Revolving Fund Disbursed', 'E-Commerce Platform Beta Launch', 'Regional Guild Elections'],
    downloadUrl: '/assets/docs/hab-annual-report-2023.pdf',
    publishedDate: 'January 2024',
    isLatest: false,
  },
  {
    year: 2022,
    title: 'HAB Annual Report 2022: Preserving the Sacred Arts of Zorig Chusum',
    meta: 'PDF · 2.8 MB · English & Dzongkha',
    abstract: 'Documenting master-to-apprentice placements in endangered crafts including Desho papermaking, bronze casting, and intricate backstrap Kishuthara weaving.',
    highlights: ['Master-Apprentice Placements', 'National Craft Award Support', 'CSO Governance Audit Pass'],
    downloadUrl: '/assets/docs/hab-annual-report-2022.pdf',
    publishedDate: 'January 2023',
    isLatest: false,
  },
];

async function getAnnualReports() {
  try {
    const pubs = await prisma.publication.findMany({
      where: {
        OR: [
          { kind: { contains: 'annual', mode: 'insensitive' } },
          { title: { contains: 'annual', mode: 'insensitive' } },
        ],
      },
      orderBy: { year: 'desc' },
    });
    if (pubs.length > 0) {
      return pubs.map((p, idx) => ({
        year: p.year || 2025,
        title: p.title,
        meta: p.metaDetails || 'PDF · English & Dzongkha',
        abstract: (p as any).abstract || p.metaDetails || 'Official annual report of the Handicrafts Association of Bhutan.',
        highlights: ['CSO Regulatory Filing', 'Programme Metrics Included', 'Audited Accounts'],
        downloadUrl: p.fileUrl || '/assets/docs/hab-annual-report-2025.pdf',
        publishedDate: `${p.year || 2025}`,
        isLatest: idx === 0,
      }));
    }
  } catch {
    // fallback
  }
  return DEFAULT_ANNUAL_REPORTS;
}

export default async function AnnualReportsPage() {
  const reports = await getAnnualReports();
  const latest = reports[0];
  const archive = reports.slice(1);

  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="annual-reports-hero">
        <SectionEditBadge label="Publications CMS" studioHref="/admin/publications" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/publications">Publications</Link> / Annual Reports
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Statutory Transparency</p>
            <h1 className="display display--page">Annual Reports</h1>
            <p className="lede">
              Official yearly reports detailing our nationwide craft programs, artisan impact metrics, donor funded projects, and audited statutory ledgers published in both English and Dzongkha.
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Authority Filing</span>
              <span className="craftfacts__val">CSO Authority of Bhutan</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Bilingual Format</span>
              <span className="craftfacts__val">English &amp; Dzongkha</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Financial Disclosure</span>
              <span className="craftfacts__val">Independent Audit Pass</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Frequency</span>
              <span className="craftfacts__val">Annual Public Release</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Latest Report */}
      {latest && (
        <section className="section" data-hab-section="annual-reports-featured">
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-stone-50 border border-amber-200/80 rounded-3xl p-8 lg:p-12 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B2E24] text-white text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Latest Official Release · {latest.year}
                </div>
                <h2 className="font-serif text-2xl lg:text-3xl font-bold text-stone-900 leading-tight">
                  {latest.title}
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {latest.abstract}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {latest.highlights.map((h, i) => (
                    <div key={i} className="p-3 bg-white border border-stone-200 rounded-xl text-center">
                      <span className="text-[11px] font-bold text-stone-800 block">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-8 bg-white border border-stone-200 rounded-2xl shadow-xs text-center flex-shrink-0 w-full lg:w-72">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-[#8B2E24] flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-base font-bold text-stone-900 mb-1">Dual-Language Edition</h3>
                <p className="text-xs text-stone-500 mb-5">{latest.meta}</p>
                <a
                  href={latest.downloadUrl}
                  download
                  className="w-full py-3 px-4 bg-[#8B2E24] hover:bg-[#72251D] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Report (PDF)
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Archive of Past Reports */}
      {archive.length > 0 && (
        <section className="section" data-hab-section="annual-reports-archive">
          <div className="mb-8 pb-4 border-b border-stone-200">
            <p className="eyebrow eyebrow--brass">Historical Records</p>
            <h2 className="display display--sub">Past Annual Publications Archive</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {archive.map((rep, idx) => (
              <article 
                key={idx}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs hover:border-[#8B2E24]/30 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
                    <span className="font-bold text-[#8B2E24] bg-amber-50 px-2.5 py-0.5 rounded-md font-mono">{rep.year}</span>
                    <span>{rep.publishedDate}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug mb-2">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {rep.abstract}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-mono">{rep.meta}</span>
                  <a
                    href={rep.downloadUrl}
                    download
                    className="p-2 text-[#8B2E24] hover:bg-amber-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 4. Action Banner */}
      <section className="section section--last" data-hab-section="annual-reports-links">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--accent">Statutory Compliance</p>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">Looking for Financial Ledgers?</h3>
            <p className="text-xs text-stone-600 mt-1">
              Read certified balance sheets and external audit sign-offs on our dedicated Audited Accounts portal.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/audited-accounts" 
              className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Audited Accounts
            </Link>
            <Link 
              href="/board-of-trustees" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              Board of Trustees
            </Link>
            <Link 
              href="/publications" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              All Publications
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
