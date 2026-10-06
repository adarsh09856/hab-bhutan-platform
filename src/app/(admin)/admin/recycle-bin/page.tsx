'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  FileText,
  ShoppingBag,
  Calendar,
  Building2,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Archive
} from 'lucide-react';

interface TrashItem {
  id: string;
  entityType: 'PRODUCT' | 'PAGE' | 'NEWS' | 'EVENT' | 'TENDER' | 'OUTLET' | 'MEMBER' | 'DOCUMENT';
  originalId: string;
  itemTitle: string;
  itemData: Record<string, any>;
  deletedBy?: string;
  reason?: string;
  deletedAt: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  PRODUCT: { label: 'Product', icon: ShoppingBag, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  PAGE: { label: 'Web Page', icon: Layers, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  NEWS: { label: 'News Post', icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  EVENT: { label: 'Event / Expo', icon: Calendar, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  TENDER: { label: 'Tender / RFQ', icon: Building2, color: 'bg-stone-100 text-stone-700 border-stone-300' },
  OUTLET: { label: 'Store Outlet', icon: ShoppingBag, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  MEMBER: { label: 'Artisan Member', icon: Layers, color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function AdminRecycleBinPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/recycle-bin', { cache: 'no-store' });
      const data = await res.json();
      if (data?.items) {
        setItems(data.items);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load Recycle Bin items.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (item: TrashItem) => {
    if (!confirm(`Restore "${item.itemTitle}" back to its active status?`)) return;
    try {
      setActionLoading(item.id);
      setFeedback(null);
      const res = await fetch('/api/admin/recycle-bin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recycleBinId: item.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: `"${item.itemTitle}" was successfully restored to its original live location.`,
        });
        fetchTrash();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to restore item.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error occurred while restoring item.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePurge = async (item: TrashItem) => {
    if (
      !confirm(
        `PERMANENTLY DELETE "${item.itemTitle}"?\n\nWarning: This action cannot be undone. The item will be removed permanently from both the recycle bin and the database.`
      )
    )
      return;

    try {
      setActionLoading(item.id);
      setFeedback(null);
      const res = await fetch(`/api/admin/recycle-bin?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: `"${item.itemTitle}" was permanently purged.`,
        });
        fetchTrash();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to permanently delete item.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error occurred while purging item.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEmptyAll = async () => {
    if (
      !confirm(
        'Empty entire Recycle Bin?\n\nWarning: This will permanently purge ALL soft-deleted items across all sections. This cannot be undone.'
      )
    )
      return;

    try {
      setActionLoading('all');
      setFeedback(null);
      const res = await fetch('/api/admin/recycle-bin?emptyAll=true', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Recycle Bin has been completely emptied.' });
        fetchTrash();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to empty recycle bin.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error occurred while emptying recycle bin.' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesType = selectedType === 'ALL' || item.entityType === selectedType;
    const matchesSearch =
      !search.trim() ||
      item.itemTitle.toLowerCase().includes(search.toLowerCase()) ||
      item.entityType.toLowerCase().includes(search.toLowerCase()) ||
      (item.deletedBy && item.deletedBy.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-[#8B2E24] flex items-center justify-center shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recycle Bin &amp; Soft Delete</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Safely recover deleted pages, news articles, events, products, or tenders before permanent purge.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchTrash}
            disabled={loading}
            className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer text-xs font-medium flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {items.length > 0 && (
            <button
              type="button"
              onClick={handleEmptyAll}
              disabled={actionLoading !== null}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              Empty Recycle Bin
            </button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium border shadow-xs animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-none" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-none" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search soft-deleted items by title, type, or user..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B2E24]"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            {['ALL', 'PRODUCT', 'PAGE', 'NEWS', 'EVENT', 'TENDER'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedType === t
                    ? 'bg-[#8B2E24] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {t === 'ALL' ? `All (${items.length})` : `${TYPE_CONFIG[t]?.label || t} (${items.filter((i) => i.entityType === t).length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mb-2 text-[#8B2E24]" />
            <span className="text-xs font-medium">Scanning Recycle Bin for soft-deleted items...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Archive className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Recycle Bin is Empty</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              {items.length === 0
                ? 'No soft-deleted records currently stored. Any items deleted from products, pages, news, or events will appear here safely for recovery.'
                : 'No items match your filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const cfg = TYPE_CONFIG[item.entityType] || {
                label: item.entityType,
                icon: Layers,
                color: 'bg-slate-100 text-slate-700 border-slate-300',
              };
              const Icon = cfg.icon;
              const isActing = actionLoading === item.id;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-none text-slate-600">
                      <Icon className="w-5 h-5 text-[#8B2E24]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">ID: {item.originalId}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.itemTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Deleted {new Date(item.deletedAt).toLocaleString('en-US')}</span>
                        {item.deletedBy && (
                          <>
                            <span>•</span>
                            <span>By: {item.deletedBy}</span>
                          </>
                        )}
                        {item.reason && (
                          <>
                            <span>•</span>
                            <span className="italic">{item.reason}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-none">
                    <button
                      type="button"
                      onClick={() => handleRestore(item)}
                      disabled={isActing}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePurge(item)}
                      disabled={isActing}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      Permanently Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
        <HelpCircle className="w-4 h-4 text-amber-700 flex-none mt-0.5" />
        <div>
          <span className="font-bold">How the Recycle Bin Works:</span> Items deleted across products, custom pages,
          news stories, exhibitions, and tenders are placed in the Recycle Bin with full JSON state preservation.
          Clicking <strong>Restore</strong> immediately brings the item back to its live published state without data
          loss. Clicking <strong>Permanently Delete</strong> removes the record from both the trash snapshot and the
          database.
        </div>
      </div>
    </div>
  );
}
