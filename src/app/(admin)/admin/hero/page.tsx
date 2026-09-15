'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FileUploadInput from '@/components/admin/FileUploadInput';

interface Slide {
  id: string;
  imageUrl: string;
  caption: string;
  altText: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_FORM = { imageUrl: '', caption: '', altText: '', linkUrl: '', sortOrder: 0, isActive: true };

export default function HeroSlidesAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/hero-slides', { cache: 'no-store' });
    const d = await r.json();
    setSlides(d.slides || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (s: Slide) => {
    setForm({ imageUrl: s.imageUrl, caption: s.caption, altText: s.altText, linkUrl: s.linkUrl || '', sortOrder: s.sortOrder, isActive: s.isActive });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.imageUrl.trim() || !form.caption.trim()) {
      flash('Please upload a slide photograph and enter a caption.'); return;
    }
    setSaving(true);
    const url = editId ? `/api/admin/hero-slides/${editId}` : '/api/admin/hero-slides';
    const method = editId ? 'PUT' : 'POST';
    const r = await fetch(url, { 
      method, 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        ...form,
        altText: form.altText.trim() || form.caption.trim(),
      }) 
    });
    setSaving(false);
    if (r.ok) {
      flash(editId ? 'Slide updated successfully.' : 'New slide added successfully.');
      setShowForm(false);
      setEditId(null);
      load();
    } else {
      const d = await r.json();
      flash(d.error || 'Save failed.');
    }
  };

  const handleDelete = async (id: string, caption: string) => {
    if (!confirm(`Delete slide "${caption}"?`)) return;
    await fetch(`/api/admin/hero-slides/${id}`, { method: 'DELETE' });
    flash('Slide deleted.');
    load();
  };

  const toggleActive = async (s: Slide) => {
    await fetch(`/api/admin/hero-slides/${s.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    load();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold admin-title">Hero Slides</h1>
          <p className="text-sm admin-muted mt-1">Manage the homepage hero image slider. Active slides auto-advance every 5 seconds.</p>
        </div>
        <button
          onClick={openAdd}
          className="admin-button-primary text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add Slide
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm rounded-lg">
          {msg}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="mb-6 admin-card border admin-border rounded-xl p-5 shadow-crm-sm">
          <h2 className="text-base font-bold admin-title mb-4">{editId ? 'Edit Slide' : 'Add New Slide'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FileUploadInput
                label="Hero Slide Photograph *"
                value={form.imageUrl}
                onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
                accept="image/*"
                hint="Choose an image file from your computer or drag & drop. Recommended resolution: 1920x800px."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold admin-muted uppercase mb-1">Slide Caption *</label>
              <input
                type="text"
                value={form.caption}
                onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                placeholder="Master artisan at the loom · Khoma, Lhuentse"
                className="w-full border admin-input rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold admin-muted uppercase mb-1">Image Description (for screen readers)</label>
              <input
                type="text"
                value={form.altText}
                onChange={e => setForm(f => ({ ...f, altText: e.target.value }))}
                placeholder="Description of the craft or artisan"
                className="w-full border admin-input rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold admin-muted uppercase mb-1">Button Destination Link (optional)</label>
              <input
                type="text"
                value={form.linkUrl}
                onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/shop or /about or https://..."
                className="w-full border admin-input rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold admin-muted uppercase mb-1">Display Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full border admin-input rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
              <p className="text-xs admin-muted mt-1">Lower number = shown first (e.g. 1, 2, 3)</p>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-crm-primary"
              />
              <label htmlFor="isActive" className="text-sm admin-title font-medium">Active (visible on homepage slider)</label>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-button-primary text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : editId ? 'Update Slide' : 'Add Slide'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); }}
              className="border admin-button-secondary text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slides List */}
      {loading ? (
        <div className="text-sm admin-muted py-8 text-center">Loading slides…</div>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 admin-card border admin-border rounded-xl">
          <div className="text-4xl mb-3">🖼️</div>
          <h3 className="text-base font-semibold admin-title mb-1">No slides yet</h3>
          <p className="text-sm admin-muted mb-4">The homepage will show the default artisan image until you add slides.</p>
          <button onClick={openAdd} className="admin-button-primary text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Add First Slide
          </button>
        </div>
      ) : (
        <div className="admin-card border admin-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="admin-panel border-b admin-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold admin-muted uppercase">Preview</th>
                <th className="text-left px-4 py-3 text-xs font-semibold admin-muted uppercase">Caption</th>
                <th className="text-left px-4 py-3 text-xs font-semibold admin-muted uppercase hidden md:table-cell">Link</th>
                <th className="text-center px-4 py-3 text-xs font-semibold admin-muted uppercase">Order</th>
                <th className="text-center px-4 py-3 text-xs font-semibold admin-muted uppercase">Active</th>
                <th className="text-right px-4 py-3 text-xs font-semibold admin-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y admin-divider">
              {slides.map(s => (
                <tr key={s.id} className="admin-hover transition-colors">
                  <td className="px-4 py-3">
                    <img
                      src={s.imageUrl}
                      alt={s.altText}
                      className="w-16 h-12 object-cover rounded-lg border border-crm-border"
                      onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium admin-title">{s.caption}</div>
                    <div className="text-xs admin-muted truncate max-w-[200px]">{s.altText}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {s.linkUrl ? (
                      <span className="text-xs text-sky-300 truncate block max-w-[160px]">{s.linkUrl}</span>
                    ) : (
                      <span className="text-xs admin-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center admin-muted">{s.sortOrder}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(s)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${s.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/15 text-slate-300'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-crm-success' : 'bg-crm-muted'}`} />
                      {s.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-xs text-amber-300 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.caption)}
                        className="text-xs text-rose-300 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 p-3 bg-sky-500/15 border border-sky-500/30 rounded-lg text-xs text-sky-300">
        <strong>How to add images:</strong> Upload your image files to <code className="admin-panel px-1 rounded">/www/wwwroot/default/hab-bhutan-platform/public/images/hero/</code> on the server, then enter the path as <code className="admin-panel px-1 rounded">/images/hero/yourfile.jpg</code> in the Image URL field.
      </div>
    </div>
  );
}