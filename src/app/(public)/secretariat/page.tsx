import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import SecretariatCopy from '@/components/public/SecretariatCopy';
import { isConfirmedPublicPersonName } from '@/lib/public-person-name';
import { Mail, Phone, MapPin, Clock, ShieldCheck, Users, Briefcase, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Secretariat · Handicrafts Association of Bhutan',
  description: 'The Secretariat of the Handicrafts Association of Bhutan is the executive operational body based in Thimphu, managing artisan clusters, quality certification, and sector initiatives.',
};

async function getSecretariatData() {
  try {
    const records = await prisma.governanceRecord.findMany({
      where: { category: 'SECRETARIAT' },
      orderBy: { sortOrder: 'asc' },
    });
    return records.map((r) => {
        const confirmed = isConfirmedPublicPersonName(r.individualName);
        const [cleanNote, photo] = (r.chapterOrNote || '').includes('||photo:')
          ? (r.chapterOrNote || '').split('||photo:')
          : [r.chapterOrNote || '', ''];
        const note = cleanNote.trim();
        const publicNote = confirmed
          ? note
          : note
              .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '')
              .replace(/\b(?:\+?\s*975[\s-]?)?[17]\d{7}\b/g, '')
              .replace(/\s*[+·,;|]\s*/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
        return {
          name: confirmed ? r.individualName : 'Name to be confirmed',
          confirmed,
          role: r.roleTitle,
          note: publicNote,
          photo: confirmed ? r.photoUrl || photo.trim() || '' : '',
          phone: confirmed ? r.phone || '' : '',
          email: confirmed ? r.email || '' : '',
          bio: confirmed ? r.bio || '' : '',
        };
      });
  } catch {
    // Keep the public page neutral when current, verified records cannot be read.
  }
  return [];
}

