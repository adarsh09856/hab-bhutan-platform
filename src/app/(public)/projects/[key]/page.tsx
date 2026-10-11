import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLIENT_DATA } from '@/lib/client-data';
import prisma from '@/lib/prisma';
import { getProjectCoverPhotoUrl } from '@/lib/project-media';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import LocalizedRecordField from '@/components/public/LocalizedRecordField';

export const dynamic = 'force-dynamic';

interface ProjectPageProps {
  params: Promise<{ key: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { key } = await params;
  let dbProj: any = null;
  try {
    const legacyName = CLIENT_DATA.projects.find((p) => p.key === key)?.name;
    dbProj = await prisma.projectRecord.findFirst({
      where: { OR: [{ id: key }, ...(legacyName ? [{ name: legacyName }] : []), { name: { contains: key, mode: 'insensitive' } }] },
    });
  } catch {}
  const project = dbProj;
  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.name || project.title} · Projects · HAB`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { key } = await params;
  let dbProj: any = null;
  let allProjects: any[] = [];
  try {
    const legacyName = CLIENT_DATA.projects.find((p) => p.key === key)?.name;
    dbProj = await prisma.projectRecord.findFirst({
      where: { OR: [{ id: key }, ...(legacyName ? [{ name: legacyName }] : []), { name: { contains: key, mode: 'insensitive' } }] },
    });
    allProjects = await prisma.projectRecord.findMany({ orderBy: { createdAt: 'desc' } });
  } catch {}
  if (!dbProj) {
    notFound();
  }

  const storedMedia = dbProj.activities && !Array.isArray(dbProj.activities) && typeof dbProj.activities === 'object' ? dbProj.activities : {};
  const savedActivities = Array.isArray(dbProj.activities) ? dbProj.activities : Array.isArray(storedMedia.list) ? storedMedia.list : [];
  const coverPhotoUrl = getProjectCoverPhotoUrl(dbProj);

  const project = {
    ...dbProj,
    key: dbProj.id,
    title: dbProj.name,
    activities: savedActivities,
    outputs: savedActivities,
    coverPhotoUrl,
    results: Array.isArray(dbProj.results) ? dbProj.results : [],
  };

  const projectTitle = project.name;
  const partnerName = project.partner;

  const currentIndex = allProjects.findIndex((p) => p.id === project.id);
  const prevProj = allProjects.length > 1 ? allProjects[(currentIndex - 1 + allProjects.length) % allProjects.length] : null;
  const nextProj = allProjects.length > 1 ? allProjects[(currentIndex + 1) % allProjects.length] : null;
  const otherProjects = allProjects.filter((p) => p.id !== project.id).slice(0, 3);

  const isCurrent = project.status.toLowerCase().includes('current') || project.status.toLowerCase().includes('progress');

  const bannerImg = project.coverPhotoUrl;

  return (
    <main id="main">
      <section className="section relative" data-hab-section="project-detail">
        <SectionEditBadge label="Projects Studio" studioHref="/admin/projects" />
        
        {/* Blueprint Backbar */}
        <div className="backbar">
          <Link className="backbar__link" href="/projects">
            <span aria-hidden="true">←</span> Back to Projects
          </Link>
        </div>

        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/projects">Projects</Link> / <LocalizedRecordField english={projectTitle} dzongkha={project.nameDz} />
        </p>

        <div className="detailhero">
          <p className="eyebrow eyebrow--accent">
            {isCurrent ? 'Project in hand' : 'Completed project'} · <LocalizedRecordField english={project.period} dzongkha={project.periodDz} />
          </p>
          <LocalizedRecordField as="h1" className="display display--page" english={projectTitle} dzongkha={project.nameDz} />
          <LocalizedRecordField as="p" className="lede lede--wide" english={project.summary} dzongkha={project.summaryDz} />
        </div>

        {bannerImg && <figure className="frame frame--banner has-image" data-cms-img data-hab-gallery="project" data-hab-gallery-id={project.id} style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Image
            src={bannerImg}
            alt={projectTitle}
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
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Status</span>
            <span className="craftfacts__val">{isCurrent ? 'In progress' : 'Completed'}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Period</span>
            <LocalizedRecordField as="span" className="craftfacts__val" english={project.period} dzongkha={project.periodDz} />
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Budget</span>
            <LocalizedRecordField as="span" className="craftfacts__val" english={project.budget} dzongkha={project.budgetDz} />
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Funding partner</span>
            <LocalizedRecordField as="span" className="craftfacts__val" english={partnerName} dzongkha={project.partnerDz} />
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
            <LocalizedRecordField as="p" className="longread__body" style={{ marginBottom: 20 }}
              english={project.description || project.summary} dzongkha={project.summaryDz} splitParagraphs />
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
                    <LocalizedRecordField as="span" className="numlist__t" english={item} dzongkha={Array.isArray(project.activitiesDz) ? project.activitiesDz[idx] : ''} />
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
            {otherProjects.map((r) => {
              const rMedia = r.activities && !Array.isArray(r.activities) && typeof r.activities === 'object' ? r.activities : {};
              const rImg = typeof rMedia.coverPhotoUrl === 'string' ? rMedia.coverPhotoUrl : '';
              const rTitle = r.name;

              return (
                <Link key={r.id} className="card" href={`/projects/${r.id}`}>
                  {rImg && <figure className="frame frame--wide16 has-image" data-cms-img style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <Image
                      src={rImg}
                      alt={rTitle}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </figure>}
                  <div className="card__body">
                    <span className={`tag ${r.status.toLowerCase().includes('completed') ? 'tag--done' : ''}`} style={{ marginBottom: 4 }}>
                      {r.status}
                    </span>
                    <LocalizedRecordField as="h3" className="card__title clamp-2" style={{ marginBottom: 4 }} english={rTitle} dzongkha={r.nameDz} />
                    <p className="card__meta" style={{ marginBottom: 4 }}><LocalizedRecordField english={r.period} dzongkha={r.periodDz} /> · <LocalizedRecordField english={r.partner} dzongkha={r.partnerDz} /></p>
                    <LocalizedRecordField as="p" className="card__text clamp-3" english={r.summary} dzongkha={r.summaryDz} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Navigation */}
      <section className="section section--last">
        <nav className="craftnav">
          {prevProj && <Link className="craftnav__link" href={`/projects/${prevProj.id}`}>
            <span className="craftnav__hint">← Previous project</span>
            <LocalizedRecordField english={prevProj.name} dzongkha={prevProj.nameDz} />
          </Link>}
          {nextProj && <Link className="craftnav__link craftnav__link--next" href={`/projects/${nextProj.id}`}>
            <span className="craftnav__hint">Next project →</span>
            <LocalizedRecordField english={nextProj.name} dzongkha={nextProj.nameDz} />
          </Link>}
        </nav>
      </section>
    </main>
  );
}
