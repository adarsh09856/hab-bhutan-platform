'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { useLanguage } from '@/context/LanguageContext';

interface Project {
  key: string;
  status: 'current' | 'past';
  name: string;
  nameDz?: string;
  partner: string;
  partnerDz?: string;
  period: string;
  periodDz?: string;
  budget: string;
  budgetDz?: string;
  progress?: number;
  summary: string;
  summaryDz?: string;
  activities: string[];
  activitiesDz?: string[];
  results: { n: string; l: string }[];
  resultsDz?: string[];
  image_path?: string;
  coverPhotoUrl?: string;
  reportPdfUrl?: string;
}

export default function ProjectsPage() {
  const { language, t } = useLanguage();
  const local = (english: string, dzongkha?: string | null) => language === 'dz' && dzongkha?.trim() ? dzongkha : english;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [statusTab, setStatusTab] = useState<'current' | 'past'>('current');

  useEffect(() => {
    const loadProjects = () => fetch('/api/projects', { cache: 'no-store' })
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
          nameDz: p.nameDz || '',
          partner: p.partner || p.donor || '',
          partnerDz: p.partnerDz || '',
          period: p.period || p.yearRange || '',
          periodDz: p.periodDz || '',
          budget: p.budget || '',
          budgetDz: p.budgetDz || '',
          summary: p.summary || p.description || '',
          summaryDz: p.summaryDz || '',
          activities: Array.isArray(p.activities) ? p.activities : [],
          activitiesDz: Array.isArray(p.activitiesDz) ? p.activitiesDz : [],
          results: Array.isArray(p.results)
            ? p.results.map((result: any) => typeof result === 'string' ? { n: '', l: result } : result)
            : [],
          resultsDz: Array.isArray(p.resultsDz) ? p.resultsDz : [],
          image_path: p.coverPhotoUrl || p.imageUrl || p.image_path || '',
          coverPhotoUrl: p.coverPhotoUrl || '',
          reportPdfUrl: p.reportPdfUrl || '',
        })));
        setLoadState('ready');
      })
      .catch(() => { setProjects([]); setLoadState('error'); });
    loadProjects();
    const onRecordsUpdated = (event: Event) => {
      if ((event as CustomEvent<{ sectionType: string }>).detail?.sectionType === 'projects') loadProjects();
    };
    window.addEventListener('hab:records-updated', onRecordsUpdated);
    return () => window.removeEventListener('hab:records-updated', onRecordsUpdated);
  }, []);

  const currentProjects = projects.filter((p) => p.status === 'current');
  const pastProjects = projects.filter((p) => p.status === 'past');
  const displayedProjects = statusTab === 'current' ? currentProjects : pastProjects;
  const fundingPartners = new Set(projects.map((p) => p.partner.trim()).filter(Boolean)).size;

  return (
    <main id="main">

      {/* 1. Hero & Stats */}
      <section className="section relative" data-hab-section="projects">
        <SectionEditBadge label="Donor Projects" studioHref="/admin/projects" />
        <p className="crumbs">
          <Link href="/">{t('nav.home', 'Home')}</Link> / {t('nav.projects', 'Projects')}
        </p>
        <div className="projhero">
          <div>
            <h1 className="display display--page">{t('nav.projects', 'Projects')}</h1>
            <p className="lede">{t('projects.intro', 'HAB delivers its programmes as funded projects, each with an agreed workplan, budget and reporting cycle. Below are the projects currently in hand and those already completed, with their key activities and what they achieved.')}</p>
          </div>
          {loadState === 'ready' && (
            <div className="craftfacts craftfacts--2" aria-label={t('projects.facts_label', 'Project facts')}>
              {[
                { value: currentProjects.length, label: t('projects.current_tab', 'Projects in hand') },
                { value: pastProjects.length, label: t('projects.completed_tab', 'Completed projects') },
                { value: projects.length, label: t('projects.total_count', 'Projects recorded') },
                { value: fundingPartners, label: t('projects.partners_count', 'Funding partners recorded') },
              ].map((fact) => (
                <div className="craftfacts__cell" key={fact.label}>
                  <span className="craftfacts__key">{fact.label}</span>
                  <span className="craftfacts__val">{fact.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Tabs */}
        <div className="tabs tabs--rule" role="tablist" aria-label={t('projects.status_label', 'Project status')}>
          <button
            type="button"
            className={`tab ${statusTab === 'current' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={statusTab === 'current'}
            onClick={() => setStatusTab('current')}
          >
            {t('projects.current_tab', 'Projects in hand')}
            <span className="tab__n" style={{ marginLeft: '6px' }}>{currentProjects.length}</span>
          </button>
          <button
            type="button"
            className={`tab ${statusTab === 'past' ? 'is-active' : ''}`}
            role="tab"
            aria-selected={statusTab === 'past'}
            onClick={() => setStatusTab('past')}
          >
            {t('projects.completed_tab', 'Completed projects')}
            <span className="tab__n" style={{ marginLeft: '6px' }}>{pastProjects.length}</span>
          </button>
          <span className="craft__count" id="projectCount" style={{ margin: 0, alignSelf: 'center', marginLeft: 'auto' }}>
            {displayedProjects.length} {displayedProjects.length === 1 ? t('projects.project_one', 'project') : t('projects.project_many', 'projects')}
          </span>
        </div>

        {/* 3. Projects List */}
        <div className="projectlist" id="projectList">
          {loadState !== 'ready' || displayedProjects.length === 0 ? (
            <p className="section__lede" role={loadState === 'error' ? 'alert' : 'status'}>
              {loadState === 'loading' ? t('projects.loading', 'Loading projects…') : loadState === 'error' ? t('projects.unavailable', 'Projects are temporarily unavailable.') : t(statusTab === 'current' ? 'projects.none_current' : 'projects.none_completed', statusTab === 'current' ? 'No current projects are listed.' : 'No completed projects are listed.')}
            </p>
          ) : null}
          {displayedProjects.map((p, idx) => (
            <article
              key={p.key || idx}
              className={`projectcard ${p.coverPhotoUrl || p.image_path ? '' : 'projectcard--no-image'}`}
              id={p.key}
            >
              {p.coverPhotoUrl || p.image_path ? <figure className="frame frame--projshot" data-hab-gallery="project" data-hab-gallery-id={p.key}>
                <img src={p.coverPhotoUrl || p.image_path} alt={local(p.name, p.nameDz)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </figure> : null}
              <div className="projectcard__body">
                <div className="projectcard__status">
                  <span className={`tag ${p.status === 'past' ? 'tag--done' : ''}`}>
                    {p.status === 'current' ? t('projects.in_progress', 'In progress') : t('projects.completed', 'Completed')}
                  </span>
                  {(p.period || p.budget) && <span className="projectcard__period">{[local(p.period, p.periodDz), local(p.budget, p.budgetDz)].filter(Boolean).join(' · ')}</span>}
                </div>
                <h2 className="projectcard__name">{local(p.name, p.nameDz)}</h2>
                {p.partner && <p className="projectcard__partner">{local(p.partner, p.partnerDz)}</p>}
                {p.summary && <p className="projectcard__summary">{local(p.summary, p.summaryDz)}</p>}
                <Link className="btn btn--accent btn--sm projectcard__more" href={`/projects/${p.key}`}>
                  {t('projects.read_more', 'Read more →')}
                </Link>

                <div className="projectcard__cols">
                  {p.activities && p.activities.length > 0 && (
                    <div>
                      <p className="eyebrow eyebrow--muted eyebrow--sm">{t('projects.key_activities', 'Key activities')}</p>
                      <ol className="numlist numlist--ruled">
                        {p.activities.map((item, i) => (
                          <li key={i} className="numlist__item">
                            <span className="numlist__n">{String(i + 1).padStart(2, '0')}</span>
                            <span className="numlist__t">{local(item, p.activitiesDz?.[i])}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {p.results && p.results.length > 0 && (
                    <div>
                      <p className="eyebrow eyebrow--muted eyebrow--sm">{t('projects.key_results', 'Key results')}</p>
                      <div className="grid grid--2" style={{ gap: '8px' }}>
                        {p.results.map((res, i) => (
                          <div key={i} className="stats__cell" style={{ padding: '10px 0' }}>
                            <span className="stats__num" style={{ fontSize: '24px' }}>{res.n}</span>
                            <span className="stats__label" style={{ fontSize: '12.5px' }}>{local(res.l, p.resultsDz?.[i])}</span>
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
            <h2 className="display display--panel">{t('projects.partner_title', 'Partner on a project')}</h2>
            <p className="ctaband__body">{t('projects.partner_body', 'HAB works with government agencies, development partners, research institutions and the private sector. Project evaluations are available from the secretariat on request.')}</p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/contact">
              {t('projects.contact_secretariat', 'Contact the secretariat')}
            </Link>
            <Link className="btn btn--ghost" href="/publications">
              {t('projects.evaluations_reports', 'Evaluations & reports')}
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
