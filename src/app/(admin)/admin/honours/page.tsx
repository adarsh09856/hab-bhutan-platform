'use client';

import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface HonourItem {
  id: string;
  name: string;
  craft: string;
  dzongkhag: string;
  awardType: string;
  yearAwarded: number;
  citation: string;
  portraitUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_HONOUR: Omit<HonourItem, 'id'> = {
  name: '',
  craft: 'thagzo',
  dzongkhag: 'Thimphu',
  awardType: 'RoyalSeal',
  yearAwarded: new Date().getFullYear(),
  citation: '',
  portraitUrl: '',
  isActive: true,
  sortOrder: 0,
};

const AWARD_TYPES = [
  { value: 'RoyalSeal', label: 'Royal Seal of Excellence' },
  { value: 'NationalMaster', label: 'National Master Craftsperson' },
  { value: 'Authenticity', label: 'Seal of Authenticity' },
];

export default function AdminHonoursPage() {
  const [honours, setHonours] = useState<HonourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_HONOUR);
  const [saving, setSaving] = useState(false);
  const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadHonours = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/honours');
      const data = await res.json();
      if (data.honours) setHonours(data.honours);
    } catch {
      showFlash('error', 'Failed to load master honours.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHonours();
  }, []);

  const showFlash = (type: 'success' | 'error', text: string) => {
    setFlashMsg({ type, text });
    setTimeout(() => setFlashMsg(null), 4000);
  };

  const openCreate = () => {
    setForm(EMPTY_HONOUR);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (h: HonourItem) => {
    setForm({
      name: h.name,
      craft: h.craft,
      dzongkhag: h.dzongkhag,
      awardType: h.awardType,
      yearAwarded: h.yearAwarded,
      citation: h.citation,
      portraitUrl: h.portraitUrl || '',
      isActive: h.isActive,
      sortOrder: h.sortOrder,
    });
    setEditId(h.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.citation.trim()) {
      showFlash('error', 'Name and citation are required.');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/honours';
      const method = editId ? 'PUT' : 'POST';
      const payload = editId ? { id: editId, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', editId ? 'Honour record updated.' : 'Honour record created.');
        setShowModal(false);
        loadHonours();
      } else {
        showFlash('error', data.error || 'Failed to save.');
      }
    } catch (err: any) {
      showFlash('error', err.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete honour record for "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/honours?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFlash('success', `Deleted honour record for "${name}".`);
        loadHonours();
      } else {
        const data = await res.json();
        showFlash('error', data.error || 'Failed to delete.');
      }
    } catch {
      showFlash('error', 'Network error.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold admin-title flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Master Artisans & Honours CMS
          </h1>
          <p className="text-sm admin-muted mt-1">
            Recognize and document national living treasures, royal seals of excellence, and master citations.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="admin-button-primary px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Master Honour
        </button>
      </div>

      {/* Flash Notice */}
      {flashMsg && (
        <div
          className={`p-4 rounded-lg text-sm border flex items-center gap-2 ${
            flashMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {flashMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {flashMsg.text}
        </div>
      )}

      {/* Honours Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center admin-muted">Loading master honours...</div>
        ) : honours.length === 0 ? (
          <div className="col-span-full p-12 text-center admin-muted">No honour records found.</div>
        ) : (
          honours.map((h) => (
            <div key={h.id} className="admin-card rounded-xl border admin-border p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      {h.awardType} · {h.yearAwarded}
                    </span>
                    <h3 className="text-lg font-bold admin-title mt-1.5">{h.name}</h3>
                    <p className="text-xs admin-muted">
                      {h.craft} · {h.dzongkhag}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(h)}
                      className="p-1.5 rounded hover:bg-white/10 text-amber-400 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(h.id, h.name)}
                      className="p-1.5 rounded hover:bg-white/10 text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm admin-text line-clamp-4">{h.citation}</p>
              </div>

              <div className="pt-3 border-t admin-border flex items-center justify-between text-xs">
                <span className="admin-muted font-mono">Sort: {h.sortOrder}</span>
                {h.isActive ? (
                  <span className="text-emerald-400">● Visible</span>
                ) : (
                  <span className="text-slate-400">○ Hidden</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="admin-card w-full max-w-lg rounded-2xl border admin-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b admin-border pb-3">
              <h2 className="text-lg font-bold admin-title">
                {editId ? 'Edit Honour Record' : 'Add Master Honour'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="admin-muted hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">Master Artisan Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ap Sonam Dorji"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Craft Discipline *</label>
                  <input
                    type="text"
                    value={form.craft}
                    onChange={(e) => setForm({ ...form, craft: e.target.value })}
                    placeholder="thagzo, shingzo, troezo..."
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Dzongkhag *</label>
                  <input
                    type="text"
                    value={form.dzongkhag}
                    onChange={(e) => setForm({ ...form, dzongkhag: e.target.value })}
                    placeholder="Lhuentse, Paro, Thimphu..."
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Award Type *</label>
                  <select
                    value={form.awardType}
                    onChange={(e) => setForm({ ...form, awardType: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  >
                    {AWARD_TYPES.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Year Awarded *</label>
                  <input
                    type="number"
                    value={form.yearAwarded}
                    onChange={(e) => setForm({ ...form, yearAwarded: Number(e.target.value) || 2026 })}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">Citation / Bio *</label>
                <textarea
                  rows={4}
                  value={form.citation}
                  onChange={(e) => setForm({ ...form, citation: e.target.value })}
                  placeholder="Fifty-one years at the backstrap loom, and teacher to eleven weavers..."
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isActiveHonour"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <label htmlFor="isActiveHonour" className="text-sm admin-title font-medium">
                    Active (visible on /masters)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg admin-button-secondary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm rounded-lg admin-button-primary font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Honour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
