import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SAMPLE_PRODUCTS } from '@/lib/data';

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
          select: {
            id: true,
            name: true,
            dzongkhag: true,
            regNumber: true,
            tier: true,
          },
        },
      },
      orderBy,
      take: limit,
    });

    const KNOWN_PRODUCT_IMAGES: Record<string, string> = {
      lha01: '/assets/photos/product-lha01.jpg',
      sad03: '/assets/photos/product-sad03.jpg',
      tro04: '/assets/photos/product-tro04.jpg',
      ftb04: '/assets/photos/product-ftb04.jpg',
      dap02: '/assets/photos/product-dap02.jpg',
      mas01: '/assets/photos/product-mas01.jpg',
      dez01: '/assets/photos/product-dez01.jpg',
      cus02: '/assets/photos/product-cus02.jpg',
      hhb01: '/assets/photos/product-hhb01.jpg',
      hhb10: '/assets/photos/product-hhb10.jpg',
      lud01: '/assets/photos/product-lud01.jpg',
      cam01: '/assets/photos/product-cam01.jpg',
      kis02: '/assets/photos/product-sad03.jpg',
      pho03: '/assets/photos/product-dap02.jpg',
      dez07: '/assets/photos/product-dez01.jpg',
      tro09: '/assets/photos/product-tro04.jpg',
      par06: '/assets/photos/product-mas01.jpg',
      lha08: '/assets/photos/product-lha01.jpg',
      tsh11: '/assets/photos/product-ftb04.jpg',
    };

    const CRAFT_FALLBACKS: Record<string, string> = {
      thagzo: '/assets/photos/product-sad03.jpg',
      shagzo: '/assets/photos/product-dap02.jpg',
      troezo: '/assets/photos/product-tro04.jpg',
      tshazo: '/assets/photos/product-ftb04.jpg',
      lhazo: '/assets/photos/product-lha01.jpg',
      parzo: '/assets/photos/product-mas01.jpg',
      dezo: '/assets/photos/product-dez01.jpg',
      tshemzo: '/assets/photos/product-cus02.jpg',
      garzo: '/assets/photos/product-tro04.jpg',
      jinzo: '/assets/photos/hero-3-clay.jpg',
    };

    if (dbProducts.length > 0) {
      const mapped = dbProducts.map((p) => {
        const codeLower = p.code.toLowerCase();
        let img = (p.images as any)?.[0]?.url;
        if (!img || img.includes('placeholder') || img.includes('parotaktshang')) {
          img = KNOWN_PRODUCT_IMAGES[codeLower] || CRAFT_FALLBACKS[p.craftKey] || '/assets/photos/product-hhb01.jpg';
        }
        return {
          ...p,
          image_path: img,
          imageUrl: img,
          price: p.priceUSD,
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
      maker: { name: sp.maker, dzongkhag: sp.region, regNumber: 'HAB-M-01', tier: 'ACTIVE_SECTOR_MEMBER' },
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
