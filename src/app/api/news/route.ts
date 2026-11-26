import { NextRequest, NextResponse } from 'next/server';
import { NEWS_CATEGORIES, NEWS_SUBCATEGORIES, mergeNewsOptions, normalizeNewsCategory } from '@/lib/news-categories';
import prisma from '@/lib/prisma';
import { publicNewsArticles } from '@/lib/public-news-articles';
import { publicDocumentUrl } from '@/lib/public-documents';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const category = normalizeNewsCategory(req.nextUrl.searchParams.get('category'));
  try {
    const [dbArticles, dbEventRecords, dbCalendarEvents, siteSettings] = await Promise.all([
      prisma.newsArticle.findMany({
        where: { isPublished: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      prisma.eventRecord.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.calendarEvent.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } }),
    ]);

    const articles = publicNewsArticles(dbArticles, category);

    const taxonomy = siteSettings?.trustBadges && !Array.isArray(siteSettings.trustBadges) && typeof siteSettings.trustBadges === 'object'
      ? (siteSettings.trustBadges as any).newsTaxonomy || {}
      : {};
    const retiredCategories = new Set(Array.isArray(taxonomy.retiredCategories) ? taxonomy.retiredCategories.map((value: unknown) => String(value).toLocaleLowerCase()) : []);
    const retiredSubCategories = new Set(Array.isArray(taxonomy.retiredSubCategories) ? taxonomy.retiredSubCategories.map((value: unknown) => String(value).toLocaleLowerCase()) : []);
    const articleCategories = dbArticles.map((article) => normalizeNewsCategory(article.kind));
    const articleSubCategories = dbArticles.map((article) => article.subCategory);
    const categories = mergeNewsOptions([...NEWS_CATEGORIES], Array.isArray(taxonomy.categories) ? taxonomy.categories : [], articleCategories)
      .filter((name) => !retiredCategories.has(name.toLocaleLowerCase()) || articleCategories.some((saved) => saved.toLocaleLowerCase() === name.toLocaleLowerCase()));
    const subCategories = mergeNewsOptions([...NEWS_SUBCATEGORIES], Array.isArray(taxonomy.subCategories) ? taxonomy.subCategories : [], articleSubCategories)
      .filter((name) => !retiredSubCategories.has(name.toLocaleLowerCase()) || articleSubCategories.some((saved) => String(saved || '').toLocaleLowerCase() === name.toLocaleLowerCase()));

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
      categories,
      subCategories,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'News and events are temporarily unavailable.' }, { status: 503 });
  }
}
