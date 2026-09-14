'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
}

const DEFAULT_PROJECTS: Project[] = [
  {
    key: 'switch-asia',
    status: 'current',
    name: 'Sustainable Bhutanese Handicrafts (SWITCH-Asia)',
    partner: 'EU SWITCH-Asia · with GrAT and SHINE',
    period: '2024 – 2027',
    budget: 'EUR 1.4 m',
    progress: 62,
    summary: 'Shifting member enterprises to resource-efficient production: natural dyes, waste reduction and cleaner finishing, while holding craft quality.',
    activities: [
      'Cleaner-production audits in 240 workshops',
      'Natural dye and low-waste finishing training',
      'Green business plans and access to finance',
      'Eco-label criteria drafted with RGoB',
    ],
    results: [
      { n: '240', l: 'Enterprises audited' },
      { n: '1,180', l: 'Artisans trained' },
      { n: '31%', l: 'Average waste reduction' },
    ],
    image_path: '/assets/photos/hero-1-weaving.jpg',
  },
  {
    key: 'market-access',
    status: 'current',
    name: 'Market Access for Rural Artisans',
    partner: 'Enhanced Integrated Framework (EIF)',
    period: '2025 – 2027',
    budget: 'USD 620,000',
    progress: 38,
    summary: 'Connecting rural producer groups to export buyers through the HAB e-shop, trade fairs and consolidated EMS shipping.',
    activities: [
      'Product photography and cataloguing for 400 items',
      'Export documentation clinics in six dzongkhags',
      'Buyer missions to India, Thailand and Japan',
      'Consolidated shipping desk at the secretariat',
    ],
    results: [
      { n: '400', l: 'Products catalogued' },
      { n: '14', l: 'Export buyers engaged' },
      { n: '6', l: 'Dzongkhags covered' },
    ],
    image_path: '/assets/photos/hero-2-punakha.jpg',
  },
  {
    key: 'skills-transmission',
    status: 'current',
    name: 'Zorig Chusum Skills Transmission',
    partner: 'UNDP GEF Small Grants Programme',
    period: '2026 – 2028',
    budget: 'USD 180,000',
    progress: 12,
    summary: 'Master-to-apprentice placements in the five crafts with the fewest practising members, to keep endangered techniques alive.',
    activities: [
      'Master craftspeople identified in Lugzo, Garzo, Jinzo, Dozo and Shingzo',
      'Two-year paid apprenticeships for 40 young artisans',
      'Technique documentation in video and print',
      'Curriculum shared with the Institute of Zorig Chusum',
    ],
    results: [
      { n: '40', l: 'Apprenticeships opened' },
      { n: '5', l: 'Endangered crafts covered' },
      { n: '18', l: 'Masters engaged' },
    ],
    image_path: '/assets/photos/hero-3-clay.jpg',
  },
  {
    key: 'women-in-craft',
    status: 'past',
    name: 'Women in Craft Enterprise',
    partner: 'Government of Canada · Helvetas Bhutan',
    period: '2021 – 2024',
    budget: 'CAD 900,000',
    summary: 'Business and pricing capability for women-led craft enterprises, with a revolving fund for raw material purchase.',
    activities: [
      'Costing and pricing training for 2,100 women',
      'Revolving raw-material fund in 9 dzongkhags',
      'Producer groups formalised and registered',
      'Childcare support at training venues',
    ],
    results: [
      { n: '2,100', l: 'Women trained' },
      { n: '64%', l: 'Reported income increase' },
      { n: '312', l: 'New enterprises registered' },
    ],
    image_path: '/assets/photos/hero-4-textiles.jpg',
  },
  {
    key: 'covid-recovery',
    status: 'past',
    name: 'COVID-19 Craft Sector Recovery',
    partner: 'UNDP Bhutan · RGoB',
    period: '2020 – 2022',
    budget: 'USD 450,000',
    summary: 'Emergency income support and a first move to online selling when tourism arrivals stopped.',
    activities: [
      'Cash-for-craft procurement from 1,600 artisans',
      'HAB e-shop launched with payment gateway',
      'Domestic craft bazaars in four dzongkhags',
      'Raw material bulk purchase to hold prices',
    ],
    results: [
      { n: '1,600', l: 'Artisans supported' },
      { n: 'Nu. 24 m', l: 'Craft purchased directly' },
      { n: '195', l: 'Stores kept trading' },
    ],
    image_path: '/assets/photos/hero-5-desho.jpg',
  },
  {
    key: 'innovation-lab',
    status: 'past',
    name: 'Craft Product Innovation Lab',
    partner: 'BCCI · Ernst & Young (pro bono)',
    period: '2019 – 2021',
    budget: 'USD 210,000',
    summary: 'Pairing artisans with designers to develop contemporary lines from traditional technique for retail and hospitality.',
    activities: [
      'Six design–artisan cycles across four crafts',
      'Prototyping grants and material sourcing',
      'Hotel and retail buyer showcases',
      'Design rights guidance for participants',
    ],
    results: [
      { n: '38', l: 'New products launched' },
      { n: '11', l: 'Hotel and retail accounts' },
      { n: '4', l: 'Crafts represented' },
    ],
    image_path: '/assets/photos/hero-1-weaving.jpg',
  },
];

