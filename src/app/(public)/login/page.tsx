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
    'order history and consignment statements',
    'submit new products for the HAB shop',
    'download training material and publications',
    'apply to trade fairs and buyer meetings',
    'renew annual dues online',
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter your membership number/email and password.');
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
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        } else if (data.user?.roleSlug === 'super_admin' || data.user?.roleSlug === 'staff_operator') {
          router.push('/admin');
        } else {
          router.push('/portal/dashboard');
        }
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
        {/* Left: Mission & Benefits */}
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#8B2E24] mb-4">
            Members-Only Area
          </div>
          <h1 className="font-marcellus text-[40px] font-normal leading-[1.1] text-[#33261F] mb-6">
            Sign in to your member account
          </h1>
          <p className="font-lora text-[16.5px] leading-[1.6] text-[#4A3C33] mb-8">
            Manage your artisanal business, submit collections for retail consignment, and access institutional resources.
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

            <div>
              <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                Membership number or email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="HAB-2026-… or you@example.bt"
                className="w-full bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree outline-none"
              />
            </div>

            <div>
              <label className="font-figtree font-bold text-[14px] text-[#33261F] block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] p-3 text-[14px] font-figtree outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-figtree font-semibold text-[15px] bg-[#8B2E24] text-white py-3.5 rounded-[8px] hover:bg-[#6E241C] transition-colors cursor-pointer mt-2 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Log in'}
            </button>

            <div className="flex justify-between items-center text-[13.5px] font-figtree pt-4 border-t border-[#EFE9DE]">
              <Link href="/about#contact" className="text-[#6B5A4C] hover:underline">
                Forgot password?
              </Link>
              <Link href="/membership/apply" className="text-[#8B2E24] font-semibold hover:underline">
                Not a member yet? Apply
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
