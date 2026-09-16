import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const category = searchParams.get('category');

    const normalizeEvent = (e: any) => {
      let day = '';
      let mon = '';
      let year = 2026;
      let time = '';

      // 1. Check schedule JSON first (admin explicit settings)
      if (e.schedule && typeof e.schedule === 'object') {
        if (e.schedule.day) day = String(e.schedule.day);
        if (e.schedule.mon) mon = String(e.schedule.mon).toUpperCase();
        if (e.schedule.time) time = String(e.schedule.time);
      }

      // 2. Intelligent date parsing from dateDisplay without hyphen splits
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

      // 3. Fallback to startDate if available
      if ((!day || !mon) && e.startDate) {
        const dt = new Date(e.startDate);
        day = String(dt.getDate()).padStart(2, '0');
        mon = dt.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        year = dt.getFullYear();
      }

      const sched = (e.schedule && typeof e.schedule === 'object') ? (e.schedule as any) : {};
      const eventImg = sched.imageUrl || e.imageUrl || null;
      const eventPdf = sched.pdfUrl || e.pdfUrl || null;

      return {
        ...e,
        day: day || e.day || '12',
        mon: mon || e.mon || 'SEP',
        year: year || e.year || 2026,
        time: time || e.time || (typeof e.schedule === 'object' && e.schedule?.time) || 'All day',
        kind: e.kind || e.category || 'Exhibition',
        place: e.place || e.location || e.venue || 'Thimphu, Bhutan',
        summary: e.summary || (e.description ? e.description.slice(0, 160) : ''),
        url: e.url || `/events/${e.key || e.id}`,
        imageUrl: eventImg,
        bannerUrl: eventImg,
        pdfUrl: eventPdf,
      };
    };

    if (key) {
      const event = await prisma.eventRecord.findUnique({
        where: { key },
      });
      if (event) {
        const res = NextResponse.json({ success: true, event: normalizeEvent(event) });
        res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        return res;
      }
      const fallback = CLIENT_DATA.events?.find((e: any) => e.key === key);
      const res = NextResponse.json({ success: true, event: fallback ? normalizeEvent(fallback) : null });
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      return res;
    }

    const where: any = { isActive: true };
    if (category && category !== 'all' && category !== 'All Events') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const events = await prisma.eventRecord.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    let res: NextResponse;
    if (events.length > 0) {
      res = NextResponse.json({ success: true, events: events.map(normalizeEvent) });
    } else {
      let fallbackEvents = CLIENT_DATA.events || [];
      if (category && category !== 'all' && category !== 'All Events') {
        fallbackEvents = fallbackEvents.filter((e: any) => e.category?.toLowerCase() === category.toLowerCase());
      }
      res = NextResponse.json({ success: true, events: fallbackEvents.map(normalizeEvent) });
    }
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch {
    const res = NextResponse.json({ success: true, events: CLIENT_DATA.events || [] });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  }
}
