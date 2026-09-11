import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      const outlet = await prisma.outletRecord.findUnique({
        where: { key },
      });
      if (outlet) {
        return NextResponse.json({ success: true, outlet });
      }
      const fallback = CLIENT_DATA.outlets.find((o) => o.key === key);
      return NextResponse.json({ success: true, outlet: fallback || null });
    }

    const outlets = await prisma.outletRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    if (outlets.length > 0) {
      return NextResponse.json({ success: true, outlets });
    }

    return NextResponse.json({ success: true, outlets: CLIENT_DATA.outlets });
  } catch {
    return NextResponse.json({ success: true, outlets: CLIENT_DATA.outlets });
  }
}
