'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter,
  Download,
  BookOpen
} from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';

interface Publication {
  id: string;
  title: string;
  kind: string;
  year: number;
  metaDetails?: string | null;
  fileUrl?: string | null;
  isFeatured: boolean;
}

const CATEGORIES = [
  'Latest · Annual reports',
  'Annual reports',
  'Strategy',
  'Sector study',
  'Audited accounts',
  'Policy brief',
  'Guideline',
  'Case study',
];

export default function PublicationsStudio() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    kind: 'Annual reports',
    year: new Date().getFullYear(),
    metaDetails: 'PDF · Document',
    fileUrl: '',
    isFeatured: false,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadPublications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/publications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPublications(data.publications || []);
      }
    } catch {
      showToast('error', 'Failed to load publications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({
      title: '',
      kind: 'Annual reports',
      year: new Date().getFullYear(),
      metaDetails: 'PDF · Document',
      fileUrl: '',
      isFeatured: false,
    });
    setFormOpen(true);
  };

  const openEdit = (p: Publication) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      kind: p.kind || 'Annual reports',
      year: p.year || new Date().getFullYear(),
      metaDetails: p.metaDetails || 'PDF · Document',
      fileUrl: p.fileUrl || '',
      isFeatured: Boolean(p.isFeatured),
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('error', 'Please enter a publication title.');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/publications';
      const method = editingId ? 'PUT' : 'POST';
      const payload = editingId ? { ...form, id: editingId } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', editingId ? 'Publication updated!' : 'New publication added!');
        setFormOpen(false);
        setEditingId(null);
        loadPublications();
      } else {
        showToast('error', data.error || 'Failed to save publication.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error saving publication.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete publication "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/publications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Publication deleted successfully.');
        setPublications(publications.filter((p) => p.id !== id));
      } else {
        showToast('error', 'Failed to delete publication.');
      }
    } catch {
      showToast('error', 'Error deleting publication.');
    }
  };

  const filtered = publications.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.kind === selectedCategory;
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.kind && p.kind.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border text-sm animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>WordPress-Style Publications Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Reports &amp; Publications Studio (Image 1 Fix)
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Manage sector impact reports, audited financial statements, strategic five-year plans, and research documents. Drag &amp; drop PDFs directly from your computer up to 30MB.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/publications"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
          >
            <span>View Public Portal</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Report / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-[#8B2E24] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({publications.length})
          </button>
          {CATEGORIES.slice(0, 4).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#8B2E24] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Modal / Form */}
      {formOpen && (
        <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 shadow-md space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Publication / Report' : 'Upload New Report / PDF'}
            </h3>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Publication Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. HAB Annual Craft Sector Impact Report 7582"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Document Category *
                </label>
                <select
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Publication Year *
                </label>
                <input
                  type="number"
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) || 2026 })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Format / Meta Note
              </label>
              <input
                type="text"
                value={form.metaDetails}
                onChange={(e) => setForm({ ...form, metaDetails: e.target.value })}
                placeholder="e.g. PDF · Document · 4.2 MB · English & Dzongkha"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
              />
            </div>

            <div>
              <FileUploadInput
                label="Attached Document File (PDF, DOC, DOCX up to 30MB)"
                value={form.fileUrl}
                onChange={(url) => setForm({ ...form, fileUrl: url })}
                accept="application/pdf,.doc,.docx,.xls,.xlsx,.csv,text/plain"
                hint="Drag and drop or choose from your computer. Files are stored securely on the server."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="pubFeatured"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 accent-[#8B2E24] rounded-sm"
              />
              <label htmlFor="pubFeatured" className="text-xs font-bold text-slate-800 cursor-pointer">
                Featured Document (Highlighted in top publications band)
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingId ? 'Save Updates' : 'Publish Report'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Publications Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <th className="p-4 pl-5">Document Title</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-center">Year</th>
              <th className="p-4">Attached File</th>
              <th className="p-4 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-mono">
                  Loading publications from database...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No publications match your search or filter. Click &ldquo;Upload New Report / PDF&rdquo; to add one.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-5">
                    <div className="font-semibold text-slate-900 text-sm">{p.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {p.metaDetails || 'PDF · Document'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      {p.kind}
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-slate-700">
                    {p.year}
                  </td>
                  <td className="p-4">
                    {p.fileUrl ? (
                      <a
                        href={p.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-700" />
                        <span>Download PDF ↓</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No file attached</span>
                    )}
                  </td>
                  <td className="p-4 pr-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="p-2 rounded-lg text-slate-500 hover:text-[#8B2E24] hover:bg-slate-100 transition-colors"
                        title="Edit publication"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete publication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
