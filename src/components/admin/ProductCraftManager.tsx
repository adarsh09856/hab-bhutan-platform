'use client';
import { useState } from 'react';

type Craft = { key: string; name: string; english: string; description?: string; isActive?: boolean };
export default function ProductCraftManager({ crafts, selected, onSaved }: { crafts: Craft[]; selected: string; onSaved: () => void }) {
  const [form, setForm] = useState<Craft>({ key: '', name: '', english: '', description: '' });
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [archiveTarget, setArchiveTarget] = useState<{ key: string; name: string } | null>(null);

  async function save(archive = false) {
    setBusy(true);
    setMessage('');
    try {
      const target = archive ? archiveTarget : null;
      const response = await fetch('/api/admin/crafts', {
        method: editing || archive ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(archive && target ? { key: target.key, isActive: false } : form),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error('Your Admin session has expired. Sign in again, then retry.');
        if (response.status === 403) {
          const permission = archive || editing ? 'Content → Edit Content' : 'Content → Create Articles & Reports or Edit Content';
          throw new Error(`Your role does not allow this craft action. It requires ${permission}; ask an Admin to update your role.`);
        }
        throw new Error(data.error || 'Could not save craft.');
      }
      setMessage(archive ? 'Craft archived.' : 'Craft saved. Select it from Craft Tradition.');
      setArchiveTarget(null);
      onSaved();
    } catch (error: any) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  return <details className="mt-2 text-sm">
    <summary className="cursor-pointer text-[#8B2E24]">Manage craft traditions here</summary>
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => { setEditing(false); setForm({ key: '', name: '', english: '', description: '' }); setArchiveTarget(null); setMessage(''); }} className="admin-button-secondary px-3 py-2 rounded-lg disabled:opacity-50">New craft</button>
        <button type="button" disabled={busy || !selected} onClick={() => { const craft = crafts.find(c => c.key === selected); if (craft) { setEditing(true); setForm({ ...craft }); setArchiveTarget(null); setMessage(''); } }} className="admin-button-secondary px-3 py-2 rounded-lg disabled:opacity-50">Edit selected craft</button>
      </div>
      {(['key', 'name', 'english', 'description'] as const).map(field => <label key={field} className="block">
        {{ key: 'Craft key', name: 'Craft name', english: 'English name', description: 'Short description' }[field]}
        <input value={form[field] || ''} disabled={busy || (field === 'key' && editing)} onChange={event => setForm({ ...form, [field]: event.target.value })} className="w-full admin-input border rounded-lg px-3 py-2 mt-1" />
      </label>)}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy || !form.key.trim() || !form.name.trim() || !form.english.trim()} onClick={() => save()} className="admin-button-primary px-3 py-2 rounded-lg disabled:opacity-50">{busy ? 'Saving…' : 'Save craft'}</button>
        <button type="button" disabled={busy || !selected} onClick={() => { const craft = crafts.find(c => c.key === selected); if (craft) setArchiveTarget({ key: craft.key, name: craft.name }); }} className="admin-button-secondary px-3 py-2 rounded-lg disabled:opacity-50">Archive selected craft</button>
      </div>
      {archiveTarget && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-950"><p>Archive {archiveTarget.name}? Existing product and maker assignments will remain.</p><button type="button" disabled={busy} onClick={() => save(true)} className="admin-button-secondary px-3 py-2 rounded-lg disabled:opacity-50">{busy ? 'Archiving…' : 'Confirm archive'}</button><button type="button" disabled={busy} onClick={() => setArchiveTarget(null)} className="px-3 py-2 disabled:opacity-50">Cancel</button></div>}
      <p className="admin-muted">Craft create/edit/archive use the Content create/edit permissions. Archiving keeps existing assignments and removes the craft from active public categories.</p>
      {message && <p role="status">{message}</p>}
    </div>
  </details>;
}
