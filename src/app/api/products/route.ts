import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizeProductImages } from '@/lib/product-image-fallbacks';
import { PUBLIC_PRODUCT_CARD_MAKER_SELECT } from '@/lib/public-product-maker';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const craft = searchParams.get('craft');
    const collection = searchParams.get('collection');
    const q = searchParams.get('q')?.trim()?.toLowerCase();
    const sort = searchParams.get('sort');
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const where: any = {
      status: 'PUBLISHED',
      AND: [
        { NOT: { code: { startsWith: 'SKU-TEST-', mode: 'insensitive' } } },
        { NOT: { name: { contains: 'Automated Test', mode: 'insensitive' } } },
      ],
    };

    if (craft && craft !== 'all') {
      where.craftKey = craft;
    }

    if (collection === 'under50') {
      where.priceUSD = { lt: 50 };
    } else if (collection === 'home') {
      where.craftKey = { in: ['tsharo-zo', 'shag-zo', 'de-zo', 'tshazo', 'shagzo', 'dezo'] };
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'low') {
      orderBy = { priceUSD: 'asc' };
    } else if (sort === 'high') {
      orderBy = { priceUSD: 'desc' };
    }

    const dbProducts = await prisma.product.findMany({
      where,
      include: {
        craft: true,
        maker: {
          select: PUBLIC_PRODUCT_CARD_MAKER_SELECT,
        },
      },
      orderBy,
      take: limit,
    });

    const shouldShuffle = searchParams.get('shuffle') !== 'false' && !sort;

    let sortedList = [...dbProducts];

      // Feedback Item 9: 15-day priority & Catalog Shuffle
      // Products added within the last 15 days stay pinned at the top (newest first).
      // Older products (15+ days old) are automatically shuffled so the same products do not always appear in the same order.
      if (shouldShuffle) {
        const now = Date.now();
        const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
        const recent = sortedList.filter(
          (p) => now - new Date(p.createdAt).getTime() <= FIFTEEN_DAYS_MS
        );
        const older = sortedList.filter(
          (p) => now - new Date(p.createdAt).getTime() > FIFTEEN_DAYS_MS
        );
        // Fisher-Yates shuffle on older products
        for (let i = older.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [older[i], older[j]] = [older[j], older[i]];
        }
        sortedList = [...recent, ...older];
      }

      const mapped = sortedList.map((p) => {
        const normalizedImages = normalizeProductImages(p.code, p.craftKey, p.images);
        return {
          ...p,
          image_path: normalizedImages.imageUrl,
          imageUrl: normalizedImages.imageUrl,
          images: normalizedImages.images,
          price: p.priceUSD,
          price_usd: p.priceUSD,
          priceUSD: p.priceUSD,
        };
      });
      const response = NextResponse.json({
        success: true,
        products: mapped,
      });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;

  } catch (err: any) {
    console.error('[products] Catalogue read failed:', err);
    return NextResponse.json({ success: false, error: 'The product catalogue is temporarily unavailable.' }, { status: 503 });
  }
}
