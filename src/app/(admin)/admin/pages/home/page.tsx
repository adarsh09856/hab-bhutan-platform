'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Layers, 
  Sliders, 
  Bell, 
  Info, 
  MapPin, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface HeroSlide {
  id: string;
  imageUrl: string;
  caption: string;
  altText: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function HomePageStudio() {
  const [activeTab, setActiveTab] = useState<'hero' | 'announcement' | 'mission' | 'punakha' | 'assurances' | 'partners'>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Hero slides state
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [slideFormOpen, setSlideFormOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideForm, setSlideForm] = useState({
    imageUrl: '',
    caption: '',
    altText: '',
    linkUrl: '',
    sortOrder: 0,
    isActive: true,
  });

  // Site Settings state
  const [settings, setSettings] = useState({
    // Announcement & Tagline
    announcementText: '',
    announcementLink: '',
    isAnnouncementOn: true,
    tagline: 'Authentic Bhutanese Crafts Direct from Artisans',
    
    // Mission & Intro
    heroParagraph: '',
    heroCtaPrimaryText: 'Explore Catalog',
    heroCtaPrimaryLink: '/shop',
    heroCtaSecondaryText: 'Our Mission & Mandate',
    heroCtaSecondaryLink: '/about',
    
    // 4 Key Statistics
    stat1Number: '2,500+',
    stat1Label: 'Artisans Empowered',
    stat2Number: '13',
    stat2Label: 'Traditional Arts (Zorig)',
    stat3Number: '20',
    stat3Label: 'Dzongkhags Reached',
    stat4Number: '100%',
    stat4Label: 'Origin Authenticated',

    // Punakha Market Spotlight
    punakhaMarketNotice: '',

    // Assurances Band
    assurance1Title: 'Direct Artisan Support',
    assurance1Text: '100% of proceeds go directly to rural weavers, carvers, and cooperatives across Bhutan.',
    assurance2Title: 'Seal of Authenticity',
    assurance2Text: 'Verified authentic handicraft made strictly using traditional Bhutanese materials and techniques.',
    assurance3Title: 'Fair Pricing Guarantee',
    assurance3Text: 'Prices established in consultation with artisan communities to ensure fair living wages.',
    assurance4Title: 'Worldwide Insured Shipping',
    assurance4Text: 'Safe international dispatch with tracking from Thimphu to your doorstep globally.',

    // Membership Callouts
    membershipLeftTitle: 'For Master Artisans & Guilds',
    membershipLeftText: 'Join the national handicraft association for market access, raw material grants, and master awards.',
    membershipLeftCtaText: 'Artisan Membership',
    membershipLeftCtaLink: '/members',
    membershipRightTitle: 'For Institutional & Trade Buyers',
    membershipRightText: 'Wholesale sourcing, institutional gifts, and custom architectural commissions directly with certified clusters.',

    // Partners
    partnersList: 'RGoB (Royal Government of Bhutan), EU SWITCH-Asia, SHINE Project, G1AT, UNDP Bhutan, GEF Small Grants Programme',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch hero slides
      const resSlides = await fetch('/api/admin/hero-slides', { cache: 'no-store' });
      if (resSlides.ok) {
        const d = await resSlides.json();
        setSlides(d.slides || []);
      }

      // Fetch site settings
      const resSettings = await fetch('/api/admin/site-settings', { cache: 'no-store' });
      if (resSettings.ok) {
        const d = await resSettings.json();
        if (d.setting) {
          setSettings((prev) => ({
            ...prev,
            ...d.setting,
          }));
        }
      }
    } catch (e: any) {
      showToast('error', 'Failed to load homepage settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Site Settings
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const d = await res.json();
      if (res.ok) {
        showToast('success', 'Homepage content updated successfully!');
      } else {
        showToast('error', d.error || 'Failed to save homepage settings.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  // Hero Slide Form Actions
  const openNewSlide = () => {
    setEditingSlideId(null);
    setSlideForm({
      imageUrl: '',
      caption: '',
      altText: '',
      linkUrl: '',
      sortOrder: slides.length + 1,
      isActive: true,
    });
    setSlideFormOpen(true);
  };

  const openEditSlide = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setSlideForm({
      imageUrl: slide.imageUrl,
      caption: slide.caption,
      altText: slide.altText || '',
      linkUrl: slide.linkUrl || '',
      sortOrder: slide.sortOrder,
      isActive: slide.isActive,
    });
    setSlideFormOpen(true);
  };

  const handleSaveSlide = async () => {
    if (!slideForm.imageUrl.trim() || !slideForm.caption.trim()) {
      showToast('error', 'Please upload a photo and provide a slide caption.');
      return;
    }

    setSaving(true);
    const url = editingSlideId ? `/api/admin/hero-slides/${editingSlideId}` : '/api/admin/hero-slides';
    const method = editingSlideId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...slideForm,
          altText: slideForm.altText.trim() || slideForm.caption.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', editingSlideId ? 'Hero slide updated!' : 'New hero slide created!');
        setSlideFormOpen(false);
        setEditingSlideId(null);
        // Reload slides
        const resSlides = await fetch('/api/admin/hero-slides', { cache: 'no-store' });
        if (resSlides.ok) {
          const d = await resSlides.json();
          setSlides(d.slides || []);
        }
      } else {
        showToast('error', data.error || 'Failed to save slide.');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Error saving hero slide.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlide = async (id: string, caption: string) => {
    if (!confirm(`Are you sure you want to delete slide "${caption}"?`)) return;
    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Slide deleted successfully.');
        setSlides(slides.filter((s) => s.id !== id));
      } else {
        showToast('error', 'Failed to delete slide.');
      }
    } catch (e: any) {
      showToast('error', 'Error deleting slide.');
    }
  };

  const handleToggleSlide = async (slide: HeroSlide) => {
    try {
      const res = await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });
      if (res.ok) {
        setSlides(slides.map((s) => (s.id === slide.id ? { ...s, isActive: !s.isActive } : s)));
        showToast('success', `Slide ${slide.isActive ? 'hidden' : 'activated'}!`);
      }
    } catch (e) {
      showToast('error', 'Failed to update slide status.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading Homepage Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border text-sm animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Home className="w-4 h-4" />
            <span>WordPress-Style Page Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Homepage Studio (A–Z All Sections)
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Complete control of the Bhutan Handicraft Association homepage. Edit the hero slider, mission, impact numbers, Punakha Crafts Market details, assurances, and partner logos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
          >
            <span>View Public Homepage</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>

      {/* WordPress-Style Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'hero'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Hero Slider (Full CRUD)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-mono">
            {slides.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcement')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'announcement'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>2. Top Announcement Bar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mission')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'mission'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>3. Mission & Key Statistics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('punakha')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'punakha'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>4. Punakha Market Spotlight</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assurances')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'assurances'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>5. Assurances & Banners</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('partners')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'partners'
              ? 'border-[#8B2E24] text-[#8B2E24]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>6. Partners (Image 1)</span>
        </button>
      </div>

      {/* TAB 1: HERO SLIDER CRUD */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Homepage Hero Slides</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full CRUD control of the top visual slider. Drag & drop real photos from your computer, set captions, and reorder.
              </p>
            </div>
            <button
              type="button"
              onClick={openNewSlide}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Hero Slide</span>
            </button>
          </div>

          {/* Modal / Form for Slide */}
          {slideFormOpen && (
            <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingSlideId ? 'Edit Hero Slide' : 'Create New Hero Slide'}
                </h3>
                <button
                  type="button"
                  onClick={() => setSlideFormOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FileUploadInput
                    label="Slide Photograph *"
                    value={slideForm.imageUrl}
                    onChange={(url) => setSlideForm((f) => ({ ...f, imageUrl: url }))}
                    accept="image/*"
                    hint="Upload a photograph from your device. Recommended resolution: 1920x800px."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Slide Caption *
                  </label>
                  <input
                    type="text"
                    value={slideForm.caption}
                    onChange={(e) => setSlideForm((f) => ({ ...f, caption: e.target.value }))}
                    placeholder="e.g. Master artisan at the loom · Khoma, Lhuentse"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Image Description (Accessibility)
                  </label>
                  <input
                    type="text"
                    value={slideForm.altText}
                    onChange={(e) => setSlideForm((f) => ({ ...f, altText: e.target.value }))}
                    placeholder="Short description for screen readers"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Button Destination Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={slideForm.linkUrl}
                    onChange={(e) => setSlideForm((f) => ({ ...f, linkUrl: e.target.value }))}
                    placeholder="e.g. /shop or /about"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={slideForm.sortOrder}
                    onChange={(e) => setSlideForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <input
                    type="checkbox"
                    id="slideActiveToggle"
                    checked={slideForm.isActive}
                    onChange={(e) => setSlideForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-[#8B2E24] rounded-sm"
                  />
                  <label htmlFor="slideActiveToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Active (Show on homepage slider)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSlideFormOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSlide}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingSlideId ? 'Save Slide Updates' : 'Publish New Slide'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Slides Grid / Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {slides.map((s) => (
              <div
                key={s.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs flex flex-col justify-between transition-all ${
                  s.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="relative aspect-16/9 bg-slate-100">
                    <img
                      src={s.imageUrl}
                      alt={s.caption}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/photos/hero-1-yathra.jpg';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Hidden'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white font-mono">
                        #{s.sortOrder}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{s.caption}</h4>
                    {s.linkUrl && (
                      <p className="text-xs text-amber-700 font-mono line-clamp-1">
                        Target Link: {s.linkUrl}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSlide(s)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                  >
                    {s.isActive ? 'Hide' : 'Activate'}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditSlide(s)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#8B2E24] hover:bg-slate-100 transition-colors"
                      title="Edit slide"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(s.id, s.caption)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENT BAR & TAGLINE */}
      {activeTab === 'announcement' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Header Announcement Bar & Tagline</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The announcement bar appears at the very top of all public pages. Updates automatically sync across the entire website.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3 p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
              <input
                type="checkbox"
                id="isAnnouncementOn"
                checked={settings.isAnnouncementOn}
                onChange={(e) => setSettings((s) => ({ ...s, isAnnouncementOn: e.target.checked }))}
                className="w-4 h-4 accent-[#8B2E24] rounded-sm"
              />
              <label htmlFor="isAnnouncementOn" className="text-xs font-bold text-slate-800 cursor-pointer">
                Display Announcement Bar at top of public website
              </label>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Announcement Message Text
              </label>
              <input
                type="text"
                value={settings.announcementText}
                onChange={(e) => setSettings((s) => ({ ...s, announcementText: e.target.value }))}
                placeholder="e.g. Celebrating Bhutanese Master Craftspeople - National Exhibition Open at Paro"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Announcement Destination Link (Optional)
              </label>
              <input
                type="text"
                value={settings.announcementLink}
                onChange={(e) => setSettings((s) => ({ ...s, announcementLink: e.target.value }))}
                placeholder="e.g. /events or /shop"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
              />
            </div>

            <div className="space-y-1 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Homepage Hero Eyebrow / Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))}
                placeholder="Authentic Bhutanese Crafts Direct from Artisans"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
              />
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Announcement Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MISSION & KEY STATS */}
      {activeTab === 'mission' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Homepage Mission & Impact Statistics</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The primary narrative introducing the Handicrafts Association of Bhutan and its four live impact metrics.
            </p>
          </div>

          <div className="space-y-5 max-w-4xl">
            <div className="space-y-1">
              <RichTextEditor
                label="Mission & Introductory Lead Narrative"
                value={settings.heroParagraph}
                onChange={(html) => setSettings((s) => ({ ...s, heroParagraph: html }))}
                hint="Introductory narrative displayed prominently on the homepage."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Main Action Button Label
                </label>
                <input
                  type="text"
                  value={settings.heroCtaPrimaryText}
                  onChange={(e) => setSettings((s) => ({ ...s, heroCtaPrimaryText: e.target.value }))}
                  placeholder="Explore Catalog"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Main Action Destination Link
                </label>
                <input
                  type="text"
                  value={settings.heroCtaPrimaryLink}
                  onChange={(e) => setSettings((s) => ({ ...s, heroCtaPrimaryLink: e.target.value }))}
                  placeholder="/shop"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Secondary Action Button Label
                </label>
                <input
                  type="text"
                  value={settings.heroCtaSecondaryText}
                  onChange={(e) => setSettings((s) => ({ ...s, heroCtaSecondaryText: e.target.value }))}
                  placeholder="Our Mission & Mandate"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Secondary Action Destination Link
                </label>
                <input
                  type="text"
                  value={settings.heroCtaSecondaryLink}
                  onChange={(e) => setSettings((s) => ({ ...s, heroCtaSecondaryLink: e.target.value }))}
                  placeholder="/about"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
                />
              </div>
            </div>

            {/* 4 Impact Statistics */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">4 Impact Statistics Counters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Stat 1</label>
                  <input
                    type="text"
                    value={settings.stat1Number}
                    onChange={(e) => setSettings((s) => ({ ...s, stat1Number: e.target.value }))}
                    placeholder="2,500+"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                  />
                  <input
                    type="text"
                    value={settings.stat1Label}
                    onChange={(e) => setSettings((s) => ({ ...s, stat1Label: e.target.value }))}
                    placeholder="Artisans Empowered"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Stat 2</label>
                  <input
                    type="text"
                    value={settings.stat2Number}
                    onChange={(e) => setSettings((s) => ({ ...s, stat2Number: e.target.value }))}
                    placeholder="13"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                  />
                  <input
                    type="text"
                    value={settings.stat2Label}
                    onChange={(e) => setSettings((s) => ({ ...s, stat2Label: e.target.value }))}
                    placeholder="Traditional Arts"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Stat 3</label>
                  <input
                    type="text"
                    value={settings.stat3Number}
                    onChange={(e) => setSettings((s) => ({ ...s, stat3Number: e.target.value }))}
                    placeholder="20"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                  />
                  <input
                    type="text"
                    value={settings.stat3Label}
                    onChange={(e) => setSettings((s) => ({ ...s, stat3Label: e.target.value }))}
                    placeholder="Dzongkhags Reached"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Stat 4</label>
                  <input
                    type="text"
                    value={settings.stat4Number}
                    onChange={(e) => setSettings((s) => ({ ...s, stat4Number: e.target.value }))}
                    placeholder="100%"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                  />
                  <input
                    type="text"
                    value={settings.stat4Label}
                    onChange={(e) => setSettings((s) => ({ ...s, stat4Label: e.target.value }))}
                    placeholder="Origin Authenticated"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Mission & Statistics</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PUNAKHA MARKET SPOTLIGHT */}
      {activeTab === 'punakha' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Punakha Crafts Market Spotlight (Image 2)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The flagship physical crafts market managed by HAB beside the Mo Chhu river.
              </p>
            </div>
            <Link
              href="/admin/clusters-outlets"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <span>Manage Other Physical Outlets →</span>
            </Link>
          </div>

          <div className="space-y-4 max-w-4xl">
            <div className="space-y-1">
              <RichTextEditor
                label="Punakha Market Narrative & Special Notice"
                value={settings.punakhaMarketNotice}
                onChange={(html) => setSettings((s) => ({ ...s, punakhaMarketNotice: html }))}
                hint="Highlighted story or seasonal hours notice shown in the Punakha Crafts Market feature card."
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">4-Cell Market Details Reference</h4>
              <p className="text-xs text-slate-500">
                Hours: <strong>Daily, 09:00 – 18:00</strong> · Stalls: <strong>32 member artisans</strong> · Crafts: <strong>Weaving, bamboo, wood turning, paper</strong> · Payment: <strong>Cash, mBoB, cards</strong>
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Market Spotlight</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ASSURANCES & BANNERS */}
      {activeTab === 'assurances' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">4 Assurances & Membership Banners</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The four credibility badges shown above the footer and the dual artisan/institutional membership callout banners.
            </p>
          </div>

          <div className="space-y-5 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Assurance 1</label>
                <input
                  type="text"
                  value={settings.assurance1Title}
                  onChange={(e) => setSettings((s) => ({ ...s, assurance1Title: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                />
                <textarea
                  rows={2}
                  value={settings.assurance1Text}
                  onChange={(e) => setSettings((s) => ({ ...s, assurance1Text: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Assurance 2</label>
                <input
                  type="text"
                  value={settings.assurance2Title}
                  onChange={(e) => setSettings((s) => ({ ...s, assurance2Title: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                />
                <textarea
                  rows={2}
                  value={settings.assurance2Text}
                  onChange={(e) => setSettings((s) => ({ ...s, assurance2Text: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Assurance 3</label>
                <input
                  type="text"
                  value={settings.assurance3Title}
                  onChange={(e) => setSettings((s) => ({ ...s, assurance3Title: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                />
                <textarea
                  rows={2}
                  value={settings.assurance3Text}
                  onChange={(e) => setSettings((s) => ({ ...s, assurance3Text: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Assurance 4</label>
                <input
                  type="text"
                  value={settings.assurance4Title}
                  onChange={(e) => setSettings((s) => ({ ...s, assurance4Title: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
                />
                <textarea
                  rows={2}
                  value={settings.assurance4Text}
                  onChange={(e) => setSettings((s) => ({ ...s, assurance4Text: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Assurances</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PARTNERS (IMAGE 1) */}
      {activeTab === 'partners' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Development Partners (Image 1 Fix)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The six development partners displayed in the dedicated section matching user reference Image 1.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Partners List (Comma Separated)
              </label>
              <textarea
                rows={3}
                value={settings.partnersList}
                onChange={(e) => setSettings((s) => ({ ...s, partnersList: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24]"
              />
              <p className="text-xs text-slate-400">
                Standard 6 Partners from Image 1: RGoB, EU SWITCH-Asia, SHINE, G1AT, UNDP, SGP.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Partners</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Footer */}
      <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Need to manage related content?</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quickly jump to dedicated page studios for outlets, training programmes, publications, or products.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/clusters-outlets"
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#8B2E24] text-xs font-semibold shadow-2xs"
          >
            Outlets & Clusters →
          </Link>
          <Link
            href="/admin/programmes"
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#8B2E24] text-xs font-semibold shadow-2xs"
          >
            Programmes A–K →
          </Link>
          <Link
            href="/admin/publications"
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#8B2E24] text-xs font-semibold shadow-2xs"
          >
            Publications →
          </Link>
          <Link
            href="/admin/products"
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#8B2E24] text-xs font-semibold shadow-2xs"
          >
            Products →
          </Link>
        </div>
      </div>
    </div>
  );
}
