'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Edit3,
  ExternalLink,
  Sliders,
  Image as ImageIcon,
  Type,
  Link2,
  Plus,
  Trash2,
  BarChart2,
  ShieldCheck,
  Users,
  Sparkles,
} from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';

export type SectionType =
  | 'hero'
  | 'stats'
  | 'buy'
  | 'about'
  | 'assurances'
  | 'membership'
  | 'about-page'
  | 'donate'
  | 'contact'
  | 'policies'
  | 'punakha';

interface UniversalLiveSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: SectionType;
  sectionTitle?: string;
  studioHref?: string;
  onSaved?: (updatedSettings: any) => void;
}

export default function UniversalLiveSectionEditor({
  isOpen,
  onClose,
  sectionType,
  sectionTitle,
  studioHref,
  onSaved,
}: UniversalLiveSectionEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Active tab within the section editor (e.g. Content, Actions, Media/Stats)
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'ACTIONS' | 'MEDIA' | 'STATS'>('CONTENT');

  // Form Fields State (covers SiteSettings fields)
  const [form, setForm] = useState<Record<string, any>>({});

  // Hero Slides (if hero section)
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load initial settings and data
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    setSuccess(false);
    setSessionExpired(false);
    setActiveTab('CONTENT');

    const fetches: Promise<any>[] = [
      fetch('/api/site-settings', { cache: 'no-store' })
        .then((r) => r.json())
        .catch(() => ({})),
    ];

    if (sectionType === 'hero') {
      fetches.push(
        fetch('/api/admin/hero-slides', { cache: 'no-store' })
          .then((r) => r.json())
          .catch(() => ({}))
      );
    }

    Promise.all(fetches).then(([settingsData, heroData]) => {
      if (!isMounted) return;
      const s = settingsData?.setting || settingsData?.settings || {};

      setForm({
        // Hero fields
        heroEyebrow: s.heroEyebrow || 'Crafted in the Himalayas',
        tagline: s.tagline || 'Towards a vibrant & sustainable handicrafts sector',
        heroParagraph:
          s.heroParagraph ||
          'Handicrafts Association of Bhutan supports local artisans in promoting their handicrafts in markets both within Bhutan and internationally, and supports skills development and capacity building of the craftspeople.',
        heroCtaPrimaryText: s.heroCtaPrimaryText || 'Our mission',
        heroCtaPrimaryLink: s.heroCtaPrimaryLink || '/about',
        heroCtaSecondaryText: s.heroCtaSecondaryText || 'Shop the crafts →',
        heroCtaSecondaryLink: s.heroCtaSecondaryLink || '/shop',

        // Stats fields
        stat1Number: s.stat1Number || '7,500',
        stat1Label: s.stat1Label || 'Micro & small enterprises in the network',
        stat2Number: s.stat2Number || '5,250',
        stat2Label: s.stat2Label || 'Women-led enterprises',
        stat3Number: s.stat3Number || '195',
        stat3Label: s.stat3Label || 'Affiliated stores across Bhutan',
        stat4Number: s.stat4Number || '13',
        stat4Label: s.stat4Label || 'Arts & crafts of Zorig Chusum',

        // Retail & Wholesale Band
        homeCraftIntro: s.homeCraftIntro || 'Explore traditional textiles, wood carvings, metalwork, and clay artifacts.',
        homeClusterPromo: s.homeClusterPromo || 'Direct community clusters preserving ancient traditions across 20 Dzongkhags.',
        homeWholesalePromo: s.homeWholesalePromo || 'Trade pricing, custom commissions, and bulk ordering for institutions.',

        // About Band
        aboutBandTitle: s.aboutBandTitle || 'A national civil society organisation founded to serve Bhutan’s artisans',
        aboutBandPara1:
          s.aboutBandPara1 ||
          'Handicrafts Association of Bhutan (HAB) is a civil society organisation established to preserve, develop and promote the craft traditions of Bhutan. We represent craftspeople, craft enterprises and community clusters across the country.',
        aboutBandPara2:
          s.aboutBandPara2 ||
          'Our work covers quality standards, design development, business skills, domestic and export marketing, and the documentation of traditional techniques.',
        aboutBandImageUrl: s.aboutBandImageUrl || '/assets/photos/about-hab.jpg',
        aboutBandImageCaption: s.aboutBandImageCaption || 'Master weaver instructing apprentices in Thimphu',
        aboutBandCtaText: s.aboutBandCtaText || 'Read about our programmes',
        aboutBandCtaLink: s.aboutBandCtaLink || '/programmes',

        // Assurances
        assurance1Title: s.assurance1Title || 'Verified members only',
        assurance1Text: s.assurance1Text || 'Every seller is a registered HAB member with documented craft credentials.',
        assurance2Title: s.assurance2Title || 'Fair price, paid upfront',
        assurance2Text: s.assurance2Text || 'Artisans receive fair wholesale rates at dispatch, not conditional on sale.',
        assurance3Title: s.assurance3Title || 'Craft origin certified',
        assurance3Text: s.assurance3Text || 'Pieces carry verifiable origin, cluster provenance and artisan details.',
        assurance4Title: s.assurance4Title || 'Direct CSO support',
        assurance4Text: s.assurance4Text || 'Every purchase directly funds artisan training and tools across all 20 dzongkhags.',

        // Membership callouts
        membershipLeftTitle: s.membershipLeftTitle || 'Join as a craft artisan or enterprise',
        membershipLeftText:
          s.membershipLeftText ||
          'Get access to market linkage, design workshops, subsidized stalls, export facilitation, and our national directory.',
        membershipLeftCtaText: s.membershipLeftCtaText || 'Apply for Membership →',
        membershipLeftCtaLink: s.membershipLeftCtaLink || '/register',
        membershipRightTitle: s.membershipRightTitle || 'Find certified master craftspeople',
        membershipRightText:
          s.membershipRightText ||
          'Browse our vetted member directory covering all thirteen traditional Zorig Chusum craft sectors.',

        // Extended About
        aboutMandateText: s.aboutMandateText || 'HAB was established under the Civil Society Organizations Act of Bhutan 2007.',
        aboutMandatePara2: s.aboutMandatePara2 || 'We operate as the peak industry body connecting rural producers to global connoisseurs.',
        aboutHistoryText: s.aboutHistoryText || 'Founded in 2005 and registered in 2011, HAB has united over 7,500 craft practitioners.',

        // Donate
        donateHeroTitle: s.donateHeroTitle || 'Support Bhutanese Artisans & Cultural Heritage',
        donateHeroLede: s.donateHeroLede || 'Your philanthropic donation empowers rural weavers, blacksmiths, and sculptors across Bhutan.',
        donateTaxNotice: s.donateTaxNotice || 'HAB is a registered Civil Society Organization. Donations within Bhutan qualify for CSO tax deductions under Section 31.',

        // Contact
        officeAddress: s.officeAddress || 'Metog Lam, Thimphu, Bhutan',
        officePhone: s.officePhone || '+975-2-338089',
        edPhone: s.edPhone || '+975-77654508',
        marketingPhone: s.marketingPhone || '+975-17462636 / 17881111',
        officialEmail: s.officialEmail || 'officehab@gmail.com',
        contactHours: s.contactHours || 'Monday - Friday: 9:00 AM - 5:00 PM (BST)',
        contactPoBox: s.contactPoBox || 'P.O. Box 1109, Thimphu',

        // Punakha
        punakhaMarketNotice: s.punakhaMarketNotice || 'Validated and managed by HAB for authentic Bhutanese craft provenance.',
        csoRegistration: s.csoRegistration || '2011 · CSO/2011/043',
      });

      if (heroData?.slides && Array.isArray(heroData.slides)) {
        setSlides(heroData.slides);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, sectionType]);

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Save site-settings
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        setSessionExpired(true);
        throw new Error('Your admin session has expired. Please log in again.');
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save section changes.');
      }

      const result = await res.json();
      const updatedSetting = result.setting || form;

      // 2. Dispatch events for instantaneous zero-reload live updates across components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('hab:settings-updated', {
            detail: updatedSetting,
          })
        );
        window.dispatchEvent(new CustomEvent('hab:content-updated'));
      }

      if (onSaved) {
        onSaved(updatedSetting);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save section.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !mounted) return null;

  // Compute title & studio destination
  const displayTitle =
    sectionTitle ||
    (sectionType === 'hero'
      ? 'Hero Section & Mission'
      : sectionType === 'stats'
      ? 'Stats & Impact Counters'
      : sectionType === 'buy'
      ? 'Retail & Trade Gateways'
      : sectionType === 'about'
      ? 'About HAB Band'
      : sectionType === 'assurances'
      ? 'Quality Assurances Band'
      : sectionType === 'membership'
      ? 'Membership Callouts'
      : sectionType === 'about-page'
      ? 'About Page Story & Mandate'
      : sectionType === 'donate'
      ? 'Donations & Philanthropy'
      : sectionType === 'contact'
      ? 'Contact & Secretariate Info'
      : 'Live Section Editor');

  const defaultStudioHref =
    studioHref ||
    (sectionType === 'hero'
      ? '/admin/hero'
      : sectionType === 'stats'
      ? '/admin/site-settings'
      : sectionType === 'buy'
      ? '/admin/trade'
      : sectionType === 'about'
      ? '/admin/pages/about'
      : sectionType === 'membership'
      ? '/admin/membership-categories'
      : sectionType === 'donate'
      ? '/admin/donate-settings'
      : sectionType === 'contact'
      ? '/admin/site-settings?tab=CONTACT'
      : '/admin/site-settings');

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B2E24] text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {displayTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
                  In-Place Live Edit
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Update titles, paragraphs, buttons, and media with instant 2-way reflection across the live page.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Tabs for Deep Section Control */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-3 gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('CONTENT')}
            className={"pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap " +
              (activeTab === 'CONTENT'
                ? 'border-[#8B2E24] text-[#8B2E24]'
                : 'border-transparent text-slate-500 hover:text-slate-900')
            }
          >
            <Type className="w-3.5 h-3.5" />
            <span>Headlines & Text</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ACTIONS')}
            className={"pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap " +
              (activeTab === 'ACTIONS'
                ? 'border-[#8B2E24] text-[#8B2E24]'
                : 'border-transparent text-slate-500 hover:text-slate-900')
            }
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Call-to-Action Buttons</span>
          </button>

          {(sectionType === 'hero' || sectionType === 'about') && (
            <button
              type="button"
              onClick={() => setActiveTab('MEDIA')}
              className={"pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap " +
                (activeTab === 'MEDIA'
                  ? 'border-[#8B2E24] text-[#8B2E24]'
                  : 'border-transparent text-slate-500 hover:text-slate-900')
              }
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{sectionType === 'hero' ? 'Slideshow & Photos' : 'Section Image'}</span>
            </button>
          )}

          {(sectionType === 'hero' || sectionType === 'stats') && (
            <button
              type="button"
              onClick={() => setActiveTab('STATS')}
              className={"pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap " +
                (activeTab === 'STATS'
                  ? 'border-[#8B2E24] text-[#8B2E24]'
                  : 'border-transparent text-slate-500 hover:text-slate-900')
              }
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Impact Counters ({form.stat1Number ? '4' : '0'})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 no-scrollbar">
            {/* Feedback Alerts */}
            {sessionExpired && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Your staff session has expired. Re-authenticate in a new tab to continue saving.</span>
                </div>
                <Link
                  href="/admin/login"
                  target="_blank"
                  className="px-3 py-1 rounded-lg bg-[#8B2E24] text-white font-bold hover:bg-[#73241c] transition-colors whitespace-nowrap flex items-center gap-1"
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
                <span className="font-semibold">Section updated successfully! Changes reflected immediately.</span>
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#8B2E24] mb-2" />
                <span className="text-xs">Loading section records from database...</span>
              </div>
            ) : (
              <>
                {/* ================= TAB 1: HEADLINES & TEXT ================= */}
                {activeTab === 'CONTENT' && (
                  <div className="space-y-4">
                    {sectionType === 'hero' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Hero Eyebrow (Category Badge)
                          </label>
                          <input
                            type="text"
                            value={form.heroEyebrow || ''}
                            onChange={(e) => updateField('heroEyebrow', e.target.value)}
                            placeholder="Crafted in the Himalayas"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Main Headline / Tagline (H1)
                          </label>
                          <input
                            type="text"
                            value={form.tagline || ''}
                            onChange={(e) => updateField('tagline', e.target.value)}
                            placeholder="Towards a vibrant & sustainable handicrafts sector"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Mission Lede Paragraph
                          </label>
                          <textarea
                            rows={3}
                            value={form.heroParagraph || ''}
                            onChange={(e) => updateField('heroParagraph', e.target.value)}
                            placeholder="Handicrafts Association of Bhutan supports local artisans..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                      </>
                    )}

                    {sectionType === 'about' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Band Headline
                          </label>
                          <input
                            type="text"
                            value={form.aboutBandTitle || ''}
                            onChange={(e) => updateField('aboutBandTitle', e.target.value)}
                            placeholder="A national civil society organisation founded to serve Bhutan’s artisans"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Paragraph 1 (Founding & Mission)
                          </label>
                          <textarea
                            rows={3}
                            value={form.aboutBandPara1 || ''}
                            onChange={(e) => updateField('aboutBandPara1', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Paragraph 2 (Scope & Programmes)
                          </label>
                          <textarea
                            rows={3}
                            value={form.aboutBandPara2 || ''}
                            onChange={(e) => updateField('aboutBandPara2', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                      </>
                    )}

                    {sectionType === 'assurances' && (
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((num) => (
                          <div key={num} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#8B2E24]" />
                              <span className="text-xs font-bold text-slate-800">Assurance Pillar #{num}</span>
                            </div>
                            <input
                              type="text"
                              value={form['assurance' + num + 'Title'] || ''}
                              onChange={(e) => updateField('assurance' + num + 'Title', e.target.value)}
                              placeholder={'Title for Assurance #' + num}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold focus:outline-hidden focus:border-[#8B2E24]"
                            />
                            <textarea
                              rows={2}
                              value={form['assurance' + num + 'Text'] || ''}
                              onChange={(e) => updateField('assurance' + num + 'Text', e.target.value)}
                              placeholder={'Description for Assurance #' + num}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-[#8B2E24]"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {sectionType === 'membership' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                          <span className="text-xs font-bold text-[#8B2E24] uppercase tracking-wider">
                            Left Card: Artisan & Enterprise Join Callout
                          </span>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Card Title</label>
                            <input
                              type="text"
                              value={form.membershipLeftTitle || ''}
                              onChange={(e) => updateField('membershipLeftTitle', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Card Description</label>
                            <textarea
                              rows={2}
                              value={form.membershipLeftText || ''}
                              onChange={(e) => updateField('membershipLeftText', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                          <span className="text-xs font-bold text-[#8B2E24] uppercase tracking-wider">
                            Right Card: Find Master Craftspeople Callout
                          </span>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Card Title</label>
                            <input
                              type="text"
                              value={form.membershipRightTitle || ''}
                              onChange={(e) => updateField('membershipRightTitle', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Card Description</label>
                            <textarea
                              rows={2}
                              value={form.membershipRightText || ''}
                              onChange={(e) => updateField('membershipRightText', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {sectionType === 'about-page' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Who We Are / Mandate Introduction
                          </label>
                          <textarea
                            rows={3}
                            value={form.aboutMandateText || ''}
                            onChange={(e) => updateField('aboutMandateText', e.target.value)}
                            placeholder="The Handicrafts Association of Bhutan (HAB) was established in 2005 under Royal Patronage..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Mission & Support Details (Para 2)
                          </label>
                          <textarea
                            rows={3}
                            value={form.aboutMandatePara2 || ''}
                            onChange={(e) => updateField('aboutMandatePara2', e.target.value)}
                            placeholder="HAB supports local artisans by providing resources, training and policy interventions..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            CSO Registration & Legal Identification
                          </label>
                          <input
                            type="text"
                            value={form.csoRegistration || ''}
                            onChange={(e) => updateField('csoRegistration', e.target.value)}
                            placeholder="2011 · CSO/2011/043"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            History & Growth Narrative
                          </label>
                          <textarea
                            rows={3}
                            value={form.aboutHistoryText || ''}
                            onChange={(e) => updateField('aboutHistoryText', e.target.value)}
                            placeholder="Founded in 2005 and registered in 2011, HAB has united over 7,500 craft practitioners..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8B2E24]/20 focus:border-[#8B2E24]"
                          />
                        </div>
                      </div>
                    )}

                    {sectionType === 'donate' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Donation Hero Headline
                          </label>
                          <input
                            type="text"
                            value={form.donateHeroTitle || ''}
                            onChange={(e) => updateField('donateHeroTitle', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Donation Lede / Mission Description
                          </label>
                          <textarea
                            rows={3}
                            value={form.donateHeroLede || ''}
                            onChange={(e) => updateField('donateHeroLede', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Tax Exemption Notice
                          </label>
                          <textarea
                            rows={2}
                            value={form.donateTaxNotice || ''}
                            onChange={(e) => updateField('donateTaxNotice', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                      </>
                    )}

                    {sectionType === 'contact' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
                          <input
                            type="text"
                            value={form.officeAddress || ''}
                            onChange={(e) => updateField('officeAddress', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                          <input
                            type="email"
                            value={form.officialEmail || ''}
                            onChange={(e) => updateField('officialEmail', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Office Telephone</label>
                          <input
                            type="text"
                            value={form.officePhone || ''}
                            onChange={(e) => updateField('officePhone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Executive Director Direct</label>
                          <input
                            type="text"
                            value={form.edPhone || ''}
                            onChange={(e) => updateField('edPhone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Marketing Hotline</label>
                          <input
                            type="text"
                            value={form.marketingPhone || ''}
                            onChange={(e) => updateField('marketingPhone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Office Working Hours</label>
                          <input
                            type="text"
                            value={form.contactHours || ''}
                            onChange={(e) => updateField('contactHours', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ================= TAB 2: CALL-TO-ACTION BUTTONS ================= */}
                {activeTab === 'ACTIONS' && (
                  <div className="space-y-4">
                    {sectionType === 'hero' && (
                      <div className="space-y-4">
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <span className="text-xs font-bold text-slate-800">Primary Button</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Button Text</label>
                              <input
                                type="text"
                                value={form.heroCtaPrimaryText || ''}
                                onChange={(e) => updateField('heroCtaPrimaryText', e.target.value)}
                                placeholder="Our mission"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Destination Link</label>
                              <input
                                type="text"
                                value={form.heroCtaPrimaryLink || ''}
                                onChange={(e) => updateField('heroCtaPrimaryLink', e.target.value)}
                                placeholder="/about"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <span className="text-xs font-bold text-slate-800">Secondary Button</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Button Text</label>
                              <input
                                type="text"
                                value={form.heroCtaSecondaryText || ''}
                                onChange={(e) => updateField('heroCtaSecondaryText', e.target.value)}
                                placeholder="Shop the crafts →"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Destination Link</label>
                              <input
                                type="text"
                                value={form.heroCtaSecondaryLink || ''}
                                onChange={(e) => updateField('heroCtaSecondaryLink', e.target.value)}
                                placeholder="/shop"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {sectionType === 'about' && (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-800">About Band Link Button</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Button Label</label>
                            <input
                              type="text"
                              value={form.aboutBandCtaText || ''}
                              onChange={(e) => updateField('aboutBandCtaText', e.target.value)}
                              placeholder="Read about our programmes"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Target URL</label>
                            <input
                              type="text"
                              value={form.aboutBandCtaLink || ''}
                              onChange={(e) => updateField('aboutBandCtaLink', e.target.value)}
                              placeholder="/programmes"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {sectionType === 'membership' && (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-800">Apply Membership Button</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Button Text</label>
                            <input
                              type="text"
                              value={form.membershipLeftCtaText || ''}
                              onChange={(e) => updateField('membershipLeftCtaText', e.target.value)}
                              placeholder="Apply for Membership →"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Destination URL</label>
                            <input
                              type="text"
                              value={form.membershipLeftCtaLink || ''}
                              onChange={(e) => updateField('membershipLeftCtaLink', e.target.value)}
                              placeholder="/register"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ================= TAB 3: MEDIA & PHOTOGRAPHS ================= */}
                {activeTab === 'MEDIA' && (
                  <div className="space-y-4">
                    {sectionType === 'about' && (
                      <div className="space-y-3">
                        <FileUploadInput
                          value={form.aboutBandImageUrl || ''}
                          onChange={(url) => updateField('aboutBandImageUrl', url)}
                          label="About Band Photograph"
                          hint="Recommended: Landscape or square artisan workshop photo (JPG/WebP/PNG)"
                        />
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Image Caption / Screen-reader Alt Text
                          </label>
                          <input
                            type="text"
                            value={form.aboutBandImageCaption || ''}
                            onChange={(e) => updateField('aboutBandImageCaption', e.target.value)}
                            placeholder="Master weaver instructing apprentices in Thimphu"
                            className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {sectionType === 'hero' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800">
                              Active Hero Background Slides ({slides.length})
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Artisan slides cycle automatically in the hero frame.
                            </p>
                          </div>
                          <Link
                            href="/admin/hero"
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 text-xs font-semibold transition-colors"
                          >
                            <span>Manage Full Slider</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {slides.map((slide, idx) => (
                            <div
                              key={slide.id || idx}
                              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3"
                            >
                              <div className="w-16 h-12 rounded-lg overflow-hidden relative shrink-0 bg-slate-200 border border-slate-300">
                                <img
                                  src={slide.imageUrl}
                                  alt={slide.altText || slide.caption}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="block text-xs font-bold text-slate-800 truncate">
                                  {slide.caption || ('Slide #' + (idx + 1))}
                                </span>
                                <span className="block text-[10px] text-slate-500 truncate font-mono">
                                  {slide.imageUrl}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ================= TAB 4: IMPACT STATS ================= */}
                {activeTab === 'STATS' && (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((num) => (
                      <div
                        key={num}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center"
                      >
                        <div className="sm:col-span-1">
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Stat #{num} Number
                          </label>
                          <input
                            type="text"
                            value={form['stat' + num + 'Number'] || ''}
                            onChange={(e) => updateField('stat' + num + 'Number', e.target.value)}
                            placeholder="e.g. 7,500"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-[#8B2E24]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Stat #{num} Label / Metric
                          </label>
                          <input
                            type="text"
                            value={form['stat' + num + 'Label'] || ''}
                            onChange={(e) => updateField('stat' + num + 'Label', e.target.value)}
                            placeholder="e.g. Micro & small enterprises in the network"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex-shrink-0 p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <Link
              href={defaultStudioHref}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Admin Studio</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
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
                    <span>Saving changes...</span>
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
    </div>,
    document.body
  );
}
