'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProgrammeItem {
  ref: string;
  title: string;
  description: string;
  activities?: string[];
  image_path?: string;
}

const DEFAULT_PROGRAMMES: ProgrammeItem[] = [
  { ref: 'a', title: 'Sector Representation and Advocacy', description: 'Represent and advance the collective interests of all handicrafts sector stakeholders — artisans, producers, designers, traders and service providers — before governmental, legislative, regulatory, intergovernmental and private sector bodies.', image_path: '/assets/photos/hero-1-weaving.jpg' },
  { ref: 'b', title: 'Policy Development and Intervention', description: 'Engage with competent authorities on policies, laws, regulations, standards and incentive frameworks affecting the sector; submit evidence-based positions and monitor implementation of policy commitments.', image_path: '/assets/photos/hero-2-punakha.jpg' },
  { ref: 'c', title: 'Trade Facilitation', description: 'Facilitate domestic and international trade through trade infrastructure, standards compliance systems, market linkage mechanisms, export facilitation instruments and certification frameworks.', image_path: '/assets/photos/hero-3-clay.jpg' },
  { ref: 'd', title: 'Product Development', description: 'Support innovation, quality enhancement, design evolution and product diversification through design interventions, technical upgradation and linkages between artisans, designers, institutions and markets.', image_path: '/assets/photos/hero-4-textiles.jpg' },
  { ref: 'e', title: 'Branding and Market Development', description: 'Steward a credible sector brand identity for Bhutanese handicrafts, promote authenticity and cultural value, and support distribution networks, retail channels and promotional platforms.', image_path: '/assets/photos/hero-5-desho.jpg' },
  { ref: 'f', title: 'Capacity Development', description: 'Strengthen productive, entrepreneurial, managerial, technical and institutional capacity through training, professional development, knowledge exchange, mentorship and peer learning.', image_path: '/assets/photos/hero-1-weaving.jpg' },
  { ref: 'g', title: 'Cultural Heritage Stewardship', description: 'Protect, document, promote and transmit the intangible cultural heritage of the Zorig Chusum; maintain a registry of authentic craft practices and producers; pursue geographical indication and certification of origin.', image_path: '/assets/photos/hero-2-punakha.jpg' },
  { ref: 'h', title: 'Research and Knowledge Management', description: 'Undertake and disseminate research, sector data, market intelligence and policy analysis to inform advocacy, programme design and the evidence base for the sector.', image_path: '/assets/photos/hero-3-clay.jpg' },
  { ref: 'i', title: 'Social Inclusion and Equity', description: 'Advance equitable participation of rural artisans, women practitioners, youth, persons with disabilities and marginalised communities in the sector and in HAB’s programmes, governance and services.', image_path: '/assets/photos/hero-4-textiles.jpg' },
  { ref: 'j', title: 'Financial Sustainability of the Sector', description: 'Facilitate access to finance, grants, concessional credit and catalytic investment; develop financial literacy and entrepreneurship programmes; strengthen long-term viability.', image_path: '/assets/photos/hero-5-desho.jpg' },
  { ref: 'k', title: 'Partnerships and Institutional Linkages', description: 'Establish and grow partnerships with national and international organisations, government agencies, development partners, research and educational institutions, the private sector and civil society.', image_path: '/assets/photos/hero-1-weaving.jpg' },
];

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<ProgrammeItem[]>(DEFAULT_PROGRAMMES);

  useEffect(() => {
    fetch('/api/programmes', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.pillars && Array.isArray(data.pillars) && data.pillars.length > 0) {
          setProgrammes(data.pillars.map((p: any) => ({
            ref: p.ref || 'a',
            title: p.title,
            description: p.description,
            activities: p.activities || [],
            image_path: p.imageUrl || p.image_path || '/assets/photos/hero-1-weaving.jpg',
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main id="main">

      {/* 1. Header & Mandate */}
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / Programmes
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Programmes</p>
            <h1 className="display display--page">Eleven objects, one mandate</h1>
            <p className="lede">
              HAB operates as the national apex Public Benefit Organisation for Bhutan&apos;s handicrafts sector, advancing the productive, economic, cultural and social well-being of all actors across the handicrafts value chain.
            </p>
            <p className="section__lede">
              Every programme runs against one or more of the objects set out in Article 3.2 of the Articles of Association. Activity outside those objects is <em>ultra vires</em> and of no effect.
            </p>
          </div>
          <div className="panel panel--accent">
            <p className="eyebrow eyebrow--onaccent">Governing principles</p>
            <p className="panel__body panel__body--onaccent" style={{ fontSize: '17px', fontWeight: 600 }}>
              Public Benefit · Integrity · Inclusivity · Cultural Stewardship · Compliance · Independence
            </p>
            <p className="panel__body panel__body--onaccent" style={{ margin: 0, fontSize: '14.5px' }}>
              Constituted under the Civil Society Organizations Act of Bhutan 2007, as amended 2022. National scope across all twenty dzongkhags. Non-political by constitution.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Programmes Grid */}
      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent">What we run</p>
            <h2 className="display display--sub">Our Programmes</h2>
            <p className="section__lede">
              The objects are construed broadly: each is a standing programme area, not a fixed project.
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/projects">
            See current projects →
          </Link>
        </div>

        <div className="grid grid--3" id="programmeList">
          {programmes.map((p, idx) => (
            <article key={p.ref || idx} className="card programme">
              <figure className="frame frame--wide16">
                <img
                  src={p.image_path || `/assets/photos/hero-${(idx % 5) + 1}-${idx === 0 ? 'weaving' : idx === 1 ? 'punakha' : idx === 2 ? 'clay' : idx === 3 ? 'textiles' : 'desho'}.jpg`}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-1-weaving.jpg'; }}
                />
              </figure>
              <div className="card__body">
                <div className="programme__head">
                  <span className="badge badge--ref">Art. 3.2({p.ref})</span>
                  <h3 className="card__title clamp-2">{p.title}</h3>
                </div>
                <p className="card__text programme__desc clamp-4">{p.description}</p>
                <Link className="link-accent programme__toggle" href={`/programmes/${p.ref}`}>
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. CTA Band */}
      <section className="section section--last">
        <div className="ctaband">
          <div>
            <h2 className="display display--panel">Access these programmes</h2>
            <p className="ctaband__body">
              Active Sector Members receive preferential access to training, trade fair participation and market linkage services. Affiliated Members receive general sector benefits.
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/membership/apply">
              Become a member
            </Link>
            <Link className="btn btn--ghost" href="/publications">
              Reports &amp; downloads
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
