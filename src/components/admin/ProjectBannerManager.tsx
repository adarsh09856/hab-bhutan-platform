'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';

type Slide = { id: string; imageUrl: string; altText: string; caption: string; linkUrl?: string | null; sortOrder: number; isActive: boolean };
const EMPTY = { imageUrl: '', altText: '', caption: '', linkUrl: '', sortOrder: 0, isActive: true };

export default function ProjectBannerManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/project-banner', { credentials: 'include', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not load project banner slides.');
      setSlides(Array.isArray(data.slides) ? data.slides : []);
    } catch (err: any) { setError(err.message || 'Could not load project banner slides.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const openAdd = () => {
    setForm({ ...EMPTY, sortOrder: slides.reduce((max, slide) => Math.max(max, slide.sortOrder), -1) + 1 });
    setEditId(null); setError(''); setShowForm(true);
  };

  const openEdit = (slide: Slide) => {
    setForm({ imageUrl: slide.imageUrl, altText: slide.altText, caption: slide.caption || '', linkUrl: slide.linkUrl || '', sortOrder: slide.sortOrder, isActive: slide.isActive });
    setEditId(slide.id); setError(''); setShowForm(true);
  };

  const save = async () => {
    if (!form.imageUrl.trim() || !form.altText.trim()) { setError('Choose a banner image and add an image description.'); return; }
    setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/project-banner', {
        method: editId ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...(editId ? { id: editId } : {}) }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not save banner slide.');
      setNotice(editId ? 'Banner image updated.' : 'Banner image added.');
      setShowForm(false); setEditId(null); await load();
    } catch (err: any) { setError(err.message || 'Could not save banner slide.'); }
    finally { setSaving(false); }
  };

  const toggle = async (slide: Slide) => {
    setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/project-banner', {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: slide.id, isActive: !slide.isActive }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not update banner visibility.');
      await load(); setNotice(slide.isActive ? 'Banner image hidden.' : 'Banner image published.');
    } catch (err: any) { setError(err.message || 'Could not update banner visibility.'); }
  };

  const remove = async (slide: Slide) => {
    if (!window.confirm(`Delete this project banner image${slide.caption ? ` (“${slide.caption}”)` : ''}?`)) return;
    setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/project-banner?id=${encodeURIComponent(slide.id)}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not delete banner image.');
      await load(); setNotice('Banner image deleted.');
    } catch (err: any) { setError(err.message || 'Could not delete banner image.'); }
  };

  return <section className="admin-card border admin-border rounded-xl p-5 shadow-crm-sm">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold admin-title">Projects page banner</h2>
        <p className="text-sm admin-muted mt-1">Manage the rotating images at the top of the public Projects page. When no custom slides are added, existing project cover photos are used.</p>
      </div>
      {!showForm && <button type="button" onClick={openAdd} className="inline-flex items-center justify-center gap-2 admin-button-primary px-4 py-2 rounded-lg text-sm font-semibold"><Plus className="w-4 h-4" /> Add banner image</button>}
    </div>

    {notice && <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800" role="status">{notice}</p>}
    {error && <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-800" role="alert">{error}</p>}

    {showForm && <div className="mt-5 rounded-xl border admin-border p-4">
      <div className="mb-4 flex items-center justify-between gap-4"><h3 className="font-semibold admin-title">{editId ? 'Edit banner image' : 'Add banner image'}</h3><button type="button" onClick={() => setShowForm(false)} aria-label="Close banner form" className="rounded-lg border admin-border p-2"><X className="h-4 w-4" /></button></div>
      <FileUploadInput label="Banner image *" value={form.imageUrl} onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))} accept="image/*" hint="A wide landscape photo works best. This image appears in the Projects page carousel." />
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-medium admin-title">Image description *<input className="mt-1 w-full rounded-lg border admin-input px-3 py-2" value={form.altText} onChange={(event) => setForm({ ...form, altText: event.target.value })} placeholder="Describe the project image" /></label>
        <label className="text-sm font-medium admin-title">Caption (optional)<input className="mt-1 w-full rounded-lg border admin-input px-3 py-2" value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} placeholder="Short caption shown below the banner" /></label>
        <label className="text-sm font-medium admin-title">Link (optional)<input className="mt-1 w-full rounded-lg border admin-input px-3 py-2" value={form.linkUrl} onChange={(event) => setForm({ ...form, linkUrl: event.target.value })} placeholder="/projects/project-id" /></label>
        <label className="text-sm font-medium admin-title">Display order<input type="number" min="0" className="mt-1 w-full rounded-lg border admin-input px-3 py-2" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) || 0 })} /></label>
      </div>
      <label className="mt-4 inline-flex items-center gap-2 text-sm admin-title"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Show on the public Projects page</label>
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={saving} onClick={save} className="admin-button-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">{saving ? 'Saving…' : editId ? 'Save image' : 'Add image'}</button><button type="button" onClick={() => setShowForm(false)} className="admin-button-secondary rounded-lg border admin-border px-4 py-2 text-sm">Cancel</button></div>
    </div>}

    {loading ? <p className="py-6 text-center text-sm admin-muted">Loading banner images…</p> : slides.length === 0 ? <div className="mt-5 rounded-lg border admin-border px-4 py-5 text-sm admin-muted"><ImagePlus className="mb-2 h-5 w-5" /><p>Using existing project cover photos for the banner. Add a custom image to manage a separate banner sequence.</p></div> : <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {slides.map((slide) => <article key={slide.id} className="overflow-hidden rounded-xl border admin-border">
        <div className="relative aspect-[16/7] bg-slate-100"><img src={slide.imageUrl} alt={slide.altText} className="absolute inset-0 h-full w-full object-cover" /></div>
        <div className="p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold admin-title">{slide.caption || slide.altText}</p><p className="mt-1 text-xs admin-muted">Order {slide.sortOrder} · {slide.isActive ? 'Visible' : 'Hidden'}</p></div><button type="button" onClick={() => void toggle(slide)} className="shrink-0 rounded-full border admin-border px-2.5 py-1 text-xs font-semibold">{slide.isActive ? 'Hide' : 'Show'}</button></div>
          <div className="mt-3 flex gap-2"><button type="button" onClick={() => openEdit(slide)} className="inline-flex items-center gap-1.5 rounded-lg border admin-border px-3 py-1.5 text-xs font-semibold"><Pencil className="h-3.5 w-3.5" /> Edit</button><button type="button" onClick={() => void remove(slide)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700"><Trash2 className="h-3.5 w-3.5" /> Delete</button></div>
        </div>
      </article>)}
    </div>}
  </section>;
}
