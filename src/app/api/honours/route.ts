import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const awardType = searchParams.get('awardType');

    const where: any = { isActive: true };
    if (awardType) {
      where.awardType = awardType;
    }

    const honours = await prisma.honourRecord.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { yearAwarded: 'desc' }, { name: 'asc' }],
    });

    if (honours.length > 0) {
      const res = NextResponse.json({ success: true, honours, masters: honours });
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.headers.set('Pragma', 'no-cache');
      res.headers.set('Expires', '0');
      return res;
    }

    // Fallback to CLIENT_DATA honours
    let fallback = (CLIENT_DATA as any).honours || [];
    if (awardType) {
      fallback = fallback.filter((h: any) => h.awardType === awardType);
    }

    const res = NextResponse.json({ success: true, honours: fallback, masters: fallback });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch {
    const res = NextResponse.json({ success: true, honours: (CLIENT_DATA as any).honours || [], masters: (CLIENT_DATA as any).honours || [] });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  }
}
