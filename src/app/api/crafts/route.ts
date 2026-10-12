import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveCraftPhoto } from '@/lib/craft-photo-fallbacks';

function publicCraft(craft: any) {
  return {
    key: craft.key,
    name: craft.name,
    english: craft.english,
    dzongkha: craft.dzongkha,
    description: craft.description,
    descriptionDz: craft.descriptionDz || null,
    long_description: craft.longDescription || craft.description,
    longDescription: craft.longDescription || craft.description,
    longDescriptionDz: craft.longDescriptionDz || null,
    typical_products: craft.typicalProducts || null,
    typicalProducts: craft.typicalProducts || null,
    history: craft.history || null,
    historyDz: craft.historyDz || null,
    bannerUrl: resolveCraftPhoto(craft.key, craft.bannerUrl),
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
