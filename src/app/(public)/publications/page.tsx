'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface PublicationItem {
  kind: string;
  title: string;
  year: number;
  meta: string;
  isFeatured: boolean;
}

const PUBLICATIONS_DATA: PublicationItem[] = [
  { kind: "Annual report", title: "Annual Report 2025", year: 2026, meta: "PDF · 4.2 MB · English & Dzongkha", isFeatured: true },
  { kind: "Strategy", title: "Five-Year Strategic Plan 2026–2030", year: 2026, meta: "PDF · 3.6 MB · Board approved", isFeatured: true },
  { kind: "Sector study", title: "Zorig Chusum Value Chain Assessment", year: 2025, meta: "PDF · 2.8 MB · 96 pages", isFeatured: true },
  { kind: "Accounts", title: "Audited Financial Statements 2025", year: 2026, meta: "PDF · 1.1 MB · Independent auditor", isFeatured: true },
  { kind: "Catalogue", title: "HAB Product Catalogue 2026", year: 2026, meta: "PDF · 18.4 MB · 120 products", isFeatured: false },
  { kind: "Policy brief", title: "Craft Sector Tax and Licensing: A Note for Policymakers", year: 2025, meta: "PDF · 640 KB · 12 pages", isFeatured: false },
  { kind: "Guideline", title: "Natural Dye Handbook for Weavers", year: 2025, meta: "PDF · 6.2 MB · Illustrated", isFeatured: false },
  { kind: "Training manual", title: "Costing and Pricing for Craft Enterprises", year: 2025, meta: "PDF · 2.1 MB · Workbook", isFeatured: false },
  { kind: "Annual report", title: "Annual Report 2024", year: 2025, meta: "PDF · 3.9 MB · English & Dzongkha", isFeatured: false },
  { kind: "Accounts", title: "Audited Financial Statements 2024", year: 2025, meta: "PDF · 1.0 MB · Independent auditor", isFeatured: false },
  { kind: "Case study", title: "Khoma Weavers: Fifteen Years of Kisuthara", year: 2024, meta: "PDF · 5.4 MB · Photo essay", isFeatured: false },
  { kind: "Sector study", title: "Market Demand for Bhutanese Handicrafts in Japan", year: 2024, meta: "PDF · 2.2 MB · Buyer survey", isFeatured: false },
  { kind: "Guideline", title: "Export Documentation Guide for Members", year: 2024, meta: "PDF · 1.4 MB · Checklists", isFeatured: false },
  { kind: "Newsletter", title: "Zorig Bulletin — Issue 12", year: 2024, meta: "PDF · 900 KB · Quarterly", isFeatured: false },
  { kind: "Annual report", title: "Annual Report 2023", year: 2024, meta: "PDF · 3.6 MB · English & Dzongkha", isFeatured: false },
  { kind: "Training manual", title: "Bamboo Splitting and Weaving: Technique Notes", year: 2023, meta: "PDF · 4.8 MB · Illustrated", isFeatured: false },
  { kind: "Case study", title: "Women in Craft Enterprise: Endline Evaluation", year: 2023, meta: "PDF · 3.1 MB · External evaluator", isFeatured: false },
  { kind: "Policy brief", title: "Protecting Craft Origin: Options for Bhutan", year: 2023, meta: "PDF · 720 KB · 14 pages", isFeatured: false },
  { kind: "Newsletter", title: "Zorig Bulletin — Issue 9", year: 2023, meta: "PDF · 880 KB · Quarterly", isFeatured: false },
  { kind: "Accounts", title: "Audited Financial Statements 2022", year: 2023, meta: "PDF · 980 KB · Independent auditor", isFeatured: false },
  { kind: "Sector study", title: "Craft Sector Employment and Income Baseline", year: 2022, meta: "PDF · 2.6 MB · 78 pages", isFeatured: false },
  { kind: "Guideline", title: "Quality Standards for HAB-Listed Products", year: 2022, meta: "PDF · 1.2 MB · Inspection criteria", isFeatured: false },
  { kind: "Case study", title: "COVID-19 Recovery: What Cash-for-Craft Achieved", year: 2022, meta: "PDF · 2.9 MB · Review", isFeatured: false },
  { kind: "Annual report", title: "Annual Report 2021", year: 2022, meta: "PDF · 3.2 MB · English", isFeatured: false },
  { kind: "Training manual", title: "Photographing Craft for Online Sale", year: 2021, meta: "PDF · 5.9 MB · Practical guide", isFeatured: false },
  { kind: "Catalogue", title: "Zorig Chusum Reference Catalogue", year: 2021, meta: "PDF · 22.1 MB · 13 crafts", isFeatured: false },
  { kind: "Newsletter", title: "Zorig Bulletin — Issue 5", year: 2021, meta: "PDF · 810 KB · Quarterly", isFeatured: false },
  { kind: "Policy brief", title: "Craft in the Tourism Value Chain", year: 2020, meta: "PDF · 690 KB · 10 pages", isFeatured: false },
  { kind: "Sector study", title: "Raw Material Supply Constraints in Eastern Bhutan", year: 2019, meta: "PDF · 1.9 MB · Field study", isFeatured: false },
  { kind: "Annual report", title: "Annual Report 2018", year: 2019, meta: "PDF · 2.8 MB · English", isFeatured: false },
  { kind: "Guideline", title: "Setting Up a Craft Producer Group", year: 2017, meta: "PDF · 1.1 MB · Handbook", isFeatured: false },
  { kind: "Case study", title: "Chumey Yathra: From Household Loom to Retail", year: 2016, meta: "PDF · 2.4 MB · Photo essay", isFeatured: false }
];

