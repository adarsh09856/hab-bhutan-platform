import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const BUNDLED_CRAFT_PHOTOS = new Set([
  'shingzo', 'dozo', 'parzo', 'lhazo', 'jinzo', 'lugzo', 'garzo',
  'troezo', 'tshazo', 'thagzo', 'tshemzo', 'shagzo', 'dezo',
]);

function publicCraft(craft: any) {
  // Existing live craft records still lack most banner paths. Keep those
  // exact craft photographs visible until an admin replaces them in the database.
  const bundledPhoto = BUNDLED_CRAFT_PHOTOS.has(craft.key) ? `/images/crafts/${craft.key}.jpg` : null;
  return {
    key: craft.key,
    name: craft.name,
    english: craft.english,
    dzongkha: craft.dzongkha,
    description: craft.description,
    long_description: craft.longDescription || craft.description,
    longDescription: craft.longDescription || craft.description,
    typical_products: craft.typicalProducts || null,
    typicalProducts: craft.typicalProducts || null,
    history: craft.history || null,
    bannerUrl: craft.bannerUrl || bundledPhoto,
    image_alt: `${craft.name} — ${craft.english}`,
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
      const craft = await prisma.craft.findFirst({
        where: { key, isActive: true },
      });
      if (craft) {
        return NextResponse.json({
          success: true,
          craft: publicCraft(craft),
        });
      }
      return NextResponse.json({ success: true, craft: null });
    }

    const crafts = await prisma.craft.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, crafts: crafts.map(publicCraft) });
  } catch {
    return NextResponse.json({ success: false, error: 'Craft catalogue unavailable.' }, { status: 503 });
  }
}
