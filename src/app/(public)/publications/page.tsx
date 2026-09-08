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

export default function PublicationsPage() {
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKind, setSelectedKind] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fetch('/api/publications')
      .then((r) => r.json())
      .then((d) => {
        if (d?.publications && Array.isArray(d.publications)) {
          setPublications(
            d.publications.map((p: any) => ({
              kind: p.kind || 'Report',
              title: p.title,
              year: p.year || new Date().getFullYear(),
              meta: p.metaDetails || 'PDF Document',
              isFeatured: Boolean(p.isFeatured),
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kinds = useMemo(() => {
    return Array.from(new Set(publications.map((p) => p.kind))).sort();
  }, [publications]);

  const years = useMemo(() => {
    return Array.from(new Set(publications.map((p) => String(p.year)))).sort().reverse();
  }, [publications]);

  const filteredPublications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publications.filter((p) => {
      const matchKind = !selectedKind || p.kind === selectedKind;
      const matchYear = !selectedYear || String(p.year) === selectedYear;
      const matchQ = !q || p.title.toLowerCase().includes(q) || p.kind.toLowerCase().includes(q);
      return matchKind && matchYear && matchQ;
    });
  }, [publications, selectedKind, selectedYear, searchQuery]);

  const leadReport = publications.find((p) => p.isFeatured) || publications[0] || {
    kind: "Annual report",
    title: "Annual Report 2025",
    year: 2026,
    meta: "PDF · 4.2 MB · English & Dzongkha",
    isFeatured: true,
  };

  const resetFilters = () => {
    setSelectedKind('');
    setSelectedYear('');
    setSearchQuery('');
  };

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-16 sm:pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6 sm:mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <span>Publications &amp; downloads</span>
      </div>

      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <h1 className="font-marcellus text-2xl sm:text-3xl lg:text-[44px] font-normal leading-[1.06] text-[#33261F] mb-3">
          Publications &amp; downloads
        </h1>
        <p className="font-lora text-sm sm:text-base lg:text-[17px] text-[#6B5A4C] max-w-[68ch]">
          The institutional memory, research, financial accounts, and craft development manuals published by the Handicrafts Association of Bhutan.
        </p>
      </div>

      {/* Lead Featured Report */}
      <div className="bg-[#33261F] text-[#F1ECE2] rounded-[14px] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 lg:gap-10 items-center mb-8 sm:mb-12">
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#C9A46A] mb-3">
            Featured release · {leadReport.year}
          </div>
          <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[32px] font-normal text-white mb-3">
            {leadReport.title}
          </h2>
          <p className="font-lora text-sm sm:text-[15.5px] leading-[1.6] text-[#D2C2AE] mb-6">
            Sector statistics, financial health, strategic milestones, and capacity interventions delivered across Bhutan during the 2025 operating year.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            <button
              type="button"
              className="w-full sm:w-auto font-figtree font-semibold text-xs sm:text-[14.5px] bg-[#8B2E24] text-white px-6 py-3 rounded-[7px] hover:bg-[#6E241C] transition-colors cursor-pointer text-center"
            >
              Download PDF ({leadReport.meta})
            </button>
            <span className="font-mono text-xs sm:text-[11.5px] text-[#A8947F]">
              English &amp; Dzongkha
            </span>
          </div>
        </div>

        <div data-cms-img className="aspect-[16/9] sm:aspect-[4/3] rounded-[10px] bg-[#42332A] border border-[#4E3D2E] overflow-hidden relative shadow-md">
          <img
            src="/images/crafts/dezo.jpg"
            alt={leadReport.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          <span className="absolute bottom-3 left-3 z-10 font-mono text-[10px] sm:text-[10.5px] text-[#F4F0E7] bg-[#33261F]/90 backdrop-blur-sm px-2.5 py-1 rounded border border-white/15 truncate max-w-[90%]">
            {leadReport.title} · Official Report
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto] gap-3 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report titles or keywords"
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-2.5 text-xs sm:text-[14px] font-figtree outline-none"
          />

          <select
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)}
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-2.5 text-xs sm:text-[14px] font-figtree outline-none"
          >
            <option value="">All document types</option>
            {kinds.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-2.5 text-xs sm:text-[14px] font-figtree outline-none"
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="font-figtree font-semibold text-xs sm:text-[13.5px] text-[#8B2E24] hover:underline px-3 py-2 cursor-pointer text-left sm:text-center"
          >
            Reset
          </button>
        </div>

        <div className="font-mono text-[10.5px] sm:text-[11px] text-[#6B5A4C] mt-3 pt-3 border-t border-[#EFE9DE]">
          {filteredPublications.length} publications of {publications.length} · newest first
        </div>
      </div>

      {/* Publications Grid */}
      {filteredPublications.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
