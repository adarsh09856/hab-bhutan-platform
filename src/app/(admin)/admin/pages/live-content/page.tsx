'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Edit3, ExternalLink, RefreshCw, RotateCcw, Save, Search, X } from 'lucide-react';

type Override = { text?: string; href?: string; src?: string; alt?: string; placeholder?: string };
type Pages = Record<string, Record<string, Override>>;

export default function LiveContentOverridesPage() {
  const [pages, setPages] = useState<Pages>({});
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ pathname: string; key: string; value: Override } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setMessage('');
    try {
      const response = await fetch('/api/page-overrides?all=1', { credentials: 'include', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to load live content.');
      setPages(data.pages || {});
    } catch (error: any) { setMessage(error?.message || 'Unable to load live content.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => Object.entries(pages).flatMap(([pathname, entries]) =>
    Object.entries(entries || {}).map(([key, value]) => ({ pathname, key, value }))
  ).filter((row) => `${row.pathname} ${row.key} ${Object.values(row.value).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [pages, query]);

  const remove = async (pathname: string, key: string) => {
    if (!window.confirm('Remove this live override and restore the page’s original content?')) return;
    const response = await fetch('/api/page-overrides', {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathname, key, remove: true, override: {} }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) { setMessage(data.error || 'Unable to remove override.'); return; }
    setPages((current) => {
      const next = { ...current, [pathname]: { ...(current[pathname] || {}) } };
      delete next[pathname][key];
      if (Object.keys(next[pathname]).length === 0) delete next[pathname];
      return next;
    });
    setMessage('Override removed.');
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/page-overrides', {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname: editing.pathname, key: editing.key, override: editing.value }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to save content.');
      setPages((current) => ({
        ...current,
        [editing.pathname]: { ...(current[editing.pathname] || {}), [editing.key]: editing.value },
      }));
      setEditing(null); setMessage('Live content updated.');
    } catch (error: any) { setMessage(error?.message || 'Unable to save content.'); }
    finally { setSaving(false); }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div><p className="text-xs font-bold uppercase tracking-wider text-[#8B2E24]">Website &amp; Pages</p><h1 className="text-2xl font-bold text-slate-900">Live Quick Edit content</h1><p className="text-sm text-slate-600 mt-1">Search and undo public-page text, link, caption and image overrides saved through Quick Edit.</p></div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>
      <div className="relative mb-5"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search page, text, URL or image…" className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm" /></div>
      {message && <p className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm">{message}</p>}
      {loading ? <p className="text-sm text-slate-500">Loading saved edits…</p> : rows.length === 0 ? <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">No saved Quick Edit overrides match this search.</div> :
        <div className="space-y-3">{rows.map(({ pathname, key, value }) => <article key={`${pathname}:${key}`} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><Link href={`${pathname === '/__global__' ? '/' : pathname}?edit=true`} target="_blank" className="inline-flex items-center gap-1 font-bold text-[#8B2E24]">{pathname === '/__global__' ? 'Global header / footer' : pathname} <ExternalLink className="w-3.5 h-3.5" /></Link><p className="mt-1 max-w-3xl truncate font-mono text-[11px] text-slate-400">{key}</p></div><div className="flex gap-2"><button type="button" onClick={() => setEditing({ pathname, key, value: { ...value } })} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700"><Edit3 className="w-3.5 h-3.5" /> Edit</button><button type="button" onClick={() => remove(pathname, key)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold text-red-700"><RotateCcw className="w-3.5 h-3.5" /> Restore original</button></div></div>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(value).map(([field, content]) => <div key={field} className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{field}</dt><dd className="mt-1 break-words text-sm text-slate-800">{content}</dd></div>)}</dl>
        </article>)}</div>}
      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"><div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl"><div className="flex justify-between gap-3"><div><h2 className="font-bold text-slate-900">Edit live content</h2><p className="text-xs text-slate-500">{editing.pathname} · {editing.key}</p></div><button onClick={() => setEditing(null)} aria-label="Close"><X className="w-5 h-5" /></button></div><div className="mt-4 space-y-3">{(['text', 'href', 'src', 'alt', 'placeholder'] as const).filter((field) => field in editing.value).map((field) => <label key={field} className="block"><span className="mb-1 block text-xs font-bold uppercase text-slate-600">{field}</span>{field === 'text' ? <textarea rows={5} value={editing.value[field] || ''} onChange={(e) => setEditing({ ...editing, value: { ...editing.value, [field]: e.target.value } })} className="w-full rounded-lg border px-3 py-2 text-sm" /> : <input value={editing.value[field] || ''} onChange={(e) => setEditing({ ...editing, value: { ...editing.value, [field]: e.target.value } })} className="w-full rounded-lg border px-3 py-2 text-sm" />}</label>)}</div><div className="mt-5 flex justify-end gap-2"><button onClick={() => setEditing(null)} className="rounded-lg border px-3 py-2 text-xs font-semibold">Cancel</button><button disabled={saving} onClick={save} className="inline-flex items-center gap-1 rounded-lg bg-[#8B2E24] px-4 py-2 text-xs font-bold text-white"><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save live'}</button></div></div></div>}
    </main>
  );
}
