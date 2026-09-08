'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const perks = [
    'point-of-sale (POS) cashiering & retail bazaar sales',
    'live catalog inventory & craft maker accreditation',
    'international order dispatch & EMS tracking numbers',
    'artisan directory & membership dossier intake',
    'financial statements & bilateral grant reporting',
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter your staff email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: identifier, password }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(data.redirectUrl || '/admin');
      } else {
        const err = await res.json();
        setErrorMsg(err.error || err.message || 'Invalid credentials. Please verify and try again.');
      }
    } catch {
      setErrorMsg('Authentication server currently unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-[1080px] min-w-[1080px] mx-auto px-10 py-20">
      <div className="grid grid-cols-2 gap-11 items-center">
        {/* Left: Mission & Operations Overview */}
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-4">
            Secretariat Operations Suite
          </div>
          <h1 className="font-marcellus text-[40px] font-normal leading-[1.1] text-[#33261F] mb-6">
            Staff &amp; Operations Sign In
          </h1>
          <p className="font-lora text-[16.5px] leading-[1.6] text-[#4A3C33] mb-8">
            Access the central management console for the Handicrafts Association of Bhutan — oversee physical POS retail, e-commerce orders, artisan registries, and donor projects.
          </p>

          <div className="flex flex-col gap-3.5">
            {perks.map((perk) => (
              <div key={perk} className="flex gap-3 items-start text-[14.5px] font-lora text-[#33261F]">
                <span className="text-[#8B2E24] font-bold">—</span>
                <span className="capitalize">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-9">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {errorMsg && (
              <div className="p-3.5 rounded-[8px] bg-red-50 border border-red-200 text-red-700 text-[13.5px] font-figtree">
                {errorMsg}
              </div>
            )}

            {/* Quick Demo Login */}
            <div className="bg-[#F8F5EE] border border-[#E3D9C9] rounded-[8px] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8B2E24] font-bold">
                  Demo Quick Login
                </span>
                <span className="text-[10px] text-[#6B5A4C]">Click to auto-fill</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('admin@handicraftsbhutan.org');
                  setPassword('AdminSecure2026!');
                }}
                className="w-full px-3 py-2.5 text-left rounded bg-white border border-[#D5C9B5] hover:border-[#8B2E24] hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <p className="text-[13px] font-bold text-[#33261F]">
                    👑 Secretariat Super Admin
                  </p>
                  <span className="text-[10px] font-mono bg-[#EFF0E4] text-[#4C6B41] px-1.5 py-0.5 rounded font-bold">Full Access</span>
                </div>
                <p className="text-[11px] text-[#6B5A4C] font-mono mt-0.5">admin@handicraftsbhutan.org • AdminSecure2026!</p>
              </button>
            </div>

            <div>
              <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@handicraftsbhutan.org"
                className="w-full h-[46px] px-3.5 bg-white border border-[#D5C9B5] rounded-[7px] font-figtree text-[15px] text-[#33261F] outline-none focus:border-[#8B2E24] transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-figtree font-bold text-[14px] text-[#33261F]">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-[46px] px-3.5 bg-white border border-[#D5C9B5] rounded-[7px] font-figtree text-[15px] text-[#33261F] outline-none focus:border-[#8B2E24] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-[#8B2E24] text-[#FFFCF8] rounded-[7px] font-figtree font-bold text-[15px] hover:bg-[#6D241C] transition-colors disabled:opacity-50 mt-1 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign in to Secretariat CRM'}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-[13px] font-figtree text-[#6B5A4C] hover:text-[#33261F] underline"
              >
                ← Return to public website
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
