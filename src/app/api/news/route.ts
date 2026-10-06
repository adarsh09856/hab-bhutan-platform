import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DIVERSE_NEWS_PHOTOS = [
  '/images/programs/design_lab.jpg',
  '/assets/photos/hero-5-desho.jpg',
  '/assets/photos/hero-2-punakha.jpg',
  '/images/programs/dye_training.jpg',
  '/images/programs/trade.jpg',
  '/assets/photos/about-hab.jpg',
  '/assets/photos/hero-3-clay.jpg',
  '/images/programs/heritage.jpg',
  '/images/training_workshop.jpg',
  '/assets/photos/hero-4-textiles.jpg',
  '/assets/photos/hero-1-weaving.jpg',
];

function resolveArticleImage(article: any, index: number): string {
  if (article.content && typeof article.content === 'string' && article.content.includes('<!-- HAB_COVER_IMAGE:')) {
    const match = article.content.match(/<!-- HAB_COVER_IMAGE:\s*(.*?)\s*-->/);
    if (match && match[1].trim()) return match[1].trim();
  }

  const customImg = article.imageUrl || article.image_url || article.image_path;
  if (customImg && typeof customImg === 'string' && customImg.trim() && !customImg.includes('hero-4-textiles.jpg')) {
    return customImg.trim();
  }

  const title = String(article.title || '').toLowerCase();
  const slug = String(article.slug || article.id || '').toLowerCase();
  const kind = String(article.kind || article.category || '').toLowerCase();

  if (title.includes('innovation') || title.includes('designer') || title.includes('lab') || slug.includes('innovation')) {
    return '/images/programs/design_lab.jpg';
  }
  if (title.includes('annual report') || title.includes('accounts') || title.includes('report') || slug.includes('annual-report')) {
    return '/assets/photos/hero-5-desho.jpg';
  }
  if (title.includes('bazaar') || title.includes('clock tower') || title.includes('exhibit') || slug.includes('bazaar')) {
    return '/assets/photos/hero-2-punakha.jpg';
  }
  if (title.includes('dye') || title.includes('khoma') || title.includes('lhuentse') || title.includes('weavers') || slug.includes('dye')) {
    return '/images/programs/dye_training.jpg';
  }
  if (title.includes('trade') || title.includes('export') || title.includes('invoicing') || slug.includes('trade')) {
    return '/images/programs/trade.jpg';
  }
  if (title.includes('heritage') || title.includes('zorig') || title.includes('lineage')) {
    return '/images/programs/heritage.jpg';
  }
  if (title.includes('workshop') || title.includes('training') || title.includes('course')) {
    return '/images/training_workshop.jpg';
  }

  if (kind.includes('publication')) return '/assets/photos/hero-5-desho.jpg';
  if (kind.includes('event')) return '/assets/photos/hero-2-punakha.jpg';
  if (kind.includes('project')) return '/images/programs/design_lab.jpg';
  if (kind.includes('artisan') || kind.includes('support')) return '/images/programs/dye_training.jpg';

  return DIVERSE_NEWS_PHOTOS[index % DIVERSE_NEWS_PHOTOS.length];
}

const DEFAULT_NEWS = [
  {
    id: 'default-1',
    slug: 'trade-facilitation-desk-autumn',
    kind: 'Programs',
    dateString: '28 Aug 2026',
    title: 'Trade facilitation desk opens for the autumn export season',
    blurb: 'Members can now book one-to-one sessions on export documentation, EMS rates and commercial invoicing at the HAB office in Thimphu.',
    image_path: '/images/programs/trade.jpg',
  },
  {
    id: 'default-2',
    slug: 'natural-dye-training-lhuentse',
    kind: 'Artisan support',
    dateString: '14 Aug 2026',
    title: 'Natural dye training concludes in Lhuentse',
    blurb: 'Twenty-six weavers from Khoma and Gangzur completed a ten-day course on madder, indigo and lac dye preparation.',
    image_path: '/images/programs/dye_training.jpg',
  },
  {
    id: 'default-3',
    slug: 'craft-bazaar-clock-tower',
    kind: 'Events',
    dateString: '02 Aug 2026',
    title: 'Zorig Chusum craft bazaar returns to Clock Tower Square',
    blurb: 'Forty member enterprises will exhibit across three days, with live demonstrations from each of the thirteen crafts.',
    image_path: '/assets/photos/hero-2-punakha.jpg',
  },
  {
    id: 'default-4',
    slug: 'annual-report-2025',
    kind: 'Publications',
    dateString: '19 Jul 2026',
    title: 'Annual report 2025 available to download',
    blurb: 'Sector figures, programme outcomes and audited accounts for the year, published in English and Dzongkha.',
    image_path: '/assets/photos/hero-5-desho.jpg',
  },
  {
    id: 'default-5',
    slug: 'product-innovation-lab',
    kind: 'Projects',
    dateString: '30 Jun 2026',
    title: 'Product innovation lab pairs six artisans with designers',
    blurb: 'A six-month cycle developing new homeware lines from bamboo, yathra and desho paper for international retail.',
    image_path: '/images/programs/design_lab.jpg',
  },
];

