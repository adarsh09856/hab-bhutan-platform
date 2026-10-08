import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

function publicCraft(craft: any) {
  const reference = CLIENT_DATA.crafts.find((item) => item.key === craft.key);
  return {
    key: craft.key,
    name: craft.name,
    english: craft.english,
    dzongkha: craft.dzongkha,
    description: craft.description,
    long_description: craft.longDescription || reference?.long_description || craft.description,
    longDescription: craft.longDescription || reference?.long_description || craft.description,
    typical_products: craft.typicalProducts || reference?.typical_products || null,
    typicalProducts: craft.typicalProducts || reference?.typical_products || null,
    history: craft.history || reference?.history || null,
    bannerUrl: craft.bannerUrl || reference?.image_path || null,
    image_alt: reference?.image_alt || `${craft.name} — ${craft.english}`,
    technique: craft.technique,
    materials: craft.materials,
    shop_note: craft.shopNote,
    shopNote: craft.shopNote,
    practised_in: craft.practisedIn,
    practisedIn: craft.practisedIn,
    sort_order: craft.sortOrder,
    sortOrder: craft.sortOrder,
  };
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      const craft = await prisma.craft.findUnique({
        where: { key },
      });
      if (craft) {
        return NextResponse.json({
          success: true,
          craft: publicCraft(craft),
        });
      }
      const fallback = CLIENT_DATA.crafts.find((c) => c.key === key);
      return NextResponse.json({ success: true, craft: fallback || null });
    }

    const crafts = await prisma.craft.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (crafts.length > 0) {
      return NextResponse.json({
        success: true,
        crafts: crafts.map(publicCraft),
      });
    }

    return NextResponse.json({ success: true, crafts: CLIENT_DATA.crafts });
  } catch {
    return NextResponse.json({ success: true, crafts: CLIENT_DATA.crafts });
  }
}
