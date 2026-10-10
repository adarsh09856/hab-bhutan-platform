import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';
import DocumentEmbedViewer from '@/components/public/DocumentEmbedViewer';
import LocalizedRecordField from '@/components/public/LocalizedRecordField';
import { eventImage } from '@/lib/event-illustrations';

export const dynamic = 'force-dynamic';

interface EventPageProps {
  params: Promise<{ key: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { key } = await params;
  let event: any = null;
  try {
    event = await prisma.eventRecord.findFirst({ where: { key, isActive: true } });
  } catch {}
  if (!event) return { title: 'Event Not Found' };

  return {
    title: `${event.title} · Events · HAB`,
    description: event.description || event.summary,
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { key } = await params;
  let dbEvent: any = null;
  let dbOtherEvents: any[] = [];
  try {
    [dbEvent, dbOtherEvents] = await Promise.all([
      prisma.eventRecord.findFirst({ where: { key, isActive: true } }),
      prisma.eventRecord.findMany({
        where: { isActive: true, key: { not: key } },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take: 3,
      }),
    ]);
  } catch { throw new Error('Event calendar temporarily unavailable.'); }

  const rawEvent = dbEvent;

  if (!rawEvent) {
    notFound();
  }

  let day = '';
  let mon = '';
  let year: number | null = null;
  let time = '';

  if (rawEvent.schedule && typeof rawEvent.schedule === 'object') {
    if (rawEvent.schedule.day) day = String(rawEvent.schedule.day);
    if (rawEvent.schedule.mon) mon = String(rawEvent.schedule.mon).toUpperCase();
    if (rawEvent.schedule.time) time = String(rawEvent.schedule.time);
  }

  if ((!day || !mon) && rawEvent.dateDisplay) {
    const raw = String(rawEvent.dateDisplay).trim();
    const fullMonths: Record<string, string> = {
      january: 'JAN', february: 'FEB', march: 'MAR', april: 'APR', may: 'MAY', june: 'JUN',
      july: 'JUL', august: 'AUG', september: 'SEP', october: 'OCT', november: 'NOV', december: 'DEC'
    };
    const abbrMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    for (const [full, abbr] of Object.entries(fullMonths)) {
      if (new RegExp(`\\b${full}\\b`, 'i').test(raw)) {
        mon = abbr;
        break;
      }
    }
    if (!mon) {
      for (const abbr of abbrMonths) {
        if (new RegExp(`\\b${abbr}\\b`, 'i').test(raw)) {
          mon = abbr;
          break;
        }
      }
    }

    const dayMatch = raw.match(/\b([0-2]?[0-9]|3[01])\b/);
    if (dayMatch) day = dayMatch[1].padStart(2, '0');

    const yearMatch = raw.match(/\b(202[4-9]|203[0-9])\b/);
    if (yearMatch) year = parseInt(yearMatch[1], 10);

    if (!time) {
      const timeMatch = raw.match(/\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)(?:\s*[-–—]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))?)\b/);
      if (timeMatch) time = timeMatch[1];
    }
  }

  const sched = rawEvent.schedule && typeof rawEvent.schedule === 'object' ? (rawEvent.schedule as any) : {};

  const event = {
    ...rawEvent,
    imageUrl: sched.imageUrl || rawEvent.imageUrl || null,
    pdfUrl: sched.pdfUrl || rawEvent.pdfUrl || null,
    documentUrl: rawEvent.documentUrl || rawEvent.pdfUrl || sched.pdfUrl || sched.documentUrl || null,
    documentType: rawEvent.documentType || 'PDF',
    documentTitle: rawEvent.documentTitle || `${rawEvent.title || 'Event'} – Schedule & Official Guide`,
    subCategory: rawEvent.subCategory || null,
    day: day || rawEvent.day || '',
    mon: mon || rawEvent.mon || '',
    year: year || rawEvent.year || null,
    kind: rawEvent.kind || rawEvent.category || '',
    place: rawEvent.place || rawEvent.location || rawEvent.venue || '',
    time: time || rawEvent.time || sched.time || '',
    summary: rawEvent.summary || rawEvent.description?.slice(0, 160) || '',
    detail: rawEvent.detail || rawEvent.description || '',
    who: rawEvent.who || rawEvent.registration || '',
    contact: rawEvent.contact || 'officehab@gmail.com',
  };

  const bannerImage = eventImage(event.key, event.bannerUrl || event.imageUrl);

  const otherEvents = dbOtherEvents;

  return (
    <main id="main">
      <section className="section relative" data-hab-section="event-detail">
        <SectionEditBadge label="Events Studio" studioHref="/admin/events" />
        
        {/* Blueprint Backbar */}
        <div className="backbar">
          <Link className="backbar__link" href="/events">
            <span aria-hidden="true">←</span> Back to Events
          </Link>
        </div>

        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/news">News &amp; events</Link> /{' '}
          <Link href="/events">Events</Link> / <LocalizedRecordField as="span" english={event.title} dzongkha={event.titleDz} />
        </p>

        <div className="detailhero">
          <p className="eyebrow eyebrow--accent">
            <LocalizedRecordField as="span" english={event.kind} dzongkha={event.categoryDz} /> · {event.dateDisplay}
          </p>
          <LocalizedRecordField as="h1" className="display display--page" english={event.title} dzongkha={event.titleDz} />
          <LocalizedRecordField as="p" className="lede lede--wide" english={event.summary} dzongkha={event.summaryDz || event.descriptionDz} />
        </div>

        <figure className="frame frame--banner has-image" data-cms-img style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Image
            src={bannerImage.src}
            alt={bannerImage.illustrative ? `Illustrative craft photograph for ${event.title}; not a photograph of this event` : event.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          {bannerImage.illustrative && <span className="event-photo-note">Illustrative photo</span>}
        </figure>
      </section>

      {/* Event Facts */}
      <section className="section section--tight">
        <div className="craftfacts">
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Date</span>
            <span className="craftfacts__val">{event.dateDisplay}</span>
          </div>
          {event.time && <div className="craftfacts__cell">
            <span className="craftfacts__key">Time</span>
            <span className="craftfacts__val">{event.time}</span>
          </div>}
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Location</span>
            <LocalizedRecordField as="span" className="craftfacts__val" english={event.place} dzongkha={event.locationDz || event.venueDz} />
          </div>
          {event.who && <div className="craftfacts__cell">
            <span className="craftfacts__key">Attendance</span>
            <LocalizedRecordField as="span" className="craftfacts__val" english={event.who} dzongkha={event.registrationDz} />
          </div>}
        </div>
      </section>

      {/* Story / Description */}
      <section className="section">
        <div 
          className="longread"
          style={(event.documentUrl || event.pdfUrl) ? { gridTemplateColumns: 'minmax(330px, 0.44fr) 0.56fr', gap: '40px', alignItems: 'start' } : undefined}
        >
          <div>
            <p className="eyebrow eyebrow--accent">About this event</p>
            {event.subCategory && (
              <span className="inline-block mt-2 px-2.5 py-1 rounded bg-[#EDE5D6] text-[#6B5A4C] font-mono text-xs font-semibold">
                {event.subCategory}
              </span>
            )}

            {/* Designated space for Event Supporting Document (PDF / Flipbook) positioned on left under event intro */}
            {(event.documentUrl || event.pdfUrl) && (
              <div className="mt-6">
                <DocumentEmbedViewer
                  documentUrl={event.documentUrl || event.pdfUrl}
                  documentType={event.documentType || 'PDF'}
                  documentTitle={event.documentTitle || `${event.title} – Schedule & Guide`}
                  className="my-0 shadow-xs"
                />
              </div>
            )}
          </div>
          <div>
            <LocalizedRecordField as="p" className="longread__body" style={{ marginBottom: 20 }} english={event.detail || event.summary} dzongkha={event.descriptionDz} splitParagraphs />
          </div>
        </div>
      </section>

      {/* How to attend */}
      <section className="section">
        <div className="panel">
          <p className="eyebrow eyebrow--accent">How to attend</p>
          <h2 className="display display--panel">Register or inquire</h2>
          <p className="panel__body">
            Places and stalls for this event are allocated through the HAB Secretariat. For questions or registration assistance, email{' '}
            <a href={`mailto:${event.contact || 'officehab@gmail.com'}`}>{event.contact || 'officehab@gmail.com'}</a> or call +975-2-338089.
          </p>
          <div className="actions">
            <Link className="btn btn--accent" href={`/contact?topic=events&event=${encodeURIComponent(event.title)}`}>
              Contact the Secretariat
            </Link>
            <Link className="btn btn--outline" href="/events">
              All upcoming events
            </Link>
          </div>
        </div>
      </section>

      {/* Other upcoming events */}
      {otherEvents.length > 0 && (
        <section className="section section--last">
          <div className="section__head">
            <div>
              <p className="eyebrow eyebrow--accent">Calendar</p>
              <h2 className="display display--sub">More upcoming events</h2>
            </div>
            <Link className="btn btn--ink btn--sm" href="/events">
              All events →
            </Link>
          </div>
          <div className="grid grid--3">
            {otherEvents.map((oe) => {
              const oeImage = eventImage(oe.key, (oe.schedule as any)?.imageUrl || oe.imageUrl);

              return (
                <Link key={oe.key} className="card" href={`/events/${oe.key}`}>
                  <figure className="frame frame--wide16 has-image" data-cms-img style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <Image
                      src={oeImage.src}
                      alt={oeImage.illustrative ? `Illustrative craft photograph for ${oe.title}; not a photograph of this event` : oe.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                    {oeImage.illustrative && <span className="event-photo-note">Illustrative photo</span>}
                  </figure>
                  <div className="card__body">
                    <p className="eyebrow eyebrow--accent eyebrow--sm" style={{ marginBottom: 4 }}>
                      {oe.dateDisplay} · {oe.category}
                    </p>
                    <LocalizedRecordField as="h3" className="card__title clamp-2" style={{ marginBottom: 4 }} english={oe.title} dzongkha={oe.titleDz} />
                    <LocalizedRecordField as="p" className="card__text clamp-2" english={oe.place || oe.location || oe.venue} dzongkha={oe.locationDz || oe.venueDz} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