export default function PublicationsPage() {
  const [selectedKind, setSelectedKind] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const kinds = useMemo(() => {
    return Array.from(new Set(PUBLICATIONS_DATA.map((p) => p.kind))).sort();
  }, []);

  const years = useMemo(() => {
    return Array.from(new Set(PUBLICATIONS_DATA.map((p) => String(p.year)))).sort().reverse();
  }, []);

  const filteredPublications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PUBLICATIONS_DATA.filter((p) => {
      const matchKind = !selectedKind || p.kind === selectedKind;
      const matchYear = !selectedYear || String(p.year) === selectedYear;
      const matchQ = !q || p.title.toLowerCase().includes(q) || p.kind.toLowerCase().includes(q);
      return matchKind && matchYear && matchQ;
    });
  }, [selectedKind, selectedYear, searchQuery]);

  const leadReport = PUBLICATIONS_DATA.find((p) => p.isFeatured) || PUBLICATIONS_DATA[0];

  const resetFilters = () => {
    setSelectedKind('');
    setSelectedYear('');
    setSearchQuery('');
  };

  return (
    <main className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-10 pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <span>Publications &amp; downloads</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-marcellus text-[44px] font-normal leading-[1.06] text-[#33261F] mb-3">
          Publications &amp; downloads
        </h1>
        <p className="font-lora text-[17px] text-[#6B5A4C] max-w-[68ch]">
          The institutional memory, research, financial accounts, and craft development manuals published by the Handicrafts Association of Bhutan.
        </p>
      </div>

      {/* Lead Featured Report */}
      <div className="bg-[#33261F] text-[#F1ECE2] rounded-[14px] p-8 grid grid-cols-[1.3fr_0.7fr] gap-10 items-center mb-12">
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#C9A46A] mb-3">
            Featured release · {leadReport.year}
          </div>
          <h2 className="font-marcellus text-[32px] font-normal text-white mb-3">
            {leadReport.title}
          </h2>
          <p className="font-lora text-[15.5px] leading-[1.6] text-[#D2C2AE] mb-6">
            Sector statistics, financial health, strategic milestones, and capacity interventions delivered across Bhutan during the 2025 operating year.
          </p>
          <div className="flex gap-4 items-center">
            <button
              type="button"
              className="font-figtree font-semibold text-[14.5px] bg-[#8B2E24] text-white px-6 py-3 rounded-[7px] hover:bg-[#6E241C] transition-colors cursor-pointer"
            >
              Download PDF ({leadReport.meta})
            </button>
            <span className="font-mono text-[11.5px] text-[#A8947F]">
              English &amp; Dzongkha
            </span>
          </div>
        </div>

        <div className="ph-dark aspect-[4/3] rounded-[10px] border border-[#4E3D2E] p-4 flex items-end">
          <span className="font-mono text-[10.5px] text-[#A8947F] bg-[#33261F] px-2.5 py-1 rounded">
            cover — {leadReport.title}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-4 mb-8">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-3 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report titles or keywords"
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-2.5 text-[14px] font-figtree outline-none"
          />

          <select
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)}
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-2.5 text-[14px] font-figtree outline-none"
          >
            <option value="">All document types</option>
            {kinds.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-2.5 text-[14px] font-figtree outline-none"
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="font-figtree font-semibold text-[13.5px] text-[#8B2E24] hover:underline px-3 cursor-pointer"
          >
            Reset
          </button>
        </div>

        <div className="font-mono text-[11px] text-[#6B5A4C] mt-3 pt-3 border-t border-[#EFE9DE]">
          {filteredPublications.length} publications of {PUBLICATIONS_DATA.length} · newest first
        </div>
      </div>

      {/* Publications Grid */}
      {filteredPublications.length > 0 ? (
        <div className="grid grid-cols-3 gap-5">
          {filteredPublications.map((pub) => (
            <div
              key={pub.title}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[10px] p-5 flex flex-col justify-between hover:border-[#33261F] transition-colors"
            >
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-mono text-[10.5px] text-[#8B2E24] uppercase">
                    {pub.kind}
                  </span>
                  <span className="font-mono text-[11px] text-[#6B5A4C]">
                    {pub.year}
                  </span>
                </div>
                <h3 className="font-figtree font-semibold text-[16px] text-[#33261F] leading-[1.3] mb-4">
                  {pub.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-[#EFE9DE] flex justify-between items-center text-[12.5px]">
                <span className="font-mono text-[11px] text-[#6B5A4C]">
                  {pub.meta}
                </span>
                <span className="font-figtree font-semibold text-[#8B2E24] cursor-pointer hover:underline">
                  Download ↓
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-12 text-center text-[#6B5A4C] font-lora">
          No publications match your selected filters. Try clearing filters to view the full library.
        </div>
      )}
    </main>
  );
}
