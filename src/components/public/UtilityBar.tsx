'use client';

import React from 'react';
import Link from 'next/link';

export default function UtilityBar() {
  return (
    <div className="bg-[#33261F] text-[#D2C2AE]">
      <div className="max-w-[1280px] min-w-[1200px] mx-auto px-10 min-h-[38px] flex items-center gap-[22px] font-mono text-[11px] tracking-[0.05em]">
        <span className="text-[#F4F0E7] whitespace-nowrap">
          Registered Civil Society Organization · CSO Act of Bhutan 2007
        </span>
        <div className="flex-1" />
        <Link href="/about#contact" className="text-[#D2C2AE] hover:text-white whitespace-nowrap">
          Contact the secretariat
        </Link>
        <Link href="/news" className="text-[#D2C2AE] hover:text-white whitespace-nowrap">
          Tenders & vacancies
        </Link>
        <Link href="/publications" className="text-[#D2C2AE] hover:text-white whitespace-nowrap">
          Publications
        </Link>
        <Link href="/membership/apply" className="text-[#D2C2AE] hover:text-white whitespace-nowrap">
          Donate
        </Link>
        <div className="w-[1px] h-[15px] bg-[#4E3D2E]" />
        <span className="whitespace-nowrap">
          <span className="text-[#F4F0E7]">EN</span>
          <span className="opacity-50 mx-1">/</span>
          <span className="text-[#D2C2AE]">རྫོང་ཁ</span>
        </span>
      </div>
    </div>
  );
}
