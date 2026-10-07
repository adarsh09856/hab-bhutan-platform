'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CLIENT_DATA } from '@/lib/client-data';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export default function WholesaleRegisterPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    buyerType: '',
    country: 'Bhutan',
    city: '',
    regNumber: '',
    website: '',
    contactPerson: '',
    position: '',
    phone: '',
    email: '',
    purpose: '',
    orderValue: '',
    frequency: '',
    customNotes: '',
    customOrderNotes: '',
    customOrderDate: '',
    declared: false,
  });

  const [selectedCrafts, setSelectedCrafts] = useState<string[]>([]);
  const [fileCount, setFileCount] = useState<number>(0);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Payment states (matching donate section)
  const [payMethod, setPayMethod] = useState<'card' | 'mbob' | 'bank'>('card');
  const [mobilePhone, setMobilePhone] = useState('');
  const [bankRef, setBankRef] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const toggleAllCrafts = () => {
    if (selectedCrafts.length === CLIENT_DATA.crafts.length) {
      setSelectedCrafts([]);
    } else {
      setSelectedCrafts(CLIENT_DATA.crafts.map((c) => c.key));
    }
  };

  const toggleCraft = (key: string) => {
    setSelectedCrafts((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setFileNames(names);
      setFileCount(names.length);
    }
  };

  const handlePaymentProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofFile(file);
    setUploadError(null);
    setUploadingFile(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload deposit proof');
      }
      setProofUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const missing: string[] = [];
    if (!formData.businessName.trim()) missing.push('business name');
    if (!formData.buyerType || formData.buyerType === 'Select…') missing.push('buyer type');
    if (!formData.country.trim()) missing.push('country');
    if (!formData.contactPerson.trim()) missing.push('contact person');
    if (!formData.phone.trim()) missing.push('phone');
    if (!formData.email.trim()) missing.push('business email');
    if (!formData.purpose.trim()) missing.push('business purpose');

    if (missing.length > 0) {
      setErrorMessage(`Please complete: ${missing.join(', ')}.`);
      return;
    }

    if (!formData.declared) {
      setErrorMessage('Please confirm the declaration before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/wholesale/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          selectedCrafts,
          paymentMethod: payMethod,
          paymentRef: bankRef,
          mobilePhone,
          proofUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedRef(data.reference || `HAB-W-${Math.floor(1000 + Math.random() * 9000)}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(data.error || 'Failed to submit application. Please try again.');
      }
    } catch {
      setErrorMessage('Network error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main">
      <section className="section section--narrow relative" data-hab-section="wholesale-register">
        <SectionEditBadge label="Wholesale Trade Studio" studioHref="/admin/trade" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/wholesale">Wholesale &amp; bulk orders</Link> / Register
        </p>
        <h1 className="display display--page">Register as a wholesale buyer</h1>
        <p className="lede">
          One form, about five minutes. The secretariat verifies your business and opens your trade account, usually within three working days. Nothing is charged at registration.
        </p>

        {submittedRef ? (
          <div id="wsDone">
            <div className="shopempty">
              <span className="tick">✓</span>
              <h2 className="shopempty__title">Application received</h2>
              <p className="shopempty__body">
                Reference <strong>{submittedRef}</strong>. The trade desk reviews business documents within three working days and will email your account credentials to <span>{formData.email}</span>. No payment is taken at registration.
              </p>
              <div className="actions" style={{ justifyContent: 'center', marginTop: 24 }}>
                <Link className="btn btn--accent" href="/wholesale/shop">
                  Explore Wholesale Catalogue
                </Link>
                <Link className="btn btn--outline" href="/">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form id="wsRegForm" onSubmit={handleSubmit}>
            {/* 1. Your Business */}
            <section className="regblock">
              <h2 className="regblock__title">Your business</h2>
              <div className="formgrid">
                <label className="field field--wide">
                  <span className="field__label">
                    Business or company name <span className="field__req">required</span>
                  </span>
                  <input
                    className="input"
                    type="text"
                    placeholder="Registered trading name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">
                    Buyer type <span className="field__req">required</span>
                  </span>
                  <select
                    className="input"
                    value={formData.buyerType}
                    onChange={(e) => setFormData({ ...formData, buyerType: e.target.value })}
                    required
                  >
                    <option value="">Select…</option>
                    {CLIENT_DATA.buyerTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">
                    Country <span className="field__req">required</span>
                  </span>
                  <input
                    className="input"
                    type="text"
                    placeholder="Bhutan"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">City</span>
                  <input
                    className="input"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Company registration or VAT number</span>
                  <input
                    className="input"
                    type="text"
                    placeholder="If applicable"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                  />
                </label>
                <label className="field field--wide">
                  <span className="field__label">Website or social account</span>
                  <input
                    className="input"
                    type="url"
                    placeholder="https://"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </label>
              </div>
            </section>

            {/* 2. Contact */}
            <section className="regblock">
              <h2 className="regblock__title">Contact</h2>
              <div className="formgrid">
                <label className="field field--wide">
                  <span className="field__label">
                    Contact person <span className="field__req">required</span>
                  </span>
                  <input
                    className="input"
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field__label">Position</span>
                  <input
                    className="input"
                    type="text"
                    placeholder="Buyer, Owner, Purchasing Manager"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span className="field__label">
                    Phone <span className="field__req">required</span>
                  </span>
                  <input
                    className="input"
                    type="tel"
                    placeholder="+975 …"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </label>
                <label className="field field--wide">
                  <span className="field__label">
                    Business email <span className="field__req">required</span>
                  </span>
                  <input
                    className="input"
                    type="email"
                    placeholder="buying@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </label>
              </div>
            </section>

            {/* 3. Purchasing Requirements */}
            <section className="regblock">
              <h2 className="regblock__title">Purchasing requirements</h2>
              <div className="formgrid">
                <label className="field field--wide">
                  <span className="field__label">
                    Business purpose <span className="field__req">required</span>
                  </span>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="What you do, and how Bhutanese craft fits your range — e.g. a 40-room hotel refurbishing guest rooms, or a retailer stocking a Himalayan range"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                  />
                </label>
                <div className="field field--wide">
                  <span className="field__label">Crafts you expect to buy</span>
                  <div className="chipset" id="wsCrafts">
                    <button
                      type="button"
                      className={`skillchip skillchip--all ${selectedCrafts.length === CLIENT_DATA.crafts.length ? 'is-on' : ''}`}
                      onClick={toggleAllCrafts}
                    >
                      <span className="skillchip__name">All thirteen crafts</span>
                      <span className="skillchip__en">Select every category</span>
                    </button>
                    {CLIENT_DATA.crafts.map((c) => {
                      const active = selectedCrafts.includes(c.key);
                      return (
                        <button
                          key={c.key}
                          type="button"
                          className={`skillchip ${active ? 'is-on' : ''}`}
                          onClick={() => toggleCraft(c.key)}
                        >
                          <span className="skillchip__name">{c.name}</span>
                          <span className="skillchip__en">{c.english}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className="field__help">
                    Tick every category you are interested in. This shapes what the trade desk sends you.
                  </span>
                </div>
                <label className="field">
                  <span className="field__label">Expected first order value</span>
                  <select
                    className="input"
                    value={formData.orderValue}
                    onChange={(e) => setFormData({ ...formData, orderValue: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option>Under USD 2,000</option>
                    <option>USD 2,000 – 10,000</option>
                    <option>USD 10,000 – 50,000</option>
                    <option>Over USD 50,000</option>
                  </select>
                </label>
                <label className="field">
                  <span className="field__label">Order frequency</span>
                  <select
                    className="input"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option>One-off project</option>
                    <option>Seasonal</option>
                    <option>Quarterly</option>
                    <option>Monthly or more</option>
                  </select>
                </label>
                <label className="field field--wide">
                  <span className="field__label">Customisation or private label</span>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Sizes, colourways, woven labels, packaging — anything made to your specification"
                    value={formData.customNotes}
                    onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
                  />
                </label>
              </div>

              <div className="dropzone">
                <p className="dropzone__title">Business documents</p>
                <p className="dropzone__note">Company registration, trade licence or resale certificate. JPEG, PNG or PDF up to 5 MB each.</p>
                <input
                  className="input input--file"
                  id="wsFiles"
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
                {fileCount > 0 && (
                  <p className="dropzone__chosen" style={{ marginTop: 8, fontSize: 13, color: 'var(--ink)' }}>
                    {fileCount} file(s) selected: {fileNames.join(', ')}
                  </p>
                )}
              </div>
            </section>

            {/* 4. Start your order */}
            <section className="regblock">
              <h2 className="regblock__title">Start your order</h2>
              <p className="regblock__lede">
                You can begin ordering now — nothing is charged and nothing is committed until the trade desk confirms your account and prices. Choose either route, or both.
              </p>
              <div className="b2border">
                <div className="b2border__route">
                  <p className="eyebrow eyebrow--accent">From the catalogue</p>
                  <h3 className="b2border__title">Order existing catalogue items</h3>
                  <p className="b2border__body">
                    Browse the wholesale catalogue, set quantities against each item&apos;s MOQ and tier price, and your quote basket travels with this application. Trade prices are shown once your account is verified.
                  </p>
                  <div className="actions">
                    <Link className="btn btn--ink btn--sm" href="/wholesale/shop">
                      Open the wholesale catalogue →
                    </Link>
                    <Link className="btn btn--outline btn--sm" href="/wholesale/cart">
                      Review my quote basket
                    </Link>
                  </div>
                </div>
                <div className="b2border__route">
                  <p className="eyebrow eyebrow--accent">Made to order</p>
                  <h3 className="b2border__title">Submit a custom specification</h3>
                  <label className="field">
                    <span className="field__label">What do you need made?</span>
                    <textarea
                      className="input"
                      rows={5}
                      placeholder="Craft, item, dimensions, finish, colourway, quantity, packaging and the date you need it by."
                      value={formData.customOrderNotes}
                      onChange={(e) => setFormData({ ...formData, customOrderNotes: e.target.value })}
                    />
                    <span className="field__help">
                      The trade desk matches a specification to member enterprises and clusters able to produce it, and returns costed options with lead times.
                    </span>
                  </label>
                  <label className="field" style={{ marginTop: 12 }}>
                    <span className="field__label">Needed by <em>optional</em></span>
                    <input
                      className="input"
                      type="date"
                      value={formData.customOrderDate}
                      onChange={(e) => setFormData({ ...formData, customOrderDate: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            </section>

            {/* 5. Payment Method & Trade Verification Dues */}
            <section className="regblock">
              <h2 className="regblock__title">Trade verification &amp; annual dues</h2>
              <p className="regblock__lede">
                Wholesale verification fee: <strong>Nu. 2,500 / USD $30</strong> per year. Covers craft provenance audit, trade desk account provisioning, and access to confidential bulk discount tiers.
              </p>

              <div className="checkout" style={{ marginTop: 16 }}>
                <div className="panel">
                  <h3 className="newsaside__title">Choose payment method</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                    {[
                      { key: 'card', name: 'International card (3-D Secure)', note: 'Visa, Mastercard, Amex — instant card authorization' },
                      { key: 'mbob', name: 'Bhutan mobile pay (mBoB / RMA QR)', note: 'mBoB / RMA-approved digital wallets, in Nu.' },
                      { key: 'bank', name: 'Bank transfer (BOB / BNB)', note: 'Wire transfer or direct branch deposit slip' },
                    ].map((opt) => (
                      <div
                        key={opt.key}
                        className={`payopt ${payMethod === opt.key ? 'is-active' : ''}`}
                        onClick={() => setPayMethod(opt.key as any)}
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

                  {/* mBoB details */}
                  {payMethod === 'mbob' && (
                    <div style={{ marginTop: 16, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#8B2E24' }}>
                        mBoB Transfer Details
                      </p>
                      <p style={{ fontSize: 12, color: '#475569', marginBottom: 10 }}>
                        Transfer <strong>Nu. 2,500</strong> to Bank of Bhutan Account <strong>0100234891001</strong> (Handicrafts Association of Bhutan).
                      </p>
                      <div className="formgrid">
                        <label className="field">
                          <span className="field__label">Your mBoB Registered Phone</span>
                          <input
                            type="tel"
                            className="input"
                            placeholder="+975 17……"
                            value={mobilePhone}
                            onChange={(e) => setMobilePhone(e.target.value)}
                          />
                        </label>
                        <label className="field">
                          <span className="field__label">Journal / Transaction Reference</span>
                          <input
                            type="text"
                            className="input"
                            placeholder="e.g. MB-849201"
                            value={bankRef}
                            onChange={(e) => setBankRef(e.target.value)}
                          />
                        </label>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <span className="field__label">Upload Payment Screenshot / Slip</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handlePaymentProofUpload}
                          className="input input--file"
                        />
                        {uploadingFile && <p style={{ fontSize: 11, color: '#0284c7' }}>Uploading slip...</p>}
                        {proofUrl && <p style={{ fontSize: 11, color: '#16a34a' }}>✓ Slip uploaded successfully</p>}
                        {uploadError && <p style={{ fontSize: 11, color: '#dc2626' }}>{uploadError}</p>}
                      </div>
                    </div>
                  )}

                  {/* Bank transfer details */}
                  {payMethod === 'bank' && (
                    <div style={{ marginTop: 16, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#8B2E24' }}>
                        Bank Deposit / SWIFT Wire Details
                      </p>
                      <p style={{ fontSize: 12, color: '#475569', marginBottom: 10 }}>
                        Bank of Bhutan Account: <strong>100234891001</strong> · Bhutan National Bank (BNB): <strong>00234891001</strong> · SWIFT: <strong>BOBTBT22</strong>.
                      </p>
                      <div className="formgrid">
                        <label className="field field--wide">
                          <span className="field__label">Bank Deposit Reference Number</span>
                          <input
                            type="text"
                            className="input"
                            placeholder="Deposit ref or counter foil #"
                            value={bankRef}
                            onChange={(e) => setBankRef(e.target.value)}
                          />
                        </label>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <span className="field__label">Upload Bank Deposit Slip / Wire Confirmation</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handlePaymentProofUpload}
                          className="input input--file"
                        />
                        {uploadingFile && <p style={{ fontSize: 11, color: '#0284c7' }}>Uploading document...</p>}
                        {proofUrl && <p style={{ fontSize: 11, color: '#16a34a' }}>✓ Slip uploaded successfully</p>}
                        {uploadError && <p style={{ fontSize: 11, color: '#dc2626' }}>{uploadError}</p>}
                      </div>
                    </div>
                  )}

                  {/* Card payment note */}
                  {payMethod === 'card' && (
                    <div style={{ marginTop: 14, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569' }}>
                      3-D Secure card authorization is handled by our gateway upon clicking Submit. No card details are stored on our servers.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 6. Declaration */}
            <section className="regblock">
              <h2 className="regblock__title">Declaration</h2>
              <label className="check">
                <input
                  type="checkbox"
                  checked={formData.declared}
                  onChange={(e) => setFormData({ ...formData, declared: e.target.checked })}
                />
                <span>
                  I confirm I am purchasing for a business, that the information given is accurate, and that trade prices shown to my account are commercially confidential and will not be published.
                </span>
              </label>
              {errorMessage && (
                <p className="regnotice" style={{ marginTop: 14, color: 'var(--accent)', fontWeight: 600 }}>
                  {errorMessage}
                </p>
              )}
            </section>

            <div className="actions">
              <button className="btn btn--accent" type="submit" disabled={submitting}>
                {submitting ? 'Submitting to Secretariat...' : 'Submit application'}
              </button>
              <Link className="btn btn--outline" href="/wholesale">
                ← Back to wholesale
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
