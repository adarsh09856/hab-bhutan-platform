'use client';

import React, { useState, useEffect } from 'react';
import { FileEdit, Plus, BookOpen, Newspaper, Shield, Layers, Edit, Trash2 } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  kind?: string;
  category?: string;
  dateString?: string;
  blurb?: string;
  excerpt?: string;
  content?: string;
}

interface PublicationItem {
  id: string;
  title: string;
  kind?: string;
  category?: string;
  year: number;
  metaDetails?: string;
  fileUrl?: string;
}

interface GovernanceItem {
  id: string;
  category: string;
  roleTitle: string;
  individualName: string;
  chapterOrNote?: string;
  sortOrder: number;
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'NEWS' | 'PUBLICATIONS' | 'GOVERNANCE' | 'CLAMP_LAB'>('NEWS');
  const [clampLevel, setClampLevel] = useState<number>(3);
  const [sampleText, setSampleText] = useState<string>(
    'The Handicrafts Association of Bhutan (HAB) stands as the apex civil society organization dedicated to the preservation, development, and promotion of Bhutan’s traditional Thirteen Arts and Crafts (Zorig Chusum). Founded to empower local artisans across all twenty dzongkhags, HAB facilitates market access, provides masterclass training in indigenous techniques, ensures fair trade pricing, and establishes rigorous quality certification protocols to safeguard Bhutanese cultural heritage in the global economy.'
  );

