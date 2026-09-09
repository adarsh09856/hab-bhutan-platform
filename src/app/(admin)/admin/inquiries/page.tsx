'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  RefreshCw, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Phone,
  MessageSquare
} from 'lucide-react';
import { 
  GlassCard, 
  GlassStatWidget, 
  GlassBadge, 
  GlassButton, 
  GlassDrawer, 
  GlassSelect 
} from '@/components/admin/GlassUI';

interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Inquiry Drawer
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);
  const [editStatus, setEditStatus] = useState('NEW');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/inquiries', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const filteredInquiries = inquiries.filter((inq) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQ = !q || inq.name.toLowerCase().includes(q) || inq.email.toLowerCase().includes(q) || inq.subject.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || inq.status === statusFilter;
    return matchesQ && matchesStatus;
  });

  const newCount = inquiries.filter((i) => i.status === 'NEW').length;
  const inProgressCount = inquiries.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedCount = inquiries.filter((i) => i.status === 'RESOLVED').length;

  const handleOpenDrawer = (inq: InquiryRecord) => {
    setSelectedInquiry(inq);
    setEditStatus(inq.status);
    setAdminNotes(inq.adminNotes || '');
  };

  const handleSaveInquiry = async () => {
    if (!selectedInquiry) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: selectedInquiry.id,
          status: editStatus,
          adminNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedInquiry(null);
        loadInquiries();
      } else {
        alert(data.error || 'Failed to update inquiry.');
      }
    } catch {
      alert('Error updating inquiry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this inquiry?')) return;
    try {
      const res = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setSelectedInquiry(null);
        loadInquiries();
      }
    } catch {
      alert('Error deleting inquiry.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold admin-title tracking-tight flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-amber-400" />
            Inquiries &amp; Customer Communications
          </h1>
          <p className="text-xs admin-muted mt-1">
            Messages and inquiries submitted via the public Contact Secretariat portal.
          </p>
        </div>

        <GlassButton
          variant="secondary"
          size="md"
          onClick={loadInquiries}
          icon={RefreshCw}
          loading={loading}
        >
          Refresh Inbox
        </GlassButton>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStatWidget
          title="Total Inquiries"
          value={loading ? '...' : inquiries.length}
          subtitle="All received messages"
          icon={Mail}
          glow="amber"
          trendLabel="All channels"
        />
        <GlassStatWidget
          title="Unread / New"
          value={loading ? '...' : newCount}
          subtitle="Requires response"
          icon={Clock}
          glow="rose"
          trendLabel="Pending review"
        />
        <GlassStatWidget
          title="In Progress"
          value={loading ? '...' : inProgressCount}
          subtitle="Being handled by staff"
          icon={MessageSquare}
          glow="indigo"
          trendLabel="Active dialogs"
        />
        <GlassStatWidget
          title="Resolved"
          value={loading ? '...' : resolvedCount}
          subtitle="Successfully closed"
          icon={CheckCircle2}
          glow="emerald"
          trendLabel="Archived"
        />
      </div>

      {/* Main Glass Table */}
      <GlassCard className="p-6">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b admin-border">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-3 admin-muted" />
            <input
              type="text"
              placeholder="Search sender, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input px-3 py-2 text-xs rounded-xl border focus:outline-hidden"
          >
            <option value="ALL">All Status</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="admin-muted border-b admin-border font-semibold uppercase tracking-wider text-[10.5px]">
                <th className="py-3.5 pr-4">Sender</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date Received</th>
                <th className="py-3.5 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y admin-divider admin-text">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center admin-muted font-mono">
                    Loading messages from database...
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center admin-muted">
                    No inquiries match the current filter.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inq) => (
                  <tr key={inq.id} className="admin-hover transition-colors cursor-pointer" onClick={() => handleOpenDrawer(inq)}>
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold admin-title">{inq.name}</div>
                      <div className="text-[11px] admin-muted font-mono">{inq.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium admin-text max-w-xs truncate">{inq.subject}</div>
                      <div className="text-[11px] admin-muted truncate max-w-xs">{inq.message}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <GlassBadge status={inq.status} />
                    </td>
                    <td className="py-3.5 px-4 admin-muted font-mono text-[11px]">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 pl-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDrawer(inq)}
                          className="px-2.5 py-1 rounded-lg admin-button-secondary text-[11px]"
                        >
                          View Message
                        </button>
                        <button
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 admin-muted hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Inquiry Detail Drawer */}
      <GlassDrawer
        isOpen={Boolean(selectedInquiry)}
        onClose={() => setSelectedInquiry(null)}
        title="Inquiry Details"
        subtitle={selectedInquiry?.subject}
        width="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Sender Details Box */}
          <div className="p-4 rounded-xl admin-panel border admin-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span className="font-bold admin-title text-sm">{selectedInquiry?.name}</span>
              </div>
              <span className="text-[11px] admin-muted font-mono">
                {selectedInquiry?.createdAt && new Date(selectedInquiry.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="admin-text font-mono">{selectedInquiry?.email}</div>
            {selectedInquiry?.phone && (
              <div className="admin-muted flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{selectedInquiry.phone}</span>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="p-4 rounded-xl admin-panel border admin-border space-y-1">
            <div className="text-[10.5px] uppercase tracking-wider admin-muted font-semibold">
              Message Body
            </div>
            <p className="admin-text text-xs leading-relaxed whitespace-pre-wrap">
              {selectedInquiry?.message}
            </p>
          </div>

          {/* Status Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold admin-text uppercase tracking-wider">
              Workflow Status
            </label>
            <GlassSelect
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <option value="NEW">New (Unreviewed)</option>
              <option value="IN_PROGRESS">In Progress (Being Responded To)</option>
              <option value="RESOLVED">Resolved (Completed)</option>
              <option value="ARCHIVED">Archived</option>
            </GlassSelect>
          </div>

          {/* Admin Internal Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold admin-text uppercase tracking-wider">
              Secretariat Internal Notes
            </label>
            <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal follow-up notes, assigned officer, or resolution details..."
              className="admin-input w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between border-t admin-border">
            <button
              onClick={() => selectedInquiry && handleDeleteInquiry(selectedInquiry.id)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Inquiry</span>
            </button>

            <div className="flex items-center gap-2">
              <GlassButton
                variant="secondary"
                size="md"
                onClick={() => setSelectedInquiry(null)}
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                size="md"
                loading={saving}
                onClick={handleSaveInquiry}
              >
                Save Updates
              </GlassButton>
            </div>
          </div>
        </div>
      </GlassDrawer>
    </div>
  );
}
