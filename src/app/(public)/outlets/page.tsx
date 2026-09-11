import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA } from '@/lib/client-data';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Outlets, Markets & Clusters · Handicrafts Association of Bhutan',
  description: 'Physical outlets, verified markets and artisan clusters across Bhutan validated by HAB.',
};

async function getOutletsData() {
  try {
    const dbOutlets = await prisma.outletRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    const dbClusters = await prisma.clusterRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    const outlets = dbOutlets.length > 0
      ? dbOutlets.map(o => ({
          key: o.key,
          type: o.type,
          name: o.name,
          sort_order: o.sortOrder,
          is_featured: o.isFeatured,
          place: o.place,
          note: o.note || '',
          description: o.description,
          long_description: o.longDescription,
          hours: o.hours,
          stalls: o.stalls || '',
          crafts_on_site: o.craftsOnSite || '',
          payment: o.payment || '',
          getting_there: o.gettingThere || '',
          facilities: o.facilities || '',
        }))
      : CLIENT_DATA.outlets;

    const clusters = dbClusters.length > 0
      ? dbClusters.map(c => ({
          key: c.key,
          name: c.name,
          craft_key: c.craftKey,
          dzongkhag: c.dzongkhag,
          members: c.members,
          established: c.established,
          is_featured: c.isFeatured,
          sort_order: c.sortOrder,
          summary: c.summary,
          story: c.story,
          visitor_note: c.visitorNote || undefined,
        }))
      : CLIENT_DATA.clusters;

    return { outlets, clusters };
  } catch {}
  return { outlets: CLIENT_DATA.outlets, clusters: CLIENT_DATA.clusters };
}

export default async function OutletsPage() {
  const { outlets, clusters } = await getOutletsData();
  const featured = outlets.find((o) => o.is_featured) || outlets[0];
  const otherOutlets = outlets.filter((o) => o.key !== featured?.key);

  return (
    <main id="main">
      {/* Featured Market Hero */}
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / Outlets &amp; clusters
        </p>

        {featured && (
          <>
            <div className="detailhero">
              <p className="eyebrow eyebrow--accent">
                {featured.type} · HAB validated
              </p>
              <h1 className="display display--page">{featured.name}</h1>
              <p className="lede lede--wide">{featured.description || featured.note}</p>
              <div className="actions">
                <Link className="btn btn--accent" href={`/outlets/${featured.key}`}>
                  Learn more about this market →
                </Link>
                <Link className="btn btn--outline" href="/contact?topic=visit">
                  Plan a group visit
                </Link>
              </div>
            </div>

            <figure className="frame frame--banner" style={{ position: 'relative', height: 440, overflow: 'hidden', marginTop: 24 }}>
              <Image
                src="/assets/photos/hero-2-punakha.jpg"
                alt={featured.name}
                fill
                priority
                sizes="100vw"
                style={{ objectFit: 'cover' }}
              />
              <figcaption className="frame__caption">
                Punakha Crafts Market — 24 stalls beside the Mo Chhu
              </figcaption>
            </figure>
          </>
        )}
      </section>

      {/* Featured Market Facts */}
      {featured && (
        <section className="section section--tight">
          <div className="craftfacts">
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Where</span>
              <span className="craftfacts__val">{featured.place}</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Open</span>
              <span className="craftfacts__val">{featured.hours}</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Scale</span>
              <span className="craftfacts__val">{featured.stalls}</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Payment</span>
              <span className="craftfacts__val">{featured.payment}</span>
            </div>
          </div>
        </section>
      )}

      {/* Outlets List */}
      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Where else to buy</p>
            <h2 className="display display--sub">Outlets &amp; counters</h2>
            <p className="section__lede">
              The association&apos;s own shops and counters. Each has its own page with opening hours and what you will find there.
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/shop">
            Or shop online →
          </Link>
        </div>

        <div className="grid grid--3">
          {otherOutlets.map((o) => (
            <article key={o.key} className="card outlet">
              <Link href={`/outlets/${o.key}`}>
                <div className="frame frame--wide16" style={{ position: 'relative', overflow: 'hidden' }}>
                  <Image
                    src="/assets/photos/hero-4-textiles.jpg"
                    alt={o.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </Link>
              <div className="card__body">
                <span className="tag">{o.type}</span>
                <h3 className="card__title clamp-2">
                  <Link href={`/outlets/${o.key}`}>{o.name}</Link>
                </h3>
                <p className="card__meta clamp-1">{o.place}</p>
                <p className="card__text clamp-3">{o.note}</p>
                {o.hours && <p className="outlet__hours">{o.hours}</p>}
              </div>
            </article>
          ))}
        </div>
        <p className="footnote" style={{ marginTop: 20 }}>
          195 affiliated stores across Bhutan also carry member work.
        </p>
      </section>

      {/* Clusters Section */}
      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">Artisan clusters</p>
            <h2 className="display display--sub">Where the crafts are made</h2>
            <p className="section__lede">
              A cluster is a village or valley where one craft is concentrated, and where members hold a common price, buy materials together and receive visitors.
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/clusters">
            All clusters →
          </Link>
        </div>

        <div className="grid grid--3">
          {clusters.slice(0, 3).map((c) => {
            const craft = CLIENT_DATA.crafts.find((cr) => cr.key === c.craft_key);

            return (
              <article key={c.key} className="card cluster">
                <Link href={`/clusters/${c.key}`}>
                  <div className="frame frame--wide16" style={{ position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src="/assets/photos/hero-1-weaving.jpg"
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </Link>
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">
                    {craft ? `${craft.name} · ${craft.english}` : 'Zorig Chusum'}
                  </p>
                  <h3 className="cluster__name">
                    <Link href={`/clusters/${c.key}`}>{c.name}</Link>
                  </h3>
                  <p className="cluster__place">
                    {c.dzongkhag} · {c.members} members · est. {c.established}
                  </p>
                  <p className="card__text cluster__summary clamp-3">{c.summary}</p>
                  <Link className="cluster__read link-accent" href={`/clusters/${c.key}`}>
                    Read the story →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
