'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { useLanguage } from '@/context/LanguageContext';
import { eventImage } from '@/lib/event-illustrations';

export const dynamic = 'force-dynamic';

export default function EventsPage() {
  const { t, language } = useLanguage();
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [eventsState, setEventsState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedKind, setSelectedKind] = useState<string>('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/events', { cache: 'no-store', signal: controller.signal })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data.success === false) throw new Error('Event calendar unavailable');
        return data;
      })
      .then((d) => {
        if (controller.signal.aborted) return;
        setEventsList(Array.isArray(d.events) ? d.events : []);
        setEventsState('ready');
      })
      .catch(() => { if (!controller.signal.aborted) setEventsState('error'); });
    return () => controller.abort();
  }, []);

  const kinds = useMemo(() => {
    const set = new Set<string>();
    eventsList.forEach((e) => {
      const k = language === 'dz' ? (e.categoryDz || e.kindDz || e.kind || e.category) : (e.kind || e.category);
      if (k) set.add(k);
    });
    return Array.from(set);
  }, [eventsList, language]);

  const filteredEvents = useMemo(() => {
    if (!selectedKind) return eventsList;
    return eventsList.filter((e) => (language === 'dz' ? (e.categoryDz || e.kindDz || e.kind || e.category) : (e.kind || e.category)) === selectedKind);
  }, [selectedKind, eventsList, language]);

  return (
    <main id="main">
      <section className="section relative" data-hab-section="events">
        <SectionEditBadge label="Events & Exhibitions" studioHref="/admin/events" sectionType="events" />
        <p className="crumbs">
          <Link href="/">{t('nav.home', 'Home')}</Link> / <Link href="/news">{t('news.title', 'News & events')}</Link> / {t('events.title', 'Events')}
        </p>

        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">{t('events.upcoming', "What's coming up")}</p>
            <h1 className="display display--page">{t('events.title', 'Events')}</h1>
            <p className="lede">
              {t('events.intro', 'Craft bazaars, training courses, export clinics, buyer missions and the Annual Sector Forum. Most are open to members; the bazaars are open to everyone.')}
            </p>
          </div>
          <div className="panel">
            <p className="eyebrow eyebrow--muted eyebrow--sm">{t('events.attending', 'Attending')}</p>
            <p className="panel__body">
              {t('events.attending_help', 'Places and stalls are arranged through the secretariat. Write to')}{' '}
              <a href="mailto:officehab@gmail.com">officehab@gmail.com</a> or call +975-2-338089.
            </p>
            <Link className="btn btn--outline btn--sm" href="/contact?topic=events">
              {t('publications.contact_secretariat', 'Contact the secretariat')}
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filterbar filterbar--slim">
          <label className="visually-hidden" htmlFor="eventFilter">
            {t('events.type', 'Event type')}
          </label>
          <select
            className="input"
            id="eventFilter"
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)}
          >
            <option value="">{t('events.all_types', 'All event types')}</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          {eventsState === 'ready' && <span className="craft__count" id="eventCount" style={{ margin: 0, alignSelf: 'center' }}>
            {filteredEvents.length} {filteredEvents.length === 1 ? t('events.count_one', 'event') : t('events.count_many', 'events')}
          </span>}
        </div>

        {/* Events List */}
        {eventsState === 'loading' && <p>Loading events…</p>}
        {eventsState === 'error' && <p role="alert">The event calendar is temporarily unavailable. Please try again shortly.</p>}
        {eventsState === 'ready' && eventsList.length === 0 && <p>No events are listed yet.</p>}
        <div className="eventlist" id="eventList" data-cms-repeat>
          {filteredEvents.map((e) => {
            const displayTitle = language === 'dz' ? (e.titleDz || e.title) : e.title;
            const displayKind = language === 'dz' ? (e.categoryDz || e.kindDz || e.kind || e.category) : (e.kind || e.category);
            const displayPlace = language === 'dz' ? (e.locationDz || e.venueDz || e.placeDz || e.place) : (e.place || e.location || e.venue);
            const displaySummary = language === 'dz' ? (e.summaryDz || e.descriptionDz || e.summary) : e.summary;
            const image = eventImage(e.key, e.bannerUrl || e.imageUrl || e.image_path || e.image_url);

            return (
              <article key={e.key} id={e.key} className="eventcard" data-cms-item>
                <Link className="eventcard__shot" href={`/events/${e.key}`}>
                  <figure className="frame frame--eventshot has-image" data-cms-img style={{ position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={image.src}
                      alt={image.illustrative ? `Illustrative craft photograph for ${displayTitle}; not a photograph of this event` : displayTitle}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </figure>
                  {image.illustrative && <span className="event-photo-note">Illustrative photo</span>}
                  <span className="eventcard__cal">
                    <span className="eventcard__day">{e.day || ''}</span>
                    <span className="eventcard__mon">{e.mon || ''}</span>
                    <span className="eventcard__year">{e.year || e.dateDisplay || ''}</span>
                  </span>
                </Link>

                <div className="eventcard__body">
                  <div className="news__meta">
                  <span className="tag">{displayKind}</span>
                    {e.time && <span className="news__date">{e.time}</span>}
                  </div>
                  <h2 className="eventcard__title">
                    <Link href={`/events/${e.key}`}>{displayTitle}</Link>
                  </h2>
                  <p className="eventcard__place">
                    {[displayPlace, e.who || e.registration].filter(Boolean).join(' · ')}
                  </p>
                  <p className="card__text">{displaySummary}</p>
                  <Link className="news__more font-semibold" href={`/events/${e.key}`}>
                    {t('events.details', 'Read More & Event Details →')}
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
            <h2 className="display display--panel">{t('events.host_title', 'Host or sponsor an event')}</h2>
            <p className="ctaband__body">
              {t('events.host_intro', 'HAB works with partners on trade fairs, exhibitions and training. Associate members and development partners can propose an event through the secretariat.')}
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/contact">
              {t('events.talk_to_us', 'Talk to us')}
            </Link>
            <Link className="btn btn--ghost" href="/news">
              {t('events.read_news', 'Read the news')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
