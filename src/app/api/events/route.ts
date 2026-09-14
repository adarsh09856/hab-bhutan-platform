import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const category = searchParams.get('category');

    if (key) {
      const event = await prisma.eventRecord.findUnique({
        where: { key },
      });
      if (event) {
        return NextResponse.json({ success: true, event });
      }
      const fallback = CLIENT_DATA.events?.find((e: any) => e.key === key);
      return NextResponse.json({ success: true, event: fallback || null });
    }

    const where: any = { isActive: true };
    if (category && category !== 'all' && category !== 'All Events') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const events = await prisma.eventRecord.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    const normalizeEvent = (e: any) => {
      let day = '12';
      let mon = 'SEP';
      let year = 2026;
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
        year = dt.getFullYear();
      }
      return {
        ...e,
        day: e.day || day,
        mon: e.mon || mon,
        year: e.year || year,
        kind: e.kind || e.category || 'Exhibition',
        place: e.place || e.location || e.venue || 'Thimphu, Bhutan',
        time: e.time || (typeof e.schedule === 'object' && e.schedule?.time) || e.dateDisplay || '',
        summary: e.summary || (e.description ? e.description.slice(0, 160) : ''),
        url: e.url || `/events/${e.key || e.id}`,
      };
    };

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
