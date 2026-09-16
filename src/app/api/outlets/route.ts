import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

function unpackOutlet(outlet: any) {
  if (!outlet) return outlet;
  let note = outlet.note || '';
  let imageUrl = outlet.imageUrl || null;
  const match = note.match(/<!--\s*HAB_IMAGE:\s*(.*?)\s*-->/);
  if (match) {
    imageUrl = match[1].trim();
    note = note.replace(/<!--\s*HAB_IMAGE:\s*[\s\S]*?-->/g, '').trim();
  }
  return {
    ...outlet,
    note: note || null,
    imageUrl: imageUrl || null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      const outlet = await prisma.outletRecord.findUnique({
        where: { key },
      });
      if (outlet) {
        return NextResponse.json({ success: true, outlet: unpackOutlet(outlet) });
      }
      const fallback = CLIENT_DATA.outlets.find((o) => o.key === key);
      return NextResponse.json({ success: true, outlet: fallback ? unpackOutlet(fallback) : null });
    }

    const outlets = await prisma.outletRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    let res: NextResponse;
    if (outlets.length > 0) {
      res = NextResponse.json({ success: true, outlets: outlets.map(unpackOutlet) });
    } else {
      res = NextResponse.json({ success: true, outlets: CLIENT_DATA.outlets.map(unpackOutlet) });
    }
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch {
    const res = NextResponse.json({ success: true, outlets: CLIENT_DATA.outlets.map(unpackOutlet) });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  }
}
