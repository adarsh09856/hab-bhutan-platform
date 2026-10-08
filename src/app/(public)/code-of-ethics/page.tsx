import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import LocalizedRecordField from '@/components/public/LocalizedRecordField';
import prisma from '@/lib/prisma';
import { ETHICS_STANDARDS } from '@/lib/governance-page-defaults';
import { ShieldCheck, HeartHandshake, Leaf, Scale, Users, AlertTriangle, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Code of Ethics & Fair Dealing Charter · Handicrafts Association of Bhutan',
  description: 'Ethical standards, artisan welfare commitments, anti-exploitation charters, and ecological harvesting principles enforced by the Handicrafts Association of Bhutan.',
};

export default async function CodeOfEthicsPage() {
  const saved = await prisma.governancePageCard.findMany({ where: { section: 'ethics' }, orderBy: { sortOrder: 'asc' } }).catch(() => []);
  const icons = [HeartHandshake, Scale, Award, Users, Leaf, ShieldCheck];
  const pillars = saved.length ? saved.filter((card) => card.isActive).map((card) => ({ title: card.title, titleDz: card.titleDz, body: card.body, bodyDz: card.bodyDz, icon: icons[Number(card.iconKey) % icons.length] || ShieldCheck })) : ETHICS_STANDARDS.map((card, index) => ({
    ...card,
    titleDz: [
      'དྲང་བདེན་གླ་ཆ་སྔ་སྤྲོད',
      'བར་མི་དང་བཙན་ཤེད་ཚོང་ལས་བཀག་སྡོམ',
      'དད་ཅན་རི་མོ་དང་རིག་གཞུང་གུས་ཞབས',
      'ཕོ་མོ་འདྲ་མཉམ་དང་གུས་ཞབས་ཅན་གྱི་ལས་སྟེགས',
      'ཁོར་ཡུག་གི་རྒྱུ་ཆ་ཡུན་བརྟན་སྤྱོད་ཐངས',
      'རྫུན་མ་ལུ་བཟོད་སྒོམ་མེད་པ',
    ][index],
    bodyDz: [
      'ཐིམ་ཕུག་ཡང་ན་ས་གནས་གླིང་ཚུ་ནང་ཐོན་སྐྱེད་སྤྲོད་པའི་སྐབས་ ལག་བཟོ་བ་ཚུ་ལུ་གྲོས་མཐུན་བྱུང་བའི་དྲང་བདེན་སྡེབ་ཚོང་རིན་དེ་འཕྲལ་ལས་སྤྲོདཔ་ཨིན། རིན་སྤྲོད་འདི་མཐའ་མའི་ཚོང་རིན་ལུ་བརྟེན་མི་ཆོག་པས།',
      'HAB གིས་ཐད་ཀར་ཐོན་སྐྱེད་ཁྱིམ་ཚང་དང་གླིང་ཚུ་དང་མཉམ་འབྲེལ་འབདཝ་ཨིན། བར་མིའི་གླ་ཆ་དང་ངོས་སྦྱོར་མེད་པའི་བརྒྱ་ཆའི་གླ་ཆ་ཚུ་ གློག་ཚོང་ཁང་ ས་གནས་ཚོང་ཁང་ ཞལ་འདེབས་གནས་སྐབས་ཚུ་ནང་གཏན་འབེབས་སྦེ་བཀག་ཡོད།',
      'ཟངས་སྐུ་ སྲོལ་རྒྱུན་ཤིང་གི་འབག་སྐུ་ དང་ཐང་ཀ་གནས་དགོངས་ཚུ་བཟོ་སྐབས་ རིག་གནས་ལས་ཁུངས་ཀྱི་ཚད་གཞི་དང་ནང་པའི་མཛེས་རིག་གི་ལམ་ལུགས་ཚུ་གུས་ཞབས་དང་བཅས་བརྩི་དགོ།',
      'HAB དང་འབྲེལ་བའི་ལས་སྡེ་ ༧༠% ལྷག་བུམོ་གིས་འགོ་ཁྲིད་འབདཝ་ཨིན། ང་བཅས་ཀྱིས་བརྙས་བཅོས་མེད་པ་ གླ་ཆ་འདྲ་མཉམ་ ཚོན་རྩི་དང་ལྕགས་བཟོ་ཁང་ནང་ཉེན་མེད་ཁ་རླུང་ དེ་ལས་བུ་གཞོན་ཉེན་མེད་ཁྱིམ་གྱི་ཁོར་ཡུག་བརྟན་བཟོཝ་ཨིན།',
      'ཤོག་གུ་བཟོ་བའི་དཔེར་ན་དབྱར་རྩིའི་པགས་ཀོ་ སྦ་རྩ་ དང་རྩི་ཤིང་ཚོན་རྩི་ཚུ་རྒྱལ་ཡོངས་མི་སྡེའི་ནགས་ཚལ་ལམ་སྟོན་ལྟར་ཡུན་བརྟན་ཐོག་ལས་བསྡུ་ལེན་འབད་དགོ།',
      'ཕྱི་ནས་འབད་བའི་འཕྲུལ་བཟོའི་ཅ་ཆས་ཡང་ན་འཕྲུལ་གྱིས་ཚེམ་པའི་གོས་རིགས་ཚུ་འབྲུག་གི་ལག་བཟོ་རྫུན་མ་སྦེ་མིང་བཏགས་བྱེད་མི་ཚུ་ལུ་ འཐུས་མིའི་ངོས་འཛིན་ཕྱིར་བསྡུ་དང་ཁྲིམས་མཐུན་ཞིབ་འཇུག་འབདཝ་ཨིན།',
    ][index],
    icon: icons[Number(card.iconKey)],
  }));
  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="ethics-hero">
        <SectionEditBadge label="Ethics page sections" studioHref="/admin/pages/sections?path=/code-of-ethics" />
        <p className="crumbs">
          <Link href="/"><LocalizedRecordField english="Home" dzongkha="གདོང་ཤོག" /></Link> / <Link href="/about"><LocalizedRecordField english="About Us" dzongkha="ང་བཅས་ཀྱི་སྐོར" /></Link> / <LocalizedRecordField english="Code of Ethics" dzongkha="བྱ་སྤྱོད་ཀྱི་ཚད་གཞི" />
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="Integrity & Artisan Welfare" dzongkha="དྲང་བདེན་དང་ལག་བཟོ་བའི་བདེ་སྐྱོང" /></p>
            <h1 className="display display--page"><LocalizedRecordField english="Code of Ethics" dzongkha="བྱ་སྤྱོད་ཀྱི་ཚད་གཞི" /></h1>
            <p className="lede">
              <LocalizedRecordField english="The ethical charter governing every member, enterprise, secretariat officer, and retail partnership of the Handicrafts Association of Bhutan. We protect traditional artisans from predatory commercialization and uphold the sanctity of living heritage." dzongkha="འབྲུག་གི་ལག་བཟོ་ཚོགས་པའི་འཐུས་མི་ ལས་སྡེ་ དྲུང་ཆེའི་ཡིག་ཚང་ལས་བྱེདཔ་ དང་ཚོང་ཁང་མཉམ་འབྲེལ་ཆ་མཉམ་ལུ་འཛིན་སྐྱོང་འབད་མི་བྱ་སྤྱོད་ཀྱི་རྩ་ཁྲིམས་ཨིན། ང་བཅས་ཀྱིས་སྲོལ་རྒྱུན་ལག་བཟོ་བ་ཚུ་ཚོང་ལས་བཙན་ཤེད་ལས་སྲུང་སྐྱོབ་འབད་དེ་ འཚོ་བཞིན་པའི་རིག་གཞུང་ཤུལ་བཞག་གི་དམ་པ་བརྩི་སྲུང་འབདཝ་ཨིན།" />
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Charter Standard" dzongkha="རྩ་ཁྲིམས་ཚད་གཞི" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="Fair Trade & CSO 2026" dzongkha="དྲང་བདེན་ཚོང་ལས་དང་ CSO ༢༠༢༦" /></span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Payment Policy" dzongkha="དངུལ་སྤྲོད་སྲིད་བྱུས" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="100% Upfront Fair Price" dzongkha="དྲང་བདེན་རིན་གོང་ ༡༠༠% སྔ་སྤྲོད" /></span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Women Leadership" dzongkha="བུམོའི་འགོ་ཁྲིད" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="70%+ Female Guilds" dzongkha="བུམོའི་ཚོགས་པ་ ༧༠% ལྷག" /></span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key"><LocalizedRecordField english="Origin Verification" dzongkha="འབྱུང་ཁུངས་བདེན་དཔྱད" /></span>
              <span className="craftfacts__val"><LocalizedRecordField english="Authentic Provenance" dzongkha="བདེན་པའི་འབྱུང་ཁུངས" /></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 6 Pillars Grid */}
      <section className="section relative" data-hab-section="ethics-pillars">
        <SectionEditBadge label="Ethical standards" studioHref="/admin/pages/governance-cards?section=ethics" sectionType="ethics-cards" />
        <div className="mb-8 pb-4 border-b border-stone-200">
          <p className="eyebrow eyebrow--brass"><LocalizedRecordField english="Ethical Standards" dzongkha="བྱ་སྤྱོད་ཚད་གཞི" /></p>
          <h2 className="display display--sub"><LocalizedRecordField english="Core Pillars of Fair Dealing" dzongkha="དྲང་བདེན་ཚོང་ལས་ཀྱི་ཀ་ཆེན་གཙོ་བོ" /></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <article 
                key={idx}
                className="bg-white border border-stone-200 rounded-3xl p-6 lg:p-8 shadow-xs hover:border-[#8B2E24]/30 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#8B2E24] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                    <LocalizedRecordField english={pillar.title} dzongkha={'titleDz' in pillar ? pillar.titleDz : undefined} />
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <LocalizedRecordField as="span" english={pillar.body} dzongkha={'bodyDz' in pillar ? pillar.bodyDz : undefined} />
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> <LocalizedRecordField english="Enforced Across All 20 Dzongkhags" dzongkha="རྫོང་ཁག་ ༢༠ ཆ་མཉམ་ནང་བསྟར་སྤྱོད" />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. Whistleblower & Grievance Band */}
      <section className="band" data-hab-section="ethics-whistleblower">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass"><LocalizedRecordField english="Oversight & Redress" dzongkha="ལྟ་རྟོག་དང་ཉེས་སེལ" /></p>
            <h2 className="display display--vm"><LocalizedRecordField english="Artisan Whistleblower Hotline" dzongkha="ལག་བཟོ་བའི་གསང་བའི་ཞུ་གཏུག་ཞབས་ཏོག" /></h2>
            <p className="band__body">
              <LocalizedRecordField english="Any artisan, cluster member, or wholesale patron who encounters deceptive practices, underpayment, unauthorized consignment deductions, or counterfeit merchandise can report directly to the Secretariat or Board of Trustees in complete confidentiality." dzongkha="མགོ་སྐོར་གྱི་ལག་ལེན་ གླ་ཆ་ཉུང་སྤྲོད་ གནང་བ་མེད་པའི་བཙུགས་བཞག་བཅག་ཆ་ ཡང་ན་རྫུན་མའི་ཅ་ཆས་མཐོང་མི་ལག་བཟོ་བ་ གླིང་གི་འཐུས་མི་ ཡང་ན་སྡེབ་ཚོང་ཉོ་མཁན་གང་རུང་གིས་ དྲུང་ཆེའི་ཡིག་ཚང་ཡང་ན་འཛིན་སྐྱོང་ལྷན་ཚོགས་ལུ་གསང་བ་ཆ་ཚང་ཐོག་ལས་ཞུ་གཏུག་འབད་ཆོག།" />
            </p>
          </div>
          <div className="vm__second space-y-3 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm"><LocalizedRecordField english="Confidential Ethics Desk" dzongkha="གསང་བའི་བྱ་སྤྱོད་ལས་ཁུངས" /></strong>
                <span className="font-mono text-xs">+975-2-338089 (<LocalizedRecordField english="Direct Hotline" dzongkha="ཐད་ཀར་ཞབས་ཏོག" />) · +975-77654508 (<LocalizedRecordField english="Executive Director" dzongkha="བསྟར་སྤྱོད་འགོ་འཛིན" />)</span>
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm"><LocalizedRecordField english="Direct Email Reporting" dzongkha="གློག་འཕྲིན་ཐད་ཀར་སྙན་ཞུ" /></strong>
                <span className="font-mono text-xs">officehab@gmail.com · <LocalizedRecordField english="Subject" dzongkha="དོན་ཚན" />: &quot;<LocalizedRecordField english="CONFIDENTIAL ETHICS REPORT" dzongkha="གསང་བའི་བྱ་སྤྱོད་སྙན་ཞུ" />&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Banner */}
      <section className="section section--last" data-hab-section="ethics-links">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--accent"><LocalizedRecordField english="Related Governance" dzongkha="འབྲེལ་ཡོད་འཛིན་སྐྱོང" /></p>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-1"><LocalizedRecordField english="Explore Mandate & Strategic Vision" dzongkha="ལས་འགན་དང་ཐབས་བྱུས་མཐོང་སྣང་གཟིགས" /></h3>
            <p className="text-xs text-stone-600 mt-1">
              <LocalizedRecordField english="Read our constitutional Articles of Association or review the 2025–2030 strategic development roadmap." dzongkha="ང་བཅས་ཀྱི་རྩ་ཁྲིམས་ཚོགས་པའི་དོན་ཚན་ལྷག་གནང་ ཡང་ན་ ༢༠༢༥–༢༠༣༠ གི་ཐབས་བྱུས་གོང་འཕེལ་ལམ་སྟོན་བསྐྱར་ཞིབ་གནང་།" />
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/mandate" 
              className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" /> <LocalizedRecordField english="Our Mandate & AoA" dzongkha="ང་བཅས་ཀྱི་ལས་འགན་དང་ AoA" />
            </Link>
            <Link 
              href="/strategic-plan" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              <LocalizedRecordField english="Strategic Plan" dzongkha="ཐབས་བྱུས་འཆར་གཞི" />
            </Link>
            <Link 
              href="/board-of-trustees" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              <LocalizedRecordField english="Board of Trustees" dzongkha="འཛིན་སྐྱོང་ལྷན་ཚོགས" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
