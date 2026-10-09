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
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileSpreadsheet,
  Upload,
  Download,
  Eye,
  Send,
  Check,
  X,
  FileText
} from 'lucide-react';
import { 
  downloadExcelWorkbook,
  parseSpreadsheetFile,
  WHOLESALE_HEADERS, 
  WHOLESALE_SAMPLE_ROWS, 
  validateWholesaleImport, 
  WholesaleImportValidationResult 
} from '@/lib/spreadsheet';

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
  status: string; // ACTIVE | INACTIVE | PENDING | SUSPENDED | REJECTED
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

function paymentProofFromNotes(notes?: string | null) {
  const value = notes?.match(/^Payment Slip Proof:\s*(\S+)/m)?.[1] || '';
  return value.startsWith('/uploads/') ? value : '';
}

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

  // Password reset modal
  const [resetModalId, setResetModalId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Inspector / Details Modal
  const [inspectBuyer, setInspectBuyer] = useState<WholesaleBuyerItem | null>(null);

  // Decline Modal (with reason)
  const [declineBuyer, setDeclineBuyer] = useState<WholesaleBuyerItem | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actingAction, setActingAction] = useState(false);
  const [approvedCredentials, setApprovedCredentials] = useState<{
    companyName: string; username: string; email: string; temporaryPassword: string; emailSent: boolean;
  } | null>(null);

  // Bulk Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importValidation, setImportValidation] = useState<WholesaleImportValidationResult | null>(null);
  const [importResult, setImportResult] = useState<{ count: number; skippedCount: number; badRows: { rowNumber: number; reason: string }[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importFileName, setImportFileName] = useState('');

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
    setTimeout(() => setFlashMsg(null), 5000);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (b: WholesaleBuyerItem) => {
    setForm({
      username: b.username,
      password: '',
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
      showFlash('error', 'Please fill in required fields.');
      return;
    }

    setSaving(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const payload = editId ? { id: editId, ...form } : form;

      const res = await fetch('/api/admin/wholesale', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && (data.success || data.buyer)) {
        showFlash('success', editId ? 'Wholesale buyer updated.' : 'Wholesale buyer created.');
        setShowModal(false);
        loadBuyers();
      } else {
        showFlash('error', data.error || 'Failed to save buyer.');
      }
    } catch {
      showFlash('error', 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  // Quick Approve action
  const handleQuickApprove = async (b: WholesaleBuyerItem) => {
    if (!confirm(`Approve wholesale account for "${b.companyName}" (@${b.username})? An automated approval confirmation email will be sent to ${b.email}.`)) {
      return;
    }

    setActingAction(true);
    try {
      const res = await fetch('/api/admin/wholesale/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: b.id, action: 'APPROVE' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', data.message || `Account for ${b.companyName} approved.`);
        if (data.temporaryPassword) {
          setApprovedCredentials({
            companyName: b.companyName,
            username: b.username,
            email: b.email,
            temporaryPassword: data.temporaryPassword,
            emailSent: Boolean(data.emailSent),
          });
        }
        loadBuyers();
      } else {
        showFlash('error', data.error || 'Failed to approve account.');
      }
    } catch {
      showFlash('error', 'Network error while approving account.');
    } finally {
      setActingAction(false);
    }
  };

  // Quick Decline action
  const handleConfirmDecline = async () => {
    if (!declineBuyer) return;

    setActingAction(true);
    try {
      const res = await fetch('/api/admin/wholesale/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: declineBuyer.id,
          action: 'DECLINE',
          reason: declineReason.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', data.message || `Account for ${declineBuyer.companyName} declined.`);
        setDeclineBuyer(null);
        setDeclineReason('');
        loadBuyers();
      } else {
        showFlash('error', data.error || 'Failed to decline account.');
      }
    } catch {
      showFlash('error', 'Network error while declining account.');
    } finally {
      setActingAction(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetModalId || !newPassword.trim()) return;

    try {
      const res = await fetch('/api/admin/wholesale', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resetModalId, password: newPassword.trim() }),
      });
      const d = await res.json();
      if (res.ok && d.success) {
        showFlash('success', 'Password reset successfully.');
        setResetModalId(null);
        setNewPassword('');
      } else {
        showFlash('error', d.error || 'Failed to reset password.');
      }
    } catch {
      showFlash('error', 'Network error.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete wholesale buyer "${name}"?`)) return;

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

  // Export Wholesalers to Excel / CSV
  const handleExportCsv = () => {
    const rows = buyers.map((b) => [
      b.companyName,
      b.contactName,
      b.email,
      b.phone || '',
      b.country || 'Bhutan',
      b.city || '',
      b.taxId || '',
      b.discountTier || 20,
      b.status || 'ACTIVE',
      (b.notes || '').replace(/\r?\n/g, ' | '),
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadExcelWorkbook(`HAB_Wholesale_Buyers_${dateStr}.xlsx`, 'Wholesale Buyers', WHOLESALE_HEADERS, rows);
    showFlash('success', `Exported ${buyers.length} wholesale buyers to Excel.`);
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    downloadExcelWorkbook('HAB_Wholesale_Import_Template.xlsx', 'Import Template', WHOLESALE_HEADERS, WHOLESALE_SAMPLE_ROWS);
  };

  // Handle File Pick for Import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportResult(null);
    setImportFileName(file.name);
    try {
      const rawRows = await parseSpreadsheetFile(file);
      const existingEmails = new Set(buyers.map((b) => b.email.toLowerCase()));
      const existingUsernames = new Set(buyers.map((b) => b.username.toLowerCase()));

      const validation = validateWholesaleImport(rawRows, existingEmails, existingUsernames);
      setImportValidation(validation);
    } catch (error: any) {
      showFlash('error', error?.message || 'Unable to read the spreadsheet.');
      setImportValidation(null);
    }
  };

  // Submit Bulk Import
  const handleExecuteImport = async () => {
    if (!importValidation || importValidation.validRows.length === 0) return;

    setImporting(true);
    try {
      const res = await fetch('/api/admin/wholesale/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: importValidation.validRows }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setImportResult({ count: Number(data.count) || 0, skippedCount: Number(data.skippedCount) || 0, badRows: Array.isArray(data.badRows) ? data.badRows : [] });
        showFlash('success', `Import finished: ${Number(data.count) || 0} wholesale buyers added.`);
        loadBuyers();
      } else {
        showFlash('error', data.error || 'Failed to import wholesale buyers.');
      }
    } catch {
      showFlash('error', 'Network error during bulk import.');
    } finally {
      setImporting(false);
    }
  };

  const filtered = buyers.filter((b) => {
    const matchSearch =
      b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.contactName && b.contactName.toLowerCase().includes(searchTerm.toLowerCase()));
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
            <span>Wholesale Buyer Accounts &amp; Trade Desk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review B2B trade applications, approve or decline with instant automated emails, manage discount tiers, and bulk import/export via Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/admin/orders?createWholesale=1"
            className="px-3 py-2 bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold rounded-xl transition"
          >
            Create wholesale order
          </a>
          <a
            href="/admin/products"
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Manage products
          </a>
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition"
            title="Export all wholesalers to Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export (Excel/CSV)</span>
          </button>

          <button
            onClick={() => {
              setImportResult(null);
              setImportValidation(null);
              setImportFileName('');
              setShowImportModal(true);
            }}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition"
            title="Bulk import wholesalers via Excel / CSV"
          >
            <Upload className="w-4 h-4 text-sky-600" />
            <span>Import (Excel/CSV)</span>
          </button>

          <button
            onClick={openCreate}
            className="px-4 py-2 bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Buyer</span>
          </button>
        </div>
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
            placeholder="Search wholesale buyers by company, contact person, username, or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#8B2E24]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
        >
          <option value="ALL">All Statuses ({buyers.length})</option>
          <option value="PENDING">PENDING ({buyers.filter((b) => b.status === 'PENDING').length})</option>
          <option value="ACTIVE">ACTIVE ({buyers.filter((b) => b.status === 'ACTIVE').length})</option>
          <option value="REJECTED">REJECTED ({buyers.filter((b) => b.status === 'REJECTED').length})</option>
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
              <th className="py-3 px-4">Registration</th>
              <th className="py-3 px-4 text-right">Review &amp; Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">Loading wholesale accounts...</td>
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
                    <div className="text-[11px] text-slate-500">
                      {b.contactName} {b.country ? `· ${b.country}` : ''} {b.phone ? `· ${b.phone}` : ''}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-semibold text-slate-900">@{b.username}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{b.email}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {b.discountTier}% OFF
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : b.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(b.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      {/* Quick Approve Tick */}
                      <button
                        type="button"
                        onClick={() => handleQuickApprove(b)}
                        disabled={actingAction || b.status === 'ACTIVE'}
                        className={`p-1.5 rounded-lg font-bold transition ${
                          b.status === 'ACTIVE'
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title="Quick Approve [✓] (Sends confirmation email)"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      {/* Quick Decline Cross */}
                      <button
                        type="button"
                        onClick={() => {
                          setDeclineBuyer(b);
                          setDeclineReason('');
                        }}
                        disabled={actingAction || b.status === 'REJECTED'}
                        className={`p-1.5 rounded-lg font-bold transition ${
                          b.status === 'REJECTED'
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                        title="Quick Decline [✗] (Sends decline notice)"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* View / Inspect details */}
                      <button
                        type="button"
                        onClick={() => setInspectBuyer(b)}
                        className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100"
                        title="View Full Profile & Application Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Reset Password */}
                      <button
                        onClick={() => setResetModalId(b.id)}
                        className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold"
                        title="Reset Account Password"
                      >
                        PWD
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEdit(b)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                      >
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(b.id, b.companyName)}
                        className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* INSPECTOR MODAL: View Full Wholesale Application */}
      {inspectBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[90vh] overflow-hidden text-slate-900">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#8B2E24]" />
                  <span>{inspectBuyer.companyName}</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono">@{inspectBuyer.username} · {inspectBuyer.email}</p>
              </div>
              <button onClick={() => setInspectBuyer(null)} className="text-slate-400 hover:text-slate-700 text-base font-bold">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 text-[11px] block">Contact Person</span>
                  <span className="font-semibold text-slate-800">{inspectBuyer.contactName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Phone</span>
                  <span className="font-mono text-slate-800">{inspectBuyer.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Location</span>
                  <span className="text-slate-800">{inspectBuyer.city ? `${inspectBuyer.city}, ` : ''}{inspectBuyer.country}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Tax / Trade License ID</span>
                  <span className="font-mono text-slate-800">{inspectBuyer.taxId || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Discount Tier</span>
                  <span className="font-bold text-emerald-700">{inspectBuyer.discountTier}% OFF</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Current Status</span>
                  <span className="font-bold uppercase text-[#8B2E24]">{inspectBuyer.status}</span>
                </div>
              </div>

              {inspectBuyer.notes && (
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span>Application Notes &amp; Purchasing Requirements</span>
                  </h4>
                  <pre className="font-sans whitespace-pre-wrap text-slate-700 leading-relaxed text-[11px]">
                    {inspectBuyer.notes}
                  </pre>
                </div>
              )}
              {paymentProofFromNotes(inspectBuyer.notes) && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                  <h4 className="font-bold text-slate-900">Payment / deposit proof</h4>
                  <a href={paymentProofFromNotes(inspectBuyer.notes)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-lg bg-sky-700 px-3 py-2 font-semibold text-white">
                    <Eye className="w-4 h-4" /> View uploaded proof
                  </a>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
              {inspectBuyer.status === 'ACTIVE' ? (
                <button
                  type="button"
                  onClick={() => { window.location.href = `/admin/orders?createWholesale=1&wholesaleBuyerId=${encodeURIComponent(inspectBuyer.id)}`; }}
                  className="mr-auto px-3 py-2 bg-white border border-slate-200 hover:border-[#8B2E24]/40 text-slate-800 font-semibold rounded-lg"
                >
                  Create order for this buyer
                </button>
              ) : <span className="mr-auto text-[11px] text-slate-500">Activate this account before creating an order.</span>}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInspectBuyer(null);
                    handleQuickApprove(inspectBuyer);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve &amp; Notify</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectBuyer;
                    setInspectBuyer(null);
                    setDeclineBuyer(target);
                    setDeclineReason('');
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setInspectBuyer(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECLINE MODAL: Enter Reason for Rejection */}
      {declineBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col overflow-hidden text-slate-900">
            <div className="px-6 py-4 border-b border-slate-200 bg-rose-50 flex justify-between items-center">
              <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Decline Wholesale Application</span>
              </h3>
              <button onClick={() => setDeclineBuyer(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <p className="text-slate-600">
                You are declining the application for <strong>{declineBuyer.companyName}</strong>. An email notification will be sent to <strong>{declineBuyer.email}</strong>.
              </p>

              <div>
                <label className="block font-medium mb-1 text-slate-700">Reason for Declining (Sent in email)</label>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Incomplete trade registration documents or invalid tax ID provided."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-hidden focus:border-rose-600 text-xs"
                />
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeclineBuyer(null)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={actingAction}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{actingAction ? 'Declining...' : 'Send Decline Notice'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL (Excel / CSV) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[90vh] overflow-hidden text-slate-900">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-600" />
                <span>Bulk Import Wholesalers from Excel / CSV</span>
              </h3>
              <button onClick={() => { setShowImportModal(false); setImportResult(null); }} aria-label="Close wholesale import" className="text-slate-500 hover:text-slate-900 text-sm font-semibold">Close ×</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {importResult && (
                <section role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                  <h4 className="font-bold text-emerald-950">Import finished</h4>
                  <p className="text-emerald-900">{importResult.count} imported · {importResult.skippedCount} duplicates skipped · {importResult.badRows.length} rows need review</p>
                  {importResult.badRows.length > 0 && <div className="max-h-40 overflow-y-auto rounded-lg border border-rose-200 bg-white p-3">
                    <h5 className="mb-1 font-bold text-rose-900">Rows not imported</h5>
                    <ul className="space-y-1 text-[11px] text-rose-800">{importResult.badRows.map((row, index) => <li key={`${row.rowNumber}-${index}`}>Row {row.rowNumber}: {row.reason}</li>)}</ul>
                  </div>}
                </section>
              )}
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sky-950">Download Excel Template</p>
                  <p className="text-[11px] text-sky-700 mt-0.5">
                    Start with the official formatted template with column headers and sample data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg flex items-center gap-1.5 text-xs shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900">
                Imported buyers are created as PENDING and cannot sign in yet. Review the application and approve it to generate and send their login credentials. Importing the same email or username again is skipped.
              </p>

              {/* Upload Input */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#8B2E24] transition">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-[#8B2E24] font-semibold underline">Choose CSV / Excel file</span> or drag &amp; drop
                  <input
                    type="file"
                    accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {importFileName && (
                  <p className="font-mono text-slate-700 mt-2 text-[11px]">Selected: {importFileName}</p>
                )}
              </div>

              {/* Validation Summary */}
              {importValidation && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <span className="text-[11px] text-emerald-700 block">Valid to Import</span>
                      <span className="text-lg font-bold text-emerald-900">{importValidation.validRows.length}</span>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                      <span className="text-[11px] text-amber-700 block">Duplicates Skipped</span>
                      <span className="text-lg font-bold text-amber-900">{importValidation.duplicateCount}</span>
                    </div>
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                      <span className="text-[11px] text-rose-700 block">Bad Rows</span>
                      <span className="text-lg font-bold text-rose-900">{importValidation.badRows.length}</span>
                    </div>
                  </div>

                  {/* Bad rows list */}
                  {importValidation.badRows.length > 0 && (
                    <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl max-h-40 overflow-y-auto">
                      <h4 className="font-bold text-rose-900 mb-1 flex items-center gap-1 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Issues Encountered ({importValidation.badRows.length}):</span>
                      </h4>
                      <ul className="space-y-1 text-[11px] text-rose-800 font-mono">
                        {importValidation.badRows.map((b, idx) => (
                          <li key={idx}>
                            • Row {b.rowNumber}: {b.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Valid preview sample */}
                  {importValidation.validRows.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">Previewing First 3 Valid Records:</h4>
                      <div className="space-y-1 font-mono text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        {importValidation.validRows.slice(0, 3).map((r, i) => (
                          <div key={i} className="text-slate-700">
                            {i + 1}. <strong>{r.companyName}</strong> ({r.contactName}) — {r.email} · Tier: {r.discountTier}% OFF
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setImportResult(null); }}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg"
              >
                {importResult ? 'Done' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importing || Boolean(importResult) || !importValidation || importValidation.validRows.length === 0}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{importResult ? 'Import complete' : importing ? 'Importing...' : `Import ${importValidation?.validRows.length || 0} Records`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
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
                      placeholder="e.g. Tashi Wangchuk"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Account Username *</label>
                    <input
                      type="text"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      placeholder="amankora_buyer"
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Business Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="procurement@amankora.bt"
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                {!editId && (
                  <div>
                    <label className="block font-medium mb-1">Initial Password *</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+975-2-321234"
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Country</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="Bhutan"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Thimphu"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Tax / License ID</label>
                    <input
                      type="text"
                      value={form.taxId}
                      onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                      placeholder="HAB-TL-4892"
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Discount Tier (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={form.discountTier}
                      onChange={(e) => setForm({ ...form, discountTier: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Account Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">Internal Notes &amp; Terms</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Notes regarding bulk agreement, MOQ arrangements, payment schedules..."
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#8B2E24] hover:bg-[#73241c] text-white font-semibold rounded-lg shadow-sm"
                >
                  {saving ? 'Saving...' : editId ? 'Update Buyer' : 'Create Buyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {resetModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 my-auto p-6 text-slate-900">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Reset Wholesale Buyer Password</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter a new temporary password for this buyer.
            </p>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetModalId(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                className="px-4 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {approvedCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
            <h3 className="font-bold text-slate-900">Wholesale account approved</h3>
            <p className="mt-1 text-xs text-slate-500">{approvedCredentials.emailSent ? 'The credentials email was delivered.' : 'Live email delivery was not confirmed. Copy these credentials and send them securely.'}</p>
            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
              <p><span className="text-slate-500">Company:</span> <strong>{approvedCredentials.companyName}</strong></p>
              <p><span className="text-slate-500">Email:</span> <strong>{approvedCredentials.email}</strong></p>
              <p><span className="text-slate-500">Username:</span> <code>{approvedCredentials.username}</code></p>
              <p><span className="text-slate-500">Temporary password:</span> <code className="font-bold">{approvedCredentials.temporaryPassword}</code></p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => navigator.clipboard.writeText(`Username: ${approvedCredentials.username}\nTemporary password: ${approvedCredentials.temporaryPassword}\nLogin: ${window.location.origin}/wholesale/login`)} className="rounded-lg border px-3 py-2 text-xs font-semibold">Copy credentials</button>
              <button type="button" onClick={() => setApprovedCredentials(null)} className="rounded-lg bg-[#8B2E24] px-4 py-2 text-xs font-bold text-white">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
