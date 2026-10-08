'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit3, ExternalLink, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import UniversalLiveSectionEditor, { SectionType } from '@/components/public/UniversalLiveSectionEditor';

interface SectionEditBadgeProps {
  label: string;
  studioHref: string;
  onQuickEdit?: () => void;
  onEdit?: () => void;
  sectionType?: SectionType;
  className?: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

// A page can contain many badges. Share one session check instead of making
// a health/database request for every section.
let staffCheck: Promise<boolean> | null = null;

function checkStaffSession(): Promise<boolean> {
  if (!staffCheck) {
    staffCheck = fetch('/api/admin/health', { credentials: 'include', cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        const role = String(data?.user?.roleSlug || data?.user?.role || '').toLowerCase();
        return ['super_admin', 'staff_operator'].includes(role);
      })
      .catch(() => false)
      .finally(() => { staffCheck = null; });
  }
  return staffCheck;
}

function inferSectionType(studioHref: string = '', label: string = ''): SectionType {
  const path = (studioHref || '').toLowerCase();
  const l = (label || '').toLowerCase();

  if (path.includes('tab=announcement') || path.includes('/admin/site-settings?tab=announcement') || l.includes('utility') || l.includes('ticker') || l.includes('top bar') || l.includes('notice')) return 'utility-bar';
  if (path.includes('/admin/hero')) return 'hero';
  if (path.includes('/admin/products') || path.includes('/shop') || l.includes('shop') || l.includes('product') || l.includes('catalogue')) return 'products';
  if (path.includes('/admin/crafts') || l.includes('craft') || l.includes('zorig')) return 'crafts';
  if (path.includes('/admin/projects')) return 'projects';
  if (path.includes('/admin/programmes') || l.includes('programme') || l.includes('pillar') || l.includes('training')) return 'programmes';
  if (l.includes('project')) return 'projects';
  if (path.includes('/admin/wholesale') || path.includes('/admin/trade') || l.includes('wholesale') || l.includes('trade')) return 'wholesale';
  if (path.includes('/admin/clusters-outlets') || path.includes('/admin/outlets') || l.includes('outlet') || l.includes('punakha') || l.includes('market')) return 'outlets';
  if (path.includes('/admin/clusters') || l.includes('cluster')) return 'clusters';
  if (path.includes('/admin/honours') || path.includes('/admin/masters') || l.includes('master') || l.includes('honour') || l.includes('living treasure')) return 'masters';
  if (path.includes('/admin/content') || path.includes('/admin/news') || l.includes('news') || l.includes('story')) return 'news';
  if (path.includes('/admin/events') || l.includes('event') || l.includes('exhibition')) return 'events';
  if (path.includes('/admin/publications') || l.includes('publication') || l.includes('report') || l.includes('research')) return 'publications';
  if (path.includes('/admin/tenders') || l.includes('tender') || l.includes('procurement')) return 'tenders';
  if (path.includes('/admin/members') || l.includes('member directory') || l.includes('artisan directory')) return 'members';
  if (path.includes('/admin/policies') || path.includes('/terms') || path.includes('/privacy') || l.includes('policy') || l.includes('terms') || l.includes('privacy') || l.includes('shipping')) return 'policies';
  if (path.includes('/admin/donations') || path.includes('/donate') || l.includes('donate') || l.includes('support pillar')) return 'donate';
  if (path.includes('/admin/enquiries') || path.includes('/contact') || l.includes('contact') || l.includes('secretariat')) return 'contact';
  if (path.includes('/admin/members') || path.includes('/membership') || l.includes('member') || l.includes('register')) return 'membership';
  if (path.includes('/admin/pages/about') || path.includes('/about') || l.includes('about') || l.includes('mandate') || l.includes('vision') || l.includes('mission') || l.includes('value') || l.includes('board') || l.includes('team')) return 'about-page';
  if (l.includes('stat') || l.includes('impact') || l.includes('counter')) return 'stats';
  if (l.includes('assurance')) return 'assurances';
  if (l.includes('buy') || l.includes('retail')) return 'buy';
  if (l.includes('footer')) return 'footer';

  if (path.includes('/admin/site-settings') || path.includes('/admin/settings')) return 'hero';
  if (path.includes('/admin/users') || path.includes('/admin/orders')) return 'about-page';

  return 'hero';
}

export default function SectionEditBadge({
  label,
  studioHref,
  onQuickEdit,
  onEdit,
  sectionType,
  className = 'top-3 right-3',
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: SectionEditBadgeProps) {
  const [visible, setVisible] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [internalEditorOpen, setInternalEditorOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkStaffSession()
      .then((staff) => { if (!cancelled) setIsStaff(staff); })
      .catch(() => { if (!cancelled) setIsStaff(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const checkVisibility = () => {
      if (typeof window === 'undefined') return;
      const urlHasEdit = new URLSearchParams(window.location.search).get('edit') === 'true';
      const localEdit = localStorage.getItem('hab_visual_edit') === '1' || localStorage.getItem('hab_visual_edit') === 'true';
      const bodyHasClass = document.body.classList.contains('hab-visual-edit-on');
      setVisible(Boolean(urlHasEdit || localEdit || bodyHasClass));
    };

    checkVisibility();

    const handleToggle = (e: any) => {
      if (e?.detail?.active !== undefined) {
        setVisible(Boolean(e.detail.active));
      } else {
        checkVisibility();
      }
    };

    window.addEventListener('hab:visual-edit-toggled', handleToggle);

    return () => {
      window.removeEventListener('hab:visual-edit-toggled', handleToggle);
    };
  }, []);

  if (!visible || !isStaff) return null;

  const effectiveSectionType = sectionType || inferSectionType(studioHref, label);
  const effectiveEditHandler = onQuickEdit || onEdit;
  const showQuickEdit = Boolean(effectiveEditHandler || effectiveSectionType);

  const handleQuickEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (effectiveEditHandler) {
      effectiveEditHandler();
    } else if (effectiveSectionType) {
      setInternalEditorOpen(true);
    }
  };

  return (
    <>
      <aside
        className={`hab-section-edit-badge absolute z-50 items-center gap-1.5 bg-slate-900/95 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl border border-amber-400/80 shadow-2xl backdrop-blur-md transition-all hover:bg-slate-900 ${className}`}
        aria-label={`Visual edit options for ${label}`}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-200 font-semibold">{label}</span>
        </div>

        <div className="flex items-center gap-1.5 ml-2 border-l border-slate-700 pl-2">
          {/* Section Reorder Controls (Move Up / Down) */}
          {onMoveUp && (
            <button
              type="button"
              disabled={!canMoveUp}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMoveUp();
              }}
              className="inline-flex items-center justify-center p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-700 transition cursor-pointer"
              title="Move section up [↑]"
              aria-label="Move section up"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          )}

          {onMoveDown && (
            <button
              type="button"
              disabled={!canMoveDown}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMoveDown();
              }}
              className="inline-flex items-center justify-center p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-700 transition cursor-pointer"
              title="Move section down [↓]"
              aria-label="Move section down"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          )}

          {/* Inline Live Quick Edit */}
          {showQuickEdit && (
            <button
              type="button"
              onClick={handleQuickEditClick}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-400/40 transition-colors cursor-pointer"
              title="Quick edit this section in a live modal"
            >
              <Zap className="w-2.5 h-2.5" />
              <span>Quick Edit</span>
            </button>
          )}

          {/* Full Admin Studio Link */}
          <Link
            href={studioHref}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#8B2E24] hover:bg-[#a0362b] text-white font-bold transition-colors shadow-xs"
            title={`Open full ${label} studio in Admin`}
          >
            <Edit3 className="w-2.5 h-2.5" />
            <span>Studio</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </aside>

      {effectiveSectionType && internalEditorOpen && (
        <UniversalLiveSectionEditor
          isOpen={internalEditorOpen}
          onClose={() => setInternalEditorOpen(false)}
          sectionType={effectiveSectionType}
          sectionTitle={label}
          studioHref={studioHref}
        />
      )}
    </>
  );
}
