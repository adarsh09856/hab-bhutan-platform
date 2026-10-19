'use client';

import { useState } from 'react';
import { mergeNewsOptions } from '@/lib/news-categories';
import { useAdminAccess } from './AdminAccessContext';
import { hasAdminPermission } from '@/lib/admin-navigation-access';

export default function NewsCategorySelect({ type, value, options, onChange, onOptions }: {
  type: 'category' | 'subCategory'; value: string; options: string[];
  onChange: (value: string) => void; onOptions: (data: { categories: string[]; subCategories: string[] }) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAdminAccess();
  const label = type === 'category' ? 'category' : 'sub-category';
  const id = `news-${type}`;
  async function save() {
    setSaving(true); setError('');
    try {
      const response = await fetch('/api/admin/news-taxonomy', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, name }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || `Unable to add ${label}.`);
      onOptions(data); onChange(data.name); setAdding(false); setName('');
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  }
  return <div>
    <label htmlFor={id} className="block font-medium admin-text mb-1">{type === 'category' ? 'Primary Category' : 'Sub-Category'}</label>
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full admin-input border rounded px-2.5 py-1.5">
      <option value="">{type === 'category' ? 'Select category' : 'No sub-category'}</option>
      {mergeNewsOptions(options, [value]).map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
    {hasAdminPermission(user, 'content:create') && !adding && <button type="button" onClick={() => { setAdding(true); setError(''); }} className="mt-2 text-xs font-semibold text-[#8B2E24] underline">+ Add {label}</button>}
    {adding && <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
      <input aria-label={`New ${label} name`} placeholder={`New ${label} name`} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (name.trim() && !saving) void save(); } }} className="w-full admin-input border rounded px-2 py-1.5" />
      <div className="flex gap-3"><button type="button" disabled={saving || !name.trim()} onClick={save} className="text-xs font-semibold text-[#8B2E24] disabled:opacity-50">{saving ? 'Adding…' : 'Add & select'}</button><button type="button" disabled={saving} onClick={() => { setAdding(false); setError(''); }} className="text-xs">Cancel</button></div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>}
  </div>;
}
