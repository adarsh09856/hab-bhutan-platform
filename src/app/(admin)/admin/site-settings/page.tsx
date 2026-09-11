'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Megaphone, Home, Phone, ShieldCheck, HeartHandshake, Shield, Sparkles, Users } from 'lucide-react';

export default function AdminSiteSettingsPage() {
  const [tab, setTab] = useState<'HOMEPAGE' | 'ASSURANCES' | 'ABOUT_BAND' | 'MEMBERSHIP' | 'ANNOUNCEMENT' | 'CONTACT' | 'FOOTER' | 'PARTNERS' | 'ABOUT_PAGE' | 'WHOLESALE' | 'CHECKOUT' | 'DONATE' | 'TRUST'>('HOMEPAGE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
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
    punakhaMarketNotice: '',
    partnersList: [] as string[],
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

  const [partnerInput, setPartnerInput] = useState('');

  useEffect(() => {
    let isMounted = true;

    // Safety timeout to guarantee the page never hangs on the loading spinner
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1200);

    // Primary fetch from admin API with fallback to public site-settings API
    fetch('/api/admin/site-settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!isMounted) return;
        if (d?.setting) {
          setForm((prev) => ({
            ...prev,
            ...d.setting,
            partnersList: Array.isArray(d.setting.partnersList) ? d.setting.partnersList : prev.partnersList,
          }));
          setLoading(false);
        } else {
          // Fallback to public settings endpoint
          fetch('/api/site-settings')
            .then((r) => r.json())
            .then((pub) => {
              if (!isMounted) return;
              const s = pub?.setting || pub?.settings;
              if (s) {
                setForm((prev) => ({
                  ...prev,
                  ...s,
                  partnersList: Array.isArray(s.partnersList) ? s.partnersList : prev.partnersList,
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
        fetch('/api/site-settings')
          .then((r) => r.json())
          .then((pub) => {
            if (!isMounted) return;
            const s = pub?.setting || pub?.settings;
            if (s) {
              setForm((prev) => ({
                ...prev,
                ...s,
                partnersList: Array.isArray(s.partnersList) ? s.partnersList : prev.partnersList,
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

  const addPartner = () => {
    if (!partnerInput.trim()) return;
    if (!form.partnersList.includes(partnerInput.trim())) {
      setForm({ ...form, partnersList: [...form.partnersList, partnerInput.trim()] });
    }
    setPartnerInput('');
  };

  const removePartner = (p: string) => {
    setForm({ ...form, partnersList: form.partnersList.filter((x) => x !== p) });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Website &amp; Global CMS Controls</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Centrally manage public header notices, homepage hero copy, impact statistics, contact directories, and footer disclaimers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 admin-button-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-lg self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing live...' : 'Publish changes'}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium backdrop-blur-xl border shadow-xl animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-none" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-none" />
            )}
            <span className="leading-relaxed">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto custom-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setTab('HOMEPAGE')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'HOMEPAGE' ? 'border-amber-400 text-amber-300 font-bold bg-white/5 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-xl'
          }`}
        >
          <Home className="w-4 h-4 text-amber-400" />
          Hero &amp; Impact Metrics
        </button>
        <button
          type="button"
          onClick={() => setTab('ASSURANCES')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'ASSURANCES' ? 'border-amber-400 text-amber-300 font-bold bg-white/5 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-xl'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-400" />
          Assurances (4 Value Props)
        </button>
        <button
          type="button"
          onClick={() => setTab('ABOUT_BAND')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'ABOUT_BAND' ? 'border-amber-400 text-amber-300 font-bold bg-white/5 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-xl'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          About HAB Story Band
        </button>
        <button
          type="button"
          onClick={() => setTab('MEMBERSHIP')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'MEMBERSHIP' ? 'border-amber-400 text-amber-300 font-bold bg-white/5 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-xl'
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          Membership Callouts
        </button>
        <button
          type="button"
          onClick={() => setTab('ANNOUNCEMENT')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'ANNOUNCEMENT' ? 'border-amber-400 text-amber-300 font-bold bg-white/5 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-xl'
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-400" />
          Header Notice Strip
        </button>
        <button
          type="button"
          onClick={() => setTab('CONTACT')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'CONTACT' ? 'border-amber-400 text-amber-300 font-bold bg-white/5 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-xl'
          }`}
        >
          <Phone className="w-4 h-4 text-amber-400" />
          Secretariat Directory
        </button>
        <button
          type="button"
          onClick={() => setTab('FOOTER')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'FOOTER' ? 'border-amber-400 text-amber-300 font-bold bg-white/5 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-xl'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          Footer &amp; Legal
        </button>
        <button
          type="button"
          onClick={() => setTab('PARTNERS')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            tab === 'PARTNERS' ? 'border-amber-400 text-amber-300 font-bold bg-white/5 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-xl'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-amber-400" />
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
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Narrative Paragraph 1
              </label>
              <textarea
                rows={3}
                value={form.aboutBandPara1}
                onChange={(e) => setForm({ ...form, aboutBandPara1: e.target.value })}
                placeholder="Handicrafts Association of Bhutan (HAB) plays a critical role in the Bhutanese handicrafts sector..."
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                Narrative Paragraph 2
              </label>
              <textarea
                rows={3}
                value={form.aboutBandPara2}
                onChange={(e) => setForm({ ...form, aboutBandPara2: e.target.value })}
                placeholder="Our nationwide network supports more than 7,500 micro and small craft enterprises..."
                className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold admin-text uppercase tracking-wider mb-1.5">
                  Featured Image URL or Path
                </label>
                <input
                  type="text"
                  value={form.aboutBandImageUrl}
                  onChange={(e) => setForm({ ...form, aboutBandImageUrl: e.target.value })}
                  placeholder="/images/training_workshop.jpg"
                  className="w-full px-3.5 py-2.5 admin-input border rounded-lg text-sm"
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
          </div>
        )}

        {/* PARTNERS TAB */}
        {tab === 'PARTNERS' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold admin-title">Partner &amp; Donor Organizations</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={partnerInput}
                onChange={(e) => setPartnerInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPartner(); } }}
                placeholder="Enter partner name (e.g. EU SWITCH-Asia, Helvetas)"
                className="flex-1 px-3.5 py-2 admin-input border rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={addPartner}
                className="px-4 py-2 admin-button-secondary rounded-lg text-sm font-semibold cursor-pointer"
              >
                Add Partner
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-3">
              {form.partnersList.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-500/15 border admin-border rounded-full text-xs font-medium admin-text"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => removePartner(p)}
                    className="admin-muted hover:text-rose-300 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
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
    </div>
  );
}