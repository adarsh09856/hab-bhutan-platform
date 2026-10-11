'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA } from '@/lib/client-data';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import LocalizedRecordField from '@/components/public/LocalizedRecordField';
import { useLanguage } from '@/context/LanguageContext';

export default function MastersPage() {
  const { language } = useLanguage();
  const dz = language === 'dz';
  const text = (english: string, dzongkha: string) => dz ? dzongkha : english;
  const [activeTab, setActiveTab] = useState<string>('');
  const [allRecognised, setAllRecognised] = useState<any[]>([]);
  const [honoursStatus, setHonoursStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetch('/api/honours', { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || data?.success !== true || !Array.isArray(data.honours)) throw new Error('Honours unavailable');
        return data;
      })
      .then((d) => {
        const mapped = d.honours.map((h: any) => ({
          name: h.name,
          craft_key: h.craft,
          dzongkhag: h.dzongkhag,
          honour: h.awardType === 'NationalMaster' ? 'National Craft Award' : h.honour || 'Master Craftsperson',
          since: h.yearAwarded,
          note: h.citation,
          noteDz: h.citationDz || '',
          image_path: h.portraitUrl || '',
          image_alt: h.name,
        }));
        setAllRecognised(mapped);
        setHonoursStatus('ready');
      })
      .catch(() => setHonoursStatus('error'));
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
  const earliestYear = allRecognised.length ? Math.min(...allRecognised.map((r) => r.since || 2026)) : null;

  const slides = [
    { src: '/assets/photos/hero-1-weaving.jpg', cap: text('Bhutanese craft photograph 1', 'འབྲུག་གི་ལག་བཟོའི་པར་རིས་ ༡') },
    { src: '/assets/photos/hero-4-textiles.jpg', cap: text('Bhutanese craft photograph 2', 'འབྲུག་གི་ལག་བཟོའི་པར་རིས་ ༢') },
    { src: '/assets/photos/hero-5-desho.jpg', cap: text('Bhutanese craft photograph 3', 'འབྲུག་གི་ལག་བཟོའི་པར་རིས་ ༣') },
    { src: '/assets/photos/hero-3-clay.jpg', cap: text('Bhutanese craft photograph 4', 'འབྲུག་གི་ལག་བཟོའི་པར་རིས་ ༤') },
    { src: '/assets/photos/hero-2-punakha.jpg', cap: text('Bhutanese craft photograph 5', 'འབྲུག་གི་ལག་བཟོའི་པར་རིས་ ༥') },
  ];
  const awardLabel = (name: string) => dz ? ({
    'Master Craftsperson': 'ལག་བཟོ་མཁས་པ',
    'National Craft Award': 'རྒྱལ་ཡོངས་ལག་བཟོའི་གཟེངས་རྟགས',
    'Enterprise of the Year': 'ལོ་འཁོར་གྱི་ཚོང་ལས',
    'Young Artisan Award': 'ལག་བཟོ་གཞོནམ་གྱི་གཟེངས་རྟགས',
  } as Record<string, string>)[name] || name : name;

  return (
    <main id="main">
      {/* 1. Hero & Carousel */}
      <section className="section relative" data-hab-section="masters">
        <SectionEditBadge label={text('Honours & Masters Studio', 'གཟེངས་བསྟོད་དང་ལག་བཟོ་མཁས་པའི་ལས་ཁུངས')} studioHref="/admin/honours" sectionType="masters" />
        <p className="crumbs">
          <Link href="/">{text('Home', 'གདོང་ཤོག')}</Link> / {text('Accreditations & awards', 'ངོས་ལེན་དང་གཟེངས་བསྟོད')}
        </p>
        <div className="masters-hero">
          <div>
            <p className="eyebrow eyebrow--accent">{text('Recognition', 'ངོས་ལེན')}</p>
            <h1 className="display display--page">{text('Accreditations & awards', 'ངོས་ལེན་དང་གཟེངས་བསྟོད')}</h1>
            <p className="lede">
              {text('A small number of members are recognised individually — for mastery held over a lifetime, for standards that lifted a whole craft, and for the enterprises and young artisans changing how Bhutanese work reaches a market.', 'འཐུས་མི་ཉུང་ཤས་ཅིག་ལུ་ ཚེ་གང་གི་མཁས་རིག་ ལག་བཟོ་ཡོངས་ཀྱི་སྤུས་ཚད་ཡར་དྲག་བཏང་མི་ དང་ འབྲུག་གི་ལག་བཟོ་ཚོང་ལམ་ནང་འཁྱེར་མི་ཚོང་ལས་དང་ལག་བཟོ་གཞོནམ་ཚུ་ལུ་ངོ་བསྟོད་འབདཝ་ཨིན།')}
            </p>
            <div className="actions">
              <a className="btn btn--ink" href="#holders">
                {text('See who holds them →', 'གཟེངས་བསྟོད་ཐོབ་མི་ཚུ་གཟིགས →')}
              </a>
              <a className="btn btn--outline" href="#nominate">
                {text('How to nominate', 'མིང་འདོན་ཐངས')}
              </a>
            </div>
          </div>

          <div className="carousel carousel--masters" data-carousel aria-label={text('Craft photographs', 'ལག་བཟོའི་པར་རིས')}>
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
              aria-label={text('Previous photograph', 'པར་རིས་ཧེ་མ')}
            >
              ‹
            </button>
            <button
              className="carousel__nav carousel__nav--next"
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
              aria-label={text('Next photograph', 'པར་རིས་ཤུལ་མ')}
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
                  aria-label={text(`Slide ${i + 1}`, `སྒྲིག་གནས་ ${i + 1}`)}
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
            <span className="craftfacts__key">{text('Recognised members', 'ངོས་ལེན་ཐོབ་མི་འཐུས་མི')}</span>
            <span className="craftfacts__val">{honoursStatus === 'ready' ? totalRecognised : '—'}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">{text('Honours categories', 'གཟེངས་བསྟོད་དབྱེ་ཁག')}</span>
            <span className="craftfacts__val">{CLIENT_DATA.honours.length}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">{text('Crafts represented', 'ལག་བཟོའི་དབྱེ་ཁག')}</span>
            <span className="craftfacts__val">{honoursStatus === 'ready' ? `${uniqueCrafts} ${dz ? 'ལས་ ༡༣' : 'of 13'}` : '—'}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">{text('Practising since', 'ལག་ལེན་འགོ་བཙུགས་ལོ')}</span>
            <span className="craftfacts__val">{earliestYear ?? '—'}</span>
          </div>
        </div>
      </section>

      {/* 3. Conferred by HAB */}
      <section className="section" id="awards">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">{text('Conferred by HAB', 'HAB གིས་གནང་བའི་གཟེངས་བསྟོད')}</p>
            <h2 className="display display--sub">{text('Recognition given by the association', 'ཚོགས་པ་གིས་གནང་བའི་ངོས་ལེན')}</h2>
            <p className="section__lede">
              {text('Each is conferred by the Board of Trustees on nomination, and each recognises something different. None can be applied for. Accreditations awarded by government agencies and independent bodies are listed alongside them.', 'གཟེངས་བསྟོད་རེ་རེ་འདི་ འཛིན་སྐྱོང་ལྷན་ཚོགས་ལུ་མིང་འདོན་ཐོག་ལས་གནངམ་ཨིན། གཟེངས་བསྟོད་རེ་རེ་གིས་ཁྱད་པར་ཅན་གྱི་གྲུབ་འབྲས་ངོས་ལེན་འབདཝ་ཨིན། འདི་ཚུ་ལུ་ཞུ་ཡིག་ཕུལ་མི་ཆོག། གཞུང་གི་ལས་སྡེ་དང་རང་དབང་ལས་སྡེ་ཚུ་གིས་གནང་བའི་ངོས་ལེན་ཚུ་ཡང་འདི་དང་གཅིག་ཁར་བཀོད་ཡོད།')}
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
                    <h3 className="award__title">{awardLabel(h.short)}</h3>
                    <span className="award__count">
                      {count} {count === 1 ? text('holder', 'ཐོབ་མི') : text('holders', 'ཐོབ་མི་ཚུ')}
                    </span>
                  </div>
                  <p className="award__what">{text(h.what, ({
                    'Master Craftsperson': 'ཚོགས་པའི་གནས་ཚད་མཐོ་ཤོས་ཨིན། མཁས་པ་ཚུ་གིས་སློབ་མ་བཞེས་དགོཔ་དང་ ལག་བཟོའི་རྒྱུན་འཛིན་ལས་རིམ་གྱི་ས་གོ་ཚུ་ནང་གདམ་ཁ་ཐོག་མ་འཐོབ་ཨིན།',
                    'National Craft Award': 'གཟེངས་བསྟོད་ལག་ཁྱེར་དང་ HAB ཐོ་དེབ་ནང་ས་གོ་ དེ་ལས་ཚོང་སྟོན་དང་ཉོ་མཁན་ངོ་སྤྲོད་ནང་གདམ་ཁ་ཐོག་མ་འཐོབ་ཨིན།',
                    'Enterprise of the Year': 'མི་ངོ་རྐྱང་པ་ལུ་མེན་པར་ཚོང་ལས་ལུ་ངོས་ལེན་འབདཝ་ཨིན། གཟེངས་བསྟོད་ལག་ཁྱེར་དང་ HAB གིས་དཔེ་སྟོན་གནས་ཚུལ་དཔེ་སྐྲུན་འབདཝ་ཨིན།',
                    'Young Artisan Award': 'གཟེངས་བསྟོད་ལག་ཁྱེར་ ཐོན་སྐྱེད་གོང་འཕེལ་མ་དངུལ་དང་སློབ་སྟོན་པ་མཉམ་སྦྲགས་འབདཝ་ཨིན།',
                  } as Record<string, string>)[h.short] || h.what)}</p>
                  <dl className="deeplist award__meta">
                    <div className="deeplist__row">
                      <dt className="deeplist__key">{text('Awarded', 'གནང་སྟེ')}</dt>
                      <dd className="deeplist__val">{text(h.cadence, h.cadence === 'Awarded annually' ? 'ལོ་བསྟར་གནངམ་ཨིན།' : 'ལོ་བསྟར་ཞིབ་འཇུག་འབད་དེ་ ལོ་བསྟར་སྡེ་ཚན་ཚོགས་འདུ་ནང་གསལ་བསྒྲགས་འབདཝ་ཨིན།')}</dd>
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
            <p className="eyebrow eyebrow--accent">{text('Best Enterprise Award', 'ཚོང་ལས་གཟེངས་བསྟོད་ཡག་ཤོས')}</p>
            <h3 className="display display--panel">{text('Best Craft Enterprise of the Year', 'ལོ་འཁོར་གྱི་ལག་བཟོ་ཚོང་ལས་ཡག་ཤོས')}</h3>
            <p className="enterprise__lede">
              {text('The association’s enterprise-level recognition. It is given to the member business that has changed how a craft trades — through a shared standard, a hallmark, a market opened, or fairer terms for the artisans it works with.', 'འདི་ཚོགས་པའི་ཚོང་ལས་གནས་རིམ་གྱི་ངོས་ལེན་ཨིན། ལག་བཟོའི་ཚོང་ལམ་ལུ་སྤུས་ཚད་གཅིག་མཚུངས་ རྟགས་མ་ ཚོང་ལམ་གསརཔ་ ཡང་ན་ལག་བཟོ་པ་ཚུ་ལུ་ཁེ་ཕན་དྲག་པའི་གནས་ཚིག་བཟོ་མི་འཐུས་མིའི་ཚོང་ལས་ལུ་གནངམ་ཨིན།')}
            </p>
            <dl className="enterprise__facts">
              <div>
                <dt>{text('Who is eligible', 'འོས་འབབ་ཡོད་མི')}</dt>
                <dd>{text('Any Craft Enterprise or Artisan Cluster in good standing, with dues paid and two consecutive years of trading.', 'གླ་འཐུས་སྤྲོད་ཚར་ཏེ་ ལོ་གཉིས་བསྟུད་མར་ཚོང་འབད་མི་ གནས་ཚད་ལེགས་ཤོམ་ནང་ཡོད་པའི་ལག་བཟོ་ཚོང་ལས་གང་རུང་ཅིག་ ཡང་ན་ལག་བཟོ་པའི་སྡེ་ཚན།')}</dd>
              </div>
              <div>
                <dt>{text('How a name comes forward', 'མིང་འདོན་ཐངས')}</dt>
                <dd>{text('Nomination by two Active Sector Members or a Dzongkhag Chapter. Enterprises may not nominate themselves.', 'ལས་སྡེའི་འཐུས་མི་ཤུགས་ལྡན་གཉིས་ ཡང་ན་རྫོང་ཁག་ཡན་ལག་ཚོགས་པ་ཅིག་གིས་མིང་འདོན་དགོ། ཚོང་ལས་རང་གིས་རང་མིང་འདོན་མི་ཆོག།')}</dd>
              </div>
              <div>
                <dt>{text('What it carries', 'གཟེངས་བསྟོད་ཀྱི་ཁེ་ཕན')}</dt>
                <dd>{text('A citation, a published case study, priority for trade fair placement, and use of the award mark on packaging for one year.', 'ངོས་ལེན་ཡི་གེ་ དཔེ་མཚོན་ཞིབ་འཇུག་དཔེ་སྐྲུན་ ཚོང་སྟོན་ནང་ས་གོ་ཐོབ་ཐང་དང་ ལོ་གཅིག་གི་རིང་ཐུམ་སྒྲིལ་གུ་གཟེངས་བསྟོད་རྟགས་མ་ལག་ལེན་འཐབ་ཆོག།')}</dd>
              </div>
              <div>
                <dt>{text('Cycle', 'གནང་ཐངས')}</dt>
                <dd>{text('Judged annually by the Board of Trustees; announced at the Annual Sector Forum.', 'འཛིན་སྐྱོང་ལྷན་ཚོགས་ཀྱིས་ལོ་བསྟར་ཞིབ་དཔྱད་འབད་དེ་ ལོ་བསྟར་ལས་སྡེའི་གྲོས་འཛོམས་ནང་གསལ་བསྒྲགས་འབདཝ་ཨིན།')}</dd>
              </div>
            </dl>
            <div className="actions">
              <Link className="btn btn--accent btn--sm" href="/contact?topic=awards">
                {text('Nominate an enterprise', 'ཚོང་ལས་ཅིག་མིང་འདོན')}
              </Link>
              <a className="btn btn--outline btn--sm" href="#holders">
                {text('See past winners', 'ཧེ་མའི་གཟེངས་བསྟོད་ཐོབ་མི་ཚུ་གཟིགས')}
              </a>
            </div>
          </div>
          <div className="enterprise__aside">
            <p className="eyebrow eyebrow--muted eyebrow--sm">{text('Also recognised here', 'འདི་ནང་ངོས་ལེན་ཐོབ་མི་གཞན')}</p>
            <ul className="enterprise__list">
              <li>{text('Accreditations held by HAB and by its members, issued by government agencies', 'གཞུང་གི་ལས་སྡེ་ཚུ་གིས་ HAB དང་འཐུས་མི་ཚུ་ལུ་གནང་བའི་ངོས་ལེན')}</li>
              <li>{text('Awards conferred by independent bodies, trade fairs and development partners', 'རང་དབང་ལས་སྡེ་ ཚོང་སྟོན་དང་གོང་འཕེལ་མཉམ་འབྲེལ་ཚུ་གིས་གནང་བའི་གཟེངས་བསྟོད')}</li>
              <li>{text('Certifications of authenticity and origin carried by member enterprises', 'འཐུས་མིའི་ཚོང་ལས་ཚུ་གི་བདེན་ཁུངས་དང་འབྱུང་ཁུངས་ལག་ཁྱེར')}</li>
            </ul>
            <p className="footnote">
              {text('Records for accreditations issued outside HAB are added by the secretariat in the content console.', 'HAB ཕྱི་ཁར་གནང་བའི་ངོས་ལེན་གྱི་ཐོ་ཚུ་ ལས་ཚོགས་ཀྱིས་ནང་དོན་ཚོད་འཛིན་ནང་ཁ་སྐོང་འབདཝ་ཨིན།')}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Who Holds Them */}
      <section className="section" id="holders">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">{text('Who holds them', 'གཟེངས་བསྟོད་ཐོབ་མི')}</p>
            <h2 className="display display--sub">{text('Recognised members', 'ངོས་ལེན་ཐོབ་མི་འཐུས་མི')}</h2>
            <p className="section__lede" id="holderCount">
              {filtered.length} {filtered.length === 1 ? text('member', 'འཐུས་མི') : text('members', 'འཐུས་མི་ཚུ')}{' '}
              {activeTab
                ? text(`holding the ${activeTab}`, `${awardLabel(activeTab)} ཐོབ་མི`)
                : text('recognised individually by the association', 'ཚོགས་པ་གིས་སྒེར་ངོས་ལེན་གནང་ཡོད།')}
            </p>
          </div>

          <div className="tabs" id="honourTabs" role="tablist" aria-label={text('Filter by award', 'གཟེངས་བསྟོད་ཀྱིས་དབྱེ་བ')}>
            <button
              type="button"
              className={`tab ${activeTab === '' ? 'is-active' : ''}`}
              role="tab"
              onClick={() => setActiveTab('')}
            >
              {text('All', 'ཆ་མཉམ')} <span className="tab__n">{allRecognised.length}</span>
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
                  {awardLabel(h.short)} <span className="tab__n">{n}</span>
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
              dzongkha: '',
            };
            const imgSrc = m.image_path || '';
            const hasPortrait = Boolean(imgSrc) && !/\/assets\/photos\/(?:hero-[^/]+|about-hab\.jpg)(?:[?#].*)?$/i.test(imgSrc);

            return (
              <article key={i} className="card honour">
                {hasPortrait && <figure className="frame frame--square has-image" data-cms-img style={{ position: 'relative', overflow: 'hidden' }}>
                  <Image
                    src={imgSrc}
                    alt={`${m.name}, ${craft.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </figure>}
                <div className="card__body">
                  <span className="honour__badge">{awardLabel(m.honour)}</span>
                  <h3 className="card__title">{m.name}</h3>
                  <p className="card__meta">
                    {craft.dzongkha && dz ? craft.dzongkha : craft.name} · {m.dzongkhag} · {text('since', 'ལོ་')} {m.since}
                  </p>
                  <LocalizedRecordField as="p" className="card__text" english={m.note} dzongkha={m.noteDz} />
                  <Link className="news__more" href={`/shop?craft=${m.craft_key}`}>
                    {text(`Shop ${craft.name} →`, `ལག་བཟོ་${craft.dzongkha && dz ? craft.dzongkha : craft.name} ཉོ →`)}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <p className="footnote" role="status" style={{ marginTop: 20 }}>
          {honoursStatus === 'loading' ? text('Loading recognised members…', 'ངོས་ལེན་ཐོབ་མི་འཐུས་མི་ཚུ་ཕབ་ལེན་འབད་དོ…') : honoursStatus === 'error' ? text('The honours directory is temporarily unavailable.', 'གཟེངས་བསྟོད་ཐོ་གཞུང་འདི་གནས་སྐབས་ཅིག་ལག་ལེན་མི་འཐབ།') : allRecognised.length === 0 ? text('No recognised-member profiles have been published yet.', 'ད་ལྟོ་ངོས་ལེན་ཐོབ་མིའི་གསལ་སྡུད་ཅིག་ཡང་དཔེ་སྐྲུན་མ་འབད།') : text('Profiles are managed by the HAB Secretariat.', 'གསལ་སྡུད་ཚུ་ HAB ལས་ཚོགས་ཀྱིས་འཛིན་སྐྱོང་འཐབ་ཨིན།')}
        </p>
      </section>

      {/* 5. Nominate a Craftsperson */}
      <section className="section section--last" id="nominate">
        <div className="ctaband">
          <div>
            <h2 className="display display--panel">{text('Nominate a craftsperson', 'ལག་བཟོ་པ་ཅིག་མིང་འདོན')}</h2>
            <p className="ctaband__body">
              {text('Any two Active Sector Members, or a Dzongkhag Chapter, may put a name forward. Nominations go to the secretariat and are considered by the Board before the Annual Sector Forum. Send the nominee’s name, craft, dzongkhag, and a short account of why.', 'ལས་སྡེའི་འཐུས་མི་ཤུགས་ལྡན་གཉིས་ ཡང་ན་རྫོང་ཁག་ཡན་ལག་ཚོགས་པ་ཅིག་གིས་མིང་འདོན་ཆོག། མིང་འདོན་ཚུ་ལས་ཚོགས་ལུ་བསྐྱལ་དགོཔ་དང་ ལོ་བསྟར་ལས་སྡེའི་གྲོས་འཛོམས་ཧེ་མ་ལྷན་ཚོགས་ཀྱིས་བསམ་ཞིབ་འབདཝ་ཨིན། མིང་འདོན་འབད་མིའི་མིང་ ལག་བཟོ་ རྫོང་ཁག་དང་ག་ཅི་འབད་མིང་འདོན་འབད་དགོཔ་ཨིན་ནའི་བསྡུས་བརྗོད་བསྐྱལ་གནང་།')}
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/contact?topic=awards">
              {text('Write to the secretariat', 'ལས་ཚོགས་ལུ་ཡི་གེ་བྲིས')}
            </Link>
            <a className="btn btn--ghost" href="#awards">
              {text('The awards', 'གཟེངས་བསྟོད་ཚུ')}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
