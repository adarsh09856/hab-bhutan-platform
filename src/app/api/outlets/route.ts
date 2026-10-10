import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
      return NextResponse.json({ success: true, outlet: null });
    }

    const outlets = await prisma.outletRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    const shouldShuffle = searchParams.get('shuffle') !== 'false';
    let rawList = outlets.map(unpackOutlet);

    if (shouldShuffle && rawList.length > 1) {
      const featured = rawList.filter((o: any) => o.isFeatured);
      const nonFeatured = rawList.filter((o: any) => !o.isFeatured);
      for (let i = nonFeatured.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nonFeatured[i], nonFeatured[j]] = [nonFeatured[j], nonFeatured[i]];
      }
      rawList = [...featured, ...nonFeatured];
    }

    const res = NextResponse.json({ success: true, outlets: rawList });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch {
    return NextResponse.json({ success: false, error: 'Outlet directory temporarily unavailable.' }, { status: 503 });
  }
}
