'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Megaphone, Home, Phone, ShieldCheck, HeartHandshake, Shield, Sparkles, Users } from 'lucide-react';

export default function AdminSiteSettingsPage() {
  const [tab, setTab] = useState<'HOMEPAGE' | 'ASSURANCES' | 'ABOUT_BAND' | 'MEMBERSHIP' | 'ANNOUNCEMENT' | 'CONTACT' | 'FOOTER' | 'PARTNERS'>('HOMEPAGE');
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
  });

  const [partnerInput, setPartnerInput] = useState('');

  useEffect(() => {
    fetch('/api/admin/site-settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.setting) {
          setForm({
            ...d.setting,
            partnersList: Array.isArray(d.setting.partnersList) ? d.setting.partnersList : [],
          });
        }
      })
      .catch(() => {
        setFeedback({ type: 'error', message: 'Failed to load existing site settings' });
      })
      .finally(() => setLoading(false));
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
        setFeedback({ type: 'error', message: data.error || 'Failed to save settings' });
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
    return <div className="p-8 text-sm text-slate-500">Loading site settings...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Website &amp; Global CMS Controls</h1>
          <p className="text-sm text-slate-500 mt-1">
            Centrally manage public header notices, homepage hero copy, impact statistics, contact directories, and footer disclaimers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#8B2E24] hover:bg-[#72251D] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing live...' : 'Publish changes'}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-none" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-none" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setTab('HOMEPAGE')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'HOMEPAGE' ? 'border-[#8B2E24] text-[#8B2E24]' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4" />
          Hero &amp; Impact Metrics
        </button>
        <button
          type="button"
          onClick={() => setTab('ASSURANCES')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'ASSURANCES' ? 'border-[#8B2E24] text-[#8B2E24]' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          Assurances (4 Value Props)
        </button>
        <button
          type="button"
          onClick={() => setTab('ABOUT_BAND')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'ABOUT_BAND' ? 'border-[#8B2E24] text-[#8B2E24]' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          About HAB Story Band
        </button>
        <button
          type="button"
          onClick={() => setTab('MEMBERSHIP')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'MEMBERSHIP' ? 'border-[#8B2E24] text-[#8B2E24]' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Membership Callouts
        </button>
        <button
          type="button"
          onClick={() => setTab('ANNOUNCEMENT')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'ANNOUNCEMENT' ? 'border-[#8B2E24] text-[#8B2E24]' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Header Notice Strip
        </button>
        <button
          type="button"
          onClick={() => setTab('CONTACT')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'CONTACT' ? 'border-[#8B2E24] text-[#8B2E24]' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Phone className="w-4 h-4" />
          Secretariat Directory
        </button>
        <button
          type="button"
          onClick={() => setTab('FOOTER')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'FOOTER' ? 'border-[#8B2E24] text-[#8B2E24]' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Footer &amp; Legal
        </button>
        <button
          type="button"
          onClick={() => setTab('PARTNERS')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            tab === 'PARTNERS' ? 'border-[#8B2E24] text-[#8B2E24]' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          Partners &amp; Donors
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* HOMEPAGE TAB */}
        {tab === 'HOMEPAGE' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900">Homepage Hero Copy</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Main Tagline / Headline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                placeholder="Towards a vibrant & sustainable handicrafts sector"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Narrative Statement / Mission Paragraph
              </label>
              <textarea
                rows={3}
                value={form.heroParagraph}
                onChange={(e) => setForm({ ...form, heroParagraph: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                placeholder="Handicrafts Association of Bhutan supports local artisans in promoting their handicrafts..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary CTA Text
                </label>
                <input
                  type="text"
                  value={form.heroCtaPrimaryText}
                  onChange={(e) => setForm({ ...form, heroCtaPrimaryText: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary CTA Link
                </label>
                <input
                  type="text"
                  value={form.heroCtaPrimaryLink}
                  onChange={(e) => setForm({ ...form, heroCtaPrimaryLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Secondary CTA Text
                </label>
                <input
                  type="text"
                  value={form.heroCtaSecondaryText}
                  onChange={(e) => setForm({ ...form, heroCtaSecondaryText: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Secondary CTA Link
                </label>
                <input
                  type="text"
                  value={form.heroCtaSecondaryLink}
                  onChange={(e) => setForm({ ...form, heroCtaSecondaryLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-4">4 Live Impact Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-slate-600">Stat 1</div>
                  <input
                    type="text"
                    value={form.stat1Number}
                    onChange={(e) => setForm({ ...form, stat1Number: e.target.value })}
                    placeholder="7,500"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={form.stat1Label}
                    onChange={(e) => setForm({ ...form, stat1Label: e.target.value })}
                    placeholder="Micro & small enterprises in the network"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-slate-600">Stat 2</div>
                  <input
                    type="text"
                    value={form.stat2Number}
                    onChange={(e) => setForm({ ...form, stat2Number: e.target.value })}
                    placeholder="5,250"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={form.stat2Label}
                    onChange={(e) => setForm({ ...form, stat2Label: e.target.value })}
                    placeholder="Women-led enterprises"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-slate-600">Stat 3</div>
                  <input
                    type="text"
                    value={form.stat3Number}
                    onChange={(e) => setForm({ ...form, stat3Number: e.target.value })}
                    placeholder="195"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={form.stat3Label}
                    onChange={(e) => setForm({ ...form, stat3Label: e.target.value })}
                    placeholder="Affiliated stores across Bhutan"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-slate-600">Stat 4</div>
                  <input
                    type="text"
                    value={form.stat4Number}
                    onChange={(e) => setForm({ ...form, stat4Number: e.target.value })}
                    placeholder="13"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-bold"
                  />
                  <input
                    type="text"
                    value={form.stat4Label}
                    onChange={(e) => setForm({ ...form, stat4Label: e.target.value })}
                    placeholder="Arts & crafts of Zorig Chusum"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700"
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
              <h2 className="text-base font-bold text-slate-900">Homepage Assurances Band (4 Value Propositions)</h2>
              <p className="text-xs text-slate-500 mt-1">
                These four trust badges appear directly under the main hero slider on the homepage to assure international and local buyers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xs">1</span>
                  <span className="text-xs font-bold text-slate-700 uppercase">Assurance Badge #1</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Badge Title</label>
                  <input
                    type="text"
                    value={form.assurance1Title}
                    onChange={(e) => setForm({ ...form, assurance1Title: e.target.value })}
                    placeholder="Verified members only"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Subtext</label>
                  <textarea
                    rows={2}
                    value={form.assurance1Text}
                    onChange={(e) => setForm({ ...form, assurance1Text: e.target.value })}
                    placeholder="Every seller is a registered HAB member with documented craft credentials."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700"
                  />
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xs">2</span>
                  <span className="text-xs font-bold text-slate-700 uppercase">Assurance Badge #2</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Badge Title</label>
                  <input
                    type="text"
                    value={form.assurance2Title}
                    onChange={(e) => setForm({ ...form, assurance2Title: e.target.value })}
                    placeholder="Fair price, paid upfront"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Subtext</label>
                  <textarea
                    rows={2}
                    value={form.assurance2Text}
                    onChange={(e) => setForm({ ...form, assurance2Text: e.target.value })}
                    placeholder="HAB buys from the artisan at an agreed price before the piece is listed."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700"
                  />
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xs">3</span>
                  <span className="text-xs font-bold text-slate-700 uppercase">Assurance Badge #3</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Badge Title</label>
                  <input
                    type="text"
                    value={form.assurance3Title}
                    onChange={(e) => setForm({ ...form, assurance3Title: e.target.value })}
                    placeholder="Secure payment"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Subtext</label>
                  <textarea
                    rows={2}
                    value={form.assurance3Text}
                    onChange={(e) => setForm({ ...form, assurance3Text: e.target.value })}
                    placeholder="3-D Secure cards, mBoB and bank transfer, in USD or Ngultrum."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700"
                  />
                </div>
              </div>

              {/* Card 4 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-bold text-xs">4</span>
                  <span className="text-xs font-bold text-slate-700 uppercase">Assurance Badge #4</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Badge Title</label>
                  <input
                    type="text"
                    value={form.assurance4Title}
                    onChange={(e) => setForm({ ...form, assurance4Title: e.target.value })}
                    placeholder="Tracked worldwide"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Subtext</label>
                  <textarea
                    rows={2}
                    value={form.assurance4Text}
                    onChange={(e) => setForm({ ...form, assurance4Text: e.target.value })}
                    placeholder="EMS via Bhutan Post with commercial invoice and craft certificate."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700"
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
              <h2 className="text-base font-bold text-slate-900">Homepage About HAB Story Band</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure the institutional story band on the homepage showcasing HAB&apos;s mission, training workshops, and impact.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Section Headline
              </label>
              <input
                type="text"
                value={form.aboutBandTitle}
                onChange={(e) => setForm({ ...form, aboutBandTitle: e.target.value })}
                placeholder="A network built for the artisans, not the middlemen"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-[#8B2E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Narrative Paragraph 1
              </label>
              <textarea
                rows={3}
                value={form.aboutBandPara1}
                onChange={(e) => setForm({ ...form, aboutBandPara1: e.target.value })}
                placeholder="Handicrafts Association of Bhutan (HAB) plays a critical role in the Bhutanese handicrafts sector..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#8B2E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Narrative Paragraph 2
              </label>
              <textarea
                rows={3}
                value={form.aboutBandPara2}
                onChange={(e) => setForm({ ...form, aboutBandPara2: e.target.value })}
                placeholder="Our nationwide network supports more than 7,500 micro and small craft enterprises..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#8B2E24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Featured Image URL or Path
                </label>
                <input
                  type="text"
                  value={form.aboutBandImageUrl}
                  onChange={(e) => setForm({ ...form, aboutBandImageUrl: e.target.value })}
                  placeholder="/images/training_workshop.jpg"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Image Caption
                </label>
                <input
                  type="text"
                  value={form.aboutBandImageCaption}
                  onChange={(e) => setForm({ ...form, aboutBandImageCaption: e.target.value })}
                  placeholder="HAB artisan training workshop · Thimphu"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Button Call-to-Action Text
                </label>
                <input
                  type="text"
                  value={form.aboutBandCtaText}
                  onChange={(e) => setForm({ ...form, aboutBandCtaText: e.target.value })}
                  placeholder="Read about our programmes →"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Button Link Destination
                </label>
                <input
                  type="text"
                  value={form.aboutBandCtaLink}
                  onChange={(e) => setForm({ ...form, aboutBandCtaLink: e.target.value })}
                  placeholder="/programmes"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>
            </div>
          </div>
        )}

        {/* MEMBERSHIP TAB */}
        {tab === 'MEMBERSHIP' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Homepage Membership Callouts</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure the side-by-side cards inviting artisans to apply and buyers to search the member directory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Card: Member Directory */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Left Card (Directory / Find a Member)
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={form.membershipLeftTitle}
                    onChange={(e) => setForm({ ...form, membershipLeftTitle: e.target.value })}
                    placeholder="Find a member"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Narrative Blurb</label>
                  <textarea
                    rows={3}
                    value={form.membershipLeftText}
                    onChange={(e) => setForm({ ...form, membershipLeftText: e.target.value })}
                    placeholder="Connect directly with master craftspeople, verified weaving clusters, and traditional workshops across Bhutan."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={form.membershipLeftCtaText}
                      onChange={(e) => setForm({ ...form, membershipLeftCtaText: e.target.value })}
                      placeholder="Search member directory →"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Button Link</label>
                    <input
                      type="text"
                      value={form.membershipLeftCtaLink}
                      onChange={(e) => setForm({ ...form, membershipLeftCtaLink: e.target.value })}
                      placeholder="/members"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Right Card: Apply for Membership */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Right Card (Apply for Membership)
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={form.membershipRightTitle}
                    onChange={(e) => setForm({ ...form, membershipRightTitle: e.target.value })}
                    placeholder="Become a member"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Narrative Blurb</label>
                  <textarea
                    rows={3}
                    value={form.membershipRightText}
                    onChange={(e) => setForm({ ...form, membershipRightText: e.target.value })}
                    placeholder="Access product consignment in our central shop, participate in donor training programmes..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={form.membershipRightCtaText}
                      onChange={(e) => setForm({ ...form, membershipRightCtaText: e.target.value })}
                      placeholder="Apply for membership"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Button Link</label>
                    <input
                      type="text"
                      value={form.membershipRightCtaLink}
                      onChange={(e) => setForm({ ...form, membershipRightCtaLink: e.target.value })}
                      placeholder="/membership/apply"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
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
            <h2 className="text-base font-bold text-slate-900">Header Announcement Bar</h2>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="announcementOn"
                checked={form.isAnnouncementOn}
                onChange={(e) => setForm({ ...form, isAnnouncementOn: e.target.checked })}
                className="w-4 h-4 text-[#8B2E24] rounded"
              />
              <label htmlFor="announcementOn" className="text-sm font-medium text-slate-800">
                Display top utility bar notice across the public site
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Notice Text
              </label>
              <input
                type="text"
                value={form.announcementText}
                onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                placeholder="CSO/2011/043 · Handicrafts Association of Bhutan..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Notice Target Link (Optional)
              </label>
              <input
                type="text"
                value={form.announcementLink || ''}
                onChange={(e) => setForm({ ...form, announcementLink: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                placeholder="/about or external link"
              />
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {tab === 'CONTACT' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900">Secretariat Operational Directory</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Physical Secretariat Address
              </label>
              <input
                type="text"
                value={form.officeAddress}
                onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  General Office Landline
                </label>
                <input
                  type="text"
                  value={form.officePhone}
                  onChange={(e) => setForm({ ...form, officePhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Executive Director Direct Mobile
                </label>
                <input
                  type="text"
                  value={form.edPhone}
                  onChange={(e) => setForm({ ...form, edPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Marketing &amp; E-Shop Desk
                </label>
                <input
                  type="text"
                  value={form.marketingPhone}
                  onChange={(e) => setForm({ ...form, marketingPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Secretariat Email
                </label>
                <input
                  type="email"
                  value={form.officialEmail}
                  onChange={(e) => setForm({ ...form, officialEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
                />
              </div>
            </div>
          </div>
        )}

        {/* FOOTER TAB */}
        {tab === 'FOOTER' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900">Footer Disclaimers &amp; Accreditations</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Footer About Blurb
              </label>
              <textarea
                rows={3}
                value={form.footerAbout}
                onChange={(e) => setForm({ ...form, footerAbout: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                CSO Registration Notice
              </label>
              <input
                type="text"
                value={form.csoRegistration}
                onChange={(e) => setForm({ ...form, csoRegistration: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Copyright Text
              </label>
              <input
                type="text"
                value={form.copyrightText}
                onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Punakha Market Provenance Certification
              </label>
              <input
                type="text"
                value={form.punakhaMarketNotice}
                onChange={(e) => setForm({ ...form, punakhaMarketNotice: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#8B2E24]"
              />
            </div>
          </div>
        )}

        {/* PARTNERS TAB */}
        {tab === 'PARTNERS' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900">Partner &amp; Donor Organizations</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={partnerInput}
                onChange={(e) => setPartnerInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPartner(); } }}
                placeholder="Enter partner name (e.g. EU SWITCH-Asia, Helvetas)"
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={addPartner}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900 cursor-pointer"
              >
                Add Partner
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-3">
              {form.partnersList.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-full text-xs font-medium text-slate-800"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => removePartner(p)}
                    className="text-slate-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#8B2E24] hover:bg-[#72251D] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving changes...' : 'Save and publish'}
          </button>
        </div>
      </form>
    </div>
  );
}