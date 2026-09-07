'use client';

import React, { useState, useEffect } from 'react';
import { FileEdit, Plus, Eye, BookOpen, Newspaper, Shield, Layers, RefreshCw, X } from 'lucide-react';
import { PUBLICATIONS, NEWS_EVENTS } from '@/lib/data';

interface NewsItem {
  id: string;
  title: string;
  kind?: string;
  category?: string;
  dateString?: string;
  blurb?: string;
  excerpt?: string;
}

interface PublicationItem {
  id: string;
  title: string;
  kind?: string;
  category?: string;
  year: number;
  metaDetails?: string;
  pages?: number;
  fileSize?: string;
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
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    type: 'NEWS' as 'NEWS' | 'PUBLICATION',
    title: '',
    category: 'Programs',
    excerptOrMeta: '',
    year: new Date().getFullYear(),
  });

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.news && data.news.length > 0) {
          setNews(
            data.news.map((n: any) => ({
              id: n.id,
              title: n.title,
              category: n.kind || 'Programs',
              dateString: n.dateString,
              excerpt: n.blurb || '',
            }))
          );
        } else {
          setNews(NEWS_EVENTS.map(n => ({ id: n.id, title: n.title, category: n.category, dateString: n.date, excerpt: n.excerpt })));
        }

        if (data.publications && data.publications.length > 0) {
          setPublications(
            data.publications.map((p: any) => ({
              id: p.id,
              title: p.title,
              category: p.kind || 'Report',
              year: p.year,
              metaDetails: p.metaDetails || 'PDF · Document',
            }))
          );
        } else {
          setPublications(PUBLICATIONS.map(p => ({ id: p.id, title: p.title, category: p.category, year: p.year, metaDetails: `${p.pages}pp · ${p.fileSize}` })));
        }

        if (data.governance && data.governance.length > 0) {
          setGovernance(data.governance);
        }
      } else {
        setNews(NEWS_EVENTS.map(n => ({ id: n.id, title: n.title, category: n.category, dateString: n.date, excerpt: n.excerpt })));
        setPublications(PUBLICATIONS.map(p => ({ id: p.id, title: p.title, category: p.category, year: p.year, metaDetails: `${p.pages}pp · ${p.fileSize}` })));
      }
    } catch (err) {
      console.error('Failed to load content from API:', err);
      setNews(NEWS_EVENTS.map(n => ({ id: n.id, title: n.title, category: n.category, dateString: n.date, excerpt: n.excerpt })));
      setPublications(PUBLICATIONS.map(p => ({ id: p.id, title: p.title, category: p.category, year: p.year, metaDetails: `${p.pages}pp · ${p.fileSize}` })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = formData.type === 'NEWS'
        ? {
            type: 'NEWS',
            title: formData.title,
            category: formData.category,
            excerpt: formData.excerptOrMeta,
            dateString: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          }
        : {
            type: 'PUBLICATION',
            title: formData.title,
            category: formData.category,
            year: Number(formData.year),
            metaDetails: formData.excerptOrMeta || 'PDF · Document',
          };

      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFeedback({ type: 'success', message: `${formData.type === 'NEWS' ? 'Article' : 'Publication'} published successfully to PostgreSQL.` });
        setFormData({
          type: 'NEWS',
          title: '',
          category: 'Programs',
          excerptOrMeta: '',
          year: new Date().getFullYear(),
        });
        setModalOpen(false);
        await loadContent();
      } else {
        const data = await res.json();
        setFeedback({ type: 'error', message: data.error || 'Failed to create content item.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error publishing content.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-indigo-600" />
            Content Management & CMS Clamping Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage public news, publications library, AoA governance resolutions, and verify typography clamp contracts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadContent}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 border border-slate-300 rounded shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> New Article / Report
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 text-xs rounded border ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-6 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('NEWS')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'NEWS' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Newspaper className="w-4 h-4" /> News & Press ({news.length})
        </button>
        <button
          onClick={() => setActiveTab('PUBLICATIONS')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'PUBLICATIONS' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Publications Repository ({publications.length})
        </button>
        <button
          onClick={() => setActiveTab('GOVERNANCE')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'GOVERNANCE' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" /> AoA Governance Documents {governance.length > 0 && `(${governance.length})`}
        </button>
        <button
          onClick={() => setActiveTab('CLAMP_LAB')}
          className={`pb-3 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'CLAMP_LAB' ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" /> CMS Clamp Contract Studio (.cms-1 to .cms-5)
        </button>
      </div>

      {/* Tab: News */}
      {activeTab === 'NEWS' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">News & Dispatch Registry</h3>
            <span className="text-xs text-slate-500">Live synced with public /news</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Title & Excerpt</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Clamp Class</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {news.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 max-w-md">
                    <p className="font-semibold text-slate-900">{n.title}</p>
                    <p className="text-slate-500 text-[11px] truncate mt-0.5">{n.excerpt}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {n.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{n.dateString || '—'}</td>
                  <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">.cms-2</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Published
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Publications */}
      {activeTab === 'PUBLICATIONS' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Publications & Curatorial PDF Archive</h3>
            <span className="text-xs text-slate-500">Live synced with public /publications</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Document Title</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Year</th>
                <th className="py-2.5 px-4">File Specs</th>
                <th className="py-2.5 px-4 text-right">Format</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {publications.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{p.title}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{p.year}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{p.metaDetails || `${p.pages || 24}pp · ${p.fileSize || '2.4 MB'}`}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      PDF Document
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Governance */}
      {activeTab === 'GOVERNANCE' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900">Articles of Association (AoA 2026 Revision)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Statutory constitutional text. Per BUILD-RULES.md, constitutional text is permanently UNCLAMPED and rendered verbatim.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 font-serif leading-relaxed bg-amber-50/40 p-5 rounded border border-amber-200">
            <h4 className="font-sans font-bold text-slate-900 uppercase tracking-wider text-xs">
              Article 3.2 — Objects of the Association (11 Statutory Declarations)
            </h4>
            <p>
              1. To act as the premier apex organization representing traditional artisans, craft producers, and indigenous enterprises across the Kingdom of Bhutan.
            </p>
            <p>
              2. To preserve, protect, and foster the authentic transmission of the Thirteen Traditional Arts and Crafts (Zorig Chusum) without compromising historical standards of excellence.
            </p>
            <p>
              3. To establish standards of authentication, trademark protection, and certification safeguarding genuine Bhutanese handmade goods against industrial counterfeit.
            </p>
            <p className="font-mono text-[11px] text-amber-800 pt-2 border-t border-amber-200">
              ✓ Contract verified: No line-clamp wrapper applied to statutory governance articles.
            </p>
          </div>

          {governance.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                AoA Statutory Officers Registry ({governance.length} seats)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {governance.map(g => (
                  <div key={g.id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                    <p className="font-semibold text-slate-900">{g.roleTitle}</p>
                    <p className="text-slate-600">{g.individualName}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{g.chapterOrNote}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Clamp Studio */}
      {activeTab === 'CLAMP_LAB' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900">CMS Clamping Validation Studio</h3>
            <p className="text-xs text-slate-500 mt-1">
              Test dynamic truncation contract (.cms-1 through .cms-5) against arbitrary editorial copy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Editor Input Text</label>
                <textarea 
                  rows={6}
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded font-sans outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Clamp Level Selector</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setClampLevel(lvl)}
                      className={`px-3 py-1.5 text-xs font-mono rounded font-medium border ${
                        clampLevel === lvl 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      .cms-{lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-4 rounded border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600" /> Rendered Output Preview (Class: .cms-{clampLevel})
              </h4>
              
              <div className="bg-white p-4 rounded border border-slate-200 shadow-inner">
                <p className={`text-slate-800 text-sm font-serif leading-relaxed cms-${clampLevel}`}>
                  {sampleText}
                </p>
              </div>

              <div className="text-[11px] font-mono text-slate-500 bg-white p-3 rounded border border-slate-200">
                <code>
                  display: -webkit-box;<br />
                  -webkit-box-orient: vertical;<br />
                  -webkit-line-clamp: {clampLevel};<br />
                  overflow: hidden;
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Publish New Content Item</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded font-sans"
                >
                  <option value="NEWS">News & Press Article</option>
                  <option value="PUBLICATION">Curatorial PDF Publication</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masterclass in Thagzo Weaving Opens"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category / Kind</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Programs, Artisan Support, Annual Report"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-sans"
                />
              </div>

              {formData.type === 'NEWS' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Summary / Excerpt</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description appearing in news grid..."
                    value={formData.excerptOrMeta}
                    onChange={(e) => setFormData({ ...formData, excerptOrMeta: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-sans"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Publication Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded font-sans"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">File Specs</label>
                    <input
                      type="text"
                      placeholder="e.g. PDF · 4.2 MB · 48 pages"
                      value={formData.excerptOrMeta}
                      onChange={(e) => setFormData({ ...formData, excerptOrMeta: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded font-sans"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Publishing…' : 'Publish to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

