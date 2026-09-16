import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Artisan clusters · Handicrafts Association of Bhutan',
  description: 'Villages and valleys where traditional Bhutanese crafts are concentrated. Verified artisan clusters under HAB.',
};

async function getClusters() {
  try {
    const dbClusters = await prisma.clusterRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    if (dbClusters.length > 0) {
      return dbClusters.map((c) => {
        let visitor_note = c.visitorNote || undefined;
        let imageUrl: string | undefined = undefined;
        if (visitor_note && visitor_note.includes('<!-- HAB_IMAGE:')) {
          const match = visitor_note.match(/<!--\s*HAB_IMAGE:\s*(.*?)\s*-->/);
          if (match) {
            imageUrl = match[1].trim();
            visitor_note = visitor_note.replace(/<!--\s*HAB_IMAGE:\s*[\s\S]*?-->/g, '').trim() || undefined;
          }
        }
        return {
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
          visitor_note,
          imageUrl,
        };
      });
    }
  } catch {}
  return CLIENT_DATA.clusters;
}

export default async function ClustersPage() {
  const clusters = await getClusters();

  const photoPool = [
    '/assets/photos/hero-1-weaving.jpg',
    '/assets/photos/hero-4-textiles.jpg',
    '/assets/photos/hero-5-desho.jpg',
    '/assets/photos/hero-3-clay.jpg',
    '/assets/photos/hero-2-punakha.jpg',
  ];

  return (
    <main id="main">
      <section className="section relative" data-hab-section="clusters">
        <SectionEditBadge label="Artisan Clusters" studioHref="/admin/clusters-outlets" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/#clusters">Clusters</Link> / All
        </p>
        <h1 className="display display--hero" style={{ maxWidth: '20ch' }}>
          Artisan clusters
        </h1>
        <p className="lede">
          A cluster is a village or valley where one craft is concentrated. Members hold a common price, buy materials together, and receive visitors who want to see the work being done. Each has a story.
        </p>
        <p className="craft__count" id="clusterCount" style={{ margin: '0 0 34px' }}>
          {clusters.length} clusters listed
        </p>

        <div className="clusterlist" id="clusterList" data-cms-repeat>
          {clusters.map((row: any, idx: number) => {
            const craft = CLIENT_DATA.crafts.find((cr) => cr.key === row.craft_key) || {
              name: '',
              english: '',
            };
            const imgSrc = row.imageUrl || photoPool[idx % photoPool.length];

            return (
              <article key={row.key} id={row.key} className="clusterlist__item" data-cms-item>
                <figure className="frame frame--wide16 has-image" data-cms-img style={{ position: 'relative', overflow: 'hidden' }}>
                  <Image
                    src={imgSrc}
                    alt={row.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    style={{ objectFit: 'cover' }}
                  />
                </figure>

                <div className="clusterlist__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">
                    {craft.name} · {craft.english}
                  </p>
                  <h2 className="clusterlist__name">{row.name}</h2>
                  <p className="clusterlist__place">
                    {row.dzongkhag} · {row.members} members · established {row.established}
                  </p>
                  <p className="clusterlist__story">{row.story || row.summary}</p>

                  {row.visitor_note && (
                    <p className="cluster__visit">{row.visitor_note}</p>
                  )}

                  <div className="actions">
                    <Link className="btn btn--accent btn--sm" href={`/shop?craft=${row.craft_key}`}>
                      Shop {craft.name} →
                    </Link>
                    <Link className="btn btn--outline btn--sm" href={`/craft/${row.craft_key}`}>
                      About {craft.name} →
                    </Link>
                    <Link className="btn btn--text btn--sm" href={`/clusters/${row.key}`}>
                      Read the full story →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA Band */}
      <section className="section">
        <div className="ctaband">
          <div>
            <h2 className="display display--panel">Register your cluster</h2>
            <p className="ctaband__body">
              A cluster of ten or more artisans working the same craft can join as a body under Artisan Cluster membership — one membership for everyone in it, at Nu. 3,000 a year, with a page here telling your story.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/register?type=cluster">
              Register as a cluster
            </Link>
            <Link className="btn btn--ghost" href="/membership/cluster">
              What the category means
            </Link>
          </div>
        </div>
      </section>

      {/* Duo: Plan a visit / Shop by craft */}
      <section className="section section--last">
        <div className="duo">
          <div className="panel">
            <p className="eyebrow eyebrow--muted">Plan a visit</p>
            <h2 className="display display--panel">See the crafts being made</h2>
            <p className="panel__body">
              The secretariat arranges cluster visits, demonstrations and workshop sessions for individuals and groups.
            </p>
            <Link className="btn btn--ink" href="/contact">
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
