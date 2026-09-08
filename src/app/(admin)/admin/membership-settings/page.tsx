'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { CreditCard, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminMembershipSettingsPage() {
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

  useEffect(() => {
    fetch('/api/admin/membership-settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.setting) setForm(d.setting);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
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
        setFeedback({ type: 'success', message: 'Membership tier fees & payment instructions saved!' });
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to update settings' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading membership settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Membership Tiers &amp; Annual Dues Controls</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure annual membership subscription fees for Active, Associate, and Institutional members, and set official banking deposit details.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
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
    </div>
  );
}