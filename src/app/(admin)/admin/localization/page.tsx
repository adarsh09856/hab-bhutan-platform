'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  DollarSign,
  Languages,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Check,
  HelpCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLocalizationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    supportedCurrencies: ['USD', 'BTN'] as string[],
    supportedLanguages: ['en', 'dz'] as string[],
    fxRate: 84.0,
  });

  const [previewAmount, setPreviewAmount] = useState<number>(100);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1200);

    fetch('/api/admin/site-settings', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!isMounted) return;
        if (d?.setting) {
          setForm((prev) => ({
            ...prev,
            defaultCurrency: d.setting.defaultCurrency || 'USD',
            defaultLanguage: d.setting.defaultLanguage || 'en',
            supportedCurrencies: Array.isArray(d.setting.supportedCurrencies) ? d.setting.supportedCurrencies : ['USD', 'BTN'],
            supportedLanguages: Array.isArray(d.setting.supportedLanguages) ? d.setting.supportedLanguages : ['en', 'dz'],
            fxRate: Number(d.setting.fxRate) || 84.0,
          }));
          setLoading(false);
        } else {
          // Fallback to public site-settings
          fetch('/api/site-settings', { cache: 'no-store' })
            .then((res) => res.json())
            .then((pub) => {
              if (!isMounted) return;
              const s = pub?.setting || pub?.settings;
              if (s) {
                setForm((prev) => ({
                  ...prev,
                  defaultCurrency: s.defaultCurrency || 'USD',
                  defaultLanguage: s.defaultLanguage || 'en',
                  supportedCurrencies: Array.isArray(s.supportedCurrencies) ? s.supportedCurrencies : ['USD', 'BTN'],
                  supportedLanguages: Array.isArray(s.supportedLanguages) ? s.supportedLanguages : ['en', 'dz'],
                  fxRate: Number(s.fxRate) || 84.0,
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
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          defaultCurrency: form.defaultCurrency,
          defaultLanguage: form.defaultLanguage,
          supportedCurrencies: form.supportedCurrencies,
          supportedLanguages: form.supportedLanguages,
          fxRate: Number(form.fxRate) || 84.0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: '✓ Currency and Language settings successfully published and live across the entire website!',
        });

        // Trigger local storage and custom event update so header switchers update in real-time
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('hab_admin_currency_updated', Date.now().toString());
          window.dispatchEvent(new Event('hab_settings_updated'));
        }
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to save settings. Please try again.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Network error occurred while saving.',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleCurrency = (cur: string) => {
    if (form.supportedCurrencies.includes(cur)) {
      if (form.supportedCurrencies.length === 1) return; // Must keep at least one
      if (form.defaultCurrency === cur) {
        // Change default if disabling current default
        const remaining = form.supportedCurrencies.filter((c) => c !== cur);
        setForm({
          ...form,
          supportedCurrencies: remaining,
          defaultCurrency: remaining[0],
        });
        return;
      }
      setForm({ ...form, supportedCurrencies: form.supportedCurrencies.filter((c) => c !== cur) });
    } else {
      setForm({ ...form, supportedCurrencies: [...form.supportedCurrencies, cur] });
    }
  };

  const toggleLanguage = (lang: string) => {
    if (form.supportedLanguages.includes(lang)) {
      if (form.supportedLanguages.length === 1) return; // Must keep at least one
      if (form.defaultLanguage === lang) {
        const remaining = form.supportedLanguages.filter((l) => l !== lang);
        setForm({
          ...form,
          supportedLanguages: remaining,
          defaultLanguage: remaining[0],
        });
        return;
      }
      setForm({ ...form, supportedLanguages: form.supportedLanguages.filter((l) => l !== lang) });
    } else {
      setForm({ ...form, supportedLanguages: [...form.supportedLanguages, lang] });
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#8b2e24]/20 border-t-[#8b2e24] animate-spin mb-3" />
        <span className="text-xs font-mono">Loading Currency &amp; Language controls...</span>
      </div>
    );
  }

  const calculatedPreview = (previewAmount * (Number(form.fxRate) || 84)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#8b2e24]">
              <Globe className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Currency &amp; Language Settings</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Centrally manage baseline store currency ($ USD / Nu. BTN), primary language (English / རྫོང་ཁ Dzongkha), and conversion exchange rates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview Live Site
          </Link>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold admin-button-primary shadow-sm transition-all disabled:opacity-50 cursor-pointer font-bold"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving changes...' : 'Save & Publish Live'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold border shadow-sm animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
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
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Status Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#8b2e24]" /> Default Store Currency
          </span>
          <div className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-slate-900 text-xs font-mono font-bold border border-slate-300">
              {form.defaultCurrency}
            </span>
            <span>{form.defaultCurrency === 'USD' ? 'US Dollar ($)' : 'Bhutanese Ngultrum (Nu.)'}</span>
          </div>
          <p className="text-[11px] text-slate-500">Public baseline currency across catalog</p>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-emerald-700" /> Default Store Language
          </span>
          <div className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-mono font-bold border border-emerald-300">
              {form.defaultLanguage.toUpperCase()}
            </span>
            <span>{form.defaultLanguage === 'en' ? 'English' : 'རྫོང་ཁ (Dzongkha)'}</span>
          </div>
          <p className="text-[11px] text-slate-500">Default interface language for new visitors</p>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-sky-700" /> Active Conversion Rate
          </span>
          <div className="text-base font-bold text-slate-900 font-mono">
            1 USD = Nu. {Number(form.fxRate || 84).toFixed(2)} BTN
          </div>
          <p className="text-[11px] text-slate-500">Synchronized with checkout &amp; catalog</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: DEFAULT CURRENCY */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8b2e24] flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              1. Baseline Store Currency
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the primary currency that is displayed when visitors first arrive at your store.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* USD Card */}
            <div
              onClick={() => setForm({ ...form, defaultCurrency: 'USD' })}
              className={`p-5 rounded-xl border cursor-pointer transition-all relative select-none ${
                form.defaultCurrency === 'USD'
                  ? 'border-[#8b2e24] bg-slate-50 shadow-sm ring-2 ring-[#8b2e24]/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-[#8b2e24] flex items-center justify-center text-xs font-mono font-bold">
                    $
                  </span>
                  USD — United States Dollar
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  form.defaultCurrency === 'USD'
                    ? 'border-[#8b2e24] bg-[#8b2e24] text-white font-bold'
                    : 'border-slate-300'
                }`}>
                  {form.defaultCurrency === 'USD' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                International standard. Prices on the homepage, catalog, and product cards will show in <strong>USD ($)</strong> by default.
              </p>
              <div className="mt-3 text-[11px] text-[#8b2e24] font-mono bg-amber-100/70 px-2.5 py-1 rounded font-semibold inline-block">
                Example: $120.00 USD
              </div>
            </div>

            {/* BTN Card */}
            <div
              onClick={() => setForm({ ...form, defaultCurrency: 'BTN' })}
              className={`p-5 rounded-xl border cursor-pointer transition-all relative select-none ${
                form.defaultCurrency === 'BTN'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-mono font-bold">
                    Nu.
                  </span>
                  BTN — Bhutanese Ngultrum
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  form.defaultCurrency === 'BTN'
                    ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                    : 'border-slate-300'
                }`}>
                  {form.defaultCurrency === 'BTN' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                National currency of Bhutan. Prices across all items and checkouts will show in <strong>Ngultrum (Nu.)</strong> by default.
              </p>
              <div className="mt-3 text-[11px] text-emerald-800 font-mono bg-emerald-100/70 px-2.5 py-1 rounded font-semibold inline-block">
                Example: Nu. 10,080 BTN
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DEFAULT LANGUAGE */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
              <Languages className="w-4 h-4" />
              2. Baseline Store Language
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the initial language for text, buttons, headings, and notices on the public site.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* English Card */}
            <div
              onClick={() => setForm({ ...form, defaultLanguage: 'en' })}
              className={`p-5 rounded-xl border cursor-pointer transition-all relative select-none ${
                form.defaultLanguage === 'en'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-mono font-bold">
                    EN
                  </span>
                  English
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  form.defaultLanguage === 'en'
                    ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                    : 'border-slate-300'
                }`}>
                  {form.defaultLanguage === 'en' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard English interface across all public pages, navigation menus, product descriptions, and footer.
              </p>
            </div>

            {/* Dzongkha Card */}
            <div
              onClick={() => setForm({ ...form, defaultLanguage: 'dz' })}
              className={`p-5 rounded-xl border cursor-pointer transition-all relative select-none ${
                form.defaultLanguage === 'dz'
                  ? 'border-[#8b2e24] bg-slate-50 shadow-sm ring-2 ring-[#8b2e24]/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-[#8b2e24] flex items-center justify-center text-xs font-mono font-bold">
                    DZ
                  </span>
                  རྫོང་ཁ (Dzongkha)
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  form.defaultLanguage === 'dz'
                    ? 'border-[#8b2e24] bg-[#8b2e24] text-white font-bold'
                    : 'border-slate-300'
                }`}>
                  {form.defaultLanguage === 'dz' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                National language of Bhutan. Shows Dzongkha translations for primary navigation, headings, and cultural labels.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: EXCHANGE RATE (FX) PEG */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-sky-700 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              3. Foreign Exchange (FX) Conversion Rate Peg
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set how many Bhutanese Ngultrum (Nu.) equal 1 United States Dollar ($ USD).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1 items-start">
            <div className="lg:col-span-6 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                1 USD = ? BTN (Ngultrum)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm">
                  Nu.
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="500"
                  value={form.fxRate}
                  onChange={(e) => setForm({ ...form, fxRate: parseFloat(e.target.value) || 84.0 })}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#8b2e24]/20 focus:border-[#8b2e24] transition-all shadow-sm"
                  placeholder="84.00"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Official RMA benchmark rate typically hovers between <strong>83.00 - 86.00</strong>. When updated here, product conversions across the entire site instantly update without restarting the server.
              </p>
            </div>

            {/* Live Interactive Conversion Calculator */}
            <div className="lg:col-span-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Live Conversion Simulator</span>
                <span className="text-[10px] text-sky-700 font-mono font-semibold">Real-time</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500 text-xs">$</span>
                  <input
                    type="number"
                    min="1"
                    value={previewAmount}
                    onChange={(e) => setPreviewAmount(Math.max(1, Number(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-900 font-mono shadow-sm"
                  />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 flex-none" />
                <div className="flex-1 bg-sky-50 border border-sky-200 rounded-lg px-3 py-1.5 text-xs font-mono text-sky-900 font-bold">
                  Nu. {calculatedPreview}
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                A customer viewing a ${previewAmount} USD craft piece will pay Nu. {calculatedPreview} BTN when switching currency.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 4: ENABLED OPTIONS IN PUBLIC HEADER */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              4. Public Header Dropdown Options
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose which options appear for public visitors in the top header switcher.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
            {/* Currencies available to visitors */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-700">
                Currencies enabled in header dropdown:
              </label>
              <div className="space-y-2">
                {[
                  { code: 'USD', name: 'US Dollar ($)', note: 'Recommended for worldwide buyers' },
                  { code: 'BTN', name: 'Bhutanese Ngultrum (Nu.)', note: 'Recommended for local buyers & mBOB' },
                  { code: 'EUR', name: 'Euro (€)', note: 'European visitors' },
                  { code: 'GBP', name: 'British Pound (£)', note: 'UK visitors' },
                  { code: 'INR', name: 'Indian Rupee (₹)', note: 'Regional visitors (1:1 with BTN)' },
                ].map((cur) => {
                  const isChecked = form.supportedCurrencies.includes(cur.code);
                  return (
                    <label
                      key={cur.code}
                      onClick={() => toggleCurrency(cur.code)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-indigo-300 bg-indigo-50/60 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 mr-2">{cur.code}</span>
                        <span className="text-slate-700">{cur.name}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{cur.note}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Languages available to visitors */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-700">
                Languages enabled in header dropdown:
              </label>
              <div className="space-y-2">
                {[
                  { code: 'en', name: 'English (EN)', note: 'Primary international language' },
                  { code: 'dz', name: 'རྫོང་ཁ Dzongkha (DZ)', note: 'National language of the Kingdom of Bhutan' },
                ].map((lang) => {
                  const isChecked = form.supportedLanguages.includes(lang.code);
                  return (
                    <label
                      key={lang.code}
                      onClick={() => toggleLanguage(lang.code)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-indigo-300 bg-indigo-50/60 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 mr-2">{lang.code.toUpperCase()}</span>
                        <span className="text-slate-700">{lang.name}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{lang.note}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BAR */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Ready to publish changes?
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Saving updates the public site in real-time. No server restart required.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold admin-button-primary shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Publishing changes...' : 'Save & Publish Live'}
          </button>
        </div>
      </form>
    </div>
  );
}
