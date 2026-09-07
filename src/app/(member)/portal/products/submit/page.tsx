'use client';

import React, { useState } from 'react';
import { PackagePlus, UploadCloud, Info, CheckCircle, Shield } from 'lucide-react';
import { CRAFTS } from '@/lib/data';

export default function MemberSubmitProductPage() {
  const [name, setName] = useState('');
  const [craftId, setCraftId] = useState('thag-zo');
  const [materials, setMaterials] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [artisanPayout, setArtisanPayout] = useState<number>(120);
  const [provenance, setProvenance] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Suggested retail is calculated as payout / 0.8 (since artisan gets 80%, association retains 20% operating share)
  const suggestedRetail = Math.round(artisanPayout / 0.8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Consignment Intake Submitted</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your product dossier for <strong>{name}</strong> has been routed to the HAB Curatorial Quality Committee.
          Upon physical inspection at the Thimphu Vault, it will be catalogued, photographed, and listed on the international store.
        </p>
        <div className="pt-2">
          <button 
            onClick={() => {
              setSubmitted(false);
              setName('');
              setMaterials('');
              setDimensions('');
              setProvenance('');
            }}
            className="px-4 py-2 bg-amber-700 text-white rounded text-xs font-semibold hover:bg-amber-800"
          >
            Submit Another Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <PackagePlus className="w-5 h-5 text-amber-700" />
          Consignment Product Intake & Curation Dossier
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit authentic masterworks for global international exhibition and e-commerce distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Intake Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Artwork / Product Name *
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. Kushuthara Silk Kira (Woven in Radhi)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-xs outline-none focus:border-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Zorig Chusum Craft Discipline *
              </label>
              <select 
                value={craftId}
                onChange={(e) => setCraftId(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs bg-white outline-none focus:border-amber-600"
              >
                {CRAFTS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.dzongkha})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dimensions / Sizing *
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. 250 × 120 cm or 18 × 12 cm"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Materials & Indigenous Dyes Used *
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. 100% Wild raw silk (Bura), wild madder root (tsod), walnut bark"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-xs outline-none focus:border-amber-600"
            />
          </div>

          {/* Pricing Model */}
          <div className="p-4 bg-amber-50/50 rounded border border-amber-200 space-y-3">
            <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Consignment Fair-Trade Remittance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Artisan Net Payout Expected (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs">$</span>
                  <input 
                    type="number"
                    min="10"
                    required
                    value={artisanPayout}
                    onChange={(e) => setArtisanPayout(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded pl-7 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-amber-600"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  You receive 80% of final retail sale value.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calculated Global List Price
                </label>
                <div className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-amber-900">
                  ${suggestedRetail.toFixed(2)} USD
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Includes 20% HAB marketing, customs & insurance vault fee.
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Provenance & Artisan Narrative *
            </label>
            <textarea 
              rows={4}
              required
              placeholder="Describe the cultural motif, the village weavers involved, the time taken to weave/carve, and traditional significance..."
              value={provenance}
              onChange={(e) => setProvenance(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-xs outline-none focus:border-amber-600 resize-none"
            />
          </div>

          {/* Photo Dropzone Mock */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              High-Resolution Photographs (1:1 Ratio Preferred)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-amber-600 transition-colors cursor-pointer bg-slate-50/50">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">Drag and drop masterwork photos or click to browse</p>
              <p className="text-[11px] text-slate-400 mt-1">JPEG, PNG, WebP up to 10MB each</p>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold text-xs shadow-sm transition-colors"
            >
              Submit Product for Curatorial Review
            </button>
          </div>
        </form>

        {/* Right: Quality Criteria */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-700" /> Curatorial Standards
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
              <li>Must be 100% handcrafted within the Kingdom of Bhutan.</li>
              <li>Indigenous vegetable/mineral dyes given precedence over synthetic chemical dyes.</li>
              <li>No commercial plastic or non-biodegradable synthetic warps permitted.</li>
              <li>Physical delivery to HAB Vault in Thimphu is required before international activation.</li>
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-500" /> Vault Intake Schedule
            </p>
            <p>
              Deliveries accepted Monday through Friday, 9:00 AM – 4:00 PM at HAB House, Drentoen Lam, Thimphu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
