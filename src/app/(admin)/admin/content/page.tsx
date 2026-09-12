'use client';

export const dynamic = 'force-dynamic';

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

interface PolicyItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
  updatedAt?: string;
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'NEWS' | 'PUBLICATIONS' | 'GOVERNANCE' | 'POLICIES' | 'CLAMP_LAB'>('NEWS');
  const [clampLevel, setClampLevel] = useState<number>(3);
  const [sampleText, setSampleText] = useState<string>(
    'The Handicrafts Association of Bhutan (HAB) stands as the apex civil society organization dedicated to the preservation, development, and promotion of Bhutan’s traditional Thirteen Arts and Crafts (Zorig Chusum). Founded to empower local artisans across all twenty dzongkhags, HAB facilitates market access, provides masterclass training in indigenous techniques, ensures fair trade pricing, and establishes rigorous quality certification protocols to safeguard Bhutanese cultural heritage in the global economy.'
  );

  const [news, setNews] = useState<NewsItem[]>([]);
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [governance, setGovernance] = useState<GovernanceItem[]>([]);
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null);
  const [policySaving, setPolicySaving] = useState(false);
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
      const [contentRes, policiesRes] = await Promise.all([
        fetch('/api/admin/content', { credentials: 'include' }),
        fetch('/api/admin/policies', { credentials: 'include' }),
      ]);

      if (contentRes.ok) {
        const data = await contentRes.json();
        setNews(data.news || []);
        setPublications(data.publications || []);
        setGovernance(data.governance || []);
      } else {
        const err = await contentRes.json();
        setFeedback({ type: 'error', message: err.error || 'Failed to load content from PostgreSQL.' });
      }

      if (policiesRes.ok) {
        const pData = await policiesRes.json();
        setPolicies(pData.policies || []);
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

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;
    setPolicySaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingPolicy),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: `✓ Policy "${editingPolicy.title}" updated successfully.` });
        setEditingPolicy(null);
        await loadContent();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save policy.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error saving policy.' });
    } finally {
      setPolicySaving(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b admin-border pb-5">
        <div>
          <h1 className="text-xl font-bold admin-title flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-indigo-300" />
            Content Management &amp; Public Disclosures
          </h1>
          <p className="text-sm admin-muted mt-1">
            Author and publish newsroom releases, statutory reports, and governance chapter structures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'NEWS' && (
            <button
              onClick={() => setCreateModalType('NEWS')}
              className="px-3.5 py-1.5 admin-button-primary text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create News Article</span>
            </button>
          )}
          {activeTab === 'PUBLICATIONS' && (
            <button
              onClick={() => setCreateModalType('PUBLICATION')}
              className="px-3.5 py-1.5 admin-button-primary text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Publication</span>
            </button>
          )}
          {activeTab === 'GOVERNANCE' && (
            <button
              onClick={() => setCreateModalType('GOVERNANCE')}
              className="px-3.5 py-1.5 admin-button-primary text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Governance Officer</span>
            </button>
          )}
          {activeTab === 'POLICIES' && (
            <button
              onClick={() => setEditingPolicy({ id: '', slug: '', title: '', content: '', isActive: true })}
              className="px-3.5 py-1.5 admin-button-primary text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Policy Document</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 text-xs font-medium rounded-md flex justify-between items-center border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-300'
              : 'bg-rose-500/10 border-rose-400/25 text-rose-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b admin-border gap-6">
        <button
          onClick={() => setActiveTab('NEWS')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'NEWS'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent admin-muted admin-hover'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>News &amp; Events ({news.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PUBLICATIONS')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'PUBLICATIONS'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent admin-muted admin-hover'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Publications &amp; Reports ({publications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('GOVERNANCE')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'GOVERNANCE'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent admin-muted admin-hover'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Governance &amp; Chapters ({governance.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('POLICIES')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'POLICIES'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent admin-muted admin-hover'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>Statutory Policies ({policies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CLAMP_LAB')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'CLAMP_LAB'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent admin-muted admin-hover'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Typography &amp; Clamping Lab</span>
        </button>
      </div>

      {/* Tab 1: Newsroom */}
      {activeTab === 'NEWS' && (
        <div className="admin-card border admin-border rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center admin-muted text-xs font-mono">Loading news from PostgreSQL...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="admin-panel border-b admin-border admin-text font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Headline &amp; Excerpt</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Published Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y admin-divider">
                  {news.map((item) => (
                    <tr key={item.id} className="admin-hover transition-colors">
                      <td className="py-3 px-4 max-w-md">
                        <div className="font-semibold admin-title">{item.title}</div>
                        <div className="admin-muted text-[11px] truncate mt-0.5">{item.blurb || item.excerpt}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-500/15 admin-text">
                          {item.kind || item.category || 'Programs'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono admin-muted">{item.dateString}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingItem({ type: 'NEWS', data: { ...item } })}
                          className="px-2 py-1 admin-button-secondary border rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingItem({ type: 'NEWS', id: item.id, title: item.title })}
                          className="px-2 py-1 text-rose-300 hover:text-rose-200 border border-rose-400/30 hover:bg-rose-500/10 rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {news.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center admin-muted">
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
        <div className="admin-card border admin-border rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center admin-muted text-xs font-mono">Loading publications from PostgreSQL...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="admin-panel border-b admin-border admin-text font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Report Title</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Format &amp; Details</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y admin-divider">
                  {publications.map((p) => (
                    <tr key={p.id} className="admin-hover transition-colors">
                      <td className="py-3 px-4 font-semibold admin-title">{p.title}</td>
                      <td className="py-3 px-4 admin-text">{p.kind || p.category}</td>
                      <td className="py-3 px-4 font-mono font-medium admin-text">{p.year}</td>
                      <td className="py-3 px-4 font-mono admin-muted text-[11px]">{p.metaDetails}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingItem({ type: 'PUBLICATION', data: { ...p } })}
                          className="px-2 py-1 admin-button-secondary border rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingItem({ type: 'PUBLICATION', id: p.id, title: p.title })}
                          className="px-2 py-1 text-rose-300 hover:text-rose-200 border border-rose-400/30 hover:bg-rose-500/10 rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {publications.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center admin-muted">
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
        <div className="admin-card border admin-border rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center admin-muted text-xs font-mono">Loading governance from PostgreSQL...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="admin-panel border-b admin-border admin-text font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Officer Name</th>
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-4">Body / Category</th>
                    <th className="py-3 px-4">Chapter / Note</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y admin-divider">
                  {governance.map((g) => (
                    <tr key={g.id} className="admin-hover transition-colors">
                      <td className="py-3 px-4 font-semibold admin-title">{g.individualName}</td>
                      <td className="py-3 px-4 admin-text font-medium">{g.roleTitle}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-500/15 admin-text">
                          {g.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 admin-muted">{g.chapterOrNote || '—'}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingItem({ type: 'GOVERNANCE', data: { ...g } })}
                          className="px-2 py-1 admin-button-secondary border rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingItem({ type: 'GOVERNANCE', id: g.id, title: `${g.roleTitle} (${g.individualName})` })}
                          className="px-2 py-1 text-rose-300 hover:text-rose-200 border border-rose-400/30 hover:bg-rose-500/10 rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {governance.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center admin-muted">
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

      {/* Tab: Statutory Policies */}
      {activeTab === 'POLICIES' && (
        <div className="admin-card border admin-border rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center admin-muted text-xs font-mono">Loading statutory policies from PostgreSQL...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="admin-panel border-b admin-border admin-text font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Policy Title &amp; Slug</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Word Count</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y admin-divider">
                  {policies.map((p) => (
                    <tr key={p.id || p.slug} className="admin-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold admin-title">{p.title}</div>
                        <div className="font-mono text-[11px] text-indigo-300 mt-0.5">/{p.slug}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.isActive ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}>
                          {p.isActive ? 'Active & Published' : 'Draft / Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 admin-muted font-mono">
                        {p.content ? p.content.split(/\s+/).length : 0} words
                      </td>
                      <td className="py-3 px-4 admin-muted font-mono text-[11px]">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-GB') : 'Seeded'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setEditingPolicy({ ...p })}
                          className="px-2.5 py-1 admin-button-secondary border rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit Policy
                        </button>
                      </td>
                    </tr>
                  ))}
                  {policies.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center admin-muted">
                        No policies configured. Click &ldquo;New Policy Document&rdquo; above.
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
        <div className="admin-card border admin-border rounded-lg p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold admin-title">Line-Clamp &amp; Typographic Density Inspector</h3>
            <p className="text-xs admin-muted">Simulate catalog excerpts and descriptions under various clamp rules.</p>
          </div>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setClampLevel(lvl)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                  clampLevel === lvl ? 'admin-button-primary' : 'admin-button-secondary'
                }`}
              >
                clamp-{lvl}
              </button>
            ))}
          </div>
          <div
            className="p-4 admin-panel rounded border admin-border admin-text text-sm leading-relaxed overflow-hidden"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-modal rounded-xl max-w-lg w-full p-6 shadow-2xl border admin-border space-y-4 my-8">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <h3 className="font-bold admin-title text-base">Create {createModalType} Record</h3>
              <button onClick={() => setCreateModalType(null)} className="admin-muted admin-hover font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              {createModalType === 'NEWS' && (
                <>
                  <div>
                    <label className="block font-medium admin-text mb-1">Article Headline *</label>
                    <input
                      type="text"
                      required
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      className="w-full admin-input border rounded px-2.5 py-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium admin-text mb-1">Category</label>
                      <select
                        value={newsForm.kind}
                        onChange={(e) => setNewsForm({ ...newsForm, kind: e.target.value })}
                        className="w-full admin-input border rounded px-2.5 py-1.5"
                      >
                        <option value="Programs">Programs</option>
                        <option value="Artisan Support">Artisan Support</option>
                        <option value="Events">Events</option>
                        <option value="Publications">Publications</option>
                        <option value="Projects">Projects</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium admin-text mb-1">Publication Date String</label>
                      <input
                        type="text"
                        value={newsForm.dateString}
                        onChange={(e) => setNewsForm({ ...newsForm, dateString: e.target.value })}
                        className="w-full admin-input border rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium admin-text mb-1">Summary / Blurb</label>
                    <textarea
                      rows={3}
                      value={newsForm.blurb}
                      onChange={(e) => setNewsForm({ ...newsForm, blurb: e.target.value })}
                      className="w-full admin-input border rounded px-2.5 py-1.5"
                    />
                  </div>
                </>
              )}

              {createModalType === 'PUBLICATION' && (
                <>
                  <div>
                    <label className="block font-medium admin-text mb-1">Publication Title *</label>
                    <input
                      type="text"
                      required
                      value={pubForm.title}
                      onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })}
                      className="w-full admin-input border rounded px-2.5 py-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium admin-text mb-1">Document Category</label>
                      <select
                        value={pubForm.kind}
                        onChange={(e) => setPubForm({ ...pubForm, kind: e.target.value })}
                        className="w-full admin-input border rounded px-2.5 py-1.5"
                      >
                        <option value="Annual report">Annual report</option>
                        <option value="Strategy">Strategy</option>
                        <option value="Sector study">Sector study</option>
                        <option value="Governance">Governance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium admin-text mb-1">Year</label>
                      <input
                        type="number"
                        value={pubForm.year}
                        onChange={(e) => setPubForm({ ...pubForm, year: parseInt(e.target.value, 10) || 2026 })}
                        className="w-full admin-input border rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium admin-text mb-1">Meta Details (Pages / Format)</label>
                    <input
                      type="text"
                      value={pubForm.metaDetails}
                      onChange={(e) => setPubForm({ ...pubForm, metaDetails: e.target.value })}
                      className="w-full admin-input border rounded px-2.5 py-1.5 font-mono"
                    />
                  </div>
                </>
              )}

              {createModalType === 'GOVERNANCE' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium admin-text mb-1">Officer Name *</label>
                      <input
                        type="text"
                        required
                        value={govForm.individualName}
                        onChange={(e) => setGovForm({ ...govForm, individualName: e.target.value })}
                        className="w-full admin-input border rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-medium admin-text mb-1">Role Title *</label>
                      <input
                        type="text"
                        required
                        value={govForm.roleTitle}
                        onChange={(e) => setGovForm({ ...govForm, roleTitle: e.target.value })}
                        className="w-full admin-input border rounded px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium admin-text mb-1">Category / Body</label>
                      <select
                        value={govForm.category}
                        onChange={(e) => setGovForm({ ...govForm, category: e.target.value })}
                        className="w-full admin-input border rounded px-2.5 py-1.5"
                      >
                        <option value="BOARD_OF_TRUSTEES">Board of Trustees</option>
                        <option value="SECRETARIAT">Secretariat</option>
                        <option value="DZONGKHAG_CHAPTER">Dzongkhag Chapter</option>
                        <option value="ENDOWMENT_COMMITTEE">Endowment Committee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium admin-text mb-1">Chapter / Note</label>
                      <input
                        type="text"
                        value={govForm.chapterOrNote}
                        onChange={(e) => setGovForm({ ...govForm, chapterOrNote: e.target.value })}
                        className="w-full admin-input border rounded px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setCreateModalType(null)}
                  className="px-3 py-1.5 admin-button-secondary border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 admin-button-primary rounded font-semibold disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-modal rounded-xl max-w-lg w-full p-6 shadow-2xl border admin-border space-y-4 my-8">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <h3 className="font-bold admin-title text-base">Edit {editingItem.type} Record</h3>
              <button onClick={() => setEditingItem(null)} className="admin-muted admin-hover font-bold">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              {editingItem.type === 'NEWS' && (
                <>
                  <div>
                    <label className="block font-medium admin-text mb-1">Headline</label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.title}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full admin-input border rounded px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-medium admin-text mb-1">Summary / Blurb</label>
                    <textarea
                      rows={3}
                      value={editingItem.data.blurb || editingItem.data.excerpt || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, blurb: e.target.value } })}
                      className="w-full admin-input border rounded px-2.5 py-1.5"
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'PUBLICATION' && (
                <>
                  <div>
                    <label className="block font-medium admin-text mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={editingItem.data.title}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                      className="w-full admin-input border rounded px-2.5 py-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium admin-text mb-1">Year</label>
                      <input
                        type="number"
                        value={editingItem.data.year}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, year: parseInt(e.target.value, 10) || 2026 } })}
                        className="w-full admin-input border rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium admin-text mb-1">Meta Details</label>
                      <input
                        type="text"
                        value={editingItem.data.metaDetails || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, metaDetails: e.target.value } })}
                        className="w-full admin-input border rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {editingItem.type === 'GOVERNANCE' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium admin-text mb-1">Officer Name</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.individualName}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, individualName: e.target.value } })}
                        className="w-full admin-input border rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-medium admin-text mb-1">Role Title</label>
                      <input
                        type="text"
                        required
                        value={editingItem.data.roleTitle}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, roleTitle: e.target.value } })}
                        className="w-full admin-input border rounded px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium admin-text mb-1">Chapter / Note</label>
                    <input
                      type="text"
                      value={editingItem.data.chapterOrNote || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, chapterOrNote: e.target.value } })}
                      className="w-full admin-input border rounded px-2.5 py-1.5"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 admin-button-secondary border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 admin-button-primary rounded font-semibold disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="admin-modal rounded-xl max-w-md w-full p-6 shadow-2xl border admin-border space-y-4">
            <h3 className="font-bold admin-title text-base">Delete Content Record?</h3>
            <p className="text-xs admin-text">
              Are you sure you want to permanently remove <strong className="admin-title">{deletingItem.title}</strong> from public disclosures?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-3 py-1.5 admin-button-secondary border rounded text-xs"
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

      {/* Edit/Create Policy Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-modal rounded-xl max-w-2xl w-full p-6 shadow-2xl border admin-border space-y-4 my-8">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <h3 className="font-bold admin-title text-base">
                {editingPolicy.id ? 'Edit Statutory Policy' : 'Create Statutory Policy'}
              </h3>
              <button onClick={() => setEditingPolicy(null)} className="admin-muted admin-hover font-bold">✕</button>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium admin-text mb-1">Policy Document Title *</label>
                  <input
                    type="text"
                    required
                    value={editingPolicy.title}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                    placeholder="e.g., Shipping & Delivery Policy"
                    className="w-full admin-input border rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium admin-text mb-1">URL Route Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingPolicy.slug}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, slug: e.target.value.toLowerCase().trim() })}
                    placeholder="e.g., shipping, terms, privacy"
                    className="w-full admin-input border rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 font-medium admin-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPolicy.isActive}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, isActive: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Publish this policy live on public website (/shipping, /terms, /privacy)</span>
                </label>
              </div>

              <div>
                <label className="block font-medium admin-text mb-1">
                  Policy Content (Markdown / Plain Text) *
                </label>
                <textarea
                  rows={14}
                  required
                  value={editingPolicy.content}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, content: e.target.value })}
                  placeholder="Enter full policy terms, guidelines, disclaimers..."
                  className="w-full admin-input border rounded px-3 py-2 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="px-3 py-1.5 admin-button-secondary border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={policySaving}
                  className="px-4 py-1.5 admin-button-primary rounded font-semibold disabled:opacity-50"
                >
                  {policySaving ? 'Saving to Database...' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
