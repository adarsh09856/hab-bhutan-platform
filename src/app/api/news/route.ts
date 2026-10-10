import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    const seenArticleCopies = new Set<string>();
    const uniqueArticles = dbArticles.filter((article: any) => {
      const title = String(article.title || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
      const summary = String(article.blurb || article.summary || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
      const identity = title && summary ? `${title}\n${summary}` : String(article.slug || article.id);
      if (seenArticleCopies.has(identity)) return false;
      seenArticleCopies.add(identity);
      return true;
    });

    const articles = uniqueArticles.map((a: any) => {
      let image_path = '';
      let cleanContent = a.content || '';
      if (cleanContent.includes('<!-- HAB_COVER_IMAGE:')) {
        const match = cleanContent.match(/<!-- HAB_COVER_IMAGE:\s*(.*?)\s*-->/);
        if (match) {
          image_path = match[1];
          cleanContent = cleanContent.replace(/<!-- HAB_COVER_IMAGE:\s*(.*?)\s*-->\s*/, '');
        }
      }

      const finalImage = image_path || a.imageUrl || a.image_url || a.image_path || null;

      return {
        ...a,
        date: a.dateString || a.date || a.published_at || '',
        published_at: a.dateString || a.published_at || '',
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
      rawEvents = [];
    }

    const events = rawEvents.map((e: any) => {
      let day = '';
      let mon = '';
      let year: number | null = null;
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
        day: day || e.day || '',
        mon: mon || e.mon || '',
        year: year || e.year || null,
        time: time || e.time || (typeof e.schedule === 'object' && e.schedule?.time) || '',
        place: e.place || e.location || e.venue || '',
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
    return NextResponse.json({ success: false, error: 'News and events are temporarily unavailable.' }, { status: 503 });
  }
}
