import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

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
          craft: {
            key: craft.key,
            name: craft.name,
            english: craft.english,
            dzongkha: craft.dzongkha,
            description: craft.description,
            bannerUrl: craft.bannerUrl,
            technique: craft.technique,
            materials: craft.materials,
            practised_in: craft.practisedIn,
            history: craft.history,
            shop_note: craft.shopNote,
            sort_order: craft.sortOrder,
          },
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
        crafts: crafts.map((craft) => ({
          key: craft.key,
          name: craft.name,
          english: craft.english,
          dzongkha: craft.dzongkha,
          description: craft.description,
          bannerUrl: craft.bannerUrl,
          technique: craft.technique,
          materials: craft.materials,
          practised_in: craft.practisedIn,
          history: craft.history,
          shop_note: craft.shopNote,
          sort_order: craft.sortOrder,
        })),
      });
    }

    return NextResponse.json({ success: true, crafts: CLIENT_DATA.crafts });
  } catch {
    return NextResponse.json({ success: true, crafts: CLIENT_DATA.crafts });
  }
}
