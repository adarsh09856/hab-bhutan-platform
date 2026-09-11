import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      const category = await prisma.membershipCategory.findUnique({
        where: { key },
      });
      if (category) {
        return NextResponse.json({ success: true, category });
      }
      const fallback = CLIENT_DATA.membershipCategories?.find((c: any) => c.key === key);
      return NextResponse.json({ success: true, category: fallback || null });
    }

    const categories = await prisma.membershipCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { duesBTN: 'asc' }],
    });

    if (categories.length > 0) {
      return NextResponse.json({ success: true, categories });
    }

    return NextResponse.json({ success: true, categories: CLIENT_DATA.membershipCategories || [] });
  } catch {
    return NextResponse.json({ success: true, categories: CLIENT_DATA.membershipCategories || [] });
  }
}
