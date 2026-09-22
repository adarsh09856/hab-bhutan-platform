'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA } from '@/lib/client-data';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState<string>('');
  const [allRecognised, setAllRecognised] = useState<any[]>(() => CLIENT_DATA.recognised);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetch('/api/honours', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.honours && Array.isArray(d.honours) && d.honours.length > 0) {
          const mapped = d.honours.map((h: any) => ({
            name: h.name,
            craft_key: h.craft,
            dzongkhag: h.dzongkhag,
            honour: h.awardType === 'NationalMaster' ? 'National Craft Award' : h.honour || 'Master Craftsperson',
            since: h.yearAwarded,
            note: h.citation,
            image_path: h.portraitUrl || '/assets/photos/hero-1-weaving.jpg',
            image_alt: h.name,
          }));
          setAllRecognised(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Carousel auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const filtered = !activeTab
    ? allRecognised
    : allRecognised.filter((r) => r.honour === activeTab || r.honour_key === activeTab);

  const totalRecognised = allRecognised.length;
  const uniqueCrafts = Array.from(new Set(allRecognised.map((r) => r.craft_key))).length;
  const earliestYear = Math.min(...allRecognised.map((r) => r.since || 2026));

  const slides = [
    { src: '/assets/photos/hero-1-weaving.jpg', cap: 'photo 1 — a master at the loom' },
    { src: '/assets/photos/hero-4-textiles.jpg', cap: 'photo 2 — thangka painting in mineral pigment' },
    { src: '/assets/photos/hero-5-desho.jpg', cap: 'photo 3 — bamboo splitting, Kheng' },
    { src: '/assets/photos/hero-3-clay.jpg', cap: 'photo 4 — turning burl on the lathe' },
    { src: '/assets/photos/hero-2-punakha.jpg', cap: 'photo 5 — desho paper drying on frames' },
  ];

  return (
    <main id="main">
      {/* 1. Hero & Carousel */}
      <section className="section relative" data-hab-section="masters">
        <SectionEditBadge label="Honours & Masters Studio" studioHref="/admin/honours" sectionType="masters" />
        <p className="crumbs">
          <Link href="/">Home</Link> / Accreditations &amp; awards
        </p>
        <div className="masters-hero">
          <div>
            <p className="eyebrow eyebrow--accent">Recognition</p>
            <h1 className="display display--page">Accreditations &amp; awards</h1>
            <p className="lede">
              A small number of members are recognised individually — for mastery held over a lifetime, for standards that lifted a whole craft, and for the enterprises and young artisans changing how Bhutanese work reaches a market.
            </p>
            <div className="actions">
              <a className="btn btn--ink" href="#holders">
                See who holds them →
              </a>
              <a className="btn btn--outline" href="#nominate">
                How to nominate
              </a>
            </div>
          </div>

          <div className="carousel carousel--masters" data-carousel aria-label="Master craftspeople at work">
            <div className="carousel__track">
              {slides.map((s, i) => (
                <div
                  key={i}
                  className={`carousel__slide ${activeSlide === i ? 'is-on' : ''}`}
                  data-cms-img
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: activeSlide === i ? 1 : 0,
                    transition: 'opacity 0.8s ease',
                    pointerEvents: activeSlide === i ? 'auto' : 'none',
                    zIndex: activeSlide === i ? 2 : 1,
                  }}
                >
                  <Image
                    src={s.src}
                    alt={s.cap}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
            <button
              className="carousel__nav carousel__nav--prev"
              type="button"
              onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              aria-label="Previous photograph"
            >
              ‹
            </button>
            <button
              className="carousel__nav carousel__nav--next"
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
              aria-label="Next photograph"
            >
              ›
            </button>
            <div className="carousel__dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`carousel__dot ${activeSlide === i ? 'is-on' : ''}`}
                  onClick={() => setActiveSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Facts Strip */}
      <section className="section section--tight">
        <div className="craftfacts" id="mastersStats">
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Recognised members</span>
            <span className="craftfacts__val">{totalRecognised}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Honours categories</span>
            <span className="craftfacts__val">{CLIENT_DATA.honours.length}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Crafts represented</span>
            <span className="craftfacts__val">{uniqueCrafts} of 13</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Practising since</span>
            <span className="craftfacts__val">{earliestYear}</span>
          </div>
        </div>
      </section>

      {/* 3. Conferred by HAB */}
      <section className="section" id="awards">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Conferred by HAB</p>
            <h2 className="display display--sub">Recognition given by the association</h2>
            <p className="section__lede">
              Each is conferred by the Board of Trustees on nomination, and each recognises something different. None can be applied for. Accreditations awarded by government agencies and independent bodies are listed alongside them.
            </p>
          </div>
        </div>

        <div className="awardlist" id="awardList">
          {CLIENT_DATA.honours.map((h) => {
            const count = allRecognised.filter(
              (m) => m.honour === h.key || m.honour === h.short
            ).length;

            return (
              <article key={h.key} className="award award--plain">
                <div className="award__body">
                  <div className="award__head">
                    <h3 className="award__title">{h.short}</h3>
                    <span className="award__count">
                      {count} {count === 1 ? 'holder' : 'holders'}
                    </span>
                  </div>
                  <p className="award__what">{h.what}</p>
                  <dl className="deeplist award__meta">
                    <div className="deeplist__row">
                      <dt className="deeplist__key">Awarded</dt>
                      <dd className="deeplist__val">{h.cadence}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            );
          })}
        </div>

        {/* Enterprise Award */}
        <div className="enterprise" id="enterpriseAward">
          <div className="enterprise__body">
            <p className="eyebrow eyebrow--accent">Best Enterprise Award</p>
            <h3 className="display display--panel">Best Craft Enterprise of the Year</h3>
            <p className="enterprise__lede">
              The association’s enterprise-level recognition. It is given to the member business that has changed how a craft trades — through a shared standard, a hallmark, a market opened, or fairer terms for the artisans it works with.
            </p>
            <dl className="enterprise__facts">
              <div>
                <dt>Who is eligible</dt>
                <dd>Any Craft Enterprise or Artisan Cluster in good standing, with dues paid and two consecutive years of trading.</dd>
              </div>
              <div>
                <dt>How a name comes forward</dt>
                <dd>Nomination by two Active Sector Members or a Dzongkhag Chapter. Enterprises may not nominate themselves.</dd>
              </div>
              <div>
                <dt>What it carries</dt>
                <dd>A citation, a published case study, priority for trade fair placement, and use of the award mark on packaging for one year.</dd>
              </div>
              <div>
                <dt>Cycle</dt>
                <dd>Judged annually by the Board of Trustees; announced at the Annual Sector Forum.</dd>
              </div>
            </dl>
            <div className="actions">
              <Link className="btn btn--accent btn--sm" href="/contact?topic=awards">
                Nominate an enterprise
              </Link>
              <a className="btn btn--outline btn--sm" href="#holders">
                See past winners
              </a>
            </div>
          </div>
          <div className="enterprise__aside">
            <p className="eyebrow eyebrow--muted eyebrow--sm">Also recognised here</p>
            <ul className="enterprise__list">
              <li>Accreditations held by HAB and by its members, issued by government agencies</li>
              <li>Awards conferred by independent bodies, trade fairs and development partners</li>
              <li>Certifications of authenticity and origin carried by member enterprises</li>
            </ul>
            <p className="footnote">
              Records for accreditations issued outside HAB are added by the secretariat in the content console.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Who Holds Them */}
      <section className="section" id="holders">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Who holds them</p>
            <h2 className="display display--sub">Recognised members</h2>
            <p className="section__lede" id="holderCount">
              {filtered.length} {filtered.length === 1 ? 'member' : 'members'}{' '}
              {activeTab
                ? `holding the ${activeTab}`
                : 'recognised individually by the association'}
            </p>
          </div>

          <div className="tabs" id="honourTabs" role="tablist" aria-label="Filter by award">
            <button
              type="button"
              className={`tab ${activeTab === '' ? 'is-active' : ''}`}
              role="tab"
              onClick={() => setActiveTab('')}
            >
              All <span className="tab__n">{allRecognised.length}</span>
            </button>
            {CLIENT_DATA.honours.map((h) => {
              const n = allRecognised.filter(
                (m) => m.honour === h.key || m.honour === h.short
              ).length;
              return (
                <button
                  key={h.key}
                  type="button"
                  className={`tab ${activeTab === h.key ? 'is-active' : ''}`}
                  role="tab"
                  onClick={() => setActiveTab(h.key)}
                >
                  {h.short} <span className="tab__n">{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid--3" id="holderGrid" data-cms-repeat>
          {filtered.map((m, i) => {
            const craft = CLIENT_DATA.crafts.find((c) => c.key === m.craft_key) || {
              name: m.craft_key || 'Craft',
              english: '',
            };
            const photoPool = [
              '/assets/photos/hero-1-weaving.jpg',
              '/assets/photos/hero-4-textiles.jpg',
              '/assets/photos/hero-5-desho.jpg',
              '/assets/photos/hero-3-clay.jpg',
              '/assets/photos/hero-2-punakha.jpg',
            ];
            const imgSrc = m.image_path || photoPool[i % photoPool.length];

            return (
              <article key={i} className="card honour">
                <figure className="frame frame--square has-image" data-cms-img style={{ position: 'relative', overflow: 'hidden' }}>
                  <Image
                    src={imgSrc}
                    alt={`${m.name}, ${craft.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </figure>
                <div className="card__body">
                  <span className="honour__badge">{m.honour}</span>
                  <h3 className="card__title">{m.name}</h3>
                  <p className="card__meta">
                    {craft.name} · {m.dzongkhag} · since {m.since}
                  </p>
                  <p className="card__text">{m.note}</p>
                  <Link className="news__more" href={`/shop?craft=${m.craft_key}`}>
                    Shop {craft.name} →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <p className="footnote" style={{ marginTop: 20 }}>
          Names, portraits and citations to be supplied by the secretariat.
        </p>
      </section>

      {/* 5. Nominate a Craftsperson */}
      <section className="section section--last" id="nominate">
        <div className="ctaband">
          <div>
            <h2 className="display display--panel">Nominate a craftsperson</h2>
            <p className="ctaband__body">
              Any two Active Sector Members, or a Dzongkhag Chapter, may put a name forward. Nominations go to the secretariat and are considered by the Board before the Annual Sector Forum. Send the nominee&apos;s name, craft, dzongkhag, and a short account of why.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/contact?topic=awards">
              Write to the secretariat
            </Link>
            <a className="btn btn--ghost" href="#awards">
              The awards
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
