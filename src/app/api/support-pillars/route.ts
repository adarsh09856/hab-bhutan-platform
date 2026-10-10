import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    const sanitizePillar = (p: any) => {
      const isGrassroots = p.key === 'grassroots';
      return {
        ...p,
        iconEmoji: isGrassroots ? 'leaf' : '',
        letter: isGrassroots ? 'leaf' : '',
      };
    };

    if (key) {
      const pillar = await prisma.supportPillar.findUnique({
        where: { key, isActive: true },
      });
      return NextResponse.json({ success: true, pillar: pillar ? sanitizePillar(pillar) : null });
    }

    const pillars = await prisma.supportPillar.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, pillars: pillars.map(sanitizePillar) });
  } catch {
    return NextResponse.json({ success: false, error: 'Support information is temporarily unavailable.', pillars: [] }, { status: 503 });
  }
}
