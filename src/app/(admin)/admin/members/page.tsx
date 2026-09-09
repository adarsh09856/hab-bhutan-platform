'use client';

import React, { useState, useEffect } from 'react';
import { CRAFTS } from '@/lib/data';

const DZONGKHAGS = [
  'Thimphu', 'Paro', 'Punakha', 'Wangdue Phodrang', 'Chhukha', 'Haa', 'Samtse',
  'Dagana', 'Tsirang', 'Sarpang', 'Trongsa', 'Bumthang', 'Zhemgang', 'Mongar',
  'Lhuntse', 'Trashigang', 'Trashi Yangtse', 'Pema Gatshel', 'Samdrup Jongkhar', 'Gasa'
];

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterCraft, setFilterCraft] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [deletingMember, setDeletingMember] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states for create
  const [createForm, setCreateForm] = useState({
    name: '',
    craftKey: CRAFTS[0].key,
    dzongkhag: 'Thimphu',
    joinYear: new Date().getFullYear().toString(),
    tier: 'ACTIVE_SECTOR_MEMBER',
    status: 'VERIFIED',
    cidNumber: '',
    businessLicense: '',
    bio: '',
    portraitUrl: '',
    duesExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const loadMembers = async () => {
    setLoading(true);
    setActionError('');
    try {
      const res = await fetch('/api/admin/members', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      } else {
        const err = await res.json();
        setActionError(err.error || 'Failed to fetch members from PostgreSQL.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error fetching members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActionSuccess(`✓ Member "${data.member.name}" successfully registered (${data.member.regNumber}).`);
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          craftKey: CRAFTS[0].key,
          dzongkhag: 'Thimphu',
          joinYear: new Date().getFullYear().toString(),
          tier: 'ACTIVE_SECTOR_MEMBER',
          status: 'VERIFIED',
          cidNumber: '',
          businessLicense: '',
          bio: '',
          portraitUrl: '',
          duesExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        });
        await loadMembers();
      } else {
        setActionError(data.error || 'Failed to create member.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error creating member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMember.id,
          name: editingMember.name,
          craftKey: editingMember.craftKey,
          dzongkhag: editingMember.dzongkhag,
          tier: editingMember.tier,
          status: editingMember.status,
          cidNumber: editingMember.cidNumber,
          businessLicense: editingMember.businessLicense,
          bio: editingMember.bio,
          portraitUrl: editingMember.portraitUrl,
          duesExpiryDate: editingMember.duesExpiryDate,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActionSuccess(`✓ Member "${data.member.name}" profile successfully updated.`);
        setEditingMember(null);
        if (selectedMember?.id === editingMember.id) {
          setSelectedMember(data.member);
        }
        await loadMembers();
      } else {
        setActionError(data.error || 'Failed to update member.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error updating member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`✓ Status updated to ${newStatus}.`);
        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );
        if (selectedMember?.id === id) {
          setSelectedMember({ ...selectedMember, status: newStatus });
        }
        setTimeout(() => setActionSuccess(''), 4000);
      } else {
        setActionError(data.error || 'Failed to update status.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch(`/api/admin/members?id=${deletingMember.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActionSuccess(data.message || `✓ Member successfully deleted.`);
        setDeletingMember(null);
        if (selectedMember?.id === deletingMember.id) {
          setSelectedMember(null);
        }
        await loadMembers();
      } else {
        setActionError(data.error || 'Failed to delete member.');
        setDeletingMember(null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
      setDeletingMember(null);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = members.filter((m) => {
    const matchQ =
      !filterQuery ||
      m.name?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.dzongkhag?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.regNumber?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.cidNumber?.toLowerCase().includes(filterQuery.toLowerCase());
    const matchCraft = !filterCraft || m.craftKey === filterCraft;
    return matchQ && matchCraft;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold admin-title tracking-tight">Member CRM &amp; Artisans Registry</h1>
          <p className="text-sm admin-muted mt-1">
            Complete management of certified Bhutanese handicraft enterprises, artisans, and guild members.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition"
          >
            <span>+</span>
            <span>Register New Member</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium rounded-md flex justify-between items-center">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-300 font-bold ml-2">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium rounded-md flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-rose-300 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filter controls */}
      <div className="flex gap-4 items-center admin-card p-4 border admin-border rounded-lg shadow-sm flex-wrap">
        <input
          type="text"
          placeholder="Search by enterprise name, dzongkhag, registration #, CID..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="flex-1 min-w-[240px] text-xs border border-slate-300 rounded px-3 py-2 outline-none focus:border-slate-500 font-sans"
        />
        <select
          value={filterCraft}
          onChange={(e) => setFilterCraft(e.target.value)}
          className="text-xs border border-slate-300 rounded px-3 py-2 outline-none focus:border-slate-500 admin-card"
        >
          <option value="">All 13 Traditional Crafts</option>
          {CRAFTS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.name} ({c.english})
            </option>
          ))}
        </select>
      </div>

      {/* Member Table */}
      <div className="admin-card border admin-border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center admin-muted text-xs font-mono">
            Loading artisan members from PostgreSQL...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="admin-panel border-b admin-border admin-text font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Registration #</th>
                  <th className="py-3 px-4">Enterprise / Master Artisan</th>
                  <th className="py-3 px-4">Craft Tradition</th>
                  <th className="py-3 px-4">Dzongkhag</th>
                  <th className="py-3 px-4">Products / Orders</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y admin-divider">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:admin-panel/75 transition-colors">
                    <td className="py-3 px-4 font-mono admin-text font-medium">{m.regNumber}</td>
                    <td className="py-3 px-4 font-medium admin-title">
                      <div>{m.name}</div>
                      <div className="text-[11px] admin-muted font-mono">CID: {m.cidNumber || '—'}</div>
                    </td>
                    <td className="py-3 px-4 admin-text">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded admin-panel admin-text">
                        {m.craft?.name || m.craftKey}
                      </span>
                    </td>
                    <td className="py-3 px-4 admin-text">{m.dzongkhag}</td>
                    <td className="py-3 px-4 admin-text font-mono text-[11px]">
                      {m.products?.length || 0} crafts / {m.orders?.length || 0} orders
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          m.status === 'VERIFIED'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : m.status === 'SUSPENDED'
                            ? 'bg-rose-500/15 text-rose-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="admin-text hover:admin-title font-medium px-2 py-1 rounded hover:admin-panel"
                      >
                        Dossier
                      </button>
                      <button
                        onClick={() => {
                          setEditingMember({
                            ...m,
                            duesExpiryDate: m.duesExpiryDate ? new Date(m.duesExpiryDate).toISOString().slice(0, 10) : '',
                          });
                        }}
                        className="text-indigo-300 hover:text-indigo-200 font-medium px-2 py-1 rounded hover:bg-indigo-500/15"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingMember(m)}
                        className="text-rose-300 hover:text-rose-300 font-medium px-2 py-1 rounded hover:bg-rose-500/15"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center admin-muted">
                      No members registered in database matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register New Member Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-card rounded-xl max-w-xl w-full p-6 shadow-2xl border admin-border space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <div>
                <h3 className="font-bold admin-title text-base">Register New Member Artisan</h3>
                <p className="text-xs admin-muted">Directly accredit an artisan enterprise into the national registry.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="admin-muted hover:admin-text font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block admin-text font-semibold mb-1">Artisan / Enterprise Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g. Tshering Handicrafts or Pema Lhaden"
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:border-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Craft Tradition *</label>
                  <select
                    value={createForm.craftKey}
                    onChange={(e) => setCreateForm({ ...createForm, craftKey: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 admin-card"
                  >
                    {CRAFTS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name} ({c.english})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Dzongkhag *</label>
                  <select
                    value={createForm.dzongkhag}
                    onChange={(e) => setCreateForm({ ...createForm, dzongkhag: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 admin-card"
                  >
                    {DZONGKHAGS.map((dz) => (
                      <option key={dz} value={dz}>{dz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Citizenship ID (11 Digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={createForm.cidNumber}
                    onChange={(e) => setCreateForm({ ...createForm, cidNumber: e.target.value })}
                    placeholder="10702001489"
                    className="w-full border border-slate-300 rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Trade License / Reg No.</label>
                  <input
                    type="text"
                    value={createForm.businessLicense}
                    onChange={(e) => setCreateForm({ ...createForm, businessLicense: e.target.value })}
                    placeholder="RGoB/CRA/2026/0491"
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Membership Tier</label>
                  <select
                    value={createForm.tier}
                    onChange={(e) => setCreateForm({ ...createForm, tier: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 admin-card"
                  >
                    <option value="ACTIVE_SECTOR_MEMBER">Active Sector Member</option>
                    <option value="ASSOCIATE_SECTOR_MEMBER">Associate Sector Member</option>
                    <option value="INSTITUTIONAL">Institutional</option>
                  </select>
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Initial Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 admin-card"
                  >
                    <option value="VERIFIED">Verified</option>
                    <option value="PENDING">Pending Verification</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Join Year</label>
                  <input
                    type="number"
                    value={createForm.joinYear}
                    onChange={(e) => setCreateForm({ ...createForm, joinYear: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Dues Expiry Date</label>
                  <input
                    type="date"
                    value={createForm.duesExpiryDate}
                    onChange={(e) => setCreateForm({ ...createForm, duesExpiryDate: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block admin-text font-semibold mb-1">Portrait Image URL</label>
                  <input
                    type="text"
                    value={createForm.portraitUrl}
                    onChange={(e) => setCreateForm({ ...createForm, portraitUrl: e.target.value })}
                    placeholder="/images/artisan-default.jpg"
                    className="w-full border border-slate-300 rounded px-3 py-2 font-mono text-[11px]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block admin-text font-semibold mb-1">Artisan Bio &amp; Craft Background</label>
                  <textarea
                    rows={3}
                    value={createForm.bio}
                    onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                    placeholder="Generational weaver specialising in natural dye yathra and bura silks..."
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded admin-text hover:admin-panel font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-card rounded-xl max-w-xl w-full p-6 shadow-2xl border admin-border space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b admin-border pb-3">
              <div>
                <h3 className="font-bold admin-title text-base">Edit Member: {editingMember.name}</h3>
                <p className="text-xs admin-muted font-mono">Reg: {editingMember.regNumber}</p>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="admin-muted hover:admin-text font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block admin-text font-semibold mb-1">Artisan / Enterprise Name *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:border-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Craft Tradition</label>
                  <select
                    value={editingMember.craftKey}
                    onChange={(e) => setEditingMember({ ...editingMember, craftKey: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 admin-card"
                  >
                    {CRAFTS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name} ({c.english})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Dzongkhag</label>
                  <select
                    value={editingMember.dzongkhag}
                    onChange={(e) => setEditingMember({ ...editingMember, dzongkhag: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 admin-card"
                  >
                    {DZONGKHAGS.map((dz) => (
                      <option key={dz} value={dz}>{dz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Citizenship ID (11 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={editingMember.cidNumber || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, cidNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Trade License / Reg No.</label>
                  <input
                    type="text"
                    value={editingMember.businessLicense || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, businessLicense: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Membership Tier</label>
                  <select
                    value={editingMember.tier}
                    onChange={(e) => setEditingMember({ ...editingMember, tier: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 admin-card"
                  >
                    <option value="ACTIVE_SECTOR_MEMBER">Active Sector Member</option>
                    <option value="ASSOCIATE_SECTOR_MEMBER">Associate Sector Member</option>
                    <option value="INSTITUTIONAL">Institutional</option>
                  </select>
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Status</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 admin-card"
                  >
                    <option value="VERIFIED">Verified</option>
                    <option value="PENDING">Pending Verification</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Dues Expiry Date</label>
                  <input
                    type="date"
                    value={editingMember.duesExpiryDate || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, duesExpiryDate: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block admin-text font-semibold mb-1">Portrait URL</label>
                  <input
                    type="text"
                    value={editingMember.portraitUrl || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, portraitUrl: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 font-mono text-[11px]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block admin-text font-semibold mb-1">Artisan Bio</label>
                  <textarea
                    rows={3}
                    value={editingMember.bio || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border border-slate-300 rounded admin-text hover:admin-panel font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Guard Warning */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="admin-card rounded-xl max-w-md w-full p-6 shadow-2xl border admin-border space-y-4">
            <h3 className="font-bold admin-title text-base">Permanently Delete Member?</h3>
            <p className="text-xs admin-text leading-relaxed">
              Are you sure you want to permanently delete <strong className="admin-title">{deletingMember.name}</strong> ({deletingMember.regNumber})?
            </p>

            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded text-[11px] text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <span>⚠️</span> Referential Integrity Safeguard
              </div>
              <p>
                Hard deletion is only permitted if this member is associated with <strong>0 catalog products</strong> and <strong>0 orders</strong>. If crafts or orders exist, the system will reject the deletion. In that scenario, suspend the member profile instead.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingMember(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium admin-text hover:admin-panel"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Dossier Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="admin-card rounded-xl max-w-lg w-full p-6 shadow-xl border admin-border space-y-4">
            <div className="flex justify-between items-start border-b admin-border pb-3">
              <div>
                <h3 className="font-bold admin-title text-base">{selectedMember.name}</h3>
                <p className="text-xs admin-muted font-mono mt-0.5">Registration: {selectedMember.regNumber}</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="admin-muted hover:admin-text font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 admin-panel p-3 rounded border admin-border">
                <div>
                  <span className="admin-muted block text-[11px]">Dzongkhag</span>
                  <span className="font-medium admin-text">{selectedMember.dzongkhag}</span>
                </div>
                <div>
                  <span className="admin-muted block text-[11px]">Citizenship ID (CID)</span>
                  <span className="font-mono font-medium admin-text">{selectedMember.cidNumber || '—'}</span>
                </div>
                <div>
                  <span className="admin-muted block text-[11px]">Primary Craft</span>
                  <span className="font-medium admin-text">{selectedMember.craft?.name || selectedMember.craftKey}</span>
                </div>
                <div>
                  <span className="admin-muted block text-[11px]">Current Status</span>
                  <span className="font-semibold admin-text">{selectedMember.status}</span>
                </div>
                <div>
                  <span className="admin-muted block text-[11px]">Associated Catalog Crafts</span>
                  <span className="font-mono font-medium admin-text">{selectedMember.products?.length || 0} items</span>
                </div>
                <div>
                  <span className="admin-muted block text-[11px]">Order References</span>
                  <span className="font-mono font-medium admin-text">{selectedMember.orders?.length || 0} orders</span>
                </div>
              </div>

              {selectedMember.bio && (
                <div>
                  <span className="admin-muted block text-[11px] mb-1 font-semibold">Artisan Biography</span>
                  <p className="admin-text admin-panel p-2.5 rounded border admin-border leading-relaxed font-sans">
                    {selectedMember.bio}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t admin-border flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingMember({
                      ...selectedMember,
                      duesExpiryDate: selectedMember.duesExpiryDate ? new Date(selectedMember.duesExpiryDate).toISOString().slice(0, 10) : '',
                    });
                    setSelectedMember(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/20 border border-indigo-500/30 rounded"
                >
                  Edit Full Profile
                </button>
              </div>
              <div className="flex gap-2">
                {selectedMember.status !== 'SUSPENDED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedMember.id, 'SUSPENDED')}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/15 border border-rose-500/30 rounded"
                  >
                    Suspend Member
                  </button>
                )}
                {selectedMember.status !== 'VERIFIED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedMember.id, 'VERIFIED')}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm"
                  >
                    Verify &amp; Accredit
                  </button>
                )}
                <button
                  onClick={() => {
                    setDeletingMember(selectedMember);
                    setSelectedMember(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-300 border border-rose-500/30 hover:bg-rose-500/15 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
