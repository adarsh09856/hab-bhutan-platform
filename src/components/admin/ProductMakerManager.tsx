'use client';
import { useState } from 'react';

type Maker = { id: string; name: string; craftKey: string; dzongkhag: string; cidNumber?: string; bio?: string; status?: string };
type Craft = { key: string; name: string; isActive?: boolean };
const empty = { name: '', craftKey: '', dzongkhag: '', cidNumber: '', bio: '' };

export default function ProductMakerManager({ members, crafts, onSaved }: { members: Maker[]; crafts: Craft[]; onSaved: () => void }) {
  const activeCrafts = crafts.filter(craft => craft.isActive !== false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save(action: 'save' | 'delete' | 'suspend') {
    setBusy(true); setMessage('');
    try {
      const payload: Record<string, unknown> = action === 'delete'
        ? { id: editingId }
        : action === 'suspend'
          ? { id: editingId, status: 'SUSPENDED' }
          : { ...form, ...(editingId ? { id: editingId } : {}) };
      // CID is required when creating a member, but legacy maker records may not
      // have one. Do not turn an untouched blank field into an invalid update.
      if (action === 'save' && editingId && !form.cidNumber.trim()) delete payload.cidNumber;
      const response = await fetch('/api/admin/members', {
        method: action === 'delete' ? 'DELETE' : action === 'suspend' || editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error('Your Admin session has expired. Sign in again, then retry.');
        if (response.status === 403) {
          const permission = action === 'delete' ? 'Members → Delete Member' : action === 'suspend' ? 'Members → Suspend Member' : editingId ? 'Members → Edit Member Profile' : 'Members → Register Member';
          throw new Error(`Your role does not allow this maker action. It requires ${permission}; ask an Admin to update your role.`);
        }
        throw new Error(data.error || 'Could not save maker.');
      }
      setConfirmDelete(false);
      const savedStatus = String(data.member?.status || '').toUpperCase();
      setMessage(action === 'delete'
        ? 'Maker deleted.'
        : action === 'suspend'
          ? 'Maker suspended. Existing product assignments are preserved.'
          : !editingId && savedStatus === 'PENDING'
            ? 'Maker saved as pending. Verify the member in Members before assigning them to a product.'
            : 'Maker details saved.');
      if (action === 'delete') { setEditingId(''); setForm(empty); }
      else if (data.member) setEditingId(data.member.id);
      onSaved();
    } catch (error: any) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  return <details className="mt-2 text-sm">
    <summary className="cursor-pointer text-[#8B2E24]">Manage makers here</summary>
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} className="admin-button-secondary px-3 py-2 rounded-lg" onClick={() => { setEditingId(''); setForm({ ...empty, craftKey: activeCrafts[0]?.key || '' }); setMessage(''); setConfirmDelete(false); }}>New maker</button>
      </div>
      <label className="block">Manage an existing member<select value={editingId} onChange={event => {
        const id = event.target.value;
        const maker = members.find(member => member.id === id);
        setEditingId(id);
        setForm(maker ? { name: maker.name, craftKey: maker.craftKey, dzongkhag: maker.dzongkhag, cidNumber: maker.cidNumber || '', bio: maker.bio || '' } : { ...empty, craftKey: activeCrafts[0]?.key || '' });
        setMessage('');
        setConfirmDelete(false);
      }} className="w-full admin-input border rounded-lg px-3 py-2 mt-1"><option value="">Choose a member to edit or manage</option>{members.map(maker => <option key={maker.id} value={maker.id}>{maker.name} · {maker.status || 'status unknown'}</option>)}</select></label>
      <label className="block">Full name<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className="w-full admin-input border rounded-lg px-3 py-2 mt-1" /></label>
      <label className="block">Craft tradition<select value={form.craftKey} onChange={event => setForm({ ...form, craftKey: event.target.value })} className="w-full admin-input border rounded-lg px-3 py-2 mt-1"><option value="">Choose craft</option>{activeCrafts.map(craft => <option key={craft.key} value={craft.key}>{craft.name}</option>)}{editingId && form.craftKey && !activeCrafts.some(craft => craft.key === form.craftKey) && <option value={form.craftKey} disabled>{crafts.find(craft => craft.key === form.craftKey)?.name || form.craftKey} (archived · existing maker)</option>}</select></label>
      <label className="block">Dzongkhag<input value={form.dzongkhag} onChange={event => setForm({ ...form, dzongkhag: event.target.value })} className="w-full admin-input border rounded-lg px-3 py-2 mt-1" /></label>
      <label className="block">CID number (private, 11 digits{editingId ? '; leave blank to keep the saved value' : ' · required for a new member'})<input inputMode="numeric" maxLength={11} value={form.cidNumber} onChange={event => setForm({ ...form, cidNumber: event.target.value.replace(/\D/g, '') })} className="w-full admin-input border rounded-lg px-3 py-2 mt-1" /></label>
      <label className="block">About the maker<textarea value={form.bio} onChange={event => setForm({ ...form, bio: event.target.value })} className="w-full admin-input border rounded-lg px-3 py-2 mt-1" /></label>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy || !form.name.trim() || !form.craftKey || !form.dzongkhag.trim() || (editingId ? Boolean(form.cidNumber) && form.cidNumber.length !== 11 : form.cidNumber.length !== 11)} onClick={() => save('save')} className="admin-button-primary px-3 py-2 rounded-lg disabled:opacity-50">{busy ? 'Saving…' : 'Save maker'}</button>
        {editingId && <><button type="button" disabled={busy} onClick={() => save('suspend')} className="admin-button-secondary px-3 py-2 rounded-lg">Suspend maker</button><button type="button" disabled={busy} onClick={() => setConfirmDelete(true)} className="admin-button-secondary px-3 py-2 rounded-lg">Delete maker…</button></>}
      </div>
      {confirmDelete && <div role="alert"><p>Delete this maker permanently? Makers linked to products or orders cannot be deleted.</p><button type="button" disabled={busy} onClick={() => save('delete')} className="admin-button-secondary px-3 py-2 rounded-lg">Confirm deletion</button><button type="button" disabled={busy} onClick={() => setConfirmDelete(false)} className="px-3 py-2">Cancel</button></div>}
      <p className="admin-muted">New makers are created as pending Members and need verification in Members. Maker create/edit/suspend/delete use the corresponding Members permissions; product access alone does not grant them. Existing product and order links prevent permanent deletion.</p>
      {message && <p role="status">{message}</p>}
    </div>
  </details>;
}
