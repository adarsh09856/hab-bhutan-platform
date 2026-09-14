'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export default function EventsPage() {
  const [eventsList, setEventsList] = useState<any[]>(() => CLIENT_DATA.events);
  const [selectedKind, setSelectedKind] = useState<string>('');

  useEffect(() => {
    fetch('/api/events', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.events && Array.isArray(d.events) && d.events.length > 0) {
          setEventsList(d.events);
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

  const photoPool = [
    '/assets/photos/hero-4-textiles.jpg',
    '/assets/photos/hero-1-weaving.jpg',
    '/assets/photos/hero-2-punakha.jpg',
    '/assets/photos/hero-5-desho.jpg',
    '/assets/photos/hero-3-clay.jpg',
  ];

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
          <label className="visually-hidden" htmlFor="eventFilter">
            Event type
          </label>
          <select
            className="input"
            id="eventFilter"
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)}
          >
            <option value="">All event types</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <span className="craft__count" id="eventCount" style={{ margin: 0, alignSelf: 'center' }}>
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        {/* Events List */}
        <div className="eventlist" id="eventList" data-cms-repeat>
          {filteredEvents.map((e, idx) => {
            const imgSrc = photoPool[idx % photoPool.length];

            return (
              <article key={e.key} id={e.key} className="eventcard" data-cms-item>
                <Link className="eventcard__shot" href={`/events/${e.key}`}>
                  <figure className="frame frame--eventshot has-image" data-cms-img style={{ position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={imgSrc}
                      alt={e.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </figure>
                  <span className="eventcard__cal">
                    <span className="eventcard__day">{e.day || '12'}</span>
                    <span className="eventcard__mon">{e.mon || 'OCT'}</span>
                    <span className="eventcard__year">{e.year || '2026'}</span>
                  </span>
                </Link>

                <div className="eventcard__body">
                  <div className="news__meta">
                    <span className="tag">{e.kind}</span>
                    <span className="news__date">{e.time || 'All day'}</span>
                  </div>
                  <h2 className="eventcard__title">
                    <Link href={`/events/${e.key}`}>{e.title}</Link>
                  </h2>
                  <p className="eventcard__place">
                    {e.place} · {e.who || 'Open to all'}
                  </p>
                  <p className="card__text">{e.summary}</p>
                  <Link className="news__more" href={`/events/${e.key}`}>
                    Event detail →
                  </Link>
                </div>
              </article>
            );
          })}
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
            <Link className="btn btn--light" href="/contact">
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
