import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SAMPLE_PRODUCTS } from '@/lib/data';
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

    if (dbProducts.length > 0) {
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
    }

    // Fallback to SAMPLE_PRODUCTS mapped to match schema if DB has not been seeded yet
    let fallback = SAMPLE_PRODUCTS.map((sp) => ({
      id: sp.code,
      code: sp.code,
      name: sp.name,
      priceUSD: sp.price,
      craftKey: sp.craftKey,
      region: sp.region,
      stock: 10,
      status: 'PUBLISHED',
      description: (sp as any).material || (sp as any).desc || 'Authentic Bhutanese handcrafted object.',
      images: [{ url: `/images/products/${sp.code.toLowerCase()}.jpg`, role: 'primary' }],
      craft: { key: sp.craftKey, name: sp.craftKey, english: sp.craftKey },
      maker: { name: sp.maker, dzongkhag: sp.region },
    }));

    if (craft && craft !== 'all') {
      fallback = fallback.filter((p) => p.craftKey === craft);
    }
    if (collection === 'under50') {
      fallback = fallback.filter((p) => p.priceUSD < 50);
    }
    if (q) {
      fallback = fallback.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
    }
    if (sort === 'low') {
      fallback.sort((a, b) => a.priceUSD - b.priceUSD);
    } else if (sort === 'high') {
      fallback.sort((a, b) => b.priceUSD - a.priceUSD);
    } else if (shouldShuffle && fallback.length > 1) {
      for (let i = fallback.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fallback[i], fallback[j]] = [fallback[j], fallback[i]];
      }
    }
    if (limit) {
      fallback = fallback.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      products: fallback,
      fallback: true,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
