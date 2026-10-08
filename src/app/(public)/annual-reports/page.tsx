import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import LocalizedRecordField from '@/components/public/LocalizedRecordField';
import { FileText, Download, Sparkles } from 'lucide-react';
import { isPublicPublicationTitle } from '@/lib/publication-visibility';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Official Annual Reports · Handicrafts Association of Bhutan',
  description: 'Annual reports, programme outcomes, artisan impact statistics, and statutory governance filings published by the Handicrafts Association of Bhutan.',
};

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
    return pubs.filter((publication) => isPublicPublicationTitle(publication.title)).map((publication) => ({
      year: publication.year,
      title: publication.title,
      titleDz: publication.titleDz,
      meta: publication.metaDetails,
      metaDz: publication.metaDetailsDz,
      summaryDz: publication.summaryDz,
      downloadUrl: publication.fileUrl,
    }));
  } catch {
    // Avoid presenting unverified report claims when publication data is unavailable.
  }
  return [];
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
          <Link href="/"><LocalizedRecordField english="Home" dzongkha="གདོང་ཤོག" /></Link> / <Link href="/publications"><LocalizedRecordField english="Publications" dzongkha="དཔེ་སྐྲུན" /></Link> / <LocalizedRecordField english="Annual Reports" dzongkha="ལོ་བསྟར་སྙན་ཞུ" />
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="Statutory Transparency" dzongkha="ཁྲིམས་མཐུན་གསལ་སྟོན" /></p>
            <h1 className="display display--page"><LocalizedRecordField english="Annual Reports" dzongkha="ལོ་བསྟར་སྙན་ཞུ" /></h1>
            <p className="lede">
              <LocalizedRecordField english="Browse the annual reports published by HAB. Use each report as the authoritative source for its programme outcomes, financial information, and governance disclosures." dzongkha="HAB གིས་དཔེ་སྐྲུན་འབད་བའི་ལོ་བསྟར་སྙན་ཞུ་ཚུ་གཟིགས་གནང་། ལས་རིམ་གྱི་གྲུབ་འབྲས་ དངུལ་འབྲེལ་གནས་ཚུལ་ དང་འཛིན་སྐྱོང་གསལ་སྟོན་ཚུའི་དོན་ལུ་སྙན་ཞུ་རེ་རེ་ལུ་ཁུངས་བཙུགས་གནང་།" />
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Published reports" dzongkha="དཔེ་སྐྲུན་སྙན་ཞུ" /></span>
              <span className="craftfacts__val">{reports.length}</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Displayed records" dzongkha="བཀོད་ཡོད་པའི་ཐོ་གཞུང" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="Admin-managed" dzongkha="བདག་སྐྱོང་གིས་འཛིན་སྐྱོང" /></span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Report source" dzongkha="སྙན་ཞུའི་འབྱུང་ཁུངས" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="Original publication" dzongkha="དཔེ་སྐྲུན་ངོ་མ" /></span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Updates" dzongkha="གསར་བཅོས" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="As published" dzongkha="དཔེ་སྐྲུན་བཞིན" /></span>
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
                  <Sparkles className="w-3.5 h-3.5" /> <LocalizedRecordField english="Latest publication" dzongkha="དཔེ་སྐྲུན་གསར་ཤོས" /> · {latest.year}
                </div>
                <h2 className="font-serif text-2xl lg:text-3xl font-bold text-stone-900 leading-tight">
                  <LocalizedRecordField english={latest.title} dzongkha={latest.titleDz} />
                </h2>
                {latest.summaryDz && <p className="text-sm text-stone-600 leading-relaxed"><LocalizedRecordField english="" dzongkha={latest.summaryDz} /></p>}
              </div>

              <div className="flex flex-col items-center justify-center p-8 bg-white border border-stone-200 rounded-2xl shadow-xs text-center flex-shrink-0 w-full lg:w-72">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-[#8B2E24] flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-base font-bold text-stone-900 mb-1"><LocalizedRecordField english="Publication file" dzongkha="དཔེ་སྐྲུན་ཡིག་ཆ" /></h3>
                <p className="text-xs text-stone-500 mb-5"><LocalizedRecordField english={latest.meta} dzongkha={latest.metaDz} /></p>
                {latest.downloadUrl ? <a
                  href={latest.downloadUrl}
                  download
                  className="w-full py-3 px-4 bg-[#8B2E24] hover:bg-[#72251D] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" /> <LocalizedRecordField english="Download report" dzongkha="སྙན་ཞུ་ཕབ་ལེན" />
                </a> : <span className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs font-semibold text-stone-500"><LocalizedRecordField english="No document attached" dzongkha="ཡིག་ཆ་མཐུད་མེད" /></span>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Archive of Past Reports */}
      {archive.length > 0 && (
        <section className="section" data-hab-section="annual-reports-archive">
          <div className="mb-8 pb-4 border-b border-stone-200">
            <p className="eyebrow eyebrow--brass"><LocalizedRecordField english="Historical Records" dzongkha="ལོ་རྒྱུས་ཐོ་གཞུང" /></p>
            <h2 className="display display--sub"><LocalizedRecordField english="Past Annual Publications Archive" dzongkha="སྔོན་གྱི་ལོ་བསྟར་དཔེ་སྐྲུན་ཡིག་མཛོད" /></h2>
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
                    <span>{rep.year}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug mb-2">
                    <LocalizedRecordField english={rep.title} dzongkha={rep.titleDz} />
                  </h3>
                  {rep.summaryDz && <p className="text-xs text-stone-600 leading-relaxed mb-4"><LocalizedRecordField english="" dzongkha={rep.summaryDz} /></p>}
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-mono"><LocalizedRecordField english={rep.meta} dzongkha={rep.metaDz} /></span>
                  {rep.downloadUrl ? <a
                    href={rep.downloadUrl}
                    download
                    className="p-2 text-[#8B2E24] hover:bg-amber-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </a> : <span className="text-xs font-semibold text-stone-400"><LocalizedRecordField english="No document attached" dzongkha="ཡིག་ཆ་མཐུད་མེད" /></span>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {reports.length === 0 && (
        <section className="section">
          <p className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-600">
            <LocalizedRecordField english="No annual reports are currently listed." dzongkha="ད་ལྟོ་ལོ་བསྟར་སྙན་ཞུ་གང་ཡང་ཐོ་བཀོད་མེད།" />
          </p>
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
