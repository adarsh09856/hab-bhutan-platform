'use client';

import React from 'react';
import Link from 'next/link';

export default function UtilityBar() {
  return (
    <div className="bg-[#33261F] text-[#D2C2AE]">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-10 min-h-[36px] flex items-center justify-between gap-4 font-mono text-[10.5px] sm:text-[11px] tracking-[0.04em]">
        <span className="text-[#F4F0E7] truncate text-[10px] sm:text-[11px]">
          Registered CSO · CSO Act of Bhutan 2007
        </span>
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/about#contact" className="text-[#D2C2AE] hover:text-white whitespace-nowrap">
              Contact secretariat
            </Link>
            <Link href="/news" className="text-[#D2C2AE] hover:text-white whitespace-nowrap">
              Tenders &amp; vacancies
            </Link>
            <Link href="/membership/apply" className="text-[#D2C2AE] hover:text-white whitespace-nowrap">
              Apply for Membership
            </Link>
          </div>
          <div className="hidden sm:block w-[1px] h-[13px] bg-[#4E3D2E]" />
          <span className="whitespace-nowrap text-[10px] sm:text-[11px]">
            <span className="text-[#F4F0E7]">EN</span>
            <span className="opacity-50 mx-1">/</span>
            <span className="text-[#D2C2AE]">རྫོང་ཁ</span>
          </span>
        </div>
      </div>
    </div>
  );
}
