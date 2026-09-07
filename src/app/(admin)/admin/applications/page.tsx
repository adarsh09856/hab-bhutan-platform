'use client';

import React, { useState, useEffect } from 'react';
import { CRAFTS } from '@/lib/data';
import { UserCheck, Search, CheckCircle, XCircle, Clock, Shield, AlertCircle, FileText, Plus, Edit2, Trash2, Copy, Check, CheckCircle2 } from 'lucide-react';

const DZONGKHAGS = [
  'Thimphu', 'Paro', 'Punakha', 'Wangdue Phodrang', 'Chhukha', 'Haa', 'Samtse',
  'Dagana', 'Tsirang', 'Sarpang', 'Trongsa', 'Bumthang', 'Zhemgang', 'Mongar',
  'Lhuntse', 'Trashigang', 'Trashi Yangtse', 'Pema Gatshel', 'Samdrup Jongkhar', 'Gasa'
];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [rejectingApp, setRejectingApp] = useState<any | null>(null);
  const [deletingApp, setDeletingApp] = useState<any | null>(null);
  const [approvedCredentials, setApprovedCredentials] = useState<{
    name: string;
    email: string;
    temporaryPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Forms
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const [createForm, setCreateForm] = useState({
    applicantName: '',
    email: '',
    phone: '',
    cidNumber: '',
    businessLicense: '',
    craftKey: CRAFTS[0].key,
    dzongkhag: 'Thimphu',
    villageGewog: '',
    yearsPractising: 5,
    planTier: 'ACTIVE_SECTOR_MEMBER',
    paymentMethod: 'CARD',
  });

  const loadApplications = async () => {
    setLoading(true);
    setActionError('');
    try {
      const res = await fetch('/api/admin/applications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        if (data.applications?.length > 0 && !selectedApp) {
          setSelectedApp(data.applications[0]);
        }
      } else {
        const err = await res.json();
        setActionError(err.error || 'Failed to load applications from PostgreSQL.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error fetching applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/applications', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`✓ Manual intake application for "${data.application.applicantName}" registered.`);
        setShowCreateModal(false);
        setCreateForm({
          applicantName: '',
          email: '',
          phone: '',
          cidNumber: '',
          businessLicense: '',
          craftKey: CRAFTS[0].key,
          dzongkhag: 'Thimphu',
          villageGewog: '',
          yearsPractising: 5,
          planTier: 'ACTIVE_SECTOR_MEMBER',
          paymentMethod: 'CARD',
        });
        await loadApplications();
      } else {
        setActionError(data.error || 'Failed to log application.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingApp.id,
          applicantName: editingApp.applicantName,
          email: editingApp.email,
          phone: editingApp.phone,
          cidNumber: editingApp.cidNumber,
          businessLicense: editingApp.businessLicense,
          craftKey: editingApp.craftKey,
          dzongkhag: editingApp.dzongkhag,
          villageGewog: editingApp.villageGewog,
          yearsPractising: editingApp.yearsPractising,
          planTier: editingApp.planTier,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`✓ Application for "${data.application.applicantName}" updated.`);
        setEditingApp(null);
        if (selectedApp?.id === editingApp.id) {
          setSelectedApp(data.application);
        }
        await loadApplications();
      } else {
        setActionError(data.error || 'Failed to update application.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (appId: string) => {
    setSubmitting(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appId,
          status: 'APPROVED',
          reviewerNotes: reviewNoteInput || 'Approved by secretariat reviewer.',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`✓ Approved! New member enrolled: ${data.member?.name} (${data.member?.regNumber}).`);
        setReviewNoteInput('');
        if (data.tempCredentials) {
          setApprovedCredentials({
            name: data.member?.name || 'Artisan Member',
            email: data.tempCredentials.email,
            temporaryPassword: data.tempCredentials.temporaryPassword,
          });
          setCopied(false);
        }
        await loadApplications();
      } else {
        setActionError(data.error || 'Failed to approve application.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error processing approval.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingApp) return;
    if (!rejectionReasonInput.trim()) {
      setActionError('A formal rejection reason is mandatory.');
      return;
    }

    setSubmitting(true);
    setActionError('');

    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rejectingApp.id,
          status: 'REJECTED',
          rejectionReason: rejectionReasonInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`✓ Application for ${rejectingApp.applicantName} marked REJECTED.`);
        setRejectingApp(null);
        setRejectionReasonInput('');
        await loadApplications();
      } else {
        setActionError(data.error || 'Failed to reject application.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error rejecting application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingApp) return;
    setSubmitting(true);
    setActionError('');

    try {
      const res = await fetch(`/api/admin/applications?id=${deletingApp.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.message || '✓ Application deleted.');
        setDeletingApp(null);
        if (selectedApp?.id === deletingApp.id) {
          setSelectedApp(null);
        }
        await loadApplications();
      } else {
        setActionError(data.error || 'Failed to delete application.');
        setDeletingApp(null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
      setDeletingApp(null);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = applications.filter((a) => {
    const matchesSearch =
      a.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
      a.cidNumber?.includes(search) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.dzongkhag?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Artisan Membership Applications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review incoming artisan guild accreditation dossiers and provision authenticated member records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Log Paper Application</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-md flex justify-between items-center">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 font-bold ml-2">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-md flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-rose-600 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex gap-4 items-center bg-white p-4 border border-slate-200 rounded-lg shadow-sm flex-wrap">
        <input
          type="text"
          placeholder="Search by applicant name, CID, email, dzongkhag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[240px] text-xs border border-slate-300 rounded px-3 py-2 outline-none focus:border-slate-500 font-sans"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded px-3 py-2 outline-none focus:border-slate-500 bg-white"
        >
          <option value="ALL">All Application States</option>
          <option value="PENDING">Pending Review</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved &amp; Enrolled</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applications List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              Loading applications from PostgreSQL...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Applicant &amp; CID</th>
                    <th className="py-3 px-4">Craft Tradition</th>
                    <th className="py-3 px-4">Dzongkhag</th>
                    <th className="py-3 px-4">Tier</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedApp(a)}
                      className={`cursor-pointer transition-colors ${
                        selectedApp?.id === a.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50/75'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{a.applicantName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">CID: {a.cidNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100">
                          {a.craftKey}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{a.dzongkhag}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{a.planTier}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : a.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : a.status === 'UNDER_REVIEW'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEditingApp({ ...a })}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded text-[11px]"
                          title="Edit application data"
                        >
                          Edit
                        </button>
                        {a.status !== 'APPROVED' && a.status !== 'REJECTED' && (
                          <button
                            onClick={() => setDeletingApp(a)}
                            className="px-1.5 py-1 text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 rounded text-[11px]"
                            title="Delete draft application"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No applications found in database matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Dossier Inspector */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
          {selectedApp ? (
            <>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Applicant Dossier</span>
                <h2 className="text-lg font-bold text-slate-900">{selectedApp.applicantName}</h2>
                <p className="text-xs text-slate-500 font-mono">CID: {selectedApp.cidNumber}</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Primary Craft</span>
                    <span className="font-semibold text-slate-800">{selectedApp.craftKey}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Experience</span>
                    <span className="font-semibold text-slate-800">{selectedApp.yearsPractising} years</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dzongkhag</span>
                    <span className="font-semibold text-slate-800">{selectedApp.dzongkhag}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Village / Gewog</span>
                    <span className="font-semibold text-slate-800">{selectedApp.villageGewog}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Email &amp; Phone</span>
                    <span className="font-mono text-slate-800">{selectedApp.email} · {selectedApp.phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Trade License</span>
                    <span className="font-mono text-slate-800">{selectedApp.businessLicense || 'None (Artisan Individual)'}</span>
                  </div>
                </div>

                {selectedApp.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800">
                    <span className="font-bold block text-[11px]">Rejection Reason:</span>
                    <p className="mt-0.5">{selectedApp.rejectionReason}</p>
                  </div>
                )}

                {selectedApp.reviewerNotes && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700">
                    <span className="font-bold block text-[11px]">Reviewer Notes:</span>
                    <p className="mt-0.5">{selectedApp.reviewerNotes}</p>
                  </div>
                )}

                {selectedApp.status !== 'APPROVED' && selectedApp.status !== 'REJECTED' && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <label className="block font-semibold text-slate-700 text-xs">Reviewer Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Verified master weaver credentials with Gewog."
                      value={reviewNoteInput}
                      onChange={(e) => setReviewNoteInput(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs outline-none focus:border-slate-500"
                    />

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApprove(selectedApp.id)}
                        disabled={submitting}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm disabled:opacity-50"
                      >
                        {submitting ? 'Enrolling...' : 'Approve & Create Member'}
                      </button>
                      <button
                        onClick={() => setRejectingApp(selectedApp)}
                        disabled={submitting}
                        className="py-2 px-3 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded text-xs font-semibold disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select an application from the table to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Manual Intake Application Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Log Paper / Walk-in Application</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Applicant Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.applicantName}
                  onChange={(e) => setCreateForm({ ...createForm, applicantName: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Citizenship ID (11 Digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={createForm.cidNumber}
                    onChange={(e) => setCreateForm({ ...createForm, cidNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Trade License / Reg No.</label>
                  <input
                    type="text"
                    value={createForm.businessLicense}
                    onChange={(e) => setCreateForm({ ...createForm, businessLicense: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Craft Tradition *</label>
                  <select
                    value={createForm.craftKey}
                    onChange={(e) => setCreateForm({ ...createForm, craftKey: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    {CRAFTS.map((c) => (
                      <option key={c.key} value={c.key}>{c.name} ({c.english})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Dzongkhag *</label>
                  <select
                    value={createForm.dzongkhag}
                    onChange={(e) => setCreateForm({ ...createForm, dzongkhag: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    {DZONGKHAGS.map((dz) => (
                      <option key={dz} value={dz}>{dz}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Gewog / Village</label>
                  <input
                    type="text"
                    value={createForm.villageGewog}
                    onChange={(e) => setCreateForm({ ...createForm, villageGewog: e.target.value })}
                    placeholder="e.g. Chhumey, Zugney"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Years Practising</label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.yearsPractising}
                    onChange={(e) => setCreateForm({ ...createForm, yearsPractising: parseInt(e.target.value, 10) || 1 })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Logging...' : 'Log Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Applicant Data</h3>
              <button onClick={() => setEditingApp(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Applicant Name</label>
                <input
                  type="text"
                  required
                  value={editingApp.applicantName}
                  onChange={(e) => setEditingApp({ ...editingApp, applicantName: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingApp.email}
                    onChange={(e) => setEditingApp({ ...editingApp, email: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={editingApp.phone}
                    onChange={(e) => setEditingApp({ ...editingApp, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Citizenship ID (11 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={editingApp.cidNumber}
                    onChange={(e) => setEditingApp({ ...editingApp, cidNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Trade License</label>
                  <input
                    type="text"
                    value={editingApp.businessLicense || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, businessLicense: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Craft</label>
                  <select
                    value={editingApp.craftKey}
                    onChange={(e) => setEditingApp({ ...editingApp, craftKey: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    {CRAFTS.map((c) => (
                      <option key={c.key} value={c.key}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Dzongkhag</label>
                  <select
                    value={editingApp.dzongkhag}
                    onChange={(e) => setEditingApp({ ...editingApp, dzongkhag: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    {DZONGKHAGS.map((dz) => (
                      <option key={dz} value={dz}>{dz}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {rejectingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Reject Application</h3>
            <p className="text-xs text-slate-600">
              Provide formal grounds for rejecting the membership dossier of <strong className="text-slate-900">{rejectingApp.applicantName}</strong>.
            </p>

            <div>
              <label className="block font-medium text-slate-700 text-xs mb-1">Rejection Reason *</label>
              <textarea
                rows={3}
                required
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Submitted business license could not be validated with Department of Cottage and Small Industry."
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs outline-none focus:border-slate-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingApp(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Application Modal */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Delete Draft Application?</h3>
            <p className="text-xs text-slate-600">
              Permanently delete draft application for <strong className="text-slate-900">{deletingApp.applicantName}</strong>?
            </p>
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
              Approved or finalized applications cannot be deleted due to association compliance bylaws.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingApp(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Credentials Modal (Fix 2 - shown once upon approval) */}
      {approvedCredentials && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Application Approved & Member Enrolled</h3>
                <p className="text-xs text-slate-500">Temporary access credentials generated</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Applicant:</span>
                <span className="font-semibold text-slate-900">{approvedCredentials.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Login Email:</span>
                <span className="font-mono text-slate-900 font-semibold">{approvedCredentials.email}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1.5">
                Temporary Password:
              </label>
              <div className="relative flex items-center">
                <div className="w-full font-mono bg-stone-100 border border-stone-300 p-3 rounded-lg select-all text-stone-900 font-bold text-sm tracking-wider break-all pr-24">
                  {approvedCredentials.temporaryPassword}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(approvedCredentials.temporaryPassword);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="absolute right-2 px-2.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 rounded text-xs font-semibold text-stone-700 flex items-center gap-1 shadow-sm transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block mb-0.5">Security Notice:</span>
              This password will <strong className="underline">NOT</strong> be shown again. Share it with the member securely (SMS, WhatsApp, or phone call). They will be required to change it on their first login.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setApprovedCredentials(null)}
                className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
