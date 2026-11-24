'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

export default function PolicyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [policyText, setPolicyText] = useState(
    'Review HAB’s standards, shipping, terms and returns policies.'
  );
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('hab_policy_notice_seen')) return;
    const timer = window.setTimeout(() => setIsOpen(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('/api/site-settings', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (data?.setting?.policyPopupEnabled !== undefined) {
          setIsEnabled(Boolean(data.setting.policyPopupEnabled));
        }
        if (data?.setting?.policyPopupText) setPolicyText(data.setting.policyPopupText);
      })
      .catch(() => {});

    const open = () => setIsOpen(true);
    window.addEventListener('hab:open-policy-modal', open);
    return () => window.removeEventListener('hab:open-policy-modal', open);
  }, []);

  const dismiss = () => {
    localStorage.setItem('hab_policy_notice_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen || !isEnabled) return null;

  return (
    <aside
      role="region"
      aria-label="Website policies"
      className="fixed inset-x-2 bottom-2 z-[60] mx-auto flex max-w-4xl items-center gap-3 rounded-xl border border-[#d9c49a] bg-[#fffdf8] px-3 py-2 text-[#33261f] shadow-lg sm:inset-x-4 sm:bottom-4 sm:px-4"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <ShieldCheck size={18} className="shrink-0 text-[#8b2e24]" aria-hidden="true" />
      <p className="min-w-0 flex-1 truncate text-xs leading-5 sm:text-sm" title={policyText}>
        {policyText}
      </p>
      <Link href="/policies" className="shrink-0 text-xs font-semibold text-[#8b2e24] underline sm:text-sm">
        View policies
      </Link>
      <button type="button" onClick={dismiss} aria-label="Close policy notice" className="shrink-0 rounded p-1 text-[#6b5a4c] hover:bg-[#f4f0e7]">
        <X size={17} />
      </button>
    </aside>
  );
}
