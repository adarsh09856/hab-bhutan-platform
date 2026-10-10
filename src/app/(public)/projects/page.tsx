'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SectionEditBadge from '@/components/public/SectionEditBadge';

interface Project {
  key: string;
  status: 'current' | 'past';
  name: string;
  partner: string;
  period: string;
  budget: string;
  progress?: number;
  summary: string;
  activities: string[];
  results: { n: string; l: string }[];
  image_path?: string;
  coverPhotoUrl?: string;
  reportPdfUrl?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [statusTab, setStatusTab] = useState<'current' | 'past'>('current');

  useEffect(() => {
    fetch('/api/projects', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Projects unavailable');
        return r.json();
      })
      .then((data) => {
        if (!data?.success || !Array.isArray(data.projects)) throw new Error('Projects unavailable');
        setProjects(data.projects.map((p: any) => ({
          key: p.key || p.slug || p.id,
          status: ['completed', 'past'].includes(String(p.status).toLowerCase()) ? 'past' : 'current',
          name: p.name || p.title || '',
          partner: p.partner || p.donor || '',
          period: p.period || p.yearRange || '',
          budget: p.budget || '',
          summary: p.summary || p.description || '',
          activities: Array.isArray(p.activities) ? p.activities : [],
          results: Array.isArray(p.results)
            ? p.results.map((result: any) => typeof result === 'string' ? { n: '', l: result } : result)
            : [],
          image_path: p.coverPhotoUrl || p.imageUrl || p.image_path || '',
          coverPhotoUrl: p.coverPhotoUrl || '',
          reportPdfUrl: p.reportPdfUrl || '',
        })));
        setLoadState('ready');
      })
      .catch(() => { setProjects([]); setLoadState('error'); });
  }, []);

  const currentProjects = projects.filter((p) => p.status === 'current');
  const pastProjects = projects.filter((p) => p.status === 'past');
  const displayedProjects = statusTab === 'current' ? currentProjects : pastProjects;

  return (
    <main id="main">

      {/* 1. Hero & Stats */}
      <section className="section relative" data-hab-section="projects">
        <SectionEditBadge label="Donor Projects" studioHref="/admin/projects" />
        <p className="crumbs">
          <Link href="/">Home</Link> / Projects
        </p>
        <div className="projhero">
          <div>
            <h1 className="display display--page">Projects</h1>
            <p className="lede">
              HAB delivers its programmes as funded projects, each with an agreed workplan, budget and reporting cycle. Below are the projects currently in hand and those already completed, with their key activities and what they achieved.
            </p>
          </div>
        </div>

        {/* 2. Tabs */}
        <div className="tabs tabs--rule" role="tablist" aria-label="Project status">
          <button
            type="button"
            className={`tab ${statusTab === 'current' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={statusTab === 'current'}
            onClick={() => setStatusTab('current')}
          >
            Projects in hand
            <span className="tab__n" style={{ marginLeft: '6px' }}>{currentProjects.length}</span>
          </button>
          <button
            type="button"
            className={`tab ${statusTab === 'past' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={statusTab === 'past'}
            onClick={() => setStatusTab('past')}
          >
            Completed projects
            <span className="tab__n" style={{ marginLeft: '6px' }}>{pastProjects.length}</span>
          </button>
          <span className="craft__count" id="projectCount" style={{ margin: 0, alignSelf: 'center', marginLeft: 'auto' }}>
            {displayedProjects.length} {displayedProjects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {/* 3. Projects List */}
        <div className="projectlist" id="projectList">
          {loadState !== 'ready' || displayedProjects.length === 0 ? (
            <p className="section__lede" role={loadState === 'error' ? 'alert' : 'status'}>
              {loadState === 'loading' ? 'Loading projects…' : loadState === 'error' ? 'Projects are temporarily unavailable.' : `No ${statusTab === 'current' ? 'current' : 'completed'} projects are listed.`}
            </p>
          ) : null}
          {displayedProjects.map((p, idx) => (
            <article key={p.key || idx} className="projectcard" id={p.key}>
              {p.coverPhotoUrl || p.image_path ? <figure className="frame frame--projshot">
                <img src={p.coverPhotoUrl || p.image_path} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </figure> : null}
              <div className="projectcard__body">
                <div className="projectcard__status">
                  <span className={`tag ${p.status === 'past' ? 'tag--done' : ''}`}>
                    {p.status === 'current' ? 'In progress' : 'Completed'}
                  </span>
                  {(p.period || p.budget) && <span className="projectcard__period">{[p.period, p.budget].filter(Boolean).join(' · ')}</span>}
                </div>
                <h2 className="projectcard__name">{p.name}</h2>
                {p.partner && <p className="projectcard__partner">{p.partner}</p>}
                {p.summary && <p className="projectcard__summary">{p.summary}</p>}
                <Link className="btn btn--accent btn--sm projectcard__more" href={`/projects/${p.key}`}>
                  Read more →
                </Link>

                <div className="projectcard__cols">
                  {p.activities && p.activities.length > 0 && (
                    <div>
                      <p className="eyebrow eyebrow--muted eyebrow--sm">Key activities</p>
                      <ol className="numlist numlist--ruled">
                        {p.activities.map((item, i) => (
                          <li key={i} className="numlist__item">
                            <span className="numlist__n">{String(i + 1).padStart(2, '0')}</span>
                            <span className="numlist__t">{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {p.results && p.results.length > 0 && (
                    <div>
                      <p className="eyebrow eyebrow--muted eyebrow--sm">Key results</p>
                      <div className="grid grid--2" style={{ gap: '8px' }}>
                        {p.results.map((res, i) => (
                          <div key={i} className="stats__cell" style={{ padding: '10px 0' }}>
                            <span className="stats__num" style={{ fontSize: '24px' }}>{res.n}</span>
                            <span className="stats__label" style={{ fontSize: '12.5px' }}>{res.l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. CTA Band */}
      <section className="section section--last">
        <div className="ctaband">
          <div>
            <h2 className="display display--panel">Partner on a project</h2>
            <p className="ctaband__body">
              HAB works with government agencies, development partners, research institutions and the private sector. Project evaluations are available from the secretariat on request.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/contact">
              Contact the secretariat
            </Link>
            <Link className="btn btn--ghost" href="/publications">
              Evaluations &amp; reports
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
