'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CLIENT_DATA } from '@/lib/client-data';

function DonateContent() {
  const searchParams = useSearchParams();
  const presetPillar = searchParams.get('pillar');

  const pillars = CLIENT_DATA.supportPillars || [];
  const [selectedPillar, setSelectedPillar] = useState<string>(
    presetPillar || (pillars[0]?.key || '')
  );
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isMonthly, setIsMonthly] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [country, setCountry] = useState<string>('Bhutan');
  const [message, setMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [payMethod, setPayMethod] = useState<string>('card');
  const [refNumber, setRefNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (presetPillar) {
      setSelectedPillar(presetPillar);
    }
  }, [presetPillar]);

  const activePillar = useMemo(() => {
    return pillars.find((p) => p.key === selectedPillar) || pillars[0];
  }, [pillars, selectedPillar]);

  const handleAmountChip = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setCustomAmount(v);
    const num = Number(v);
    if (num > 0) {
      setAmount(num);
    }
  };

  const handleGive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !donorEmail.trim()) {
      setErrorMsg('Please give your name and email so we can send a receipt.');
      return;
    }
    setErrorMsg(null);
    const generatedRef = `HAB-D-${Math.floor(10000 + Math.random() * 90000)}`;
    setRefNumber(generatedRef);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main id="main">
      <section className="section section--narrow">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/#support">Support us</Link> / Donate
        </p>
        <h1 className="display display--page">Support Bhutanese craft</h1>
        <p className="lede">
          Choose where your gift goes. HAB is a registered Public Benefit Organisation, so nothing given here leaves the handicrafts sector, and the audited accounts published each year say exactly where it went.
        </p>

        {refNumber ? (
          <div id="donDone">
            <div className="shopempty">
              <span className="tick">✓</span>
              <h2 className="shopempty__title">Thank you</h2>
              <p className="shopempty__body">
                Reference <strong>{refNumber}</strong>. A receipt is on its way to your email ({donorEmail}). Your gift of Nu. {amount.toLocaleString()} is recorded against{' '}
                <span>{activePillar?.title}</span>, and its use will be reported in this year&apos;s annual report.
              </p>
              <div className="actions" style={{ justifyContent: 'center', marginTop: 24 }}>
                <Link className="btn btn--accent" href="/publications">
                  Read the annual report
                </Link>
                <Link className="btn btn--outline" href="/">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Pillar Selector */}
            <div className="pillars pillars--pick" style={{ marginTop: 24 }}>
              {pillars.map((p) => {
                const isActive = p.key === selectedPillar;
                return (
                  <button
                    key={p.key}
                    type="button"
                    className={`pillar pillar--option ${isActive ? 'is-active' : ''}`}
                    onClick={() => setSelectedPillar(p.key)}
                    style={{ textAlign: 'left', cursor: 'pointer', border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)' }}
                  >
                    <h2 className="pillar__title">
                      <span className="pillar__initial">{p.letter}</span>
                      <span>{p.title.slice(p.letter.length)}</span>
                    </h2>
                    <p className="pillar__line">{p.line}</p>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleGive} className="checkout" style={{ marginTop: 34 }}>
              <div>
                {/* Amount Panel */}
                <div className="panel" style={{ marginBottom: 22 }}>
                  <h2 className="newsaside__title">Amount</h2>
                  <div className="amountrow">
                    {[1000, 5000, 10000, 25000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`amountchip ${amount === v && !customAmount ? 'is-on' : ''}`}
                        onClick={() => handleAmountChip(v)}
                      >
                        Nu. {v.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <label className="field" style={{ marginTop: 16, marginBottom: 0 }}>
                    <span className="field__label">Or enter your own amount (Nu.)</span>
                    <input
                      className="input"
                      type="number"
                      min="100"
                      step="100"
                      placeholder="e.g. 2,500"
                      value={customAmount}
                      onChange={handleCustomAmount}
                    />
                  </label>
                  <label className="check" style={{ marginTop: 16 }}>
                    <input
                      type="checkbox"
                      checked={isMonthly}
                      onChange={(e) => setIsMonthly(e.target.checked)}
                    />
                    <span>Make this a monthly gift</span>
                  </label>
                </div>

                {/* Details Panel */}
                <div className="panel" style={{ marginBottom: 22 }}>
                  <h2 className="newsaside__title">Your details</h2>
                  <div className="formgrid">
                    <label className="field field--wide">
                      <span className="field__label">
                        Full name <span className="field__req">required</span>
                      </span>
                      <input
                        className="input"
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        required
                      />
                    </label>
                    <label className="field">
                      <span className="field__label">
                        Email <span className="field__req">required</span>
                      </span>
                      <input
                        className="input"
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        required
                      />
                    </label>
                    <label className="field">
                      <span className="field__label">Country</span>
                      <input
                        className="input"
                        type="text"
                        placeholder="Bhutan"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </label>
                    <label className="field field--wide">
                      <span className="field__label">
                        Message to the artisans <em>optional</em>
                      </span>
                      <textarea
                        className="input"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </label>
                  </div>
                  <label className="check" style={{ marginTop: 6 }}>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <span>Give anonymously — your name will not appear in the annual report</span>
                  </label>
                </div>

                {/* Payment Panel */}
                <div className="panel">
                  <h2 className="newsaside__title">Payment method</h2>
                  <div className="paybar paybar--inset">
                    <p className="paybar__label">Secure payment</p>
                    <p className="paybar__note">
                      3-D Secure verified. Cards are processed by our gateway; HAB never sees your card number.
                    </p>
                  </div>
                  <div className="paymethods" style={{ marginTop: 16 }}>
                    <label className="paymethod" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0' }}>
                      <input
                        type="radio"
                        name="payMethod"
                        value="card"
                        checked={payMethod === 'card'}
                        onChange={(e) => setPayMethod(e.target.value)}
                      />
                      <span><strong>Credit / Debit Card</strong> (Visa, Mastercard, JCB, UnionPay)</span>
                    </label>
                    <label className="paymethod" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0' }}>
                      <input
                        type="radio"
                        name="payMethod"
                        value="mbob"
                        checked={payMethod === 'mbob'}
                        onChange={(e) => setPayMethod(e.target.value)}
                      />
                      <span><strong>mBoB / Bhutan QR</strong> (Local banking app)</span>
                    </label>
                    <label className="paymethod" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0' }}>
                      <input
                        type="radio"
                        name="payMethod"
                        value="bank"
                        checked={payMethod === 'bank'}
                        onChange={(e) => setPayMethod(e.target.value)}
                      />
                      <span><strong>Bank Transfer</strong> (Direct wire to HAB BoB account)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="summary">
                <p className="eyebrow eyebrow--onaccent">Your gift</p>
                <div id="donSummary">
                  <div className="summary__row">
                    <span>Supporting</span>
                    <span>{activePillar?.title}</span>
                  </div>
                  <div className="summary__row">
                    <span>Amount</span>
                    <span>Nu. {amount.toLocaleString()}</span>
                  </div>
                  <div className="summary__row">
                    <span>Frequency</span>
                    <span>{isMonthly ? 'Every month' : 'One-off gift'}</span>
                  </div>
                  <div className="summary__row">
                    <span>Paying with</span>
                    <span style={{ textTransform: 'capitalize' }}>{payMethod}</span>
                  </div>
                </div>
                <div className="summary__total">
                  <span>Total</span>
                  <span>
                    Nu. {amount.toLocaleString()} {isMonthly ? '/ mo' : ''}
                  </span>
                </div>
                {errorMsg && (
                  <p style={{ color: '#fff', backgroundColor: 'var(--accent)', padding: '8px 12px', fontSize: 13, marginBottom: 12 }}>
                    {errorMsg}
                  </p>
                )}
                <button className="btn btn--light btn--full" type="submit">
                  Give securely
                </button>
                <p className="summary__fine">
                  A receipt is issued by email. Bhutanese taxpayers can claim relief on gifts to a registered CSO.
                </p>
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default function DonatePage() {
  return (
    <Suspense fallback={<div className="section"><p>Loading donation form…</p></div>}>
      <DonateContent />
    </Suspense>
  );
}
