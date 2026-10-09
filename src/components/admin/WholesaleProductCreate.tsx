'use client';

import { useState } from 'react';
import { CRAFTS } from '@/lib/data';
import { GlassDrawer } from '@/components/admin/GlassUI';
import FileUploadInput from '@/components/admin/FileUploadInput';

export default function WholesaleProductCreate({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [form, setForm] = useState({ code: '', name: '', craftKey: CRAFTS[0].key, region: '', priceUSD: '', stock: '0', description: '', imageUrl: '', size: '', weight: '', materials: '', care: '', lead: '', customisation: '', moq: '1', enabled: true });
  const [tiers, setTiers] = useState([{ quantity: '1', price: '' }]);
  const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900';

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setError('');
    const breaks = tiers.map(t => [Number(t.quantity), Number(t.price)]).sort((a, b) => a[0] - b[0]);
    const moq = Number(form.moq);
    if (!Number.isInteger(moq) || moq < 1 || breaks.some((t, i) => !Number.isInteger(t[0]) || t[0] < moq || !Number.isFinite(t[1]) || t[1] < 0 || (i > 0 && t[0] <= breaks[i - 1][0]))) {
      setError('Enter a positive MOQ and distinct increasing quantity breaks at or above the MOQ.');
      return;
    }
    if (form.enabled && !form.lead.trim()) {
      setError('Add a production lead time before enabling this product in the wholesale catalogue.');
      return;
    }
    if (tiers.length > 8) {
      setError('A wholesale product can have at most 8 quantity price breaks.');
      return;
    }
    setSaving(true);
    let productCode = createdCode;
    try {
      if (!productCode) {
        const response = await fetch('/api/admin/products', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, code: form.code.trim().toUpperCase(), priceUSD: Number(form.priceUSD), stock: Number(form.stock), status: 'PUBLISHED', images: form.imageUrl ? [{ url: form.imageUrl, role: 'primary' }] : [] }) });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Could not create the product.');
        productCode = result.product.code;
        setCreatedCode(productCode);
      }
      const response = await fetch('/api/admin/trade', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save_terms', payload: { productCode, terms: { moq, tiers: breaks, lead_time: form.lead, customisation: form.customisation, is_active: form.enabled } } }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not save wholesale prices.');
      setSuccess(`Product ${productCode} created with wholesale prices${form.enabled ? ' and enabled in the B2B catalogue' : ''}.`);
      setOpen(false);
      setCreatedCode('');
      setForm({ code: '', name: '', craftKey: CRAFTS[0].key, region: '', priceUSD: '', stock: '0', description: '', imageUrl: '', size: '', weight: '', materials: '', care: '', lead: '', customisation: '', moq: '1', enabled: true });
      setTiers([{ quantity: '1', price: '' }]);
      onCreated?.();
    } catch (cause) {
      setError(`${productCode ? `Product ${productCode} is saved. Retry to save its wholesale prices; the product will not be created twice. ` : ''}${cause instanceof Error ? cause.message : 'Request failed.'}`);
    } finally { setSaving(false); }
  }

  return <>
    <button type="button" onClick={() => { setOpen(true); setSuccess(''); }} className="px-3 py-2 bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold rounded-xl">+ Add wholesale product</button>
    {success && <p role="status" className="text-xs text-emerald-800">{success}</p>}
    <GlassDrawer isOpen={open} onClose={() => { if (!saving) setOpen(false); }} title="Add wholesale product" subtitle="Create the product and its B2B prices here.">
      <form onSubmit={submit} className="space-y-4 text-xs">
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
        {createdCode && <p className="text-amber-800">Product {createdCode} is saved. Complete the wholesale settings below.</p>}
        <fieldset disabled={saving || !!createdCode} className="grid grid-cols-2 gap-3">
          {(['code', 'name', 'region', 'priceUSD', 'stock', 'size', 'weight', 'materials', 'care'] as const).map(key => <label key={key} className="space-y-1"><span>{{ code: 'SKU / Product code', name: 'Product name', region: 'Region', priceUSD: 'Retail price (USD)', stock: 'Available stock', size: 'Size', weight: 'Weight', materials: 'Materials', care: 'Care instructions' }[key]}</span><input className={fieldClass} value={form[key]} required={['code', 'name', 'priceUSD', 'stock'].includes(key)} type={['priceUSD', 'stock'].includes(key) ? 'number' : 'text'} min={['priceUSD', 'stock'].includes(key) ? 0 : undefined} step={key === 'priceUSD' ? '0.01' : undefined} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}
          <label className="space-y-1"><span>Craft</span><select className={fieldClass} value={form.craftKey} onChange={e => setForm({ ...form, craftKey: e.target.value })}>{CRAFTS.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}</select></label>
          <label className="col-span-2 space-y-1"><span>Description</span><textarea required className={fieldClass} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <div className="col-span-2"><FileUploadInput label="Product photo" accept="image/*" value={form.imageUrl} onChange={imageUrl => setForm(f => ({ ...f, imageUrl }))} disabled={saving || !!createdCode} /></div>
        </fieldset>
        <fieldset disabled={saving} className="space-y-3">
          <label className="block space-y-1"><span>Minimum order quantity</span><input className={fieldClass} type="number" min="1" required value={form.moq} onChange={e => setForm({ ...form, moq: e.target.value })} /></label>
          <label className="block space-y-1"><span>Lead time</span><input className={fieldClass} value={form.lead} onChange={e => setForm({ ...form, lead: e.target.value })} /></label>
          <label className="block space-y-1"><span>Customisation notes</span><textarea className={fieldClass} value={form.customisation} onChange={e => setForm({ ...form, customisation: e.target.value })} /></label>
          <p className="font-semibold">Wholesale quantity breaks and unit prices (USD)</p>
          {tiers.map((tier, index) => <div key={index} className="flex items-end gap-2"><label className="flex-1">Quantity<input className={fieldClass} type="number" min={form.moq} required value={tier.quantity} onChange={e => setTiers(tiers.map((t, i) => i === index ? { ...t, quantity: e.target.value } : t))} /></label><label className="flex-1">Unit price<input className={fieldClass} type="number" min="0" step="0.01" required value={tier.price} onChange={e => setTiers(tiers.map((t, i) => i === index ? { ...t, price: e.target.value } : t))} /></label><button type="button" disabled={tiers.length === 1} onClick={() => setTiers(tiers.filter((_, i) => i !== index))} className="py-2 text-red-700 disabled:opacity-30">Remove</button></div>)}
          <button type="button" disabled={tiers.length >= 8} onClick={() => setTiers([...tiers, { quantity: String(Math.max(Number(form.moq), ...tiers.map(t => Number(t.quantity))) + 1), price: '' }])} className="text-[#8B2E24] font-semibold">+ Add price break</button>
          <label className="flex gap-2"><input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />Enable in Wholesale (B2B) Catalog</label>
        </fieldset>
        <div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setOpen(false)}>Close</button><button type="submit" disabled={saving} className="rounded-lg bg-[#8B2E24] px-4 py-2 text-white">{saving ? 'Saving…' : createdCode ? 'Retry wholesale prices' : 'Create wholesale product'}</button></div>
      </form>
    </GlassDrawer>
  </>;
}
