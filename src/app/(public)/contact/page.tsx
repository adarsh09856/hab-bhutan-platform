'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ContactContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get('topic') || 'membership';

  const [topic, setTopic] = useState(initialTopic);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    org: '',
    country: 'Bhutan',
    subject: '',
    message: '',
    consent: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/site-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.setting) setSettings(d.setting);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get('topic')) {
      setTopic(searchParams.get('topic') || 'membership');
    }
  }, [searchParams]);

  const topics = [
    { key: 'membership', label: 'Membership' },
    { key: 'order', label: 'Orders & delivery' },
    { key: 'wholesale', label: 'Wholesale & B2B' },
    { key: 'commission', label: 'Commission a piece' },
    { key: 'events', label: 'Events & registration' },
    { key: 'awards', label: 'Awards & nominations' },
    { key: 'press', label: 'Press & partnerships' },
    { key: 'other', label: 'Something else' },
  ];

  const currentTopicLabel = topics.find((t) => t.key === topic)?.label || 'General enquiry';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    const ref = `HAB-ENQ-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopicLabel,
          name: formData.name.trim(),
          email: formData.email.trim(),
          org: formData.org.trim(),
          country: formData.country.trim(),
          subject: formData.subject.trim() || currentTopicLabel,
          message: formData.message.trim(),
          refNumber: ref,
        }),
      });
    } catch {}

    setRefNumber(ref);
    setIsSubmitting(false);
    setIsSent(true);
    window.scrollTo(0, 0);
  };

  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / Contact us
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Contact us</p>
            <h1 className="display display--page">Write to the secretariat</h1>
            <p className="lede">
              One form for every enquiry. Choose what it is about and your message reaches the right desk — membership, an order, wholesale, a commission, an event, an award nomination or the press office.
            </p>
            <p className="section__lede">
              Member contact details are held securely and are not published, so enquiries to individual artisans and enterprises are routed through the office. We reply within two working days.
            </p>
          </div>
          <div className="panel panel--accent">
            <p className="eyebrow eyebrow--onaccent">Secretariat</p>
            <p className="panel__body panel__body--onaccent" style={{ fontSize: 17 }}>
              {settings?.officeAddress || 'Metog Lam, Thimphu, Bhutan'}<br />
              Office {settings?.officePhone || '+975-2-338089'}<br />
              {settings?.officialEmail || 'officehab@gmail.com'}
            </p>
            <p className="panel__body panel__body--onaccent" style={{ margin: 0, fontSize: 14.5 }}>
              Monday to Friday, 09:00–17:00 BTT. Closed on national holidays.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--last">
        {isSent ? (
          <div className="contactsent" id="contactSent">
            <p className="eyebrow eyebrow--accent">Message sent</p>
            <h2 className="display display--sub">Thank you — we have your enquiry</h2>
            <p className="lede">
              Your reference is <strong>{refNumber}</strong>, logged against <strong>{currentTopicLabel}</strong>. The secretariat replies within two working days; urgent matters are best raised by telephone on +975-2-338089.
            </p>
            <div className="actions" style={{ justifyContent: 'center', marginTop: 24 }}>
              <Link className="btn btn--accent" href="/shop">
                Browse the shop
              </Link>
              <Link className="btn btn--outline" href="/publications">
                Read our publications
              </Link>
            </div>
          </div>
        ) : (
          <div className="contactgrid">
            <form className="contactform" id="contactForm" onSubmit={handleSubmit} noValidate>
              <p className="eyebrow eyebrow--accent">What is your enquiry about?</p>
              <div className="topicset">
                {topics.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`topicbtn ${topic === t.key ? 'is-on' : ''}`}
                    onClick={() => setTopic(t.key)}
                    aria-pressed={topic === t.key}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <p style={{ color: 'var(--accent)', fontSize: 13.5, margin: '12px 0' }}>
                  {errorMsg}
                </p>
              )}

              <div className="formgrid" style={{ marginTop: 20 }}>
                <label className="field" htmlFor="cName">
                  <span className="field__label">
                    Your name <span className="field__req">required</span>
                  </span>
                  <input
                    className="input"
                    id="cName"
                    type="text"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </label>

                <label className="field" htmlFor="cEmail">
                  <span className="field__label">
                    Email <span className="field__req">required</span>
                  </span>
                  <input
                    className="input"
                    id="cEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </label>

                <label className="field" htmlFor="cOrg">
                  <span className="field__label">Organisation <em>optional</em></span>
                  <input
                    className="input"
                    id="cOrg"
                    type="text"
                    placeholder="Business, school or institution"
                    value={formData.org}
                    onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                  />
                </label>

                <label className="field" htmlFor="cCountry">
                  <span className="field__label">Country <em>optional</em></span>
                  <input
                    className="input"
                    id="cCountry"
                    type="text"
                    placeholder="Bhutan"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </label>

                <label className="field field--wide" htmlFor="cSubject">
                  <span className="field__label">Subject <em>optional</em></span>
                  <input
                    className="input"
                    id="cSubject"
                    type="text"
                    placeholder="A line that tells us what this is"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </label>

                <label className="field field--wide" htmlFor="cMessage">
                  <span className="field__label">
                    Your message <span className="field__req">required</span>
                  </span>
                  <textarea
                    className="input"
                    id="cMessage"
                    rows={7}
                    placeholder="Give us as much detail as you can — quantities, dates, a craft, an order reference."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                  <span className="field__help">
                    For a commission, tell us the craft, the quantity, the finish and when you need it.
                  </span>
                </label>
              </div>

              <label className="check" htmlFor="cConsent" style={{ marginTop: 14 }}>
                <input
                  type="checkbox"
                  id="cConsent"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                />
                <span>
                  I agree that HAB may hold my details in order to answer this enquiry, as set out in the{' '}
                  <Link href="/privacy">privacy policy</Link>.
                </span>
              </label>

              <div className="actions" style={{ marginTop: 22 }}>
                <button className="btn btn--accent" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send to the secretariat'}
                </button>
                <a className="btn btn--text" href="mailto:officehab@gmail.com">
                  Or email directly
                </a>
              </div>
            </form>

            <aside className="contact-aside">
              <div className="panel" style={{ padding: '30px 28px' }}>
                <p className="eyebrow eyebrow--muted eyebrow--sm">Where enquiries go</p>
                <div className="contact-aside__row">
                  <span className="contact-aside__k">Membership &amp; dues</span>
                  <span className="contact-aside__v">Membership desk</span>
                </div>
                <div className="contact-aside__row">
                  <span className="contact-aside__k">Orders, delivery, returns</span>
                  <span className="contact-aside__v">Retail desk</span>
                </div>
                <div className="contact-aside__row">
                  <span className="contact-aside__k">Wholesale &amp; export</span>
                  <span className="contact-aside__v">Trade desk</span>
                </div>
                <div className="contact-aside__row">
                  <span className="contact-aside__k">Commissions</span>
                  <span className="contact-aside__v">Producer liaison</span>
                </div>
                <div className="contact-aside__row">
                  <span className="contact-aside__k">Events &amp; nominations</span>
                  <span className="contact-aside__v">Programmes desk</span>
                </div>
                <p className="footnote" style={{ marginTop: 18 }}>
                  Before you write: shipping times and free-delivery conditions are set out in the{' '}
                  <Link href="/shipping-policy">shipping &amp; delivery policy</Link>.
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<main id="main"><section className="section section--narrow"><p>Loading contact form…</p></section></main>}>
      <ContactContent />
    </Suspense>
  );
}
