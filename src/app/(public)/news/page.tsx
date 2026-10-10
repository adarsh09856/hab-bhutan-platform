'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { useLanguage } from '@/context/LanguageContext';

export const dynamic = 'force-dynamic';

export default function NewsPage() {
  const { t, language } = useLanguage();
  const [newsList, setNewsList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [newsState, setNewsState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [eventsState, setEventsState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedKind, setSelectedKind] = useState<string>('');

  useEffect(() => {
    fetch('/api/news', { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data?.success === false) throw new Error('News unavailable');
        return data;
      })
      .then((d) => {
        if (Array.isArray(d?.articles)) {
          setNewsList(d.articles.map((a: any) => ({
              id: a.id,
              slug: a.slug || a.id,
              kind: a.kind || 'Notice',
              kindDz: a.kindDz || '',
              title: a.title,
              titleDz: a.titleDz || '',
              blurb: a.blurb || a.summary || '',
              blurbDz: a.blurbDz || '',
              published_at: a.dateString || a.published_at || '',
              image_path: a.image_path || '',
          })));
        }
        setNewsState('ready');
      })
      .catch(() => setNewsState('error'));

    fetch('/api/events', { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data?.success === false) throw new Error('Events unavailable');
        return data;
      })
      .then((d) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = (Array.isArray(d?.events) ? d.events : [])
          .filter((event: any) => {
            const date = event.startDate ? new Date(event.startDate) : null;
            return date && !Number.isNaN(date.getTime()) && date >= today;
          })
          .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        setEventsList(upcoming);
        setEventsState('ready');
      })
      .catch(() => setEventsState('error'));
  }, []);

  const displayKind = (n: any) => language === 'dz' ? (n.kindDz || n.kind) : n.kind;
  const displayTitle = (n: any) => language === 'dz' ? (n.titleDz || n.title) : n.title;
  const displayBlurb = (n: any) => language === 'dz' ? (n.blurbDz || n.blurb) : n.blurb;
  const kinds = Array.from(new Set(newsList.map(displayKind))).filter(Boolean);

  const filtered = !selectedKind
    ? newsList
    : newsList.filter((n) => displayKind(n) === selectedKind);

  return (
    <main id="main">
      <section className="section relative" data-hab-section="news">
        <SectionEditBadge label="News & Stories" studioHref="/admin/content" sectionType="news" />
        <p className="crumbs">
          <Link href="/">{t('nav.home', 'Home')}</Link> / {t('news.title', 'News & events')}
        </p>
        <h1 className="display display--page">{t('news.title', 'News & events')}</h1>
        <p className="lede">{t('news.subtitle', 'Stay informed, stay empowered.')}</p>

        <div className="newsrow" style={{ marginTop: 34 }}>
          {/* Left: Articles List */}
          <div>
            <div className="filterbar filterbar--slim">
              <label className="visually-hidden" htmlFor="newsFilter">
                {t('news.category', 'Category')}
              </label>
              <select
                className="input"
                id="newsFilter"
                value={selectedKind}
                onChange={(e) => setSelectedKind(e.target.value)}
              >
                <option value="">{t('news.all_categories', 'All categories')}</option>
                {kinds.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <span className="craft__count" id="newsCount" style={{ margin: 0, alignSelf: 'center' }}>
                {filtered.length} {filtered.length === 1 ? t('news.post_singular', 'post') : t('news.post_plural', 'posts')}
              </span>
            </div>

            <div className="newslist" id="newsList" data-cms-repeat>
              {filtered.map((n, idx) => {
                const slug = n.slug || n.id || `post-${idx}`;
                const imgSrc = n.image_path || '/assets/photos/image-unavailable.svg';

                return (
                  <article key={slug} className="newsitem" id={`news-${slug}`} data-cms-item>
                    <Link href={`/news/${slug}`} className="block relative" style={{ minHeight: 190 }}>
                      <figure className="frame frame--wide16 has-image" data-cms-img style={{ position: 'relative', width: '100%', height: '100%', minHeight: 190, overflow: 'hidden' }}>
                        <Image
                          src={imgSrc}
                          alt={n.image_path ? displayTitle(n) : ''}
                          fill
                          sizes="(max-width: 768px) 100vw, 260px"
                          style={{ objectFit: 'cover' }}
                        />
                      </figure>
                    </Link>

                    <div className="newsitem__body">
                      <div className="news__meta">
                      <span className="tag">{displayKind(n)}</span>
                        {n.published_at && <span className="news__date">{n.published_at}</span>}
                      </div>
                      <h2 className="newsitem__title">
                        <Link href={`/news/${slug}`}>{displayTitle(n)}</Link>
                      </h2>
                      <p className="newsitem__blurb">{displayBlurb(n)}</p>
                      <Link className="news__more" href={`/news/${slug}`}>
                        {t('news.read_more', 'Read more →')}
                      </Link>
                    </div>
                  </article>
                );
              })}
              {filtered.length === 0 && (
                <p className="panel__body">
                  {newsState === 'loading'
                    ? (language === 'dz' ? 'གསར་འགྱུར་འཚོལ་བཞིན་ཡོད།' : 'Loading updates…')
                    : newsState === 'error'
                      ? (language === 'dz' ? 'གསར་འགྱུར་ད་ལྟ་ལྟ་མི་ཚུགས།' : 'News is temporarily unavailable.')
                      : (language === 'dz' ? 'གསར་འགྱུར་ད་ལྟ་མེད།' : 'No published updates yet.')}
                </p>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="newsaside">
            <div className="newsaside__block">
              <div className="newsaside__head">
                <h2 className="newsaside__title">{t('news.upcoming_events', 'Upcoming events')}</h2>
                <Link className="link-accent" href="/events">
                  {t('news.all_events', 'All events →')}
                </Link>
              </div>
              <div id="newsEvents">
                {eventsList.slice(0, 4).map((e, idx) => (
                  <Link key={e.key || e.id || idx} className="eventrow" href={e.url || `/events/${e.key || e.id}`}>
                    <span className="eventrow__date">
                      <strong>{e.day}</strong>
                      <span>{e.mon}</span>
                    </span>
                    <span className="eventrow__body">
                      <span className="eventrow__title clamp-2">{language === 'dz' ? (e.titleDz || e.title) : e.title}</span>
                      <span className="eventrow__place clamp-1">{language === 'dz' ? (e.locationDz || e.venueDz || e.placeDz || e.place) : e.place}</span>
                    </span>
                  </Link>
                ))}
                {eventsList.length === 0 && (
                  <p className="newsaside__body">
                    {eventsState === 'loading'
                      ? (language === 'dz' ? 'བྱུང་རིམ་འཚོལ་བཞིན་ཡོད།' : 'Loading events…')
                      : eventsState === 'error'
                        ? (language === 'dz' ? 'བྱུང་རིམ་ད་ལྟ་ལྟ་མི་ཚུགས།' : 'Events are temporarily unavailable.')
                        : (language === 'dz' ? 'མ་འོངས་པའི་བྱུང་རིམ་བཀོད་མི་འདུག' : 'No upcoming events are listed yet.')}
                  </p>
                )}
              </div>
            </div>

            <div className="newsaside__block newsaside__block--dark">
              <h2 className="newsaside__title newsaside__title--light">{t('news.publications', 'Reports & publications')}</h2>
              <p className="newsaside__body">
                {t('news.publications_blurb', 'Annual reports, audited accounts, sector studies and the Zorig Chusum catalogue — free to download.')}
              </p>
              <Link className="link-brass" href="/publications">
                {t('news.browse_reports', 'Browse all reports')}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
