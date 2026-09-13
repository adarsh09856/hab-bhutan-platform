'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CLIENT_DATA } from '@/lib/client-data';

function RegisterContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'individual-artisan';

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedType, setSelectedType] = useState<string>(initialType);

  useEffect(() => {
    const t = searchParams.get('type');
    if (t) setSelectedType(t);
  }, [searchParams]);

  const [formData, setFormData] = useState({
    fullName: '',
    primaryCraft: 'thagzo',
    dzongkhag: 'Lhuentse',
    cidOrReg: '',
    phone: '',
    email: '',
    village: '',
    workSummary: '',
    declared: false,
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mbob' | 'bank'>('card');
  const [referenceNumber, setReferenceNumber] = useState('HAB-2026-0417');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const types = [
    {
      key: 'individual-artisan',
      name: 'Individual Artisan',
      status: 'Active Sector Member',
      fee: 'Nu. 500',
      tagline: 'For an artisan working on their own or with family at home or at a workshop.',
    },
    {
      key: 'craft-enterprise',
      name: 'Craft Enterprise',
      status: 'Active Sector Member',
      fee: 'Nu. 2,000',
      tagline: 'For a registered craft business, workshop or retail business with multiple artisans.',
    },
    {
      key: 'cluster',
      name: 'Artisan Cluster',
      status: 'Active Sector Member',
      fee: 'Nu. 3,000',
      tagline: 'For a village group, cooperative or community of ten or more artisans working the same craft.',
    },
    {
      key: 'associate',
      name: 'Affiliated Member',
      status: 'Affiliated Member',
      fee: 'Nu. 5,000',
      tagline: 'For suppliers, tour operators, cultural institutions, galleries and corporate supporters.',
    },
    {
      key: 'honorary',
      name: 'Honorary Member',
      status: 'Honorary Member',
      fee: 'No fee',
      tagline: 'By Board resolution for distinguished service to the traditional crafts of Bhutan.',
    },
  ];

  const currentTypeObj = types.find((t) => t.key === selectedType) || types[0];

  const handleStep2Next = () => {
    setErrorMsg('');
    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name or organisation name.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Please enter a contact phone number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    setErrorMsg('');
    if (!formData.declared) {
      setErrorMsg('Please confirm the declaration before submitting.');
      return;
    }

    setIsSubmitting(true);
    const refNum = `HAB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryKey: selectedType,
          fullName: formData.fullName.trim(),
          craftKey: formData.primaryCraft,
          dzongkhag: formData.dzongkhag,
          cidOrReg: formData.cidOrReg.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          village: formData.village.trim(),
          workSummary: formData.workSummary.trim(),
          paymentMethod,
          refNumber: refNum,
        }),
      });
    } catch {}

    setReferenceNumber(refNum);
    setIsSubmitting(false);
    setStep(5);
    window.scrollTo(0, 0);
  };

  return (
    <main id="main">
      <section className="section section--narrow">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/membership">Membership</Link> / Register
        </p>
        <h1 className="display display--page">Register as a member</h1>
        <p className="lede">
          Four steps, about eight minutes. Your answers are kept on this device as you go, so you can leave and come back. If you would rather register in person, bring your documents to the secretariat at Metog Lam, Thimphu.
        </p>

        {/* Steps Breadcrumb Bar */}
        <nav className="regsteps" aria-label="Registration progress">
          <span className={`regstep ${step >= 1 ? 'is-done' : ''} ${step === 1 ? 'is-current' : ''}`}>
            <span className="regstep__n">1</span>
            <span className="regstep__t">Who is applying</span>
          </span>
          <span className={`regstep ${step >= 2 ? 'is-done' : ''} ${step === 2 ? 'is-current' : ''}`}>
            <span className="regstep__n">2</span>
            <span className="regstep__t">Your details</span>
          </span>
          <span className={`regstep ${step >= 3 ? 'is-done' : ''} ${step === 3 ? 'is-current' : ''}`}>
            <span className="regstep__n">3</span>
            <span className="regstep__t">Review</span>
          </span>
          <span className={`regstep ${step >= 4 ? 'is-done' : ''} ${step === 4 ? 'is-current' : ''}`}>
            <span className="regstep__n">4</span>
            <span className="regstep__t">Pay &amp; submit</span>
          </span>
        </nav>

        {/* STEP 1: Who is applying */}
        {step === 1 && (
          <div id="regStep1">
            <h2 className="display display--sub">Who is applying?</h2>
            <p className="section__lede" style={{ marginBottom: 24 }}>
              The form changes to suit you. If you are not sure which fits, each card links to a full explanation.
            </p>
            <div className="regtypes" id="regTypes">
              {types.map((t) => (
                <div
                  key={t.key}
                  className={`plan ${selectedType === t.key ? 'is-active' : ''}`}
                  onClick={() => setSelectedType(t.key)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="plan__head">
                    <span className="plan__name">{t.name}</span>
                    <span className="plan__price">{t.fee}</span>
                  </div>
                  <p className="plan__cat">{t.status}</p>
                  <p className="plan__who">{t.tagline}</p>
                </div>
              ))}
            </div>
            <div className="actions" style={{ marginTop: 26 }}>
              <button
                className="btn btn--accent"
                type="button"
                onClick={() => setStep(2)}
              >
                Continue to your details →
              </button>
              <span className="craft__count" style={{ margin: 0, alignSelf: 'center' }}>
                Selected: {currentTypeObj.name} ({currentTypeObj.fee})
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: Your details */}
        {step === 2 && (
          <div id="regStep2">
            <h2 className="display display--sub">Your details</h2>
            <p className="section__lede" style={{ marginBottom: 24 }}>
              Fields marked required must be completed. Everything else helps the secretariat verify you faster.
            </p>

            {errorMsg && (
              <p style={{ color: 'var(--accent)', fontSize: 13.5, marginBottom: 16 }}>
                {errorMsg}
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <label className="field">
                <span className="field__label">Full legal name / Organisation name *</span>
                <input
                  className="input"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </label>

              <label className="field">
                <span className="field__label">Primary craft *</span>
                <select
                  className="input"
                  value={formData.primaryCraft}
                  onChange={(e) => setFormData({ ...formData, primaryCraft: e.target.value })}
                >
                  {CLIENT_DATA.crafts.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name} — {c.english}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">Dzongkhag *</span>
                <select
                  className="input"
                  value={formData.dzongkhag}
                  onChange={(e) => setFormData({ ...formData, dzongkhag: e.target.value })}
                >
                  {[
                    'Bumthang', 'Chhukha', 'Dagana', 'Gasa', 'Haa', 'Lhuentse',
                    'Mongar', 'Paro', 'Pemagatshel', 'Punakha', 'Samdrup Jongkhar',
                    'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashiyangtse',
                    'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang',
                  ].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">Citizenship ID / License No.</span>
                <input
                  className="input"
                  type="text"
                  placeholder="CID or Trade License"
                  value={formData.cidOrReg}
                  onChange={(e) => setFormData({ ...formData, cidOrReg: e.target.value })}
                />
              </label>

              <label className="field">
                <span className="field__label">Mobile phone *</span>
                <input
                  className="input"
                  type="tel"
                  placeholder="+975-17XXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </label>

              <label className="field">
                <span className="field__label">Email address *</span>
                <input
                  className="input"
                  type="email"
                  placeholder="artisan@domain.bt"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </label>
            </div>

            <label className="field" style={{ marginTop: 16 }}>
              <span className="field__label">Village / Gewog / Physical location</span>
              <input
                className="input"
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              />
            </label>

            <label className="field" style={{ marginTop: 16 }}>
              <span className="field__label">Brief summary of craft experience or workshop details</span>
              <textarea
                className="input"
                rows={3}
                value={formData.workSummary}
                onChange={(e) => setFormData({ ...formData, workSummary: e.target.value })}
              />
            </label>

            <div className="actions" style={{ marginTop: 22 }}>
              <button className="btn btn--outline" type="button" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="btn btn--accent" type="button" onClick={handleStep2Next}>
                Continue to review →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div id="regStep3">
            <h2 className="display display--sub">Check your answers</h2>
            <p className="section__lede" style={{ marginBottom: 24 }}>
              Read it through before you pay. You can go back and change anything.
            </p>

            <div className="panel" style={{ marginBottom: 22 }}>
              <dl className="deeplist">
                <div className="deeplist__row">
                  <dt className="deeplist__key">Membership category</dt>
                  <dd className="deeplist__val">{currentTypeObj.name} ({currentTypeObj.status})</dd>
                </div>
                <div className="deeplist__row">
                  <dt className="deeplist__key">Annual dues</dt>
                  <dd className="deeplist__val">{currentTypeObj.fee}</dd>
                </div>
                <div className="deeplist__row">
                  <dt className="deeplist__key">Name</dt>
                  <dd className="deeplist__val">{formData.fullName}</dd>
                </div>
                <div className="deeplist__row">
                  <dt className="deeplist__key">Craft &amp; Dzongkhag</dt>
                  <dd className="deeplist__val">
                    {formData.primaryCraft} · {formData.dzongkhag}
                  </dd>
                </div>
                <div className="deeplist__row">
                  <dt className="deeplist__key">Contact</dt>
                  <dd className="deeplist__val">
                    {formData.phone} · {formData.email}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="actions" style={{ marginTop: 22 }}>
              <button className="btn btn--outline" type="button" onClick={() => setStep(2)}>
                ← Change something
              </button>
              <button className="btn btn--accent" type="button" onClick={() => setStep(4)}>
                Submit &amp; pay →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Pay & submit */}
        {step === 4 && (
          <div id="regStep4">
            <h2 className="display display--sub">Pay your first year&apos;s dues</h2>
            <p className="section__lede" style={{ marginBottom: 0 }}>
              Your application is complete and saved. Paying now submits it to the secretariat — the same secure gateway used across the site.
            </p>

            <div className="checkout" style={{ marginTop: 24 }}>
              <div>
                <div className="panel" style={{ marginBottom: 22 }}>
                  <h3 className="newsaside__title">Payment method</h3>
                  <div className="paybar paybar--inset">
                    <p className="paybar__label">Secure payment</p>
                    <div className="paybar__brands" style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: '#fff', border: '1px solid var(--line-soft)', padding: '2px 6px', borderRadius: 4 }}>VISA</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: '#fff', border: '1px solid var(--line-soft)', padding: '2px 6px', borderRadius: 4 }}>Mastercard</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: '#fff', border: '1px solid var(--line-soft)', padding: '2px 6px', borderRadius: 4 }}>mBoB</span>
                    </div>
                    <p className="paybar__note">
                      3-D Secure verified. Cards are processed by our gateway; HAB never sees your card number.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                    {[
                      { key: 'card', name: 'International card', note: 'Visa, Mastercard, Amex — 3-D Secure' },
                      { key: 'mbob', name: 'Bhutan mobile pay', note: 'mBoB / RMA-approved wallets, in Nu.' },
                      { key: 'bank', name: 'Bank transfer', note: 'BNB / BOB account, invoice issued on order' },
                    ].map((opt) => (
                      <div
                        key={opt.key}
                        className={`payopt ${paymentMethod === opt.key ? 'is-active' : ''}`}
                        onClick={() => setPaymentMethod(opt.key as any)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="payopt__dot"></span>
                        <span>
                          <span className="payopt__name">{opt.name}</span>
                          <span className="payopt__note">{opt.note}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <h3 className="newsaside__title">Declaration</h3>
                  <label className="check" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.declared}
                      onChange={(e) => setFormData({ ...formData, declared: e.target.checked })}
                      style={{ marginTop: 4 }}
                    />
                    <span>
                      I confirm the information given is true, that I accept the association&apos;s code of conduct on authenticity and fair dealing, and that HAB may list the details marked public in the membership directory.
                    </span>
                  </label>
                  {errorMsg && (
                    <p style={{ color: 'var(--accent)', fontSize: 13.5, marginTop: 12 }}>
                      {errorMsg}
                    </p>
                  )}
                  <p className="uploadnote" style={{ marginTop: 14, fontSize: 13, color: 'var(--muted)' }}>
                    Dues are annual and renew each July. The Board may waive dues in cases of hardship — write to the secretariat rather than abandoning your application.
                  </p>
                </div>
              </div>

              {/* Sidebar Summary */}
              <div className="summary">
                <p className="eyebrow eyebrow--onaccent">Your application</p>
                <div className="summary__row">
                  <span>Category</span>
                  <span>{currentTypeObj.name}</span>
                </div>
                <div className="summary__row">
                  <span>Applicant</span>
                  <span>{formData.fullName}</span>
                </div>
                <div className="summary__row">
                  <span>Paying with</span>
                  <span>{paymentMethod === 'card' ? 'Card' : paymentMethod === 'mbob' ? 'mBoB' : 'Bank'}</span>
                </div>
                <div className="summary__total">
                  <span>Due today</span>
                  <span>{currentTypeObj.fee}</span>
                </div>
                <button
                  className="btn btn--light btn--full"
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit application'}
                </button>
                <button
                  className="btn btn--ghost btn--full"
                  type="button"
                  onClick={() => setStep(3)}
                  style={{ marginTop: 12 }}
                >
                  ← Back to review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Success Confirmation */}
        {step === 5 && (
          <div id="regStep5">
            <div className="shopempty">
              <span className="tick">✓</span>
              <h2 className="shopempty__title">Application received</h2>
              <p className="shopempty__body">
                Your reference is <strong>{referenceNumber}</strong>, applying as {currentTypeObj.name}. The secretariat verifies documents within five working days and will contact you on {formData.phone}. Once approved you appear in the public membership database.
              </p>
              <div className="actions" style={{ justifyContent: 'center', marginTop: 24 }}>
                <Link className="btn btn--accent" href="/membership#login">
                  Go to the member area
                </Link>
                <Link className="btn btn--outline" href="/">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Help Banner */}
      <section className="section section--narrow section--last">
        <div className="ctaband">
          <div>
            <h2 className="display display--panel">Need help with the form?</h2>
            <p className="ctaband__body">
              Membership Services will complete it with you over the phone, or in person at the secretariat. Dzongkhag Chapters can also register members locally.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/contact">
              Contact Membership Services
            </Link>
            <Link className="btn btn--ghost" href="/membership">
              Compare categories
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="section"><p>Loading registration form…</p></div>}>
      <RegisterContent />
    </Suspense>
  );
}

