import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      const cluster = await prisma.clusterRecord.findUnique({
        where: { key },
      });
      if (cluster) {
        return NextResponse.json({ success: true, cluster });
      }
      const fallback = CLIENT_DATA.clusters.find((c) => c.key === key);
      return NextResponse.json({ success: true, cluster: fallback || null });
    }

    const clusters = await prisma.clusterRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    if (clusters.length > 0) {
      return NextResponse.json({ success: true, clusters });
    }

    return NextResponse.json({ success: true, clusters: CLIENT_DATA.clusters });
  } catch {
    return NextResponse.json({ success: true, clusters: CLIENT_DATA.clusters });
  }
}
