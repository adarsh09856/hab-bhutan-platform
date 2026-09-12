'use client';

export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import '@/styles/globals.css';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/admin';
  const reasonParam = searchParams?.get('reason');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (reasonParam === 'session_expired') {
      setErrorMsg('Your session has expired. Please sign in again.');
    } else if (reasonParam === 'unauthorized_staff') {
      setErrorMsg('Staff authorization required to access the Secretariat Suite.');
    }
  }, [reasonParam]);

  const perks = [
    'Catalog inventory & artisan maker accreditation',
    'International order dispatch & Bhutan Post EMS tracking numbers',
    'Artisan directory & membership dossier intake queue',
    'Financial statements, export tracking & bilateral reporting',
    'Governance, system settings & immutable audit streams',
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
        body: JSON.stringify({ email: identifier, password, targetPortal: 'admin' }),
      });

      if (res.ok) {
        const data = await res.json();
        window.location.href = data.redirectUrl || redirectPath || '/admin';
      } else {
        const err = await res.json();
        setErrorMsg(err.error || err.message || 'Invalid staff credentials. Please verify and try again.');
      }
    } catch {
      setErrorMsg('Authentication server currently unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1020px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center admin-card border admin-border rounded-[16px] p-8 md:p-12 shadow-sm">
      {/* Left: Mission & Operations Overview */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-[#8B2E24] text-white flex items-center justify-center font-figtree font-extrabold text-[14px]">
            HAB
          </div>
          <div>
            <div className="font-figtree font-bold text-[15px] admin-title">
              Handicrafts Association of Bhutan
            </div>
            <div className="font-mono text-[11px] admin-muted tracking-wider uppercase">
              Secretariat Operations Suite
            </div>
          </div>
        </div>

        <h1 className="font-marcellus text-[34px] font-normal leading-[1.2] admin-title mb-4">
          Staff &amp; Secretariat Sign In
        </h1>
        <p className="font-lora text-[15px] leading-[1.6] admin-text mb-6">
          Authorized administrative access for association officers, catalog managers, order fulfillment staff, and trustees.
        </p>

        <div className="flex flex-col gap-3">
          {perks.map((perk) => (
            <div key={perk} className="flex gap-2.5 items-start text-[13.5px] font-figtree admin-text">
              <span className="text-amber-300 font-bold">✓</span>
              <span>{perk}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t admin-border text-[12px] text-[#94A3B8] font-mono">
          CSO Registration: CSO/2011/043 · Thimphu, Kingdom of Bhutan
        </div>
      </div>

      {/* Right: Secure Staff Sign In Form */}
      <div className="admin-panel border admin-border rounded-[12px] p-8">
        <div className="mb-6">
          <h2 className="font-figtree font-bold text-[18px] admin-title">
            Authenticate Staff Session
          </h2>
          <p className="text-[13px] admin-muted mt-1">
            Enter your assigned secretariat credentials to continue.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {errorMsg && (
            <div role="alert" className="p-3.5 rounded-[8px] bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[13px] font-figtree">
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="admin-login-email" className="font-figtree font-semibold text-[13px] admin-text block mb-1.5">
              Staff Email Address
            </label>
            <input
              id="admin-login-email"
              type="email"
              required
              autoComplete="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="officer@handicraftsbhutan.org"
              className="w-full h-[44px] px-3.5 admin-input border rounded-[7px] font-figtree text-[14px]"
            />
          </div>

          <div>
            <label htmlFor="admin-login-password" className="font-figtree font-semibold text-[13px] admin-text block mb-1.5">
              Staff Password
            </label>
            <input
              id="admin-login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-[44px] px-3.5 admin-input border rounded-[7px] font-figtree text-[14px]"
            />
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            disabled={loading}
            className="w-full h-[46px] bg-[#8B2E24] text-white rounded-[7px] font-figtree font-semibold text-[14px] hover:bg-[#6D241C] transition-colors disabled:opacity-50 mt-2 cursor-pointer shadow-sm"
          >
            {loading ? 'Verifying credentials...' : 'Sign in to Secretariat Suite'}
          </button>

          <div className="flex justify-between items-center pt-3 text-[12.5px] font-figtree admin-muted">
            <Link id="admin-login-public-link" href="/" className="hover:underline">
              ← Return to Public Site
            </Link>
            <Link id="admin-login-member-link" href="/login" className="hover:underline">
              Member / Artisan Login →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-stone-950 flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-sm font-figtree admin-muted">Loading Secretariat Portal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