const PROJECT_STATS = [
  { value: '11', label: 'Projects delivered since 2011' },
  { value: '7,500', label: 'Artisans in the network reached' },
  { value: 'USD 4.6 m', label: 'Programme funding managed' },
  { value: '9', label: 'Funding partners' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [statusTab, setStatusTab] = useState<'current' | 'past'>('current');

  useEffect(() => {
    fetch('/api/projects', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(
            data.projects.map((p: any) => ({
              key: p.key || p.slug || p.id,
              status: (p.status === 'completed' || p.status === 'past') ? 'past' : 'current',
              name: p.name || p.title,
              partner: p.partner || p.donor || 'HAB Strategic Partner',
              period: p.period || p.yearRange || '2024 – 2027',
              budget: p.budget || 'Grant Funded',
              progress: p.progressPercent || p.progress || 50,
              summary: p.summary || p.description,
              activities: Array.isArray(p.activities) ? p.activities : [],
              results: Array.isArray(p.results)
                ? p.results.map((r: any) => (typeof r === 'string' ? { n: '✓', l: r } : r))
                : [],
              image_path: p.imageUrl || p.image_path || '/assets/photos/hero-1-weaving.jpg',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const currentProjects = projects.filter((p) => p.status === 'current');
  const pastProjects = projects.filter((p) => p.status === 'past');
  const displayedProjects = statusTab === 'current' ? currentProjects : pastProjects;

  return (
    <main id="main">

      {/* 1. Hero & Stats */}
      <section className="section">
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
          <div className="craftfacts craftfacts--2" id="projectStats">
            {PROJECT_STATS.map((st, i) => (
              <div key={i} className="craftfacts__cell">
                <span className="craftfacts__key">{st.label}</span>
                <span className="craftfacts__val">{st.value}</span>
              </div>
            ))}
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
          {displayedProjects.map((p, idx) => (
            <article key={p.key || idx} className="projectcard" id={p.key}>
              <figure className="frame frame--projshot">
                <img
                  src={p.image_path || `/assets/photos/hero-${(idx % 5) + 1}-${idx === 0 ? 'weaving' : idx === 1 ? 'punakha' : idx === 2 ? 'clay' : idx === 3 ? 'textiles' : 'desho'}.jpg`}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-1-weaving.jpg'; }}
                />
              </figure>
              <div className="projectcard__body">
                <div className="projectcard__status">
                  <span className={`tag ${p.status === 'past' ? 'tag--done' : ''}`}>
                    {p.status === 'current' ? 'In progress' : 'Completed'}
                  </span>
                  <span className="projectcard__period">
                    {p.period} · {p.budget}
                  </span>
                </div>
                <h2 className="projectcard__name">{p.name}</h2>
                <p className="projectcard__partner">{p.partner}</p>
                <p className="projectcard__summary">{p.summary}</p>
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
