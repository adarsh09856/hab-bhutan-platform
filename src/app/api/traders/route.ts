import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const dzongkhag = searchParams.get('dzongkhag')?.trim();
    const craft = searchParams.get('craft')?.trim();
    const slug = searchParams.get('slug')?.trim();
    const now = new Date();
    const rows = await prisma.traderRecord.findMany({
      where: {
        isVisible: true,
        expiresAt: { gt: now },
        ...(slug ? { slug } : {}),
        ...(dzongkhag ? { dzongkhag: { equals: dzongkhag, mode: 'insensitive' as const } } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { shopName: 'asc' }],
    });
    const list = rows.map(({ id, slug, shopName, dzongkhag, town, address, mapUrl, openingHours, shortDescription, description, craftKeys, productTypes, productPhotoUrls, bannerUrl, expiresAt, verifiedSince, sortOrder }) => ({ id, slug, shopName, dzongkhag, town, address, mapUrl, openingHours, shortDescription, description, craftKeys, productTypes, productPhotoUrls, bannerUrl, expiresAt, verifiedSince, sortOrder }))
      .filter((row) => !craft || (Array.isArray(row.craftKeys) && row.craftKeys.some((key) => String(key).toLowerCase() === craft.toLowerCase())))
      .filter((row) => !q || [row.shopName, row.dzongkhag, row.town, row.shortDescription, ...(Array.isArray(row.craftKeys) ? row.craftKeys : [])].some((part) => String(part || '').toLowerCase().includes(q.toLowerCase())));
    return NextResponse.json({ success: true, count: list.length, traders: list }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, error: 'Trader directory is temporarily unavailable.' }, { status: 503 });
  }
}
