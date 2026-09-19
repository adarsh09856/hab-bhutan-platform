'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Save, 
  ExternalLink,
  Lock,
  Truck,
  BookOpen,
  X,
  Trash2
} from 'lucide-react';
import { 
  GlassCard, 
  GlassStatWidget, 
  GlassBadge, 
  GlassButton 
} from '@/components/admin/GlassUI';
import RichTextEditor from '@/components/admin/RichTextEditor';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('shipping-policy');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/policies', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.policies)) {
          setPolicies(data.policies);
          const current = data.policies.find((p: any) => p.slug === selectedSlug) || data.policies[0];
          if (current) {
            setSelectedSlug(current.slug);
            setEditTitle(current.title || '');
            setEditContent(current.content || '');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleSelectPolicy = (slug: string) => {
    setSelectedSlug(slug);
    const p = policies.find((item) => item.slug === slug);
    if (p) {
      setEditTitle(p.title);
      setEditContent(p.content);
    }
  };

  const handleSavePolicy = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/policies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedSlug,
          title: editTitle,
          content: editContent,
        }),
      });

      if (res.ok) {
        showToast(`Policy [${selectedSlug}] saved successfully`);
        loadPolicies();
      } else {
        showToast('Error saving policy');
      }
    } catch {
      showToast('Network error saving policy');
    } finally {
      setSaving(false);
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creatingPolicy, setCreatingPolicy] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState(false);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) {
      showToast('Title and URL slug are required');
      return;
    }

    setCreatingPolicy(true);
    try {
      const res = await fetch('/api/admin/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: newSlug,
          title: newTitle,
          content: newContent,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Policy [${newSlug}] created successfully!`);
        setShowAddModal(false);
        setNewSlug('');
        setNewTitle('');
        setNewContent('');
        loadPolicies();
        setSelectedSlug(newSlug);
      } else {
        showToast(data.error || 'Failed to create policy');
      }
    } catch {
      showToast('Network error creating policy');
    } finally {
      setCreatingPolicy(false);
    }
  };

  const handleDeletePolicy = async (slug: string) => {
    if (!confirm(`Are you sure you want to permanently delete policy "${slug}"?`)) return;

    setDeletingPolicy(true);
    try {
      const res = await fetch(`/api/admin/policies?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Policy [${slug}] deleted.`);
        await loadPolicies();
        setSelectedSlug('terms');
      } else {
        showToast(data.error || 'Failed to delete policy');
      }
    } catch {
      showToast('Network error deleting policy');
    } finally {
      setDeletingPolicy(false);
    }
  };

  const currentPolicy = policies.find((p) => p.slug === selectedSlug);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-medium px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#8b2e24]" />
              Policies &amp; Legal CMS
            </h1>
            <GlassBadge variant="amber">Statutory Compliance</GlassBadge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Edit and publish statutory policies governed by the CSO Act 2007 and HAB Articles of Association 2026.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {currentPolicy?.publicUrl && (
            <Link
              href={currentPolicy.publicUrl}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#8b2e24]" />
              View Public Page
            </Link>
          )}

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Add New Policy</span>
          </button>

          <GlassButton variant="secondary" onClick={loadPolicies} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </GlassButton>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassStatWidget
          title="Shipping &amp; Transit Policy"
          value="EMS + DHL"
          subtitle="Duty, tracking &amp; seals"
          icon={Truck}
          glow="amber"
          onClick={() => handleSelectPolicy('shipping-policy')}
        />
        <GlassStatWidget
          title="Terms of Service"
          value="AoA 2026"
          subtitle="Artisan buy-out charter"
          icon={BookOpen}
          glow="emerald"
          onClick={() => handleSelectPolicy('terms')}
        />
        <GlassStatWidget
          title="Privacy &amp; Data Consent"
          value="Directory Shield"
          subtitle="Member protection standards"
          icon={Lock}
          glow="indigo"
          onClick={() => handleSelectPolicy('privacy')}
        />
      </div>

      {/* Main Policy Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Policy Selector */}
        <div className="lg:col-span-1 space-y-2">
          <span className="text-xs uppercase tracking-wider text-slate-700 block font-bold px-1">
            Statutory Policies
          </span>
          {policies.map((p) => {
            const isSelected = p.slug === selectedSlug;
            return (
              <button
                key={p.slug}
                onClick={() => handleSelectPolicy(p.slug)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-sm ring-1 ring-amber-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{p.slug}</span>
                  <span className="text-[10px] text-emerald-700 font-mono font-semibold">Live</span>
                </div>
                <span className="text-[11px] text-slate-500 line-clamp-1">{p.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right Editor Pane */}
        <div className="lg:col-span-3">
          <GlassCard className="p-6 space-y-5" glow="amber">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono text-[#8b2e24] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                  /{selectedSlug}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Changes made here take effect immediately on public policy routes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!['shipping-policy', 'terms', 'privacy'].includes(selectedSlug) && (
                  <button
                    type="button"
                    onClick={() => handleDeletePolicy(selectedSlug)}
                    disabled={deletingPolicy}
                    className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>{deletingPolicy ? 'Deleting...' : 'Delete Policy'}</span>
                  </button>
                )}
                <GlassButton variant="primary" onClick={handleSavePolicy} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Policy Changes'}
                </GlassButton>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-700 mb-1 font-semibold">Policy Document Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#8b2e24] font-medium shadow-sm"
              />
            </div>

            <div>
              <RichTextEditor
                label="Policy Document Clauses & Body"
                value={editContent}
                onChange={(html) => setEditContent(html)}
                minHeight="360px"
                hint="Supports headings, numbered articles, bullet points, hyperlinks, and brand colors."
              />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Add New Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#8b2e24]" />
                <h3 className="font-bold text-slate-900 text-base">Add New Statutory Policy</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Policy Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artisan Welfare & Equity Charter"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug || newSlug === slugify(newTitle)) {
                      setNewSlug(slugify(e.target.value));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#8b2e24] shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  URL Slug *
                </label>
                <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-500">
                  <span className="font-mono text-xs">/policies/</span>
                  <input
                    type="text"
                    required
                    placeholder="artisan-welfare"
                    value={newSlug}
                    onChange={(e) => setNewSlug(slugify(e.target.value))}
                    className="w-full bg-transparent text-slate-900 font-mono text-sm focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  This forms the public permanent URL: /policies/{newSlug || 'example-slug'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Initial Clauses & Body Content
                </label>
                <textarea
                  rows={6}
                  placeholder="Write initial policy articles, clauses, and governance details here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#8b2e24] shadow-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPolicy}
                  className="px-5 py-2 rounded-xl bg-[#8b2e24] hover:bg-[#73241c] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {creatingPolicy ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Policy Document</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
