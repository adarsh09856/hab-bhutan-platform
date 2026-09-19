'use client';

import React from 'react';
import Link from 'next/link';
import { Edit3, ExternalLink, Zap } from 'lucide-react';

interface SectionEditBadgeProps {
  label: string;
  studioHref: string;
  onQuickEdit?: () => void;
  className?: string;
}

export default function SectionEditBadge({
  label,
  studioHref,
  onQuickEdit,
  className = 'top-3 right-3',
}: SectionEditBadgeProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const checkVisibility = () => {
      const isVisible =
        typeof document !== 'undefined' &&
        document.body.classList.contains('has-admin-live-bar') &&
        document.body.classList.contains('hab-visual-edit-on');
      setVisible(isVisible);
    };

    checkVisibility();

    const observer = new MutationObserver(checkVisibility);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <aside
      className={`hab-section-edit-badge absolute z-40 items-center gap-1.5 bg-slate-900/95 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl border border-amber-400/60 shadow-xl backdrop-blur-md transition-all hover:bg-slate-900 ${className}`}
      aria-label={`Visual edit options for ${label}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-amber-200 font-semibold">{label}</span>
      </div>

      <div className="flex items-center gap-1.5 ml-2 border-l border-slate-700 pl-2">
        {onQuickEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickEdit();
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-400/40 transition-colors cursor-pointer"
            title="Quick edit this section in a modal"
          >
            <Zap className="w-2.5 h-2.5" />
            <span>Quick Edit</span>
          </button>
        )}

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
  );
}