const DEFAULT_EVENTS = [
  { id: 'ev-1', day: '12', mon: 'SEP', title: 'Craft bazaar, day one', place: 'Clock Tower Square, Thimphu', bannerUrl: '/assets/photos/hero-2-punakha.jpg' },
  { id: 'ev-2', day: '27', mon: 'SEP', title: 'Export documentation clinic', place: 'HAB office, Metog Lam', bannerUrl: '/images/programs/trade.jpg' },
  { id: 'ev-3', day: '08', mon: 'OCT', title: "Members' annual sector forum", place: 'Thimphu', bannerUrl: '/assets/photos/about-hab.jpg' },
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

    const articles = (dbArticles.length > 0 ? dbArticles : DEFAULT_NEWS).map((a: any, idx: number) => {
      let image_path = '';
      let cleanContent = a.content || '';
      if (cleanContent.includes('<!-- HAB_COVER_IMAGE:')) {
        const match = cleanContent.match(/<!-- HAB_COVER_IMAGE:\s*(.*?)\s*-->/);
        if (match) {
          image_path = match[1];
          cleanContent = cleanContent.replace(/<!-- HAB_COVER_IMAGE:\s*(.*?)\s*-->\s*/, '');
        }
      }

      const finalImage = image_path || resolveArticleImage(a, idx);

      return {
        ...a,
        date: a.dateString || a.date || a.published_at || 'Recent',
        published_at: a.dateString || a.published_at || 'Recent',
        slug: a.slug || a.id,
        image_path: finalImage,
        imageUrl: finalImage,
        content: cleanContent,
      };
    });

    let rawEvents: any[] = [];
    if (dbEventRecords.length > 0) {
      rawEvents = dbEventRecords;
    } else if (dbCalendarEvents.length > 0) {
      rawEvents = dbCalendarEvents;
    } else {
      rawEvents = DEFAULT_EVENTS;
    }

    const events = rawEvents.map((e: any) => {
      let day = '';
      let mon = '';
      let year = 2026;
      let time = '';

      if (e.schedule && typeof e.schedule === 'object') {
        if (e.schedule.day) day = String(e.schedule.day);
        if (e.schedule.mon) mon = String(e.schedule.mon).toUpperCase();
        if (e.schedule.time) time = String(e.schedule.time);
      }

      if ((!day || !mon) && e.dateDisplay) {
        const raw = String(e.dateDisplay).trim();
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
        if (dayMatch) {
          day = dayMatch[1].padStart(2, '0');
        }

        const yearMatch = raw.match(/\b(202[4-9]|203[0-9])\b/);
        if (yearMatch) {
          year = parseInt(yearMatch[1], 10);
        }

        if (!time) {
          const timeMatch = raw.match(/\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)(?:\s*[-–—]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))?)\b/);
          if (timeMatch) time = timeMatch[1];
        }
      }

      if ((!day || !mon) && e.startDate) {
        const dt = new Date(e.startDate);
        day = String(dt.getDate()).padStart(2, '0');
        mon = dt.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        year = dt.getFullYear();
      }

      return {
        ...e,
        day: day || e.day || '12',
        mon: mon || e.mon || 'SEP',
        year: year || e.year || 2026,
        time: time || e.time || (typeof e.schedule === 'object' && e.schedule?.time) || 'All day',
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
