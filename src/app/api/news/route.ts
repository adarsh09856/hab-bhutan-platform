import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_NEWS = [
  {
    id: 'default-1',
    kind: 'Programs',
    dateString: '28 Aug 2026',
    title: 'Trade facilitation desk opens for the autumn export season',
    blurb: 'Members can now book one-to-one sessions on export documentation, EMS rates and commercial invoicing at the HAB office in Thimphu.',
  },
  {
    id: 'default-2',
    kind: 'Artisan support',
    dateString: '14 Aug 2026',
    title: 'Natural dye training concludes in Lhuentse',
    blurb: 'Twenty-six weavers from Khoma and Gangzur completed a ten-day course on madder, indigo and lac dye preparation.',
  },
  {
    id: 'default-3',
    kind: 'Events',
    dateString: '02 Aug 2026',
    title: 'Zorig Chusum craft bazaar returns to Clock Tower Square',
    blurb: 'Forty member enterprises will exhibit across three days, with live demonstrations from each of the thirteen crafts.',
  },
  {
    id: 'default-4',
    kind: 'Publications',
    dateString: '19 Jul 2026',
    title: 'Annual report 2025 available to download',
    blurb: 'Sector figures, programme outcomes and audited accounts for the year, published in English and Dzongkha.',
  },
  {
    id: 'default-5',
    kind: 'Projects',
    dateString: '30 Jun 2026',
    title: 'Product innovation lab pairs six artisans with designers',
    blurb: 'A six-month cycle developing new homeware lines from bamboo, yathra and desho paper for international retail.',
  },
];

const DEFAULT_EVENTS = [
  { id: 'ev-1', day: '12', mon: 'SEP', title: 'Craft bazaar, day one', place: 'Clock Tower Square, Thimphu' },
  { id: 'ev-2', day: '27', mon: 'SEP', title: 'Export documentation clinic', place: 'HAB office, Metog Lam' },
  { id: 'ev-3', day: '08', mon: 'OCT', title: "Members' annual sector forum", place: 'Thimphu' },
];

export async function GET() {
  try {
    const [dbArticles, dbEventRecords, dbCalendarEvents] = await Promise.all([
      prisma.newsArticle.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.eventRecord.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.calendarEvent.findMany({
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const articles = (dbArticles.length > 0 ? dbArticles : DEFAULT_NEWS).map((a: any) => ({
      ...a,
      date: a.dateString || a.date || a.published_at || 'Recent',
      published_at: a.dateString || a.published_at || 'Recent',
      slug: a.slug || a.id,
      image_path: a.image_path || '/assets/photos/hero-4-textiles.jpg',
    }));

    let rawEvents: any[] = [];
    if (dbEventRecords.length > 0) {
      rawEvents = dbEventRecords;
    } else if (dbCalendarEvents.length > 0) {
      rawEvents = dbCalendarEvents;
    } else {
      rawEvents = DEFAULT_EVENTS;
    }

    const events = rawEvents.map((e: any) => {
      let day = e.day;
      let mon = e.mon;
      if (!day || !mon) {
        if (e.dateDisplay) {
          const parts = e.dateDisplay.trim().split(/[\s-]+/);
          if (parts.length >= 2) {
            day = parts[0].replace(/[^0-9]/g, '') || parts[0];
            mon = parts[1].substring(0, 3).toUpperCase();
          }
        } else if (e.startDate) {
          const dt = new Date(e.startDate);
          day = String(dt.getDate()).padStart(2, '0');
          mon = dt.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        }
      }
      return {
        ...e,
        day: day || '12',
        mon: mon || 'SEP',
        place: e.place || e.location || e.venue || 'Thimphu, Bhutan',
        url: e.url || `/events/${e.key || e.id}`,
      };
    });

    const res = NextResponse.json({
      success: true,
      articles,
      news: articles,
      events,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch (err: any) {
    const res = NextResponse.json({
      success: true,
      articles: DEFAULT_NEWS,
      news: DEFAULT_NEWS,
      events: DEFAULT_EVENTS,
      fallback: true,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  }
}
