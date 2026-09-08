'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MemberLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const perks = [
    'View your verified craft products in the public e-shop',
    'Track domestic & international customer order consignments',
    'Manage your artisan workshop profile & dzongkhag accreditation',
    'Access association newsletters, sector reports & training notices',
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter your registered email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: identifier, password, targetPortal: 'member' }),
      });

      if (res.ok) {
        const data = await res.json();
        window.location.href = data.redirectUrl || '/portal';
      } else {
        const err = await res.json();
        setErrorMsg(err.error || err.message || 'Invalid member credentials. Please verify and try again.');
      }
    } catch {
      setErrorMsg('Authentication server currently unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Column: Member Services Overview */}
        <div>
          <div className="font-mono text-[11.5px] tracking-[0.16em] uppercase text-[#8B2E24] mb-4">
            Artisan Guild &amp; Member Portal
          </div>
          <h1 className="font-marcellus text-2xl sm:text-3xl lg:text-[38px] font-normal leading-[1.15] text-[#33261F] mb-4 sm:mb-5">
            Member &amp; Artisan Sign In
          </h1>
          <p className="font-lora text-sm sm:text-[16px] leading-[1.65] text-[#4A3C33] mb-6 sm:mb-8">
            Welcome back to the Handicrafts Association of Bhutan member services portal. Access your accredited artisan profile, review consignment order history, and stay connected with association activities.
          </p>

          <div className="flex flex-col gap-3.5 mb-6 sm:mb-8">
            {perks.map((perk) => (
              <div key={perk} className="flex gap-3 items-start text-xs sm:text-[14.5px] font-lora text-[#33261F]">
                <span className="text-[#8B2E24] font-bold">—</span>
                <span>{perk}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-[8px] bg-[#F8F5EE] border border-[#E3D9C9] text-xs sm:text-[13.5px] text-[#6B5A4C] font-figtree">
            <span className="font-bold text-[#33261F]">Not yet a member? </span>
            Artisans, master craftspeople, and community cooperatives across Bhutan are welcome to{' '}
            <Link href="/membership/apply" className="text-[#8B2E24] font-semibold hover:underline">
              apply for membership
            </Link>.
          </div>
        </div>

        {/* Right Column: Member Sign In Card */}
        <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-5 sm:p-9 shadow-sm">
          <div className="mb-6">
            <h2 className="font-figtree font-bold text-base sm:text-[18px] text-[#33261F]">
              Sign In to Your Account
            </h2>
            <p className="text-[13.5px] text-[#6B5A4C] mt-1 font-figtree">
              Enter the email address and password associated with your membership.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {errorMsg && (
              <div className="p-3.5 rounded-[8px] bg-red-50 border border-red-200 text-red-700 text-[13.5px] font-figtree">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                Registered Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="artisan@domain.bt"
                className="w-full h-[46px] px-3.5 bg-white border border-[#D5C9B5] rounded-[7px] font-figtree text-[15px] text-[#33261F] outline-none focus:border-[#8B2E24] transition-colors"
              />
            </div>

            <div>
              <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-[46px] px-3.5 bg-white border border-[#D5C9B5] rounded-[7px] font-figtree text-[15px] text-[#33261F] outline-none focus:border-[#8B2E24] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-[#8B2E24] text-[#FFFCF8] rounded-[7px] font-figtree font-bold text-[15px] hover:bg-[#6D241C] transition-colors disabled:opacity-50 mt-1 cursor-pointer shadow-sm"
            >
              {loading ? 'Authenticating...' : 'Sign in to Member Portal'}
            </button>

            <div className="flex flex-col gap-2.5 pt-2 text-center text-[13px] font-figtree text-[#6B5A4C]">
              <Link
                href="/"
                className="hover:text-[#33261F] underline"
              >
                ← Return to public website
              </Link>
              <div className="pt-2 border-t border-[#EAE3D7]">
                <Link
                  href="/admin/login"
                  className="text-[12px] text-[#8A7767] hover:text-[#8B2E24]"
                >
                  Secretariat Staff &amp; Operations Sign In →
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
