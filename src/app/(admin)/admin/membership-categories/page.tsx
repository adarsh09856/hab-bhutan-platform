'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, CheckCircle, XCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';

interface CategoryItem {
  id: string;
  key: string;
  name: string;
  shortName?: string | null;
  duesBTN: number;
  duesUSD: number;
  description: string;
  bannerImageUrl?: string;
  eligibility?: string[] | null;
  benefits?: string[] | null;
  documents?: any;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_CAT: Omit<CategoryItem, 'id'> = {
  key: '',
  name: '',
  shortName: '',
  duesBTN: 1200,
  duesUSD: 15,
  description: '',
  bannerImageUrl: '',
  eligibility: [],
  benefits: [],
  documents: null,
  isActive: true,
  sortOrder: 0,
};

export default function AdminMembershipCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_CAT);
  const [eligibilityText, setEligibilityText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/membership-categories', { cache: 'no-store' });
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch {
      showFlash('error', 'Failed to load membership tiers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const showFlash = (type: 'success' | 'error', text: string) => {
    setFlashMsg({ type, text });
    setTimeout(() => setFlashMsg(null), 4000);
  };

  const openCreate = () => {
    setForm(EMPTY_CAT);
    setEligibilityText('');
    setBenefitsText('');
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (cat: CategoryItem) => {
    const bannerUrl = (typeof cat.documents === 'object' && cat.documents?.bannerImageUrl)
      ? cat.documents.bannerImageUrl
      : (typeof cat.documents === 'string' && cat.documents.startsWith('/') ? cat.documents : '');

    setForm({
      key: cat.key,
      name: cat.name,
      shortName: cat.shortName || '',
      duesBTN: cat.duesBTN,
      duesUSD: cat.duesUSD,
      description: cat.description,
      bannerImageUrl: cat.bannerImageUrl || bannerUrl || '',
      eligibility: cat.eligibility || [],
      benefits: cat.benefits || [],
      documents: cat.documents || null,
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
    });
    setEligibilityText(Array.isArray(cat.eligibility) ? cat.eligibility.join('\n') : '');
    setBenefitsText(Array.isArray(cat.benefits) ? cat.benefits.join('\n') : '');
    setEditId(cat.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key.trim() || !form.name.trim() || !form.description.trim()) {
      showFlash('error', 'Key, name, and description are required.');
      return;
    }

    const eligibility = eligibilityText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const benefits = benefitsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const documentsObj = typeof form.documents === 'object' && form.documents !== null
      ? { ...form.documents, bannerImageUrl: form.bannerImageUrl }
      : { bannerImageUrl: form.bannerImageUrl };

    setSaving(true);
    try {
      const url = '/api/admin/membership-categories';
      const method = editId ? 'PUT' : 'POST';
      const payload = {
        ...(editId ? { id: editId } : {}),
        ...form,
        documents: documentsObj,
        eligibility,
        benefits,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        showFlash('error', 'Your session has expired. Please open /admin/login in a new tab to re-authenticate, then click Save again.');
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', editId ? 'Tier updated successfully.' : 'Tier created successfully.');
        if (data.category) {
          setCategories((prev) => editId ? prev.map((c) => c.id === data.category.id ? { ...c, ...data.category } : c) : [data.category, ...prev]);
        }
        setShowModal(false);
        loadCategories();
      } else {
        showFlash('error', data.error || 'Failed to save tier.');
      }
    } catch (err: any) {
      showFlash('error', err.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete membership category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/membership-categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFlash('success', `Deleted "${name}".`);
        loadCategories();
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
            <Users className="w-6 h-6 text-crm-primary" />
            Membership Tiers & Categories CMS
          </h1>
          <p className="text-sm admin-muted mt-1">
            Configure membership categories, annual dues in Nu and USD, eligibility criteria, and member benefits.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="admin-button-primary px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Membership Tier
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

      {/* Tiers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 p-12 text-center admin-muted">Loading membership tiers...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-2 p-12 text-center admin-muted">No membership tiers configured.</div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="admin-card rounded-xl border admin-border p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-800 border border-slate-200">
                        {cat.key}
                      </span>
                      {cat.isActive ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200">
                          Disabled
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold admin-title mt-1.5">{cat.name}</h3>
                    {cat.shortName && (
                      <p className="text-xs admin-muted font-medium">{cat.shortName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded hover:bg-white/10 text-amber-400 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border admin-border flex items-center justify-between">
                  <div>
                    <span className="text-xs admin-muted uppercase tracking-wider block">Annual Dues</span>
                    <span className="text-base font-bold admin-title text-slate-800">
                      Nu. {cat.duesBTN.toLocaleString()} / year
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs admin-muted uppercase tracking-wider block">USD Equiv</span>
                    <span className="text-sm font-semibold admin-text">${cat.duesUSD} USD</span>
                  </div>
                </div>

                <p className="text-sm admin-text line-clamp-3">{cat.description}</p>

                {Array.isArray(cat.benefits) && cat.benefits.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-semibold admin-muted uppercase tracking-wider block mb-1">
                      Key Benefits ({cat.benefits.length})
                    </span>
                    <ul className="text-xs admin-text space-y-1">
                      {cat.benefits.slice(0, 3).map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{b}</span>
                        </li>
                      ))}
                      {cat.benefits.length > 3 && (
                        <li className="text-xs admin-muted italic">+{cat.benefits.length - 3} more benefits</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t admin-border text-xs admin-muted font-mono">
                Sort Order: {cat.sortOrder}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Sticky Header */}
            <div className="flex-shrink-0 px-6 py-4.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {editId ? 'Edit Membership Category' : 'Add Membership Category'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure membership tiers, annual dues, benefits, and category visual banner.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {flashMsg?.type === 'error' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Unable to save category</p>
                      <p className="mt-0.5">{flashMsg.text}</p>
                      {(flashMsg.text.toLowerCase().includes('session') || flashMsg.text.toLowerCase().includes('unauthorized') || flashMsg.text.includes('401')) && (
                        <a href="/admin/login" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 underline font-bold text-rose-800">
                          Open /admin/login in a new tab to log in &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category Key *</label>
                    <input
                      type="text"
                      value={form.key}
                      onChange={(e) => setForm({ ...form, key: e.target.value })}
                      placeholder="individual-artisan"
                      disabled={!!editId}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#8B2E24]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Individual Artisan"
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#8B2E24]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Annual Dues (BTN) *</label>
                    <input
                      type="number"
                      value={form.duesBTN}
                      onChange={(e) => setForm({ ...form, duesBTN: Number(e.target.value) || 0 })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#8B2E24]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Annual Dues (USD) *</label>
                    <input
                      type="number"
                      value={form.duesUSD}
                      onChange={(e) => setForm({ ...form, duesUSD: Number(e.target.value) || 0 })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#8B2E24]"
                    />
                  </div>
                </div>

                {/* Inline Category Banner Image Upload */}
                <div className="pt-1">
                  <FileUploadInput
                    label="Category Hero Banner Photograph"
                    value={form.bannerImageUrl || ''}
                    onChange={(url) => setForm({ ...form, bannerImageUrl: url })}
                    accept="image/*"
                    hint="Upload banner photograph for public category page (e.g. Taktsang / Khoma artisan)."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="The core membership of the association for practicing artisans..."
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Eligibility Criteria (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={eligibilityText}
                    onChange={(e) => setEligibilityText(e.target.value)}
                    placeholder="Bhutanese citizen holding valid CID&#10;Practising one of 13 crafts&#10;No business license required"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Member Benefits (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={benefitsText}
                    onChange={(e) => setBenefitsText(e.target.value)}
                    placeholder="Listing in public directory&#10;Preferential access to skills training&#10;Consignment to central shop"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#8B2E24]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-[#8B2E24]"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="isActiveCat"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 accent-[#8B2E24] rounded"
                    />
                    <label htmlFor="isActiveCat" className="text-xs text-slate-800 font-medium">
                      Active (visible on /membership)
                    </label>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs rounded-lg bg-[#8B2E24] hover:bg-[#73241c] text-white font-semibold transition-colors disabled:opacity-50 shadow-xs"
                >
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
