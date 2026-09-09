'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Palette, Edit2, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface Craft {
  id: string;
  key: string;
  name: string;
  english: string;
  dzongkha?: string | null;
  description: string;
  bannerUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number; members: number };
}

export default function AdminCraftsPage() {
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Craft | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadCrafts = () => {
    fetch('/api/admin/crafts', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.crafts) setCrafts(d.crafts);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCrafts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/crafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: `${editing.name} (${editing.english}) updated successfully!` });
        setEditing(null);
        loadCrafts();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Update failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error saving craft' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm admin-muted">Loading Zorig Chusum crafts...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b admin-border pb-5">
        <h1 className="text-2xl font-bold admin-title tracking-tight">13 Zorig Chusum Traditional Crafts CMS</h1>
        <p className="text-sm admin-muted mt-1">
          Manage classical Dzongkha names, English translations, cultural descriptions, banner imagery, and display order for Bhutan’s 13 traditional arts.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
            feedback.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <AlertCircle className="w-5 h-5 text-rose-300" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="admin-modal rounded-2xl max-w-2xl w-full p-6 shadow-xl border admin-border space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <h2 className="text-lg font-bold admin-title flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-300" />
                Edit {editing.name} ({editing.english})
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-slate-400 hover:admin-text font-bold text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Romanized Dzongkha Name</label>
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full px-3 py-2 admin-input border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">English Translation</label>
                  <input
                    type="text"
                    value={editing.english}
                    onChange={(e) => setEditing({ ...editing, english: e.target.value })}
                    className="w-full px-3 py-2 admin-input border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Dzongkha Script (Uchen)</label>
                  <input
                    type="text"
                    value={editing.dzongkha || ''}
                    onChange={(e) => setEditing({ ...editing, dzongkha: e.target.value })}
                    placeholder="ཐག་བཟོ།"
                    className="w-full px-3 py-2 admin-input border rounded-lg font-serif"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editing.sortOrder}
                    onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 admin-input border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold admin-text mb-1">Cultural Description &amp; Scope</label>
                <textarea
                  rows={4}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2 admin-input border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold admin-text mb-1">Hero / Banner Image URL</label>
                <input
                  type="text"
                  value={editing.bannerUrl || ''}
                  onChange={(e) => setEditing({ ...editing, bannerUrl: e.target.value })}
                  placeholder="/images/crafts/thagzo.jpg"
                  className="w-full px-3 py-2 admin-input border rounded-lg"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={editing.isActive}
                  onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#8B2E24] rounded"
                />
                <label htmlFor="activeCheck" className="text-sm admin-text">
                  Active in public craft navigation &amp; catalog filters
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border admin-border rounded-lg admin-text admin-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 admin-button-primary font-semibold rounded-lg disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crafts Table */}
      <div className="admin-card border admin-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="admin-panel border-b admin-border text-xs font-bold admin-text uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Craft</th>
              <th className="px-5 py-3.5">Dzongkha</th>
              <th className="px-5 py-3.5">Description</th>
              <th className="px-5 py-3.5 text-center">Catalog</th>
              <th className="px-5 py-3.5 text-center">Artisans</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y admin-divider">
            {crafts.map((c) => (
              <tr key={c.key} className="admin-hover transition-colors">
                <td className="px-5 py-4 font-semibold admin-title">
                  {c.name} <span className="text-xs admin-muted font-normal">({c.english})</span>
                </td>
                <td className="px-5 py-4 font-serif text-base admin-text">
                  {c.dzongkha || '—'}
                </td>
                <td className="px-5 py-4 text-xs admin-text max-w-xs truncate">
                  {c.description}
                </td>
                <td className="px-5 py-4 text-center font-mono text-xs">
                  {c._count?.products ?? 0}
                </td>
                <td className="px-5 py-4 text-center font-mono text-xs">
                  {c._count?.members ?? 0}
                </td>
                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                      c.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/15 text-slate-400'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border admin-border rounded-lg text-xs font-semibold admin-button-secondary cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}