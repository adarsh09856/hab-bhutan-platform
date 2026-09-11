import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      const pillar = await prisma.supportPillar.findUnique({
        where: { key },
      });
      if (pillar) {
        return NextResponse.json({ success: true, pillar });
      }
      const fallback = (CLIENT_DATA as any).supportPillars?.find((p: any) => p.key === key);
      return NextResponse.json({ success: true, pillar: fallback || null });
    }

    const pillars = await prisma.supportPillar.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    if (pillars.length > 0) {
      return NextResponse.json({ success: true, pillars });
    }

    return NextResponse.json({ success: true, pillars: (CLIENT_DATA as any).supportPillars || [] });
  } catch {
    return NextResponse.json({ success: true, pillars: (CLIENT_DATA as any).supportPillars || [] });
  }
}
