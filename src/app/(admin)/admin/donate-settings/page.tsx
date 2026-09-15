'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  Layers,
  Printer,
  Download,
  Search,
  FileText,
  Landmark,
  Eye,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';

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

const EMPTY_OFFLINE_DONATION = {
  pillarKey: '',
  donorName: '',
  donorEmail: '',
  amountUSD: 100,
  amountBTN: 8400,
  frequency: 'ONE_TIME',
  status: 'COMPLETED',
  receiptNumber: '',
  notes: '',
  paymentMethod: 'BANK',
};

export default function AdminDonateSettingsPage() {
  const [activeTab, setActiveTab] = useState<'pillars' | 'donations' | 'banking'>('pillars');
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalDonationsUSD, setTotalDonationsUSD] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPillar, setFilterPillar] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Pillar modal state
  const [showPillarModal, setShowPillarModal] = useState(false);
  const [editPillarId, setEditPillarId] = useState<string | null>(null);
  const [pillarForm, setPillarForm] = useState(EMPTY_PILLAR);
  const [savingPillar, setSavingPillar] = useState(false);

  // Offline Donation modal state
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineForm, setOfflineForm] = useState(EMPTY_OFFLINE_DONATION);
  const [savingDonation, setSavingDonation] = useState(false);

  // Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState<Donation | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  // Flash message
  const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        fetch('/api/admin/support-pillars', { cache: 'no-store' }),
        fetch('/api/admin/donations', { cache: 'no-store' }),
      ]);
      const pData = await pRes.json();
      const dData = await dRes.json();
      if (pData.pillars) setPillars(pData.pillars);
      if (dData.donations) setDonations(dData.donations);
      if (dData.totalUSD !== undefined) setTotalDonationsUSD(dData.totalUSD);
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
    setTimeout(() => setFlashMsg(null), 4500);
  };

  // --- Support Pillars CRUD ---
  const openCreatePillar = () => {
    setPillarForm(EMPTY_PILLAR);
    setEditPillarId(null);
    setShowPillarModal(true);
  };

  const openEditPillar = (p: Pillar) => {
    setPillarForm({
      key: p.key,
      title: p.title,
      description: p.description,
      targetAmountUSD: p.targetAmountUSD,
      raisedAmountUSD: p.raisedAmountUSD,
      iconEmoji: p.iconEmoji || 'leaf',
      isActive: p.isActive,
      sortOrder: p.sortOrder,
    });
    setEditPillarId(p.id);
    setShowPillarModal(true);
  };

  const handleSavePillar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pillarForm.key.trim() || !pillarForm.title.trim() || !pillarForm.description.trim()) {
      showFlash('error', 'Key, title, and description are required.');
      return;
    }

    setSavingPillar(true);
    try {
      const url = '/api/admin/support-pillars';
      const method = editPillarId ? 'PUT' : 'POST';
      const payload = editPillarId ? { id: editPillarId, ...pillarForm } : pillarForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', editPillarId ? 'Pillar updated.' : 'Pillar created.');
        setShowPillarModal(false);
        loadData();
      } else {
        showFlash('error', data.error || 'Save failed.');
      }
    } catch (err: any) {
      showFlash('error', err.message || 'Error occurred.');
    } finally {
      setSavingPillar(false);
    }
  };

  const togglePillarActive = async (p: Pillar) => {
    try {
      const res = await fetch('/api/admin/support-pillars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
      });
      if (res.ok) {
        showFlash('success', `Pillar "${p.title}" is now ${!p.isActive ? 'Active' : 'Hidden'}.`);
        loadData();
      }
    } catch {
      showFlash('error', 'Failed to toggle pillar status.');
    }
  };

  const handleDeletePillar = async (id: string, title: string) => {
    if (!confirm(`Delete support pillar "${title}"? This cannot be undone.`)) return;
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

  // --- Offline Donations CRUD ---
  const openRecordDonation = () => {
    const defaultPillar = pillars[0]?.key || 'grassroots';
    setOfflineForm({
      ...EMPTY_OFFLINE_DONATION,
      pillarKey: defaultPillar,
      receiptNumber: `HAB-DON-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    });
    setShowOfflineModal(true);
  };

  const handleSaveDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineForm.pillarKey || !offlineForm.donorName || !offlineForm.donorEmail) {
      showFlash('error', 'Please provide Pillar, Donor Name, and Email.');
      return;
    }

    setSavingDonation(true);
    try {
      const res = await fetch('/api/admin/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillarKey: offlineForm.pillarKey,
          donorName: offlineForm.donorName,
          donorEmail: offlineForm.donorEmail,
          amountUSD: Number(offlineForm.amountUSD),
          frequency: offlineForm.frequency,
          status: offlineForm.status,
          receiptNumber: offlineForm.receiptNumber,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', `Donation recorded! Receipt: ${data.donation.receiptNumber}`);
        setShowOfflineModal(false);
        loadData();
      } else {
        showFlash('error', data.error || 'Failed to record donation.');
      }
    } catch (err: any) {
      showFlash('error', err.message || 'Error occurred.');
    } finally {
      setSavingDonation(false);
    }
  };

  const handleUpdateDonationStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/donations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', `Status updated to ${newStatus}.`);
        loadData();
      } else {
        showFlash('error', data.error || 'Failed to update status.');
      }
    } catch {
      showFlash('error', 'Network error.');
    }
  };

  const handleDeleteDonation = async (id: string, receiptNumber: string) => {
    if (!confirm(`Delete donation record "${receiptNumber}"? Pillar totals will be reconciled.`)) return;
    try {
      const res = await fetch(`/api/admin/donations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFlash('success', `Deleted donation ${receiptNumber}.`);
        loadData();
      } else {
        const data = await res.json();
        showFlash('error', data.error || 'Failed to delete donation.');
      }
    } catch {
      showFlash('error', 'Network error.');
    }
  };

  // --- Filtered Donations ---
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      if (filterPillar !== 'ALL' && d.pillarKey !== filterPillar) return false;
      if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = d.donorName?.toLowerCase().includes(q);
        const matchEmail = d.donorEmail?.toLowerCase().includes(q);
        const matchReceipt = d.receiptNumber?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchReceipt) return false;
      }
      return true;
    });
  }, [donations, filterPillar, filterStatus, searchQuery]);

  // --- Export CSV ---
  const handleExportCSV = () => {
    if (donations.length === 0) {
      showFlash('error', 'No donations to export.');
      return;
    }

    const headers = ['Receipt Number', 'Date', 'Donor Name', 'Donor Email', 'Pillar', 'Amount USD', 'Amount BTN (Approx)', 'Frequency', 'Status'];
    const rows = donations.map((d) => [
      `"${d.receiptNumber}"`,
      `"${new Date(d.createdAt).toISOString().split('T')[0]}"`,
      `"${d.donorName.replace(/"/g, '""')}"`,
      `"${d.donorEmail.replace(/"/g, '""')}"`,
      `"${(d.pillar?.title || d.pillarKey).replace(/"/g, '""')}"`,
      d.amountUSD,
      Math.round(d.amountUSD * 84),
      `"${d.frequency}"`,
      `"${d.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HAB_Donations_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFlash('success', 'CSV exported successfully.');
  };

  const copyBankDetails = () => {
    const text = `Handicrafts Association of Bhutan (CSO/2011/043)
Bank of Bhutan Limited (BoB)
Account Number: 201104300189
Account Name: Handicrafts Association of Bhutan
Branch: Thimphu Main Branch
SWIFT Code: BOBTBLBT`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold admin-title flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600" />
            Donations & Artisan Support CMS
          </h1>
          <p className="text-sm admin-muted mt-1">
            Full administrative control over fundraising support pillars, financial records, manual offline gifts, and official tax receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'pillars' && (
            <button
              onClick={openCreatePillar}
              className="admin-button-primary px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Support Pillar
            </button>
          )}

          {activeTab === 'donations' && (
            <>
              <button
                onClick={handleExportCSV}
                className="admin-button-secondary px-3.5 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5"
                title="Export donations to CSV"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={openRecordDonation}
                className="admin-button-primary px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Record Offline Donation
              </button>
            </>
          )}
        </div>
      </div>

      {/* Flash Notice */}
      {flashMsg && (
        <div
          className={`p-4 rounded-lg text-sm border flex items-center gap-2 transition-all ${
            flashMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {flashMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
          <span className="font-medium">{flashMsg.text}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b admin-border gap-6">
        <button
          onClick={() => setActiveTab('pillars')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'pillars'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent admin-muted hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Support Pillars ({pillars.length})
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'donations'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent admin-muted hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Donations Ledger ({donations.length})
        </button>

        <button
          onClick={() => setActiveTab('banking')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'banking'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent admin-muted hover:text-slate-900'
          }`}
        >
          <Landmark className="w-4 h-4" />
          Bank Details & CSO Exemption
        </button>
      </div>

      {/* Tab 1: Support Pillars */}
      {activeTab === 'pillars' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-2 p-12 text-center admin-muted">Loading support pillars...</div>
            ) : pillars.length === 0 ? (
              <div className="col-span-2 p-12 text-center admin-muted">No support pillars configured yet.</div>
            ) : (
              pillars.map((p) => {
                const pct = p.targetAmountUSD > 0 ? Math.min(100, Math.round((p.raisedAmountUSD / p.targetAmountUSD) * 100)) : 0;
                return (
                  <div key={p.id} className="admin-card rounded-xl border admin-border p-5 space-y-4 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200">
                            {p.key}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePillarActive(p)}
                            className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer border transition ${
                              p.isActive
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Click to toggle visibility"
                          >
                            {p.isActive ? '● Active on Site' : '○ Hidden'}
                          </button>
                        </div>
                        <h3 className="text-lg font-bold admin-title mt-1.5">{p.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditPillar(p)}
                          className="p-1.5 rounded hover:bg-slate-100 text-amber-700 transition"
                          title="Edit pillar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePillar(p.id, p.title)}
                          className="p-1.5 rounded hover:bg-slate-100 text-rose-600 transition"
                          title="Delete pillar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm admin-text line-clamp-3">{p.description}</p>

                    <div className="space-y-1.5 pt-2 border-t admin-border">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="admin-muted">Raised Progress ({pct}%)</span>
                        <span className="admin-title font-semibold">
                          ${p.raisedAmountUSD.toLocaleString()} / ${p.targetAmountUSD.toLocaleString()} USD
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] admin-muted pt-0.5">
                        <span>Approx. Nu. {Math.round(p.raisedAmountUSD * 84).toLocaleString()} BTN</span>
                        <span>Goal: Nu. {Math.round(p.targetAmountUSD * 84).toLocaleString()} BTN</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Donations Ledger */}
      {activeTab === 'donations' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="admin-card p-4 rounded-xl border admin-border">
              <span className="text-xs font-semibold admin-muted uppercase tracking-wider">Total Received</span>
              <div className="text-2xl font-bold admin-title text-emerald-700 mt-1">
                ${totalDonationsUSD.toLocaleString()} USD
              </div>
              <p className="text-xs admin-muted mt-0.5">
                Approx. Nu. {Math.round(totalDonationsUSD * 84).toLocaleString()} BTN
              </p>
            </div>

            <div className="admin-card p-4 rounded-xl border admin-border">
              <span className="text-xs font-semibold admin-muted uppercase tracking-wider">Total Transactions</span>
              <div className="text-2xl font-bold admin-title mt-1">{donations.length}</div>
              <p className="text-xs admin-muted mt-0.5">
                {donations.filter((d) => d.status === 'COMPLETED').length} Completed · {donations.filter((d) => d.status === 'PENDING').length} Pending
              </p>
            </div>

            <div className="admin-card p-4 rounded-xl border admin-border">
              <span className="text-xs font-semibold admin-muted uppercase tracking-wider">Average Gift</span>
              <div className="text-2xl font-bold admin-title text-amber-800 mt-1">
                ${donations.length > 0 ? Math.round(totalDonationsUSD / donations.length).toLocaleString() : '0'} USD
              </div>
              <p className="text-xs admin-muted mt-0.5">Across all support pillars</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="admin-card p-3.5 rounded-xl border admin-border flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 admin-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search donor, email, or receipt #..."
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg admin-input border admin-border focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={filterPillar}
                onChange={(e) => setFilterPillar(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg admin-input border admin-border font-medium flex-1 md:flex-none"
              >
                <option value="ALL">All Pillars</option>
                {pillars.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.title}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg admin-input border admin-border font-medium flex-1 md:flex-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="REFUNDED">Refunded</option>
              </select>

              <button
                type="button"
                onClick={loadData}
                className="p-2 rounded-lg border admin-border hover:bg-slate-100 text-slate-600 transition"
                title="Refresh ledger"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="admin-card rounded-xl border admin-border overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center admin-muted">Loading donations...</div>
            ) : filteredDonations.length === 0 ? (
              <div className="p-12 text-center admin-muted">
                {donations.length === 0 ? 'No donations recorded yet.' : 'No donations match your filter criteria.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b admin-border bg-slate-50 text-xs font-semibold admin-muted uppercase tracking-wider">
                      <th className="px-5 py-3">Receipt / Date</th>
                      <th className="px-5 py-3">Donor</th>
                      <th className="px-5 py-3">Pillar</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Frequency</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y admin-border text-sm">
                    {filteredDonations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-xs font-semibold admin-title">{d.receiptNumber}</div>
                          <div className="text-xs admin-muted">
                            {new Date(d.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-medium admin-title">{d.donorName}</div>
                          <div className="text-xs admin-muted">{d.donorEmail}</div>
                        </td>

                        <td className="px-5 py-3.5 admin-text text-xs">
                          <span className="font-medium">{d.pillar?.title || d.pillarKey}</span>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-bold text-emerald-700">${d.amountUSD.toLocaleString()} USD</div>
                          <div className="text-[11px] admin-muted">
                            ≈ Nu. {Math.round(d.amountUSD * 84).toLocaleString()}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-800 border border-amber-200">
                            {d.frequency === 'MONTHLY' ? 'Monthly' : 'One-Time'}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <select
                            value={d.status}
                            onChange={(e) => handleUpdateDonationStatus(d.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded font-semibold border cursor-pointer ${
                              d.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : d.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="REFUNDED">Refunded</option>
                          </select>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(d)}
                              className="p-1.5 rounded hover:bg-slate-100 text-blue-700 transition"
                              title="View official printable tax receipt"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDonation(d.id, d.receiptNumber)}
                              className="p-1.5 rounded hover:bg-slate-100 text-rose-600 transition"
                              title="Delete donation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Tab 3: Banking & Exemption Settings */}
      {activeTab === 'banking' && (
        <div className="space-y-6">
          <div className="admin-card rounded-xl border admin-border p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold admin-title flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-amber-700" />
                  Bank of Bhutan Wire & mBoB Details
                </h2>
                <p className="text-xs admin-muted mt-1">
                  Official banking credentials provided to donors choosing direct bank transfer or mBoB mobile QR payment.
                </p>
              </div>
              <button
                type="button"
                onClick={copyBankDetails}
                className="admin-button-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedBank ? 'Copied' : 'Copy Banking Details'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-slate-50 border admin-border space-y-1">
                <span className="text-xs admin-muted uppercase tracking-wider font-semibold">Account Name</span>
                <p className="text-sm font-bold admin-title">Handicrafts Association of Bhutan</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border admin-border space-y-1">
                <span className="text-xs admin-muted uppercase tracking-wider font-semibold">Bank Name & Branch</span>
                <p className="text-sm font-bold admin-title">Bank of Bhutan Limited (BoB) · Thimphu Main Branch</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border admin-border space-y-1">
                <span className="text-xs admin-muted uppercase tracking-wider font-semibold">Account Number</span>
                <p className="text-sm font-mono font-bold text-amber-800">201104300189</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border admin-border space-y-1">
                <span className="text-xs admin-muted uppercase tracking-wider font-semibold">SWIFT / BIC Code</span>
                <p className="text-sm font-mono font-bold text-amber-800">BOBTBLBT</p>
              </div>
            </div>
          </div>

          <div className="admin-card rounded-xl border admin-border p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-bold admin-title flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-700" />
              CSO Tax Exemption & Regulatory Authority
            </h2>
            <p className="text-sm admin-text leading-relaxed">
              Handicrafts Association of Bhutan (HAB) is registered under the{' '}
              <strong>Civil Society Organizations Act of Bhutan</strong> as an authorized Public Benefit Organisation
              (Registration No: <strong>CSO/2011/043</strong>).
            </p>
            <p className="text-sm admin-text leading-relaxed">
              Contributions qualify for official tax deductions under the rules and regulations of the Department of
              Revenue and Customs (DRC), Ministry of Finance, Royal Government of Bhutan. Every issued receipt carries this
              legal sanction.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 1: Support Pillar Add / Edit */}
      {showPillarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="admin-card w-full max-w-lg rounded-2xl border admin-border p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b admin-border pb-3">
              <h2 className="text-lg font-bold admin-title">
                {editPillarId ? 'Edit Support Pillar' : 'Add Support Pillar'}
              </h2>
              <button
                onClick={() => setShowPillarModal(false)}
                className="admin-muted hover:text-slate-900 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePillar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">Pillar Key *</label>
                <input
                  type="text"
                  value={pillarForm.key}
                  onChange={(e) => setPillarForm({ ...pillarForm, key: e.target.value })}
                  placeholder="e.g. emergency-relief"
                  disabled={!!editPillarId}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">Title *</label>
                <input
                  type="text"
                  value={pillarForm.title}
                  onChange={(e) => setPillarForm({ ...pillarForm, title: e.target.value })}
                  placeholder="e.g. Artisan Emergency Relief Fund"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                />
              </div>

              <div>
                <RichTextEditor
                  label="Description & Impact Narrative *"
                  value={pillarForm.description}
                  onChange={(html) => setPillarForm({ ...pillarForm, description: html })}
                  hint="Describe where funds go and the impact on Bhutanese craftspeople..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Target USD *</label>
                  <input
                    type="number"
                    value={pillarForm.targetAmountUSD}
                    onChange={(e) => setPillarForm({ ...pillarForm, targetAmountUSD: Number(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Raised USD</label>
                  <input
                    type="number"
                    value={pillarForm.raisedAmountUSD}
                    onChange={(e) => setPillarForm({ ...pillarForm, raisedAmountUSD: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActivePillar"
                  checked={pillarForm.isActive}
                  onChange={(e) => setPillarForm({ ...pillarForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <label htmlFor="isActivePillar" className="text-sm admin-title font-medium cursor-pointer">
                  Active (visible and selectable on public /donate page)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setShowPillarModal(false)}
                  className="px-4 py-2 text-sm rounded-lg admin-button-secondary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPillar}
                  className="px-5 py-2 text-sm rounded-lg admin-button-primary font-medium disabled:opacity-50"
                >
                  {savingPillar ? 'Saving...' : editPillarId ? 'Save Changes' : 'Create Pillar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Offline Donation */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="admin-card w-full max-w-lg rounded-2xl border admin-border p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b admin-border pb-3">
              <h2 className="text-lg font-bold admin-title flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-700" />
                Record Offline / Direct Donation
              </h2>
              <button
                onClick={() => setShowOfflineModal(false)}
                className="admin-muted hover:text-slate-900 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDonation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">Target Pillar *</label>
                <select
                  value={offlineForm.pillarKey}
                  onChange={(e) => setOfflineForm({ ...offlineForm, pillarKey: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none font-medium"
                >
                  {pillars.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Donor Name *</label>
                  <input
                    type="text"
                    value={offlineForm.donorName}
                    onChange={(e) => setOfflineForm({ ...offlineForm, donorName: e.target.value })}
                    placeholder="e.g. Tshering Tobgay"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Donor Email *</label>
                  <input
                    type="email"
                    value={offlineForm.donorEmail}
                    onChange={(e) => setOfflineForm({ ...offlineForm, donorEmail: e.target.value })}
                    placeholder="donor@example.bt"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Amount (USD) *</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={offlineForm.amountUSD}
                    onChange={(e) => {
                      const usd = Number(e.target.value) || 0;
                      setOfflineForm({
                        ...offlineForm,
                        amountUSD: usd,
                        amountBTN: Math.round(usd * 84),
                      });
                    }}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none font-bold"
                  />
                  <span className="text-[11px] admin-muted mt-0.5 block">
                    ≈ Nu. {offlineForm.amountBTN.toLocaleString()} BTN
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Or in BTN (Nu.)</label>
                  <input
                    type="number"
                    min="1"
                    value={offlineForm.amountBTN}
                    onChange={(e) => {
                      const btn = Number(e.target.value) || 0;
                      setOfflineForm({
                        ...offlineForm,
                        amountBTN: btn,
                        amountUSD: Math.round((btn / 84) * 100) / 100,
                      });
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Payment Method</label>
                  <select
                    value={offlineForm.paymentMethod}
                    onChange={(e) => setOfflineForm({ ...offlineForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none font-medium"
                  >
                    <option value="BANK">Bank Wire Transfer (BoB)</option>
                    <option value="MBOB">mBoB Mobile Banking QR</option>
                    <option value="CASH">Cash at HAB Office</option>
                    <option value="CHEQUE">Cheque / Demand Draft</option>
                    <option value="CARD">Credit / Debit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Status</label>
                  <select
                    value={offlineForm.status}
                    onChange={(e) => setOfflineForm({ ...offlineForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none font-medium"
                  >
                    <option value="COMPLETED">Completed (Funds Verified)</option>
                    <option value="PENDING">Pending Clearance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">
                  Receipt Number (Auto or Custom)
                </label>
                <input
                  type="text"
                  value={offlineForm.receiptNumber}
                  onChange={(e) => setOfflineForm({ ...offlineForm, receiptNumber: e.target.value })}
                  placeholder="HAB-DON-2026-XXXXX"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg admin-input border admin-border focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setShowOfflineModal(false)}
                  className="px-4 py-2 text-sm rounded-lg admin-button-secondary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDonation}
                  className="px-5 py-2 text-sm rounded-lg admin-button-primary font-medium disabled:opacity-50"
                >
                  {savingDonation ? 'Recording...' : 'Record & Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Official Printable Tax Receipt */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="admin-card w-full max-w-2xl rounded-2xl border admin-border p-8 space-y-6 shadow-2xl relative bg-white">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/hab-logo.png"
                  alt="HAB Logo"
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    HANDICRAFTS ASSOCIATION OF BHUTAN
                  </h2>
                  <p className="text-xs text-slate-500">
                    Registered Public Benefit CSO: CSO/2011/043 · Thimphu, Kingdom of Bhutan
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-800 text-xl font-bold p-1 print:hidden"
              >
                ✕
              </button>
            </div>

            {/* Receipt Body */}
            <div className="space-y-6 text-slate-800">
              <div className="text-center py-2 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-900">
                  Official Tax Exemption Receipt
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-semibold">Receipt Number</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    {selectedReceipt.receiptNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">Date Issued</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(selectedReceipt.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-semibold">Received From</span>
                  <p className="font-bold text-slate-900 text-base">{selectedReceipt.donorName}</p>
                  <p className="text-xs text-slate-600">{selectedReceipt.donorEmail}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">Contribution Amount</span>
                  <div className="text-2xl font-bold text-emerald-700">
                    ${selectedReceipt.amountUSD.toLocaleString()} USD
                  </div>
                  <div className="text-xs text-slate-600">
                    Equivalent: Nu. {Math.round(selectedReceipt.amountUSD * 84).toLocaleString()} BTN
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm border-b pb-4">
                <span className="text-xs text-slate-500 block uppercase font-semibold">Support Allocation</span>
                <p className="font-semibold text-slate-900">
                  {selectedReceipt.pillar?.title || selectedReceipt.pillarKey}
                </p>
                <p className="text-xs text-slate-600">
                  Frequency: <strong>{selectedReceipt.frequency === 'MONTHLY' ? 'Monthly Ongoing Gift' : 'One-Time Direct Contribution'}</strong> · Status: <strong>{selectedReceipt.status}</strong>
                </p>
              </div>

              {/* Legal Notice */}
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 leading-relaxed border">
                <p>
                  <strong>Tax Exemption Notice:</strong> This receipt certifies a bona fide charitable contribution to the
                  Handicrafts Association of Bhutan (HAB), a registered Public Benefit Organisation (CSO/2011/043).
                  Contributions qualify for tax deductibility under the Civil Society Organizations Act of Bhutan and
                  Department of Revenue and Customs (DRC) guidelines.
                </p>
              </div>

              {/* Signatory representation */}
              <div className="flex justify-between items-end pt-4">
                <div className="text-xs text-slate-500 font-mono">
                  HAB-SEC-VERIFIED · CSO/2011/043
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <span className="text-xs text-slate-700 font-semibold block">Authorized Signatory</span>
                  <span className="text-[11px] text-slate-500 block">Handicrafts Association of Bhutan</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t print:hidden">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 text-sm rounded-lg admin-button-secondary font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-sm rounded-lg admin-button-primary font-medium flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

