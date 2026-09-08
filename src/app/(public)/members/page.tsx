'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { CRAFTS, SAMPLE_MEMBERS } from '@/lib/data';

export default function MemberDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCraft, setSelectedCraft] = useState('');
  const [selectedDzongkhag, setSelectedDzongkhag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dbMembers, setDbMembers] = useState<any[]>([]);
  const pageSize = 6;

  useEffect(() => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.members) && data.members.length > 0) {
          const mapped = data.members.map((m: any) => ({
            name: m.name,
            craftKey: m.craftKey,
            dz: m.dzongkhag,
            village: m.villageGewog || 'Central',
            year: m.joinYear || 2026,
            tier: m.tier || 'ACTIVE_SECTOR_MEMBER',
            productsCount: m.products?.length || 0,
            bio: m.bio || `Master artisan practicing ${m.craftKey} in ${m.dzongkhag}.`,
            verified: m.status === 'VERIFIED',
            regNumber: m.regNumber,
          }));
          setDbMembers(mapped);
        }
      })
      .catch((err) => console.error('Error fetching live members:', err));
  }, []);

  const activeMemberList = useMemo(() => {
    return dbMembers.length > 0 ? dbMembers : SAMPLE_MEMBERS;
  }, [dbMembers]);

  // Extract all unique dzongkhags
  const dzongkhags = useMemo(() => {
    return Array.from(new Set(activeMemberList.map((m: any) => m.dz))).sort();
  }, [activeMemberList]);

  // Filter members
  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activeMemberList.filter((m: any) => {
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
  }, [activeMemberList, searchQuery, selectedCraft, selectedDzongkhag]);

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
    <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-16 sm:pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6 sm:mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <Link href="/about" className="hover:underline">Members</Link> /{' '}
        <span>Directory</span>
      </div>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-10 mb-8">
        <div>
          <h1 className="font-marcellus text-2xl sm:text-3xl lg:text-[44px] font-normal leading-[1.06] text-[#33261F] mb-3">
            Membership database
          </h1>
          <p className="font-lora text-sm sm:text-base lg:text-[17px] leading-[1.6] text-[#4A3C33] max-w-[66ch]">
            Browse registered master craftspeople, weaving clusters, and traditional workshops across Bhutan. Every listing connects directly to member-made work in our central e-shop.
          </p>
        </div>
        <Link
          href="/membership/apply"
          className="font-figtree font-semibold text-xs sm:text-[14.5px] bg-[#8B2E24] text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-[7px] hover:bg-[#6E241C] transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          Apply for membership
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-4 sm:p-[18px] mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_auto] gap-3 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, craft or village"
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-2.5 sm:p-3 text-xs sm:text-[14px] font-figtree text-[#33261F] outline-none placeholder:text-[#8A7767]"
          />

          <select
            value={selectedCraft}
            onChange={(e) => {
              setSelectedCraft(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-2.5 sm:p-3 text-xs sm:text-[14px] font-figtree text-[#33261F] outline-none"
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
            className="bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-2.5 sm:p-3 text-xs sm:text-[14px] font-figtree text-[#33261F] outline-none"
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
            className="font-figtree font-semibold text-xs sm:text-[14px] text-[#8B2E24] hover:underline px-3 py-2 cursor-pointer text-left sm:text-center"
          >
            Reset
          </button>
        </div>

        <div className="font-mono text-[10.5px] sm:text-[11px] text-[#6B5A4C] mt-4 pt-3 border-t border-[#EFE9DE]">
          {filteredMembers.length} of {SAMPLE_MEMBERS.length} listings shown · directory sample of the full 7,500-member database
        </div>
      </div>

      {/* Results Grid */}
      {paginatedMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-[22px] mb-12">
          {paginatedMembers.map((m) => {
            const craft = CRAFTS.find((c) => c.key === m.craftKey);
            return (
              <Link
                key={m.name}
                href={`/members/${encodeURIComponent(m.name)}`}
                className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-[22px] flex flex-col gap-3 hover:border-[#33261F] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div data-cms-avatar className="w-[52px] h-[52px] rounded-full bg-[#E8E1D4] border border-[#E4DDD1] flex-none overflow-hidden relative">
                    <img
                      src={`/images/crafts/${m.craftKey}.jpg`}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
