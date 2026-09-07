'use client';

import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-square bg-[#E8E1D4]" />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="h-3 w-16 bg-[#E4DDD1] rounded" />
        <div className="h-4 w-3/4 bg-[#E4DDD1] rounded" />
        <div className="h-3 w-1/2 bg-[#EFE9DE] rounded" />
        <div className="mt-4 pt-2 flex items-center justify-between">
          <div className="h-4 w-12 bg-[#E4DDD1] rounded" />
          <div className="h-7 w-14 bg-[#E8E1D4] rounded" />
        </div>
      </div>
    </div>
  );
}

export function DirectoryCardSkeleton() {
  return (
    <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-[22px] flex flex-col gap-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-[52px] h-[52px] rounded-full bg-[#E8E1D4]" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-4 w-2/3 bg-[#E4DDD1] rounded" />
          <div className="h-3 w-1/2 bg-[#EFE9DE] rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-[#EFE9DE] rounded" />
        <div className="h-5 w-24 bg-[#EFE9DE] rounded" />
      </div>
      <div className="h-10 bg-[#F4F0E7] rounded" />
      <div className="pt-3 border-t border-[#EFE9DE] flex justify-between">
        <div className="h-3 w-20 bg-[#E4DDD1] rounded" />
        <div className="h-3 w-16 bg-[#E4DDD1] rounded" />
      </div>
    </div>
  );
}
