import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLIENT_DATA, getClusterByKey, getCraftByKey, getProductsForCraft } from '@/lib/client-data';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ClusterPageProps {
  params: Promise<{ key: string }>;
}

async function resolveCluster(key: string) {
  try {
    const c = await prisma.clusterRecord.findUnique({ where: { key } });
    if (c) {
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
        visitor_note: c.visitorNote || undefined,
      };
    }
  } catch {}
  return getClusterByKey(key);
}

export async function generateMetadata({ params }: ClusterPageProps): Promise<Metadata> {
  const { key } = await params;
  const cluster = await resolveCluster(key);
  if (!cluster) return { title: 'Cluster Not Found' };

  return {
    title: `${cluster.name} · Artisan Cluster · HAB`,
    description: cluster.summary,
  };
}

export default async function ClusterDetailPage({ params }: ClusterPageProps) {
  const { key } = await params;
  const cluster = await resolveCluster(key);

  if (!cluster) {
    notFound();
  }

  const craft = getCraftByKey(cluster.craft_key) || { name: 'Craft', english: 'Artisanal craft' };
  const products = getProductsForCraft(cluster.craft_key).slice(0, 4);
  const members = (CLIENT_DATA.members || []).filter((m: any) => m.craft_key === cluster.craft_key);

  // Compute prev/next cluster
  let allClusters: any[] = [];
  try {
    const dbC = await prisma.clusterRecord.findMany({ orderBy: { sortOrder: 'asc' } });
    if (dbC.length > 0) {
      allClusters = dbC.map((c) => ({ key: c.key, name: c.name, craft_key: c.craftKey }));
    }
  } catch {}
  if (!allClusters.length) allClusters = CLIENT_DATA.clusters;

  const currentIndex = allClusters.findIndex((c) => c.key === cluster.key);
  const prevCluster = allClusters[(currentIndex - 1 + allClusters.length) % allClusters.length];
  const nextCluster = allClusters[(currentIndex + 1) % allClusters.length];

  const photoPool = [
    '/assets/photos/hero-1-weaving.jpg',
    '/assets/photos/hero-4-textiles.jpg',
    '/assets/photos/hero-5-desho.jpg',
    '/assets/photos/hero-3-clay.jpg',
    '/assets/photos/hero-2-punakha.jpg',
  ];
  const bannerImg = photoPool[currentIndex % photoPool.length];

  return (
    <main id="main">
      {/* 1. Breadcrumbs & Detail Hero */}
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/outlets">Outlets &amp; clusters</Link> / <span>{cluster.name}</span>
        </p>

        <div className="detailhero">
          <p className="eyebrow eyebrow--accent" id="dEyebrow">
            Artisan cluster · {craft.name} · {craft.english}
          </p>
          <h1 className="display display--page" id="dTitle">{cluster.name}</h1>
          <p className="lede lede--wide" id="dStand">{cluster.summary}</p>
        </div>

        <figure className="frame frame--banner has-image" data-cms-img style={{ position: 'relative', height: 440, overflow: 'hidden', marginTop: 24 }}>
          <Image
            src={bannerImg}
            alt={cluster.name}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </figure>
      </section>

      {/* 2. Facts Strip */}
      <section className="section section--tight" id="dMetaWrap">
        <div className="craftfacts" id="dMeta">
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Dzongkhag</span>
            <span className="craftfacts__val">{cluster.dzongkhag}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Members</span>
            <span className="craftfacts__val">{String(cluster.members)}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Established</span>
            <span className="craftfacts__val">{String(cluster.established)}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Craft</span>
            <span className="craftfacts__val">{craft.name} · {craft.english}</span>
          </div>
        </div>
      </section>

      {/* 3. The Story */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">The story</p>
          </div>
          <div>
            {(cluster.story || cluster.summary).split(/\n\s*\n/).map((para, i) => (
              <p key={i} className="longread__body">
                {para.trim()}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Visiting Panel */}
      {cluster.visitor_note && (
        <section className="section">
          <div className="panel">
            <p className="eyebrow eyebrow--accent">Visiting</p>
            <h2 className="display display--panel">See the work being done</h2>
            <p className="panel__body">{cluster.visitor_note}</p>
            <div className="actions">
              <Link className="btn btn--ink" href="/contact?topic=other">
                Arrange a visit
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. What the Cluster Makes */}
      {products.length > 0 && (
        <section className="section">
          <div className="section__head">
            <div>
              <p className="eyebrow eyebrow--accent">What the cluster makes</p>
              <h2 className="display display--sub">In the HAB shop</h2>
            </div>
            <Link className="btn btn--ink btn--sm" href={`/shop?craft=${cluster.craft_key}`}>
              Shop {craft.name} →
            </Link>
          </div>

          <div className="grid grid--4" data-cms-repeat>
            {products.map((p) => (
              <article key={p.code} className="card product" data-cms-item data-code={p.code}>
                <Link className="product__shot" href={`/product/${p.code}`}>
                  <figure className="frame frame--square has-image" data-cms-img style={{ position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={p.image_path || '/assets/photos/product-sad03.jpg'}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </figure>
                  <span className="product__ref">{p.code}</span>
                </Link>
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{craft.name}</p>
                  <h3 className="card__title clamp-2">
                    <Link href={`/product/${p.code}`}>{p.name}</Link>
                  </h3>
                  <p className="card__meta clamp-1">
                    {p.maker} · {p.region}
                  </p>
                  <div className="card__foot">
                    <span className="price">${p.price_usd}</span>
                    <Link className="btn btn--outline btn--xs" href={`/product/${p.code}`}>
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 6. Members Who Work Here */}
      {members.length > 0 && (
        <section className="section">
          <div className="section__head">
            <div>
              <p className="eyebrow eyebrow--accent">Members</p>
              <h2 className="display display--sub">Who works here</h2>
            </div>
            <Link className="link-accent" href={`/shop?craft=${cluster.craft_key}`}>
              Shop this craft →
            </Link>
          </div>

          <div className="grid grid--3">
            {members.map((m: any, i: number) => (
              <Link key={i} className="card" href={`/members/${encodeURIComponent(m.name)}`}>
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{m.dzongkhag}</p>
                  <h3 className="card__title">{m.name}</h3>
                  <p className="card__text clamp-3">{m.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 7. Next / Prev Bottom Nav */}
      <section className="section section--last">
        <nav className="craftnav" aria-label="Other clusters">
          <Link className="craftnav__link" href={`/clusters/${prevCluster.key}`}>
            <span className="craftnav__hint">← Previous cluster</span>
            <span>{prevCluster.name}</span>
          </Link>
          <Link className="craftnav__link craftnav__link--next" href={`/clusters/${nextCluster.key}`}>
            <span className="craftnav__hint">Next cluster →</span>
            <span>{nextCluster.name}</span>
          </Link>
        </nav>
      </section>
    </main>
  );
}
