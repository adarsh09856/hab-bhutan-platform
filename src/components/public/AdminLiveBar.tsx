'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Edit3, Eye, ExternalLink, Settings, X, Sparkles } from 'lucide-react';

export default function AdminLiveBar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('Super Admin');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has active admin session
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/health', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.role) {
            setIsAdmin(true);
            setAdminName(data.user.name || 'Super Admin');
          }
        }
      } catch (e) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (editMode) {
      document.body.classList.add('hab-visual-edit-on');
    } else {
      document.body.classList.remove('hab-visual-edit-on');
    }
  }, [editMode]);

  // If not logged in as admin, render nothing (100% hidden from visitors)
  if (loading || !isAdmin) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 bg-slate-900 text-white px-4 py-2 text-xs border-b border-slate-700 shadow-md flex items-center justify-between gap-3">
      {/* Left: Admin identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-md bg-[#8B2E24] text-white flex items-center justify-center font-bold text-[10px]">
          H
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white">HAB Admin Console</span>
          <span className="text-slate-400">·</span>
          <span className="text-amber-400 font-mono text-[11px]">{adminName}</span>
        </div>
      </div>

      {/* Center: Live Visual Edit Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-slate-300 font-medium hidden sm:inline">Visual Edit Mode:</span>
        <button
          type="button"
          onClick={() => setEditMode(!editMode)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all shadow-xs ${
            editMode
              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 animate-pulse'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {editMode ? (
            <>
              <Edit3 className="w-3 h-3 text-slate-950" />
              <span>EDIT MODE: ON</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 text-slate-400" />
              <span>EDIT MODE: OFF</span>
            </>
          )}
        </button>
        {editMode && (
          <span className="text-[11px] text-amber-300 font-mono hidden md:inline">
            (Hover over any section to edit text or manage items)
          </span>
        )}
      </div>

      {/* Right: Quick actions & Link to Admin */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          <Settings className="w-3 h-3 text-slate-400" />
          <span>Pages Hub</span>
        </Link>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Admin Console →</span>
        </Link>
      </div>
    </div>
  );
}
