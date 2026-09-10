import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CLIENT_DATA } from '@/lib/client-data';

export const metadata: Metadata = {
  title: 'Artisan Clusters · Handicrafts Association of Bhutan',
  description: 'Villages and valleys where traditional Bhutanese crafts are concentrated. Verified artisan clusters under HAB.',
};

export default function ClustersPage() {
  const clusters = CLIENT_DATA.clusters;

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
                  <p className="card__meta">
                    {c.dzongkhag} · {c.members} members · est. {c.established}
                  </p>
                  <p className="card__text clamp-3">{c.summary}</p>
                  <Link className="cluster__read link-accent" href={`/clusters/${c.key}`}>
                    Read the story →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Cluster Registration Banner */}
      <section className="section">
        <div className="ctaband">
          <div>
            <h2 className="display display--panel">Register your cluster</h2>
            <p className="ctaband__body">
              A cluster of ten or more artisans working the same craft can join as a body under Artisan Cluster membership — one membership for everyone in it, at Nu. 3,000 a year, with a page here telling your story.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/membership/apply?tier=cluster">
              Register as a cluster
            </Link>
            <Link className="btn btn--ghost" href="/membership/cluster">
              What the category means
            </Link>
          </div>
        </div>
      </section>

      {/* Duo Section */}
      <section className="section section--last">
        <div className="duo">
          <div className="panel">
            <p className="eyebrow eyebrow--muted">Plan a visit</p>
            <h2 className="display display--panel">See the crafts being made</h2>
            <p className="panel__body">
              The secretariat arranges cluster visits, demonstrations and workshop sessions for individuals and groups.
            </p>
            <Link className="btn btn--ink" href="/contact?topic=visit">
              Contact the secretariat
            </Link>
          </div>
          <div className="panel panel--accent">
            <p className="eyebrow eyebrow--onaccent">Buy the work</p>
            <h2 className="display display--panel display--onaccent">Shop by craft</h2>
            <p className="panel__body panel__body--onaccent">
              Everything the clusters make is available in the HAB shop, bought from the member at an agreed price.
            </p>
            <Link className="btn btn--light" href="/shop">
              Visit the shop →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
