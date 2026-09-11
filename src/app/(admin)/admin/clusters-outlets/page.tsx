'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Store, MapPin, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Eye, Star } from 'lucide-react';
import Link from 'next/link';

interface Cluster {
  id: string;
  key: string;
  name: string;
  craftKey: string;
  dzongkhag: string;
  members: number;
  established: number;
  isFeatured: boolean;
  sortOrder: number;
  summary: string;
  story: string;
  visitorNote?: string | null;
}

interface Outlet {
  id: string;
  key: string;
  type: string;
  name: string;
  sortOrder: number;
  isFeatured: boolean;
  place: string;
  note?: string | null;
  description: string;
  longDescription: string;
  hours: string;
  stalls?: string | null;
  craftsOnSite?: string | null;
  payment?: string | null;
  gettingThere?: string | null;
  facilities?: string | null;
}

export default function AdminClustersOutletsPage() {
  const [tab, setTab] = useState<'CLUSTERS' | 'OUTLETS'>('CLUSTERS');
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Cluster Modals
  const [editingCluster, setEditingCluster] = useState<Cluster | null>(null);
  const [isNewCluster, setIsNewCluster] = useState(false);
  const [clusterForm, setClusterForm] = useState({
    key: '',
    name: '',
    craftKey: 'thagzo',
    dzongkhag: 'Thimphu',
    members: 20,
    established: 2020,
    isFeatured: false,
    sortOrder: 0,
    summary: '',
    story: '',
    visitorNote: '',
  });

  // Outlet Modals
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [isNewOutlet, setIsNewOutlet] = useState(false);
  const [outletForm, setOutletForm] = useState({
    key: '',
    type: 'OUTLET',
    name: '',
    sortOrder: 0,
    isFeatured: false,
    place: '',
    note: '',
    description: '',
    longDescription: '',
    hours: '09:00 - 18:00 daily',
    stalls: '',
    craftsOnSite: '',
    payment: 'Cash, card and mBoB accepted',
    gettingThere: '',
    facilities: '',
  });

  const [deleting, setDeleting] = useState<{ type: 'CLUSTER' | 'OUTLET'; id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, oRes] = await Promise.all([
        fetch('/api/admin/clusters', { credentials: 'include' }),
        fetch('/api/admin/outlets', { credentials: 'include' }),
      ]);
      const cData = await cRes.json();
      const oData = await oRes.json();
      if (cData?.clusters) setClusters(cData.clusters);
      if (oData?.outlets) setOutlets(oData.outlets);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load clusters and outlets' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Cluster
  const handleSaveCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const url = '/api/admin/clusters';
      const method = isNewCluster ? 'POST' : 'PUT';
      const payload = isNewCluster ? clusterForm : { ...clusterForm, id: editingCluster?.id };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: `Cluster "${clusterForm.name}" saved successfully!` });
        setEditingCluster(null);
        setIsNewCluster(false);
        loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save cluster' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error saving cluster' });
    } finally {
      setSubmitting(false);
    }
  };

  // Save Outlet
  const handleSaveOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const url = '/api/admin/outlets';
      const method = isNewOutlet ? 'POST' : 'PUT';
      const payload = isNewOutlet ? outletForm : { ...outletForm, id: editingOutlet?.id };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: `Outlet "${outletForm.name}" saved successfully!` });
        setEditingOutlet(null);
        setIsNewOutlet(false);
        loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save outlet' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error saving outlet' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      const url =
        deleting.type === 'CLUSTER'
          ? `/api/admin/clusters?id=${deleting.id}`
          : `/api/admin/outlets?id=${deleting.id}`;
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: `${deleting.name} deleted successfully.` });
        setDeleting(null);
        loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Delete failed' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error deleting item' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b admin-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold admin-title tracking-tight">Clusters &amp; Outlets Management</h1>
          <p className="text-sm admin-muted mt-1">
            Dynamic control over Bhutan’s verified artisan clusters and official craft market outlets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tab === 'CLUSTERS' ? (
            <button
              type="button"
              onClick={() => {
                setIsNewCluster(true);
                setEditingCluster({} as any);
                setClusterForm({
                  key: '',
                  name: '',
                  craftKey: 'thagzo',
                  dzongkhag: 'Thimphu',
                  members: 20,
                  established: new Date().getFullYear(),
                  isFeatured: false,
                  sortOrder: clusters.length + 1,
                  summary: '',
                  story: '',
                  visitorNote: '',
                });
              }}
              className="admin-button-primary flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Add Artisan Cluster
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsNewOutlet(true);
                setEditingOutlet({} as any);
                setOutletForm({
                  key: '',
                  type: 'OUTLET',
                  name: '',
                  sortOrder: outlets.length + 1,
                  isFeatured: false,
                  place: '',
                  note: '',
                  description: '',
                  longDescription: '',
                  hours: '09:00 - 18:00 daily',
                  stalls: '',
                  craftsOnSite: '',
                  payment: 'Cash, card and mBoB accepted',
                  gettingThere: '',
                  facilities: '',
                });
              }}
              className="admin-button-primary flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Add Outlet / Market
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b admin-border pb-2">
        <button
          type="button"
          onClick={() => setTab('CLUSTERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'CLUSTERS'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'admin-muted hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Artisan Clusters ({clusters.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('OUTLETS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'OUTLETS'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'admin-muted hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          Outlets &amp; Markets ({outlets.length})
        </button>
      </div>

      {/* Alerts */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm admin-muted">Loading directory records...</div>
      ) : tab === 'CLUSTERS' ? (
        /* CLUSTERS LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusters.map((c) => (
            <div key={c.id} className="admin-card rounded-xl p-5 space-y-3 relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-amber-400 font-bold">
                        {c.dzongkhag}
                      </span>
                      {c.isFeatured && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                          <Star className="w-3 h-3 fill-amber-300" /> Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold admin-title mt-1">{c.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewCluster(false);
                        setEditingCluster(c);
                        setClusterForm({
                          key: c.key,
                          name: c.name,
                          craftKey: c.craftKey,
                          dzongkhag: c.dzongkhag,
                          members: c.members,
                          established: c.established,
                          isFeatured: c.isFeatured,
                          sortOrder: c.sortOrder,
                          summary: c.summary,
                          story: c.story,
                          visitorNote: c.visitorNote || '',
                        });
                      }}
                      className="p-1.5 rounded admin-hover text-slate-300 hover:text-white"
                      title="Edit cluster"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting({ type: 'CLUSTER', id: c.id, name: c.name })}
                      className="p-1.5 rounded admin-hover text-rose-400 hover:text-rose-200"
                      title="Delete cluster"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs admin-text line-clamp-3 mt-2 font-serif">{c.summary}</p>
              </div>

              <div className="pt-3 border-t admin-border flex items-center justify-between text-xs admin-muted">
                <span>
                  Craft: <strong className="text-slate-200 font-mono">{c.craftKey}</strong> · {c.members} artisans
                </span>
                <Link
                  href={`/clusters/${c.key}`}
                  target="_blank"
                  className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  View live <Eye className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* OUTLETS LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outlets.map((o) => (
            <div key={o.id} className="admin-card rounded-xl p-5 space-y-3 relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-amber-400 font-bold">
                        {o.type}
                      </span>
                      {o.isFeatured && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                          <Star className="w-3 h-3 fill-amber-300" /> Featured Market
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold admin-title mt-1">{o.name}</h3>
                    <p className="text-xs admin-muted font-mono mt-0.5">{o.place}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewOutlet(false);
                        setEditingOutlet(o);
                        setOutletForm({
                          key: o.key,
                          type: o.type,
                          name: o.name,
                          sortOrder: o.sortOrder,
                          isFeatured: o.isFeatured,
                          place: o.place,
                          note: o.note || '',
                          description: o.description,
                          longDescription: o.longDescription,
                          hours: o.hours,
                          stalls: o.stalls || '',
                          craftsOnSite: o.craftsOnSite || '',
                          payment: o.payment || '',
                          gettingThere: o.gettingThere || '',
                          facilities: o.facilities || '',
                        });
                      }}
                      className="p-1.5 rounded admin-hover text-slate-300 hover:text-white"
                      title="Edit outlet"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting({ type: 'OUTLET', id: o.id, name: o.name })}
                      className="p-1.5 rounded admin-hover text-rose-400 hover:text-rose-200"
                      title="Delete outlet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs admin-text line-clamp-3 mt-2 font-serif">{o.description}</p>
              </div>

              <div className="pt-3 border-t admin-border flex items-center justify-between text-xs admin-muted">
                <span>{o.hours}</span>
                <Link
                  href={`/outlets/${o.key}`}
                  target="_blank"
                  className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  View live <Eye className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cluster Edit/Create Modal */}
      {editingCluster && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-modal w-full max-w-2xl rounded-xl p-6 space-y-4 my-8">
            <h2 className="text-lg font-bold admin-title">
              {isNewCluster ? 'Add New Artisan Cluster' : `Edit Cluster: ${editingCluster.name}`}
            </h2>
            <form onSubmit={handleSaveCluster} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block admin-muted mb-1">Cluster Key (URL slug)</label>
                  <input
                    className="admin-input w-full p-2 rounded"
                    value={clusterForm.key}
                    onChange={(e) => setClusterForm({ ...clusterForm, key: e.target.value })}
                    disabled={!isNewCluster}
                    required
                  />
                </div>
                <div>
                  <label className="block admin-muted mb-1">Cluster Name</label>
                  <input
                    className="admin-input w-full p-2 rounded"
                    value={clusterForm.name}
                    onChange={(e) => setClusterForm({ ...clusterForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block admin-muted mb-1">Primary Craft Key</label>
                  <input
                    className="admin-input w-full p-2 rounded font-mono"
                    value={clusterForm.craftKey}
                    onChange={(e) => setClusterForm({ ...clusterForm, craftKey: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block admin-muted mb-1">Dzongkhag</label>
                  <input
                    className="admin-input w-full p-2 rounded"
                    value={clusterForm.dzongkhag}
                    onChange={(e) => setClusterForm({ ...clusterForm, dzongkhag: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block admin-muted mb-1">Artisan Members Count</label>
                  <input
                    type="number"
                    className="admin-input w-full p-2 rounded font-mono"
                    value={clusterForm.members}
                    onChange={(e) => setClusterForm({ ...clusterForm, members: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block admin-muted mb-1">Established Year</label>
                  <input
                    type="number"
                    className="admin-input w-full p-2 rounded font-mono"
                    value={clusterForm.established}
                    onChange={(e) => setClusterForm({ ...clusterForm, established: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block admin-muted mb-1">Short Summary</label>
                <textarea
                  rows={2}
                  className="admin-input w-full p-2 rounded"
                  value={clusterForm.summary}
                  onChange={(e) => setClusterForm({ ...clusterForm, summary: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block admin-muted mb-1">Detailed Heritage Story</label>
                <textarea
                  rows={4}
                  className="admin-input w-full p-2 rounded"
                  value={clusterForm.story}
                  onChange={(e) => setClusterForm({ ...clusterForm, story: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block admin-muted mb-1">Visitor Note</label>
                <input
                  className="admin-input w-full p-2 rounded"
                  value={clusterForm.visitorNote}
                  onChange={(e) => setClusterForm({ ...clusterForm, visitorNote: e.target.value })}
                  placeholder="e.g. Best visited between October and May"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clusterForm.isFeatured}
                    onChange={(e) => setClusterForm({ ...clusterForm, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <span>Featured Cluster</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setEditingCluster(null)}
                  className="admin-button-secondary py-2 px-4 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-button-primary py-2 px-4 rounded text-xs"
                >
                  {submitting ? 'Saving...' : 'Save Cluster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Outlet Edit/Create Modal */}
      {editingOutlet && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-modal w-full max-w-2xl rounded-xl p-6 space-y-4 my-8">
            <h2 className="text-lg font-bold admin-title">
              {isNewOutlet ? 'Add New Outlet / Market' : `Edit Outlet: ${editingOutlet.name}`}
            </h2>
            <form onSubmit={handleSaveOutlet} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block admin-muted mb-1">Outlet Key (URL slug)</label>
                  <input
                    className="admin-input w-full p-2 rounded"
                    value={outletForm.key}
                    onChange={(e) => setOutletForm({ ...outletForm, key: e.target.value })}
                    disabled={!isNewOutlet}
                    required
                  />
                </div>
                <div>
                  <label className="block admin-muted mb-1">Outlet Name</label>
                  <input
                    className="admin-input w-full p-2 rounded"
                    value={outletForm.name}
                    onChange={(e) => setOutletForm({ ...outletForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block admin-muted mb-1">Type</label>
                  <select
                    className="admin-input w-full p-2 rounded"
                    value={outletForm.type}
                    onChange={(e) => setOutletForm({ ...outletForm, type: e.target.value })}
                  >
                    <option value="MARKET">MARKET</option>
                    <option value="OUTLET">OUTLET</option>
                    <option value="COUNTER">COUNTER</option>
                  </select>
                </div>
                <div>
                  <label className="block admin-muted mb-1">Location / Place</label>
                  <input
                    className="admin-input w-full p-2 rounded"
                    value={outletForm.place}
                    onChange={(e) => setOutletForm({ ...outletForm, place: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block admin-muted mb-1">Opening Hours</label>
                  <input
                    className="admin-input w-full p-2 rounded"
                    value={outletForm.hours}
                    onChange={(e) => setOutletForm({ ...outletForm, hours: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block admin-muted mb-1">Stalls</label>
                  <input
                    className="admin-input w-full p-2 rounded"
                    value={outletForm.stalls}
                    onChange={(e) => setOutletForm({ ...outletForm, stalls: e.target.value })}
                    placeholder="e.g. 32 covered stalls"
                  />
                </div>
              </div>

              <div>
                <label className="block admin-muted mb-1">Short Description</label>
                <textarea
                  rows={2}
                  className="admin-input w-full p-2 rounded"
                  value={outletForm.description}
                  onChange={(e) => setOutletForm({ ...outletForm, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block admin-muted mb-1">Long Editorial Description</label>
                <textarea
                  rows={3}
                  className="admin-input w-full p-2 rounded"
                  value={outletForm.longDescription}
                  onChange={(e) => setOutletForm({ ...outletForm, longDescription: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block admin-muted mb-1">Crafts on Site</label>
                  <input
                    className="admin-input w-full p-2 rounded"
                    value={outletForm.craftsOnSite}
                    onChange={(e) => setOutletForm({ ...outletForm, craftsOnSite: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block admin-muted mb-1">Payment Accepted</label>
                  <input
                    className="admin-input w-full p-2 rounded"
                    value={outletForm.payment}
                    onChange={(e) => setOutletForm({ ...outletForm, payment: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={outletForm.isFeatured}
                    onChange={(e) => setOutletForm({ ...outletForm, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <span>Featured Market (Highlights banner)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setEditingOutlet(null)}
                  className="admin-button-secondary py-2 px-4 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-button-primary py-2 px-4 rounded text-xs"
                >
                  {submitting ? 'Saving...' : 'Save Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="admin-modal w-full max-w-md rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-rose-300">Confirm Deletion</h2>
            <p className="text-xs admin-text">
              Are you sure you want to permanently delete <strong>{deleting.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t admin-border">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="admin-button-secondary py-1.5 px-3 rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-1.5 px-3 rounded text-xs"
              >
                {submitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
