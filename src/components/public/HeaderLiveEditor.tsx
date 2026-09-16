'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Edit3,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Menu,
  Megaphone,
  Tag,
  ExternalLink,
  Eye,
  Link2,
} from 'lucide-react';
import Link from 'next/link';

interface NavItemState {
  id?: string;
  label: string;
  href: string;
  sortOrder: number;
  isActive: boolean;
  isNew?: boolean;
}

interface HeaderLiveEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (navItems: { label: string; href: string }[], settings: any) => void;
}

export default function HeaderLiveEditor({ isOpen, onClose, onSaved }: HeaderLiveEditorProps) {
  const [activeTab, setActiveTab] = useState<'NAVIGATION' | 'ANNOUNCEMENT' | 'BRAND'>('NAVIGATION');

  // Navigation State
  const [navItems, setNavItems] = useState<NavItemState[]>([]);
  const [deletedNavIds, setDeletedNavIds] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newHref, setNewHref] = useState('');

  // Announcement State
  const [announcementText, setAnnouncementText] = useState('Registered CSO · CSO Act of Bhutan 2007');
  const [announcementLink, setAnnouncementLink] = useState('/about');
  const [isAnnouncementOn, setIsAnnouncementOn] = useState(true);
  const [tagline, setTagline] = useState('Towards a vibrant & sustainable handicrafts sector');

  // Form Status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load initial data
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    setSessionExpired(false);

    Promise.all([
      // 1. Navigation items
      fetch('/api/navigation', { cache: 'no-store' })
        .then((r) => r.json())
        .catch(() => ({})),
      // 2. Site settings
      fetch('/api/site-settings', { cache: 'no-store' })
        .then((r) => r.json())
        .catch(() => ({})),
    ])
      .then(([navData, settingsData]) => {
        if (!isMounted) return;

        // Populate Navigation
        if (navData?.header && Array.isArray(navData.header) && navData.header.length > 0) {
          const mainLinks = navData.header
            .filter((i: any) => !i.parent && i.href !== '/donate')
            .map((i: any, idx: number) => ({
              id: i.id,
              label: i.label,
              href: i.href,
              sortOrder: i.sortOrder ?? idx + 1,
              isActive: i.isActive !== false,
            }));

          const hasHome = mainLinks.some((i: any) => i.href === '/');
          const finalNav = hasHome
            ? mainLinks
            : [{ label: 'Home', href: '/', sortOrder: 0, isActive: true }, ...mainLinks];

          setNavItems(finalNav);
        } else {
          setNavItems([
            { label: 'Home', href: '/', sortOrder: 1, isActive: true },
            { label: 'About Us', href: '/about', sortOrder: 2, isActive: true },
            { label: 'Programmes', href: '/programmes', sortOrder: 3, isActive: true },
            { label: 'Projects', href: '/projects', sortOrder: 4, isActive: true },
            { label: 'News & Events', href: '/news', sortOrder: 5, isActive: true },
          ]);
        }

        // Populate Settings
        const s = settingsData?.setting || settingsData?.settings;
        if (s) {
          if (s.announcementText) setAnnouncementText(s.announcementText);
          if (s.announcementLink !== undefined) setAnnouncementLink(s.announcementLink || '');
          if (s.isAnnouncementOn !== undefined) setIsAnnouncementOn(Boolean(s.isAnnouncementOn));
          if (s.tagline) setTagline(s.tagline);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Add a new link
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newHref.trim()) return;

    const newItem: NavItemState = {
      id: `new-${Date.now()}`,
      label: newLabel.trim(),
      href: newHref.trim(),
      sortOrder: navItems.length + 1,
      isActive: true,
      isNew: true,
    };

    setNavItems((prev) => [...prev, newItem]);
    setNewLabel('');
    setNewHref('');
  };

  // Reorder items
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= navItems.length) return;

    const copy = [...navItems];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    // Update sort orders
    const updated = copy.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setNavItems(updated);
  };

  // Update item field
  const updateItemField = (index: number, field: keyof NavItemState, value: any) => {
    setNavItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    const item = navItems[index];
    if (item.id && !item.isNew) {
      setDeletedNavIds((prev) => [...prev, item.id!]);
    }
    setNavItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Save All
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    setSessionExpired(false);

    try {
      // 1. Save Announcement & Tagline to SiteSettings
      const settingsPayload = {
        announcementText: announcementText.trim(),
        announcementLink: announcementLink.trim() || null,
        isAnnouncementOn,
        tagline: tagline.trim(),
      };

      const settingsRes = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settingsPayload),
      });

      if (settingsRes.status === 401) {
        setSessionExpired(true);
        throw new Error('Your admin session has expired. Please log in again.');
      }

      // 2. Save Navigation Items
      // A. Delete removed items
      for (const delId of deletedNavIds) {
        if (!delId.startsWith('new-') && !delId.startsWith('h-')) {
          await fetch(`/api/admin/navigation?id=${encodeURIComponent(delId)}`, {
            method: 'DELETE',
            credentials: 'include',
          }).catch(() => {});
        }
      }

      // B. Save updated or new items
      for (let idx = 0; idx < navItems.length; idx++) {
        const item = navItems[idx];
        const isDbItem = item.id && !item.isNew && !item.id.startsWith('h-') && !item.id.startsWith('new-');

        if (isDbItem) {
          await fetch('/api/admin/navigation', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              id: item.id,
              menuType: 'HEADER',
              label: item.label,
              href: item.href,
              sortOrder: idx + 1,
              isActive: item.isActive,
            }),
          }).catch(() => {});
        } else {
          await fetch('/api/admin/navigation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              menuType: 'HEADER',
              label: item.label,
              href: item.href,
              sortOrder: idx + 1,
              isActive: item.isActive,
            }),
          }).catch(() => {});
        }
      }

      setSuccess(true);

      // Notify other live components immediately via custom event
      const cleanNav = navItems.filter((i) => i.isActive).map((i) => ({ label: i.label, href: i.href }));
      window.dispatchEvent(
        new CustomEvent('hab:header-updated', {
          detail: {
            announcementText,
            announcementLink,
            isAnnouncementOn,
            navItems: cleanNav,
          },
        })
      );

      if (onSaved) {
        onSaved(cleanNav, settingsPayload);
      }

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Failed to save header configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl my-auto flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B2E24] text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Live Header & Navigation Editor
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
                  2-Way Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Edit public header links, reorder menus, and update the announcement banner in real-time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('NAVIGATION')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'NAVIGATION'
                ? 'border-[#8B2E24] text-[#8B2E24]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Navigation Links ({navItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ANNOUNCEMENT')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ANNOUNCEMENT'
                ? 'border-[#8B2E24] text-[#8B2E24]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Top Announcement Banner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BRAND')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'BRAND'
                ? 'border-[#8B2E24] text-[#8B2E24]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Tagline & Links</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
            {/* Feedback Alerts */}
            {sessionExpired && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Your admin session has expired. Please re-authenticate to save changes.</span>
                </div>
                <Link
                  href="/admin/login"
                  target="_blank"
                  className="px-3 py-1 rounded-lg bg-[#8B2E24] text-white font-bold hover:bg-[#73241c] transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                >
                  <span>Log in</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}

            {error && !sessionExpired && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">
                  Header and announcement successfully updated! Synchronizing live components...
                </span>
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#8B2E24] mb-2" />
                <span className="text-xs">Loading live header records from database...</span>
              </div>
            ) : (
              <>
                {/* TAB 1: NAVIGATION LINKS */}
                {activeTab === 'NAVIGATION' && (
                  <div className="space-y-4">
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                      <span className="font-bold text-amber-800">Tip:</span>
                      <span>
                        Use the arrow buttons to reorder links. Changes to labels and target URLs take effect immediately across all desktop and mobile navigation menus.
                      </span>
                    </div>

                    {/* Nav Items List */}
                    <div className="space-y-2">
                      {navItems.map((item, idx) => (
                        <div
                          key={item.id || `item-${idx}`}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                            item.isActive
                              ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          {/* Reorder Buttons */}
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => moveItem(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(idx, 'down')}
                              disabled={idx === navItems.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="w-6 text-center text-xs font-mono font-bold text-slate-400 flex-shrink-0">
                            #{idx + 1}
                          </div>

                          {/* Label input */}
                          <div className="flex-1 min-w-[120px]">
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => updateItemField(idx, 'label', e.target.value)}
                              placeholder="Menu Label"
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                            />
                          </div>

                          {/* URL input */}
                          <div className="flex-1 min-w-[140px]">
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                <Link2 className="w-3 h-3" />
                              </span>
                              <input
                                type="text"
                                value={item.href}
                                onChange={(e) => updateItemField(idx, 'href', e.target.value)}
                                placeholder="/path or https://..."
                                className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:bg-white focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                              />
                            </div>
                          </div>

                          {/* Active Toggle */}
                          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none px-2 flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={item.isActive}
                              onChange={(e) => updateItemField(idx, 'isActive', e.target.checked)}
                              className="rounded border-slate-300 text-[#8B2E24] focus:ring-[#8B2E24] w-3.5 h-3.5"
                            />
                            <span className="hidden sm:inline">Active</span>
                          </label>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0 cursor-pointer"
                            title="Remove link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Link Form */}
                    <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 space-y-2">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-[#8B2E24]" />
                        <span>Add New Navigation Item</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          placeholder="e.g. Master Artisans"
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                        />
                        <input
                          type="text"
                          value={newHref}
                          onChange={(e) => setNewHref(e.target.value)}
                          placeholder="e.g. /masters"
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-hidden focus:border-[#8B2E24]"
                        />
                        <button
                          type="button"
                          onClick={handleAddLink}
                          disabled={!newLabel.trim() || !newHref.trim()}
                          className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ANNOUNCEMENT BAR */}
                {activeTab === 'ANNOUNCEMENT' && (
                  <div className="space-y-4">
                    {/* Live Preview Box */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                        <span>Real-Time Public Header Preview</span>
                      </label>
                      <div className="p-2.5 rounded-xl bg-[#2D2A26] text-white text-xs border border-slate-700 flex items-center justify-between overflow-hidden">
                        <div className="flex items-center gap-2 overflow-hidden truncate">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                          {announcementLink ? (
                            <span className="text-[#DFD7C7] hover:text-white underline truncate">
                              {announcementText || '(No announcement text)'}
                            </span>
                          ) : (
                            <span className="text-[#DFD7C7] truncate">
                              {announcementText || '(No announcement text)'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-amber-300/80 font-mono flex-shrink-0 ml-2">
                          {isAnnouncementOn ? 'STATUS: VISIBLE' : 'STATUS: HIDDEN'}
                        </div>
                      </div>
                    </div>

                    {/* Announcement Enable Switch */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Show Announcement Bar</div>
                        <div className="text-[11px] text-slate-500">
                          When enabled, this bar displays at the very top of every public page.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        id="announcementToggle"
                        checked={isAnnouncementOn}
                        onChange={(e) => setIsAnnouncementOn(e.target.checked)}
                        className="w-4 h-4 rounded text-[#8B2E24] focus:ring-[#8B2E24] cursor-pointer"
                      />
                    </div>

                    {/* Announcement Text Input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Announcement Text
                      </label>
                      <input
                        type="text"
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        placeholder="e.g. CSO/2011/043 · Handicrafts Association of Bhutan"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                      />
                      <p className="text-[11px] text-slate-500">
                        Displayed prominently at the top of the browser window.
                      </p>
                    </div>

                    {/* Announcement Link Input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Target Link / Action (Optional)
                      </label>
                      <input
                        type="text"
                        value={announcementLink}
                        onChange={(e) => setAnnouncementLink(e.target.value)}
                        placeholder="e.g. /about or /news/press-release"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 font-mono focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                      />
                      <p className="text-[11px] text-slate-500">
                        Users who click the announcement bar will be navigated to this internal or external URL.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: BRAND & TAGLINE */}
                {activeTab === 'BRAND' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Organization Tagline
                      </label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="Towards a vibrant & sustainable handicrafts sector"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
                      />
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2 text-slate-600">
                      <div className="font-bold text-slate-900">Advanced Navigation & Site Controls</div>
                      <p className="text-[11px] leading-relaxed">
                        Need to configure dropdown sub-menus, footer columns, payment gateways, or official seal images? Open the full Admin Console navigation and settings manager:
                      </p>
                      <div className="flex gap-2 pt-1">
                        <Link
                          href="/admin/navigation"
                          className="px-3 py-1.5 rounded-lg bg-[#8B2E24] text-white font-bold text-xs hover:bg-[#73241c] transition-colors inline-flex items-center gap-1"
                        >
                          <span>Open Menu Builder</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <Link
                          href="/admin/site-settings?tab=ANNOUNCEMENT"
                          className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 font-semibold text-xs hover:bg-slate-300 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Site Settings</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <Link
              href="/admin/navigation"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <span>Manage in Admin Studio</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving live changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}