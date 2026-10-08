'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA } from '@/lib/client-data';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { useLanguage } from '@/context/LanguageContext';

export const dynamic = 'force-dynamic';

export default function EventsPage() {
  const { t } = useLanguage();
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

  const EVENT_PHOTO_MAP: Record<string, string> = {
    'craft-bazaar-2026': '/assets/photos/hero-2-punakha.jpg',
    'export-clinic-sep': '/images/programs/trade.jpg',
    'sector-forum-2026': '/assets/photos/about-hab.jpg',
    'dye-training-nov': '/images/programs/dye_training.jpg',
    'buyer-mission-nov': '/images/programs/design_lab.jpg',
    'apprentice-intake-dec': '/images/training_workshop.jpg',
  };

  const photoPool = [
    '/assets/photos/hero-2-punakha.jpg',
    '/images/programs/trade.jpg',
    '/assets/photos/about-hab.jpg',
    '/images/programs/dye_training.jpg',
    '/images/programs/design_lab.jpg',
    '/images/training_workshop.jpg',
    '/assets/photos/hero-5-desho.jpg',
    '/assets/photos/hero-3-clay.jpg',
    '/images/programs/heritage.jpg',
  ];

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
          <span className="craft__count" id="eventCount" style={{ margin: 0, alignSelf: 'center' }}>
            {filteredEvents.length} {filteredEvents.length === 1 ? t('events.count_one', 'event') : t('events.count_many', 'events')}
          </span>
        </div>

        {/* Events List */}
        <div className="eventlist" id="eventList" data-cms-repeat>
          {filteredEvents.map((e, idx) => {
            const customImg = e.bannerUrl || e.imageUrl || e.image_path || e.image_url;
            const hasValidCustom = customImg && typeof customImg === 'string' && customImg.trim() && !customImg.includes('hero-4-textiles.jpg') && !customImg.includes('hero-1-weaving.jpg');
            const titleLower = String(e.title || '').toLowerCase();
            const k = String(e.key || e.id || '').toLowerCase();
            let imgSrc = '';

            if (hasValidCustom) {
              imgSrc = customImg;
            } else if (titleLower.includes('bazaar') || k.includes('bazaar')) {
              imgSrc = '/assets/photos/hero-2-punakha.jpg';
            } else if (titleLower.includes('clinic') || titleLower.includes('export') || k.includes('export')) {
              imgSrc = '/images/programs/trade.jpg';
            } else if (titleLower.includes('forum') || titleLower.includes('assembly') || k.includes('forum')) {
              imgSrc = '/assets/photos/about-hab.jpg';
            } else if (titleLower.includes('dye') || k.includes('dye')) {
              imgSrc = '/images/programs/dye_training.jpg';
            } else if (titleLower.includes('buyer') || titleLower.includes('mission') || k.includes('buyer')) {
              imgSrc = '/images/programs/design_lab.jpg';
            } else if (titleLower.includes('apprentice') || titleLower.includes('training') || titleLower.includes('intake')) {
              imgSrc = '/images/training_workshop.jpg';
            } else if (EVENT_PHOTO_MAP[k]) {
              imgSrc = EVENT_PHOTO_MAP[k];
            } else {
              imgSrc = photoPool[idx % photoPool.length];
            }

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
                    {e.place} · {e.who || t('events.open_to_all', 'Open to all')}
                  </p>
                  <p className="card__text">{e.summary}</p>
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
