import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CLIENT_DATA, getEventByKey } from '@/lib/client-data';
import prisma from '@/lib/prisma';
import SectionEditBadge from '@/components/public/SectionEditBadge';

export const dynamic = 'force-dynamic';

interface EventPageProps {
  params: Promise<{ key: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { key } = await params;
  let event: any = null;
  try {
    event = await prisma.eventRecord.findUnique({ where: { key } });
  } catch {}
  if (!event) event = getEventByKey(key);
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
      prisma.eventRecord.findUnique({ where: { key } }),
      prisma.eventRecord.findMany({
        where: { isActive: true, key: { not: key } },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take: 3,
      }),
    ]);
  } catch {}

  const fallback = getEventByKey(key);
  const rawEvent = dbEvent || fallback;

  if (!rawEvent) {
    notFound();
  }

  let day = '';
  let mon = '';
  let year = 2026;
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

  const event = {
    ...rawEvent,
    day: day || rawEvent.day || '12',
    mon: mon || rawEvent.mon || 'SEP',
    year: year || rawEvent.year || '2026',
    kind: rawEvent.kind || rawEvent.category || 'Exhibition',
    place: rawEvent.place || rawEvent.location || rawEvent.venue || 'Thimphu, Bhutan',
    time: time || rawEvent.time || (typeof rawEvent.schedule === 'object' && rawEvent.schedule?.time) || 'All day',
    summary: rawEvent.summary || rawEvent.description?.slice(0, 160) + '...',
    detail: rawEvent.detail || rawEvent.description || '',
    who: rawEvent.who || rawEvent.registration || 'Open to all',
    contact: rawEvent.contact || 'officehab@gmail.com',
  };

  const EVENT_PHOTO_MAP: Record<string, string> = {
    'craft-bazaar-2026': '/assets/photos/hero-4-textiles.jpg',
    'export-clinic-sep': '/assets/photos/hero-2-punakha.jpg',
    'sector-forum-2026': '/assets/photos/about-hab.jpg',
    'dye-training-nov': '/assets/photos/hero-1-weaving.jpg',
    'buyer-mission-nov': '/assets/photos/hero-5-desho.jpg',
    'apprentice-intake-dec': '/assets/photos/hero-3-clay.jpg',
  };

  const bannerImg = event.bannerUrl || event.imageUrl || event.image_url || event.image_path || EVENT_PHOTO_MAP[event.key] || '/assets/photos/hero-4-textiles.jpg';

  const otherEvents = (dbOtherEvents.length > 0 ? dbOtherEvents : CLIENT_DATA.events.filter((e) => e.key !== event.key)).slice(0, 3);

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
          <Link href="/events">Events</Link> / {event.title}
        </p>

        <div className="detailhero">
          <p className="eyebrow eyebrow--accent">
            {event.kind} · {event.day} {event.mon} {event.year}
          </p>
          <h1 className="display display--page">{event.title}</h1>
          <p className="lede lede--wide">{event.summary}</p>
        </div>

        <figure className="frame frame--banner has-image" data-cms-img style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <Image
            src={bannerImg}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </figure>
      </section>

      {/* Event Facts */}
      <section className="section section--tight">
        <div className="craftfacts">
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Date</span>
            <span className="craftfacts__val">{event.day} {event.mon} {event.year}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Time</span>
            <span className="craftfacts__val">{event.time}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Location</span>
            <span className="craftfacts__val">{event.place}</span>
          </div>
          <div className="craftfacts__cell">
            <span className="craftfacts__key">Attendance</span>
            <span className="craftfacts__val">{event.who || 'Open to all'}</span>
          </div>
        </div>
      </section>

      {/* Story / Description */}
      <section className="section">
        <div className="longread">
          <div>
            <p className="eyebrow eyebrow--accent">About this event</p>
          </div>
          <div>
            {(event.detail || event.summary || '').split('\n\n').map((para: string, i: number) => (
              <p key={i} className="longread__body" style={{ marginBottom: 20 }}>
                {para.trim()}
              </p>
            ))}
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
              const oeImg = oe.bannerUrl || oe.imageUrl || oe.image_url || oe.image_path || EVENT_PHOTO_MAP[oe.key] || '/assets/photos/hero-4-textiles.jpg';

              return (
                <Link key={oe.key} className="card" href={`/events/${oe.key}`}>
                  <figure className="frame frame--wide16 has-image" data-cms-img style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <Image
                      src={oeImg}
                      alt={oe.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </figure>
                  <div className="card__body">
                    <p className="eyebrow eyebrow--accent eyebrow--sm" style={{ marginBottom: 4 }}>
                      {oe.day} {oe.mon} · {oe.kind}
                    </p>
                    <h3 className="card__title clamp-2" style={{ marginBottom: 4 }}>
                      {oe.title}
                    </h3>
                    <p className="card__text clamp-2">{oe.place}</p>
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
