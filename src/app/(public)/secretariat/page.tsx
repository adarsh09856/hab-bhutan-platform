import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import { Mail, Phone, MapPin, Clock, ShieldCheck, Users, Briefcase, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Secretariat · Handicrafts Association of Bhutan',
  description: 'The Secretariat of the Handicrafts Association of Bhutan is the executive operational body based in Thimphu, managing artisan clusters, quality certification, and sector initiatives.',
};

const DEFAULT_TEAM = [
  {
    name: 'Chhimi Dorji',
    role: 'Executive Director',
    note: 'Sector Lead & CSO Administrator · edhab2021@gmail.com',
    phone: '+975-77654508',
    email: 'edhab2021@gmail.com',
    bio: 'Leads the operational execution of HAB strategic plans, donor partnership negotiations, national artisan guild representation, and institutional reporting to the Board and CSO Authority.',
  },
  {
    name: 'Sonam Choden',
    role: 'Finance & Procurement Officer',
    note: 'Chartered Accounting & Grant Compliance',
    phone: '+975-2-338089',
    email: 'finance@hab.org.bt',
    bio: 'Oversees statutory financial ledgers, procurement tenders, donor fund disbursements, and ensures transparent auditing compliance for all institutional accounts.',
  },
  {
    name: 'Tashi Wangmo',
    role: 'Quality & Craft Certification Lead',
    note: 'Seal of Authenticity & Provenance Verification',
    phone: '+975-2-338089',
    email: 'quality@hab.org.bt',
    bio: 'Manages standards inspection, master artisan qualification reviews, and coordinates the verification of materials across weaving, metal casting, and woodcarving sectors.',
  },
  {
    name: 'Ugyen Penjor',
    role: 'Artisan Cluster & Field Coordinator',
    note: '20 Dzongkhags Grassroots Liaison',
    phone: '+975-17462636',
    email: 'clusters@hab.org.bt',
    bio: 'Coordinates logistical support, field training workshops, and raw material distribution for over 7,500 rural artisans and micro-enterprises throughout Bhutan.',
  },
  {
    name: 'Pema Zangmo',
    role: 'Marketing, E-Commerce & Logistics Desk',
    note: 'Domestic Outlets & Worldwide EMS Dispatch',
    phone: '+975-17881111',
    email: 'marketing@hab.org.bt',
    bio: 'Supervises retail consignment, international order tracking, exhibition booth logistics, and wholesale trade buyer inquiries.',
  },
  {
    name: 'Dechen Wangchuk',
    role: 'Secretariat Administrator & Reception Desk',
    note: 'Public Inquiries & Member Registrations',
    phone: '+975-2-338089',
    email: 'officehab@gmail.com',
    bio: 'First point of contact for membership applications, visitor coordination, and official secretariat correspondence.',
  },
];

async function getSecretariatData() {
  try {
    const records = await prisma.governanceRecord.findMany({
      where: { category: 'SECRETARIAT' },
      orderBy: { sortOrder: 'asc' },
    });
    if (records.length > 0) {
      return records.map((r, i) => {
        const [cleanNote, photo] = (r.chapterOrNote || '').includes('||photo:')
          ? (r.chapterOrNote || '').split('||photo:')
          : [r.chapterOrNote || '', ''];
        return {
          name: r.individualName,
          role: r.roleTitle,
          note: cleanNote.trim(),
          photo: r.photoUrl || photo.trim() || `/assets/photos/hero-${(i % 5) + 1}-${i === 0 ? 'weaving' : i === 1 ? 'punakha' : i === 2 ? 'clay' : i === 3 ? 'textiles' : 'desho'}.jpg`,
          phone: r.phone || (i === 0 ? '+975-77654508' : '+975-2-338089'),
          email: r.email || (i === 0 ? 'edhab2021@gmail.com' : 'officehab@gmail.com'),
          bio: r.bio || 'Dedicated Secretariat professional serving Bhutanese artisans, clusters, and international patrons.',
        };
      });
    }
  } catch {
    // fallback
  }
  return DEFAULT_TEAM;
}

