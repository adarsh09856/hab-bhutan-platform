'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

type Props = { eventKey: string; eventTitle: string };

export default function EventRegistrationForm({ eventKey, eventTitle }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (!consent) {
      setMessage('Please agree to the privacy policy so HAB can process your registration request.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: `Event registration request: ${eventTitle} (${eventKey})`,
          message: [
            `Registration request for ${eventTitle}.`,
            `Event reference: ${eventKey}.`,
            organisation.trim() ? `Organisation: ${organisation.trim()}.` : '',
          ].filter(Boolean).join('\n'),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'The registration request could not be submitted.');
      setSubmitted(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The registration request could not be submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div role="status" aria-live="polite" className="panel__body">
        <strong>Registration request received.</strong> HAB will contact you to confirm availability and next steps.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3" aria-label={`Register interest in ${eventTitle}`}>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="field">
          <span className="field__label">Name <span className="field__req">required</span></span>
          <input className="input" name="name" autoComplete="name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Email <span className="field__req">required</span></span>
          <input className="input" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Organisation <em>optional</em></span>
          <input className="input" name="organisation" autoComplete="organization" maxLength={160} value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Phone <em>optional</em></span>
          <input className="input" name="phone" type="tel" autoComplete="tel" maxLength={40} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>I agree that HAB may use my details to process this request, as described in the <Link href="/privacy">privacy policy</Link>.</span>
      </label>
      {message && <p role="alert" className="text-sm text-red-800">{message}</p>}
      <div className="actions">
        <button className="btn btn--accent" type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send registration request'}
        </button>
      </div>
      <p className="footnote">This submits a request to the HAB Secretariat. Your place is confirmed after the Secretariat replies.</p>
    </form>
  );
}
