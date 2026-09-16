'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Edit3, Eye, Settings, ExternalLink, Sparkles, Layers, ShieldCheck } from 'lucide-react';

const ROUTE_STUDIO_MAP: Record<string, { label: string; href: string }> = {
  '/': { label: 'Homepage Studio', href: '/admin/pages/home' },
  '/about': { label: 'About Us Studio', href: '/admin/pages/about' },
  '/programmes': { label: 'Programmes Studio', href: '/admin/programmes' },
  '/projects': { label: 'Projects Studio', href: '/admin/projects' },
  '/outlets': { label: 'Outlets & Craft Shops', href: '/admin/clusters-outlets' },
  '/honours': { label: 'Honours & Masters', href: '/admin/honours' },
  '/publications': { label: 'Publications Studio', href: '/admin/publications' },
  '/news': { label: 'News & Stories', href: '/admin/content' },
  '/events': { label: 'Events Studio', href: '/admin/events' },
  '/donate': { label: 'Donations Studio', href: '/admin/donate-settings' },
  '/shop': { label: 'Products Catalog', href: '/admin/products' },
  '/members': { label: 'Artisans Directory', href: '/admin/members' },
  '/crafts': { label: '13 Crafts Studio', href: '/admin/crafts' },
  '/wholesale': { label: 'Wholesale Trade', href: '/admin/trade' },
  '/privacy': { label: 'Legal & Policies', href: '/admin/policies' },
  '/terms': { label: 'Legal & Policies', href: '/admin/policies' },
};

export default function AdminLiveBar() {
  const pathname = usePathname() || '/';
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('Staff Admin');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has active admin session
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/health', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.role || data?.user?.roleSlug) {
            setIsAdmin(true);
            setAdminName(data.user.name || data.user.email || 'Staff Admin');
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
    if (isAdmin) {
      document.body.classList.add('has-admin-live-bar');
    } else {
      document.body.classList.remove('has-admin-live-bar');
    }
    return () => {
      document.body.classList.remove('has-admin-live-bar');
    };
  }, [isAdmin]);

  useEffect(() => {
    if (editMode) {
      document.body.classList.add('hab-visual-edit-on');
    } else {
      document.body.classList.remove('hab-visual-edit-on');
    }
    return () => {
      document.body.classList.remove('hab-visual-edit-on');
    };
  }, [editMode]);

  // If not logged in as admin, render nothing (100% hidden from normal visitors)
  if (loading || !isAdmin) {
    return null;
  }

  // Determine current page studio mapping
  let currentStudio = ROUTE_STUDIO_MAP[pathname];
  if (!currentStudio) {
    if (pathname.startsWith('/news')) {
      currentStudio = { label: 'News & Stories Studio', href: '/admin/content' };
    } else if (pathname.startsWith('/product') || pathname.startsWith('/shop')) {
      currentStudio = { label: 'Products Catalog Studio', href: '/admin/products' };
    } else if (pathname.startsWith('/member')) {
      currentStudio = { label: 'Members Directory Studio', href: '/admin/members' };
    } else if (pathname.startsWith('/programme')) {
      currentStudio = { label: 'Programmes Studio', href: '/admin/programmes' };
    } else if (pathname.startsWith('/project')) {
      currentStudio = { label: 'Projects Studio', href: '/admin/projects' };
    } else {
      currentStudio = { label: 'Pages Directory Hub', href: '/admin/pages' };
    }
  }

  return (
    <>
    {/* Spacer so content doesn't hide behind fixed bar */}
    <div style={{ height: 36 }} aria-hidden="true" />
    <div className="fixed top-0 left-0 right-0 z-[60] bg-slate-900 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs border-b border-slate-700 shadow-md flex items-center justify-between gap-2 select-none overflow-x-auto whitespace-nowrap">
      {/* Left: Admin identity & Quick Studio Link */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        <div className="w-5 h-5 rounded-md bg-[#8B2E24] text-white flex items-center justify-center font-bold text-[10px] shadow-xs flex-shrink-0">
          H
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-white hidden sm:inline">HAB Admin</span>
          <span className="font-semibold text-white inline sm:hidden">Admin</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-amber-400 font-mono text-[11px] truncate max-w-[90px] sm:max-w-[140px]">{adminName}</span>
        </div>

        {/* Dynamic Studio Quick Button for Current Route */}
        <Link
          href={currentStudio.href}
          className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-semibold transition-colors flex-shrink-0"
          title={`Open ${currentStudio.label} in Admin Panel`}
        >
          <Edit3 className="w-3 h-3 text-amber-400" />
          <span>Edit in {currentStudio.label}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </Link>
      </div>

      {/* Center: Live Visual Edit Toggle */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => setEditMode(!editMode)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full font-semibold transition-all shadow-xs cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
            editMode
              ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-bold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
          title={editMode ? 'Turn off visual outlines' : 'Turn on visual outlines and edit buttons'}
        >
          {editMode ? (
            <>
              <Edit3 className="w-3 h-3 text-slate-950 flex-shrink-0" />
              <span className="hidden sm:inline">VISUAL EDIT: ON</span>
              <span className="inline sm:hidden">EDIT: ON</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="hidden sm:inline">VISUAL EDIT: OFF</span>
              <span className="inline sm:hidden">EDIT: OFF</span>
            </>
          )}
        </button>
        {editMode && (
          <span className="text-[11px] text-amber-300/90 font-mono hidden xl:inline">
            (Hover over any section to see edit badges)
          </span>
        )}
      </div>

      {/* Right: Quick actions & Link to Admin */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <Link
          href="/admin/pages"
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex-shrink-0"
          title="View all 15 pages in Pages Directory"
        >
          <Layers className="w-3 h-3 text-slate-400" />
          <span>Pages Directory</span>
        </Link>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-lg bg-[#8B2E24] hover:bg-[#73241c] text-white text-[11px] sm:text-xs font-semibold shadow-xs transition-colors whitespace-nowrap flex-shrink-0"
        >
          <span className="hidden xs:inline sm:inline">Admin Console</span>
          <span className="inline xs:hidden sm:hidden">Admin</span>
          <ExternalLink className="w-3 h-3 text-white/80 flex-shrink-0" />
        </Link>
      </div>
    </div>
    </>
  );
}