  const [news, setNews] = useState<NewsItem[]>([]);
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [governance, setGovernance] = useState<GovernanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalType, setCreateModalType] = useState<'NEWS' | 'PUBLICATION' | 'GOVERNANCE' | null>(null);
  const [editingItem, setEditingItem] = useState<{ type: 'NEWS' | 'PUBLICATION' | 'GOVERNANCE'; data: any } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: 'NEWS' | 'PUBLICATION' | 'GOVERNANCE'; id: string; title: string } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [newsForm, setNewsForm] = useState({
    title: '',
    kind: 'Programs',
    dateString: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    blurb: '',
    content: '',
  });

  const [pubForm, setPubForm] = useState({
    title: '',
    kind: 'Annual report',
    year: new Date().getFullYear(),
    metaDetails: 'PDF · 4.2 MB · English & Dzongkha',
    fileUrl: '',
  });

  const [govForm, setGovForm] = useState({
    category: 'SECRETARIAT',
    roleTitle: '',
    individualName: '',
    chapterOrNote: '',
    sortOrder: 0,
  });

  const loadContent = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/content', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
        setPublications(data.publications || []);
        setGovernance(data.governance || []);
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: err.error || 'Failed to load content from PostgreSQL.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error fetching content.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createModalType) return;

    setSubmitting(true);
    setFeedback(null);

    let payload: any = { type: createModalType };
    if (createModalType === 'NEWS') payload = { ...payload, ...newsForm };
    if (createModalType === 'PUBLICATION') payload = { ...payload, ...pubForm };
    if (createModalType === 'GOVERNANCE') payload = { ...payload, ...govForm };

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: `✓ ${createModalType} record successfully created.` });
        setCreateModalType(null);
        await loadContent();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to create record.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: editingItem.type,
          id: editingItem.data.id,
          ...editingItem.data,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: `✓ ${editingItem.type} record updated successfully.` });
        setEditingItem(null);
        await loadContent();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to update record.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/content?type=${deletingItem.type}&id=${deletingItem.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: data.message || `✓ Record deleted.` });
        setDeletingItem(null);
        await loadContent();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to delete record.' });
        setDeletingItem(null);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error.' });
      setDeletingItem(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-indigo-600" />
            Content Management &amp; Public Disclosures
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Author and publish newsroom releases, statutory reports, and governance chapter structures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'NEWS' && (
            <button
              onClick={() => setCreateModalType('NEWS')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create News Article</span>
            </button>
          )}
          {activeTab === 'PUBLICATIONS' && (
            <button
              onClick={() => setCreateModalType('PUBLICATION')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Publication</span>
            </button>
          )}
          {activeTab === 'GOVERNANCE' && (
            <button
              onClick={() => setCreateModalType('GOVERNANCE')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Governance Officer</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 text-xs font-medium rounded-md flex justify-between items-center border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('NEWS')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'NEWS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>News &amp; Events ({news.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PUBLICATIONS')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'PUBLICATIONS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Publications &amp; Reports ({publications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('GOVERNANCE')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'GOVERNANCE'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Governance &amp; Chapters ({governance.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CLAMP_LAB')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'CLAMP_LAB'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Typography &amp; Clamping Lab</span>
        </button>
      </div>

      {/* Tab 1: Newsroom */}
      {activeTab === 'NEWS' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading news from PostgreSQL...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Headline &amp; Excerpt</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Published Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {news.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4 max-w-md">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-slate-500 text-[11px] truncate mt-0.5">{item.blurb || item.excerpt}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.kind || item.category || 'Programs'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{item.dateString}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingItem({ type: 'NEWS', data: { ...item } })}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingItem({ type: 'NEWS', id: item.id, title: item.title })}
                          className="px-2 py-1 text-rose-600 hover:text-rose-800 border border-rose-200 rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {news.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        No articles registered in database. Click &ldquo;Create News Article&rdquo; above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Publications */}
      {activeTab === 'PUBLICATIONS' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading publications from PostgreSQL...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Report Title</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Format &amp; Details</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {publications.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.title}</td>
                      <td className="py-3 px-4 text-slate-600">{p.kind || p.category}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">{p.year}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{p.metaDetails}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingItem({ type: 'PUBLICATION', data: { ...p } })}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingItem({ type: 'PUBLICATION', id: p.id, title: p.title })}
                          className="px-2 py-1 text-rose-600 hover:text-rose-800 border border-rose-200 rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {publications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No publications uploaded to database. Click &ldquo;Upload Publication&rdquo; above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Governance */}
      {activeTab === 'GOVERNANCE' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading governance from PostgreSQL...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Officer Name</th>
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-4">Body / Category</th>
                    <th className="py-3 px-4">Chapter / Note</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {governance.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{g.individualName}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{g.roleTitle}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {g.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{g.chapterOrNote || '—'}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingItem({ type: 'GOVERNANCE', data: { ...g } })}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingItem({ type: 'GOVERNANCE', id: g.id, title: `${g.roleTitle} (${g.individualName})` })}
                          className="px-2 py-1 text-rose-600 hover:text-rose-800 border border-rose-200 rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {governance.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No governance records found in database. Click &ldquo;Add Governance Officer&rdquo; above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Clamping Lab */}
      {activeTab === 'CLAMP_LAB' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Line-Clamp &amp; Typographic Density Inspector</h3>
            <p className="text-xs text-slate-500">Simulate catalog excerpts and descriptions under various clamp rules.</p>
          </div>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setClampLevel(lvl)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                  clampLevel === lvl ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                clamp-{lvl}
              </button>
            ))}
          </div>
          <div
            className="p-4 bg-slate-50 rounded border border-slate-200 text-slate-800 text-sm leading-relaxed overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: clampLevel,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {sampleText}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Create {createModalType} Record</h3>
              <button onClick={() => setCreateModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              {createModalType === 'NEWS' && (
                <>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Article Headline *</label>
                    <input
                      type="text"
                      required
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Category</label>
                      <select
                        value={newsForm.kind}
                        onChange={(e) => setNewsForm({ ...newsForm, kind: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                      >
                        <option value="Programs">Programs</option>
                        <option value="Artisan Support">Artisan Support</option>
                        <option value="Events">Events</option>
                        <option value="Publications">Publications</option>
                        <option value="Projects">Projects</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Publication Date String</label>
                      <input
                        type="text"
                        value={newsForm.dateString}
                        onChange={(e) => setNewsForm({ ...newsForm, dateString: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Summary / Blurb</label>
                    <textarea
                      rows={3}
                      value={newsForm.blurb}
                      onChange={(e) => setNewsForm({ ...newsForm, blurb: e.target.value })}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                    />
                  </div>
                </>
              )}

              {createModalType === 'PUBLICATION' && (
                <>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Publication Title *</label>
                    <input
                      type="text"
                      required
                      value={pubForm.title}
                      onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Document Category</label>
                      <select
                        value={pubForm.kind}
                        onChange={(e) => setPubForm({ ...pubForm, kind: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                      >
                        <option value="Annual report">Annual report</option>
                        <option value="Strategy">Strategy</option>
                        <option value="Sector study">Sector study</option>
                        <option value="Governance">Governance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Year</label>
                      <input
                        type="number"
                        value={pubForm.year}
                        onChange={(e) => setPubForm({ ...pubForm, year: parseInt(e.target.value, 10) || 2026 })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Meta Details (Pages / Format)</label>
                    <input
                      type="text"
                      value={pubForm.metaDetails}
                      onChange={(e) => setPubForm({ ...pubForm, metaDetails: e.target.value })}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                    />
                  </div>
                </>
              )}

              {createModalType === 'GOVERNANCE' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Officer Name *</label>
                      <input
                        type="text"
                        required
                        value={govForm.individualName}
                        onChange={(e) => setGovForm({ ...govForm, individualName: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Role Title *</label>
                      <input
                        type="text"
                        required
                        value={govForm.roleTitle}
                        onChange={(e) => setGovForm({ ...govForm, roleTitle: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Category / Body</label>
                      <select
                        value={govForm.category}
                        onChange={(e) => setGovForm({ ...govForm, category: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                      >
                        <option value="BOARD_OF_TRUSTEES">Board of Trustees</option>
                        <option value="SECRETARIAT">Secretariat</option>
                        <option value="DZONGKHAG_CHAPTER">Dzongkhag Chapter</option>
                        <option value="ENDOWMENT_COMMITTEE">Endowment Committee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Chapter / Note</label>
                      <input
                        type="text"
                        value={govForm.chapterOrNote}
                        onChange={(e) => setGovForm({ ...govForm, chapterOrNote: e.target.value })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalType(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit {editingItem.type} Record</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              {editingItem.type === 'NEWS' && (
                <>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Headline</label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.title}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Summary / Blurb</label>
                    <textarea
                      rows={3}
                      value={editingItem.data.blurb || editingItem.data.excerpt || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, blurb: e.target.value } })}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'PUBLICATION' && (
                <>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.title}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Year</label>
                      <input
                        type="number"
                        value={editingItem.data.year}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, year: parseInt(e.target.value, 10) || 2026 } })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Meta Details</label>
                      <input
                        type="text"
                        value={editingItem.data.metaDetails || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, metaDetails: e.target.value } })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {editingItem.type === 'GOVERNANCE' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Officer Name</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.individualName}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, individualName: e.target.value } })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Role Title</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.roleTitle}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, roleTitle: e.target.value } })}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Chapter / Note</label>
                    <input
                      type="text"
                      value={editingItem.data.chapterOrNote || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, chapterOrNote: e.target.value } })}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Delete Content Record?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently remove <strong className="text-slate-900">{deletingItem.title}</strong> from public disclosures?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
