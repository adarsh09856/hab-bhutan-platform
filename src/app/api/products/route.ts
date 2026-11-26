import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizeProductImages } from '@/lib/product-image-fallbacks';
import { PUBLIC_PRODUCT_CARD_MAKER_SELECT, toPublicProductCardMaker } from '@/lib/public-product-maker';
import { bhutanDayStartUtc } from '@/lib/trader-expiry';
import { inferProductType } from '@/lib/product-type';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const craft = searchParams.get('craft');
    const collection = searchParams.get('collection');
    const q = searchParams.get('q')?.trim()?.toLowerCase();
    const sort = searchParams.get('sort');
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;
    const productType = searchParams.get('type');
    const compact = searchParams.get('compact') === 'true';
    const minPrice = Number(searchParams.get('minPrice'));
    const maxPrice = Number(searchParams.get('maxPrice'));
    const inStock = searchParams.get('inStock') === 'true';

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
    if (productType) where.productType = productType;
    if (inStock) where.AND.push({ OR: [
      { availability: 'MADE_TO_ORDER' },
      { AND: [{ availability: { not: 'SOLD_OUT' } }, { stock: { gt: 0 } }] },
    ] });
    if (Number.isFinite(minPrice) && searchParams.has('minPrice')) where.priceUSD = { ...(where.priceUSD || {}), gte: minPrice };
    if (Number.isFinite(maxPrice) && searchParams.has('maxPrice')) where.priceUSD = { ...(where.priceUSD || {}), lte: maxPrice };

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

    const query = { where, orderBy, take: limit };
    const dbProducts = compact
      ? await prisma.product.findMany({
          ...query,
          select: {
            id: true,
            code: true,
            slug: true,
            name: true,
            priceUSD: true,
            craftKey: true,
            region: true,
            productType: true,
            materials: true,
            availability: true,
            stock: true,
            lead: true,
            images: true,
            status: true,
            createdAt: true,
            maker: { select: PUBLIC_PRODUCT_CARD_MAKER_SELECT },
            trader: { select: { shopName: true, slug: true, dzongkhag: true, town: true, isVisible: true, expiresAt: true } },
          },
        })
      : await prisma.product.findMany({
          ...query,
          include: {
            craft: true,
            maker: {
              select: PUBLIC_PRODUCT_CARD_MAKER_SELECT,
            },
            trader: { select: { shopName: true, slug: true, dzongkhag: true, town: true, isVisible: true, expiresAt: true } },
          },
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
        const currentTrader = p.trader?.isVisible && p.trader.expiresAt >= bhutanDayStartUtc()
          ? { shopName: p.trader.shopName, slug: p.trader.slug, dzongkhag: p.trader.dzongkhag, town: p.trader.town }
          : null;
        return {
          ...p,
          maker: toPublicProductCardMaker(p.maker),
          trader: currentTrader,
          productType: inferProductType(p) || p.productType || null,
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
