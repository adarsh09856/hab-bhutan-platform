'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Compass, Menu, LayoutTemplate } from 'lucide-react';

interface NavItem {
  id: string;
  menuType: string;
  column?: string | null;
  label: string;
  href: string;
  parent?: string | null;
  sortOrder: number;
  isActive: boolean;
  isExternal: boolean;
}

export default function AdminNavigationPage() {
  const [activeTab, setActiveTab] = useState<'HEADER' | 'FOOTER'>('HEADER');
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    menuType: 'HEADER',
    column: '',
    label: '',
    href: '',
    parent: '',
    sortOrder: 0,
    isActive: true,
    isExternal: false,
  });

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/navigation', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: err.error || 'Failed to load navigation items.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error fetching navigation.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const openAddModal = (menuType: 'HEADER' | 'FOOTER') => {
    setEditingItem(null);
    setForm({
      menuType,
      column: menuType === 'FOOTER' ? 'Organization' : '',
      label: '',
      href: '',
      parent: '',
      sortOrder: items.filter((i) => i.menuType === menuType).length + 1,
      isActive: true,
      isExternal: false,
    });
    setShowModal(true);
  };

  const openEditModal = (item: NavItem) => {
    setEditingItem(item);
    setForm({
      menuType: item.menuType,
      column: item.column || '',
      label: item.label,
      href: item.href,
      parent: item.parent || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      isExternal: item.isExternal,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const payload = editingItem ? { ...form, id: editingItem.id } : form;

      const res = await fetch('/api/admin/navigation', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: editingItem ? 'Navigation item updated successfully!' : 'New navigation item created successfully!',
        });
        setShowModal(false);
        loadItems();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Operation failed.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete "${label}"?`)) return;

    try {
      const res = await fetch(`/api/admin/navigation?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setFeedback({ type: 'success', message: `Deleted "${label}".` });
        loadItems();
      } else {
        const data = await res.json();
        setFeedback({ type: 'error', message: data.error || 'Failed to delete.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Network error.' });
    }
  };

  const headerItems = items.filter((i) => i.menuType === 'HEADER');
  const footerItems = items.filter((i) => i.menuType === 'FOOTER');

  // Group footer items by column
  const footerColumns = Array.from(new Set(footerItems.map((i) => i.column || 'General')));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-[#8B2E24] uppercase tracking-wider mb-1">
            Global Navigation CMS
          </div>
          <h1 className="font-marcellus text-2xl sm:text-3xl text-[#0F172A]">
            Header &amp; Footer Menu Builder
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Build, edit, and reorganize live navigation links in the public header and footer.
          </p>
        </div>

        <button
          onClick={() => openAddModal(activeTab)}
          className="inline-flex items-center gap-2 bg-[#8B2E24] hover:bg-[#A3382D] text-white px-4 py-2.5 rounded-[8px] text-xs sm:text-sm font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === 'HEADER' ? 'Header Link' : 'Footer Link'}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-[10px] text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-none" /> : <AlertCircle className="w-4 h-4 flex-none" />}
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] gap-4">
        <button
          onClick={() => setActiveTab('HEADER')}
          className={`pb-3 px-2 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'HEADER'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Menu className="w-4 h-4" />
          Header Navigation ({headerItems.length})
        </button>

        <button
          onClick={() => setActiveTab('FOOTER')}
          className={`pb-3 px-2 font-medium text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'FOOTER'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          Footer Navigation ({footerItems.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="bg-white p-12 rounded-[14px] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
          <div className="inline-block w-6 h-6 border-2 border-[#8B2E24] border-t-transparent rounded-full animate-spin mb-2"></div>
          <div>Loading navigation records...</div>
        </div>
      ) : activeTab === 'HEADER' ? (
        /* Header Tab Table */
        <div className="bg-white border border-[#E2E8F0] rounded-[14px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-mono uppercase text-[10.5px]">
                  <th className="p-4">Sort</th>
                  <th className="p-4">Label</th>
                  <th className="p-4">Target URL / Path</th>
                  <th className="p-4">Placement</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {headerItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#64748B]">
                      No header links configured. Click "+ Add Header Link" to create one.
                    </td>
                  </tr>
                ) : (
                  headerItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-4 font-mono font-semibold text-[#0F172A]">{item.sortOrder}</td>
                      <td className="p-4 font-bold text-[#0F172A]">{item.label}</td>
                      <td className="p-4 font-mono text-[#8B2E24]">{item.href}</td>
                      <td className="p-4">
                        {item.parent ? (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10.5px] font-medium">
                            Dropdown: {item.parent}
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10.5px] font-medium">
                            Top-Level
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                            item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-[#64748B] hover:text-[#0F172A] p-1 rounded hover:bg-[#F1F5F9]"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.label)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Footer Tab Table Grouped by Column */
        <div className="space-y-6">
          {footerColumns.length === 0 ? (
            <div className="bg-white p-8 rounded-[14px] border border-[#E2E8F0] text-center text-xs text-[#64748B]">
              No footer columns configured. Click "+ Add Footer Link" to create one.
            </div>
          ) : (
            footerColumns.map((colName) => {
              const colLinks = footerItems.filter((i) => (i.column || 'General') === colName);
              return (
                <div key={colName} className="bg-white border border-[#E2E8F0] rounded-[14px] overflow-hidden shadow-sm">
                  <div className="bg-[#F8FAFC] px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                    <span className="font-figtree font-bold text-sm text-[#0F172A]">
                      Column: {colName} ({colLinks.length} links)
                    </span>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setForm({
                          menuType: 'FOOTER',
                          column: colName,
                          label: '',
                          href: '',
                          parent: '',
                          sortOrder: colLinks.length + 1,
                          isActive: true,
                          isExternal: false,
                        });
                        setShowModal(true);
                      }}
                      className="text-xs text-[#8B2E24] font-semibold hover:underline"
                    >
                      + Add Link to {colName}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] text-[#64748B] font-mono text-[10px] uppercase">
                          <th className="p-3.5">Sort</th>
                          <th className="p-3.5">Link Label</th>
                          <th className="p-3.5">Destination URL</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {colLinks.map((item) => (
                          <tr key={item.id} className="hover:bg-[#F8FAFC]">
                            <td className="p-3.5 font-mono text-[#0F172A]">{item.sortOrder}</td>
                            <td className="p-3.5 font-semibold text-[#0F172A]">{item.label}</td>
                            <td className="p-3.5 font-mono text-[#8B2E24]">{item.href}</td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {item.isActive ? 'Active' : 'Hidden'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="text-[#64748B] hover:text-[#0F172A] p-1 rounded hover:bg-[#F1F5F9]"
                              >
                                <Edit2 className="w-3.5 h-3.5 inline" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item.label)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] max-w-lg w-full p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h2 className="font-marcellus text-xl text-[#0F172A]">
                {editingItem ? 'Edit Navigation Item' : `Add New ${form.menuType} Item`}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#64748B] hover:text-[#0F172A] font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Menu Type *</label>
                <select
                  value={form.menuType}
                  onChange={(e) => setForm({ ...form, menuType: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-[8px] border border-[#CBD5E1] bg-white text-xs sm:text-sm"
                >
                  <option value="HEADER">Header Navigation</option>
                  <option value="FOOTER">Footer Navigation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Navigation Label *</label>
                <input
                  type="text"
                  required
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Traditional Textiles"
                  className="w-full px-3.5 py-2 rounded-[8px] border border-[#CBD5E1] text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">Target URL / Path *</label>
                <input
                  type="text"
                  required
                  value={form.href}
                  onChange={(e) => setForm({ ...form, href: e.target.value })}
                  placeholder="e.g. /shop/thagzo or /about"
                  className="w-full px-3.5 py-2 rounded-[8px] border border-[#CBD5E1] font-mono text-xs sm:text-sm"
                />
              </div>

              {form.menuType === 'HEADER' ? (
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Dropdown Parent (Optional)</label>
                  <select
                    value={form.parent}
                    onChange={(e) => setForm({ ...form, parent: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-[8px] border border-[#CBD5E1] bg-white text-xs sm:text-sm"
                  >
                    <option value="">None (Top-Level Item)</option>
                    <option value="members">Members Dropdown Menu</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Footer Column Section *</label>
                  <input
                    type="text"
                    required
                    value={form.column}
                    onChange={(e) => setForm({ ...form, column: e.target.value })}
                    placeholder="e.g. Organization, Shop & support, Members, Governance"
                    className="w-full px-3.5 py-2 rounded-[8px] border border-[#CBD5E1] text-xs sm:text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-[8px] border border-[#CBD5E1] text-xs sm:text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#8B2E24] rounded"
                  />
                  <label htmlFor="isActive" className="font-medium text-[#0F172A]">
                    Active (Visible)
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-[8px] border border-[#CBD5E1] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#8B2E24] hover:bg-[#A3382D] text-white px-5 py-2 rounded-[8px] text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
