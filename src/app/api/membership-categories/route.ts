import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

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
      const category = await prisma.membershipCategory.findUnique({
        where: { key },
      });
      if (category) {
        return NextResponse.json({ success: true, category: unpackCategory(category) });
      }
      const fallback = CLIENT_DATA.membershipCategories?.find((c: any) => c.key === key);
      return NextResponse.json({ success: true, category: fallback ? unpackCategory(fallback) : null });
    }

    const categories = await prisma.membershipCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { duesBTN: 'asc' }],
    });

    if (categories.length > 0) {
      return NextResponse.json({ success: true, categories: categories.map(unpackCategory) });
    }

    return NextResponse.json({ success: true, categories: (CLIENT_DATA.membershipCategories || []).map(unpackCategory) });
  } catch {
    return NextResponse.json({ success: true, categories: (CLIENT_DATA.membershipCategories || []).map(unpackCategory) });
  }
}
