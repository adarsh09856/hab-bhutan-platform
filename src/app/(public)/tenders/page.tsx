import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import DocumentEmbedViewer from '@/components/public/DocumentEmbedViewer';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Building2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Official Tenders & Procurements · HAB Secretariat',
  description: 'Procurement requests, calls for proposals, artisan grant tenders, and consultancy opportunities published by the Handicrafts Association of Bhutan.',
};

const DEFAULT_TENDERS = [
  {
    id: 'tend-1',
    tenderNumber: 'HAB/TEND/2026/001',
    title: 'Supply and Installation of Natural Dyeing Processing Machinery for Khoma Artisan Centre',
    category: 'Procurement',
    description: 'The Handicrafts Association of Bhutan invites sealed bids from eligible national and regional suppliers for the supply, delivery, and testing of natural dye boiling vats, extract filtering equipment, and ventilation systems for the Lhuentse Khoma Cluster facility.',
    openingDate: new Date('2026-08-15'),
    closingDate: new Date('2026-10-30T17:00:00Z'),
    documentUrl: '/docs/tenders/HAB_Tender_2026_001_DyeMachinery.pdf',
    documentType: 'PDF',
    documentTitle: 'Bidding Document HAB/TEND/2026/001 (PDF)',
    submissionEmail: 'officehab@gmail.com',
    contactPerson: 'Secretary Desk, HAB',
    contactPhone: '+975-2-338089',
    estimatedBudget: 'Nu. 650,000',
    eligibility: 'Valid Trade License for supply of machinery, Tax Clearance Certificate, and 3+ years experience in institutional equipment supply.',
    status: 'OPEN',
  },
  {
    id: 'tend-2',
    tenderNumber: 'HAB/TEND/2026/002',
    title: 'Consultancy for Bhutanese Craft Authenticity QR System & Digital Provenance Registry',
    category: 'Consultancy',
    description: 'Request for Proposals (RFP) for technical consulting services to architect and deploy a decentralized batch verification system linking physical seals of origin to artisan producer registries.',
    openingDate: new Date('2026-09-01'),
    closingDate: new Date('2026-11-15T17:00:00Z'),
    documentUrl: '/docs/tenders/HAB_RFP_2026_002_Provenance.pdf',
    documentType: 'PDF',
    documentTitle: 'Terms of Reference & RFP Document (PDF)',
    submissionEmail: 'officehab@gmail.com',
    contactPerson: 'Secretary Desk, HAB',
    contactPhone: '+975-2-338089',
    estimatedBudget: 'Nu. 800,000',
    eligibility: 'Registered ICT consultancy firm in Bhutan or SAARC region with proven track record in supply-chain traceability solutions.',
    status: 'OPEN',
  },
  {
    id: 'tend-3',
    tenderNumber: 'HAB/TEND/2026/003',
    title: 'National Craft Bazaar Display Booth Fabrication & Timber Stalls Upgrade',
    category: 'Construction',
    description: 'Fabrication of 24 traditional timber craft stalls and weather-resistant roofing canopies for the Punakha and Thimphu artisan weekend markets.',
    openingDate: new Date('2026-07-10'),
    closingDate: new Date('2026-08-20T17:00:00Z'),
    documentUrl: null,
    documentType: 'PDF',
    documentTitle: null,
    submissionEmail: 'officehab@gmail.com',
    contactPerson: 'Secretary Desk, HAB',
    contactPhone: '+975-2-338089',
    estimatedBudget: 'Nu. 420,000',
    eligibility: 'Certified Traditional Carpentry (Shingzo) enterprise holding Class C contractor license.',
    status: 'CLOSED',
  },
];

