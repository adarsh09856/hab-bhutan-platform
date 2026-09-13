import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA } from '@/lib/client-data';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Membership database · Handicrafts Association of Bhutan',
  description: 'The sector by the numbers. Artisans, master craftspeople and craft enterprises across Bhutan.',
};

const memberCounts: Record<string, number> = {
  shingzo: 412,
  dozo: 305,
  parzo: 486,
  lhazo: 371,
  jinzo: 168,
  lugzo: 143,
  garzo: 214,
  troezo: 397,
  tshazo: 892,
  thagzo: 3140,
  tshemzo: 648,
  shagzo: 176,
  dezo: 148,
};

const regionCounts = [
  { name: 'Lhuentse', n: 940 },
  { name: 'Zhemgang', n: 720 },
  { name: 'Trashigang', n: 690 },
  { name: 'Bumthang', n: 615 },
  { name: 'Thimphu', n: 580 },
  { name: 'Trashiyangtse', n: 520 },
  { name: 'Mongar', n: 470 },
  { name: 'Paro', n: 405 },
  { name: 'Punakha', n: 360 },
  { name: 'Other dzongkhags', n: 2200, aggregate: true },
];

async function getRecognisedMembers() {
  try {
    const dbHonours = await prisma.honourRecord.findMany({
      orderBy: { yearAwarded: 'desc' },
      take: 6,
    });
    if (dbHonours.length > 0) {
      return dbHonours.map((h) => ({
        name: h.name,
        craft_key: h.craft,
        dzongkhag: h.dzongkhag,
        honour: h.awardType === 'NationalMaster' ? 'National Craft Award' : 'Master Craftsperson',
        since: h.yearAwarded,
        note: h.citation,
        image_path: h.portraitUrl || '/assets/photos/hero-1-weaving.jpg',
      }));
    }
  } catch {}
  return CLIENT_DATA.recognised;
}

export default async function MembersPage() {
  const recognised = await getRecognisedMembers();
  const total = Object.values(memberCounts).reduce((t, n) => t + n, 0);

  const sortedCrafts = CLIENT_DATA.crafts.slice().sort((a, b) => {
    return (memberCounts[b.key] || 0) - (memberCounts[a.key] || 0);
  });

  const regions = regionCounts.filter((r) => !r.aggregate);
  const aggregate = regionCounts.find((r) => r.aggregate);
  const maxRegion = Math.max(...regions.map((r) => r.n), 1);

  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / Members
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Membership</p>
            <h1 className="display display--page">The sector, by the numbers</h1>
            <p className="lede">
              HAB represents artisans and craft enterprises in every dzongkhag of Bhutan. Rather than list every member, this page shows the shape of the sector — how many people work in each of the thirteen crafts, and where they are.
            </p>
            <p className="craft__count" id="memberTotal" style={{ margin: 0 }}>
              {total.toLocaleString('en-US')} registered members
            </p>
          </div>
          <div className="panel panel--accent">
            <p className="eyebrow eyebrow--onaccent">Looking for someone?</p>
            <h2 className="display display--panel display--onaccent">We will introduce you</h2>
            <p className="panel__body panel__body--onaccent">
              Member contact details are held by the secretariat and not published, so tell us what you need — a craft, a quantity, a delivery date — and we will put you in touch with members who can do it.
            </p>
            <div className="actions">
              <Link className="btn btn--light" href="/contact">
                Request an introduction
              </Link>
              <Link className="btn btn--ghost" href="/shop">
                Or shop online
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. By Craft Category */}
      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">By craft category</p>
            <h2 className="display display--sub">Members in each of the thirteen crafts</h2>
            <p className="section__lede">
              Weaving is by far the largest, and the five smallest are the crafts HAB&apos;s skills transmission work is aimed at.
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/#crafts">
            About the crafts →
          </Link>
        </div>

        <div className="countgrid" id="countGrid" data-cms-repeat>
          {sortedCrafts.map((c) => {
            const n = memberCounts[c.key] || 0;
            const share = Math.round((n / total) * 100);

            return (
              <article key={c.key} className="countcard">
                <span className="countcard__n">{n.toLocaleString('en-US')}</span>
                <div className="countcard__body">
                  <h3 className="countcard__name">{c.name}</h3>
                  <span className="countcard__en">{c.english}</span>
                </div>
                <div className="countcard__foot">
                  <div className="countcard__bar">
                    <div
                      className="countcard__fill"
                      style={{ width: `${Math.max(share, 2)}%` }}
                    />
                  </div>
                  <span className="countcard__share">{share}% of members</span>
                </div>
                <div className="countcard__links">
                  <Link
                    className="countcard__link"
                    href={c.key === 'dozo' ? `/craft/${c.key}` : `/shop?craft=${c.key}`}
                  >
                    Shop {c.name} →
                  </Link>
                  <Link className="countcard__link countcard__link--quiet" href={`/craft/${c.key}`}>
                    About the craft →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. By Dzongkhag */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">By dzongkhag</p>
            <h2 className="display display--sub">Where the members are</h2>
            <p className="section__lede">
              Craft is a rural livelihood: the largest concentrations are in the eastern and central dzongkhags, not in Thimphu.
            </p>
          </div>
          <div className="regionlist" id="regionList" data-cms-repeat>
            {regions.map((r) => {
              const widthPct = Math.round((r.n / maxRegion) * 100);
              return (
                <div key={r.name} className="regionrow">
                  <span className="regionrow__name">{r.name}</span>
                  <span className="regionrow__bar">
                    <span className="regionrow__fill" style={{ width: `${widthPct}%` }} />
                  </span>
                  <span className="regionrow__n">{r.n.toLocaleString('en-US')}</span>
                </div>
              );
            })}
            {aggregate && (
              <div className="regionrow regionrow--total">
                <span className="regionrow__name">{aggregate.name}</span>
                <span className="regionrow__note">across the remaining eleven dzongkhags</span>
                <span className="regionrow__n">{aggregate.n.toLocaleString('en-US')}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Recognised Members */}
      <section className="section" id="recognised">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Recognised members</p>
            <h2 className="display display--sub">Masters, award winners &amp; enterprises</h2>
            <p className="section__lede">
              A small number of members are recognised individually — master craftspeople, national award winners, and the enterprises that have changed how a craft trades.
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/clusters">
            Visit the clusters →
          </Link>
        </div>

        <div className="grid grid--3" id="honourGrid" data-cms-repeat>
          {recognised.slice(0, 6).map((m, i) => {
            const craft = CLIENT_DATA.crafts.find((c) => c.key === m.craft_key) || {
              name: m.craft_key || 'Craft',
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
                    alt={m.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <figcaption className="frame__caption frame__caption--sm">
                    portrait — {craft.name.toLowerCase()} practitioner
                  </figcaption>
                </figure>
                <div className="card__body">
                  <span className="honour__badge">{m.honour}</span>
                  <h3 className="card__title">
                    <Link href={`/members/${encodeURIComponent(m.name)}`}>{m.name}</Link>
                  </h3>
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

      {/* 5. CTA Band */}
      <section className="section section--last">
        <div className="ctaband">
          <div>
            <h2 className="display display--panel">Not a member yet?</h2>
            <p className="ctaband__body">
              Individual artisans, craft enterprises, artisan clusters and affiliated organisations can all register online. Applications are verified by the secretariat within five working days.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/register">
              Register as a member
            </Link>
            <Link className="btn btn--ghost" href="/membership">
              Compare categories
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
