'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GeneralErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-[#F4F0E7]">
      <div className="max-w-md w-full bg-[#FFFCF8] border border-[#E4DDD1] rounded-2xl p-8 shadow-sm text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#8B2E24]/10 text-[#8B2E24] flex items-center justify-center font-bold text-lg font-figtree">
          HAB
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-figtree text-[#33261F]">
            Page Notice
          </h2>
          <p className="text-sm font-lora text-[#6B5A4C] leading-relaxed">
            We were unable to load this section of the Bhutanese handicrafts portal. Please try again.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg bg-[#8B2E24] hover:bg-[#6E241C] text-white text-xs font-semibold font-figtree transition-colors shadow-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-[#EFE9DE] hover:bg-[#E4DDD1] text-[#33261F] text-xs font-medium font-figtree transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
