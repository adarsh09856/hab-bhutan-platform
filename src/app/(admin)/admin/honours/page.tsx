'use client';

export const dynamic = 'force-dynamic';

import React, { useCallback, useState, useEffect } from 'react';
import { Award, Plus, Edit2, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { CRAFTS } from '@/lib/data';
import { CLIENT_DATA } from '@/lib/client-data';

interface HonourItem {
  id: string;
  name: string;
  craft: string;
  dzongkhag: string;
  awardType: string;
  yearAwarded: number;
  citation: string;
  citationDz?: string | null;
  portraitUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  title?: string;
  practisingSince?: number | null;
  shortDescription?: string | null;
  story?: string | null;
  workPhotos?: string[];
  showHome?: boolean;
  makerRegistrationNumber?: string;
  makerMember?: { regNumber: string } | null;
}

const EMPTY_HONOUR: Omit<HonourItem, 'id'> = {
  name: '',
  craft: 'thagzo',
  dzongkhag: 'Thimphu',
  awardType: 'RoyalSeal',
  yearAwarded: new Date().getFullYear(),
  citation: '',
  citationDz: '',
  portraitUrl: '',
  isActive: true,
  sortOrder: 0,
  title: '',
  practisingSince: null,
  shortDescription: '',
  story: '',
  workPhotos: [],
  showHome: false,
  makerRegistrationNumber: '',
};

const AWARD_TYPES = [
  { value: 'RoyalSeal', label: 'Master Craftsperson' },
  { value: 'NationalMaster', label: 'National Craft Award' },
  { value: 'Authenticity', label: 'Seal of Authenticity' },
  { value: 'Enterprise of the Year', label: 'Enterprise of the Year' },
  { value: 'Young Artisan Award', label: 'Young Artisan Award' },
];
const TITLE_OPTIONS = ['Aum', 'Ap', 'Lopen', 'Dasho'];
const DEFAULT_MASTER_CAROUSEL_PHOTOS = [
  '/assets/photos/hero-1-weaving.jpg',
  '/assets/photos/hero-4-textiles.jpg',
  '/assets/photos/hero-5-desho.jpg',
  '/assets/photos/hero-3-clay.jpg',
  '/assets/photos/hero-2-punakha.jpg',
];
type AwardCategoryContent = { key: string; title: string; description: string; criteria: string };
type MastersAwardsContent = { categories: AwardCategoryContent[]; carouselPhotos: string[] };
const DEFAULT_MASTERS_AWARDS: MastersAwardsContent = {
  categories: CLIENT_DATA.honours.map((item) => ({
    key: item.key,
    title: item.short,
    description: item.what,
    criteria: item.criteria,
  })),
  carouselPhotos: DEFAULT_MASTER_CAROUSEL_PHOTOS,
};

export default function AdminHonoursPage() {
  const [honours, setHonours] = useState<HonourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_HONOUR);
  const [saving, setSaving] = useState(false);
  const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mastersAwards, setMastersAwards] = useState<MastersAwardsContent>(DEFAULT_MASTERS_AWARDS);
  const [loadingMastersAwards, setLoadingMastersAwards] = useState(true);
  const [savingMastersAwards, setSavingMastersAwards] = useState(false);

  const showFlash = useCallback((type: 'success' | 'error', text: string) => {
    setFlashMsg({ type, text });
    setTimeout(() => setFlashMsg(null), 4000);
  }, []);

  const loadHonours = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/honours', { cache: 'no-store' });
      const data = await res.json();
      if (data.honours) setHonours(data.honours);
    } catch {
      showFlash('error', 'Failed to load master honours.');
    } finally {
      setLoading(false);
    }
  }, [showFlash]);

  useEffect(() => {
    void loadHonours();
  }, [loadHonours]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/site-settings', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Could not load Awards page content.');
        return data.setting?.mastersAwards;
      })
      .then((saved) => {
        if (!mounted || !saved) return;
        const savedCategories = Array.isArray(saved.categories) ? saved.categories : [];
        setMastersAwards({
          categories: DEFAULT_MASTERS_AWARDS.categories.map((fallback) => {
            const stored = savedCategories.find((item: AwardCategoryContent) => item?.key === fallback.key);
            return stored ? {
              ...fallback,
              title: typeof stored.title === 'string' ? stored.title : fallback.title,
              description: typeof stored.description === 'string' ? stored.description : fallback.description,
              criteria: typeof stored.criteria === 'string' ? stored.criteria : fallback.criteria,
            } : fallback;
          }),
          carouselPhotos: DEFAULT_MASTER_CAROUSEL_PHOTOS.map((fallback, index) => {
            const photo = Array.isArray(saved.carouselPhotos) ? saved.carouselPhotos[index] : null;
            return typeof photo === 'string' ? (photo || fallback) : fallback;
          }),
        });
      })
      .catch((error) => {
        if (mounted) showFlash('error', error.message || 'Could not load Awards page content.');
      })
      .finally(() => { if (mounted) setLoadingMastersAwards(false); });
    return () => { mounted = false; };
  }, [showFlash]);

  const handleSaveMastersAwards = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingMastersAwards(true);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mastersAwards }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not save Awards page content.');
      showFlash('success', 'Awards page descriptions, criteria and carousel photos saved.');
    } catch (error: any) {
      showFlash('error', error.message || 'Could not save Awards page content.');
    } finally {
      setSavingMastersAwards(false);
    }
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
      citationDz: h.citationDz || '',
      portraitUrl: h.portraitUrl || '',
      isActive: h.isActive,
      sortOrder: h.sortOrder,
      title: h.title || '',
      practisingSince: h.practisingSince || null,
      shortDescription: h.shortDescription || '',
      story: h.story || '',
      workPhotos: h.workPhotos || [],
      showHome: h.showHome || false,
      makerRegistrationNumber: h.makerMember?.regNumber ?? '',
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

      if (res.status === 401) {
        showFlash('error', 'Your session has expired. Please open /admin/login in a new tab to re-authenticate, then click Save again.');
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', editId ? 'Honour record updated.' : 'Honour record created.');
        if (data.honour) {
          setHonours((prev) => editId ? prev.map((h) => h.id === data.honour.id ? { ...h, ...data.honour } : h) : [data.honour, ...prev]);
        }
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
            Awardees &amp; master artisans
          </h1>
          <p className="text-sm admin-muted mt-1">
            Add and update awardee profiles, portraits, awards, craft details and homepage features.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="admin-button-primary px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add awardee
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

      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5" aria-labelledby="masters-page-content-heading">
        <div>
          <h2 id="masters-page-content-heading" className="text-lg font-semibold text-slate-900">Awards page content</h2>
          <p className="mt-1 text-sm text-slate-600">Edit the four public award descriptions and criteria, then manage the five rotating Masters page photos. These settings do not change awardee profiles.</p>
          {loadingMastersAwards && <p className="mt-2 text-xs text-slate-500" role="status">Loading saved Awards page content…</p>}
        </div>
        <form onSubmit={handleSaveMastersAwards} className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-2">
            {mastersAwards.categories.map((category, index) => (
              <fieldset key={category.key} className="min-w-0 space-y-3 rounded-lg border border-slate-200 p-4">
                <legend className="px-1 text-sm font-semibold text-slate-900">Award category {index + 1}</legend>
                <label className="block text-xs font-semibold text-slate-700">Public title
                  <input value={category.title} maxLength={120} onChange={(event) => setMastersAwards((current) => ({ ...current, categories: current.categories.map((item) => item.key === category.key ? { ...item, title: event.target.value } : item) }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                </label>
                <label className="block text-xs font-semibold text-slate-700">Description
                  <textarea value={category.description} maxLength={1600} rows={3} onChange={(event) => setMastersAwards((current) => ({ ...current, categories: current.categories.map((item) => item.key === category.key ? { ...item, description: event.target.value } : item) }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                </label>
                <label className="block text-xs font-semibold text-slate-700">Award criteria
                  <textarea value={category.criteria} maxLength={2000} rows={3} onChange={(event) => setMastersAwards((current) => ({ ...current, categories: current.categories.map((item) => item.key === category.key ? { ...item, criteria: event.target.value } : item) }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                </label>
              </fieldset>
            ))}
          </div>
          <fieldset className="space-y-4 rounded-lg border border-slate-200 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-900">Masters page carousel photos</legend>
            <p className="text-xs text-slate-600">Upload or paste a photo for each of the five existing carousel positions. Leave a field unchanged to keep its current photo.</p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {mastersAwards.carouselPhotos.map((url, index) => (
                <FileUploadInput
                  key={`masters-carousel-${index}`}
                  label={`Carousel photo ${index + 1} of 5`}
                  value={url}
                  onChange={(next) => setMastersAwards((current) => ({ ...current, carouselPhotos: current.carouselPhotos.map((photo, photoIndex) => photoIndex === index ? next : photo) }))}
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  hint="Choose an image for this Masters page slide. Existing file upload permissions and validation apply."
                />
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">Saved to the existing public site settings. Current built-in content remains the fallback until saved values are available.</p>
            <button type="submit" disabled={savingMastersAwards || loadingMastersAwards} className="admin-button-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
              {savingMastersAwards ? 'Saving Awards page…' : 'Save Awards page content'}
            </button>
          </div>
        </form>
      </section>

      {/* Honours Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center admin-muted">Loading awardee profiles...</div>
        ) : honours.length === 0 ? (
          <div className="col-span-full p-12 text-center admin-muted">No awardee profiles yet. Add the first profile when you have the approved details.</div>
        ) : (
          honours.map((h) => (
            <div key={h.id} className="admin-card rounded-xl border admin-border p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      {(AWARD_TYPES.find((award) => award.value === h.awardType)?.label || h.awardType)} · {h.yearAwarded}
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
                <span className="admin-muted">Display order: {h.sortOrder}</span>
                {h.isActive ? (
                  <span className="text-emerald-400">Published on Masters</span>
                ) : (
                  <span className="text-slate-400">Hidden from Masters</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl my-auto flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Sticky Header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {editId ? 'Edit awardee profile' : 'Add awardee profile'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Add the approved details, photos and public visibility for this profile.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors font-bold text-base"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="honourForm" onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {flashMsg?.type === 'error' && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Unable to save honour record</p>
                    <p className="mt-0.5">{flashMsg.text}</p>
                    {(flashMsg.text.toLowerCase().includes('session') || flashMsg.text.toLowerCase().includes('unauthorized') || flashMsg.text.includes('401')) && (
                      <a href="/admin/login" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 underline font-bold text-rose-800">
                        Open /admin/login in a new tab to log in &rarr;
                      </a>
                    )}
                  </div>
                </div>
              )}
              <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
                <legend className="px-1 text-sm font-semibold text-slate-900">Person and craft</legend>
                <p className="text-xs text-slate-600">Start with the awardee’s name, craft tradition, location and preferred title.</p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Master Artisan Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ap Sonam Dorji"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white text-slate-900 border border-slate-300 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Craft Discipline *</label>
                  <select value={form.craft} onChange={(e) => setForm({ ...form, craft: e.target.value })} required className="w-full px-3 py-2 text-sm rounded-lg bg-white text-slate-900 border border-slate-300 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]">
                    {!CRAFTS.some((craft) => craft.key === form.craft) && form.craft && <option value={form.craft}>{form.craft} (existing)</option>}
                    {CRAFTS.map((craft) => <option key={craft.key} value={craft.key}>{craft.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Dzongkhag *</label>
                  <input
                    type="text"
                    value={form.dzongkhag}
                    onChange={(e) => setForm({ ...form, dzongkhag: e.target.value })}
                    placeholder="Lhuentse, Paro, Thimphu..."
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white text-slate-900 border border-slate-300 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title / honorific *</label><select required value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg bg-white text-slate-900 border border-slate-300">{!TITLE_OPTIONS.includes(form.title || '') && form.title && <option value={form.title}>{form.title} (existing)</option>}<option value="" disabled>Select a title</option>{TITLE_OPTIONS.map((title) => <option key={title} value={title}>{title}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Practising since</label><input type="number" min="1" max={new Date().getFullYear()} step="1" value={form.practisingSince ?? ''} onChange={(e) => setForm({ ...form, practisingSince: e.target.value === '' ? null : Number(e.target.value) })} className="w-full px-3 py-2 text-sm rounded-lg bg-white text-slate-900 border border-slate-300" placeholder="Year" /><p className="mt-1 text-xs text-slate-500">Add only a confirmed year; leave blank if it is not recorded.</p></div>
              </div>

              </fieldset>

              <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
                <legend className="px-1 text-sm font-semibold text-slate-900">Award recognition</legend>
                <p className="text-xs text-slate-600">Record the award category and the year it was received.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Award Type *</label>
                  <select
                    value={form.awardType}
                    onChange={(e) => setForm({ ...form, awardType: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white text-slate-900 border border-slate-300 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                  >
                    {!AWARD_TYPES.some((award) => award.value === form.awardType) && <option value={form.awardType}>{form.awardType} (existing)</option>}
                    {AWARD_TYPES.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Year Awarded *</label>
                  <input
                    type="number"
                    value={form.yearAwarded}
                    onChange={(e) => setForm({ ...form, yearAwarded: Number(e.target.value) || 2026 })}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white text-slate-900 border border-slate-300 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                  />
                </div>
              </div>

              </fieldset>

              <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
                <legend className="px-1 text-sm font-semibold text-slate-900">Photos</legend>
                <p className="text-xs text-slate-600">Add a portrait and up to six photos showing the artisan’s work.</p>
              <div>
                <FileUploadInput
                  label="Master Artisan Portrait Photograph"
                  value={form.portraitUrl || ''}
                  onChange={(url) => setForm({ ...form, portraitUrl: url })}
                  accept="image/*"
                  hint="Upload a portrait photo of the master craftsperson (JPG, PNG, WebP)."
                />
              </div>
              <div className="space-y-2"><label className="block text-xs font-semibold text-slate-700 uppercase">Work photographs (up to six)</label>{(form.workPhotos || []).map((url: string, index: number) => <div key={`${index}-${url}`} className="flex gap-2 items-start"><FileUploadInput label={`Work photograph ${index + 1}`} value={url} onChange={(next) => setForm((current: any) => ({ ...current, workPhotos: current.workPhotos.map((item: string, i: number) => i === index ? next : item) }))} accept="image/*" /><button type="button" className="text-rose-600 text-sm" onClick={() => setForm((current: any) => ({ ...current, workPhotos: current.workPhotos.filter((_: string, i: number) => i !== index) }))}>Remove</button></div>)}{(form.workPhotos || []).length < 6 && <button type="button" className="text-sm underline" onClick={() => setForm((current: any) => ({ ...current, workPhotos: [...(current.workPhotos || []), ''] }))}>+ Add work photograph</button>}</div>
              </fieldset>

              <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
                <legend className="px-1 text-sm font-semibold text-slate-900">Public profile text</legend>
                <p className="text-xs text-slate-600">Write the award citation, a short card summary and the optional full story. Dzongkha citation is optional.</p>
              <div>
                <RichTextEditor
                  label="Citation / Living Heritage Narrative *"
                  value={form.citation}
                  onChange={(html) => setForm({ ...form, citation: html })}
                  hint="Fifty-one years at the backstrap loom, and teacher to eleven weavers..."
                />
              </div>

              <div><label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Short description (two-line card summary)</label><textarea maxLength={280} rows={2} value={form.shortDescription || ''} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg bg-white text-slate-900 border border-slate-300" /></div>
              <div><RichTextEditor label="Full artisan story" value={form.story || ''} onChange={(html) => setForm({ ...form, story: html })} hint="Optional longer profile story." /></div>
              <div>
                <RichTextEditor
                  label="Citation / Living Heritage Narrative (Dzongkha)"
                  value={form.citationDz || ''}
                  onChange={(html) => setForm({ ...form, citationDz: html })}
                  hint="Optional. Enter HAB-approved Dzongkha copy. Public pages use the English citation until this translation is saved."
                />
              </div>
              </fieldset>

              <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
                <legend className="px-1 text-sm font-semibold text-slate-900">Link and website display</legend>
                <p className="text-xs text-slate-600">Optionally link this profile to a maker record, feature it on the homepage, and choose its public status and order.</p>
              <label className="block text-sm text-slate-800">Maker registration number (optional)
                <input className="admin-input mt-1 w-full rounded border px-3 py-2" value={form.makerRegistrationNumber ?? ''} onChange={(e) => setForm({ ...form, makerRegistrationNumber: e.target.value })} />
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-800"><input type="checkbox" className="mt-0.5" checked={!!form.showHome} onChange={(e) => setForm({ ...form, showHome: e.target.checked })} /><span><span className="font-medium">Feature on homepage</span><span className="block text-xs text-slate-500 mt-0.5">The homepage can show up to six active profiles.</span></span></label>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Display order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white text-slate-900 border border-slate-300 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isActiveHonour"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#8B2E24] rounded"
                  />
                  <label htmlFor="isActiveHonour" className="text-sm text-slate-800 font-medium">
                    Publish profile on /masters
                  </label>
                </div>
              </div>
              <p className="text-xs text-slate-500">Turn this off to keep the profile saved in Admin but hidden from the public Masters page.</p>
              </fieldset>
            </form>

            {/* Sticky Footer */}
            <div className="flex-shrink-0 px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="honourForm"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving profile…' : form.isActive ? 'Save & publish profile' : 'Save as hidden profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
