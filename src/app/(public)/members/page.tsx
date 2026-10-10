import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA } from '@/lib/client-data';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Membership database · Handicrafts Association of Bhutan',
  description: 'The sector by the numbers. Artisans, master craftspeople and craft enterprises across Bhutan.',
};

async function getRecognisedMembers() {
  try {
    const dbHonours = await prisma.honourRecord.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { yearAwarded: 'desc' }, { name: 'asc' }],
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
        image_path: h.portraitUrl || '',
      }));
    }
  } catch {}
  return CLIENT_DATA.recognised.filter((member) => !/^name to confirm$/i.test(member.name.trim()));
}

function isPlaceholderPortrait(src: string) {
  return /\/assets\/photos\/(?:hero-[^/]+|about-hab\.jpg)(?:[?#].*)?$/i.test(src);
}

export default async function MembersPage() {
  const recognised = await getRecognisedMembers();

  const dynamicMemberCounts: Record<string, number> = Object.fromEntries(CLIENT_DATA.crafts.map((craft) => [craft.key, 0]));
  const dynamicRegionCounts = new Map<string, number>();
  let countsAvailable = true;
  let registeredMembers: { name: string; regNumber: string; craftKey: string | null; dzongkhag: string | null }[] = [];

  try {
    const dbMembers = await prisma.member.findMany({
      where: { status: 'VERIFIED' },
      select: { name: true, regNumber: true, craftKey: true, dzongkhag: true },
      orderBy: { name: 'asc' },
    });
    registeredMembers = dbMembers;
    dbMembers.forEach((m) => {
      if (m.craftKey && dynamicMemberCounts[m.craftKey] !== undefined) {
        dynamicMemberCounts[m.craftKey] += 1;
      }
      if (m.dzongkhag) dynamicRegionCounts.set(m.dzongkhag, (dynamicRegionCounts.get(m.dzongkhag) || 0) + 1);
    });
  } catch { countsAvailable = false; }

  const total = registeredMembers.length;

  const sortedCrafts = CLIENT_DATA.crafts.slice().sort((a, b) => {
    return (dynamicMemberCounts[b.key] || 0) - (dynamicMemberCounts[a.key] || 0);
  });

  const regions = [...dynamicRegionCounts].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  const maxRegion = Math.max(...regions.map((r) => r.n), 1);

  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="members">
        <SectionEditBadge label="Members Studio" studioHref="/admin/members" />
        <p className="crumbs">
          <Link href="/">Home</Link> / Members
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Membership</p>
            <h1 className="display display--page">The sector, by the numbers</h1>
            <p className="lede">
              Explore verified HAB members by craft and dzongkhag. The figures below reflect member records currently held in the directory.
            </p>
            <p className="craft__count" id="memberTotal" style={{ margin: 0 }}>
              {countsAvailable ? `${total.toLocaleString('en-US')} verified members recorded` : 'Member counts are temporarily unavailable'}
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

      <section className="section relative" data-hab-section="registered-members">
        <SectionEditBadge label="Registered members" studioHref="/admin/members" sectionType="members" />
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Member directory</p>
            <h2 className="display display--sub">Registered HAB members</h2>
            <p className="section__lede">Verified records from the membership registry. Contact the secretariat for an introduction.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-cms-repeat>
          {registeredMembers.map((member) => (
            <article key={member.regNumber} className="rounded-2xl border border-stone-200 bg-white p-6">
              <h3 className="font-serif text-lg font-bold">{member.name}</h3>
              <p className="mt-2 text-sm text-stone-600">{CLIENT_DATA.crafts.find((craft) => craft.key === member.craftKey)?.name || member.craftKey || 'Craft not recorded'}</p>
              {member.dzongkhag && <p className="text-sm text-stone-600">{member.dzongkhag}</p>}
              <Link className="btn btn--ink btn--sm mt-4" href={`/members/${encodeURIComponent(member.regNumber)}`}>View member profile →</Link>
            </article>
          ))}
        </div>
        {registeredMembers.length === 0 && <p role="status">{countsAvailable ? 'No verified members have been published yet.' : 'The member directory is temporarily unavailable.'}</p>}
      </section>

      {/* 2. By Craft Category */}
      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">By craft category</p>
            <h2 className="display display--sub">Members in each of the thirteen crafts</h2>
            <p className="section__lede">
              These counts update when member records are verified by the secretariat.
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/#crafts">
            About the crafts →
          </Link>
        </div>

        <div className="countgrid" id="countGrid" data-cms-repeat>
          {sortedCrafts.map((c) => {
            const n = dynamicMemberCounts[c.key] || 0;
            const share = total > 0 ? Math.round((n / total) * 100) : 0;

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
                      style={{ width: `${share}%` }}
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
              Dzongkhag totals show the locations recorded for verified members.
            </p>
          </div>
          <div className="regionlist" id="regionList" data-cms-repeat>
            {regions.length === 0 && <p>{countsAvailable ? 'No verified member locations have been recorded yet.' : 'Member locations are temporarily unavailable.'}</p>}
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
          {recognised.slice(0, 6).map((m) => {
            const craft = CLIENT_DATA.crafts.find((c) => c.key === m.craft_key) || {
              name: m.craft_key || 'Craft',
            };
            const imgSrc = m.image_path || '';
            const hasPortrait = Boolean(imgSrc) && !isPlaceholderPortrait(imgSrc);

            return (
              <article key={m.name} className="card honour">
                {hasPortrait && <figure className="frame frame--square has-image" data-cms-img style={{ position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={imgSrc}
                      alt={`Portrait of ${m.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                </figure>}
                <div className="card__body">
                  <span className="honour__badge">{m.honour}</span>
                  <h3 className="card__title">
                    {registeredMembers.some((member) => member.name.trim().toLowerCase() === m.name.trim().toLowerCase()) ? (
                      <Link href={`/members/${encodeURIComponent(registeredMembers.find((member) => member.name.trim().toLowerCase() === m.name.trim().toLowerCase())!.regNumber)}`}>{m.name}</Link>
                    ) : m.name}
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
        {recognised.length === 0 && <p className="footnote" style={{ marginTop: 20 }}>Recognised-member profiles are awaiting approved records from the secretariat.</p>}
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
