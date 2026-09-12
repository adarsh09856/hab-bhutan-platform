'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Panel Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Administrative Module Notice
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            The requested admin view encountered a temporary rendering or network sync issue.
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-slate-950/70 border border-white/10 rounded-xl text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-32">
            {error.message}
            {error.digest && (
              <div className="text-[10px] text-slate-400 mt-1">Digest: {error.digest}</div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B2E24] to-[#B23E30] hover:from-[#A0352A] hover:to-[#C44537] text-white text-xs font-semibold shadow-lg shadow-rose-950/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Module</span>
          </button>

          <Link
            href="/admin/login"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-colors flex items-center gap-2"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Re-authenticate</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
