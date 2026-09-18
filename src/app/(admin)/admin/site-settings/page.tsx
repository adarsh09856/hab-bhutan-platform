'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, AlertCircle, CheckCircle2, Megaphone, Home, Phone, ShieldCheck, HeartHandshake, Shield, Sparkles, Users, Globe, DollarSign, ExternalLink, ArrowRight, Plus, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { AdminModal } from '@/components/admin/AdminUI';

interface PartnerItem {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
}

const normalizePartner = (p: any): PartnerItem => {
  if (typeof p === 'string') {
    return { name: p, logoUrl: '', websiteUrl: '' };
  }
  return {
    name: p?.name || '',
    logoUrl: p?.logoUrl || p?.logo_path || '',
    websiteUrl: p?.websiteUrl || p?.url || '',
  };
};

export default function AdminSiteSettingsPage() {
  const [tab, setTab] = useState<'HOMEPAGE' | 'LOCALIZATION' | 'ASSURANCES' | 'ABOUT_BAND' | 'MEMBERSHIP' | 'ANNOUNCEMENT' | 'CONTACT' | 'FOOTER' | 'PARTNERS' | 'ABOUT_PAGE' | 'WHOLESALE' | 'CHECKOUT' | 'DONATE' | 'TRUST'>('HOMEPAGE');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const qTab = new URLSearchParams(window.location.search).get('tab');
      if (qTab && ['HOMEPAGE', 'LOCALIZATION', 'ASSURANCES', 'ABOUT_BAND', 'MEMBERSHIP', 'ANNOUNCEMENT', 'CONTACT', 'FOOTER', 'PARTNERS', 'ABOUT_PAGE', 'WHOLESALE', 'CHECKOUT', 'DONATE', 'TRUST'].includes(qTab)) {
        setTab(qTab as any);
      }
    }
  }, []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    supportedCurrencies: ['USD', 'BTN'] as string[],
    supportedLanguages: ['en', 'dz'] as string[],
    fxRate: 84.0,
    announcementText: '',
    announcementLink: '',
    isAnnouncementOn: true,
    tagline: '',
    heroParagraph: '',
    heroCtaPrimaryText: '',
    heroCtaPrimaryLink: '',
    heroCtaSecondaryText: '',
    heroCtaSecondaryLink: '',
    stat1Number: '',
    stat1Label: '',
    stat2Number: '',
    stat2Label: '',
    stat3Number: '',
    stat3Label: '',
    stat4Number: '',
    stat4Label: '',
    officeAddress: '',
    officePhone: '',
    edPhone: '',
    marketingPhone: '',
    officialEmail: '',
    footerAbout: '',
    csoRegistration: '',
    copyrightText: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
    punakhaMarketNotice: '',
    partnersList: [] as PartnerItem[],
    // Assurances Band CMS
    assurance1Title: '',
    assurance1Text: '',
    assurance2Title: '',
    assurance2Text: '',
    assurance3Title: '',
    assurance3Text: '',
    assurance4Title: '',
    assurance4Text: '',
    // About Band CMS
    aboutBandTitle: '',
    aboutBandPara1: '',
    aboutBandPara2: '',
    aboutBandImageUrl: '',
    aboutBandImageCaption: '',
    aboutBandCtaText: '',
    aboutBandCtaLink: '',
    // Membership Callouts CMS
    membershipLeftTitle: '',
    membershipLeftText: '',
    membershipLeftCtaText: '',
    membershipLeftCtaLink: '',
    membershipRightTitle: '',
    membershipRightText: '',
    membershipRightCtaText: '',
    membershipRightCtaLink: '',
    // About Page Detailed CMS
    aboutMandateText: '',
    aboutMandatePara2: '',
    aboutHistoryText: '',
    // Extended Contact Details CMS
    contactLede: '',
    contactDirections: '',
    contactPoBox: '',
    contactHours: '',
    // Homepage Extended Sections
    homeCraftIntro: '',
    homeCsoText: '',
    // Wholesale Sourcing CMS
    wholesaleMoq: 10,
    wholesaleLeadTime: '',
    // Checkout & Wire CMS
    checkoutBankName: '',
    checkoutAccountNumber: '',
    checkoutAccountTitle: '',
    checkoutSwiftCode: '',
    checkoutBankAddress: '',
    shippingOriginText: '',
    shippingCarrierName: '',
    shippingTransitDays: '',
    shippingInsuranceNote: '',
    // Order Confirmation CMS
    orderConfirmationTitle: '',
    orderConfirmationLede: '',
    orderSupportEmail: '',
    orderSupportPhone: '',
    // Donate Page CMS
    donateHeroTitle: '',
    donateHeroLede: '',
    donateTaxNotice: '',
  });

  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerEditingIdx, setPartnerEditingIdx] = useState<number | null>(null);
  const [partnerForm, setPartnerForm] = useState<PartnerItem>({
    name: '',
    logoUrl: '',
    websiteUrl: '',
  });

  const openAddPartner = () => {
    setPartnerEditingIdx(null);
    setPartnerForm({ name: '', logoUrl: '', websiteUrl: '' });
    setPartnerModalOpen(true);
  };

  const openEditPartner = (idx: number) => {
    const p = normalizePartner(form.partnersList[idx]);
    setPartnerEditingIdx(idx);
    setPartnerForm(p);
    setPartnerModalOpen(true);
  };

  const savePartnerModal = () => {
    if (!partnerForm.name.trim()) return;
    const current = (form.partnersList || []).map(normalizePartner);
    let nextList: PartnerItem[];
    if (partnerEditingIdx !== null && partnerEditingIdx >= 0) {
      nextList = [...current];
      nextList[partnerEditingIdx] = partnerForm;
    } else {
      nextList = [...current, partnerForm];
    }
    setForm((prev) => ({ ...prev, partnersList: nextList }));
    setPartnerModalOpen(false);
  };

  const removePartner = (idx: number) => {
    const current = (form.partnersList || []).map(normalizePartner);
    setForm((prev) => ({ ...prev, partnersList: current.filter((_, i) => i !== idx) }));
  };

  useEffect(() => {
    let isMounted = true;

    // Safety timeout to guarantee the page never hangs on the loading spinner
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1200);

    // Primary fetch from admin API with fallback to public site-settings API
    fetch('/api/admin/site-settings', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!isMounted) return;
        if (d?.setting) {
          setForm((prev) => ({
            ...prev,
            ...d.setting,
            partnersList: Array.isArray(d.setting.partnersList) ? d.setting.partnersList.map(normalizePartner) : prev.partnersList,
          }));
          setLoading(false);
        } else {
          // Fallback to public settings endpoint
          fetch('/api/site-settings', { cache: 'no-store' })
            .then((r) => r.json())
            .then((pub) => {
              if (!isMounted) return;
              const s = pub?.setting || pub?.settings;
              if (s) {
                setForm((prev) => ({
                  ...prev,
                  ...s,
                  partnersList: Array.isArray(s.partnersList) ? s.partnersList.map(normalizePartner) : prev.partnersList,
                }));
              }
            })
            .catch(() => {})
            .finally(() => {
              if (isMounted) setLoading(false);
            });
        }
      })
      .catch(() => {
        // Fallback to public settings endpoint on network error
        fetch('/api/site-settings', { cache: 'no-store' })
          .then((r) => r.json())
          .then((pub) => {
            if (!isMounted) return;
            const s = pub?.setting || pub?.settings;
            if (s) {
              setForm((prev) => ({
                ...prev,
                ...s,
                partnersList: Array.isArray(s.partnersList) ? s.partnersList.map(normalizePartner) : prev.partnersList,
              }));
            }
          })
          .catch(() => {})
          .finally(() => {
            if (isMounted) setLoading(false);
          });
      });

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (res.status === 401) {
        setFeedback({ type: 'error', message: 'Your session has expired. Please open /admin/login in a new tab to re-authenticate, then click Save again.' });
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Site settings successfully updated and live across all public pages!' });
      } else {
        const rawErr = data.error || 'Failed to save settings';
        const cleanErr = rawErr.includes('Unknown argument')
          ? 'Notice: Some newly added fields require schema refresh on server. Core settings were saved. Run "npx prisma generate" on server to persist all fields.'
          : rawErr.length > 250 ? rawErr.slice(0, 250) + '...' : rawErr;
        setFeedback({ type: 'error', message: cleanErr });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin mb-3" />
        <span className="text-xs font-mono">Loading CMS configuration from database...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Website &amp; Global CMS Controls</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Centrally manage public header notices, homepage hero copy, impact statistics, contact directories, and footer disclaimers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 admin-button-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing live...' : 'Publish changes'}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium border shadow-sm animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-none" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-none" />
            )}
            <span className="leading-relaxed">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto custom-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setTab('HOMEPAGE')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'HOMEPAGE' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <Home className="w-4 h-4 text-[#8B2E24]" />
          Hero &amp; Impact Metrics
        </button>
        <button
          type="button"
          onClick={() => setTab('LOCALIZATION')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'LOCALIZATION' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <Globe className="w-4 h-4 text-[#8B2E24]" />
          Currency &amp; Language
        </button>
        <button
          type="button"
          onClick={() => setTab('ASSURANCES')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'ASSURANCES' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <Shield className="w-4 h-4 text-[#8B2E24]" />
          Assurances (4 Value Props)
        </button>
        <button
          type="button"
          onClick={() => setTab('ABOUT_BAND')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'ABOUT_BAND' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#8B2E24]" />
          About HAB Story Band
        </button>
        <button
          type="button"
          onClick={() => setTab('MEMBERSHIP')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'MEMBERSHIP' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <Users className="w-4 h-4 text-[#8B2E24]" />
          Membership Callouts
        </button>
        <button
          type="button"
          onClick={() => setTab('ANNOUNCEMENT')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'ANNOUNCEMENT' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <Megaphone className="w-4 h-4 text-[#8B2E24]" />
          Header Notice Strip
        </button>
        <button
          type="button"
          onClick={() => setTab('CONTACT')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'CONTACT' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <Phone className="w-4 h-4 text-[#8B2E24]" />
          Secretariat Directory
        </button>
        <button
          type="button"
          onClick={() => setTab('FOOTER')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'FOOTER' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#8B2E24]" />
          Footer &amp; Legal
        </button>
        <button
          type="button"
          onClick={() => setTab('PARTNERS')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'PARTNERS' ? 'border-[#8B2E24] text-[#8B2E24] font-bold bg-white rounded-t-xl shadow-xs' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-t-xl'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-[#8B2E24]" />
          Partners &amp; Donors
        </button>
        <button
          type="button"
          onClick={() => setTab('ABOUT_PAGE')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'ABOUT_PAGE' ? 'border-indigo-400 text-indigo-300' : 'border-transparent admin-muted admin-hover'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          About Page Mandate
        </button>
        <button
          type="button"
          onClick={() => setTab('WHOLESALE')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'WHOLESALE' ? 'border-indigo-400 text-indigo-300' : 'border-transparent admin-muted admin-hover'
          }`}
        >
          <Shield className="w-4 h-4" />
          Wholesale &amp; Sourcing
        </button>
        <button
          type="button"
          onClick={() => setTab('CHECKOUT')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'CHECKOUT' ? 'border-indigo-400 text-indigo-300' : 'border-transparent admin-muted admin-hover'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Checkout &amp; Shipping
        </button>
        <button
          type="button"
          onClick={() => setTab('DONATE')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'DONATE' ? 'border-indigo-400 text-indigo-300' : 'border-transparent admin-muted admin-hover'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          Donate Page Notices
        </button>
      </div>

      <form onSubmit={handleSave} className="admin-card border admin-border rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* LOCALIZATION & CURRENCY TAB */}
        {tab === 'LOCALIZATION' && (
          <div className="space-y-8">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-600" />
                  Global Currency &amp; Language Controller
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Centrally control the public site&apos;s baseline store currency, primary language, and live exchange rate. Changes saved here reflect immediately on all public pages.
                </p>
              </div>
              <Link
                href="/admin/localization"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold transition-colors flex-none self-start sm:self-auto shadow-xs"
              >
                <span>Open Dedicated View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Current Active Status Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600">Default Currency</span>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-xs font-mono font-semibold">
                    {form.defaultCurrency}
                  </span>
                  {form.defaultCurrency === 'USD' ? 'US Dollar ($)' : 'Bhutanese Ngultrum (Nu.)'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600">Default Language</span>
                <div className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono">
                    {form.defaultLanguage.toUpperCase()}
                  </span>
                  {form.defaultLanguage === 'en' ? 'English' : 'རྫོང་ཁ (Dzongkha)'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600">Exchange Rate Peg</span>
                <div className="text-sm font-bold text-sky-900 font-mono">
                  1 USD = Nu. {Number(form.fxRate || 84).toFixed(2)} BTN
                </div>
              </div>
            </div>

            {/* Currency Controller Section */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                1. Default Store Currency (Public Site Baseline)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setForm({ ...form, defaultCurrency: 'USD' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    form.defaultCurrency === 'USD'
                      ? 'border-[#8B2E24] bg-white shadow-sm ring-2 ring-[#8B2E24]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                      <DollarSign className="w-4 h-4 text-[#8B2E24]" />
                      USD — United States Dollar ($)
                    </div>
                    <input
                      type="radio"
                      name="defaultCurrency"
                      checked={form.defaultCurrency === 'USD'}
                      onChange={() => setForm({ ...form, defaultCurrency: 'USD' })}
                      className="text-[#8B2E24] focus:ring-[#8B2E24] cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-600">
                    Default prices appear in <strong>USD ($)</strong> across product cards, craft pages, and cart. International visitors see USD prices first.
                  </p>
                </div>

                <div
                  onClick={() => setForm({ ...form, defaultCurrency: 'BTN' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    form.defaultCurrency === 'BTN'
                      ? 'border-[#8B2E24] bg-white shadow-sm ring-2 ring-[#8B2E24]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                      <span className="font-mono text-[#8B2E24] text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Nu.</span>
                      BTN — Bhutanese Ngultrum (Nu.)
                    </div>
                    <input
                      type="radio"
                      name="defaultCurrency"
                      checked={form.defaultCurrency === 'BTN'}
                      onChange={() => setForm({ ...form, defaultCurrency: 'BTN' })}
                      className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-600">
                    Default prices appear in <strong>Ngultrum (Nu.)</strong> across product cards, craft pages, and cart. Local Bhutanese buyers see Nu. prices first.
                  </p>
                </div>
              </div>
            </div>

            {/* Language Controller Section */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                2. Default Display Language (Public Site Baseline)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setForm({ ...form, defaultLanguage: 'en' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    form.defaultLanguage === 'en'
                      ? 'border-emerald-600 bg-emerald-50 shadow-sm ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      English (en)
                    </div>
                    <input
                      type="radio"
                      name="defaultLanguage"
                      checked={form.defaultLanguage === 'en'}
                      onChange={() => setForm({ ...form, defaultLanguage: 'en' })}
                      className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-600">
                    Standard English for navigation menus, search bar, dropdowns, buttons, and content descriptions.
                  </p>
                </div>

                <div
                  onClick={() => setForm({ ...form, defaultLanguage: 'dz' })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    form.defaultLanguage === 'dz'
                      ? 'border-emerald-600 bg-emerald-50 shadow-sm ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      Dzongkha — རྫོང་ཁ (dz)
                    </div>
                    <input
                      type="radio"
                      name="defaultLanguage"
                      checked={form.defaultLanguage === 'dz'}
                      onChange={() => setForm({ ...form, defaultLanguage: 'dz' })}
                      className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-600">
                    Authentic national language of Bhutan for navigation, labels, search placeholders, and buttons.
                  </p>
                </div>
              </div>
            </div>

            {/* Exchange Rate Controller Section */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                3. Live Exchange Rate (1 USD = X BTN)
              </label>
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">1 USD =</span>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={form.fxRate}
                        onChange={(e) => setForm({ ...form, fxRate: parseFloat(e.target.value) || 0 })}
                        className="w-32 px-3.5 py-2.5 admin-input bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-900 font-bold"
                        placeholder="84.00"
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">BTN (Nu.)</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fxRate: 84.0 })}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
                    >
                      RMA Baseline (84.00)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fxRate: 85.5 })}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
                    >
                      85.50
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fxRate: 86.0 })}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
                    >
                      86.00
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800">Live Calculation Preview:</div>
                  <div className="font-mono text-slate-800">
                    • $25.00 USD &rarr; Nu. {(25 * (Number(form.fxRate) || 84)).toLocaleString()} BTN
                  </div>
                  <div className="font-mono text-slate-800">
                    • $100.00 USD &rarr; Nu. {(100 * (Number(form.fxRate) || 84)).toLocaleString()} BTN
                  </div>
                  <div className="font-mono text-slate-800">
                    • $500.00 USD &rarr; Nu. {(500 * (Number(form.fxRate) || 84)).toLocaleString()} BTN
                  </div>
                </div>
              </div>
            </div>

            {/* Real-Time Sync Informative Callout */}
            <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200 flex items-start gap-3 leading-relaxed">
              <Sparkles className="w-5 h-5 text-amber-400 flex-none mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Two-Way Public &amp; Admin Sync</strong>
                Public visitors can use the interactive chips in the header (<code>USD $ / Nu. BTN</code> and <code>EN / རྫོང་ཁ</code>) to switch on demand. Saving new defaults here immediately updates the baseline for all public visitors across the platform.
              </div>
            </div>
          </div>
        )}

        {/* HOMEPAGE TAB */}
        {tab === 'HOMEPAGE' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold admin-title">Homepage Hero Copy</h2>
            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Main Tagline / Headline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                placeholder="Towards a vibrant & sustainable handicrafts sector"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Narrative Statement / Mission Paragraph
              </label>
              <textarea
                rows={3}
                value={form.heroParagraph}
                onChange={(e) => setForm({ ...form, heroParagraph: e.target.value })}
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                placeholder="Handicrafts Association of Bhutan supports local artisans in promoting their handicrafts..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Primary CTA Text
                </label>
                <input
                  type="text"
                  value={form.heroCtaPrimaryText}
                  onChange={(e) => setForm({ ...form, heroCtaPrimaryText: e.target.value })}
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Primary CTA Link
                </label>
                <input
                  type="text"
                  value={form.heroCtaPrimaryLink}
                  onChange={(e) => setForm({ ...form, heroCtaPrimaryLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Secondary CTA Text
                </label>
                <input
                  type="text"
                  value={form.heroCtaSecondaryText}
                  onChange={(e) => setForm({ ...form, heroCtaSecondaryText: e.target.value })}
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Secondary CTA Link
                </label>
                <input
                  type="text"
                  value={form.heroCtaSecondaryLink}
                  onChange={(e) => setForm({ ...form, heroCtaSecondaryLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="pt-6 border-t admin-border">
              <h2 className="text-base font-bold admin-title mb-4">4 Live Impact Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 admin-panel border admin-border rounded-lg space-y-2">
                  <div className="text-xs font-bold admin-text">Stat 1</div>
                  <input
                    type="text"
                    value={form.stat1Number}
                    onChange={(e) => setForm({ ...form, stat1Number: e.target.value })}
                    placeholder="7,500"
                    className="w-full px-3 py-1.5 admin-input border rounded text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={form.stat1Label}
                    onChange={(e) => setForm({ ...form, stat1Label: e.target.value })}
                    placeholder="Micro & small enterprises in the network"
                    className="w-full px-3 py-1.5 admin-input border rounded text-xs"
                  />
                </div>

                <div className="p-4 admin-panel border admin-border rounded-lg space-y-2">
                  <div className="text-xs font-bold admin-text">Stat 2</div>
                  <input
                    type="text"
                    value={form.stat2Number}
                    onChange={(e) => setForm({ ...form, stat2Number: e.target.value })}
                    placeholder="5,250"
                    className="w-full px-3 py-1.5 admin-input border rounded text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={form.stat2Label}
                    onChange={(e) => setForm({ ...form, stat2Label: e.target.value })}
                    placeholder="Women-led enterprises"
                    className="w-full px-3 py-1.5 admin-input border rounded text-xs"
                  />
                </div>

                <div className="p-4 admin-panel border admin-border rounded-lg space-y-2">
                  <div className="text-xs font-bold admin-text">Stat 3</div>
                  <input
                    type="text"
                    value={form.stat3Number}
                    onChange={(e) => setForm({ ...form, stat3Number: e.target.value })}
                    placeholder="195"
                    className="w-full px-3 py-1.5 admin-input border rounded text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={form.stat3Label}
                    onChange={(e) => setForm({ ...form, stat3Label: e.target.value })}
                    placeholder="Affiliated stores across Bhutan"
                    className="w-full px-3 py-1.5 admin-input border rounded text-xs"
                  />
                </div>

                <div className="p-4 admin-panel border admin-border rounded-lg space-y-2">
                  <div className="text-xs font-bold admin-text">Stat 4</div>
                  <input
                    type="text"
                    value={form.stat4Number}
                    onChange={(e) => setForm({ ...form, stat4Number: e.target.value })}
                    placeholder="13"
                    className="w-full px-3 py-1.5 admin-input border rounded text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={form.stat4Label}
                    onChange={(e) => setForm({ ...form, stat4Label: e.target.value })}
                    placeholder="Arts & crafts of Zorig Chusum"
                    className="w-full px-3 py-1.5 admin-input border rounded text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ASSURANCES TAB */}
        {tab === 'ASSURANCES' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold admin-title">Homepage Assurances Band (4 Value Propositions)</h2>
              <p className="text-xs admin-muted mt-1">
                These four trust badges appear directly under the main hero slider on the homepage to assure international and local buyers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="p-4 admin-panel border admin-border rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xs">1</span>
                  <span className="text-xs font-bold admin-text uppercase">Assurance Badge #1</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Badge Title</label>
                  <input
                    type="text"
                    value={form.assurance1Title}
                    onChange={(e) => setForm({ ...form, assurance1Title: e.target.value })}
                    placeholder="Verified members only"
                    className="w-full px-3 py-2 admin-input border rounded-lg text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Description / Subtext</label>
                  <textarea
                    rows={2}
                    value={form.assurance1Text}
                    onChange={(e) => setForm({ ...form, assurance1Text: e.target.value })}
                    placeholder="Every seller is a registered HAB member with documented craft credentials."
                    className="w-full px-3 py-2 admin-input border rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-4 admin-panel border admin-border rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xs">2</span>
                  <span className="text-xs font-bold admin-text uppercase">Assurance Badge #2</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Badge Title</label>
                  <input
                    type="text"
                    value={form.assurance2Title}
                    onChange={(e) => setForm({ ...form, assurance2Title: e.target.value })}
                    placeholder="Fair price, paid upfront"
                    className="w-full px-3 py-2 admin-input border rounded-lg text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Description / Subtext</label>
                  <textarea
                    rows={2}
                    value={form.assurance2Text}
                    onChange={(e) => setForm({ ...form, assurance2Text: e.target.value })}
                    placeholder="HAB buys from the artisan at an agreed price before the piece is listed."
                    className="w-full px-3 py-2 admin-input border rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-4 admin-panel border admin-border rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xs">3</span>
                  <span className="text-xs font-bold admin-text uppercase">Assurance Badge #3</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Badge Title</label>
                  <input
                    type="text"
                    value={form.assurance3Title}
                    onChange={(e) => setForm({ ...form, assurance3Title: e.target.value })}
                    placeholder="Secure payment"
                    className="w-full px-3 py-2 admin-input border rounded-lg text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Description / Subtext</label>
                  <textarea
                    rows={2}
                    value={form.assurance3Text}
                    onChange={(e) => setForm({ ...form, assurance3Text: e.target.value })}
                    placeholder="3-D Secure cards, mBoB and bank transfer, in USD or Ngultrum."
                    className="w-full px-3 py-2 admin-input border rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Card 4 */}
              <div className="p-4 admin-panel border admin-border rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xs">4</span>
                  <span className="text-xs font-bold admin-text uppercase">Assurance Badge #4</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Badge Title</label>
                  <input
                    type="text"
                    value={form.assurance4Title}
                    onChange={(e) => setForm({ ...form, assurance4Title: e.target.value })}
                    placeholder="Tracked worldwide"
                    className="w-full px-3 py-2 admin-input border rounded-lg text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Description / Subtext</label>
                  <textarea
                    rows={2}
                    value={form.assurance4Text}
                    onChange={(e) => setForm({ ...form, assurance4Text: e.target.value })}
                    placeholder="EMS via Bhutan Post with commercial invoice and craft certificate."
                    className="w-full px-3 py-2 admin-input border rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT BAND TAB */}
        {tab === 'ABOUT_BAND' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold admin-title">Homepage About HAB Story Band</h2>
              <p className="text-xs admin-muted mt-1">
                Configure the institutional story band on the homepage showcasing HAB&apos;s mission, training workshops, and impact.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Section Headline
              </label>
              <input
                type="text"
                value={form.aboutBandTitle}
                onChange={(e) => setForm({ ...form, aboutBandTitle: e.target.value })}
                placeholder="A network built for the artisans, not the middlemen"
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm font-bold"
              />
            </div>

            <div>
              <RichTextEditor
                label="Narrative Paragraph 1"
                value={form.aboutBandPara1}
                onChange={(html) => setForm({ ...form, aboutBandPara1: html })}
                placeholder="Handicrafts Association of Bhutan (HAB) plays a critical role in the Bhutanese handicrafts sector..."
              />
            </div>

            <div>
              <RichTextEditor
                label="Narrative Paragraph 2"
                value={form.aboutBandPara2}
                onChange={(html) => setForm({ ...form, aboutBandPara2: html })}
                placeholder="Our nationwide network supports more than 7,500 micro and small craft enterprises..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FileUploadInput
                  label="Featured Story Image"
                  value={form.aboutBandImageUrl}
                  onChange={(url) => setForm({ ...form, aboutBandImageUrl: url })}
                  accept="image/*"
                  hint="Upload photo from computer/phone for the homepage story card"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Image Caption
                </label>
                <input
                  type="text"
                  value={form.aboutBandImageCaption}
                  onChange={(e) => setForm({ ...form, aboutBandImageCaption: e.target.value })}
                  placeholder="HAB artisan training workshop · Thimphu"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Button Call-to-Action Text
                </label>
                <input
                  type="text"
                  value={form.aboutBandCtaText}
                  onChange={(e) => setForm({ ...form, aboutBandCtaText: e.target.value })}
                  placeholder="Read about our programmes →"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Button Link Destination
                </label>
                <input
                  type="text"
                  value={form.aboutBandCtaLink}
                  onChange={(e) => setForm({ ...form, aboutBandCtaLink: e.target.value })}
                  placeholder="/programmes"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* MEMBERSHIP TAB */}
        {tab === 'MEMBERSHIP' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold admin-title">Homepage Membership Callouts</h2>
              <p className="text-xs admin-muted mt-1">
                Configure the side-by-side cards inviting artisans to apply and buyers to search the member directory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Card: Member Directory */}
              <div className="p-5 admin-panel border admin-border rounded-xl space-y-4">
                <h3 className="text-sm font-bold admin-text uppercase tracking-wider border-b admin-border pb-2">
                  Left Card (Directory / Find a Member)
                </h3>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Headline</label>
                  <input
                    type="text"
                    value={form.membershipLeftTitle}
                    onChange={(e) => setForm({ ...form, membershipLeftTitle: e.target.value })}
                    placeholder="Find a member"
                    className="w-full px-3 py-2 admin-input border rounded-lg text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Narrative Blurb</label>
                  <textarea
                    rows={3}
                    value={form.membershipLeftText}
                    onChange={(e) => setForm({ ...form, membershipLeftText: e.target.value })}
                    placeholder="Connect directly with master craftspeople, verified weaving clusters, and traditional workshops across Bhutan."
                    className="w-full px-3 py-2 admin-input border rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold admin-text mb-1">Button Text</label>
                    <input
                      type="text"
                      value={form.membershipLeftCtaText}
                      onChange={(e) => setForm({ ...form, membershipLeftCtaText: e.target.value })}
                      placeholder="Search member directory →"
                      className="w-full px-3 py-1.5 admin-input border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold admin-text mb-1">Button Link</label>
                    <input
                      type="text"
                      value={form.membershipLeftCtaLink}
                      onChange={(e) => setForm({ ...form, membershipLeftCtaLink: e.target.value })}
                      placeholder="/members"
                      className="w-full px-3 py-1.5 admin-input border rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Right Card: Apply for Membership */}
              <div className="p-5 admin-panel border admin-border rounded-xl space-y-4">
                <h3 className="text-sm font-bold admin-text uppercase tracking-wider border-b admin-border pb-2">
                  Right Card (Apply for Membership)
                </h3>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Headline</label>
                  <input
                    type="text"
                    value={form.membershipRightTitle}
                    onChange={(e) => setForm({ ...form, membershipRightTitle: e.target.value })}
                    placeholder="Become a member"
                    className="w-full px-3 py-2 admin-input border rounded-lg text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold admin-text mb-1">Narrative Blurb</label>
                  <textarea
                    rows={3}
                    value={form.membershipRightText}
                    onChange={(e) => setForm({ ...form, membershipRightText: e.target.value })}
                    placeholder="Access product consignment in our central shop, participate in donor training programmes..."
                    className="w-full px-3 py-2 admin-input border rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold admin-text mb-1">Button Text</label>
                    <input
                      type="text"
                      value={form.membershipRightCtaText}
                      onChange={(e) => setForm({ ...form, membershipRightCtaText: e.target.value })}
                      placeholder="Apply for membership"
                      className="w-full px-3 py-1.5 admin-input border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold admin-text mb-1">Button Link</label>
                    <input
                      type="text"
                      value={form.membershipRightCtaLink}
                      onChange={(e) => setForm({ ...form, membershipRightCtaLink: e.target.value })}
                      placeholder="/membership/apply"
                      className="w-full px-3 py-1.5 admin-input border rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENT TAB */}
        {tab === 'ANNOUNCEMENT' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold admin-title">Header Announcement Bar</h2>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="announcementOn"
                checked={form.isAnnouncementOn}
                onChange={(e) => setForm({ ...form, isAnnouncementOn: e.target.checked })}
                className="w-4 h-4 text-[#8B2E24] rounded"
              />
              <label htmlFor="announcementOn" className="text-sm font-medium admin-text">
                Display top utility bar notice across the public site
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Notice Text
              </label>
              <input
                type="text"
                value={form.announcementText}
                onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                placeholder="CSO/2011/043 · Handicrafts Association of Bhutan..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Notice Target Link (Optional)
              </label>
              <input
                type="text"
                value={form.announcementLink || ''}
                onChange={(e) => setForm({ ...form, announcementLink: e.target.value })}
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                placeholder="/about or external link"
              />
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {tab === 'CONTACT' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold admin-title">Secretariat Operational Directory</h2>
            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Physical Secretariat Address
              </label>
              <input
                type="text"
                value={form.officeAddress}
                onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  General Office Landline
                </label>
                <input
                  type="text"
                  value={form.officePhone}
                  onChange={(e) => setForm({ ...form, officePhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Executive Director Direct Mobile
                </label>
                <input
                  type="text"
                  value={form.edPhone}
                  onChange={(e) => setForm({ ...form, edPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Marketing &amp; E-Shop Desk
                </label>
                <input
                  type="text"
                  value={form.marketingPhone}
                  onChange={(e) => setForm({ ...form, marketingPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Official Secretariat Email
                </label>
                <input
                  type="email"
                  value={form.officialEmail}
                  onChange={(e) => setForm({ ...form, officialEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* FOOTER TAB */}
        {tab === 'FOOTER' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold admin-title">Footer Disclaimers &amp; Accreditations</h2>
            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Footer About Blurb
              </label>
              <textarea
                rows={3}
                value={form.footerAbout}
                onChange={(e) => setForm({ ...form, footerAbout: e.target.value })}
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                CSO Registration Notice
              </label>
              <input
                type="text"
                value={form.csoRegistration}
                onChange={(e) => setForm({ ...form, csoRegistration: e.target.value })}
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Copyright Text
              </label>
              <input
                type="text"
                value={form.copyrightText}
                onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Punakha Market Provenance Certification
              </label>
              <input
                type="text"
                value={form.punakhaMarketNotice}
                onChange={(e) => setForm({ ...form, punakhaMarketNotice: e.target.value })}
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold admin-title mb-1">Official Social Media Profiles</h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter your genuine organization links below. Leave any field blank if you do not have that account — no dummy or placeholder icons will ever be shown on the public site.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/yourpage (or leave blank)"
                    value={form.facebookUrl}
                    onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                    Instagram Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/yourprofile (or leave blank)"
                    value={form.instagramUrl}
                    onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                    X (Twitter) Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/yourhandle (or leave blank)"
                    value={form.twitterUrl}
                    onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@yourchannel (or leave blank)"
                    value={form.youtubeUrl}
                    onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm font-mono text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1">
                    TikTok Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@yourhandle (or leave blank)"
                    value={form.tiktokUrl}
                    onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PARTNERS TAB */}
        {tab === 'PARTNERS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold admin-title">Partner &amp; Donor Organizations</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage institutional partners, development funders, and ministries displayed on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddPartner}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#8B2E24] hover:bg-[#72241c] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Partner Organization</span>
              </button>
            </div>

            {form.partnersList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No partner organizations added yet</p>
                <p className="text-xs text-slate-500 mt-1">Click &ldquo;Add Partner Organization&rdquo; to add your first partner with their logo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {form.partnersList.map((item, idx) => {
                  const p = normalizePartner(item);
                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                          {p.logoUrl ? (
                            <img
                              src={p.logoUrl}
                              alt={p.name}
                              className="max-h-10 max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">No Logo</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate" title={p.name}>
                            {p.name}
                          </h4>
                          {p.websiteUrl ? (
                            <a
                              href={p.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#8B2E24] hover:underline flex items-center gap-1 mt-0.5 truncate"
                            >
                              <span className="truncate">{p.websiteUrl.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">No website link</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => openEditPartner(idx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Edit / Logo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removePartner(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove partner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ABOUT PAGE CMS TAB */}
        {tab === 'ABOUT_PAGE' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold admin-title">About Page Mandate &amp; Heritage</h2>
            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Statutory Mandate (Opening Narrative)
              </label>
              <textarea
                rows={4}
                value={form.aboutMandateText}
                onChange={(e) => setForm({ ...form, aboutMandateText: e.target.value })}
                placeholder="The Handicrafts Association of Bhutan (HAB) was established in 2005 under Royal Patronage..."
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Artisan Network Scope (Paragraph 2)
              </label>
              <textarea
                rows={4}
                value={form.aboutMandatePara2}
                onChange={(e) => setForm({ ...form, aboutMandatePara2: e.target.value })}
                placeholder="We are the apex civil society body representing 7,500+ traditional artisans..."
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Sector History &amp; Strategic Evolution
              </label>
              <textarea
                rows={4}
                value={form.aboutHistoryText}
                onChange={(e) => setForm({ ...form, aboutHistoryText: e.target.value })}
                placeholder="Over two decades of sector leadership, HAB has transformed informal cottage workshops..."
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {/* WHOLESALE TAB */}
        {tab === 'WHOLESALE' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold admin-title">Wholesale &amp; Trade Sourcing Rules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Default Minimum Order Quantity (MOQ)
                </label>
                <input
                  type="number"
                  value={form.wholesaleMoq}
                  onChange={(e) => setForm({ ...form, wholesaleMoq: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Quoted Lead Time Display
                </label>
                <input
                  type="text"
                  value={form.wholesaleLeadTime}
                  onChange={(e) => setForm({ ...form, wholesaleLeadTime: e.target.value })}
                  placeholder="2 to 4 weeks depending on batch size"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* CHECKOUT & SHIPPING TAB */}
        {tab === 'CHECKOUT' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold admin-title">Bank Wire Details (Direct Transfer)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={form.checkoutBankName}
                  onChange={(e) => setForm({ ...form, checkoutBankName: e.target.value })}
                  placeholder="Bank of Bhutan Ltd"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Account Holder Title
                </label>
                <input
                  type="text"
                  value={form.checkoutAccountTitle}
                  onChange={(e) => setForm({ ...form, checkoutAccountTitle: e.target.value })}
                  placeholder="Handicrafts Association of Bhutan"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Account Number / IBAN
                </label>
                <input
                  type="text"
                  value={form.checkoutAccountNumber}
                  onChange={(e) => setForm({ ...form, checkoutAccountNumber: e.target.value })}
                  placeholder="1009234810293"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  SWIFT / BIC Code
                </label>
                <input
                  type="text"
                  value={form.checkoutSwiftCode}
                  onChange={(e) => setForm({ ...form, checkoutSwiftCode: e.target.value })}
                  placeholder="BOBBBT22"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
            </div>

            <h2 className="text-base font-bold admin-title pt-4 border-t admin-border">
              International Dispatch &amp; Logistics Display
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Designated Carrier
                </label>
                <input
                  type="text"
                  value={form.shippingCarrierName}
                  onChange={(e) => setForm({ ...form, shippingCarrierName: e.target.value })}
                  placeholder="Bhutan Post International Express (EMS) / DHL"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Estimated Transit Time
                </label>
                <input
                  type="text"
                  value={form.shippingTransitDays}
                  onChange={(e) => setForm({ ...form, shippingTransitDays: e.target.value })}
                  placeholder="7-14 business days"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Packaging &amp; Transit Insurance Note
              </label>
              <textarea
                rows={3}
                value={form.shippingInsuranceNote}
                onChange={(e) => setForm({ ...form, shippingInsuranceNote: e.target.value })}
                placeholder="Every consignment is hand-packed in Thimphu using traditional handmade Desho paper wrappers..."
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>

            <h2 className="text-base font-bold admin-title pt-4 border-t admin-border">
              Post-Purchase Order Confirmation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Confirmation Header Title
                </label>
                <input
                  type="text"
                  value={form.orderConfirmationTitle}
                  onChange={(e) => setForm({ ...form, orderConfirmationTitle: e.target.value })}
                  placeholder="Order Confirmed!"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Customer Support Email
                </label>
                <input
                  type="text"
                  value={form.orderSupportEmail}
                  onChange={(e) => setForm({ ...form, orderSupportEmail: e.target.value })}
                  placeholder="officehab@gmail.com"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Confirmation Lede Message
              </label>
              <textarea
                rows={2}
                value={form.orderConfirmationLede}
                onChange={(e) => setForm({ ...form, orderConfirmationLede: e.target.value })}
                placeholder="Thank you for supporting Bhutanese master artisans..."
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {/* DONATE TAB */}
        {tab === 'DONATE' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold admin-title">Donate Page Header &amp; CSO Disclosures</h2>
            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Donate Hero Title
              </label>
              <input
                type="text"
                value={form.donateHeroTitle}
                onChange={(e) => setForm({ ...form, donateHeroTitle: e.target.value })}
                placeholder="Direct Support for Bhutanese Artisans"
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Hero Lede Message
              </label>
              <textarea
                rows={3}
                value={form.donateHeroLede}
                onChange={(e) => setForm({ ...form, donateHeroLede: e.target.value })}
                placeholder="100% of public contributions go directly to artisan welfare, emergency raw material funds..."
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Tax Exemption &amp; PBO Statutory Notice
              </label>
              <textarea
                rows={3}
                value={form.donateTaxNotice}
                onChange={(e) => setForm({ ...form, donateTaxNotice: e.target.value })}
                placeholder="HAB is a registered Public Benefit Organisation (CSO/2011/043)..."
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t admin-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 admin-button-primary px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving changes...' : 'Save and publish'}
          </button>
        </div>
      </form>

      {/* PARTNER ADD / EDIT MODAL */}
      <AdminModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        title={partnerEditingIdx !== null ? 'Edit Partner Organization' : 'Add Partner Organization'}
        subtitle="Manage partner identity, official website, and transparent logo artwork."
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPartnerModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={savePartnerModal}
              disabled={!partnerForm.name.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-[#8B2E24] hover:bg-[#72241c] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Save Partner
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Partner / Organization Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={partnerForm.name}
              onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
              placeholder="e.g. EU SWITCH-Asia, UNDP Bhutan, Helvetas"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Partner Website URL <span className="text-[11px] font-normal text-slate-400 lowercase">(optional)</span>
            </label>
            <input
              type="url"
              value={partnerForm.websiteUrl || ''}
              onChange={(e) => setPartnerForm({ ...partnerForm, websiteUrl: e.target.value })}
              placeholder="https://www.switch-asia.eu"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#8B2E24] focus:ring-1 focus:ring-[#8B2E24]"
            />
          </div>

          <div>
            <FileUploadInput
              value={partnerForm.logoUrl || ''}
              onChange={(url) => setPartnerForm({ ...partnerForm, logoUrl: url })}
              label="Partner Logo Artwork"
              accept="image/png,image/svg+xml,image/webp,image/jpeg"
              hint="Supports transparent PNG, SVG, WebP, JPG (44px display height on public site)"
            />
          </div>
        </div>
      </AdminModal>
    </div>
  );
}