'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';

const DZONGKHAGS = [
  'Bumthang', 'Chukha', 'Dagana', 'Gasa', 'Haa', 'Lhuentse',
  'Mongar', 'Paro', 'Pema Gatshel', 'Punakha', 'Samdrup Jongkhar',
  'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashi Yangtse',
  'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'
];

export default function WorkshopProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    dzongkhag: 'Thimphu',
    cidNumber: '',
    businessLicense: '',
    portraitUrl: '',
    bio: '',
  });

  const [craftName, setCraftName] = useState('');
  const [regNumber, setRegNumber] = useState('');

  useEffect(() => {
    fetch('/api/member/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data?.member) {
          const m = data.member;
          setForm({
            name: m.name || '',
            dzongkhag: m.dzongkhag || 'Thimphu',
            cidNumber: m.cidNumber || '',
            businessLicense: m.businessLicense || '',
            portraitUrl: m.portraitUrl || '',
            bio: m.bio || '',
          });
          setCraftName(m.craft?.name || 'Traditional Craft');
          setRegNumber(m.regNumber || '');
        }
      })
      .catch((err) => {
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Workshop profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Network error occurred while saving.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-2 text-sm text-[#6B5A4C]">
          <div className="inline-block w-6 h-6 border-2 border-[#8B2E24] border-t-transparent rounded-full animate-spin"></div>
          <div>Loading Profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="font-mono text-xs text-[#8B2E24] uppercase tracking-wider mb-1">
          Artisan Credentials &amp; Registry
        </div>
        <h1 className="font-marcellus text-2xl sm:text-3xl text-[#2E221B]">
          Workshop &amp; Artisan Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#6B5A4C] mt-1">
          Keep your master craftsperson credentials, workshop biography, and dzongkhag location updated for authentication by the Secretariat.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-[8px] text-xs sm:text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Read-only Accreditation Tag */}
      <div className="bg-[#F5F0E6] border border-[#E5DDD0] rounded-[10px] p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-[#6B5A4C] block">Accredited Craft Tradition</span>
          <span className="font-bold text-sm text-[#2E221B]">{craftName}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#6B5A4C] block">Registration Number</span>
          <span className="font-mono font-bold text-sm text-[#8B2E24]">{regNumber}</span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E5DDD0] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#2E221B] mb-1.5">
              Artisan / Workshop Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm focus:outline-none focus:border-[#8B2E24]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2E221B] mb-1.5">
              Dzongkhag *
            </label>
            <select
              value={form.dzongkhag}
              onChange={(e) => setForm({ ...form, dzongkhag: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm focus:outline-none focus:border-[#8B2E24] bg-white"
            >
              {DZONGKHAGS.map((dz) => (
                <option key={dz} value={dz}>
                  {dz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2E221B] mb-1.5">
              Citizenship ID (CID Number) *
            </label>
            <input
              type="text"
              required
              value={form.cidNumber}
              onChange={(e) => setForm({ ...form, cidNumber: e.target.value })}
              placeholder="e.g. 11502001923"
              className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm font-mono focus:outline-none focus:border-[#8B2E24]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2E221B] mb-1.5">
              Business / Cottage Trade License (Optional)
            </label>
            <input
              type="text"
              value={form.businessLicense}
              onChange={(e) => setForm({ ...form, businessLicense: e.target.value })}
              placeholder="e.g. RGoB-CSI-2024-8841"
              className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm font-mono focus:outline-none focus:border-[#8B2E24]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2E221B] mb-1.5">
            Artisan Portrait or Workshop Photo URL
          </label>
          <input
            type="url"
            value={form.portraitUrl}
            onChange={(e) => setForm({ ...form, portraitUrl: e.target.value })}
            placeholder="https://example.com/artisan-photo.jpg"
            className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm focus:outline-none focus:border-[#8B2E24]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2E221B] mb-1.5">
            Artisan Biography &amp; Craft Pedigree *
          </label>
          <textarea
            rows={5}
            required
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Describe your craft training, master teachers, indigenous materials used, and years practising in your community..."
            className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#D5CBBF] text-xs sm:text-sm focus:outline-none focus:border-[#8B2E24]"
          />
        </div>

        <div className="pt-3 border-t border-[#E5DDD0] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#2E221B] hover:bg-[#8B2E24] text-white px-6 py-2.5 rounded-[8px] text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
