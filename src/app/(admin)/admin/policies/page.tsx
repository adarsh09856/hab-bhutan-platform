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
import RichTextEditor from '@/components/admin/RichTextEditor';

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
            Edit the statutory policies governed by the CSO Act 2007 and HAB Articles of Association 2026.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

              <GlassButton variant="primary" onClick={handleSavePolicy} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Policy Changes'}
              </GlassButton>
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
    </div>
  );
}
