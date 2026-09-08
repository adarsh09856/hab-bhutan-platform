'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PROGRAM_OBJECTS,
  ACTIVITY_SCOPE,
  DELIVERY_CHAIN,
  BENEFICIARY_GROUPS,
} from '@/lib/data';

export default function ProgrammesPage() {
  const [expandedObjects, setExpandedObjects] = useState<Record<string, boolean>>({});

  const toggleObject = (ref: string) => {
    setExpandedObjects((prev) => ({
      ...prev,
      [ref]: !prev[ref],
    }));
  };

  return (
    <main className="pb-24">
      {/* 1. Header & Mandate */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-12 sm:pb-16">
        <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6">
          <Link href="/" className="hover:underline">Home</Link> / Programmes
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-8 lg:gap-14 items-end">
          <div>
            <div className="font-mono text-[11.5px] tracking-[0.16em] uppercase text-[#8B2E24] mb-4 sm:mb-5">
              Programmes
            </div>
            <h1 className="font-marcellus text-3xl sm:text-4xl lg:text-[54px] font-normal leading-[1.08] lg:leading-[1.06] tracking-[-0.008em] mb-4 sm:mb-5 [text-wrap:balance] text-[#33261F]">
              Eleven objects, one mandate
            </h1>
            <p className="font-lora text-sm sm:text-base lg:text-[18.5px] leading-[1.62] text-[#4A3C33] mb-4 max-w-[58ch] [text-wrap:pretty]">
              HAB operates as the national apex Public Benefit Organisation for Bhutan&apos;s handicrafts sector, advancing the productive, economic, cultural and social well-being of all actors across the handicrafts value chain.
            </p>
            <p className="font-lora text-xs sm:text-sm lg:text-[16px] leading-[1.6] text-[#6B5A4C] max-w-[58ch]">
              Every programme runs against one or more of the objects set out in Article 3.2 of the Articles of Association. Activity outside those objects is <em>ultra vires</em> and of no effect.
            </p>
          </div>

          <div className="bg-[#8B2E24] text-white rounded-[16px] p-6 sm:p-9">
            <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[#F0D2C9] mb-3 sm:mb-4">
              Governing principles
            </div>
            <p className="font-lora text-base sm:text-[17px] leading-[1.62] text-[#F6E7E2] mb-4 sm:mb-5">
              Public Benefit · Integrity · Inclusivity · Cultural Stewardship · Compliance · Independence
            </p>
            <div className="border-t border-[#A85246] pt-[18px] text-xs sm:text-[14.5px] leading-[1.55] text-[#EBC9C2] font-lora">
              Constituted under the Civil Society Organizations Act of Bhutan 2007 (as amended 2022). National scope across all twenty dzongkhags. Non-political by constitution.
            </div>
          </div>
        </div>
      </section>

      {/* 2. Programme Types (11 Expandable Objects) */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-8 mb-6 sm:mb-7">
          <div>
            <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal tracking-[-0.008em] mb-2 sm:mb-2.5 text-[#33261F]">
              Programme types
            </h2>
            <p className="font-lora text-xs sm:text-sm lg:text-[16px] leading-[1.6] text-[#6B5A4C] max-w-[74ch]">
              The objects are construed broadly: each is a standing programme area, not a fixed project. Article 3.2 (a)–(k).
            </p>
          </div>
          <Link
            href="/projects"
            className="font-figtree text-xs sm:text-[14.5px] font-semibold text-[#8B2E24] hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            See current projects →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {PROGRAM_OBJECTS.map((po) => {
            const isExpanded = !!expandedObjects[po.ref];
            return (
              <div
                key={po.ref}
                className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6 flex flex-col min-h-[200px]"
              >
                <div className="flex items-baseline gap-3 mb-2.5">
                  <span className="font-mono text-[11px] bg-[#33261F] text-[#F4F0E7] px-2 py-1 rounded-[4px] flex-none">
                    {po.ref}
                  </span>
                  <span className="font-figtree font-bold text-base sm:text-[17.5px] tracking-[-0.015em] text-[#33261F] line-clamp-2">
                    {po.t}
                  </span>
                </div>

                {!isExpanded ? (
                  <p className="font-lora text-xs sm:text-[15px] leading-[1.55] text-[#6B5A4C] flex-1 line-clamp-3">
                    {po.d}
                  </p>
                ) : (
                  <div className="flex-1">
                    <p className="font-lora text-xs sm:text-[15px] leading-[1.55] text-[#6B5A4C] mb-4">
                      {po.d}
                    </p>
                    <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#6B5A4C] mb-2.5">
                      How it is delivered
                    </div>
                    <div className="flex flex-col gap-2">
                      {po.activities.map((act) => (
                        <div
                          key={act}
                          className="flex gap-2.5 items-start text-xs sm:text-[14.5px] leading-[1.45] text-[#33261F] font-lora"
                        >
                          <span className="text-[#8B2E24] flex-none">—</span>
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleObject(po.ref)}
                  className="text-left font-figtree font-semibold text-xs sm:text-[13.5px] text-[#8B2E24] hover:underline mt-4 pt-3.5 border-t border-[#EFE9DE] cursor-pointer"
                >
                  {isExpanded ? 'Read less ↑' : 'Read more ↓'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Scope of Activities (9 Categories) */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-20">
        <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3.5">
          Scope of activities
        </div>
        <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal tracking-[-0.008em] mb-2.5 text-[#33261F]">
          What that looks like in practice
        </h2>
        <p className="font-lora text-xs sm:text-sm lg:text-[16px] leading-[1.6] text-[#6B5A4C] mb-7 max-w-[74ch]">
          Nine categories of activity implement the objects. Article 3A.1 — the Board may resolve that further activity falls within scope.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ACTIVITY_SCOPE.map((ac) => (
            <div
              key={ac.t}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-5 sm:p-6 min-h-[180px]"
            >
              <div className="font-figtree font-bold text-base sm:text-[16.5px] tracking-[-0.01em] mb-3.5 text-[#33261F]">
                {ac.t}
              </div>
              <div className="flex flex-col gap-2.5">
                {ac.items.map((item) => (
                  <div
                    key={item}
                    className="flex gap-2.5 items-start text-xs sm:text-[14.5px] leading-[1.45] text-[#6B5A4C] font-lora"
                  >
                    <span className="text-[#8B2E24] flex-none">—</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Delivery Chain Band (Accent Surface) */}
      <section className="bg-[#8B2E24] text-white py-12 sm:py-[76px] mt-12 sm:mt-20">
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#F0D2C9] mb-3">
            Delivery chain
          </div>
          <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.2] text-white mb-2">
            How programmes are delivered
          </h2>
          <p className="font-lora text-xs sm:text-sm lg:text-[16.5px] text-[#F6E7E2] mb-8 sm:mb-10 max-w-[70ch]">
            From constitutional mandate to audited results, every activity is structured through four clear steps.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {DELIVERY_CHAIN.map((step) => (
              <div
                key={step.n}
                className="bg-[#7A2820] border border-[#A85246] rounded-[12px] p-5 sm:p-6 flex flex-col"
              >
                <span className="font-mono text-[11px] text-[#F0D2C9] mb-2">
                  0{step.n}
                </span>
                <div className="font-figtree font-bold text-base sm:text-[18px] text-white mb-2">
                  {step.t}
                </div>
                <p className="font-lora text-xs sm:text-[14.5px] leading-[1.55] text-[#F6E7E2]">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Beneficiary Groups */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-20">
        <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3">
          Beneficiaries
        </div>
        <h2 className="font-marcellus text-2xl sm:text-3xl lg:text-[34px] font-normal text-[#33261F] mb-6">
          Who our programmes serve
        </h2>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {BENEFICIARY_GROUPS.map((b) => (
            <span
              key={b}
              className="bg-[#FFFCF8] border border-[#E4DDD1] font-lora text-xs sm:text-[14.5px] text-[#33261F] px-3 sm:px-4 py-2 sm:py-2.5 rounded-[8px]"
            >
              {b}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
