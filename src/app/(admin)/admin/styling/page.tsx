'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Type, 
  Sliders, 
  Eye, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  Layers,
  ZoomIn
} from 'lucide-react';

export default function TypographyStylingPage() {
  const [globalScale, setGlobalScale] = useState<number>(1.0);
  const [voice, setVoice] = useState<'heritage' | 'editorial' | 'institutional'>('heritage');
  const [homeScale, setHomeScale] = useState<number>(1.0);
  const [aboutScale, setAboutScale] = useState<number>(1.0);
  const [shopScale, setShopScale] = useState<number>(1.0);
  const [programmesScale, setProgrammesScale] = useState<number>(1.0);
  const [publicationsScale, setPublicationsScale] = useState<number>(1.0);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // 1. Check localStorage for instant values
    try {
      const g = localStorage.getItem('hab_font_scale');
      if (g) setGlobalScale(parseFloat(g));
      const v = localStorage.getItem('hab.tweaks.voice');
      if (v) setVoice(v as any);
      const h = localStorage.getItem('hab_scale_home');
      if (h) setHomeScale(parseFloat(h));
      const a = localStorage.getItem('hab_scale_about');
      if (a) setAboutScale(parseFloat(a));
      const s = localStorage.getItem('hab_scale_shop');
      if (s) setShopScale(parseFloat(s));
      const pr = localStorage.getItem('hab_scale_programmes');
      if (pr) setProgrammesScale(parseFloat(pr));
      const pb = localStorage.getItem('hab_scale_publications');
      if (pb) setPublicationsScale(parseFloat(pb));
    } catch {}

    // 2. Fetch server-persisted settings
    fetch('/api/admin/site-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const styling = d?.setting?.paymentGateways?.styling;
        if (styling) {
          if (styling.globalScale) setGlobalScale(styling.globalScale);
          if (styling.voice) setVoice(styling.voice);
          if (styling.homeScale) setHomeScale(styling.homeScale);
          if (styling.aboutScale) setAboutScale(styling.aboutScale);
          if (styling.shopScale) setShopScale(styling.shopScale);
          if (styling.programmesScale) setProgrammesScale(styling.programmesScale);
          if (styling.publicationsScale) setPublicationsScale(styling.publicationsScale);
        }
      })
      .catch(() => {});
  }, []);

  const handleApplyPreset = (scale: number) => {
    setGlobalScale(scale);
    setHomeScale(scale);
    setAboutScale(scale);
    setShopScale(scale);
    setProgrammesScale(scale);
    setPublicationsScale(scale);
  };

  const handleReset = async () => {
    setGlobalScale(1.0);
    setVoice('heritage');
    setHomeScale(1.0);
    setAboutScale(1.0);
    setShopScale(1.0);
    setProgrammesScale(1.0);
    setPublicationsScale(1.0);

    try {
      localStorage.removeItem('hab_font_scale');
      localStorage.removeItem('hab.tweaks.voice');
      localStorage.removeItem('hab_scale_home');
      localStorage.removeItem('hab_scale_about');
      localStorage.removeItem('hab_scale_shop');
      localStorage.removeItem('hab_scale_programmes');
      localStorage.removeItem('hab_scale_publications');
      document.documentElement.style.removeProperty('--hab-font-scale');

      await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentGateways: {
            styling: {
              globalScale: 1.0,
              voice: 'heritage',
              homeScale: 1.0,
              aboutScale: 1.0,
              shopScale: 1.0,
              programmesScale: 1.0,
              publicationsScale: 1.0,
            },
          },
        }),
      });
    } catch {}

    showToast('success', 'Reset all text sizes and styling to 100% factory baseline.');
  };


  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save to localStorage for instant local preview
      localStorage.setItem('hab_font_scale', String(globalScale));
      localStorage.setItem('hab.tweaks.voice', voice);
      localStorage.setItem('hab_scale_home', String(homeScale));
      localStorage.setItem('hab_scale_about', String(aboutScale));
      localStorage.setItem('hab_scale_shop', String(shopScale));
      localStorage.setItem('hab_scale_programmes', String(programmesScale));
      localStorage.setItem('hab_scale_publications', String(publicationsScale));

      // 2. Save site-wide to SiteSetting
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentGateways: {
            styling: {
              globalScale,
              voice,
              homeScale,
              aboutScale,
              shopScale,
              programmesScale,
              publicationsScale,
            },
          },
        }),
      });

      if (res.ok) {
        showToast('success', 'Typography scales saved and applied site-wide!');
      } else {
        showToast('error', 'Saved locally, but failed to sync to database.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error saving typography.');
    } finally {
      setSaving(false);
    }
  };

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

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Type className="w-4 h-4" />
            <span>Site Customization &amp; Accessibility</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Typography &amp; Text Size Styler
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Control the font sizing, editorial typographic voice, and legibility across all pages of the public storefront with real-time preview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B2E24] hover:bg-[#73241c] text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Applying...' : 'Save & Apply Site-Wide'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Preset Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">1. Global Size Presets</h2>
            <p className="text-xs text-slate-500">
              Select an overarching scaling factor that applies proportionately across headings and body copy.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleApplyPreset(0.92)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  globalScale === 0.92
                    ? 'border-[#8B2E24] bg-slate-50 text-[#8B2E24] ring-2 ring-[#8B2E24]/20 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-xs uppercase tracking-wider block font-mono">Compact</span>
                <span className="text-lg font-extrabold block mt-0.5">92%</span>
                <span className="text-[10.5px] text-slate-400 block mt-1">Dense / Catalog view</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset(1.0)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  globalScale === 1.0
                    ? 'border-[#8B2E24] bg-slate-50 text-[#8B2E24] ring-2 ring-[#8B2E24]/20 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-xs uppercase tracking-wider block font-mono">Standard</span>
                <span className="text-lg font-extrabold block mt-0.5">100%</span>
                <span className="text-[10.5px] text-slate-400 block mt-1">Default canonical</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset(1.10)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  globalScale === 1.10
                    ? 'border-[#8B2E24] bg-slate-50 text-[#8B2E24] ring-2 ring-[#8B2E24]/20 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-xs uppercase tracking-wider block font-mono">High Legibility</span>
                <span className="text-lg font-extrabold block mt-0.5">110%</span>
                <span className="text-[10.5px] text-slate-400 block mt-1">Elder / Readability</span>
              </button>
            </div>
          </div>

          {/* Voice selector */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              2. Typographic Voice
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setVoice('heritage')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  voice === 'heritage'
                    ? 'border-[#8B2E24] bg-slate-50 text-[#8B2E24] ring-1 ring-[#8B2E24]/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="font-bold block text-sm">Heritage</span>
                <span className="text-xs text-slate-500 block mt-1 font-serif">Marcellus &amp; Lora</span>
              </button>

              <button
                type="button"
                onClick={() => setVoice('editorial')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  voice === 'editorial'
                    ? 'border-[#8B2E24] bg-slate-50 text-[#8B2E24] ring-1 ring-[#8B2E24]/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="font-bold block text-sm">Editorial</span>
                <span className="text-xs text-slate-500 block mt-1 font-serif">Curated magazine tone</span>
              </button>

              <button
                type="button"
                onClick={() => setVoice('institutional')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  voice === 'institutional'
                    ? 'border-[#8B2E24] bg-slate-50 text-[#8B2E24] ring-1 ring-[#8B2E24]/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="font-bold block text-sm">Institutional</span>
                <span className="text-xs text-slate-500 block mt-1 font-sans">Figtree clean modern</span>
              </button>
            </div>
          </div>

          {/* Independent Page Multipliers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">3. Independent Page Multipliers</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fine-tune the relative font scale of specific pages individually.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Homepage Sizing</span>
                  <span className="font-mono text-[#8B2E24]">{Math.round(homeScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.25"
                  step="0.01"
                  value={homeScale}
                  onChange={(e) => setHomeScale(parseFloat(e.target.value))}
                  className="w-full accent-[#8B2E24] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>About Us Page Sizing</span>
                  <span className="font-mono text-[#8B2E24]">{Math.round(aboutScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.25"
                  step="0.01"
                  value={aboutScale}
                  onChange={(e) => setAboutScale(parseFloat(e.target.value))}
                  className="w-full accent-[#8B2E24] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Shop &amp; Products Sizing</span>
                  <span className="font-mono text-[#8B2E24]">{Math.round(shopScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.25"
                  step="0.01"
                  value={shopScale}
                  onChange={(e) => setShopScale(parseFloat(e.target.value))}
                  className="w-full accent-[#8B2E24] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Training Programmes Sizing</span>
                  <span className="font-mono text-[#8B2E24]">{Math.round(programmesScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.25"
                  step="0.01"
                  value={programmesScale}
                  onChange={(e) => setProgrammesScale(parseFloat(e.target.value))}
                  className="w-full accent-[#8B2E24] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Publications &amp; Reports Sizing</span>
                  <span className="font-mono text-[#8B2E24]">{Math.round(publicationsScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.25"
                  step="0.01"
                  value={publicationsScale}
                  onChange={(e) => setPublicationsScale(parseFloat(e.target.value))}
                  className="w-full accent-[#8B2E24] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Real-Time Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs sticky top-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#8B2E24]" />
                <h3 className="text-sm font-bold text-slate-900">Live Typography Preview</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Scale: {Math.round(globalScale * 100)}%
              </span>
            </div>

            {/* Preview Box styled as crisp clean light preview surface */}
            <div
              className="p-5 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xs transition-all space-y-3"
              style={{
                fontSize: `${14 * globalScale}px`,
                fontFamily: voice === 'institutional' ? 'Figtree, sans-serif' : 'Lora, Georgia, serif',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8B2E24] text-white">
                  HAB Validated
                </span>
                <span className="text-xs text-slate-500 font-mono">Thimphu, Bhutan</span>
              </div>

              <h4
                className="font-bold leading-tight text-slate-900"
                style={{
                  fontSize: `${20 * globalScale}px`,
                  fontFamily: voice === 'institutional' ? 'Figtree, sans-serif' : 'Marcellus, serif',
                }}
              >
                Handcrafted Textiles &amp; Woodturning of Zorig Chusum
              </h4>

              <p className="leading-relaxed text-slate-600">
                Handicrafts Association of Bhutan stewards indigenous master craftsmanship across all twenty dzongkhags. Every piece is validated for traditional authenticity and fair artisan compensation.
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="font-bold text-[#8B2E24]">Nu. 2,850 · $34.00</span>
                <span className="text-xs text-[#8B2E24] underline font-medium">Explore Details →</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">How this works:</p>
              <p>
                Clicking &quot;Save &amp; Apply Site-Wide&quot; writes these scaling parameters to the root CSS stylesheet so visitors see your adjusted text sizes automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
