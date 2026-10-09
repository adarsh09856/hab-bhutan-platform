import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { isConfirmedPublicPersonName } from '@/lib/public-person-name';
import { ShieldCheck, Award, FileText, ArrowRight, Building, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Board of Trustees · Handicrafts Association of Bhutan',
  description: 'The Board of Trustees provides statutory governance, fiduciary oversight, and strategic guidance for the Handicrafts Association of Bhutan under the CSO Act of Bhutan 2007.',
};

async function getBoardData() {
  try {
    const records = await prisma.governanceRecord.findMany({
      where: { category: 'BOARD_OF_TRUSTEES' },
      orderBy: { sortOrder: 'asc' },
    });
    return records
      .map((r) => {
        const [cleanNote, photo] = (r.chapterOrNote || '').includes('||photo:')
          ? (r.chapterOrNote || '').split('||photo:')
          : [r.chapterOrNote || '', ''];
        return {
          name: isConfirmedPublicPersonName(r.individualName) ? r.individualName : 'Name to be confirmed',
          confirmed: isConfirmedPublicPersonName(r.individualName),
          role: r.roleTitle,
          note: cleanNote.trim(),
          photo: r.photoUrl || photo.trim() || '',
          bio: r.bio || '',
        };
      });
  } catch {
    // Do not substitute unverified people when current governance records are unavailable.
  }
  return [];
}

export default async function BoardOfTrusteesPage() {
  const boardList = await getBoardData();

  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="board-hero">
        <SectionEditBadge label="Board records" studioHref="/admin/pages/about?tab=board#board" sectionType="board-records" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/about">About Us</Link> / Board of Trustees
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Statutory Governance</p>
            <h1 className="display display--page">Board of Trustees</h1>
            <p className="lede">
              The apex oversight and fiduciary body stewarding the Handicrafts Association of Bhutan (CSO/2011/043). 
              Our Trustees ensure uncompromising commitment to artisan welfare, traditional craft preservation, and institutional transparency.
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Registration</span>
              <span className="craftfacts__val">CSO/2011/043</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Governing Act</span>
              <span className="craftfacts__val">CSO Act of Bhutan 2007</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Oversight Structure</span>
              <span className="craftfacts__val">Published after HAB confirmation</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Audit Mandate</span>
              <span className="craftfacts__val">Annual Public Disclosure</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Board Members Grid */}
      <section className="section" data-hab-section="board-members">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-stone-200">
          <div>
            <p className="eyebrow eyebrow--brass">Governing Council</p>
            <h2 className="display display--sub">Members of the Board</h2>
          </div>
          <p className="text-xs text-stone-500 max-w-md mt-2 md:mt-0">
            Trustees serve staggered three-year mandates and represent diverse sectors including master artisans, finance, cultural preservation, and market advocacy.
          </p>
        </div>

        {boardList.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boardList.map((member, idx) => (
            <article 
              key={idx} 
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:border-[#8B2E24]/30 hover:shadow-md transition-all flex flex-col"
            >
              <figure className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                {(member as any).photo ? <img src={(member as any).photo} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" /> : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-500 text-3xl font-semibold" role="img" aria-label="Portrait not supplied">
                    {member.name.split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-[#8B2E24] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                  {member.role}
                </div>
              </figure>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">{member.name}</h3>
                  <p className="text-xs font-medium text-[#8B2E24] mt-1">{member.note}</p>
                  {member.bio && <p className="text-xs text-stone-600 mt-3 leading-relaxed">{member.bio}</p>}
                </div>
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span>{member.confirmed ? 'Board of Trustees' : 'Name awaiting HAB confirmation'}</span>
                  <span>HAB CSO/2011/043</span>
                </div>
              </div>
            </article>
          ))}
        </div> : <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm leading-relaxed text-stone-600" role="status">
          <p className="font-semibold text-stone-800">Trustee names and portraits will be published after they are confirmed by HAB.</p>
          <p className="mt-2">For assistance, contact the <Link className="text-[#8B2E24] underline" href="/secretariat">Secretariat</Link>.</p>
        </div>}
      </section>

      {/* 3. Mandate & Governance Principles */}
      <section className="band" data-hab-section="board-mandate">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass">Core Responsibilities</p>
            <h2 className="display display--vm">Fiduciary &amp; Ethical Stewardship</h2>
            <p className="band__body">
              The Board sets long-term direction, evaluates the Executive Director and Secretariat, approves audited annual accounts, 
              and ensures that all donor allocations directly advance rural artisan livelihoods and heritage protection across Bhutan.
            </p>
          </div>
          <div className="vm__second space-y-4 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> CSO Regulatory Compliance
              </h4>
              <p>Adhering strictly to Civil Society Organization Authority guidelines with annual filings and open disclosure.</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Fair Artisan Pricing Safeguards
              </h4>
              <p>Mandating that master craftspeople receive upfront fair-value disbursements without intermediary markups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quick Governance Links */}
      <section className="section section--last" data-hab-section="board-links">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="eyebrow eyebrow--accent">Related Governance Portals</p>
              <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">Explore Statutory &amp; Operational Reports</h3>
              <p className="text-xs text-stone-600 mt-1">
                Access audited statements, meet the secretariat executive staff, or review annual progress publications.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/secretariat" 
                className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" /> Secretariat Team
              </Link>
              <Link 
                href="/audited-accounts" 
                className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Audited Accounts
              </Link>
              <Link 
                href="/annual-reports" 
                className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
              >
                <Building className="w-3.5 h-3.5" /> Annual Reports
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
