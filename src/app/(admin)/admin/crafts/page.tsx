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
  technique?: string | null;
  materials?: string | null;
  practisedIn?: string | null;
  history?: string | null;
  shopNote?: string | null;
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
    fetch('/api/admin/crafts', { credentials: 'include', cache: 'no-store' })
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

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading Zorig Chusum crafts...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">13 Zorig Chusum Traditional Crafts CMS</h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage classical Dzongkha names, English translations, cultural descriptions, banner imagery, and display order for Bhutan’s 13 traditional arts.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-semibold border shadow-sm ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#8b2e24]" />
                Edit {editing.name} ({editing.english})
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Romanized Dzongkha Name</label>
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#8b2e24] shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">English Translation</label>
                  <input
                    type="text"
                    value={editing.english}
                    onChange={(e) => setEditing({ ...editing, english: e.target.value })}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#8b2e24] shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dzongkha Script (Uchen)</label>
                  <input
                    type="text"
                    value={editing.dzongkha || ''}
                    onChange={(e) => setEditing({ ...editing, dzongkha: e.target.value })}
                    placeholder="ཐག་བཟོ།"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#8b2e24] shadow-sm font-serif"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editing.sortOrder}
                    onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#8b2e24] shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cultural Description &amp; Scope</label>
                <textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#8b2e24] shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Traditional Technique</label>
                  <input
                    type="text"
                    value={editing.technique || ''}
                    onChange={(e) => setEditing({ ...editing, technique: e.target.value })}
                    placeholder="e.g. Backstrap and pedal looms"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#8b2e24] shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Materials</label>
                  <input
                    type="text"
                    value={editing.materials || ''}
                    onChange={(e) => setEditing({ ...editing, materials: e.target.value })}
                    placeholder="e.g. Silk, wool, cotton, nettle"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#8b2e24] shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Practised In</label>
                  <input
                    type="text"
                    value={editing.practisedIn || ''}
                    onChange={(e) => setEditing({ ...editing, practisedIn: e.target.value })}
                    placeholder="e.g. Lhuentse, Trashigang"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#8b2e24] shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Historical Origins &amp; Heritage Narrative</label>
                <textarea
                  rows={4}
                  value={editing.history || ''}
                  onChange={(e) => setEditing({ ...editing, history: e.target.value })}
                  placeholder="Historical background of this craft in Bhutan..."
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#8b2e24] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Commission / Shop Note</label>
                <input
                  type="text"
                  value={editing.shopNote || ''}
                  onChange={(e) => setEditing({ ...editing, shopNote: e.target.value })}
                  placeholder="Custom note shown if not sold online directly"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#8b2e24] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hero / Banner Image URL</label>
                <input
                  type="text"
                  value={editing.bannerUrl || ''}
                  onChange={(e) => setEditing({ ...editing, bannerUrl: e.target.value })}
                  placeholder="/images/crafts/thagzo.jpg"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#8b2e24] shadow-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={editing.isActive}
                  onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#8b2e24] rounded border-slate-300 focus:ring-0"
                />
                <label htmlFor="activeCheck" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Active in public craft navigation &amp; catalog filters
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 admin-button-primary font-semibold rounded-lg disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-sm text-xs"
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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
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
          <tbody className="divide-y divide-slate-100 bg-white">
            {crafts.map((c) => (
              <tr key={c.key} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 font-semibold text-slate-900">
                  {c.name} <span className="text-xs text-slate-500 font-normal">({c.english})</span>
                </td>
                <td className="px-5 py-4 font-serif text-base text-amber-800 font-medium">
                  {c.dzongkha || '—'}
                </td>
                <td className="px-5 py-4 text-xs text-slate-600 max-w-xs truncate">
                  {c.description}
                </td>
                <td className="px-5 py-4 text-center font-mono text-xs text-slate-900 font-semibold">
                  {c._count?.products ?? 0}
                </td>
                <td className="px-5 py-4 text-center font-mono text-xs text-slate-900 font-semibold">
                  {c._count?.members ?? 0}
                </td>
                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      c.isActive
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#8b2e24]" />
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