export default async function TendersPage() {
  let dbTenders: any[] = [];
  try {
    dbTenders = await prisma.tenderRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { closingDate: 'desc' }],
    });
  } catch {}

  const tenders = dbTenders.length > 0 ? dbTenders : DEFAULT_TENDERS;
  const openTenders = tenders.filter((t) => t.status === 'OPEN');
  const pastTenders = tenders.filter((t) => t.status !== 'OPEN');

  return (
    <main id="main" className="min-h-screen bg-[#FBF9F5] py-10 px-4 sm:px-6 lg:px-10 font-figtree">
      <div className="max-w-5xl mx-auto space-y-10 relative" data-hab-section="tenders-portal">
        <SectionEditBadge label="Tenders Studio" studioHref="/admin/tenders" />

        {/* Breadcrumb */}
        <div className="font-mono text-xs text-[#6B5A4C]">
          <Link href="/" className="hover:underline">Home</Link> /{' '}
          <span className="text-[#33261F] font-semibold">Official Tenders &amp; Procurements</span>
        </div>

        {/* Hero Header */}
        <div className="border-b border-[#E4DDD1] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE5D6] text-[#6B5A4C] font-mono text-xs font-semibold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-[#8B2E24]" />
            Official Secretariat Noticeboard
          </div>
          <h1 className="font-marcellus text-3xl sm:text-4xl text-[#33261F] leading-tight">
            Tenders, Procurements &amp; Expressions of Interest
          </h1>
          <p className="font-lora text-slate-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            All institutional procurements, machinery requisitions, donor project requests for proposal (RFP), and craft cluster grants issued by the Handicrafts Association of Bhutan are published here in compliance with CSO transparency regulations.
          </p>
        </div>

        {/* Secretary Notice Box */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4DDD1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#8B2E24]/10 text-[#8B2E24] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#33261F]">
                Secretary Desk Official Contact for Bidders
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All tender documents, sealed bids, and queries should be directed to the official Secretariat desk.
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs font-mono text-[#8B2E24]">
                <a href="mailto:officehab@gmail.com" className="hover:underline flex items-center gap-1 font-sans">
                  <span>✉ officehab@gmail.com</span>
                </a>
                <a href="tel:+975-2-338089" className="hover:underline flex items-center gap-1 font-sans">
                  <span>☎ +975-2-338089</span>
                </a>
                <span className="text-slate-500 font-sans">CSO Reg. CSO/2011/043</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Active Open Tenders */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-marcellus text-2xl text-[#33261F] flex items-center gap-2">
              <span>Active Open Tenders</span>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-100 text-emerald-800">
                {openTenders.length} Open
              </span>
            </h2>
          </div>

          {openTenders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E4DDD1] text-slate-500 text-sm">
              There are currently no open tenders under active procurement. Please check back shortly.
            </div>
          ) : (
            <div className="space-y-6">
              {openTenders.map((tender) => {
                const isUrgent = new Date(tender.closingDate).getTime() - new Date().getTime() < 7 * 24 * 3600 * 1000;
                return (
                  <div
                    key={tender.id}
                    className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E4DDD1] shadow-xs hover:border-[#8B2E24]/40 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F4F0E7]">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded bg-[#EDE5D6] text-[#6B5A4C] font-mono text-xs font-bold">
                          {tender.tenderNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          {tender.category}
                        </span>
                        {isUrgent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
                            Closing Soon
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Opened: {new Date(tender.openingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-rose-700">
                          <Clock className="w-3.5 h-3.5" />
                          Closes: {new Date(tender.closingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-marcellus text-xl text-[#33261F] leading-snug">
                        {tender.title}
                      </h3>
                      <p className="font-lora text-slate-600 text-sm mt-2 leading-relaxed">
                        {tender.description}
                      </p>
                    </div>

                    {tender.eligibility && (
                      <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E8E1D4] text-xs text-slate-700 space-y-1">
                        <strong className="text-[#33261F] font-semibold block">Eligibility &amp; Mandatory Criteria:</strong>
                        <p>{tender.eligibility}</p>
                      </div>
                    )}

                    {/* Document Embed or Link */}
                    {tender.documentUrl && (
                      <DocumentEmbedViewer
                        documentUrl={tender.documentUrl}
                        documentType={tender.documentType || 'PDF'}
                        documentTitle={tender.documentTitle || `${tender.tenderNumber} Specification Document`}
                      />
                    )}

                    {/* Submission Footer */}
                    <div className="pt-3 border-t border-[#F4F0E7] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                      <div className="text-slate-500">
                        {tender.estimatedBudget && (
                          <span className="mr-3">
                            Estimated Value: <strong className="text-slate-900 font-mono">{tender.estimatedBudget}</strong>
                          </span>
                        )}
                        <span>Contact: <strong>{tender.contactPerson || 'Secretary Desk'}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${tender.submissionEmail || 'officehab@gmail.com'}?subject=Bidding%20Submission%20${encodeURIComponent(tender.tenderNumber)}`}
                          className="px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#72241C] text-white font-semibold shadow-xs transition"
                        >
                          Submit Bid via Email →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Closed / Awarded Tenders */}
        {pastTenders.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#E4DDD1]">
            <h2 className="font-marcellus text-xl text-slate-600">
              Archived &amp; Awarded Procurements
            </h2>
            <div className="divide-y divide-[#E4DDD1] bg-white rounded-2xl border border-[#E4DDD1] p-4">
              {pastTenders.map((tender) => (
                <div key={tender.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 font-semibold">{tender.tenderNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        {tender.status}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-slate-700 mt-0.5">
                      {tender.title}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Closed {new Date(tender.closingDate).toLocaleDateString('en-GB')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
