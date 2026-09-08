'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Save, CheckCircle2, AlertCircle, Users, Calendar, ShieldCheck, Clock, RefreshCw, Search } from 'lucide-react';
import { AdminBadge, AdminModal, AdminEmptyState, AdminSkeleton } from '@/components/admin/AdminUI';

interface MemberDuesItem {
  id: string;
  name: string;
  regNumber: string;
  craftKey: string;
  dzongkhag: string;
  tier: string;
  status: string;
  duesExpiryDate: string;
  daysRemaining: number;
  duesStatus: 'CURRENT' | 'EXPIRING_SOON' | 'EXPIRED';
}

export default function AdminMembershipSettingsPage() {
  const [activeTab, setActiveTab] = useState<'TIERS' | 'LEDGER'>('TIERS');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    activeDuesBTN: 1200,
    associateDuesBTN: 2500,
    institutionalDuesBTN: 10000,
    bankName: 'Bank of Bhutan (BoB)',
    accountNumber: '200847291038',
    accountTitle: 'Handicrafts Association of Bhutan',
    mbobQrUrl: '/images/mbob_qr_placeholder.png',
  });

  const [members, setMembers] = useState<MemberDuesItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CURRENT' | 'EXPIRING_SOON' | 'EXPIRED'>('ALL');

  // Renewal Modal State
  const [renewingMember, setRenewingMember] = useState<MemberDuesItem | null>(null);
  const [renewalMonths, setRenewalMonths] = useState(12);
  const [renewalAmount, setRenewalAmount] = useState(1200);
  const [renewalMethod, setRenewalMethod] = useState('BANK');
  const [renewalRef, setRenewalRef] = useState('');
  const [renewalNotes, setRenewalNotes] = useState('');
  const [submittingRenewal, setSubmittingRenewal] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/membership-settings', { credentials: 'include' });
      const d = await res.json();
      if (d?.setting) setForm(d.setting);
      if (d?.members) setMembers(d.members);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load membership settings & ledger.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTiers = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/membership-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Membership tier fees & payment instructions saved successfully!' });
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to update settings' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const openRenewalModal = (m: MemberDuesItem) => {
    setRenewingMember(m);
    let defaultFee = form.activeDuesBTN;
    if (m.tier === 'ASSOCIATE_SECTOR_MEMBER') defaultFee = form.associateDuesBTN;
    if (m.tier === 'INSTITUTIONAL') defaultFee = form.institutionalDuesBTN;
    setRenewalAmount(defaultFee);
    setRenewalMonths(12);
    setRenewalRef(`REC-${Date.now().toString().slice(-6)}`);
    setRenewalNotes('');
  };

  const handleRecordRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingMember) return;
    setSubmittingRenewal(true);
    try {
      const res = await fetch('/api/admin/membership-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'record_payment',
          memberId: renewingMember.id,
          months: renewalMonths,
          amountBTN: renewalAmount,
          paymentMethod: renewalMethod,
          receiptRef: renewalRef,
          notes: renewalNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: data.message });
        setRenewingMember(null);
        await loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to record renewal.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error while recording renewal.' });
    } finally {
      setSubmittingRenewal(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.dzongkhag.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || m.duesStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <AdminSkeleton rows={4} cols={4} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#8B2E24]" />
            Membership Dues, Tiers &amp; Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure annual membership subscription fees, manage official banking instructions, and track member dues status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('TIERS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'TIERS' ? 'bg-[#8B2E24] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tier Fees &amp; Banking
          </button>
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'LEDGER' ? 'bg-[#8B2E24] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Member Dues Ledger ({members.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TAB 1: TIERS & BANKING */}
      {activeTab === 'TIERS' && (
        <form onSubmit={handleSaveTiers} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#8B2E24]" />
            Annual Dues by Membership Tier
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-bold text-slate-700 mb-1">Active Sector Member</div>
              <div className="text-xs text-slate-500 mb-2">Individual artisan / micro workshop</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500">Nu.</span>
                <input
                  type="number"
                  value={form.activeDuesBTN}
                  onChange={(e) => setForm({ ...form, activeDuesBTN: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                  required
                />
                <span className="text-xs text-slate-500">/yr</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-bold text-slate-700 mb-1">Associate Sector Member</div>
              <div className="text-xs text-slate-500 mb-2">Craft enterprise / retail outlet</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500">Nu.</span>
                <input
                  type="number"
                  value={form.associateDuesBTN}
                  onChange={(e) => setForm({ ...form, associateDuesBTN: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                  required
                />
                <span className="text-xs text-slate-500">/yr</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-bold text-slate-700 mb-1">Institutional Member</div>
              <div className="text-xs text-slate-500 mb-2">Corporation / donor partner</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500">Nu.</span>
                <input
                  type="number"
                  value={form.institutionalDuesBTN}
                  onChange={(e) => setForm({ ...form, institutionalDuesBTN: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                  required
                />
                <span className="text-xs text-slate-500">/yr</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Official Banking &amp; Dues Collection Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Bank Name</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Number</label>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Title / Beneficiary</label>
                <input
                  type="text"
                  value={form.accountTitle}
                  onChange={(e) => setForm({ ...form, accountTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">mBoB QR Image URL (Optional)</label>
                <input
                  type="text"
                  value={form.mbobQrUrl || ''}
                  onChange={(e) => setForm({ ...form, mbobQrUrl: e.target.value })}
                  placeholder="/images/mbob_qr.png"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#8B2E24] hover:bg-[#72251D] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Dues Settings'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MEMBER DUES LEDGER */}
      {activeTab === 'LEDGER' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member name, registration number, dzongkhag..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium"
              >
                <option value="ALL">All Dues Statuses</option>
                <option value="CURRENT">Current / Paid</option>
                <option value="EXPIRING_SOON">Expiring Soon (≤30 Days)</option>
                <option value="EXPIRED">Expired / Overdue</option>
              </select>
              <button
                onClick={loadData}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Reg Number</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Dzongkhag</th>
                  <th className="py-3 px-4">Dues Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">{m.regNumber}</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium text-slate-700">
                        {m.tier === 'ACTIVE_SECTOR_MEMBER' ? 'Active' : m.tier === 'ASSOCIATE_SECTOR_MEMBER' ? 'Associate' : 'Institutional'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{m.dzongkhag}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {new Date(m.duesExpiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      {m.duesStatus === 'CURRENT' ? (
                        <AdminBadge variant="success">Current ({m.daysRemaining}d)</AdminBadge>
                      ) : m.duesStatus === 'EXPIRING_SOON' ? (
                        <AdminBadge variant="warning">Expiring ({m.daysRemaining}d)</AdminBadge>
                      ) : (
                        <AdminBadge variant="danger">Expired ({Math.abs(m.daysRemaining)}d ago)</AdminBadge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openRenewalModal(m)}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#8B2E24] hover:bg-[#72251D] text-white rounded transition-colors"
                      >
                        Record Renewal
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <AdminEmptyState
                        title="No members found"
                        description={searchQuery ? 'Try adjusting your search criteria.' : 'No members registered in database.'}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENEWAL PAYMENT MODAL */}
      {renewingMember && (
        <AdminModal
          isOpen={!!renewingMember}
          onClose={() => setRenewingMember(null)}
          title={`Record Dues Payment: ${renewingMember.name}`}
        >
          <form onSubmit={handleRecordRenewal} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div><span className="font-semibold text-slate-700">Registration:</span> {renewingMember.regNumber}</div>
              <div><span className="font-semibold text-slate-700">Current Tier:</span> {renewingMember.tier}</div>
              <div>
                <span className="font-semibold text-slate-700">Current Expiry:</span>{' '}
                {new Date(renewingMember.duesExpiryDate).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Extension Period</label>
                <select
                  value={renewalMonths}
                  onChange={(e) => setRenewalMonths(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs bg-white"
                >
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={6}>6 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Paid (Nu.)</label>
                <input
                  type="number"
                  value={renewalAmount}
                  onChange={(e) => setRenewalAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs font-bold font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={renewalMethod}
                  onChange={(e) => setRenewalMethod(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs bg-white"
                >
                  <option value="BANK">Bank Deposit / Transfer</option>
                  <option value="MBOB">mBoB Mobile Payment</option>
                  <option value="CARD">International Card</option>
                  <option value="CASH">Cash / Secretariat Counter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt / Ref No.</label>
                <input
                  type="text"
                  value={renewalRef}
                  onChange={(e) => setRenewalRef(e.target.value)}
                  placeholder="e.g. BoB-TXN-98412"
                  className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes (Optional)</label>
              <textarea
                value={renewalNotes}
                onChange={(e) => setRenewalNotes(e.target.value)}
                placeholder="e.g. Verified against bank statement deposited 08 Sep 2026."
                rows={2}
                className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRenewingMember(null)}
                className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRenewal}
                className="px-4 py-2 bg-[#8B2E24] hover:bg-[#72251D] text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {submittingRenewal ? 'Recording...' : 'Confirm Renewal'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}