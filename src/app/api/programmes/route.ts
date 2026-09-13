import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pillars = await prisma.programmePillar.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const res = NextResponse.json({ success: true, pillars });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch (err: any) {
    console.error('Error fetching programme pillars:', err);
    const res = NextResponse.json({ success: false, error: 'Database unavailable.' }, { status: 500 });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  }
}