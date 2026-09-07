'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CRAFTS, SAMPLE_MEMBERS } from '@/lib/data';

export default function MemberDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCraft, setSelectedCraft] = useState('');
  const [selectedDzongkhag, setSelectedDzongkhag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Extract all unique dzongkhags
  const dzongkhags = useMemo(() => {
    return Array.from(new Set(SAMPLE_MEMBERS.map((m) => m.dz))).sort();
  }, []);

  // Filter members
  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SAMPLE_MEMBERS.filter((m) => {
      const craft = CRAFTS.find((c) => c.key === m.craftKey);
      const matchQ =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.dz.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q) ||
        craft?.name.toLowerCase().includes(q) ||
        craft?.english.toLowerCase().includes(q);

      const matchCraft = !selectedCraft || m.craftKey === selectedCraft;
      const matchDz = !selectedDzongkhag || m.dz === selectedDzongkhag;

      return matchQ && matchCraft && matchDz;
    });
  }, [searchQuery, selectedCraft, selectedDzongkhag]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCraft('');
    setSelectedDzongkhag('');
    setCurrentPage(1);
  };

  return (
    <main className="max-w-[1280px] min-w-[1200px] mx-auto px-10 pt-10 pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <Link href="/about" className="hover:underline">Members</Link> /{' '}
        <span>Directory</span>
      </div>

      {/* Header Row */}
      <div className="flex justify-between items-end gap-10 mb-8">
        <div>
          <h1 className="font-marcellus text-[44px] font-normal leading-[1.06] text-[#33261F] mb-3">
            Membership database
          </h1>
          <p className="font-lora text-[17px] leading-[1.6] text-[#4A3C33] max-w-[66ch]">
            Browse registered master craftspeople, weaving clusters, and traditional workshops across Bhutan. Every listing connects directly to member-made work in our central e-shop.
          </p>
        </div>
        <Link
          href="/membership/apply"
          className="font-figtree font-semibold text-[14.5px] bg-[#8B2E24] text-white px-6 py-3.5 rounded-[7px] hover:bg-[#6E241C] transition-colors whitespace-nowrap"
        >
          Apply for membership
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-[18px] mb-8">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_auto] gap-3 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, craft or village"
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree text-[#33261F] outline-none placeholder:text-[#8A7767]"
          />

          <select
            value={selectedCraft}
            onChange={(e) => {
              setSelectedCraft(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree text-[#33261F] outline-none"
          >
            <option value="">All craft categories</option>
            {CRAFTS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name} — {c.english}
              </option>
            ))}
          </select>

          <select
            value={selectedDzongkhag}
            onChange={(e) => {
              setSelectedDzongkhag(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree text-[#33261F] outline-none"
          >
            <option value="">All dzongkhags</option>
            {dzongkhags.map((dz) => (
              <option key={dz} value={dz}>
                {dz}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="font-figtree font-semibold text-[14px] text-[#8B2E24] hover:underline px-3 py-2 cursor-pointer"
          >
            Reset
          </button>
        </div>

        <div className="font-mono text-[11px] text-[#6B5A4C] mt-4 pt-3 border-t border-[#EFE9DE]">
          {filteredMembers.length} of {SAMPLE_MEMBERS.length} listings shown · directory sample of the full 7,500-member database
        </div>
      </div>

      {/* Results Grid */}
      {paginatedMembers.length > 0 ? (
        <div className="grid grid-cols-3 gap-[22px] mb-12">
          {paginatedMembers.map((m) => {
            const craft = CRAFTS.find((c) => c.key === m.craftKey);
            return (
              <Link
                key={m.name}
                href={`/members/${encodeURIComponent(m.name)}`}
                className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-[22px] flex flex-col gap-3 hover:border-[#33261F] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[52px] h-[52px] rounded-full ph-light border border-[#E4DDD1] flex-none" />
                  <div>
                    <h3 className="font-figtree font-bold text-[17px] text-[#33261F] group-hover:text-[#8B2E24] transition-colors">
                      {m.name}
                    </h3>
                    <div className="font-lora text-[13.5px] text-[#6B5A4C]">
                      {m.dz} · member since {m.year}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <span className="font-mono text-[10.5px] bg-[#F1E9DB] text-[#8B2E24] px-2 py-0.5 rounded">
                    {craft?.name}
                  </span>
                  <span className="font-mono text-[10.5px] bg-[#EFF0E4] text-[#4C6B41] px-2 py-0.5 rounded">
                    HAB verified
                  </span>
                </div>

                <p className="font-lora text-[14.5px] leading-[1.5] text-[#4A3C33] flex-1">
                  {m.bio}
                </p>

                <div className="pt-3 border-t border-[#EFE9DE] flex justify-between items-center text-[13.5px]">
                  <span className="font-mono text-[11px] text-[#6B5A4C]">
                    {m.products.length} products in shop
                  </span>
                  <span className="font-figtree font-semibold text-[#8B2E24] group-hover:translate-x-1 transition-transform">
                    View profile →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-16 text-center mb-12">
          <h3 className="font-marcellus text-[26px] font-normal text-[#33261F] mb-3">
            No members match these filters
          </h3>
          <p className="font-lora text-[15px] text-[#6B5A4C] mb-6 max-w-[48ch] mx-auto">
            Try resetting your search query or selecting a different craft or dzongkhag.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="font-figtree font-semibold text-[14px] bg-[#33261F] text-white px-5 py-3 rounded-[7px] hover:bg-[#8B2E24] transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="font-figtree text-[13.5px] px-4 py-2 rounded-[6px] border border-[#CDBEA8] text-[#33261F] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#33261F] cursor-pointer"
          >
            ← Previous
          </button>
          <span className="font-mono text-[12px] text-[#6B5A4C] px-3">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="font-figtree text-[13.5px] px-4 py-2 rounded-[6px] border border-[#CDBEA8] text-[#33261F] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#33261F] cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}
