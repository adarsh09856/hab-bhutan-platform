'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
import '@/styles/globals.css';
import '@/styles/admin.css';

export default function AdminGroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Layout/Group Error:', error);
    if (typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = '#020617';
      document.body.style.backgroundColor = '#020617';
      document.body.classList.add('hab-admin-body');
    }
  }, [error]);

  return (
    <div className="hab-admin min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-6 font-figtree" style={{ backgroundColor: '#020617', minHeight: '100vh' }}>
      <div className="max-w-md w-full rounded-2xl bg-slate-900/90 border border-white/10 p-8 text-center shadow-2xl backdrop-blur-2xl">
        <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Secretariat Portal Notice</h1>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          {error?.message || 'An unexpected error occurred while initializing the administrative suite.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-semibold hover:bg-amber-400 transition-colors shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Module</span>
          </button>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors border border-white/10"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
