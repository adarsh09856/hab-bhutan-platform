import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Artisan Clusters · Handicrafts Association of Bhutan',
  description: 'Villages and valleys where traditional Bhutanese crafts are concentrated. Verified artisan clusters under HAB.',
};

async function getClusters() {
  try {
    const dbClusters = await prisma.clusterRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    if (dbClusters.length > 0) {
      return dbClusters.map((c) => ({
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
      }));
    }
  } catch {}
  return CLIENT_DATA.clusters;
}

export default async function ClustersPage() {
  const clusters = await getClusters();

  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/outlets">Outlets &amp; clusters</Link> / Clusters
        </p>
        <h1 className="display display--hero" style={{ maxWidth: '20ch' }}>
          Artisan clusters
        </h1>
        <p className="lede">
          A cluster is a village or valley where one craft is concentrated. Members hold a common price, buy materials together, and receive visitors who want to see the work being done. Each has a story.
        </p>
        <p className="craft__count" style={{ margin: '0 0 34px' }}>
          {clusters.length} registered artisan clusters
        </p>

        <div className="grid grid--3">
          {clusters.map((c, idx) => {
            const craft = CLIENT_DATA.crafts.find((cr) => cr.key === c.craft_key);
            const photoPool = [
              '/assets/photos/hero-1-weaving.jpg',
              '/assets/photos/hero-4-textiles.jpg',
              '/assets/photos/hero-5-desho.jpg',
              '/assets/photos/hero-3-clay.jpg',
              '/assets/photos/hero-2-punakha.jpg',
            ];
            const imgSrc = photoPool[idx % photoPool.length];

            return (
              <article key={c.key} className="card cluster">
                <Link href={`/clusters/${c.key}`}>
                  <div className="frame frame--wide16" style={{ position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={imgSrc}
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
                  <h3 className="card__title clamp-2">
                    <Link href={`/clusters/${c.key}`}>{c.name}</Link>
                  </h3>
                  <p className="card__text clamp-3">{c.summary}</p>
                  <div className="card__foot">
                    <span className="card__meta">
                      {c.members} artisans · {c.dzongkhag}
                    </span>
                    <Link href={`/clusters/${c.key}`} className="link-accent">
                      Story &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Outlets CTA Banner */}
      <section className="section section--last">
        <div className="ctaband">
          <div>
            <p className="eyebrow eyebrow--onaccent">Visit our stores</p>
            <h2 className="display display--panel">Where to buy authenticated crafts in person</h2>
            <p className="ctaband__body">
              Every outlet stocks directly from registered cluster members, with prices agreed in advance and verified authenticity seals.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/outlets">
              View all HAB outlets &rarr;
            </Link>
            <Link className="btn btn--ghost" href="/outlets/punakha-market">
              Punakha Crafts Market &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
