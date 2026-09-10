'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CLIENT_DATA } from '@/lib/client-data';
import { useRouter } from 'next/navigation';

export default function MembershipPage() {
  const router = useRouter();
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId.trim()) {
      setErrorMsg('Please enter your membership number or email.');
      return;
    }
    // Direct to standard login flow with prefilled value or proceed
    router.push(`/login?email=${encodeURIComponent(memberId)}`);
  };

  const categories = CLIENT_DATA.membershipCategories || [];

  return (
    <main id="main">
      <section className="section section--narrow">
        <p className="crumbs">
          <Link href="/">Home</Link> / Membership / Apply
        </p>
        <h1 className="display display--page">Apply for HAB membership</h1>
        <p className="lede">
          Three steps, about five minutes. Membership is Active or Associate under the Articles of
          Association, and dues are annual — payable by card, mBoB or bank transfer.
        </p>

        {/* Categories Section */}
        <section id="categories" style={{ margin: '40px 0' }}>
          <div className="section__head" style={{ marginBottom: '22px' }}>
            <div>
              <p className="eyebrow eyebrow--accent">Categories, roles &amp; status</p>
              <h2 className="display display--sub">Five ways to belong</h2>
              <p className="section__lede">
                Active Sector Members hold a vote and receive preferential access to services — as an
                individual artisan, a craft enterprise, or an{' '}
                <Link href="/membership/cluster">artisan cluster</Link> joining as a body. Associate
                members are consulted but do not vote. Honorary membership is conferred by the Board.
              </p>
            </div>
          </div>

          <div className="cattable">
            <div className="cattable__head">
              <span>Category</span>
              <span>Role &amp; status</span>
              <span>Annual dues</span>
              <span className="text-right">Details</span>
            </div>

            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={`/membership/${cat.key}`}
                className="cattable__row group hover:bg-[#F4F0E7] transition-colors"
              >
                <span className="cattable__name font-figtree font-bold text-[#33261F] group-hover:text-[#8B2E24]">
                  {cat.name}
                </span>
                <span className="cattable__status text-xs sm:text-[13px] text-[#6B5A4C]">
                  {cat.status}
                </span>
                <span className="cattable__fee font-mono text-xs sm:text-[13px] text-[#33261F]">
                  {cat.fee}
                </span>
                <span className="cattable__go text-xs font-semibold text-[#8B2E24] group-hover:underline text-right">
                  What it means →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Band */}
        <div className="ctaband" style={{ margin: '40px 0 0' }}>
          <div>
            <h2 className="display display--panel">Ready to join?</h2>
            <p className="ctaband__body">
              Registration takes about eight minutes. The form asks different questions depending on
              whether you are an individual artisan, a craft enterprise, an artisan cluster or an
              affiliated organisation.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/membership/apply">
              Register as a member
            </Link>
            <Link className="btn btn--ghost" href="/contact">
              Register in person
            </Link>
          </div>
        </div>
      </section>

      {/* Member Sign-in Section */}
      <section className="section section--narrow section--last" id="login">
        <div className="logingrid">
          <div>
            <p className="eyebrow eyebrow--accent">Members-only area</p>
            <h2 className="display display--sub">Sign in to your member account</h2>
            <ul className="bullets" style={{ marginTop: '20px' }}>
              <li>Order history and consignment statements</li>
              <li>Submit new products for the HAB shop</li>
              <li>Download training material and publications</li>
              <li>Apply to trade fairs and buyer meetings</li>
              <li>Renew annual dues online</li>
            </ul>
          </div>

          <form className="panel" onSubmit={handleLogin}>
            {errorMsg && (
              <p className="regnotice font-mono text-xs text-rose-700 mb-3">{errorMsg}</p>
            )}
            <label className="field">
              <span className="field__label">Membership number or email</span>
              <input
                className="input"
                type="text"
                placeholder="HAB-2026-0417"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field__label">Password</span>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button className="btn btn--accent btn--full" type="submit">
              Log in
            </button>
            <div className="loginfoot">
              <Link href="/contact?topic=membership">Forgot password</Link>
              <Link href="/membership/apply">Not a member yet?</Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
