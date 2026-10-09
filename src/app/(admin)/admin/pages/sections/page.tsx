'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageBlockManager } from '@/components/public/PublicPageBlocks';

const CORE_PAGES = [
  ['Homepage', '/'], ['About HAB', '/about'], ['Board of Trustees', '/board-of-trustees'],
  ['Programmes', '/programmes'], ['Projects', '/projects'], ['Clusters', '/clusters'],
  ['Master craftspeople', '/masters'], ['Membership', '/membership'], ['Member directory', '/members'],
  ['News', '/news'], ['Events', '/events'], ['Publications', '/publications'], ['Donate', '/donate'],
  ['Wholesale', '/wholesale'], ['Contact', '/contact'], ['Privacy policy', '/privacy'],
  ['Craft traditions', '/crafts'], ['Shop', '/shop'], ['Outlets', '/outlets'],
  ['Tenders', '/tenders'], ['Secretariat', '/secretariat'], ['Annual reports', '/annual-reports'],
  ['Audited accounts', '/audited-accounts'], ['Strategic plan', '/strategic-plan'],
  ['Terms of service', '/terms'], ['Shipping & delivery', '/shipping-policy'],
] as const;

type PageChoice = { title: string; path: string; published?: boolean };

export default function PageSectionsAdminPage() {
  const [selectedPath, setSelectedPath] = useState('/');
  const [customPath, setCustomPath] = useState('');
  const [useCustomPath, setUseCustomPath] = useState(false);
  const [createdPages, setCreatedPages] = useState<PageChoice[]>([]);
  const [pageLoadMessage, setPageLoadMessage] = useState('');

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('path');
    if (requested?.startsWith('/') && !requested.startsWith('//')) {
      const normalized = requested.replace(/\/$/, '') || '/';
      setSelectedPath(normalized);
      if (!CORE_PAGES.some(([, path]) => path === normalized)) {
        setUseCustomPath(true);
        setCustomPath(normalized);
      }
    }

    fetch('/api/admin/pages', { credentials: 'include', cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Created pages could not be loaded.');
        setCreatedPages((data.customPages || []).map((page: any) => ({
          title: page.title,
          path: `/pages/${page.slug}`,
          published: page.isPublished,
        })));
      })
      .catch((error) => setPageLoadMessage(error.message || 'Created pages could not be loaded.'));
  }, []);

  const pages = useMemo(() => {
    const byPath = new Map<string, PageChoice>();
    CORE_PAGES.forEach(([title, path]) => byPath.set(path, { title, path }));
    createdPages.forEach((page) => byPath.set(page.path, page));
    return [...byPath.values()].sort((a, b) => a.title.localeCompare(b.title));
  }, [createdPages]);
  const pathname = useCustomPath ? customPath.replace(/\/$/, '') || '/' : selectedPath;
  const canOpenPage = pathname.startsWith('/') && !pathname.startsWith('//') && !pathname.includes('?') && !pathname.includes('#');

  return <main className="mx-auto max-w-5xl p-5 sm:p-8">
    <p className="text-xs font-bold uppercase tracking-widest text-[#8B2E24]">Website &amp; Pages</p>
    <h1 className="mt-1 text-2xl font-bold text-slate-900">Add a new section to a page</h1>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">This tool adds an extra content block below a page’s existing content. To change what is already on a page, open that page in Website Pages or use Quick Edit on the page itself.</p>

    <section className="my-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <label htmlFor="section-page" className="block text-sm font-semibold text-slate-800">Choose the page</label>
      {!useCustomPath ? <select id="section-page" value={selectedPath} onChange={(event) => setSelectedPath(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900">
        {pages.map((page) => <option key={page.path} value={page.path}>{page.title}{page.published === false ? ' (draft)' : ''} — {page.path}</option>)}
        <option value="__other__">Other page path…</option>
      </select> : <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input aria-label="Other page path" value={customPath} onChange={(event) => setCustomPath(event.target.value)} placeholder="/your-page-path" className="min-w-0 flex-1 rounded-lg border border-slate-300 p-3 text-sm" />
        <button type="button" onClick={() => setUseCustomPath(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Choose a listed page</button>
      </div>}
      {!useCustomPath && selectedPath === '__other__' && <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input aria-label="Other page path" value={customPath} onChange={(event) => setCustomPath(event.target.value)} placeholder="/your-page-path" className="min-w-0 flex-1 rounded-lg border border-slate-300 p-3 text-sm" />
        <button type="button" onClick={() => { setUseCustomPath(true); setSelectedPath('/'); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Use this path</button>
      </div>}
      {pageLoadMessage && <p role="status" className="mt-2 text-sm text-amber-800">{pageLoadMessage}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        {canOpenPage && <Link href={pathname} target="_blank" rel="noreferrer" className="font-semibold text-[#8B2E24] underline">Open this public page ↗</Link>}
        <Link href="/admin/pages" className="font-semibold text-slate-600 underline">Go to Website Pages</Link>
      </div>
    </section>

    {canOpenPage ? <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"><PageBlockManager key={pathname} pathname={pathname} /></div> : <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Enter a valid page path beginning with /.</p>}
  </main>;
}
