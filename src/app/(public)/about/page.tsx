'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [governance, setGovernance] = useState<{
    board: Array<{ role: string; name: string; note: string }>;
    team: Array<{ role: string; name: string; note: string }>;
    milestones: Array<{ y: string; t: string }>;
  } | null>(null);

  useEffect(() => {
    // 1. Dynamic API: Site Settings
    fetch('/api/site-settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.setting) {
          setSiteSettings(data.setting);
        } else if (data?.settings) {
          setSiteSettings(data.settings);
        }
      })
      .catch(() => {});

    // 2. Dynamic API: Governance & Team
    fetch('/api/governance', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setGovernance({
            board: data.board || [],
            team: data.team || [],
            milestones: data.milestones || [],
          });
        }
      })
      .catch(() => {});
  }, []);

  const s = siteSettings;

  const aboutIntro = s?.aboutMandateText || s?.aboutIntro ||
    'The Handicrafts Association of Bhutan (HAB) was established in 2005 under Royal Patronage and registered as a Civil Society Organisation (CSO/2011/043) and Public Benefit Organisation (PBO) under the Civil Society Organizations Act of Bhutan.';

  const facts: { key: string; value: string }[] = (Array.isArray(s?.aboutStats) && s.aboutStats.length > 0)
    ? s.aboutStats.map((st: any) => ({ key: String(st.label || ''), value: String(st.number || '') }))
    : [
        { key: 'Established', value: '2005' },
        { key: 'Registered CSO', value: s?.csoRegistration || '2011 · CSO/2011/043' },
        { key: 'Member enterprises', value: s?.stat1Number || '7,500' },
        { key: 'Affiliated stores', value: s?.stat3Number || '195' },
      ];

  const visionTitle = s?.visionTitle || 'Towards a vibrant & sustainable handicrafts sector';
  const visionBody = s?.visionBody || s?.heroParagraph || 'A Bhutan where the thirteen crafts remain in daily practice, and where making them is a livelihood a young person would choose.';
  const missionTitle = s?.missionTitle || 'Promoting sustainability, inclusiveness and resilience';
  const missionBody = s?.missionBody || s?.aboutMandatePara2 || 'HAB supports local artisans by providing resources, training and policy interventions to improve their skills and increase their chances of success in local communities and the tourism industry.';

  const objectives: string[] = (Array.isArray(s?.aboutObjectives) && s.aboutObjectives.length > 0)
    ? s.aboutObjectives.map((o: any) => String(o))
    : [
        'Improve market access for Bhutanese artisans at home, in the tourism sector and internationally.',
        'Raise product quality and consistency through training, standards and inspection.',
        'Guarantee fair compensation and prompt payment for handcrafted work.',
        'Keep the thirteen crafts of Zorig Chusum in living practice, particularly those with few practitioners.',
        'Represent the sector in policy dialogue with government and development partners.',
        'Strengthen member enterprises as businesses — costing, licensing, export documentation and finance.',
      ];

  const values: { letter: string; title: string; body: string }[] = (Array.isArray(s?.aboutValues) && s.aboutValues.length > 0)
    ? s.aboutValues.map((v: any) => ({
        letter: String(v.letter || ''),
        title: String(v.title || ''),
        body: String(v.body || ''),
      }))
    : [
        { letter: 'C', title: 'Care', body: 'Care for the maker, the material and the object. We do not ask an artisan to cut a corner we would not put our own name to, and we do not sell work we have not handled.' },
        { letter: 'R', title: 'Respect', body: 'Respect for a tradition older than the association, and for the person who carries it. Masters are consulted, not instructed; technique is recorded on the maker’s terms.' },
        { letter: 'A', title: 'Attentive', body: 'Attentive to quality, to the market and to what members actually ask for. Programmes are designed from what artisans report, and are dropped when they stop working.' },
        { letter: 'F', title: 'Fair', body: 'Fair dealing, in writing. Prices are agreed with the maker and paid upfront, consignment risk stays with the association, and no member is undercut by another.' },
        { letter: 'T', title: 'Transparent', body: 'Transparent about money and results. Audited accounts, programme outcomes and project evaluations are published every year in English and Dzongkha.' },
      ];

  const govNote = s?.govNote || 'HAB is a Public Benefit Organisation under the Civil Society Organizations Act of Bhutan 2007, as amended in 2022. Authority runs from the sector membership upward: the Annual Sector Forum receives the accounts and the Board of Trustees is accountable for governance, with Dzongkhag Chapters carrying representation into all twenty districts.';

  const governanceTiers = [
    { tier: 'Sector Membership', note: 'Artisans, producers, designers, traders and service providers across the handicrafts value chain, admitted as Active or Affiliated members. Active Sector Members receive preferential access to services.', items: ['Active Sector Members', 'Associate Members', 'Admission by the Board', 'Register maintained by the secretariat'] },
    { tier: 'Annual Sector Forum', note: 'The annual meeting of the sector membership. Receives the annual report and audited accounts, considers the strategic direction, and provides the forum for sector-wide consultation.', items: ['Held annually', 'Annual report & accounts received', 'Sector consultation', 'Open to all members'] },
    { tier: 'Board of Trustees', note: 'Holds fiduciary responsibility for HAB and is accountable to the Authority for compliance. Adopts the Strategic Plan and approves annual workplans and budgets; may resolve that further activity falls within the objects.', items: ['Fiduciary responsibility', 'Adopts the Strategic Plan', 'Approves workplans & budgets', 'Reports to the Authority'] },
    { tier: 'Dzongkhag Chapters', note: 'Subnational structures carrying representation and service delivery into all twenty dzongkhags, so rural and informal producers participate on equal terms.', items: ['Twenty dzongkhags', 'Local representation', 'Programme delivery', 'Member services'] },
    { tier: 'Secretariat', note: 'Delivers the approved workplan under the Board, maintains the statutory registers and records, and files reports and returns to the Authority under BCAS.', items: ['Programme delivery', 'Statutory registers', 'Reports & returns', 'Membership services'] },
    { tier: 'Endowment Fund', note: 'Held for the long-term financial sustainability of the sector, alongside grants, donations and project funding administered under the Board.', items: ['Long-term sustainability', 'Grants & donations', 'Project funding', 'Board oversight'] },
  ];

  const defaultBoard = [
    { role: 'Chair, Board of Trustees', name: 'Aum Karma Wangmo', note: 'Master weaver, Lhuentse' },
    { role: 'Vice-Chair', name: 'Sonam Tashi', note: 'Craft enterprise owner, Thimphu' },
    { role: 'Trustee — Finance', name: 'Kinley Dorji', note: 'Chairs audit & finance' },
    { role: 'Trustee — Membership', name: 'Tashi Pelzom', note: 'Eastern dzongkhags' },
    { role: 'Trustee — Crafts', name: 'Lopen Ugyen Namgyel', note: 'Institute of Zorig Chusum' },
    { role: 'Trustee — Dzongkhag Chapters', name: 'Dawa Zangmo', note: 'Chapter representation, twenty dzongkhags' },
    { role: 'Trustee — Market Development', name: 'Pema Rinzin', note: 'Export trade and retail' },
    { role: 'Trustee — Compliance', name: 'Karma Tshering', note: 'CSOA compliance and reporting' },
  ];

  const defaultTeam = [
    { role: 'Executive Director', name: 'Chhimi Bidha', note: '+975-2-338089 · director@handicraftsbhutan.org' },
    { role: 'Programmes & Projects', name: 'Sonam Choden', note: 'Donor projects, training, M&E' },
    { role: 'Marketing & E-shop', name: 'Tenzin Norbu', note: '+975-17462636 · shop@handicraftsbhutan.org' },
    { role: 'Finance & Administration', name: 'Dechen Wangmo', note: 'Accounts, procurement, payroll' },
    { role: 'Membership Services', name: 'Sangay Lhamo', note: 'Applications, directory, dues' },
    { role: 'Trade Facilitation', name: 'Karma Dorji', note: 'Export documentation, buyer liaison' },
    { role: 'Cluster Support Officer', name: 'Tshering Yangzom', note: 'Artisan clusters and producer groups' },
    { role: 'Communications', name: 'Pema Lhaden', note: 'Publications, website, newsroom' },
  ];

  const boardList = (governance?.board && governance.board.length > 0) ? governance.board : defaultBoard;
  const teamList = (governance?.team && governance.team.length > 0) ? governance.team : defaultTeam;

  return (
    <main id="main">

      {/* 1. Page Hero & Facts */}
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / About us
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Who we are</p>
            <h1 className="display display--page">A pioneer centre for Bhutanese handicrafts</h1>
            <p className="lede">{aboutIntro}</p>
          </div>
          <div className="craftfacts craftfacts--2">
            {facts.map((f: { key: string; value: string }, idx: number) => (
              <div key={idx} className="craftfacts__cell">
                <span className="craftfacts__key">{f.key}</span>
                <span className="craftfacts__val">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
        <figure className="frame frame--banner">
          <img
            src="/assets/photos/about-hab.jpg"
            alt="Handicrafts Association of Bhutan artisans and training"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-1-weaving.jpg'; }}
          />
          <figcaption className="frame__caption">
            photo — HAB artisan training workshop, Thimphu
          </figcaption>
        </figure>
      </section>

      {/* 2. Vision & Mission Band */}
      <section className="band">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass">Vision</p>
            <h2 className="display display--vm">{visionTitle}</h2>
            <p className="band__body">{visionBody}</p>
          </div>
          <div className="vm__second">
            <p className="eyebrow eyebrow--brass">Mission</p>
            <h2 className="display display--vm">{missionTitle}</h2>
            <p className="band__body">{missionBody}</p>
          </div>
        </div>
      </section>

      {/* 3. Objectives */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">Objectives</p>
            <h2 className="display display--sub">What we set out to do</h2>
            <p className="section__lede">
              Six objectives carried in the strategic plan 2026–2030, against which the Board reviews performance each year.
            </p>
          </div>
          <div className="objlist">
            {objectives.map((text: string, i: number) => (
              <div key={i} className="objrow">
                <span className="objrow__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="objrow__t">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Values */}
      <section className="section">
        <p className="eyebrow eyebrow--accent">Values</p>
        <h2 className="display display--sub">How we work</h2>
        <p className="section__lede" style={{ marginBottom: '28px' }}>
          Five commitments, and they spell what we are for. Each one is testable — a member can hold the association to it.
        </p>
        <div className="valuegrid">
          {values.map((v: { letter: string; title: string; body: string }) => (
            <div key={v.letter} className="valuecell">
              <span className="valuecell__letter">{v.letter}</span>
              <h3 className="valuecell__title">{v.title}</h3>
              <p className="valuecell__body">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Governance */}
      <section className="section" id="governance">
        <div className="govwrap">
          <aside className="govintro">
            <p className="eyebrow eyebrow--accent">Governance</p>
            <h2 className="display display--sub">How HAB is governed</h2>
            <p className="govintro__note">{govNote}</p>
            <Link className="btn btn--outline btn--sm" href="/publications">
              Articles &amp; reports →
            </Link>
          </aside>
          <div className="govlist">
            {governanceTiers.map((g, i) => (
              <article key={i} className="govtier">
                <div className="govtier__rail">
                  <span className="govtier__n">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="govtier__body">
                  <h3 className="govtier__title">{g.tier}</h3>
                  <p className="govtier__note">{g.note}</p>
                  <div className="govtier__chips">
                    {g.items.map((item, idx) => (
                      <span key={idx} className="govchip">{item}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Board of Trustees */}
      <section className="section">
        <p className="eyebrow eyebrow--accent">Board of Trustees</p>
        <h2 className="display display--sub" style={{ marginBottom: '28px' }}>Oversight body</h2>
        <div className="grid grid--people">
          {boardList.map((b, idx) => (
            <article key={idx} className="card">
              <figure className="frame frame--square">
                <img
                  src={`/assets/photos/hero-${(idx % 5) + 1}-${idx === 0 ? 'weaving' : idx === 1 ? 'punakha' : idx === 2 ? 'clay' : idx === 3 ? 'textiles' : 'desho'}.jpg`}
                  alt={b.role}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-1-weaving.jpg'; }}
                />
                <figcaption className="frame__caption frame__caption--sm">{b.role}</figcaption>
              </figure>
              <div className="card__body">
                <p className="eyebrow eyebrow--accent eyebrow--sm">{b.role}</p>
                <h3 className="card__title">{b.name}</h3>
                <p className="card__meta">{b.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 7. Secretariat */}
      <section className="section">
        <p className="eyebrow eyebrow--accent">Secretariat</p>
        <h2 className="display display--sub" style={{ marginBottom: '28px' }}>Our team</h2>
        <div className="grid grid--team">
          {teamList.map((t, idx) => (
            <div key={idx} className="teamrow">
              <div className="teamrow__avatar" style={{ overflow: 'hidden' }}>
                <img
                  src={`/assets/photos/hero-${(idx % 5) + 1}-${idx === 0 ? 'weaving' : idx === 1 ? 'punakha' : idx === 2 ? 'clay' : idx === 3 ? 'textiles' : 'desho'}.jpg`}
                  alt={t.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-1-weaving.jpg'; }}
                />
              </div>
              <div>
                <p className="eyebrow eyebrow--accent eyebrow--sm">{t.role}</p>
                <p className="teamrow__name">{t.name}</p>
                <p className="card__meta">{t.note}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="footnote">Names and portfolios accredited by the Secretariat.</p>
      </section>

      {/* 8. CTA Band */}
      <section className="section section--last">
        <div className="ctaband">
          <div>
            <h2 className="display display--panel">Work with the association</h2>
            <p className="ctaband__body">
              Artisans and enterprises can apply for membership online. Retailers, hotels and development partners can reach the secretariat directly at Metog Lam, Thimphu.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/membership/apply">
              Apply for membership
            </Link>
            <Link className="btn btn--ghost" href="/publications">
              Annual reports
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
