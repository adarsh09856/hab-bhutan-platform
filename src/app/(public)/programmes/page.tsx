'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { fallbackHeroPhoto } from '@/lib/public-images';
import UniversalLiveSectionEditor from '@/components/public/UniversalLiveSectionEditor';
import LocalizedRecordField from '@/components/public/LocalizedRecordField';

interface ProgrammeItem {
  ref: string;
  title: string;
  titleDz?: string | null;
  description: string;
  descriptionDz?: string | null;
  activities?: string[];
  activitiesDz?: string[];
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
  const [liveEditOpen, setLiveEditOpen] = useState(false);

  const fetchProgrammes = useCallback(() => {
    fetch('/api/programmes', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.pillars && Array.isArray(data.pillars) && data.pillars.length > 0) {
          setProgrammes(data.pillars.map((p: any) => ({
            ref: p.ref || 'a',
            title: p.title,
            titleDz: p.titleDz || null,
            description: p.description,
            descriptionDz: p.descriptionDz || null,
            activities: p.activities || [],
            activitiesDz: Array.isArray(p.activitiesDz) ? p.activitiesDz : [],
            image_path: p.imageUrl || p.image_path || '/assets/photos/hero-1-weaving.jpg',
          })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProgrammes();

    const handleUpdate = () => {
      fetchProgrammes();
    };

    window.addEventListener('hab:settings-updated', handleUpdate);
    window.addEventListener('hab:content-updated', handleUpdate);
    return () => {
      window.removeEventListener('hab:settings-updated', handleUpdate);
      window.removeEventListener('hab:content-updated', handleUpdate);
    };
  }, [fetchProgrammes]);

  return (
    <main id="main">

      {/* 1. Header & Mandate */}
      <section className="section relative" data-hab-section="programmes">
        <SectionEditBadge
          label="Programme Pillars"
          studioHref="/admin/programmes"
          onQuickEdit={() => setLiveEditOpen(true)}
        />
        <p className="crumbs">
          <Link href="/"><LocalizedRecordField english="Home" dzongkha="ཁྱིམ" /></Link> / <LocalizedRecordField english="Programmes" dzongkha="ལས་རིམ་ཚུ" />
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="Programmes" dzongkha="ལས་རིམ་ཚུ" /></p>
            <h1 className="display display--page"><LocalizedRecordField english="Eleven objects, one mandate" dzongkha="དམིགས་དོན་བཅུ་གཅིག་ ལས་འགན་གཅིག" /></h1>
            <p className="lede">
              <LocalizedRecordField english="HAB operates as the national apex Public Benefit Organisation for Bhutan&apos;s handicrafts sector, advancing the productive, economic, cultural and social well-being of all actors across the handicrafts value chain." dzongkha="HAB འདི་ འབྲུག་གི་ལག་བཟོའི་ལས་སྡེའི་རྒྱལ་ཡོངས་གཙོ་འཛིན་མི་མང་ཕན་བདེའི་ཚོགས་པ་ཨིན། ལག་བཟོའི་ཐོན་སྐྱེད་ དཔལ་འབྱོར་ རིག་གཞུང་ དང་མི་སྡེའི་ཕན་བདེ་ཡར་དྲག་གཏངམ་ཨིན།" />
            </p>
            <p className="section__lede">
              <LocalizedRecordField english="Every programme runs against one or more of the objects set out in Article 3.2 of the Articles of Association. Activity outside those objects is ultra vires and of no effect." dzongkha="ལས་རིམ་རེ་རེ་ཡང་ མཐུན་གྲོས་ཡིག་ཆའི་དོན་ཚན་ ༣.༢ ནང་བཀོད་པའི་དམིགས་དོན་གཅིག་གམ་དེ་ལས་ལྷག་སྟེ་འབདཝ་ཨིན། དམིགས་དོན་དེ་ཚུ་ལས་ཕྱི་ཁར་གྱི་ལས་སྣ་ཚུ་ལུ་ཁྲིམས་མཐུན་གནས་ཚད་མེད།" />
            </p>
          </div>
          <div className="panel panel--accent">
            <p className="eyebrow eyebrow--onaccent"><LocalizedRecordField english="Governing principles" dzongkha="འཛིན་སྐྱོང་གི་གཞི་རྩ" /></p>
            <p className="panel__body panel__body--onaccent" style={{ fontSize: '17px', fontWeight: 600 }}>
              <LocalizedRecordField english="Public Benefit · Integrity · Inclusivity · Cultural Stewardship · Compliance · Independence" dzongkha="མི་མང་ཕན་བདེ་ · དྲང་བདེན་ · ཚུད་སྒྲིག་ · རིག་གཞུང་སྲུང་སྐྱོབ་ · གནས་སྟངས་ལུ་གནས་པ་ · རང་དབང་" />
            </p>
            <p className="panel__body panel__body--onaccent" style={{ margin: 0, fontSize: '14.5px' }}>
              <LocalizedRecordField english="Constituted under the Civil Society Organizations Act of Bhutan 2007, as amended 2022. National scope across all twenty dzongkhags. Non-political by constitution." dzongkha="འབྲུག་གི་མི་སྡེའི་ཚོགས་པའི་བཅའ་ཁྲིམས་ ༢༠༠༧ དང་ ༢༠༢༢ ལོའི་བསྐྱར་བཅོས་འོག་ལུ་གཞི་བཙུགས་འབད་ཡོད། རྫོང་ཁག་ཉི་ཤུ་ཆ་མཉམ་ནང་ལས་སྣ་འཐབ་ཨིན། གཞི་རྩ་ལྟར་སྲིད་དོན་མེད་པའི་ཚོགས་པ་ཨིན།" />
            </p>
          </div>
        </div>
      </section>

      {/* 2. Programmes Grid */}
      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="What we run" dzongkha="ང་བཅས་ཀྱི་ལས་རིམ" /></p>
            <h2 className="display display--sub"><LocalizedRecordField english="Our Programmes" dzongkha="ང་བཅས་ཀྱི་ལས་རིམ་ཚུ" /></h2>
            <p className="section__lede">
              <LocalizedRecordField english="The objects are construed broadly: each is a standing programme area, not a fixed project." dzongkha="དམིགས་དོན་རེ་རེ་ཡང་ ལས་འགུལ་གཅིག་ཙམ་མེན་པར་ ཡུན་བརྟན་ལས་རིམ་ས་ཁོངས་སྦེ་རྒྱ་ཆེཝ་སྦེ་བརྩི་དགོ།" />
            </p>
          </div>
          <Link className="btn btn--ink btn--sm" href="/projects">
            <LocalizedRecordField english="See current projects →" dzongkha="ད་ལྟོའི་ལས་འགུལ་ཚུ་གཟིགས →" />
          </Link>
        </div>

        <div className="grid grid--3" id="programmeList">
          {programmes.map((p, idx) => (
            <article key={p.ref || idx} className="card programme">
              <figure className="frame frame--wide16">
                <img
                  src={(p as any).imageUrl || p.image_path || fallbackHeroPhoto(idx)}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/photos/hero-1-weaving.jpg'; }}
                />
              </figure>
              <div className="card__body">
                <div className="programme__head">
                  <span className="badge badge--ref">{String(p.ref || '').toUpperCase()}</span>
                  <h3 className="card__title clamp-2"><LocalizedRecordField english={p.title} dzongkha={p.titleDz} /></h3>
                </div>
                <p className="card__text programme__desc clamp-4"><LocalizedRecordField english={p.description} dzongkha={p.descriptionDz} /></p>
                <Link className="link-accent programme__toggle" href={`/programmes/${p.ref}`}>
                  <LocalizedRecordField english="Read more →" dzongkha="ལྷག་པར་གཟིགས →" />
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
            <h2 className="display display--panel"><LocalizedRecordField english="Access these programmes" dzongkha="ལས་རིམ་འདི་ཚུ་ལས་ཕན་ཐོགས་ལེན" /></h2>
            <p className="ctaband__body">
              <LocalizedRecordField english="Active Sector Members receive preferential access to training, trade fair participation and market linkage services. Affiliated Members receive general sector benefits." dzongkha="ལས་སྡེའི་འཐུས་མི་ཚུ་ལུ་ སྦྱོང་བརྡར་ ཚོང་འདུས་ནང་བཅའ་མར་ དང་ཚོང་ལམ་མཐུད་ལམ་གྱི་ཞབས་ཏོག་ཚུ་ནང་གཙོ་རིམ་ཐོབ། འབྲེལ་ཡོད་འཐུས་མི་ཚུ་ལུ་སྤྱིར་བཏང་ཁེ་ཕན་ཐོབ།" />
            </p>
          </div>
          <div className="actions">
            <Link className="btn btn--light" href="/membership/apply">
              <LocalizedRecordField english="Become a member" dzongkha="འཐུས་མི་འབད་འཛུལ" />
            </Link>
            <Link className="btn btn--ghost" href="/publications">
              <LocalizedRecordField english="Reports & downloads" dzongkha="སྙན་ཞུ་དང་ཕབ་ལེན" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. In-Place Live Section Editor */}
      <UniversalLiveSectionEditor
        isOpen={liveEditOpen}
        onClose={() => setLiveEditOpen(false)}
        sectionType="programmes"
        sectionTitle="Programmes & Strategic Pillars"
        studioHref="/admin/programmes"
        onSaved={() => {
          fetchProgrammes();
        }}
      />

    </main>
  );
}
