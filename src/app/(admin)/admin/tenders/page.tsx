'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  AlertCircle, 
  Download, 
  Building2, 
  Calendar, 
  Clock, 
  Mail, 
  Phone,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface TenderItem {
  id: string;
  tenderNumber: string;
  title: string;
  category: string;
  description: string;
  openingDate: string;
  closingDate: string;
  documentUrl?: string | null;
  documentType?: string | null;
  documentTitle?: string | null;
  submissionEmail: string;
  contactPerson?: string | null;
  contactPhone?: string | null;
  estimatedBudget?: string | null;
  eligibility?: string | null;
  status: string;
  sortOrder: number;
}

const EMPTY_FORM = {
  tenderNumber: '',
  title: '',
  category: 'Procurement',
  description: '',
  openingDate: new Date().toISOString().split('T')[0],
  closingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
  documentUrl: '',
  documentType: 'PDF',
  documentTitle: 'Bidding Document (PDF)',
  submissionEmail: 'officehab@gmail.com',
  contactPerson: 'Secretary Desk, HAB',
  contactPhone: '+975-2-338089',
  estimatedBudget: '',
  eligibility: '',
  status: 'OPEN',
  sortOrder: 0,
};

const CATEGORIES = ['Procurement', 'Supply', 'Consultancy', 'Construction', 'Artisan Grants'];

export default function AdminTendersPage() {
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTenders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tenders', { cache: 'no-store' });
      const data = await res.json();
      if (data.tenders) setTenders(data.tenders);
    } catch {
      showFlash('error', 'Failed to load tenders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenders();
  }, []);

  const showFlash = (type: 'success' | 'error', text: string) => {
    setFlashMsg({ type, text });
    setTimeout(() => setFlashMsg(null), 4000);
  };

  const openCreate = () => {
    const nextSeq = String(tenders.length + 1).padStart(3, '0');
    setForm({
      ...EMPTY_FORM,
      tenderNumber: `HAB/TEND/${new Date().getFullYear()}/${nextSeq}`,
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (item: TenderItem) => {
    setForm({
      tenderNumber: item.tenderNumber,
      title: item.title,
      category: item.category,
      description: item.description,
      openingDate: item.openingDate ? new Date(item.openingDate).toISOString().split('T')[0] : '',
      closingDate: item.closingDate ? new Date(item.closingDate).toISOString().split('T')[0] : '',
      documentUrl: item.documentUrl || '',
      documentType: item.documentType || 'PDF',
      documentTitle: item.documentTitle || 'Bidding Document (PDF)',
      submissionEmail: item.submissionEmail || 'officehab@gmail.com',
      contactPerson: item.contactPerson || 'Secretary Desk, HAB',
      contactPhone: item.contactPhone || '+975-2-338089',
      estimatedBudget: item.estimatedBudget || '',
      eligibility: item.eligibility || '',
      status: item.status || 'OPEN',
      sortOrder: item.sortOrder || 0,
    });
    setEditId(item.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tenderNumber.trim() || !form.title.trim() || !form.description.trim()) {
      showFlash('error', 'Tender number, title, and description are required.');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/tenders';
      const method = editId ? 'PUT' : 'POST';
      const payload = editId ? { id: editId, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        showFlash('error', 'Your session has expired. Please log in at /admin/login.');
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', editId ? 'Tender updated successfully.' : 'Tender created successfully.');
        setShowModal(false);
        loadTenders();
      } else {
        showFlash('error', data.error || 'Failed to save tender.');
      }
    } catch (err: any) {
      showFlash('error', err.message || 'Error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, number: string) => {
    if (!confirm(`Are you sure you want to delete tender ${number}?`)) return;
    try {
      const res = await fetch(`/api/admin/tenders?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFlash('success', `Tender ${number} deleted.`);
        loadTenders();
      } else {
        const d = await res.json();
        showFlash('error', d.error || 'Failed to delete tender.');
      }
    } catch {
      showFlash('error', 'Network error.');
    }
  };

  const filtered = tenders.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#8B2E24]" />
            <span>Dedicated Tenders &amp; Procurement Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Separate procurement announcements and requests for proposals (Feedback Item 5).
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2 bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Tender</span>
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
            placeholder="Search tenders by number or keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#8B2E24]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open Tenders</option>
          <option value="CLOSED">Closed Tenders</option>
          <option value="AWARDED">Awarded</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
            <tr>
              <th className="py-3 px-4">Tender Ref</th>
              <th className="py-3 px-4">Title &amp; Category</th>
              <th className="py-3 px-4">Closing Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Document</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">Loading tenders...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">No tenders found.</td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.tenderNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{t.title}</div>
                    <div className="text-[11px] text-slate-500">{t.category} {t.estimatedBudget ? `· ${t.estimatedBudget}` : ''}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {new Date(t.closingDate).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {t.documentUrl ? (
                      <a href={t.documentUrl} target="_blank" rel="noreferrer" className="text-[#8B2E24] hover:underline flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.tenderNumber)}
                      className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[90vh] overflow-hidden text-slate-900">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">{editId ? 'Edit Tender' : 'Create New Tender'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Tender Reference Number *</label>
                    <input
                      type="text"
                      required
                      value={form.tenderNumber}
                      onChange={(e) => setForm({ ...form, tenderNumber: e.target.value })}
                      placeholder="HAB/TEND/2026/001"
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">Tender Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Supply and Delivery of Masterclass Weaving Looms"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Opening Date</label>
                    <input
                      type="date"
                      value={form.openingDate}
                      onChange={(e) => setForm({ ...form, openingDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Closing Date &amp; Time *</label>
                    <input
                      type="date"
                      required
                      value={form.closingDate}
                      onChange={(e) => setForm({ ...form, closingDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">Detailed Description &amp; Scope *</label>
                  <textarea
                    rows={4}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Provide full tender requirements, quantity specifications, and delivery guidelines..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Estimated Budget / Value</label>
                    <input
                      type="text"
                      value={form.estimatedBudget}
                      onChange={(e) => setForm({ ...form, estimatedBudget: e.target.value })}
                      placeholder="Nu. 500,000 or Open"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="AWARDED">AWARDED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1">Mandatory Eligibility Criteria</label>
                  <textarea
                    rows={2}
                    value={form.eligibility}
                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                    placeholder="Valid trade license, tax clearance, relevant past experience..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Document Upload for Tender (PDF / Flipbook) */}
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                  <div className="font-semibold text-amber-900">
                    Supporting Bidding Document (PDF)
                  </div>
                  <FileUploadInput
                    label="Tender RFP Document (PDF)"
                    value={form.documentUrl}
                    onChange={(url) => setForm({ ...form, documentUrl: url })}
                    accept=".pdf,application/pdf"
                    hint="Upload official RFP terms document (PDF) for bidders."
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Submission Email</label>
                    <input
                      type="email"
                      value={form.submissionEmail}
                      onChange={(e) => setForm({ ...form, submissionEmail: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Secretary Contact Person</label>
                    <input
                      type="text"
                      value={form.contactPerson}
                      onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
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
                  {saving ? 'Saving...' : 'Save Tender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
