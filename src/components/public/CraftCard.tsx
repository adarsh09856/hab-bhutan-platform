'use client';

import React from 'react';
import Link from 'next/link';

export interface CraftCardProps {
  craftKey: string;
  name: string;
  english: string;
  description: string;
  index: number;
  memberCount?: number;
  productCount?: number;
}

export default function CraftCard({
  craftKey,
  name,
  english,
  description,
  index,
  memberCount = 1,
  productCount = 1,
}: CraftCardProps) {
  const numString = ('0' + (index + 1)).slice(-2) + '/13';

  return (
    <Link
      href={`/shop/${craftKey}`}
      className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] overflow-hidden flex flex-col hover:border-[#33261F] transition-colors duration-150 group"
    >
      <div className="relative aspect-[16/10] ph-light border-b border-[#E4DDD1] p-3 flex flex-col justify-between">
        <span className="self-start font-mono text-[10.5px] bg-[#33261F] text-[#F4F0E7] px-[6px] py-[3px] rounded-[4px]">
          {numString}
        </span>
        <span className="self-start font-mono text-[11px] text-[#86745F] bg-[#FFFCF8] px-[8px] py-[4px] rounded-[5px] border border-[#E4DDD1]">
          photo — {english.toLowerCase()}
        </span>
      </div>

      <div className="p-[18px_20px_20px] flex flex-col flex-1">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-figtree font-bold text-[20px] tracking-[-0.015em] text-[#33261F]">
            {name}
          </span>
          <span className="text-[14.5px] text-[#6B5A4C] font-lora">
            {english}
          </span>
        </div>

        <p className="text-[15px] leading-[1.5] text-[#4A3C33] font-lora mb-4 flex-1">
          {description}
        </p>

        <div className="pt-3 border-t border-[#EFE9DE] flex items-center justify-between font-mono text-[11px] text-[#8B2E24]">
          <span>
            {memberCount} {memberCount === 1 ? 'member' : 'members'} · {productCount} {productCount === 1 ? 'product' : 'products'}
          </span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}
