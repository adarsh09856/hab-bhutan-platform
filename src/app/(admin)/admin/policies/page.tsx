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
  BookOpen
} from 'lucide-react';
import { 
  GlassCard, 
  GlassStatWidget, 
  GlassBadge, 
  GlassButton 
} from '@/components/admin/GlassUI';

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
      const res = await fetch('/api/admin/policies');
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

  const currentPolicy = policies.find((p) => p.slug === selectedSlug);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-medium px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
              Policies &amp; Legal CMS
            </h1>
            <GlassBadge variant="amber">Statutory Compliance</GlassBadge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Edit the statutory policies governed by the CSO Act 2007 and HAB Articles of Association 2026.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentPolicy?.publicUrl && (
            <Link
              href={currentPolicy.publicUrl}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              View Public Page
            </Link>
          )}
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
          <span className="text-xs uppercase tracking-wider text-slate-400 block font-semibold px-1">
            Statutory Policies
          </span>
          {policies.map((p) => {
            const isSelected = p.slug === selectedSlug;
            return (
              <button
                key={p.slug}
                onClick={() => handleSelectPolicy(p.slug)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{p.slug}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Live</span>
                </div>
                <span className="text-[11px] text-slate-400 line-clamp-1">{p.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right Editor Pane */}
        <div className="lg:col-span-3">
          <GlassCard className="p-6 space-y-5" glow="amber">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  /{selectedSlug}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Changes made here take effect immediately on public policy routes.
                </p>
              </div>

              <GlassButton variant="primary" onClick={handleSavePolicy} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Policy Changes'}
              </GlassButton>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Policy Document Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs text-slate-400 font-medium">Policy Document Body</label>
                <span className="text-[10px] text-slate-500">Supports standard text with numbered sections</span>
              </div>
              <textarea
                rows={18}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-amber-500 resize-y"
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
