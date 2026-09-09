'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Check, 
  Layers, 
  Save, 
  AlertCircle 
} from 'lucide-react';
import { 
  GlassCard, 
  GlassBadge, 
  GlassButton, 
  GlassDrawer, 
  GlassInput 
} from '@/components/admin/GlassUI';

interface PillarRecord {
  id: string;
  ref: string;
  title: string;
  description: string;
  activities: string[];
  sortOrder: number;
  isActive: boolean;
}

export default function AdminProgrammesPage() {
  const [pillars, setPillars] = useState<PillarRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Create Drawer
  const [editingPillar, setEditingPillar] = useState<Partial<PillarRecord> | null>(null);
  const [activitiesInput, setActivitiesInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPillars = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/programmes', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setPillars(data.pillars || []);
      }
    } catch (err) {
      console.error('Failed to load programmes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPillars();
  }, []);

  const handleOpenEdit = (pillar?: PillarRecord) => {
    if (pillar) {
      setEditingPillar(pillar);
      setActivitiesInput(Array.isArray(pillar.activities) ? pillar.activities.join('\n') : '');
    } else {
      setEditingPillar({
        ref: `3.2.${pillars.length + 1}`,
        title: '',
        description: '',
        sortOrder: pillars.length + 1,
        isActive: true,
      });
      setActivitiesInput('');
    }
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPillar?.ref || !editingPillar?.title || !editingPillar?.description) {
      setError('Article Ref, Title, and Description are required.');
      return;
    }

    setSaving(true);
    setError('');

    const acts = activitiesInput
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean);

    try {
      const isNew = !editingPillar.id;
      const url = '/api/admin/programmes';
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...editingPillar,
          activities: acts,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditingPillar(null);
        loadPillars();
      } else {
        setError(data.error || 'Failed to save programme pillar.');
      }
    } catch {
      setError('Connection error saving programme.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this statutory programme?')) return;
    try {
      const res = await fetch(`/api/admin/programmes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        loadPillars();
      }
    } catch {
      alert('Error deleting programme.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold admin-title tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-400" />
            Statutory Programmes &amp; Mandates CMS
          </h1>
          <p className="text-xs admin-muted mt-1">
            Configure the 11 statutory objects and interventions displayed on the public Programmes portal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <GlassButton
            variant="secondary"
            size="md"
            onClick={loadPillars}
            icon={RefreshCw}
            loading={loading}
          >
            Refresh
          </GlassButton>
          <GlassButton
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => handleOpenEdit()}
          >
            Add Programme Object
          </GlassButton>
        </div>
      </div>

      {/* Grid of Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center admin-muted font-mono text-xs">
            Loading statutory pillars from database...
          </div>
        ) : pillars.length === 0 ? (
          <div className="col-span-full py-16 text-center admin-muted text-xs">
            No programme pillars found. Click &quot;Add Programme Object&quot; to begin.
          </div>
        ) : (
          pillars.map((p) => (
            <GlassCard key={p.id} glow="amber" className="admin-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    Article {p.ref}
                  </span>
                  <GlassBadge status={p.isActive ? 'ACTIVE' : 'SUSPENDED'} />
                </div>

                <h3 className="text-sm font-bold admin-title mb-2 leading-snug">
                  {p.title}
                </h3>

                <p className="text-xs admin-text line-clamp-3 leading-relaxed">
                  {p.description}
                </p>

                {Array.isArray(p.activities) && p.activities.length > 0 && (
                  <div className="mt-3 pt-3 border-t admin-border space-y-1">
                    <span className="text-[10px] uppercase font-mono admin-muted block font-semibold">
                      Interventions ({p.activities.length}):
                    </span>
                    <p className="text-[11px] admin-muted truncate">
                      {p.activities.join(' · ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t admin-border flex items-center justify-between">
                <span className="text-[10px] admin-muted font-mono">Order: #{p.sortOrder}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg admin-button-secondary"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 admin-muted hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Edit / Create Drawer */}
      <GlassDrawer
        isOpen={Boolean(editingPillar)}
        onClose={() => setEditingPillar(null)}
        title={editingPillar?.id ? 'Edit Programme Pillar' : 'New Programme Pillar'}
        subtitle="Public Benefit statutory mandate"
        width="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-none" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <GlassInput
              label="Article Reference *"
              required
              placeholder="e.g. 3.2.1"
              value={editingPillar?.ref || ''}
              onChange={(e) => setEditingPillar({ ...editingPillar, ref: e.target.value })}
              className="admin-input w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden transition-all"
            />

            <GlassInput
              label="Sort Order"
              type="number"
              value={editingPillar?.sortOrder ?? 1}
              onChange={(e) => setEditingPillar({ ...editingPillar, sortOrder: parseInt(e.target.value, 10) || 0 })}
              className="admin-input w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden transition-all"
            />
          </div>

          <GlassInput
            label="Title *"
            required
            placeholder="e.g. Collective Bargaining & Raw Material Supply"
            value={editingPillar?.title || ''}
            onChange={(e) => setEditingPillar({ ...editingPillar, title: e.target.value })}
            className="admin-input w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden transition-all"
          />

          <div>
            <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
              Description / Mandate Narrative *
            </label>
            <textarea
              rows={4}
              required
              value={editingPillar?.description || ''}
              onChange={(e) => setEditingPillar({ ...editingPillar, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl admin-input border text-xs focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
              Core Interventions (One per line)
            </label>
            <textarea
              rows={4}
              value={activitiesInput}
              onChange={(e) => setActivitiesInput(e.target.value)}
              placeholder="e.g.&#10;Centralized wool bank in Bumthang&#10;Certified timber allocation&#10;Metalsmithing ingot import"
              className="w-full px-3.5 py-2.5 rounded-xl admin-input border text-xs font-mono focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="pillarActive"
              checked={editingPillar?.isActive ?? true}
              onChange={(e) => setEditingPillar({ ...editingPillar, isActive: e.target.checked })}
              className="w-4 h-4 rounded admin-panel admin-border accent-amber-400 focus:ring-0"
            />
            <label htmlFor="pillarActive" className="text-xs admin-text">
              Active on public website
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t admin-border">
            <GlassButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setEditingPillar(null)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
            >
              Save Programme
            </GlassButton>
          </div>
        </form>
      </GlassDrawer>
    </div>
  );
}
