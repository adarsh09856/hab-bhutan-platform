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
      return NextResponse.json({ success: true, honours });
    }

    // Fallback to CLIENT_DATA honours
    let fallback = (CLIENT_DATA as any).honours || [];
    if (awardType) {
      fallback = fallback.filter((h: any) => h.awardType === awardType);
    }

    return NextResponse.json({ success: true, honours: fallback });
  } catch {
    return NextResponse.json({ success: true, honours: (CLIENT_DATA as any).honours || [] });
  }
}
