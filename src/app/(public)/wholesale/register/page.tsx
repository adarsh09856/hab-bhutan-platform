'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CLIENT_DATA } from '@/lib/client-data';

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

  const handleSubmit = (e: React.FormEvent) => {
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

    const ref = `HAB-W-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedRef(ref);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main id="main">
      <section className="section section--narrow">
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

            {/* 5. Declaration */}
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
              <button className="btn btn--accent" type="submit">
                Submit application
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
