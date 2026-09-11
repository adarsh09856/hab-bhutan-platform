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

    if (events.length > 0) {
      return NextResponse.json({ success: true, events });
    }

    let fallbackEvents = CLIENT_DATA.events || [];
    if (category && category !== 'all' && category !== 'All Events') {
      fallbackEvents = fallbackEvents.filter((e: any) => e.category?.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json({ success: true, events: fallbackEvents });
  } catch {
    return NextResponse.json({ success: true, events: CLIENT_DATA.events || [] });
  }
}
