'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Image as ImageIcon, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  Edit3, 
  Save, 
  ExternalLink,
  Layers,
  Sparkles,
  UploadCloud,
  Eye
} from 'lucide-react';
import { 
  GlassCard, 
  GlassStatWidget, 
  GlassBadge, 
  GlassButton, 
  GlassDrawer, 
  GlassInput 
} from '@/components/admin/GlassUI';

export default function AdminMediaPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Drawer
  const [editingSlot, setEditingSlot] = useState<any | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSlots(data.slots || []);
        }
      }
    } catch (err) {
      console.error('Failed to load media slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(slots.map((s) => s.category)))];

  const filteredSlots = slots.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQ = !q || s.label.toLowerCase().includes(q) || s.key.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchesQ && matchesCat;
  });

  const handleOpenEdit = (slot: any) => {
    setEditingSlot(slot);
    setEditUrl(slot.url || '');
    setEditCaption('');
  };

  const handleSaveSlot = async () => {
    if (!editingSlot || !editUrl.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: editingSlot.key,
          url: editUrl.trim(),
          caption: editCaption.trim(),
        }),
      });

      if (res.ok) {
        showToast(`Media slot ${editingSlot.key} updated`);
        setEditingSlot(null);
        loadMedia();
      } else {
        showToast('Error saving media slot');
      }
    } catch {
      showToast('Network error saving media slot');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-medium px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-amber-400" />
              Media &amp; Image Assets Manager
            </h1>
            <GlassBadge variant="amber">Live Imagery</GlassBadge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Browse, inspect, and replace imagery across hero slides, the 13 craft heritage banners, outlets, and publications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton variant="secondary" onClick={loadMedia} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </GlassButton>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStatWidget
          title="Total Configured Slots"
          value={slots.length}
          subtitle="Across public layout"
          icon={Layers}
          glow="amber"
        />
        <GlassStatWidget
          title="13 Crafts Banners"
          value="13"
          subtitle="Traditional Arts of Bhutan"
          icon={Sparkles}
          glow="emerald"
        />
        <GlassStatWidget
          title="Hero Carousel"
          value="3 slides"
          subtitle="Homepage feature banner"
          icon={ImageIcon}
          glow="indigo"
        />
        <GlassStatWidget
          title="Outlets &amp; Markets"
          value="Punakha + Hub"
          subtitle="Craft marketplaces"
          icon={ExternalLink}
          glow="rose"
        />
      </div>

      {/* Search & Category Filter */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search image slots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </GlassCard>

      {/* Media Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSlots.map((slot) => (
          <GlassCard key={slot.key} className="overflow-hidden flex flex-col justify-between" glow="amber">
            <div>
              {/* Image Preview Box */}
              <div className="relative w-full h-44 bg-slate-950 border-b border-white/10 overflow-hidden group">
                <img
                  src={slot.url}
                  alt={slot.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e: any) => {
                    e.currentTarget.src = '/assets/photos/product-hhb01.jpg';
                  }}
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
                    {slot.category}
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 backdrop-blur-md text-amber-300 border border-white/10">
                    {slot.aspect}
                  </span>
                </div>
              </div>

              {/* Slot Details */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    {slot.key}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-sm leading-tight mb-1.5">{slot.label}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{slot.description}</p>
                <div className="mt-3 p-2 bg-slate-950/60 rounded-lg border border-white/5 font-mono text-[11px] text-slate-400 truncate">
                  {slot.url}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between mt-2">
              <a
                href={slot.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View Full
              </a>
              <GlassButton size="sm" variant="secondary" onClick={() => handleOpenEdit(slot)}>
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Replace Image
              </GlassButton>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* DRAWER: EDIT MEDIA SLOT */}
      <GlassDrawer
        isOpen={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        title={`Replace Media: ${editingSlot?.label}`}
        subtitle={editingSlot?.key}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200">
            Enter a relative URL (e.g. <span className="font-mono">/assets/photos/...</span>) or external CDN link to immediately update this image asset.
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Image URL / Path</label>
            <input
              type="text"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Live Image Preview</label>
            <div className="w-full h-48 bg-slate-950 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center relative">
              {editUrl ? (
                <img
                  src={editUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-slate-500 italic">No image URL specified</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Accessibility Caption (Alt Text)</label>
            <input
              type="text"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              placeholder="e.g. Artisan weaving traditional silk kira on pedal loom"
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-2">
            <GlassButton variant="ghost" onClick={() => setEditingSlot(null)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" onClick={handleSaveSlot} disabled={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Saving...' : 'Update Image Slot'}
            </GlassButton>
          </div>
        </div>
      </GlassDrawer>
    </div>
  );
}
