import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLIENT_DATA } from '@/lib/client-data';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export const dynamic = 'force-dynamic';

interface ProgrammePageProps {
  params: Promise<{ ref: string }>;
}

export async function generateMetadata({ params }: ProgrammePageProps): Promise<Metadata> {
  const { ref } = await params;
  let dbProg: any = null;
  try {
    dbProg = await prisma.programmePillar.findUnique({ where: { ref } });
  } catch {}
  const programme = dbProg || CLIENT_DATA.programmes.find((p) => p.ref === ref);
  if (!programme) return { title: 'Programme Not Found' };

  return {
    title: `${programme.title} · Programme Areas · HAB`,
    description: programme.description,
  };
}

export default async function ProgrammeDetailPage({ params }: ProgrammePageProps) {
  const { ref } = await params;
  let dbProg: any = null;
  try {
    dbProg = await prisma.programmePillar.findUnique({ where: { ref } });
  } catch {}

  const fallback = CLIENT_DATA.programmes.find((p) => p.ref === ref);
  const rawProg = dbProg || fallback;

  if (!rawProg) {
    notFound();
  }

  let customImg = rawProg.imageUrl || rawProg.image_path || '';
  if (!customImg && rawProg.activities && typeof rawProg.activities === 'object' && !Array.isArray(rawProg.activities)) {
    customImg = (rawProg.activities as any).imageUrl || '';
  }

  const programme = {
    ...rawProg,
    title: rawProg.title,
    ref: rawProg.ref,
    description: rawProg.description,
    imageUrl: customImg,
    activities: Array.isArray(rawProg.activities)
      ? rawProg.activities
      : (rawProg.activities?.list || rawProg.activities?.items || []),
  };

  const allProgrammes = CLIENT_DATA.programmes;
  const currentIndex = allProgrammes.findIndex((p) => p.ref === programme.ref);
  const prevProg = allProgrammes[(currentIndex - 1 + allProgrammes.length) % allProgrammes.length];
  const nextProg = allProgrammes[(currentIndex + 1) % allProgrammes.length];

  const photoPool = [
    '/assets/photos/hero-1-weaving.jpg',
    '/assets/photos/hero-4-textiles.jpg',
    '/assets/photos/hero-5-desho.jpg',
    '/assets/photos/hero-3-clay.jpg',
    '/assets/photos/hero-2-punakha.jpg',
    '/assets/photos/about-hab.jpg',
  ];
  const bannerImg = customImg || photoPool[currentIndex >= 0 ? currentIndex % photoPool.length : 0];

  const relatedProjects = CLIENT_DATA.projects.slice(0, 3);

  return (
    <main id="main">
      <section className="section relative" data-hab-section="programme-detail">
        <SectionEditBadge label="Programmes Studio" studioHref="/admin/programmes" />
        
        {/* Blueprint Backbar */}
        <div className="backbar">
          <Link className="backbar__link" href="/programmes">
            <span aria-hidden="true">←</span> Back to Programmes
          </Link>
        </div>

        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/programmes">Programmes</Link> / {programme.title}
        </p>

        <div className="detailhero">
          <p className="eyebrow eyebrow--accent">
            Programme area · Article 3.2 ({programme.ref})
          </p>
          <h1 className="display display--page">{programme.title}</h1>
          <p className="lede lede--wide">{programme.description}</p>
        </div>

        <figure className="frame frame--banner has-image" data-cms-img style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Image
            src={bannerImg}
            alt={programme.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </figure>
      </section>

      {/* Activities list */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">How it is delivered</p>
            <h2 className="display display--sub">In practice</h2>
          </div>
          <div>
            <ol className="numlist">
              {programme.activities.map((item: string, idx: number) => (
                <li key={idx} className="numlist__item">
                  <span className="numlist__n">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="numlist__t">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Projects delivering this */}
      {relatedProjects.length > 0 && (
        <section className="section">
          <div className="section__head">
            <div>
              <p className="eyebrow eyebrow--accent">Delivery</p>
              <h2 className="display display--sub">Projects carrying this work</h2>
            </div>
            <Link className="btn btn--ink btn--sm" href="/projects">
              All projects →
            </Link>
          </div>
          <div className="grid grid--3">
            {relatedProjects.map((pr, idx) => {
              const prImg = (pr as any).bannerUrl || (pr as any).imageUrl || (pr as any).image_path || photoPool[idx % photoPool.length] || '/assets/photos/about-hab.jpg';
              const prTitle = pr.title || (pr as any).name || 'Project';

              return (
                <Link key={pr.key} className="card" href={`/projects/${pr.key}`}>
                  <figure className="frame frame--wide16 has-image" data-cms-img style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <Image
                      src={prImg}
                      alt={prTitle}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </figure>
                  <div className="card__body">
                    <p className="eyebrow eyebrow--accent eyebrow--sm" style={{ marginBottom: 4 }}>{pr.period}</p>
                    <h3 className="card__title clamp-2" style={{ marginBottom: 4 }}>
                      {prTitle}
                    </h3>
                    <p className="card__text clamp-3">{pr.summary}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Prev / Next Navigation */}
      <section className="section section--last">
        <nav className="craftnav">
          <Link className="craftnav__link" href={`/programmes/${prevProg.ref}`}>
            <span className="craftnav__hint">← Previous programme area</span>
            <span>{prevProg.title}</span>
          </Link>
          <Link className="craftnav__link craftnav__link--next" href={`/programmes/${nextProg.ref}`}>
            <span className="craftnav__hint">Next programme area →</span>
            <span>{nextProg.title}</span>
          </Link>
        </nav>
      </section>
    </main>
  );
}
