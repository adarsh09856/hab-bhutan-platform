'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit3, ExternalLink, ArrowUp, ArrowDown } from 'lucide-react';
import { canAccessAdminPortal } from '@/lib/permissions';
import type { SectionType } from '@/components/public/UniversalLiveSectionEditor';

interface SectionEditBadgeProps {
  label: string;
  studioHref: string;
  compactAction?: { label?: string; requiredPermissions?: string[]; onClick: () => void };
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
type StaffAccess = { canAccessAdmin: boolean; permissions: string[] };
let staffCheck: Promise<StaffAccess> | null = null;

function checkStaffSession(): Promise<StaffAccess> {
  if (!staffCheck) {
    staffCheck = fetch('/api/admin/health', { credentials: 'include', cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        const role = String(data?.user?.roleSlug || data?.user?.role || '').toLowerCase();
        const permissions = Array.isArray(data?.user?.permissions) ? data.user.permissions : [];
        return { canAccessAdmin: canAccessAdminPortal(role, permissions), permissions };
      })
      .catch(() => ({ canAccessAdmin: false, permissions: [] }))
      .finally(() => { staffCheck = null; });
  }
  return staffCheck;
}

export default function SectionEditBadge({
  label,
  studioHref,
  compactAction,
  className = 'top-3 right-3',
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: SectionEditBadgeProps) {
  const [visible, setVisible] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [staffPermissions, setStaffPermissions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    checkStaffSession()
      .then((staff) => {
        if (!cancelled) {
          setIsStaff(staff.canAccessAdmin);
          setStaffPermissions(staff.permissions);
        }
      })
      .catch(() => { if (!cancelled) { setIsStaff(false); setStaffPermissions([]); } });
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

  const isExtraSectionsManager = studioHref.startsWith('/admin/pages/sections');
  const canUseCompactAction = Boolean(compactAction && (compactAction.requiredPermissions || []).every((permission) =>
    staffPermissions.includes('*') || staffPermissions.includes(permission)));

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

          {/* Record creation and management live in Admin. */}
          {canUseCompactAction && compactAction ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                compactAction.onClick();
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#8B2E24] hover:bg-[#a0362b] text-white font-bold transition-colors shadow-xs"
              aria-label={compactAction.label || `Open quick editor for ${label}`}
              title={compactAction.label || `Open quick editor for ${label}`}
            >
              <Edit3 className="w-2.5 h-2.5" />
              <span>Quick edit</span>
            </button>
          ) : (
            <Link
              href={studioHref}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#8B2E24] hover:bg-[#a0362b] text-white font-bold transition-colors shadow-xs"
              title={isExtraSectionsManager ? 'Manage optional extra page sections in Admin' : `Open full ${label} studio in Admin`}
            >
              <Edit3 className="w-2.5 h-2.5" />
              <span>{isExtraSectionsManager ? 'Add section in Admin' : 'Manage in Admin'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          )}
        </div>
      </aside>

    </>
  );
}
