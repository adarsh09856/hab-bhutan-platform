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
    const [dbArticles, dbEvents] = await Promise.all([
      prisma.newsArticle.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.calendarEvent.findMany({
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const articles = dbArticles.length > 0 ? dbArticles : DEFAULT_NEWS;
    const events = dbEvents.length > 0 ? dbEvents : DEFAULT_EVENTS;

    return NextResponse.json({
      success: true,
      articles,
      news: articles,
      events,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      articles: DEFAULT_NEWS,
      news: DEFAULT_NEWS,
      events: DEFAULT_EVENTS,
      fallback: true,
    });
  }
}
