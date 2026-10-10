import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    const res = NextResponse.json({ success: true, honours, masters: honours });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch (error) {
    console.error('Failed to load honours:', error);
    return NextResponse.json(
      { success: false, error: 'The honours directory is temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
