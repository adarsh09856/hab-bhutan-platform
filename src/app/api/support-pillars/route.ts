import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    const sanitizePillar = (p: any) => {
      let icon = p.iconEmoji || '';
      if (p.key === 'grassroots') {
        icon = '🌿';
      } else if (icon === 'leaf' || !icon) {
        if (p.key === 'impact') icon = '⚡';
        else if (p.key === 'cultural') icon = '🏺';
        else if (p.key === 'environment') icon = '🌲';
        else icon = p.title?.[0] || '✦';
      }
      return { ...p, iconEmoji: icon };
    };

    if (key) {
      const pillar = await prisma.supportPillar.findUnique({
        where: { key },
      });
      if (pillar) {
        return NextResponse.json({ success: true, pillar: sanitizePillar(pillar) });
      }
      const fallback = (CLIENT_DATA as any).supportPillars?.find((p: any) => p.key === key);
      return NextResponse.json({ success: true, pillar: fallback ? sanitizePillar(fallback) : null });
    }

    const pillars = await prisma.supportPillar.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    if (pillars.length > 0) {
      return NextResponse.json({ success: true, pillars: pillars.map(sanitizePillar) });
    }

    const fallbackList = ((CLIENT_DATA as any).supportPillars || []).map(sanitizePillar);
    return NextResponse.json({ success: true, pillars: fallbackList });
  } catch {
    const fallbackList = ((CLIENT_DATA as any).supportPillars || []).map((p: any) => ({
      ...p,
      iconEmoji: p.key === 'grassroots' ? '🌿' : (p.key === 'impact' ? '⚡' : (p.key === 'cultural' ? '🏺' : (p.key === 'environment' ? '🌲' : (p.letter || '✦')))),
    }));
    return NextResponse.json({ success: true, pillars: fallbackList });
  }
}
