import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLIENT_DATA } from '@/lib/client-data';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ProjectPageProps {
  params: Promise<{ key: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { key } = await params;
  let dbProj: any = null;
  try {
    dbProj = await prisma.projectRecord.findFirst({
      where: { OR: [{ id: key }, { name: { contains: key, mode: 'insensitive' } }] },
    });
  } catch {}
  const project = dbProj || CLIENT_DATA.projects.find((p) => p.key === key);
  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.name || project.title} · Projects · HAB`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { key } = await params;
  let dbProj: any = null;
  try {
    dbProj = await prisma.projectRecord.findFirst({
      where: { OR: [{ id: key }, { name: { contains: key, mode: 'insensitive' } }] },
    });
  } catch {}

  const fallback = CLIENT_DATA.projects.find((p) => p.key === key);
  const rawProj = dbProj || fallback;

  if (!rawProj) {
    notFound();
  }

  const project = {
    ...rawProj,
    key: rawProj.key || rawProj.id,
    name: rawProj.name || rawProj.title || 'Project',
    title: rawProj.name || rawProj.title || 'Project',
    status: rawProj.status || 'Current',
    partner: rawProj.partner || rawProj.funder || 'HAB',
    summary: rawProj.summary || '',
    period: rawProj.period || '2024 – 2027',
    budget: rawProj.budget || '',
    progressPercent: rawProj.progressPercent || 50,
    activities: Array.isArray(rawProj.activities) ? rawProj.activities : [],
    results: Array.isArray(rawProj.results) ? rawProj.results : [],
  };

  const projectTitle = project.name || project.title || 'Project';
  const partnerName = project.partner || project.funder || 'HAB';

  const allProjects = CLIENT_DATA.projects;
  const currentIndex = allProjects.findIndex((p) => p.key === project.key);
  const prevProj = allProjects[(currentIndex - 1 + allProjects.length) % allProjects.length];
  const nextProj = allProjects[(currentIndex + 1) % allProjects.length];
  const otherProjects = allProjects.filter((p) => p.key !== project.key).slice(0, 3);

  const isCurrent = project.status.toLowerCase().includes('current') || project.status.toLowerCase().includes('progress');

  const photoPool = [
    '/assets/photos/hero-4-textiles.jpg',
    '/assets/photos/hero-1-weaving.jpg',
    '/assets/photos/hero-5-desho.jpg',
    '/assets/photos/hero-3-clay.jpg',
    '/assets/photos/hero-2-punakha.jpg',
    '/assets/photos/about-hab.jpg',
  ];
  const bannerImg = photoPool[currentIndex % photoPool.length];

  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/projects">Projects</Link> / {projectTitle}
        </p>

        <div className="detailhero">
          <p className="eyebrow eyebrow--accent">
            {isCurrent ? 'Project in hand' : 'Completed project'} · {project.period}
          </p>
          <h1 className="display display--page">{projectTitle}</h1>
          <p className="lede lede--wide">{project.summary}</p>
        </div>

        <figure className="frame frame--banner" style={{ position: 'relative', height: 420, overflow: 'hidden', marginTop: 24 }}>
          <Image
            src={bannerImg}
            alt={projectTitle}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          <figcaption className="frame__caption">
            {projectTitle} — {partnerName}
          </figcaption>
        </figure>
      </section>

      {/* Facts */}
      <section className="section section--tight">
        <div className="craftfacts">
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Status</span>
            <span className="craftfacts__val">{isCurrent ? 'In progress' : 'Completed'}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Period</span>
            <span className="craftfacts__val">{project.period}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Budget</span>
            <span className="craftfacts__val">{project.budget}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Funding partner</span>
            <span className="craftfacts__val">{partnerName}</span>
          </div>
        </div>
      </section>

      {/* Narrative */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">The project</p>
            <h2 className="display display--sub">{isCurrent ? 'What it is doing' : 'What it achieved'}</h2>
          </div>
          <div>
            {(project.description || project.summary).split('\n\n').map((para: string, i: number) => (
              <p key={i} className="longread__body" style={{ marginBottom: 20 }}>
                {para.trim()}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Outputs / Activities */}
      {project.outputs && project.outputs.length > 0 && (
        <section className="section">
          <div className="longread">
            <div>
              <p className="eyebrow eyebrow--accent">Delivery</p>
              <h2 className="display display--sub">Key deliverables &amp; indicators</h2>
            </div>
            <div>
              <ol className="numlist numlist--ruled">
                {project.outputs.map((item: string, idx: number) => (
                  <li key={idx} className="numlist__item">
                    <span className="numlist__n">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="numlist__t">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* Other Projects */}
      {otherProjects.length > 0 && (
        <section className="section">
          <div className="section__head">
            <div>
              <p className="eyebrow eyebrow--accent">More</p>
              <h2 className="display display--sub">Other projects</h2>
            </div>
            <Link className="btn btn--ink btn--sm" href="/projects">
              All projects →
            </Link>
          </div>
          <div className="grid grid--3">
            {otherProjects.map((r) => (
              <article key={r.key} className="card">
                <div className="card__body">
                  <span className={`tag ${r.status.toLowerCase().includes('completed') ? 'tag--done' : ''}`}>
                    {r.status}
                  </span>
                  <h3 className="card__title clamp-2" style={{ marginTop: 8 }}>
                    <Link href={`/projects/${r.key}`}>{r.title}</Link>
                  </h3>
                  <p className="card__meta">{r.period} · {r.funder}</p>
                  <p className="card__text clamp-3">{r.summary}</p>
                  <Link className="link-accent" href={`/projects/${r.key}`}>
                    Read project detail →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <section className="section section--last">
        <nav className="craftnav">
          <Link className="craftnav__link" href={`/projects/${prevProj.key}`}>
            <span className="craftnav__hint">← Previous project</span>
            <span>{prevProj.title}</span>
          </Link>
          <Link className="craftnav__link craftnav__link--next" href={`/projects/${nextProj.key}`}>
            <span className="craftnav__hint">Next project →</span>
            <span>{nextProj.title}</span>
          </Link>
        </nav>
      </section>
    </main>
  );
}
