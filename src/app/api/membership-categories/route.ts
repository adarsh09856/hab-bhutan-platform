import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function unpackCategory(cat: any) {
  if (!cat) return cat;
  const docs = cat.documents && typeof cat.documents === 'object' ? (cat.documents as any) : {};
  return {
    ...cat,
    bannerImageUrl: docs.bannerImageUrl || cat.bannerImageUrl || null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      const category = await prisma.membershipCategory.findFirst({
        where: { key, isActive: true },
      });
      return NextResponse.json({ success: true, category: category ? unpackCategory(category) : null });
    }

    const categories = await prisma.membershipCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { duesBTN: 'asc' }],
    });

    return NextResponse.json({ success: true, categories: categories.map(unpackCategory) });
  } catch (error) {
    console.error('Failed to load membership categories:', error);
    return NextResponse.json(
      { success: false, error: 'Membership categories are temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
