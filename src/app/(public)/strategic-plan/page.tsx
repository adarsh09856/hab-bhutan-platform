import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import LocalizedRecordField from '@/components/public/LocalizedRecordField';
import prisma from '@/lib/prisma';
import { STRATEGIC_PILLARS } from '@/lib/governance-page-defaults';
import { Target, TrendingUp, Users, Sparkles, Download, ArrowRight, ShieldCheck, CheckCircle2, Leaf, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Strategic Plan 2025–2030 · Handicrafts Association of Bhutan',
  description: 'The Five-Year Strategic Development Framework of the Handicrafts Association of Bhutan, detailing national craft cluster economic development and heritage preservation.',
};

export default async function StrategicPlanPage() {
  const saved = await prisma.governancePageCard.findMany({ where: { section: 'strategic' }, orderBy: { sortOrder: 'asc' } }).catch(() => []);
  const pillars: Array<{ num: string; title: string; titleDz?: string | null; desc: string; descDz?: string | null; metric: string; metricDz?: string | null }> = saved.length
    ? saved.filter((card) => card.isActive).map((card) => ({ num: card.number || '', title: card.title, titleDz: card.titleDz, desc: card.body, descDz: card.bodyDz, metric: card.metric || '', metricDz: card.metricDz }))
    : STRATEGIC_PILLARS.map((item, index) => ({
        ...item,
        titleDz: [
          'ལག་བཟོའི་གླིང་གཞི་བཙུགས་དང་ཁྲོམ་ར་ལུ་འཛུལ་སྒོ',
          'ཉམས་འགྲོ་བའི་ཟོ་རིག་བཅུ་གསུམ་བརྒྱུད་སྤེལ',
          'རྒྱུ་ཆའི་རང་དབང་དང་ཁོར་ཡུག་གི་ཤིང་གསོ་ཁང',
          'ཌི་ཇི་ཊལ་འབྱུང་ཁུངས་དང་ཐད་ཀར་འཛམ་གླིང་ཕྱིར་ཚོང',
          'བུམོ་ལག་བཟོ་འགོ་ཁྲིད་དང་གླིང་གི་འཚོ་བ',
        ][index],
        descDz: [
          'གྲོང་གསེབ་ཀྱི་ཁྱིམ་ཚང་ཐོན་སྐྱེད་པ་ ༧,༥༠༠ ལྷག་ལུ་ རྫོང་ཁག་ ༢༠ ནང་ལུ་ངོས་སྦྱོར་ཡོད་པའི་གྲོང་གཡུས་མཉམ་འབྲེལ་ཚོགས་པ་བཟོ་ནི། གླིང་ཚུ་ལུ་མཉམ་སྤྱོད་ཐོན་སྐྱེད་ཁང་ རྒྱུ་ཆ་མཉམ་སྒྲིག་ཉོ་སྒྲུབ་ ས་གནས་ཚོང་ཁང་དང་རྒྱལ་སྤྱིའི་གློག་ཚོང་ཁང་ཐད་ཀར་མཐུད་ནི།',
          'ལག་བཟོ་བ་ཉུང་འགྱུར་འགྱོ་བའི་སྲོལ་རྒྱུན་སྒྱུ་རྩལ་ཚུ་ལུ་དམིགས་བསལ་ཐབས་ལམ་སྤྲོད་ནི། དཔེར་ན་ ལྕགས་བཟོ་ (མགར་བཟོ) ཟངས་སྐུ་བཟོ་ནི་ (ལུགས་བཟོ) དང་རྡོ་བརྐོ་ནི། འཚོ་བཞིན་པའི་མཁས་དབང་ལག་བཟོ་བའི་འོག་ལུ་ལོ་གཡོག་སློབ་སྦྱོང་གཏན་འཇགས་མ་དངུལ་བཙུགས་ནི།',
          'སྤུ་དང་རྫས་སྦྱོར་རྫས་རིགས་ཕྱི་ནང་ནས་ཉོ་དགོས་པ་ཉུང་ཕབ་ཀྱི་དོན་ལུ་ དབྱར་རྩི་དང་མཚལ་རྩ་ཚུ་སྡེ་ཚན་ཐོག་ལས་བཏབ་ནི། མཉམ་འབྲེལ་ཚོགས་པའི་ཚོན་བཙོ་ཁང་དང་ཡུན་བརྟན་ཤིང་བཏོན་ཆོག་ཡིག་གཞི་བཙུགས།',
          'ཌི་ཇི་ཊལ་འབྱུང་ཁུངས་ཐོ་དེབ་འདི་ QR བདེན་དཔྱད་ཐོག་ལས་ རྒྱལ་ཡོངས་ངོས་སྦྱོར་ཐམ་ཀ་དང་ལག་བཟོ་བའི་བཟོ་མི་ཤོག་བྱང་མཐུད་ནི། DHL དང་འབྲུག་གི་སྦྲགས་ཡིག EMS ཕྱིར་ཚོང་མཁོ་ཆས་ལམ་ཁ་རྒྱ་སྐྱེད་འབད་ནི།',
          'འཐག་ལས་ ཚེམ་དྲུབ་དང་སྦ་ཕྱགས་སྒྲིག་སྡེ་ཚན་ནང་གི་བུམོ་ལག་བཟོ་བ་ ༧༠% ལྷག་གི་དངུལ་འབྲེལ་རང་དབང་ཟབ་སྟེན་ནི། ཁྱིམ་ནང་ལས་ཐོན་སྐྱེད་ ལག་ཆས་མ་དངུལ་ཆུང་ཀུ་ དང་མཉམ་འབྲེལ་བུ་གཞོན་བདག་འཛིན་ཚོད་ལྟ་ཚུ་བརྒྱུད་དེ།',
        ][index],
        metricDz: [
          '༢༠༣༠ ལུ་ལག་བཟོ་བ་ ༡༠,༠༠༠ ལྷག',
          'གཞོནམ་སློབ་སྦྱོང་གླ་ཆ་ཅན་ ༡༥༠ ལྷག',
          'འབྲུག་གི་སྤྱིར་བཏང་ཚོན་རྩི་ངེས་གཏན',
          'ཉིནམ་ལཱ་འབད་ནི་ ༥–༧ ནང་འཛམ་གླིང་སྐྱེལ་འདྲེན',
          'ལོ་བསྟར་བུམོ་ལུ་ཐད་ཀར་དངུལ་སྤྲོད་ Nu. ༧༥ ས་ཡ་ལྷག',
        ][index],
      }));
  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="strategic-hero">
        <SectionEditBadge label="Strategic page sections" studioHref="/admin/pages/sections?path=/strategic-plan" />
        <p className="crumbs">
          <Link href="/"><LocalizedRecordField english="Home" dzongkha="གདོང་ཤོག" /></Link> / <Link href="/about"><LocalizedRecordField english="About Us" dzongkha="ང་བཅས་ཀྱི་སྐོར" /></Link> / <LocalizedRecordField english="Strategic Plan 2025–2030" dzongkha="ལོ་ལྔའི་འཆར་གཞི་ ༢༠༢༥–༢༠༣༠" />
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="Five-Year Development Framework" dzongkha="ལོ་ལྔའི་གོང་འཕེལ་གཞི་བཀོད" /></p>
            <h1 className="display display--page"><LocalizedRecordField english="Strategic Plan 2025–2030" dzongkha="ལོ་ལྔའི་འཆར་གཞི་ ༢༠༢༥–༢༠༣༠" /></h1>
            <p className="lede">
              <LocalizedRecordField english="Towards a vibrant, sustainable, and high-value handicrafts economy in the Kingdom of Bhutan. Our five-year roadmap unifies cultural heritage preservation, fair artisan remuneration, and modernized export infrastructure." dzongkha="འབྲུག་རྒྱལ་ཁབ་ནང་ལག་བཟོའི་དཔལ་འབྱོར་ཤུགས་ལྡན་ ཡུན་བརྟན་ རིན་ཐང་མཐོ་བ་བཟོ་ནི། ང་བཅས་ཀྱི་ལོ་ལྔའི་ལམ་སྟོན་འཆར་གཞི་འདི་གིས་ རིག་གཞུང་ཤུལ་བཞག་ཉར་ཚགས་ ལག་བཟོ་བའི་དྲང་བདེན་གླ་ཆ་ དེ་ལས་ཕྱིར་ཚོང་མཁོ་ཆས་དེང་སང་བཟོ་ནི་ཚུ་གཅིག་བསྡོམས་འབདཝ་ཨིན།" />
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Strategic Horizon" dzongkha="འཆར་གཞིའི་དུས་ཡུན" /></span>
              <span className="craftfacts__val">2025 – 2030</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Target Artisans" dzongkha="དམིགས་ཡུལ་ལག་བཟོ་བ" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="10,000+ Practitioners" dzongkha="ལག་ལེན་པ་ ༡༠,༠༠༠ ལྷག" /></span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Dzongkhags Covered" dzongkha="ཁྱབ་ཚད་རྫོང་ཁག" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="All 20 Districts" dzongkha="རྫོང་ཁག་ ༢༠ ཆ་མཉམ" /></span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Lead Alignment" dzongkha="ཁྲིམས་མཐུན་གཞི་བཀོད" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="CSO Authority of Bhutan" dzongkha="འབྲུག་གི་ CSO དབང་འཛིན" /></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 5 Strategic Pillars */}
      <section className="section relative" data-hab-section="strategic-pillars">
        <SectionEditBadge label="Strategic pillars" studioHref="/admin/pages/governance-cards?section=strategic" sectionType="strategic-cards" />
        <div className="mb-8 pb-4 border-b border-stone-200">
          <p className="eyebrow eyebrow--brass"><LocalizedRecordField english="Strategic Pillars" dzongkha="འཆར་གཞིའི་ཀ་ཆེན" /></p>
          <h2 className="display display--sub"><LocalizedRecordField english="Five Core Growth Interventions" dzongkha="གོང་འཕེལ་གྱི་གཙོ་བོའི་ཐབས་ལམ་ལྔ" /></h2>
        </div>

        <div className="space-y-6">
          {pillars.map((p, idx) => (
            <article 
              key={idx}
              className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 shadow-xs hover:border-[#8B2E24]/30 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-amber-50 text-[#8B2E24] text-xs font-bold font-mono flex items-center justify-center border border-amber-200">
                    {p.num}
                  </span>
                  <h3 className="font-serif text-lg lg:text-xl font-bold text-stone-900">
                    <LocalizedRecordField english={p.title} dzongkha={p.titleDz} />
                  </h3>
                </div>
                <p className="text-xs lg:text-sm text-stone-600 leading-relaxed pl-0 lg:pl-12">
                  <LocalizedRecordField as="span" english={p.desc} dzongkha={p.descDz} />
                </p>
              </div>

              <div className="flex-shrink-0 lg:text-right pl-0 lg:pl-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5"><LocalizedRecordField english="2030 Key Milestone" dzongkha="༢༠༣༠ གི་གལ་ཅན་གྱི་དམིགས་ཚད" /></span>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold font-mono">
                  <LocalizedRecordField as="span" english={p.metric} dzongkha={p.metricDz} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Measuring Impact & Annual Verification */}
      <section className="band" data-hab-section="strategic-monitoring">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass"><LocalizedRecordField english="Rigorous Monitoring" dzongkha="དམ་དམ་གྱི་ལྟ་རྟོག" /></p>
            <h2 className="display display--vm"><LocalizedRecordField english="Annual Progress Audits" dzongkha="ལོ་བསྟར་ཡར་རྒྱས་རྩིས་ཞིབ" /></h2>
            <p className="band__body">
              <LocalizedRecordField english="Every milestone in the 2025–2030 framework is subjected to independent annual monitoring. The Executive Director reports progress bi-annually to the Board of Trustees, and published outcomes are incorporated directly into our public Annual Reports." dzongkha="༢༠༢༥–༢༠༣༠ གི་གཞི་བཀོད་ནང་གི་དམིགས་ཚད་རེ་རེ་ལུ་ ལོ་བསྟར་རང་དབང་ལྟ་རྟོག་འབདཝ་ཨིན། བསྟར་སྤྱོད་འགོ་འཛིན་གྱིས་ལོ་ཕྱེད་བཞིན་དུ་འཛིན་སྐྱོང་ལྷན་ཚོགས་ལུ་ཡར་རྒྱས་སྙན་ཞུ་ཕུལཝ་དང་ དཔེ་སྐྲུན་འབད་བའི་གྲུབ་འབྲས་ཚུ་ལོ་བསྟར་སྙན་ཞུ་ནང་བཙུགསཔ་ཨིན།" />
            </p>
          </div>
          <div className="vm__second space-y-3 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <strong className="text-white block text-sm mb-1"><LocalizedRecordField english="Grassroots Verification Missions" dzongkha="གཞི་རིམ་བདེན་དཔྱད་ལས་འགུལ" /></strong>
              <LocalizedRecordField as="span" english="Bi-annual field visits conducted by Secretariat coordinators to inspect cluster workshops, tool maintenance, and artisan wage books across eastern and southern Bhutan." dzongkha="དྲུང་ཆེའི་ཡིག་ཚང་གི་འགོ་འཁྲིད་པ་ཚུ་གིས་ ཤར་དང་ལྷོ་འབྲུག་གི་ལག་བཟོའི་གླིང་དང་ ལག་ཆས་ཉམས་བཅོས་ ལག་བཟོ་བའི་གླ་ཆའི་ཐོ་དེབ་བརྟག་ཞིབ་འབད་ནིའི་དོན་ལུ་ ལོ་ཕྱེད་བཞིན་དུ་ས་ཁོངས་ལྟ་སྐོར་འབདཝ་ཨིན།" />
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <strong className="text-white block text-sm mb-1"><LocalizedRecordField english="Donor Co-Financing Audits" dzongkha="ཞལ་འདེབས་མཉམ་དངུལ་རྩིས་ཞིབ" /></strong>
              <LocalizedRecordField as="span" english="Program budgets funded by international development partners undergo separate international standard audit inspections to verify capital disbursement fidelity." dzongkha="རྒྱལ་སྤྱིའི་གོང་འཕེལ་མཉམ་འབྲེལ་པ་ཚུ་གིས་དངུལ་འབད་བའི་ལས་རིམ་གྱི་ཟད་འགྲོ་ཚུ་ མ་རྩ་བགོ་བཀྲམ་བདེན་དཔྱད་ཀྱི་དོན་ལུ་ རྒྱལ་སྤྱིའི་ཚད་གཞིའི་རྩིས་ཞིབ་སོ་སོ་འབདཝ་ཨིན།" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Banner */}
      <section className="section section--last" data-hab-section="strategic-links">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="Related Governance" dzongkha="འབྲེལ་ཡོད་འཛིན་སྐྱོང" /></p>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-1"><LocalizedRecordField english="Explore Annual Reports & Mandate" dzongkha="ལོ་བསྟར་སྙན་ཞུ་དང་ལས་འགན་གཟིགས" /></h3>
            <p className="text-xs text-stone-600 mt-1">
              <LocalizedRecordField english="Read how previous five-year targets were met in our published Annual Reports or review our statutory AoA." dzongkha="ཧེ་མའི་ལོ་ལྔའི་དམིགས་ཚད་ཚུ་ག་དེ་སྦེ་གྲུབ་ཡོདཔ་ཨིན་ན་ ལོ་བསྟར་སྙན་ཞུ་ནང་ལྷག་གནང་ ཡང་ན་ང་བཅས་ཀྱི་ཁྲིམས་མཐུན་ AoA བསྐྱར་ཞིབ་གནང་།" />
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/annual-reports" 
              className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
            >
              <LocalizedRecordField english="Annual Reports" dzongkha="ལོ་བསྟར་སྙན་ཞུ" />
            </Link>
            <Link 
              href="/mandate" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              <LocalizedRecordField english="Our Mandate & AoA" dzongkha="ང་བཅས་ཀྱི་ལས་འགན་དང་ AoA" />
            </Link>
            <Link 
              href="/code-of-ethics" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              <LocalizedRecordField english="Code of Ethics" dzongkha="བྱ་སྤྱོད་ཀྱི་ཚད་གཞི" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
