'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Plus, Edit2, Trash2, CheckCircle, XCircle, DollarSign, Layers } from 'lucide-react';

interface Pillar {
  id: string;
  key: string;
  title: string;
  description: string;
  targetAmountUSD: number;
  raisedAmountUSD: number;
  iconEmoji?: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { donations: number };
}

interface Donation {
  id: string;
  pillarKey: string;
  donorName: string;
  donorEmail: string;
  amountUSD: number;
  frequency: string;
  status: string;
  receiptNumber: string;
  createdAt: string;
  pillar?: { title: string; key: string };
}

const EMPTY_PILLAR: Omit<Pillar, 'id'> = {
  key: '',
  title: '',
  description: '',
  targetAmountUSD: 20000,
  raisedAmountUSD: 0,
  iconEmoji: 'leaf',
  isActive: true,
  sortOrder: 0,
};

export default function AdminDonateSettingsPage() {
  const [activeTab, setActiveTab] = useState<'pillars' | 'donations'>('pillars');
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalDonationsUSD, setTotalDonationsUSD] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Pillar modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_PILLAR);
  const [saving, setSaving] = useState(false);
  const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        fetch('/api/admin/support-pillars'),
        fetch('/api/admin/donations'),
      ]);
      const pData = await pRes.json();
      const dData = await dRes.json();
      if (pData.pillars) setPillars(pData.pillars);
      if (dData.donations) setDonations(dData.donations);
      if (dData.totalUSD) setTotalDonationsUSD(dData.totalUSD);
    } catch {
      showFlash('error', 'Failed to load support pillars and donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFlash = (type: 'success' | 'error', text: string) => {
    setFlashMsg({ type, text });
    setTimeout(() => setFlashMsg(null), 4000);
  };

  const openCreate = () => {
    setForm(EMPTY_PILLAR);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (p: Pillar) => {
    setForm({
      key: p.key,
      title: p.title,
      description: p.description,
      targetAmountUSD: p.targetAmountUSD,
      raisedAmountUSD: p.raisedAmountUSD,
      iconEmoji: p.iconEmoji || 'leaf',
      isActive: p.isActive,
      sortOrder: p.sortOrder,
    });
    setEditId(p.id);
    setShowModal(true);
  };

  const handleSavePillar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key.trim() || !form.title.trim() || !form.description.trim()) {
      showFlash('error', 'Key, title, and description are required.');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/support-pillars';
      const method = editId ? 'PUT' : 'POST';
      const payload = editId ? { id: editId, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', editId ? 'Pillar updated.' : 'Pillar created.');
        setShowModal(false);
        loadData();
      } else {
        showFlash('error', data.error || 'Save failed.');
      }
    } catch (err: any) {
      showFlash('error', err.message || 'Error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePillar = async (id: string, title: string) => {
    if (!confirm(`Delete support pillar "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/support-pillars?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFlash('success', `Deleted "${title}".`);
        loadData();
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
            <Heart className="w-6 h-6 text-rose-500" />
            Donations & Artisan Support CMS
          </h1>
          <p className="text-sm admin-muted mt-1">
            Manage public donation support pillars, fundraising goals, and live donation transaction records.
          </p>
        </div>
        {activeTab === 'pillars' && (
          <button
            onClick={openCreate}
            className="admin-button-primary px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Support Pillar
          </button>
        )}
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

      {/* Tab Navigation */}
      <div className="flex border-b admin-border gap-6">
        <button
          onClick={() => setActiveTab('pillars')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'pillars'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent admin-muted hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          Support Pillars ({pillars.length})
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'donations'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent admin-muted hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Donations Ledger ({donations.length})
        </button>
      </div>

      {/* Tab 1: Pillars */}
      {activeTab === 'pillars' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 p-12 text-center admin-muted">Loading support pillars...</div>
          ) : pillars.length === 0 ? (
            <div className="col-span-2 p-12 text-center admin-muted">No support pillars configured.</div>
          ) : (
            pillars.map((p) => {
              const pct = p.targetAmountUSD > 0 ? Math.min(100, Math.round((p.raisedAmountUSD / p.targetAmountUSD) * 100)) : 0;
              return (
                <div key={p.id} className="admin-card rounded-xl border admin-border p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {p.key}
                        </span>
                        {p.isActive ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-slate-500/10 text-slate-400 border border-slate-500/20">
                            Hidden
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold admin-title mt-1.5">{p.title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded hover:bg-white/10 text-amber-400 transition"
                        title="Edit pillar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePillar(p.id, p.title)}
                        className="p-1.5 rounded hover:bg-white/10 text-rose-400 transition"
                        title="Delete pillar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm admin-text line-clamp-3">{p.description}</p>

                  <div className="space-y-1.5 pt-2 border-t admin-border">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="admin-muted">Progress ({pct}%)</span>
                      <span className="admin-title">
                        ${p.raisedAmountUSD.toLocaleString()} / ${p.targetAmountUSD.toLocaleString()} USD
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Donations Ledger */}
      {activeTab === 'donations' && (
        <div className="space-y-4">
          <div className="admin-card p-4 rounded-xl border admin-border flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold admin-muted uppercase tracking-wider">Total Received</span>
              <div className="text-2xl font-bold admin-title text-emerald-400 mt-0.5">
                ${totalDonationsUSD.toLocaleString()} USD
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold admin-muted uppercase tracking-wider">Total Contributions</span>
              <div className="text-2xl font-bold admin-title mt-0.5">{donations.length}</div>
            </div>
          </div>

          <div className="admin-card rounded-xl border admin-border overflow-hidden">
            {loading ? (
              <div className="p-12 text-center admin-muted">Loading donations...</div>
            ) : donations.length === 0 ? (
              <div className="p-12 text-center admin-muted">No public donations recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b admin-border bg-black/20 text-xs font-semibold admin-muted uppercase tracking-wider">
                      <th className="px-5 py-3">Receipt / Date</th>
                      <th className="px-5 py-3">Donor</th>
                      <th className="px-5 py-3">Pillar</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Frequency</th>
                      <th className="px-5 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y admin-border text-sm">
                    {donations.map((d) => (
                      <tr key={d.id} className="hover:bg-white/[0.02]">
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-xs admin-title">{d.receiptNumber}</div>
                          <div className="text-xs admin-muted">
                            {new Date(d.createdAt).toLocaleDateString('en-GB')}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium admin-title">{d.donorName}</div>
                          <div className="text-xs admin-muted">{d.donorEmail}</div>
                        </td>
                        <td className="px-5 py-3.5 admin-text font-mono text-xs">
                          {d.pillar?.title || d.pillarKey}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-emerald-400">
                          ${d.amountUSD.toLocaleString()} USD
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {d.frequency}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pillar Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="admin-card w-full max-w-lg rounded-2xl border admin-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b admin-border pb-3">
              <h2 className="text-lg font-bold admin-title">
                {editId ? 'Edit Support Pillar' : 'Add Support Pillar'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="admin-muted hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePillar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">Pillar Key *</label>
                <input
                  type="text"
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  placeholder="emergency-relief"
                  disabled={!!editId}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Artisan Emergency Relief Fund"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Direct grants for raw material shortages, tool loss..."
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Target USD *</label>
                  <input
                    type="number"
                    value={form.targetAmountUSD}
                    onChange={(e) => setForm({ ...form, targetAmountUSD: Number(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Raised USD</label>
                  <input
                    type="number"
                    value={form.raisedAmountUSD}
                    onChange={(e) => setForm({ ...form, raisedAmountUSD: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActivePillar"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="isActivePillar" className="text-sm admin-title font-medium">
                  Active (visible on donate page)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg admin-button-secondary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm rounded-lg admin-button-primary font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Pillar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
