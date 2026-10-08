'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Store,
  HelpCircle,
  FileText
} from 'lucide-react';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export default function WholesaleLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [buyerInfo, setBuyerInfo] = useState<any | null>(null);

  // Check if already authenticated
  useEffect(() => {
    fetch('/api/wholesale/auth', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.authenticated && d.buyer) {
          setBuyerInfo(d.buyer);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter your wholesale username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/wholesale/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      setBuyerInfo(data.buyer);
      router.push('/wholesale/shop');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/wholesale/auth', { method: 'DELETE' });
    setBuyerInfo(null);
  };

  return (
    <main className="min-h-[80vh] bg-[#FBF9F5] py-12 px-4 sm:px-6 lg:px-10 font-figtree flex items-center justify-center relative">
      <SectionEditBadge label="Wholesale Accounts Studio" studioHref="/admin/wholesale" />

      <div className="w-full max-w-md space-y-6">
        {/* Header Breadcrumbs */}
        <div className="font-mono text-xs text-[#6B5A4C] text-center">
          <Link href="/" className="hover:underline">Home</Link> /{' '}
          <Link href="/wholesale" className="hover:underline">Wholesale</Link> /{' '}
          <span className="text-[#33261F] font-semibold">Buyer Login</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E4DDD1] p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#8B2E24]/10 text-[#8B2E24] flex items-center justify-center mx-auto shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="font-marcellus text-2xl text-[#33261F]">
              Wholesale Buyer Portal
            </h1>
            <p className="text-xs text-[#6B5A4C] font-lora leading-relaxed">
              Access institutional bulk pricing, export quotas, and direct Bhutanese artisan consignment rates.
            </p>
          </div>

          {buyerInfo ? (
            <div className="space-y-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Authenticated as {buyerInfo.companyName}</span>
              </div>
              <p>Username: <strong>{buyerInfo.username}</strong> ({buyerInfo.email})</p>
              <p>Institutional Discount: <strong>{buyerInfo.discountTier}% off retail</strong></p>

              <div className="pt-2 flex items-center gap-3">
                <Link
                  href="/wholesale/shop"
                  className="px-4 py-2 rounded-xl bg-[#8B2E24] hover:bg-[#72241C] text-white font-semibold transition"
                >
                  Enter Wholesale Catalogue →
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1">
                  Wholesale Username or Registered Email *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. aman_resorts_thimphu or buyer@domain.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#CDBEA8] bg-[#FFFCF8] text-xs text-slate-900 focus:outline-hidden focus:border-[#8B2E24]"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#33261F] uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#CDBEA8] bg-[#FFFCF8] text-xs text-slate-900 focus:outline-hidden focus:border-[#8B2E24]"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#8B2E24] hover:bg-[#72241C] disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Wholesale Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Secretary Help Box */}
          <div className="pt-4 border-t border-[#E4DDD1] text-center space-y-1 text-xs text-[#6B5A4C]">
            <p>Don&apos;t have wholesale credentials yet?</p>
            <p>
              Wholesale accounts are vetted and provisioned directly by the Secretariat desk. Contact{' '}
              <a href="mailto:officehab@gmail.com" className="text-[#8B2E24] font-semibold underline">
                officehab@gmail.com
              </a>{' '}
              or call +975-2-338089.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
