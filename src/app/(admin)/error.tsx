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
      document.documentElement.style.backgroundColor = '#f8fafc';
      document.body.style.backgroundColor = '#f8fafc';
      document.body.classList.add('hab-admin-body');
    }
  }, [error]);

  return (
    <div className="hab-admin min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-6 font-figtree" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="max-w-md w-full rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-lg">
        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Secretariat Portal Notice</h1>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          {error?.message || 'An unexpected error occurred while initializing the administrative suite.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl admin-button-primary text-xs font-semibold shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Module</span>
          </button>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-sm transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
