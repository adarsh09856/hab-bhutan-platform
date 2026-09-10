import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLIENT_DATA } from '@/lib/client-data';

interface ProgrammePageProps {
  params: Promise<{ ref: string }>;
}

export async function generateStaticParams() {
  return CLIENT_DATA.programmes.map((p) => ({
    ref: p.ref,
  }));
}

export async function generateMetadata({ params }: ProgrammePageProps): Promise<Metadata> {
  const { ref } = await params;
  const programme = CLIENT_DATA.programmes.find((p) => p.ref === ref);
  if (!programme) return { title: 'Programme Not Found' };

  return {
    title: `${programme.title} · Programme Areas · HAB`,
    description: programme.description,
  };
}

export default async function ProgrammeDetailPage({ params }: ProgrammePageProps) {
  const { ref } = await params;
  const programme = CLIENT_DATA.programmes.find((p) => p.ref === ref);

  if (!programme) {
    notFound();
  }

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
  const bannerImg = photoPool[currentIndex % photoPool.length];

  const relatedProjects = CLIENT_DATA.projects.slice(0, 3);

  return (
    <main id="main">
      <section className="section">
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

        <figure className="frame frame--banner" style={{ position: 'relative', height: 420, overflow: 'hidden', marginTop: 24 }}>
          <Image
            src={bannerImg}
            alt={programme.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          <figcaption className="frame__caption">
            Article 3.2 ({programme.ref}) — {programme.title}
          </figcaption>
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
              {programme.activities.map((item, idx) => (
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
            {relatedProjects.map((pr) => (
              <article key={pr.key} className="card">
                <div className="card__body">
                  <p className="eyebrow eyebrow--accent eyebrow--sm">{pr.period}</p>
                  <h3 className="card__title clamp-2">
                    <Link href={`/projects/${pr.key}`}>{pr.title}</Link>
                  </h3>
                  <p className="card__text clamp-3">{pr.summary}</p>
                  <Link className="link-accent" href={`/projects/${pr.key}`}>
                    Read project report →
                  </Link>
                </div>
              </article>
            ))}
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
