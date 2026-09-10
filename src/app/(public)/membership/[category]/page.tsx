import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLIENT_DATA, getMembershipCategoryByKey } from '@/lib/client-data';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return CLIENT_DATA.membershipCategories.map((c) => ({
    category: c.key,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = getMembershipCategoryByKey(category);
  if (!cat) return { title: 'Category Not Found' };

  return {
    title: `${cat.name} · Membership Category · HAB`,
    description: cat.tagline,
  };
}

export default async function MembershipCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = getMembershipCategoryByKey(category);

  if (!cat) {
    notFound();
  }

  const otherCategories = CLIENT_DATA.membershipCategories.filter((c) => c.key !== cat.key);

  const photoPool = [
    '/assets/photos/hero-1-weaving.jpg',
    '/assets/photos/hero-4-textiles.jpg',
    '/assets/photos/hero-5-desho.jpg',
    '/assets/photos/hero-3-clay.jpg',
    '/assets/photos/hero-2-punakha.jpg',
  ];
  const catIndex = CLIENT_DATA.membershipCategories.findIndex((c) => c.key === cat.key);
  const bannerImg = photoPool[catIndex % photoPool.length];

  const applyTierMapping: Record<string, string> = {
    'individual-artisan': 'individual',
    'craft-enterprise': 'enterprise',
    'cluster': 'cluster',
    'associate': 'affiliated',
    'honorary': 'honorary',
  };
  const applyTier = applyTierMapping[cat.key] || 'individual';

  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/#membership">Membership</Link> / {cat.name}
        </p>

        <div className="detailhero">
          <p className="eyebrow eyebrow--accent">
            Membership category · {cat.status}
          </p>
          <h1 className="display display--page">{cat.name}</h1>
          <p className="lede lede--wide">{cat.tagline}</p>
        </div>

        <figure className="frame frame--banner" style={{ position: 'relative', height: 420, overflow: 'hidden', marginTop: 24 }}>
          <Image
            src={bannerImg}
            alt={cat.name}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          <figcaption className="frame__caption">
            {cat.name} — {cat.status}
          </figcaption>
        </figure>
      </section>

      {/* Facts */}
      <section className="section section--tight">
        <div className="craftfacts">
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Status</span>
            <span className="craftfacts__val">{cat.status}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Annual dues</span>
            <span className="craftfacts__val">{cat.fee}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Renewal</span>
            <span className="craftfacts__val">{cat.fee_note}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Vote at Sector Forum</span>
            <span className="craftfacts__val">{cat.status === 'Affiliated Member' ? 'No' : 'Yes'}</span>
          </div>
        </div>
      </section>

      {/* What it means */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">What it means</p>
          </div>
          <div>
            <p className="longread__body">{cat.meaning}</p>
          </div>
        </div>
      </section>

      {/* Criteria / How to register / Benefits */}
      <section className="section">
        <div className="catgrid">
          {/* Criteria */}
          <div className="catblock">
            <p className="eyebrow eyebrow--accent">Eligibility</p>
            <h2 className="catblock__title">Criteria</h2>
            <ul className="bullets">
              {cat.criteria.map((cr, idx) => (
                <li key={idx}>{cr}</li>
              ))}
            </ul>
          </div>

          {/* Process */}
          <div className="catblock catblock--steps">
            <p className="eyebrow eyebrow--accent">Process</p>
            <h2 className="catblock__title">How to register</h2>
            <ol className="numlist numlist--tight">
              {cat.how.map((step, idx) => (
                <li key={idx} className="numlist__item">
                  <span className="numlist__n">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="numlist__t">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Benefits */}
          <div className="catblock catblock--accent">
            <p className="eyebrow eyebrow--onaccent">What you get</p>
            <h2 className="catblock__title catblock__title--light">Benefits</h2>
            <ul className="bullets bullets--light">
              {cat.benefits.map((ben, idx) => (
                <li key={idx}>{ben}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Fee Panel */}
      <section className="section">
        <div className="feepanel">
          <div>
            <p className="eyebrow eyebrow--accent">Membership fee</p>
            <p className="feepanel__amount">{cat.fee}</p>
            <p className="feepanel__note">{cat.fee_note}</p>
          </div>
          <div>
            <p className="feepanel__body">{cat.note}</p>
            <div className="actions">
              {cat.key !== 'honorary' ? (
                <Link className="btn btn--accent" href={`/membership/apply?tier=${applyTier}`}>
                  Register as {cat.name} →
                </Link>
              ) : (
                <Link className="btn btn--outline" href="/masters">
                  View honorary masters &amp; awards
                </Link>
              )}
              {cat.key === 'cluster' && (
                <Link className="btn btn--outline" href="/clusters">
                  See the registered clusters
                </Link>
              )}
              <Link className="btn btn--outline" href="/#membership">
                Compare all categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other Categories */}
      {otherCategories.length > 0 && (
        <section className="section section--last">
          <p className="eyebrow eyebrow--accent">Other categories</p>
          <h2 className="display display--sub">Not the right fit?</h2>
          <div className="grid grid--3" style={{ marginTop: 22 }}>
            {otherCategories.map((oc) => (
              <article key={oc.key} className="card">
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{oc.status}</p>
                  <h3 className="card__title">
                    <Link href={`/membership/${oc.key}`}>{oc.name}</Link>
                  </h3>
                  <p className="card__text clamp-3">{oc.tagline}</p>
                  <p className="catcard__fee">{oc.fee} / year</p>
                  <Link className="link-accent" href={`/membership/${oc.key}`}>
                    Learn more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
