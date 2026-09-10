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
    <article className="card craft bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] overflow-hidden flex flex-col hover:border-[#33261F] transition-colors duration-150 group">
      <Link href={`/craft/${craftKey}`} className="craft__shot block relative aspect-[16/10] bg-[#E8E1D4] border-b border-[#E4DDD1] p-3 overflow-hidden">
        <img
          src={`/images/crafts/${craftKey}.jpg`}
          alt={`${name} — ${english}`}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />
        <span className="absolute top-3 left-3 z-10 font-mono text-[10.5px] bg-[#33261F]/90 backdrop-blur-sm text-[#F4F0E7] px-[7px] py-[3px] rounded-[4px]">
          {numString}
        </span>
        <span className="absolute bottom-3 left-3 z-10 font-mono text-[11px] text-[#F4F0E7] bg-[#33261F]/80 backdrop-blur-sm px-[8px] py-[3px] rounded-[4px] border border-white/20">
          {english}
        </span>
      </Link>

      <div className="card__body p-[18px_20px_20px] flex flex-col flex-1">
        <div className="craft__head flex items-baseline gap-2 mb-2">
          <Link href={`/craft/${craftKey}`} className="font-figtree font-bold text-[20px] tracking-[-0.015em] text-[#33261F] hover:text-[#8B2E24] transition-colors">
            {name}
          </Link>
          <span className="text-[14.5px] text-[#6B5A4C] font-lora">
            {english}
          </span>
        </div>

        <p className="craft__text text-[15px] leading-[1.5] text-[#4A3C33] font-lora mb-5 flex-1">
          {description}
        </p>

        <div className="craft__actions pt-3 border-t border-[#EFE9DE] flex items-center justify-between gap-2">
          <Link
            href={`/shop/${craftKey}`}
            className="btn btn--accent btn--sm text-xs py-1.5 px-3"
          >
            In the shop ({productCount}) →
          </Link>
          <Link
            href={`/craft/${craftKey}`}
            className="craft__about text-xs font-semibold text-[#8B2E24] hover:underline"
          >
            About this craft →
          </Link>
        </div>
      </div>
    </article>
  );
}
