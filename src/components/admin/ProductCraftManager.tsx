'use client';
import { useState } from 'react';

type Craft = { key: string; name: string; english: string; description?: string };
export default function ProductCraftManager({ crafts, selected, onSaved }: { crafts: Craft[]; selected: string; onSaved: () => void }) {
  const [form, setForm] = useState<Craft>({ key: '', name: '', english: '', description: '' });
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function save(archive = false) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/crafts', {
        method: editing || archive ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(archive ? { key: selected, isActive: false } : form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save craft.');
      setMessage(archive ? 'Craft archived.' : 'Craft saved. Select it from Craft Tradition.');
      onSaved();
    } catch (error: any) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  return <details className="mt-2 text-sm">
    <summary className="cursor-pointer text-[#8B2E24]">Manage craft traditions here</summary>
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => { setEditing(false); setForm({ key: '', name: '', english: '', description: '' }); }} className="admin-button-secondary px-3 py-2 rounded-lg">New craft</button>
        <button type="button" disabled={!selected} onClick={() => { const craft = crafts.find(c => c.key === selected); if (craft) { setEditing(true); setForm({ ...craft }); } }} className="admin-button-secondary px-3 py-2 rounded-lg">Edit selected craft</button>
      </div>
      {(['key', 'name', 'english', 'description'] as const).map(field => <label key={field} className="block">
        {{ key: 'Craft key', name: 'Craft name', english: 'English description', description: 'About this craft' }[field]}
        <input value={form[field] || ''} disabled={field === 'key' && editing} onChange={event => setForm({ ...form, [field]: event.target.value })} className="w-full admin-input border rounded-lg px-3 py-2 mt-1" />
      </label>)}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy || !form.key.trim() || !form.name.trim() || !form.english.trim()} onClick={() => save()} className="admin-button-primary px-3 py-2 rounded-lg">Save craft</button>
        <button type="button" disabled={busy || !selected} onClick={() => save(true)} className="admin-button-secondary px-3 py-2 rounded-lg">Archive selected craft</button>
      </div>
      <p className="admin-muted">Archiving keeps existing product assignments and removes the craft from active public categories.</p>
      {message && <p role="status">{message}</p>}
    </div>
  </details>;
}
