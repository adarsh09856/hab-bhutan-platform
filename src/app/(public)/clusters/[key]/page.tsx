import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLIENT_DATA, getClusterByKey, getCraftByKey, getProductsForCraft } from '@/lib/client-data';

interface ClusterPageProps {
  params: Promise<{ key: string }>;
}

export async function generateStaticParams() {
  return CLIENT_DATA.clusters.map((c) => ({
    key: c.key,
  }));
}

export async function generateMetadata({ params }: ClusterPageProps): Promise<Metadata> {
  const { key } = await params;
  const cluster = getClusterByKey(key);
  if (!cluster) return { title: 'Cluster Not Found' };

  return {
    title: `${cluster.name} · Artisan Cluster · HAB`,
    description: cluster.summary,
  };
}

export default async function ClusterDetailPage({ params }: ClusterPageProps) {
  const { key } = await params;
  const cluster = getClusterByKey(key);

  if (!cluster) {
    notFound();
  }

  const craft = getCraftByKey(cluster.craft_key);
  const products = getProductsForCraft(cluster.craft_key).slice(0, 4);

  // Compute prev/next cluster
  const allClusters = CLIENT_DATA.clusters;
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
      {/* Detail Hero */}
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/outlets">Outlets &amp; clusters</Link> /{' '}
          <Link href="/clusters">Clusters</Link> / {cluster.name}
        </p>

        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">
              Artisan cluster · {craft?.name} · {craft?.english}
            </p>
            <h1 className="display display--page">{cluster.name}</h1>
            <p className="lede">{cluster.summary}</p>
          </div>

          <div className="craftfacts" style={{ alignSelf: 'start' }}>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Dzongkhag</span>
              <span className="craftfacts__val">{cluster.dzongkhag}</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Members</span>
              <span className="craftfacts__val">{cluster.members} active artisans</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Established</span>
              <span className="craftfacts__val">{cluster.established}</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Craft</span>
              <span className="craftfacts__val">{craft?.name} ({craft?.english})</span>
            </div>
          </div>
        </div>

        {/* Large Photograph Banner */}
        <div style={{ marginTop: 32, position: 'relative', height: 420, borderRadius: 2, overflow: 'hidden' }}>
          <Image
            src={bannerImg}
            alt={cluster.name}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </section>

      {/* The Story */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">The story</p>
          </div>
          <div>
            {cluster.story.split('\n\n').map((para, i) => (
              <p key={i} className="longread__body" style={{ marginBottom: 20 }}>
                {para.trim()}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Visiting Note */}
      {cluster.visitor_note && (
        <section className="section">
          <div className="panel">
            <p className="eyebrow eyebrow--accent">Visiting</p>
            <h2 className="display display--panel">See the work being done</h2>
            <p className="panel__body">{cluster.visitor_note}</p>
            <div className="actions">
              <Link className="btn btn--ink" href={`/contact?topic=visit&cluster=${encodeURIComponent(cluster.name)}`}>
                Arrange a visit
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* What the cluster makes */}
      {products.length > 0 && (
        <section className="section">
          <div className="section__head">
            <div>
              <p className="eyebrow eyebrow--accent">What the cluster makes</p>
              <h2 className="display display--sub">In the HAB shop</h2>
            </div>
            {craft && (
              <Link className="btn btn--ink btn--sm" href={`/shop/${craft.key}`}>
                Shop {craft.name} →
              </Link>
            )}
          </div>
          <div className="grid grid--4">
            {products.map((p) => {
              const imgSrc = p.image_path ? `/${p.image_path.replace(/^\/+/, '')}` : '/assets/photos/product-sad03.jpg';

              return (
                <article key={p.code} className="card product">
                  <Link className="product__shot" href={`/product/${p.code}`}>
                    <div className="frame frame--square" style={{ position: 'relative', overflow: 'hidden' }}>
                      <Image
                        src={imgSrc}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <span className="product__ref">{p.code}</span>
                  </Link>
                  <div className="card__body">
                    <p className="eyebrow eyebrow--accent eyebrow--sm">{craft?.name}</p>
                    <h3 className="card__title clamp-2">
                      <Link href={`/product/${p.code}`}>{p.name}</Link>
                    </h3>
                    <p className="card__meta clamp-1">{p.maker} · {p.region}</p>
                    <div className="card__foot">
                      <span className="money" style={{ fontWeight: 600 }}>${p.price_usd}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Prev / Next Navigation */}
      <section className="section section--last">
        <nav className="craftnav">
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
