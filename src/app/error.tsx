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
  const [isAdmin, setIsAdmin] = React.useState(false);

  useEffect(() => {
    console.error('Application Error:', error);
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      setIsAdmin(true);
      document.documentElement.style.backgroundColor = '#020617';
      document.body.style.backgroundColor = '#020617';
      document.body.classList.add('hab-admin-body');
    }
  }, [error]);

  if (isAdmin) {
    return (
      <div className="hab-admin min-h-screen flex items-center justify-center p-6 bg-[#020617] text-slate-100 font-figtree" style={{ backgroundColor: '#020617', minHeight: '100vh' }}>
        <div className="max-w-md w-full bg-slate-900/90 border border-white/10 rounded-2xl p-8 shadow-2xl text-center space-y-5 backdrop-blur-2xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-lg">
            ⚠️
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Admin Module Notice</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error?.message || 'We encountered an error initializing this administrative view. Please retry.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors shadow-md"
            >
              Retry
            </button>
            <Link
              href="/admin/login"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
