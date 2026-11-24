import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const awardType = searchParams.get('awardType');
    const q = searchParams.get('q')?.trim();
    const dzongkhag = searchParams.get('dzongkhag')?.trim();
    const craft = searchParams.get('craft')?.trim();
    const featured = searchParams.get('featured') === 'true';

    const where: any = { isActive: true };
    if (awardType) {
      where.awardType = awardType;
    }
    if (dzongkhag) where.dzongkhag = { equals: dzongkhag, mode: 'insensitive' };
    if (craft) where.craft = { equals: craft, mode: 'insensitive' };
    if (featured) where.showHome = true;
    if (q) where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { title: { contains: q, mode: 'insensitive' } },
      { craft: { contains: q, mode: 'insensitive' } },
      { dzongkhag: { contains: q, mode: 'insensitive' } },
      { citation: { contains: q, mode: 'insensitive' } },
    ];

    const honours = await prisma.honourRecord.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { yearAwarded: 'desc' }, { name: 'asc' }],
    });

    const withSlugs = honours.map((honour) => ({
      ...honour,
      slug: honour.slug || `${honour.name}-${honour.yearAwarded}`.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || honour.id,
    }));

    const res = NextResponse.json({ success: true, honours: withSlugs, masters: withSlugs });
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