export default async function SecretariatPage() {
  const teamList = await getSecretariatData();

  return (
    <main id="main">
      {/* 1. Page Hero */}
      <section className="section relative" data-hab-section="secretariat-hero">
        <SectionEditBadge label="Secretariat records" studioHref="/admin/pages/about#team" sectionType="secretariat-records" />
        <p className="crumbs">
          <Link href="/"><SecretariatCopy>Home</SecretariatCopy></Link> / <Link href="/about"><SecretariatCopy>About Us</SecretariatCopy></Link> / <SecretariatCopy>The Secretariat</SecretariatCopy>
        </p>
        <div className="pagehero">
          <div>
            <SecretariatCopy as="p" className="eyebrow eyebrow--accent">Executive Operations</SecretariatCopy>
            <SecretariatCopy as="h1" className="display display--page">The Secretariat</SecretariatCopy>
            <SecretariatCopy as="p" className="lede">The full-time operational team responsible for day-to-day coordination, artisan capacity development, quality certification, donor program administration, and global craft advocacy from our Thimphu headquarters.</SecretariatCopy>
          </div>
          <div className="craftfacts craftfacts--2">
            <div className="craftfacts__cell">
              <SecretariatCopy as="span" className="craftfacts__key">Headquarters</SecretariatCopy>
              <SecretariatCopy as="span" className="craftfacts__val">Metog Lam, Thimphu</SecretariatCopy>
            </div>
            <div className="craftfacts__cell">
              <SecretariatCopy as="span" className="craftfacts__key">Hotline Desk</SecretariatCopy>
              <span className="craftfacts__val">+975-2-338089</span>
            </div>
            <div className="craftfacts__cell">
              <SecretariatCopy as="span" className="craftfacts__key">Operating Hours</SecretariatCopy>
              <SecretariatCopy as="span" className="craftfacts__val">Mon – Fri: 09:00 – 17:00</SecretariatCopy>
            </div>
            <div className="craftfacts__cell">
              <SecretariatCopy as="span" className="craftfacts__key">Artisans Served</SecretariatCopy>
              <SecretariatCopy as="span" className="craftfacts__val">7,500+ Rural Makers</SecretariatCopy>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Team Directory Grid */}
      <section className="section" data-hab-section="secretariat-team">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-stone-200">
          <div>
            <SecretariatCopy as="p" className="eyebrow eyebrow--brass">Staff & Officers</SecretariatCopy>
            <SecretariatCopy as="h2" className="display display--sub">Secretariat Personnel & Portfolios</SecretariatCopy>
          </div>
          <p className="text-xs text-stone-500 max-w-md mt-2 md:mt-0">
            <SecretariatCopy>For general correspondence, write to</SecretariatCopy> <strong className="text-stone-800">officehab@gmail.com</strong> <SecretariatCopy>or contact specific portfolio leads below.</SecretariatCopy>
          </p>
        </div>

        {teamList.length > 0 ? (
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
                      {(staff as any).photo ? <img src={(staff as any).photo} alt={staff.name} className="w-full h-full object-cover" /> : (
                        <span
                          className="w-full h-full flex items-center justify-center text-sm font-semibold text-stone-500"
                          role="img"
                            aria-label={staff.confirmed ? 'Portrait not supplied' : 'Staff name to be confirmed'}
                        >
                        {staff.confirmed ? staff.name.split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase() : '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="inline-block bg-[#8B2E24]/10 text-[#8B2E24] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        <SecretariatCopy>{staff.role}</SecretariatCopy>
                      </span>
                      <SecretariatCopy as="h3" className="font-serif text-base font-bold text-stone-900 mt-0.5">{staff.name}</SecretariatCopy>
                    </div>
                  </div>

                  <SecretariatCopy as="p" className="text-xs font-medium text-stone-500 mb-2">{staff.note}</SecretariatCopy>
                  {staff.bio && <p className="text-xs text-stone-600 leading-relaxed">{staff.bio}</p>}
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                  {staff.phone && <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#8B2E24]" />
                    <span className="font-mono text-[11px]">{staff.phone}</span>
                  </div>}
                  {staff.email && <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#8B2E24]" />
                    <span className="font-mono text-[11px]">{staff.email}</span>
                  </div>}
                </div>
              </div>
            </article>
          ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 text-sm leading-relaxed text-stone-600" role="status">
            <SecretariatCopy as="p" className="font-semibold text-stone-800">Staff names and portraits will be published after they are confirmed by the Secretariat.</SecretariatCopy>
            <p className="mt-2"><SecretariatCopy>For assistance, contact</SecretariatCopy> <a className="text-[#8B2E24] underline" href="mailto:officehab@gmail.com">officehab@gmail.com</a> <SecretariatCopy>or call</SecretariatCopy> <a className="text-[#8B2E24] underline" href="tel:+9752338089">+975-2-338089</a>.</p>
          </div>
        )}
      </section>

      {/* 3. Secretariat Offices & Visitation */}
      <section className="band" data-hab-section="secretariat-visit">
        <div className="band__inner vm">
          <div>
            <SecretariatCopy as="p" className="eyebrow eyebrow--brass">Headquarters</SecretariatCopy>
            <SecretariatCopy as="h2" className="display display--vm">Thimphu Central Office</SecretariatCopy>
            <SecretariatCopy as="p" className="band__body">The Secretariat maintains open office hours for artisan consultations, sample inspections, and donor delegations. Drop in during regular hours or schedule an appointment with our executive desk.</SecretariatCopy>
          </div>
          <div className="vm__second space-y-3 text-xs text-stone-300">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <SecretariatCopy as="strong" className="text-white block text-sm">Physical Address</SecretariatCopy>
                <SecretariatCopy>Near National Institute for Zorig Chusum, Metog Lam, Kawajangsa, Thimphu, Kingdom of Bhutan</SecretariatCopy>
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <SecretariatCopy as="strong" className="text-white block text-sm">Office Hours</SecretariatCopy>
                <SecretariatCopy>Monday – Friday: 9:00 AM – 5:00 PM (Bhutan Standard Time) · Closed on National Holidays</SecretariatCopy>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Bar */}
      <section className="section section--last" data-hab-section="secretariat-links">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <SecretariatCopy as="p" className="eyebrow eyebrow--accent">Contact & Governance</SecretariatCopy>
            <SecretariatCopy as="h3" className="font-serif text-xl font-bold text-stone-900 mt-1">Need Secretariat Assistance?</SecretariatCopy>
            <SecretariatCopy as="p" className="text-xs text-stone-600 mt-1">Reach out for tender inquiries, artisan registrations, consignment requests, or media consultations.</SecretariatCopy>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/contact" 
              className="px-4 py-2.5 bg-[#8B2E24] text-white rounded-xl text-xs font-semibold hover:bg-[#72251D] transition-colors inline-flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> <SecretariatCopy>Contact Form</SecretariatCopy>
            </Link>
            <Link 
              href="/board-of-trustees" 
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> <SecretariatCopy>Board of Trustees</SecretariatCopy>
            </Link>
            <Link 
              href="/tenders" 
              className="px-4 py-2.5 bg-white border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" /> <SecretariatCopy>Open Tenders</SecretariatCopy>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
