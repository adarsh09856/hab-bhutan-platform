'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';

interface EventItem {
  id: string;
  key: string;
  title: string;
  category: string;
  dateDisplay: string;
  location: string;
  venue?: string | null;
  craft?: string | null;
  organiser?: string | null;
  description: string;
  registration?: string | null;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM: Omit<EventItem, 'id'> = {
  key: '',
  title: '',
  category: 'Exhibition',
  dateDisplay: '',
  location: 'Thimphu',
  venue: '',
  craft: '',
  organiser: 'Handicrafts Association of Bhutan',
  description: '',
  registration: 'Open to the public',
  isActive: true,
  sortOrder: 0,
};

const CATEGORIES = ['Exhibition', 'Masterclass', 'Trade Expo', 'National Festival', 'Workshop'];

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [flashMsg, setFlashMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch {
      showFlash('error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
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

  const openEdit = (ev: EventItem) => {
    setForm({
      key: ev.key,
      title: ev.title,
      category: ev.category,
      dateDisplay: ev.dateDisplay,
      location: ev.location,
      venue: ev.venue || '',
      craft: ev.craft || '',
      organiser: ev.organiser || '',
      description: ev.description,
      registration: ev.registration || '',
      isActive: ev.isActive,
      sortOrder: ev.sortOrder,
    });
    setEditId(ev.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key.trim() || !form.title.trim() || !form.description.trim()) {
      showFlash('error', 'Key, title, and description are required.');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/events';
      const method = editId ? 'PUT' : 'POST';
      const payload = editId ? { id: editId, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFlash('success', editId ? 'Event updated successfully.' : 'Event created successfully.');
        setShowModal(false);
        loadEvents();
      } else {
        showFlash('error', data.error || 'Operation failed.');
      }
    } catch (err: any) {
      showFlash('error', err.message || 'Error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFlash('success', `Deleted "${title}".`);
        loadEvents();
      } else {
        const data = await res.json();
        showFlash('error', data.error || 'Failed to delete.');
      }
    } catch {
      showFlash('error', 'Network error during delete.');
    }
  };

  const filtered = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || ev.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold admin-title flex items-center gap-2">
            <Calendar className="w-6 h-6 text-crm-primary" />
            Events & Exhibitions CMS
          </h1>
          <p className="text-sm admin-muted mt-1">
            Manage public exhibitions, craft bazaars, masterclasses, and sector expos.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="admin-button-primary px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Flash Notice */}
      {flashMsg && (
        <div
          className={`p-4 rounded-lg text-sm border flex items-center gap-2 ${
            flashMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {flashMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {flashMsg.text}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-card p-4 rounded-xl border admin-border flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 admin-muted" />
          <input
            type="text"
            placeholder="Search events by title, location, key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold admin-muted uppercase">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="admin-card rounded-xl border admin-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center admin-muted">Loading events...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center admin-muted">No events found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b admin-border bg-black/20 text-xs font-semibold admin-muted uppercase tracking-wider">
                  <th className="px-5 py-3">Event Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Date / Timing</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Sort</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y admin-border text-sm">
                {filtered.map((ev) => (
                  <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 font-medium admin-title">
                      <div>{ev.title}</div>
                      <div className="text-xs admin-muted font-mono mt-0.5">key: {ev.key}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {ev.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 admin-text">{ev.dateDisplay || 'TBD'}</td>
                    <td className="px-5 py-4 admin-text">{ev.location}</td>
                    <td className="px-5 py-4 text-center">
                      {ev.isActive ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center admin-muted font-mono text-xs">{ev.sortOrder}</td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(ev)}
                        className="p-1.5 rounded hover:bg-white/10 text-amber-400 transition"
                        title="Edit event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id, ev.title)}
                        className="p-1.5 rounded hover:bg-white/10 text-rose-400 transition"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="admin-card w-full max-w-2xl rounded-2xl border admin-border p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b admin-border pb-4">
              <h2 className="text-lg font-bold admin-title">
                {editId ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="admin-muted hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Key / Slug *</label>
                  <input
                    type="text"
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    placeholder="craft-bazaar-2026"
                    disabled={!!editId}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">Event Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Zorig Chusum craft bazaar"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Date Display *</label>
                  <input
                    type="text"
                    value={form.dateDisplay}
                    onChange={(e) => setForm({ ...form, dateDisplay: e.target.value })}
                    placeholder="12–14 September 2026"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Location / Town *</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Clock Tower Square, Thimphu"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Craft Focus (optional)</label>
                  <input
                    type="text"
                    value={form.craft || ''}
                    onChange={(e) => setForm({ ...form, craft: e.target.value })}
                    placeholder="All 13 crafts, or thagzo, shingzo..."
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Organiser</label>
                  <input
                    type="text"
                    value={form.organiser || ''}
                    onChange={(e) => setForm({ ...form, organiser: e.target.value })}
                    placeholder="Handicrafts Association of Bhutan"
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">Description / Summary *</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Forty member enterprises exhibit across three days, with live demonstrations..."
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold admin-muted uppercase mb-1">Registration / Target Audience</label>
                <input
                  type="text"
                  value={form.registration || ''}
                  onChange={(e) => setForm({ ...form, registration: e.target.value })}
                  placeholder="Open to public · Free entry"
                  className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-xs font-semibold admin-muted uppercase mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg admin-input border admin-border focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm admin-title font-medium">
                    Active (visible on public events page)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t admin-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg admin-button-secondary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm rounded-lg admin-button-primary font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
