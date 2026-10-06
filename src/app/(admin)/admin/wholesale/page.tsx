'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Key, 
  Search, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Percent,
  Mail,
  Phone,
  Calendar,
  Lock
} from 'lucide-react';

interface WholesaleBuyerItem {
  id: string;
  username: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  country: string;
  city?: string | null;
  taxId?: string | null;
  discountTier: number;
  status: string; // ACTIVE | INACTIVE | PENDING | SUSPENDED
  notes?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

const EMPTY_FORM = {
  username: '',
  password: '',
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  country: 'Bhutan',
  city: 'Thimphu',
  taxId: '',
  discountTier: 20,
  status: 'ACTIVE',
  notes: '',
};

export default function AdminWholesalePage() {
  const [buyers, setBuyers] = useState<WholesaleBuyerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset password modal
  const [resetModalId, setResetModalId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadBuyers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/wholesale', { cache: 'no-store' });
      const data = await res.json();
      if (data.buyers) setBuyers(data.buyers);
    } catch {
      showFlash('error', 'Failed to load wholesale buyers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuyers();
  }, []);

  const showFlash = (type: 'success' | 'error', text: string) => {
    setFlashMsg({ type, text });
    setTimeout(() => setFlashMsg(null), 4000);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (b: WholesaleBuyerItem) => {
    setForm({
      username: b.username,
      password: '', // Leave blank unless changing
      companyName: b.companyName,
      contactName: b.contactName,
      email: b.email,
      phone: b.phone || '',
      country: b.country || 'Bhutan',
      city: b.city || '',
      taxId: b.taxId || '',
      discountTier: b.discountTier || 20,
      status: b.status || 'ACTIVE',
      notes: b.notes || '',
    });
    setEditId(b.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.companyName.trim() || !form.email.trim()) {
      showFlash('error', 'Username, Company Name, and Email are required.');
      return;
    }

    if (!editId && !form.password) {
      showFlash('error', 'Initial password is required for new accounts.');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/wholesale';
      const method = editId ? 'PUT' : 'POST';
      const payload = editId ? { id: editId, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', editId ? 'Wholesale buyer updated.' : 'Wholesale buyer created.');
        setShowModal(false);
        loadBuyers();
      } else {
        showFlash('error', data.error || 'Failed to save buyer.');
      }
    } catch (err: any) {
      showFlash('error', err.message || 'Error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (buyer: WholesaleBuyerItem) => {
    const nextStatus = buyer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/wholesale', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: buyer.id, status: nextStatus }),
      });
      if (res.ok) {
        showFlash('success', `Account marked ${nextStatus}.`);
        loadBuyers();
      }
    } catch {
      showFlash('error', 'Status update failed.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalId || !newPassword.trim()) return;

    try {
      const res = await fetch('/api/admin/wholesale', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resetModalId, password: newPassword.trim() }),
      });
      if (res.ok) {
        showFlash('success', 'Password reset successfully.');
        setResetModalId(null);
        setNewPassword('');
      } else {
        const d = await res.json();
        showFlash('error', d.error || 'Failed to reset password.');
      }
    } catch {
      showFlash('error', 'Network error.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete wholesale buyer ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/wholesale?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFlash('success', `Buyer ${name} deleted.`);
        loadBuyers();
      } else {
        const d = await res.json();
        showFlash('error', d.error || 'Failed to delete buyer.');
      }
    } catch {
      showFlash('error', 'Network error.');
    }
  };

  const filtered = buyers.filter((b) => {
    const matchSearch =
      b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#8B2E24]" />
            <span>Wholesale Buyer Accounts Studio (Item 7)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage, activate, deactivate, or reset wholesale buyer accounts with username and password.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2 bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Wholesale Buyer</span>
        </button>
      </div>

      {flashMsg && (
        <div
          className={`p-3 text-xs font-medium rounded-xl flex justify-between items-center border ${
            flashMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{flashMsg.text}</span>
          <button onClick={() => setFlashMsg(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search wholesale buyers by company, username, or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#8B2E24]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
            <tr>
              <th className="py-3 px-4">Company &amp; Contact</th>
              <th className="py-3 px-4">Username &amp; Email</th>
              <th className="py-3 px-4">Discount Tier</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">Loading buyers...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">No wholesale buyers found.</td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{b.companyName}</div>
                    <div className="text-[11px] text-slate-500">{b.contactName} {b.country ? `· ${b.country}` : ''}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-semibold text-slate-900">@{b.username}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{b.email}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {b.discountTier}% OFF
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(b)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                        b.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {b.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {b.lastLoginAt ? new Date(b.lastLoginAt).toLocaleDateString('en-GB') : 'Never'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => setResetModalId(b.id)}
                      className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold"
                      title="Reset Password"
                    >
                      Reset PWD
                    </button>
                    <button
                      onClick={() => openEdit(b)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.companyName)}
                      className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[90vh] overflow-hidden text-slate-900">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">
                {editId ? 'Edit Wholesale Buyer Account' : 'Create Wholesale Buyer Account'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Company / Enterprise Name *</label>
                    <input
                      type="text"
                      required
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      placeholder="e.g. Aman Kora Bhutan"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      placeholder="e.g. Tenzin Norbu"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Username (Login Key) *</label>
                    <input
                      type="text"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="e.g. aman_thimphu"
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">
                      {editId ? 'New Password (leave empty to keep)' : 'Initial Password *'}
                    </label>
                    <input
                      type="password"
                      required={!editId}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Official Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="buyer@enterprise.com"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+975 1712 3456"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Country</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Discount %</label>
                    <input
                      type="number"
                      min={0}
                      max={70}
                      value={form.discountTier}
                      onChange={(e) => setForm({ ...form, discountTier: parseInt(e.target.value, 10) || 20 })}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">Internal Notes</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Contract agreement, special shipping requests, etc."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#8B2E24] hover:bg-[#73241c] text-white rounded-lg font-semibold shadow-xs transition"
                >
                  {saving ? 'Saving...' : 'Save Wholesale Buyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-slate-900 space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Reset Wholesale Password</span>
            </h3>
            <p className="text-xs text-slate-500">
              Enter a new temporary or permanent password for this wholesale buyer account.
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalId(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8B2E24] hover:bg-[#73241c] text-white rounded-lg font-semibold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
