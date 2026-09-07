'use client';

import React, { useState } from 'react';
import { User, Save, CheckCircle, Clock, ExternalLink, Shield } from 'lucide-react';
import Link from 'next/link';

export default function MemberProfileEditPage() {
  const [name, setName] = useState('Choki Weaving House');
  const [leadArtisan, setLeadArtisan] = useState('Choki Wangmo');
  const [dzongkhag, setDzongkhag] = useState('Thimphu');
  const [gewog, setGewog] = useState('Chang');
  const [village, setVillage] = useState('Kawang');
  const [phone, setPhone] = useState('+975 2 324 819');
  const [email, setEmail] = useState('choki.weaving@druknet.bt');
  const [bio, setBio] = useState(
    'Choki Weaving House was established in 1998 to preserve the intricate supplementary-weft patterns of Eastern Bhutan. We operate 14 backstrap and frame looms in Thimphu, employing 28 master weavers and apprentices. Specializing in pure wild silk (Bura) and Kishuthara ceremonial textiles using natural dyes harvested from madder root, walnut rind, and lac.'
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-700" />
            Public Directory Profile & Master Artisan Story
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your public profile displayed on the global member directory at /members/choki-weaving-house.
          </p>
        </div>
        <div>
          <Link
            href="/members/choki-weaving-house"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 border border-slate-300 rounded shadow-sm hover:bg-slate-50"
          >
            View Live Public Page <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {submitted && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">Profile Updates Submitted for Re-Verification</p>
            <p className="text-amber-800 mt-0.5">
              Per HAB Constitution Art. 4, significant alterations to master artisan biographies or workshop addresses undergo brief staff review before syncing to the live directory.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Enterprise / Workshop Name *</label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lead Master Craftsman / Founder *</label>
            <input 
              type="text"
              required
              value={leadArtisan}
              onChange={(e) => setLeadArtisan(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dzongkhag (District) *</label>
            <input 
              type="text"
              required
              value={dzongkhag}
              onChange={(e) => setDzongkhag(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gewog & Village *</label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text"
                placeholder="Gewog"
                value={gewog}
                onChange={(e) => setGewog(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-amber-600"
              />
              <input 
                type="text"
                placeholder="Village"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Public Telephone / Mobile *</label>
            <input 
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 font-mono outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Public Email *</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 font-mono outline-none focus:border-amber-600"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block font-semibold text-slate-700 mb-1">
            Artisan Biography & Craft Heritage Narrative *
          </label>
          <textarea 
            rows={5}
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border border-slate-300 rounded p-3 outline-none focus:border-amber-600 resize-none font-sans leading-relaxed"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            This narrative is displayed to international buyers, collectors, and researchers on your public page.
          </span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button 
            type="submit"
            className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold text-xs shadow-sm inline-flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4" /> Submit Updates for Curation
          </button>
        </div>
      </form>
    </div>
  );
}
