'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA } from '@/lib/client-data';

export default function NewsPage() {
  const [newsList, setNewsList] = useState<any[]>(() => CLIENT_DATA.news);
  const [eventsList, setEventsList] = useState<any[]>(() => CLIENT_DATA.events);
  const [selectedKind, setSelectedKind] = useState<string>('');

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((d) => {
        if (d?.articles && Array.isArray(d.articles) && d.articles.length > 0) {
          setNewsList(
            d.articles.map((a: any) => ({
              id: a.id,
              slug: a.slug || a.id,
              kind: a.kind || 'Notice',
              title: a.title,
              blurb: a.blurb || a.summary || '',
              published_at: a.dateString || a.published_at || 'Recent',
              image_path: a.image_path || '/assets/photos/hero-4-textiles.jpg',
            }))
          );
        }
        if (d?.events && Array.isArray(d.events) && d.events.length > 0) {
          setEventsList(d.events);
        }
      })
      .catch(() => {});
  }, []);

  const kinds = Array.from(new Set(newsList.map((n) => n.kind))).filter(Boolean);

  const filtered = !selectedKind
    ? newsList
    : newsList.filter((n) => n.kind === selectedKind);

  const photoPool = [
    '/assets/photos/about-hab.jpg',
    '/assets/photos/hero-4-textiles.jpg',
    '/assets/photos/hero-1-weaving.jpg',
    '/assets/photos/hero-5-desho.jpg',
    '/assets/photos/hero-2-punakha.jpg',
  ];

  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / News &amp; events
        </p>
        <h1 className="display display--page">News &amp; events</h1>
        <p className="lede">Stay informed, stay empowered.</p>

        <div className="newsrow" style={{ marginTop: 34 }}>
          {/* Left: Articles List */}
          <div>
            <div className="filterbar filterbar--slim">
              <label className="visually-hidden" htmlFor="newsFilter">
                Category
              </label>
              <select
                className="input"
                id="newsFilter"
                value={selectedKind}
                onChange={(e) => setSelectedKind(e.target.value)}
              >
                <option value="">All categories</option>
                {kinds.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <span className="craft__count" id="newsCount" style={{ margin: 0, alignSelf: 'center' }}>
                {filtered.length} {filtered.length === 1 ? 'post' : 'posts'}
              </span>
            </div>

            <div className="newslist" id="newsList" data-cms-repeat>
              {filtered.map((n, idx) => {
                const imgSrc = n.image_path || photoPool[idx % photoPool.length];
                const slug = n.slug || n.id || `post-${idx}`;

                return (
                  <article key={slug} className="card news" data-cms-item>
                    <Link className="news__shot" href={`/news/${slug}`}>
                      <figure className="frame frame--wide16 has-image" data-cms-img style={{ position: 'relative', overflow: 'hidden' }}>
                        <Image
                          src={imgSrc}
                          alt={n.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 40vw"
                          style={{ objectFit: 'cover' }}
                        />
                      </figure>
                    </Link>

                    <div className="card__body">
                      <div className="news__meta">
                        <span className="tag">{n.kind}</span>
                        <span className="news__date">{n.published_at || 'Recent'}</span>
                      </div>
                      <h2 className="news__title clamp-2">
                        <Link href={`/news/${slug}`}>{n.title}</Link>
                      </h2>
                      <p className="card__text clamp-3">{n.blurb}</p>
                      <Link className="news__more" href={`/news/${slug}`}>
                        Read the full story →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="newsaside">
            <div className="newsaside__block">
              <div className="newsaside__head">
                <h2 className="newsaside__title">Upcoming events</h2>
                <Link className="link-accent" href="/events">
                  All events →
                </Link>
              </div>
              <div id="newsEvents">
                {eventsList.slice(0, 4).map((e) => (
                  <Link key={e.key} className="eventrow" href={`/events/${e.key}`}>
                    <span className="eventrow__date">
                      <strong>{e.day || '12'}</strong>
                      <span>{e.mon || 'OCT'}</span>
                    </span>
                    <span className="eventrow__body">
                      <span className="eventrow__title clamp-2">{e.title}</span>
                      <span className="eventrow__place clamp-1">{e.place}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="newsaside__block newsaside__block--dark">
              <h2 className="newsaside__title newsaside__title--light">Reports &amp; publications</h2>
              <p className="newsaside__body">
                Annual reports, audited accounts, sector studies and the Zorig Chusum catalogue — free to download.
              </p>
              <Link className="link-brass" href="/publications">
                Browse all reports
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
