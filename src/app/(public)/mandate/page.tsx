import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import LocalizedRecordField from '@/components/public/LocalizedRecordField';
import prisma from '@/lib/prisma';
import { MANDATE_ARTICLES } from '@/lib/governance-page-defaults';
import { ShieldCheck, BookOpen, Scale, Award, Users, Download, ArrowRight, CheckCircle2, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Our Mandate & Articles of Association · Handicrafts Association of Bhutan',
  description: 'Official statutory mandate and Articles of Association (AoA) governing the Handicrafts Association of Bhutan under the CSO Act of Bhutan 2007 (CSO/2011/043).',
};

export default async function MandatePage() {
  const saved = await prisma.governancePageCard.findMany({ where: { section: 'mandate' }, orderBy: { sortOrder: 'asc' } }).catch(() => []);
  const articles: Array<{ num: string; title: string; titleDz?: string | null; body: string; bodyDz?: string | null; tags: string[]; tagsDz: string[] }> = saved.length
    ? saved.filter((card) => card.isActive).map((card) => ({ num: card.number || '', title: card.title, titleDz: card.titleDz, body: card.body, bodyDz: card.bodyDz, tags: (card.tags || '').split('\n').filter(Boolean), tagsDz: (card.tagsDz || '').split('\n').filter(Boolean) }))
    : MANDATE_ARTICLES.map((item, index) => ({
        ...item,
        titleDz: [
          'རང་དབང་རིག་གཞུང་ཤུལ་བཞག་དང་ཟོ་རིག་བཅུ་གསུམ་གྱི་བདག་སྐྱོང',
          'ལག་བཟོ་བའི་དཔལ་འབྱོར་ཉེན་སྐྱོབ་དང་བར་མི་སེལ་བ',
          'རྒྱལ་ཡོངས་སྤུས་ཚད་ཚད་གཞི་དང་རྒྱལ་ཐམ་འབྱུང་ཁུངས',
          'དངུལ་འབྲེལ་འགན་འཁྲི་དང་མི་མང་ལུ་དངུལ་གྱི་གསལ་སྟོན',
          'རྫོང་ཁག་ ༢༠ ནང་རྒྱལ་ཡོངས་གླིང་གི་ངོ་ཚབ',
        ][index],
        bodyDz: [
          'ཚོགས་པ་འདི་འབྲུག་རྒྱལ་ཁབ་ཀྱི་སྲོལ་རྒྱུན་ཟོ་རིག་བཅུ་གསུམ་ཉར་ཚགས་ བརྒྱུད་སྤེལ་ སྤེལ་བའི་འགན་འཁུར་ཡོད་པའི་མཐོ་ཤོས་ཀྱི་མི་སྡེ་ཚོགས་པ་སྦེ་བཙུགས་ཡོད། སྔར་སྲོལ་ལག་རྩལ་ཚུ་དཔེ་མཛོད་ནང་གི་རྙིང་རྫས་མིན་པར་ ད་ལྟོའི་འཚོ་བའི་དཔལ་འབྱོར་གྱི་ལས་སྒོ་ཤུགས་ཅན་སྦེ་གནས་ཐབས་བྱེད་དགོ།',
          'HAB གིས་གྲོང་གསེབ་བཟོ་མི་ཚུ་ལུ་དྲང་བདེན་གྱི་སྔ་སྤྲོད་ཉོ་རིན་འགན་ལེན་འབད་དེ་ མི་དྲང་བའི་ཚོང་ལས་བར་མི་ཚུ་སེལ་ནིའི་ཁྲིམས་མཐུན་ལས་འགན་ཡོད། ཁེ་སང་མེད་པའི་གནས་སྐབས་བཙུགས་བཞག་དང་ཐད་ཀར་ཁྲོམ་རའི་མཁོ་ཆས་བརྒྱུད་དེ་ འབབ་ཁུངས་བརྒྱ་ཆ་ ༨༤ ལྷག་ཐད་ཀར་ལག་བཟོ་བ་ཚུ་ལུ་འགྱོཝ་ཨིན།',
          'འབྲུག་གི་ལག་བཟོ་རྣམས་ལུ་ངོས་སྦྱོར་ཐམ་ཀ་དང་དྲང་བདེན་གྱི་འབྱུང་ཁུངས་རྗེས་འདེད་སྲུང་སྐྱོབ་བྱེད་ནིའི་དོན་ལུ་ ཚོགས་པ་ལུ་བརྟག་ཞིབ་ ངོས་སྦྱོར་ ལག་ཁྱེར་སྤྲོད་ནིའི་དབང་ཚད་ཡོད། འབྲུག་མིང་འོག་ལུ་བཙོང་བའི་འབྲུག་མིན་པའི་འཕྲུལ་བཟོའི་ཚད་ལས་མང་བའི་རྫུན་མ་ཚུ་ལས་ས་གནས་བཟོ་མི་སྲུང་དགོ།',
          'འབྲུག་གི་ CSO བཅའ་ཁྲིམས་ ༢༠༠༧ གྱི་དོན་ཚན་ ༣༡ འོག་ HAB གིས་རང་དབང་རྩིས་ཞིབ་པ་ཚུ་གིས་ལོ་བསྟར་ངོས་ལེན་འབད་བའི་རྩིས་ཁྲ་རྣམས་ཉར་དགོ། མ་རྩའི་ཁེ་སང་གི་ཆ་ཤས་གང་རུང་སྒེར་གྱི་བདག་པོ་ཡང་ན་འཐུས་མི་ལུ་བགོ་མི་ཆོག།',
          'ཚོགས་པ་གིས་འབྲུག་གི་རྫོང་ཁག་ཉི་ཤུ་ཆ་མཉམ་ལས་ལག་བཟོ་བའི་དམངས་གཙོའི་ངོ་ཚབ་ཉར་ཚགས་འབད་དགོ། རང་སྐྱོང་གྲོང་གཡུས་ལག་བཟོའི་གླིང་ བུམོ་གིས་འགོ་ཁྲིད་པའི་འཐག་ལས་ཚོགས་པ་ དང་གཞོནམ་སློབ་སྦྱོང་ཚུ་ལུ་ལག་ཆས་དང་མཉམ་འབྲེལ་ཐོབ་ཐང་དྲང་མཉམ་སྤྲོད་དགོ།',
        ][index],
        tagsDz: [
          ['རིག་གཞུང་རྒྱུན་འཛིན', 'ཟོ་རིག་བཅུ་གསུམ', 'རྒྱལ་ཡོངས་ཤུལ་བཞག'],
          ['དྲང་བདེན་ཚོང་ལས', 'ལག་བཟོ་བ་ ༧,༥༠༠ ལྷག', 'སྔ་སྤྲོད'],
          ['འབྱུང་ཁུངས་ངོས་སྦྱོར', 'རྫུན་མ་འགོག་ཐབས', 'འབྱུང་ཁུངས་རྗེས་འདེད'],
          ['CSO/2011/043', 'རང་དབང་རྩིས་ཞིབ', 'མི་མང་རྩིས་ཁྲ'],
          ['རྫོང་ཁག་ ༢༠', 'བུམོ་གིས་འགོ་ཁྲིད་ ༧༠%', 'གྲོང་གཡུས་གླིང'],
        ][index],
      }));
  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="mandate-hero">
        <SectionEditBadge label="Mandate page sections" studioHref="/admin/pages/sections?path=/mandate" />
        <p className="crumbs">
          <Link href="/"><LocalizedRecordField english="Home" dzongkha="གདོང་ཤོག" /></Link> / <Link href="/about"><LocalizedRecordField english="About Us" dzongkha="ང་བཅས་ཀྱི་སྐོར" /></Link> / <LocalizedRecordField english="Our Mandate & AoA" dzongkha="ང་བཅས་ཀྱི་ལས་འགན་དང་ AoA" />
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="Statutory Constitution" dzongkha="ཁྲིམས་མཐུན་རྩ་ཁྲིམས" /></p>
            <h1 className="display display--page"><LocalizedRecordField english="Our Mandate & AoA" dzongkha="ང་བཅས་ཀྱི་ལས་འགན་དང་ AoA" /></h1>
            <p className="lede">
              <LocalizedRecordField english="The Handicrafts Association of Bhutan was established in 2005 and formally registered under the Civil Society Organizations Act of Bhutan 2007 as CSO/2011/043. Our Articles of Association establish the legal mandate protecting thousands of traditional craft practitioners across the Kingdom." dzongkha="འབྲུག་གི་ལག་བཟོ་ཚོགས་པ་ ༢༠༠༥ ལུ་གཞི་བཙུགས་འབད་དེ་ འབྲུག་གི་མི་སྡེ་ཚོགས་པའི་བཅའ་ཁྲིམས་ ༢༠༠༧ འོག་ CSO/2011/043 སྦེ་ཐོ་བཀོད་འབད་ཡོད། ང་བཅས་ཀྱི་ཚོགས་པའི་རྩ་ཁྲིམས་ཀྱིས་ རྒྱལ་ཁབ་ཡོངས་ཀྱི་སྲོལ་རྒྱུན་ལག་བཟོ་ལག་ལེན་པ་སྟོང་ཕྲག་ལེ་ཤ་སྲུང་སྐྱོབ་འབད་ནིའི་ཁྲིམས་མཐུན་ལས་འགན་གཞི་བཙུགས་འབདཝ་ཨིན།" />
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Registration No." dzongkha="ཐོ་བཀོད་ཨང་" /></span>
              <span className="craftfacts__val">CSO/2011/043</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Governing Statute" dzongkha="གཞི་འཛིན་བཅའ་ཁྲིམས" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="CSO Act of Bhutan 2007" dzongkha="འབྲུག་གི་ CSO བཅའ་ཁྲིམས་ ༢༠༠༧" /></span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Legal Classification" dzongkha="ཁྲིམས་མཐུན་དབྱེ་ཁག" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="Apex Public Benefit CSO" dzongkha="མི་མང་ཁེ་ཕན་གྱི་མཐོ་ཤོས་ CSO" /></span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Charter Review" dzongkha="རྩ་ཁྲིམས་བསྐྱར་ཞིབ" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="AoA Statutory 2026" dzongkha="ཁྲིམས་མཐུན་ AoA ༢༠༢༦" /></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statutory Legal Foundation */}
      <section className="section relative" data-hab-section="mandate-statute">
        <SectionEditBadge label="Mandate articles" studioHref="/admin/pages/governance-cards?section=mandate" sectionType="mandate-cards" />
        <div className="mb-8 pb-4 border-b border-stone-200">
          <p className="eyebrow eyebrow--brass"><LocalizedRecordField english="Legal Foundations" dzongkha="ཁྲིམས་མཐུན་གཞི་རྟེན" /></p>
          <h2 className="display display--sub"><LocalizedRecordField english="Constitutional Articles of Association" dzongkha="ཚོགས་པའི་རྩ་ཁྲིམས་དོན་ཚན" /></h2>
        </div>

        <div className="space-y-6">
          {articles.map((art, idx) => (
            <article 
              key={idx}
              className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 shadow-xs hover:border-[#8B2E24]/30 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-amber-50 text-[#8B2E24] text-xs font-bold rounded-full font-mono border border-amber-200">
                    {art.num}
                  </span>
                  <h3 className="font-serif text-lg lg:text-xl font-bold text-stone-900">
                    <LocalizedRecordField english={art.title} dzongkha={art.titleDz} />
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {art.tags.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-medium">
                      <LocalizedRecordField english={t} dzongkha={art.tagsDz[i]} />
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs lg:text-sm text-stone-600 leading-relaxed pl-0 md:pl-1 mt-2">
                <LocalizedRecordField as="span" english={art.body} dzongkha={art.bodyDz} />
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Democratic Governance Structure */}
      <section className="band" data-hab-section="mandate-structure">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass"><LocalizedRecordField english="Institutional Authority" dzongkha="ཚོགས་པའི་དབང་ཚད" /></p>
            <h2 className="display display--vm"><LocalizedRecordField english="Apex Oversight & Accountability" dzongkha="མཐོ་ཤོས་ལྟ་རྟོག་དང་འགན་འཁྲི" /></h2>
            <p className="band__body">
              <LocalizedRecordField english="HAB is governed under a bicameral structure: a non-executive Board of Trustees that provides strategic and fiduciary oversight, and a full-time professional Secretariat based in Thimphu that executes daily operations, certifications, and international logistics." dzongkha="HAB འདི་ལུ་གཞི་བཀོད་གཉིས་ཡོདཔ་ཨིན། ཐབས་བྱུས་དང་དངུལ་འབྲེལ་ལྟ་རྟོག་འབད་མི་ བསྟར་སྤྱོད་མིན་པའི་འཛིན་སྐྱོང་ལྷན་ཚོགས་དང་ ཐིམ་ཕུག་ལུ་གཞི་བཙུགས་ཡོད་པའི་ཆུ་ཚོད་ཧྲིལ་བུའི་དྲུང་ཆེའི་ཡིག་ཚང་ཨིན། དྲུང་ཆེའི་ཡིག་ཚང་གིས་ཉིན་བསྟར་ལག་ལེན་ ངོས་སྦྱོར་ རྒྱལ་སྤྱིའི་མཁོ་ཆས་ཚུ་བསྟར་སྤྱོད་འབདཝ་ཨིན།" />
            </p>
          </div>
          <div className="vm__second space-y-3 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <strong className="text-white block text-sm mb-1"><LocalizedRecordField english="General Assembly of Members" dzongkha="འཐུས་མི་ཡོངས་འཛོམས་ཚོགས་འདུ" /></strong>
              <LocalizedRecordField as="span" english="Bi-annual convention where accredited craft guild delegates from all 20 Dzongkhags elect representatives and vote on sector policy priorities." dzongkha="ལོ་ཕྱེད་བཞིན་དུ་འཚོགས་པའི་ཚོགས་འདུ་འདི་ནང་ རྫོང་ཁག་ ༢༠ ཆ་མཉམ་ལས་ངོས་སྦྱོར་ཐོབ་པའི་ལག་བཟོའི་སྡེ་ཚན་ངོ་ཚབ་ཚུ་གིས་ངོ་ཚབ་འདེམས་ནི་དང་ སྡེ་ཚན་སྲིད་བྱུས་གཙོ་རིམ་ལུ་བསམ་འཆར་བཀོདཔ་ཨིན།" />
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <strong className="text-white block text-sm mb-1"><LocalizedRecordField english="CSO Authority Regulatory Filings" dzongkha="CSO དབང་འཛིན་ལུ་ཁྲིམས་མཐུན་སྙན་ཞུ" /></strong>
              <LocalizedRecordField as="span" english="Complete annual statutory submissions including audited accounts, programmatic impact KPIs, and executive director reviews submitted without exception." dzongkha="རྩིས་ཞིབ་སྙན་ཞུ་ ལས་རིམ་གྱི་གནོད་སྐྱོན་འཇལ་ཚད་ KPI དང་བསྟར་སྤྱོད་འགོ་འཛིན་གྱི་བསྐྱར་ཞིབ་ཚུ་བརྩིས་པའི་ལོ་བསྟར་ཁྲིམས་མཐུན་སྙན་ཞུ་ཆ་ཚང་ཕུལཝ་ཨིན།" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Banner */}
      <section className="section section--last" data-hab-section="mandate-links">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="Related Governance Documents" dzongkha="འབྲེལ་ཡོད་འཛིན་སྐྱོང་ཡིག་ཆ" /></p>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-1"><LocalizedRecordField english="Explore Code of Ethics & Strategic Roadmap" dzongkha="བྱ་སྤྱོད་ཀྱི་ཚད་གཞི་དང་ཐབས་བྱུས་ལམ་སྟོན་གཟིགས" /></h3>
            <p className="text-xs text-stone-600 mt-1">
              <LocalizedRecordField english="Read our operational ethics standards, five-year strategic plan, or meet the governing Board of Trustees." dzongkha="ང་བཅས་ཀྱི་ལག་ལེན་བྱ་སྤྱོད་ཚད་གཞི་ ལོ་ལྔའི་ཐབས་བྱུས་འཆར་གཞི་ལྷག་གནང་ ཡང་ན་འཛིན་སྐྱོང་ལྷན་ཚོགས་དང་མཇལ་གནང་།" />
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/code-of-ethics" 
              className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" /> <LocalizedRecordField english="Code of Ethics" dzongkha="བྱ་སྤྱོད་ཀྱི་ཚད་གཞི" />
            </Link>
            <Link 
              href="/strategic-plan" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" /> <LocalizedRecordField english="Strategic Plan" dzongkha="ཐབས་བྱུས་འཆར་གཞི" />
            </Link>
            <Link 
              href="/board-of-trustees" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> <LocalizedRecordField english="Board of Trustees" dzongkha="འཛིན་སྐྱོང་ལྷན་ཚོགས" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