export default async function SecretariatPage() {
  const teamList = await getSecretariatData();

  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="secretariat-hero">
        <SectionEditBadge label="Secretariat records" studioHref="/admin/pages/about#team" sectionType="secretariat-records" />
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/about">About Us</Link> / The Secretariat
        </p>
        <div className="pagehero">
          <div>
            <p className="eyebrow eyebrow--accent">Executive Operations</p>
            <h1 className="display display--page">The Secretariat</h1>
            <p className="lede">
              The full-time operational team responsible for day-to-day coordination, artisan capacity development, 
              quality certification, donor program administration, and global craft advocacy from our Thimphu headquarters.
            </p>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Headquarters</span>
              <span className="craftfacts__val">Metog Lam, Thimphu</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Hotline Desk</span>
              <span className="craftfacts__val">+975-2-338089</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Operating Hours</span>
              <span className="craftfacts__val">Mon – Fri: 09:00 – 17:00</span>
            </div>
            <div className="craftfacts__cell">
              <span className="craftfacts__key">Artisans Served</span>
              <span className="craftfacts__val">7,500+ Rural Makers</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Team Directory Grid */}
      <section className="section" data-hab-section="secretariat-team">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-stone-200">
          <div>
            <p className="eyebrow eyebrow--brass">Staff &amp; Officers</p>
            <h2 className="display display--sub">Secretariat Personnel &amp; Portfolios</h2>
          </div>
          <p className="text-xs text-stone-500 max-w-md mt-2 md:mt-0">
            For general correspondence, write to <strong className="text-stone-800">officehab@gmail.com</strong> or contact specific portfolio leads below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamList.map((staff, idx) => (
            <article 
              key={idx} 
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:border-[#8B2E24]/30 hover:shadow-md transition-all flex flex-col"
            >
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                      <img
                        src={(staff as any).photo || `/assets/photos/hero-${(idx % 5) + 1}-${idx === 0 ? 'weaving' : idx === 1 ? 'punakha' : idx === 2 ? 'clay' : idx === 3 ? 'textiles' : 'desho'}.jpg`}
                        alt={staff.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="inline-block bg-[#8B2E24]/10 text-[#8B2E24] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {staff.role}
                      </span>
                      <h3 className="font-serif text-base font-bold text-stone-900 mt-0.5">{staff.name}</h3>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-stone-500 mb-2">{staff.note}</p>
                  <p className="text-xs text-stone-600 leading-relaxed">{staff.bio}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#8B2E24]" />
                    <span className="font-mono text-[11px]">{staff.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#8B2E24]" />
                    <span className="font-mono text-[11px]">{staff.email}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Secretariat Offices & Visitation */}
      <section className="band" data-hab-section="secretariat-visit">
        <div className="band__inner vm">
          <div>
            <p className="eyebrow eyebrow--brass">Headquarters</p>
            <h2 className="display display--vm">Thimphu Central Office</h2>
            <p className="band__body">
              The Secretariat maintains open office hours for artisan consultations, sample inspections, and donor delegations. 
              Drop in during regular hours or schedule an appointment with our executive desk.
            </p>
          </div>
          <div className="vm__second space-y-3 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Physical Address</strong>
                <span>Near National Institute for Zorig Chusum, Metog Lam, Kawajangsa, Thimphu, Kingdom of Bhutan</span>
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Office Hours</strong>
                <span>Monday – Friday: 9:00 AM – 5:00 PM (Bhutan Standard Time) · Closed on National Holidays</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Bar */}
      <section className="section section--last" data-hab-section="secretariat-links">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow--accent">Contact &amp; Governance</p>
            <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">Need Secretariat Assistance?</h3>
            <p className="text-xs text-stone-600 mt-1">
              Reach out for tender inquiries, artisan registrations, consignment requests, or media consultations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/contact" 
              className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> Contact Form
            </Link>
            <Link 
              href="/board-of-trustees" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Board of Trustees
            </Link>
            <Link 
              href="/tenders" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" /> Open Tenders
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
