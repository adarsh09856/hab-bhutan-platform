'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, ShieldCheck, Truck, ArrowRight, UserPlus, Package } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const customerPerks = [
    'Track domestic & international craft order consignments in real time',
    'Manage delivery addresses and order history in one secure dashboard',
    'Verify authenticity certificates issued by Handicrafts Association of Bhutan',
    'Seamless express checkout for Bhutanese handcrafted creations',
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
        body: JSON.stringify({ 
          email: identifier.trim(), 
          password,
          redirectUrl: redirectParam || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const target = redirectParam || data.redirectUrl || '/account';
        window.location.href = target;
      } else {
        const err = await res.json();
        setErrorMsg(err.error || err.message || 'Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setErrorMsg('Authentication server currently unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      {/* Left Column: Account Benefits & Quick Links */}
      <div>
        <div className="font-mono text-[11.5px] tracking-[0.16em] uppercase text-[#8B2E24] mb-3">
          Handicrafts Association of Bhutan
        </div>
        <h1 className="font-marcellus text-2xl sm:text-3xl lg:text-[38px] font-normal leading-[1.15] text-[#33261F] mb-4">
          Sign In to Your Account
        </h1>
        <p className="font-lora text-sm sm:text-[15.5px] leading-[1.65] text-[#4A3C33] mb-6">
          Access your customer order history, track DHL &amp; Bhutan Post consignments, or manage your accredited artisan guild membership.
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {customerPerks.map((perk, idx) => (
            <div key={idx} className="flex gap-3 items-start text-xs sm:text-[14px] font-lora text-[#33261F]">
              <span className="text-[#8B2E24] font-bold">—</span>
              <span>{perk}</span>
            </div>
          ))}
        </div>

        {/* Action Callouts */}
        <div className="space-y-3">
          <div className="p-4 rounded-[10px] bg-[#F8F5EE] border border-[#E3D9C9] text-xs sm:text-[13.5px] text-[#6B5A4C] font-figtree flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-[#33261F] block">New to HAB?</span>
              Create a customer account to track orders and manage deliveries.
            </div>
            <Link 
              href="/register" 
              className="flex-none px-3.5 py-1.5 bg-[#8B2E24] text-white rounded-[6px] font-semibold text-[13px] hover:bg-[#6D241C] transition-colors"
            >
              Register →
            </Link>
          </div>

          <div className="p-3.5 rounded-[10px] bg-white border border-[#E3D9C9] text-xs sm:text-[13px] text-[#6B5A4C] font-figtree flex items-center justify-between">
            <span>Checking an existing order without signing in?</span>
            <Link href="/track-order" className="text-[#8B2E24] font-semibold hover:underline flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Sign In Card */}
      <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[14px] p-6 sm:p-9 shadow-sm">
        <div className="mb-6">
          <h2 className="font-figtree font-bold text-lg text-[#33261F]">
            Account Sign In
          </h2>
          <p className="text-[13px] text-[#6B5A4C] mt-1 font-figtree">
            Sign in with your customer, artisan, or member email address.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 sm:gap-5">
          {errorMsg && (
            <div className="p-3.5 rounded-[8px] bg-red-50 border border-red-200 text-red-700 text-[13.5px] font-figtree">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="font-figtree font-bold text-[13.5px] text-[#33261F] block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="your.email@domain.com"
              className="w-full h-[46px] px-3.5 bg-white border border-[#D5C9B5] rounded-[7px] font-figtree text-[15px] text-[#33261F] outline-none focus:border-[#8B2E24] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-figtree font-bold text-[13.5px] text-[#33261F]">
                Password
              </label>
            </div>
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
            className="w-full h-[48px] bg-[#8B2E24] text-[#FFFCF8] rounded-[7px] font-figtree font-bold text-[15px] hover:bg-[#6D241C] transition-colors disabled:opacity-50 mt-1 cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Registration Prompt in Card */}
          <div className="pt-3 border-t border-[#EAE3D7] text-center font-figtree text-[13.5px] text-[#6B5A4C]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#8B2E24] font-bold hover:underline">
              Create Customer Account
            </Link>
          </div>

          <div className="flex flex-col gap-2 pt-2 text-center text-[12.5px] font-figtree text-[#6B5A4C]">
            <div className="flex items-center justify-center gap-3">
              <Link href="/track-order" className="hover:text-[#33261F] hover:underline">
                Track an Order
              </Link>
              <span>·</span>
              <Link href="/membership/apply" className="hover:text-[#33261F] hover:underline">
                Artisan Membership
              </Link>
              <span>·</span>
              <Link href="/" className="hover:text-[#33261F] hover:underline">
                Public Website
              </Link>
            </div>
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
  );
}

export default function LoginPage() {
  return (
    <main className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-16">
      <Suspense fallback={<div className="text-center py-20 font-figtree text-[#6B5A4C]">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
