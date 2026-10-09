'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { CRAFTS } from '@/lib/data';
import FileUploadInput from '@/components/admin/FileUploadInput';

type ProductForm = {
  code: string;
  name: string;
  description: string;
  priceUSD: string;
  stock: string;
  craftKey: string;
  region: string;
  makerMemberId: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'ARCHIVED';
  size: string;
  weight: string;
  materials: string;
  care: string;
  lead: string;
  imageUrls: string[];
};

const blankForm = (): ProductForm => ({
  code: '', name: '', description: '', priceUSD: '', stock: '0', craftKey: '', region: '',
  makerMemberId: '', status: 'DRAFT', size: '', weight: '', materials: '', care: '', lead: '', imageUrls: [],
});

function imageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item: any) => typeof item === 'string' ? item : item?.url).filter((url): url is string => typeof url === 'string' && url.length > 0);
}

export default function ProductQuickEdit({ isOpen, onClose, code }: { isOpen: boolean; onClose: () => void; code: string }) {
  const [form, setForm] = useState<ProductForm>(blankForm);
  const [originalForm, setOriginalForm] = useState<ProductForm>(blankForm);
  const [creating, setCreating] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [members, setMembers] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [galleryUpload, setGalleryUpload] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, saving, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setLoaded(false);
    setError('');
    setSuccess('');
    setCreating(false);
    fetch('/api/admin/products', { credentials: 'include', cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Could not load the saved product.');
        const product = (data.products || []).find((item: any) => String(item.code).toUpperCase() === code.toUpperCase());
        if (!product) throw new Error('This product is no longer in the Admin catalogue.');
        const savedForm: ProductForm = {
          code: product.code, name: product.name || '', description: product.description || '',
          priceUSD: String(product.priceUSD ?? ''), stock: String(product.stock ?? 0),
          craftKey: product.craftKey || '', region: product.region || '',
          makerMemberId: product.makerMemberId || '', status: product.status || 'DRAFT',
          size: product.size || '', weight: product.weight || '', materials: product.materials || '',
          care: product.care || '', lead: product.lead || '', imageUrls: imageUrls(product.images),
        };
        setForm(savedForm);
        setOriginalForm(savedForm);
        setLoaded(true);
      })
      .catch(cause => { if (!controller.signal.aborted) setError(cause?.message || 'Could not load the saved product.'); });
    fetch('/api/admin/members', { credentials: 'include', cache: 'no-store', signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data?.success && Array.isArray(data.members)) setMembers(data.members.map((member: any) => ({ id: member.id, name: member.name, status: member.status }))); })
      .catch(() => {});
    return () => controller.abort();
  }, [isOpen, code]);

  if (!isOpen || typeof document === 'undefined') return null;

  const update = (key: keyof ProductForm, value: ProductForm[keyof ProductForm]) => {
    setForm(previous => ({ ...previous, [key]: value }));
    setError('');
    setSuccess('');
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !/^[A-Z0-9][A-Z0-9_-]{1,39}$/i.test(form.code.trim()) || !form.craftKey ||
        !Number.isFinite(Number(form.priceUSD)) || Number(form.priceUSD) < 0 ||
        !Number.isSafeInteger(Number(form.stock)) || Number(form.stock) < 0) {
      setError('Enter a valid product code, name, craft, non-negative price, and whole-number stock.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...(creating ? {} : { code }),
        name: form.name.trim(), description: form.description.trim(), priceUSD: Number(form.priceUSD),
        stock: Number(form.stock), craftKey: form.craftKey, region: form.region.trim(),
        makerMemberId: form.makerMemberId || null, status: form.status,
        size: form.size, weight: form.weight, materials: form.materials, care: form.care, lead: form.lead,
        images: form.imageUrls.map((url, index) => ({ url, role: index === 0 ? 'primary' : 'gallery' })),
        ...(creating ? { code: form.code.trim().toUpperCase() } : {}),
      };
      const response = await fetch('/api/admin/products', {
        method: creating ? 'POST' : 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'The product could not be saved.');
      if (creating) {
        if (form.status === 'PUBLISHED') window.location.assign(`/product/${encodeURIComponent(form.code.trim().toUpperCase())}`);
        else {
          setCreating(false);
          setForm(originalForm);
          setSuccess(`Saved ${form.code.trim().toUpperCase()} as ${form.status.toLowerCase().replace('_', ' ')}. It is not public until published.`);
        }
      } else {
        window.location.reload();
      }
    } catch (cause: any) {
      setError(cause?.message || 'The product could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Move ${code} to the Recycle Bin? It will disappear from the public shop.`)) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/products?code=${encodeURIComponent(code)}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'The product could not be removed.');
      window.location.assign('/shop');
    } catch (cause: any) {
      setError(cause?.message || 'The product could not be removed.');
      setSaving(false);
    }
  };

  const fieldClass = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900';

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-3 sm:p-6" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={creating ? 'Create product in Quick Edit' : `Edit ${code} in Quick Edit`} className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[#FFFCF8] shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-stone-200 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#8B2E24]">Product Quick Edit</p>
            <h2 className="font-serif text-2xl text-stone-900">{creating ? 'Create a product' : `Edit ${form.name || code}`}</h2>
            <p className="text-xs text-stone-600">Changes to a published product appear in the public shop after saving.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm" aria-label="Close product Quick Edit">Close ✕</button>
        </header>
        <div className="flex gap-2 border-b border-stone-200 px-5 py-2">
          <button type="button" onClick={() => { setCreating(false); setForm(originalForm); setLoaded(true); setError(''); setSuccess(''); }} className={!creating ? 'font-bold text-[#8B2E24]' : 'text-stone-600'}>Current product</button>
          <span className="text-stone-300">|</span>
          <button type="button" onClick={() => { setCreating(true); setForm(blankForm()); setLoaded(true); setError(''); setSuccess(''); }} className={creating ? 'font-bold text-[#8B2E24]' : 'text-stone-600'}>+ Create another product</button>
          <Link href="/admin/products" target="_blank" className="ml-auto text-sm text-[#8B2E24] underline">Full Products Studio ↗</Link>
        </div>
        <form onSubmit={save} className="overflow-y-auto px-5 py-5">
          {!loaded && !error && <p role="status">Loading saved product…</p>}
          {loaded && <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">SKU / code<input className={fieldClass} value={form.code} disabled={!creating || saving} onChange={event => update('code', event.target.value)} required /></label>
              <label className="text-sm font-medium">Product name<input className={fieldClass} value={form.name} disabled={saving} onChange={event => update('name', event.target.value)} required /></label>
            </div>
            <label className="block text-sm font-medium">Description<textarea className={fieldClass} rows={4} value={form.description} disabled={saving} onChange={event => update('description', event.target.value)} /></label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm font-medium">Retail price (USD)<input className={fieldClass} type="number" min="0" step="0.01" value={form.priceUSD} disabled={saving} onChange={event => update('priceUSD', event.target.value)} required /></label>
              <label className="text-sm font-medium">Stock available<input className={fieldClass} type="number" min="0" step="1" value={form.stock} disabled={saving} onChange={event => update('stock', event.target.value)} required /></label>
              <label className="text-sm font-medium">Publication<select className={fieldClass} value={form.status} disabled={saving} onChange={event => update('status', event.target.value)}><option value="DRAFT">Draft</option><option value="PENDING_APPROVAL">Pending approval</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Craft<select className={fieldClass} value={form.craftKey} disabled={saving} onChange={event => update('craftKey', event.target.value)} required><option value="">Select a craft</option>{CRAFTS.map(craft => <option key={craft.key} value={craft.key}>{craft.name} — {craft.english}</option>)}</select></label>
              <label className="text-sm font-medium">Region<input className={fieldClass} value={form.region} disabled={saving} onChange={event => update('region', event.target.value)} /></label>
            </div>
            {members.length > 0 && <label className="block text-sm font-medium">Maker / member<select className={fieldClass} value={form.makerMemberId} disabled={saving} onChange={event => update('makerMemberId', event.target.value)}><option value="">No member linked</option>{members.map(member => <option key={member.id} value={member.id}>{member.name} ({member.status})</option>)}</select></label>}
            <FileUploadInput value={form.imageUrls[0] || ''} onChange={url => update('imageUrls', url ? [url, ...form.imageUrls.slice(1)] : form.imageUrls.slice(1))} label="Primary product photograph" accept="image/*" hint="Upload a clear, high-resolution product photograph." disabled={saving} />
            <FileUploadInput value={galleryUpload} onChange={url => { if (url) update('imageUrls', [...form.imageUrls, url]); setGalleryUpload(''); }} label="Add another gallery photograph" accept="image/*" disabled={saving} />
            {form.imageUrls.length > 1 && <div className="space-y-1 text-sm"><p className="font-medium">Gallery photos</p>{form.imageUrls.slice(1).map((url, index) => <div key={`${url}-${index}`} className="flex items-center justify-between gap-2 rounded border border-stone-200 p-2"><span className="min-w-0 truncate">{url}</span><button type="button" onClick={() => update('imageUrls', form.imageUrls.filter((_, i) => i !== index + 1))} className="text-[#8B2E24] underline">Remove</button></div>)}</div>}
            <details className="rounded-lg border border-stone-200 p-3"><summary className="cursor-pointer font-medium">Specifications and care</summary><div className="mt-3 grid gap-3 sm:grid-cols-2">{(['size', 'weight', 'materials', 'care', 'lead'] as const).map(key => <label key={key} className="text-sm font-medium capitalize">{key}<input className={fieldClass} value={form[key]} disabled={saving} onChange={event => update(key, event.target.value)} /></label>)}</div></details>
          </div>}
          {error && <p className="mt-3 rounded bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
          {success && <p className="mt-3 rounded bg-green-50 p-3 text-sm text-green-800" role="status">{success}</p>}
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-stone-200 pt-4">
            {!creating && loaded && <button type="button" onClick={remove} disabled={saving} className="mr-auto rounded-lg border border-red-300 px-4 py-2 text-sm text-red-800">Move to Recycle Bin</button>}
            <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-stone-300 px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={!loaded || saving} className="rounded-lg bg-[#8B2E24] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : creating ? 'Create product' : 'Save product'}</button>
          </div>
        </form>
      </div>
    </div>, document.body,
  );
}
