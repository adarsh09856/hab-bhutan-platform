'use client';

import { useState } from 'react';
import { PageBlockManager } from '@/components/public/PublicPageBlocks';

export default function PageSectionsAdminPage() {
  const [pathInput, setPathInput] = useState('/');
  const [pathname, setPathname] = useState('/');
  return <main className="mx-auto max-w-4xl p-5 sm:p-8">
    <p className="text-xs font-bold uppercase tracking-widest text-[#8B2E24]">Website & Pages</p>
    <h1 className="mt-1 text-2xl font-bold text-slate-900">Public page sections</h1>
    <p className="mt-2 text-sm text-slate-600">Add, edit, reorder, hide, or delete additional sections on any public page. Existing page-specific sections remain in their own editors.</p>
    <form className="my-6 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (pathInput.startsWith('/') && !pathInput.startsWith('//')) setPathname(pathInput.replace(/\/$/, '') || '/'); }}>
      <label className="flex-1 text-xs font-semibold text-slate-700">Public page path<input value={pathInput} onChange={(event) => setPathInput(event.target.value)} placeholder="/strategic-plan" className="mt-1 w-full rounded-lg border bg-white p-2 text-sm" /></label>
      <button type="submit" className="self-end rounded-lg bg-[#8B2E24] px-4 py-2.5 text-xs font-bold text-white">Open page</button>
    </form>
    <div className="rounded-xl border bg-white p-4"><PageBlockManager key={pathname} pathname={pathname} /></div>
  </main>;
}
