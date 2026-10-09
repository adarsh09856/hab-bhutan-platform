'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import FileUploadInput from '@/components/admin/FileUploadInput';

type Block = { id: string; pathname: string; title: string; body: string; imageUrl: string | null; buttonLabel: string | null; buttonHref: string | null; sortOrder: number; isPublished: boolean };
const blank = (pathname: string): Block => ({ id: '', pathname, title: '', body: '', imageUrl: null, buttonLabel: null, buttonHref: null, sortOrder: 0, isPublished: true });

export function PageBlockManager({ pathname, onChanged }: { pathname: string; onChanged?: () => void }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draft, setDraft] = useState<Block | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = useCallback(async () => {
    const response = await fetch(`/api/page-blocks?all=1&path=${encodeURIComponent(pathname)}`, { credentials: 'include', cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Sections could not be loaded.');
    setBlocks(data.blocks || []);
  }, [pathname]);
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, [load]);
  const change = (field: keyof Block, value: string | number | boolean) => setDraft((current) => current ? { ...current, [field]: value } : current);
  const save = async () => {
    if (!draft?.title.trim()) { setMessage('Section title is required.'); return; }
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/page-blocks', { method: draft.id ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...draft, pathname }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Save failed.');
      setDraft(null); await load(); onChanged?.(); setMessage('Section saved live.');
    } catch (error: any) { setMessage(error.message || 'Save failed.'); } finally { setBusy(false); }
  };
  const remove = async (block: Block) => {
    if (!window.confirm(`Delete “${block.title}” from ${pathname}?`)) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`/api/page-blocks?id=${encodeURIComponent(block.id)}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Delete failed.');
      await load(); onChanged?.(); setMessage('Section deleted.');
    } catch (error: any) { setMessage(error.message || 'Delete failed.'); } finally { setBusy(false); }
  };
  return <div className="space-y-4 text-slate-900">
    <div className="flex items-center justify-between gap-3"><p className="text-sm">Additional sections on <strong>{pathname}</strong></p><button type="button" onClick={() => setDraft(blank(pathname))} className="rounded-lg bg-[#8B2E24] px-3 py-2 text-xs font-bold text-white">+ Add section</button></div>
    {message && <p role="status" className="rounded-lg bg-amber-50 p-2 text-xs">{message}</p>}
    <div className="max-h-48 overflow-y-auto divide-y rounded-lg border">{blocks.length ? blocks.map((block) => <div key={block.id} className="flex items-center gap-2 p-2 text-xs"><span className="min-w-0 flex-1 truncate">{block.sortOrder} · {block.title}{!block.isPublished ? ' (hidden)' : ''}</span><button type="button" onClick={() => setDraft({ ...block })} className="rounded border px-2 py-1">Edit</button><button type="button" disabled={busy} onClick={() => remove(block)} className="rounded border border-red-200 px-2 py-1 text-red-700">Delete</button></div>) : <p className="p-3 text-xs text-slate-500">No additional sections yet.</p>}</div>
    {draft && <div className="grid gap-3 rounded-lg border p-3 text-xs">
      <div className="flex justify-between"><strong>{draft.id ? 'Edit section' : 'New section'}</strong><button type="button" onClick={() => setDraft(null)} aria-label="Close section form">✕</button></div>
      <label>Title<input value={draft.title} onChange={(e) => change('title', e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
      <label>Body<textarea rows={5} value={draft.body} onChange={(e) => change('body', e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
      <FileUploadInput value={draft.imageUrl || ''} onChange={(url) => change('imageUrl', url)} label="Image (optional)" accept="image/*" />
      <label>Button label<input value={draft.buttonLabel || ''} onChange={(e) => change('buttonLabel', e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
      <label>Button link<input value={draft.buttonHref || ''} onChange={(e) => change('buttonHref', e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
      <label>Display order<input type="number" value={draft.sortOrder} onChange={(e) => change('sortOrder', Number(e.target.value))} className="mt-1 w-full rounded border p-2" /></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isPublished} onChange={(e) => change('isPublished', e.target.checked)} />Visible publicly</label>
      <button type="button" disabled={busy} onClick={save} className="rounded-lg bg-[#8B2E24] px-3 py-2 font-bold text-white">{busy ? 'Saving…' : 'Save section live'}</button>
    </div>}
  </div>;
}

export default function PublicPageBlocks() {
  const pathname = usePathname() || '/';
  const [blocks, setBlocks] = useState<Block[]>([]);
  const load = useCallback(async () => {
    const response = await fetch(`/api/page-blocks?path=${encodeURIComponent(pathname)}`, { cache: 'no-store' });
    const data = await response.json();
    if (data.success) setBlocks(data.blocks || []);
  }, [pathname]);
  useEffect(() => { load().catch(() => {}); }, [load]);
  return <>
    {blocks.map((block) => <section key={block.id} className="section relative" data-hab-section={`page-block-${block.id}`}>
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm md:flex">
        {block.imageUrl && <img src={block.imageUrl} alt="" className="h-64 w-full object-cover md:h-auto md:w-2/5" />}
        <div className="p-6 md:p-10"><h2 className="display display--sub">{block.title}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-stone-700">{block.body}</p>{block.buttonLabel && block.buttonHref && <Link href={block.buttonHref} className="mt-5 inline-block rounded-lg bg-[#8B2E24] px-4 py-2 text-sm font-bold text-white">{block.buttonLabel}</Link>}</div>
      </div>
    </section>)}
  </>;
}
