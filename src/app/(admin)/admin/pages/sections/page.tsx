'use client';

import { useEffect, useState } from 'react';
import { PageBlockManager } from '@/components/public/PublicPageBlocks';

export default function PageSectionsAdminPage() {
  const [pathInput, setPathInput] = useState('/');
  const [pathname, setPathname] = useState('/');
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('path');
    if (requested?.startsWith('/') && !requested.startsWith('//')) {
      const normalized = requested.replace(/\/$/, '') || '/';
      setPathInput(normalized);
      setPathname(normalized);
    }
  }, []);
  return <main className="mx-auto max-w-4xl p-5 sm:p-8">
    <p className="text-xs font-bold uppercase tracking-widest text-[#8B2E24]">Website & Pages</p>
    <h1 className="mt-1 text-2xl font-bold text-slate-900">Extra page sections (optional)</h1>
    <p className="mt-2 text-sm text-slate-600">Use this only to add a new content block that does not already exist on a page. To change existing text, images, products, or page sections, use that page’s normal editor or Quick Edit instead.</p>
    <form className="my-6 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (pathInput.startsWith('/') && !pathInput.startsWith('//')) setPathname(pathInput.replace(/\/$/, '') || '/'); }}>
      <label className="flex-1 text-xs font-semibold text-slate-700">Which page should receive the new block?<input value={pathInput} onChange={(event) => setPathInput(event.target.value)} placeholder="For example: /strategic-plan" className="mt-1 w-full rounded-lg border bg-white p-2 text-sm" /></label>
      <button type="submit" className="self-end rounded-lg bg-[#8B2E24] px-4 py-2.5 text-xs font-bold text-white">Show sections</button>
    </form>
    <div className="rounded-xl border bg-white p-4"><PageBlockManager key={pathname} pathname={pathname} /></div>
  </main>;
}
