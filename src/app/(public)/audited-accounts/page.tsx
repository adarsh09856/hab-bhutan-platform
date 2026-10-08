import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import LocalizedRecordField from '@/components/public/LocalizedRecordField';
import { FileText, Download, CheckCircle2, Building2 } from 'lucide-react';
import { isPublicPublicationTitle } from '@/lib/publication-visibility';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Audited Financial Statements · Handicrafts Association of Bhutan',
  description: 'Certified financial audits, balance sheets, and statutory disclosure reports for the Handicrafts Association of Bhutan under CSO/2011/043.',
};

async function getAuditedStatements() {
  try {
    const pubs = await prisma.publication.findMany({
      where: {
        OR: [
          { kind: { contains: 'audit', mode: 'insensitive' } },
          { kind: { contains: 'account', mode: 'insensitive' } },
          { title: { contains: 'audit', mode: 'insensitive' } },
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
      downloadUrl: publication.fileUrl,
    }));
  } catch {
    // Keep unsupported financial data out of the public page during a read failure.
  }
  return [];
}

export default async function AuditedAccountsPage() {
  const accounts = await getAuditedStatements();

  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="audit-hero">
        <SectionEditBadge label="Governance CMS" studioHref="/admin/publications" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/about">About Us</Link> / Audited Accounts
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="Statutory Financial Disclosure" dzongkha="ཁྲིམས་མཐུན་དངུལ་འབྲེལ་གསལ་སྟོན" /></p>
            <h1 className="display display--page"><LocalizedRecordField english="Audited Accounts" dzongkha="རྩིས་ཞིབ་རྩིས་ཁྲ" /></h1>
            <p className="lede">
              <LocalizedRecordField english="Financial statements are listed below when published by HAB. Please refer to each original document for the auditor, audit opinion, and reported figures." dzongkha="HAB གིས་དཔེ་སྐྲུན་འབད་བའི་དངུལ་འབྲེལ་རྩིས་ཁྲ་ཚུ་འོག་ལུ་བཀོད་ཡོད། རྩིས་ཞིབ་པ་ རྩིས་ཞིབ་བསམ་འཆར་ དང་གྲངས་ཐོ་ཚུའི་དོན་ལུ་ཡིག་ཆ་ངོ་མ་རེ་རེ་ལུ་གཟིགས་གནང་།" />
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Registration" dzongkha="ཐོ་བཀོད" /></span>
              <span className="craftfacts__val">CSO/2011/043</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Records shown" dzongkha="བཀོད་པའི་ཐོ་གཞུང" /></span>
              <span className="craftfacts__val">{accounts.length}</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Documents Listed" dzongkha="ཡིག་ཆ་ཐོ་བཀོད" /></span>
              <span className="craftfacts__val">{accounts.length}</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Source of figures" dzongkha="གྲངས་ཐོའི་འབྱུང་ཁུངས" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="Original report" dzongkha="སྙན་ཞུ་ངོ་མ" /></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statutory Audit Highlights */}
      <section className="section" data-hab-section="audit-statements">
        <div className="mb-8 pb-4 border-b border-stone-200">
          <p className="eyebrow eyebrow--brass"><LocalizedRecordField english="Published Statements" dzongkha="དཔེ་སྐྲུན་རྩིས་ཁྲ" /></p>
          <h2 className="display display--sub"><LocalizedRecordField english="Audited Financial Statements" dzongkha="རྩིས་ཞིབ་དངུལ་འབྲེལ་རྩིས་ཁྲ" /></h2>
        </div>

        <div className="space-y-6">
          {accounts.map((stmt, idx) => (
            <article 
              key={idx}
              className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 shadow-xs hover:border-[#8B2E24]/30 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-amber-50 text-[#8B2E24] text-xs font-bold rounded-full font-mono border border-amber-200">
                    {stmt.year}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">{stmt.meta}</span>
                </div>

                <h3 className="font-serif text-xl font-bold text-stone-900 leading-snug">
                  <LocalizedRecordField english={stmt.title} dzongkha={stmt.titleDz} />
                </h3>

                <p className="text-xs text-stone-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  <LocalizedRecordField english="Use the original publication for its certified details." dzongkha="ངོས་ལེན་ཅན་གྱི་རྒྱས་བཤད་ཚུ་ལུ་དཔེ་སྐྲུན་ངོ་མ་ལུ་གཟིགས་གནང་།" />
                </p>
              </div>

              <div className="flex flex-col items-center justify-center lg:items-end flex-shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                {stmt.downloadUrl ? <a
                  href={stmt.downloadUrl}
                  download
                  className="px-5 py-3 bg-[#8B2E24] hover:bg-[#72251D] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" /> <LocalizedRecordField english="Open original statement" dzongkha="རྩིས་ཁྲ་ངོ་མ་ཁ་ཕྱེ" />
                </a> : <span className="rounded-xl border border-stone-200 bg-stone-50 px-5 py-3 text-xs font-semibold text-stone-500"><LocalizedRecordField english="No document attached" dzongkha="ཡིག་ཆ་མཐུད་མེད" /></span>}
              </div>
            </article>
          ))}
          {accounts.length === 0 && (
            <p className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-600">
              <LocalizedRecordField english="No audited-account publications are currently listed." dzongkha="ད་ལྟོ་རྩིས་ཞིབ་རྩིས་ཁྲའི་དཔེ་སྐྲུན་གང་ཡང་ཐོ་བཀོད་མེད།" />
            </p>
          )}
        </div>
      </section>

      {/* 3. Fiduciary Safeguards Band */}
      <section className="band" data-hab-section="audit-safeguards">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass"><LocalizedRecordField english="Published Documents" dzongkha="དཔེ་སྐྲུན་ཡིག་ཆ" /></p>
            <h2 className="display display--vm"><LocalizedRecordField english="Use the original statement as source" dzongkha="རྩིས་ཁྲ་ངོ་མ་ཁུངས་སྦེ་ལག་ལེན་འཐབ" /></h2>
            <p className="band__body">
              <LocalizedRecordField english="This page lists publication records and attached files. The original statement is the authoritative source for financial figures, auditor details, and audit opinions. Contact the Secretariat if a needed document is not attached." dzongkha="ཤོག་ལེབ་འདི་ནང་དཔེ་སྐྲུན་ཐོ་གཞུང་དང་མཐུད་ཡོད་པའི་ཡིག་ཆ་ཚུ་བཀོད་ཡོད། དངུལ་འབྲེལ་གྲངས་ཐོ་ རྩིས་ཞིབ་པའི་རྒྱས་བཤད་ དང་རྩིས་ཞིབ་བསམ་འཆར་ཚུའི་ཁུངས་བཙུགས་ཡིག་ཆ་ངོ་མ་ཨིན། དགོས་མཁོའི་ཡིག་ཆ་མཐུད་མེད་པ་ཅིན་དྲུང་ཆེའི་ཡིག་ཚང་ལུ་འབྲེལ་བ་འཐབ་གནང་།" />
            </p>
          </div>
          <div className="vm__second space-y-3 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <strong className="text-white block text-sm mb-1"><LocalizedRecordField english="Publication details" dzongkha="དཔེ་སྐྲུན་རྒྱས་བཤད" /></strong>
              <LocalizedRecordField as="span" english="Titles, years, file descriptions, and attached files come from the saved publication records." dzongkha="མགོ་མིང་ ལོ་ཚུ་ ཡིག་ཆའི་བཤད་པ་ དང་མཐུད་ཡོད་པའི་ཡིག་ཆ་ཚུ་ཉར་ཚགས་འབད་བའི་དཔེ་སྐྲུན་ཐོ་གཞུང་ལས་ལེནམ་ཨིན།" />
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <strong className="text-white block text-sm mb-1"><LocalizedRecordField english="Missing file?" dzongkha="ཡིག་ཆ་མེད་ག?" /></strong>
              <LocalizedRecordField as="span" english="Use the Contact link to request a publication that is not attached here." dzongkha="འབྲེལ་གཏུག་མཐུད་ལམ་ལག་ལེན་འཐབ་སྟེ་འདི་ནང་མཐུད་མེད་པའི་དཔེ་སྐྲུན་ཞུ་གནང་།" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Banner */}
      <section className="section section--last" data-hab-section="audit-links">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--accent">Related Governance</p>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">Explore Institutional Publications</h3>
            <p className="text-xs text-stone-600 mt-1">
              Read comprehensive narrative overviews, meet the Board of Trustees, or inspect open tenders.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/annual-reports" 
              className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Annual Reports
            </Link>
            <Link 
              href="/board-of-trustees" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              Board of Trustees
            </Link>
            <Link 
              href="/secretariat" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              The Secretariat
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
