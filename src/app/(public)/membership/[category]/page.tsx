import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  let dbCat: any = null;
  try {
    dbCat = await prisma.membershipCategory.findFirst({ where: { key: category, isActive: true } });
  } catch {
    return { title: 'Membership categories temporarily unavailable · HAB' };
  }
  const cat = dbCat;
  if (!cat) return { title: 'Category Not Found' };

  return {
    title: `${cat.name} · Membership Category · HAB`,
    description: cat.description || cat.tagline,
  };
}

export default async function MembershipCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  let dbCat: any = null;
  try {
    dbCat = await prisma.membershipCategory.findFirst({ where: { key: category, isActive: true } });
  } catch {
    return (
      <main id="main">
        <section className="section section--narrow">
          <h1 className="display display--page">Membership category</h1>
          <p className="lede" role="alert">Membership categories are temporarily unavailable.</p>
        </section>
      </main>
    );
  }

  const rawCat = dbCat;

  if (!rawCat) {
    notFound();
  }

  const docs = rawCat.documents && typeof rawCat.documents === 'object' ? (rawCat.documents as any) : {};
  const cat = {
    ...rawCat,
    status: rawCat.shortName || '',
    tagline: rawCat.description?.slice(0, 100) || '',
    meaning: rawCat.description || '',
    fee: Number.isFinite(Number(rawCat.duesBTN)) ? `Nu. ${Number(rawCat.duesBTN).toLocaleString()}` : '',
    fee_note: typeof docs.feeNote === 'string' ? docs.feeNote : '',
    criteria: Array.isArray(rawCat.eligibility) ? rawCat.eligibility : [],
    how: Array.isArray(docs.process) ? docs.process : [],
    benefits: Array.isArray(rawCat.benefits) ? rawCat.benefits : [],
    note: typeof docs.note === 'string' ? docs.note : '',
  };

  const otherCategories = await prisma.membershipCategory.findMany({
    where: { isActive: true, key: { not: cat.key } },
    orderBy: [{ sortOrder: 'asc' }, { duesBTN: 'asc' }],
  }).catch(() => []);

  const bannerImg = docs.bannerImageUrl || '';

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
      <section className="section relative" data-hab-section="membership-category">
        <SectionEditBadge label="Membership Categories Studio" studioHref="/admin/membership-categories" />
        
        {/* Blueprint Backbar */}
        <div className="backbar">
          <Link className="backbar__link" href="/#membership">
            <span aria-hidden="true">←</span> Back to Membership
          </Link>
        </div>

        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/#membership">Membership</Link> / {cat.name}
        </p>

        <div className="detailhero">
          {cat.status && <p className="eyebrow eyebrow--accent">Membership category · {cat.status}</p>}
          <h1 className="display display--page">{cat.name}</h1>
          <p className="lede lede--wide">{cat.tagline}</p>
        </div>

        {bannerImg && <figure className="frame frame--banner has-image" data-cms-img style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Image
            src={bannerImg}
            alt={cat.name}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </figure>}
      </section>

      {/* Facts */}
      <section className="section section--tight">
        <div className="craftfacts">
          {cat.status && <div className="craftfacts__cell">
            <span className="craftfacts__key">Status</span>
            <span className="craftfacts__val">{cat.status}</span>
          </div>}
          {cat.fee && <div className="craftfacts__cell">
            <span className="craftfacts__key">Annual dues</span>
            <span className="craftfacts__val">{cat.fee}</span>
          </div>}
          {cat.fee_note && <div className="craftfacts__cell">
            <span className="craftfacts__key">Renewal</span>
            <span className="craftfacts__val">{cat.fee_note}</span>
          </div>}
        </div>
      </section>

      {/* What it means */}
      {cat.meaning && <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">What it means</p>
          </div>
          <div>
            <p className="longread__body">{cat.meaning}</p>
          </div>
        </div>
      </section>}

      {/* Criteria / How to register / Benefits */}
      {(cat.criteria.length > 0 || cat.how.length > 0 || cat.benefits.length > 0) && <section className="section">
        <div className="catgrid">
          {/* Criteria */}
          {cat.criteria.length > 0 && <div className="catblock">
            <p className="eyebrow eyebrow--accent">Eligibility</p>
            <h2 className="catblock__title">Criteria</h2>
            <ul className="bullets">
              {cat.criteria.map((cr: string, idx: number) => (
                <li key={idx}>{cr}</li>
              ))}
            </ul>
          </div>}

          {/* Process */}
          {cat.how.length > 0 && <div className="catblock catblock--steps">
            <p className="eyebrow eyebrow--accent">Process</p>
            <h2 className="catblock__title">How to register</h2>
            <ol className="numlist numlist--tight">
              {cat.how.map((step: string, idx: number) => (
                <li key={idx} className="numlist__item">
                  <span className="numlist__n">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="numlist__t">{step}</span>
                </li>
              ))}
            </ol>
          </div>}

          {/* Benefits */}
          {cat.benefits.length > 0 && <div className="catblock catblock--accent">
            <p className="eyebrow eyebrow--onaccent">What you get</p>
            <h2 className="catblock__title catblock__title--light">Benefits</h2>
            <ul className="bullets bullets--light">
              {cat.benefits.map((ben: string, idx: number) => (
                <li key={idx}>{ben}</li>
              ))}
            </ul>
          </div>}
        </div>
      </section>}

      {cat.fee && <section className="section">
        <div className="feepanel">
          <div>
            <p className="eyebrow eyebrow--accent">Membership fee</p>
            <p className="feepanel__amount">{cat.fee}</p>
            {cat.fee_note && <p className="feepanel__note">{cat.fee_note}</p>}
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
      </section>}

      {/* Other Categories */}
      {otherCategories.length > 0 && (
        <section className="section section--last">
          <p className="eyebrow eyebrow--accent">Other categories</p>
          <h2 className="display display--sub">Not the right fit?</h2>
          <div className="grid grid--3" style={{ marginTop: 22 }}>
            {otherCategories.map((oc) => {
              const ocDocs = oc.documents && typeof oc.documents === 'object' ? (oc.documents as any) : {};
              return (
                <Link key={oc.key} className="card" href={`/membership/${oc.key}`}>
                  {typeof ocDocs.bannerImageUrl === 'string' && ocDocs.bannerImageUrl && <figure className="frame frame--wide16 has-image" data-cms-img style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <Image src={ocDocs.bannerImageUrl} alt={oc.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                  </figure>}
                  <div className="card__body">
                    {oc.shortName && <p className="eyebrow eyebrow--accent eyebrow--sm" style={{ marginBottom: 4 }}>{oc.shortName}</p>}
                    <h3 className="card__title" style={{ marginBottom: 4 }}>
                      {oc.name}
                    </h3>
                    {oc.description && <p className="card__text clamp-3">{oc.description.slice(0, 180)}</p>}
                    {Number.isFinite(Number(oc.duesBTN)) && <p className="catcard__fee" style={{ marginTop: 'auto', paddingTop: 8 }}>Nu. {Number(oc.duesBTN).toLocaleString()}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
