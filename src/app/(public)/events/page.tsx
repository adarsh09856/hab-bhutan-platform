'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { CLIENT_DATA } from '@/lib/client-data';

export default function EventsPage() {
  const [eventsList, setEventsList] = useState<any[]>(() => CLIENT_DATA.events);
  const [selectedKind, setSelectedKind] = useState<string>('');

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => {
        if (d?.events && Array.isArray(d.events) && d.events.length > 0) {
          // Normalize database EventRecord fields to display format if needed
          const normalized = d.events.map((e: any) => ({
            ...e,
            day: e.day || (e.dateDisplay ? e.dateDisplay.split(' ')[0] : '12'),
            mon: e.mon || (e.dateDisplay ? e.dateDisplay.split(' ')[1] : 'SEP'),
            kind: e.kind || e.category || 'Exhibition',
            place: e.place || e.location || 'Thimphu',
            time: e.time || (e.schedule?.time) || e.dateDisplay || '',
            summary: e.summary || (e.description?.slice(0, 160) + '...'),
          }));
          setEventsList(normalized);
        }
      })
      .catch(() => {});
  }, []);

  const kinds = useMemo(() => {
    const set = new Set<string>();
    eventsList.forEach((e) => {
      const k = e.kind || e.category;
      if (k) set.add(k);
    });
    return Array.from(set);
  }, [eventsList]);

  const filteredEvents = useMemo(() => {
    if (!selectedKind) return eventsList;
    return eventsList.filter((e) => (e.kind || e.category) === selectedKind);
  }, [selectedKind, eventsList]);

  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/news">News &amp; events</Link> / Events
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">What&apos;s coming up</p>
            <h1 className="display display--page">Events</h1>
            <p className="lede">
              Craft bazaars, training courses, export clinics, buyer missions and the Annual Sector Forum. Most are open to members; the bazaars are open to everyone.
            </p>
          </div>
          <div className="panel">
            <p className="eyebrow eyebrow--muted eyebrow--sm">Attending</p>
            <p className="panel__body">
              Places and stalls are arranged through the secretariat. Write to{' '}
              <a href="mailto:officehab@gmail.com">officehab@gmail.com</a> or call +975-2-338089.
            </p>
            <Link className="btn btn--outline btn--sm" href="/contact?topic=events">
              Contact the secretariat
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filterbar filterbar--slim">
          <select
            className="input"
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)}
            aria-label="Event type"
          >
            <option value="">All event types</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <span className="craft__count" style={{ margin: 0, alignSelf: 'center' }}>
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        {/* Events List */}
        <div className="eventlist" style={{ marginTop: 24 }}>
          {filteredEvents.map((e) => (
            <article key={e.key} className="eventcard" style={{ display: 'flex', gap: 24, padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
              <div
                className="eventdate"
                style={{
                  minWidth: 72,
                  textAlign: 'center',
                  background: 'var(--surface)',
                  padding: '12px 8px',
                  border: '1px solid var(--border)',
                  alignSelf: 'start',
                }}
              >
                <span className="eventdate__day" style={{ display: 'block', fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  {e.day}
                </span>
                <span className="eventdate__mon" style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>
                  {e.mon}
                </span>
              </div>
              <div className="eventcard__body" style={{ flex: 1 }}>
                <span className="tag" style={{ marginBottom: 8, display: 'inline-block' }}>{e.kind}</span>
                <h2 className="eventcard__title" style={{ fontSize: 20, marginBottom: 6 }}>
                  <Link href={`/events/${e.key}`}>{e.title}</Link>
                </h2>
                <p className="card__meta" style={{ marginBottom: 10 }}>
                  {e.place} · {e.time}
                </p>
                <p className="card__text" style={{ marginBottom: 12 }}>{e.summary}</p>
                <Link className="link-accent" href={`/events/${e.key}`}>
                  View event detail →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Band */}
      <section className="section section--last">
        <div className="ctaband">
          <div>
            <h2 className="display display--panel">Host or sponsor an event</h2>
            <p className="ctaband__body">
              HAB works with partners on trade fairs, exhibitions and training. Associate members and development partners can propose an event through the secretariat.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/contact?topic=events">
              Talk to us
            </Link>
            <Link className="btn btn--ghost" href="/news">
              Read the news
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
