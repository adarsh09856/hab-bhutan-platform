import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SAMPLE_PRODUCTS, SAMPLE_MEMBERS, CRAFTS } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code?.toUpperCase();

    const product = await prisma.product.findFirst({
      where: {
        code: { equals: code, mode: 'insensitive' },
      },
      include: {
        craft: true,
        maker: {
          include: {
            craft: true,
          },
        },
      },
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

    const CRAFT_FALLBACKS: Record<string, string[]> = {
      thagzo: ['/assets/photos/product-sad03.jpg', '/assets/photos/product-hhb01.jpg', '/assets/photos/hero-4-textiles.jpg'],
      shagzo: ['/assets/photos/product-dap02.jpg', '/assets/photos/hero-3-clay.jpg', '/assets/photos/hero-2-punakha.jpg'],
      troezo: ['/assets/photos/product-tro04.jpg', '/assets/photos/hero-1-weaving.jpg', '/assets/photos/product-cam01.jpg'],
      tshazo: ['/assets/photos/product-ftb04.jpg', '/assets/photos/product-lud01.jpg', '/assets/photos/hero-2-punakha.jpg'],
      lhazo: ['/assets/photos/product-lha01.jpg', '/assets/photos/hero-1-weaving.jpg', '/assets/photos/about-hab.jpg'],
      parzo: ['/assets/photos/product-mas01.jpg', '/assets/photos/hero-3-clay.jpg', '/assets/photos/product-ftb04.jpg'],
      dezo: ['/assets/photos/product-dez01.jpg', '/assets/photos/hero-5-desho.jpg', '/assets/photos/about-hab.jpg'],
      tshemzo: ['/assets/photos/product-cus02.jpg', '/assets/photos/product-cam01.jpg', '/assets/photos/hero-4-textiles.jpg'],
      garzo: ['/assets/photos/product-tro04.jpg', '/assets/photos/hero-1-weaving.jpg', '/assets/photos/product-cam01.jpg'],
      jinzo: ['/assets/photos/hero-3-clay.jpg', '/assets/photos/product-mas01.jpg', '/assets/photos/hero-2-punakha.jpg'],
    };

    if (product) {
      // Also fetch 4 related products from the same craft
      const related = await prisma.product.findMany({
        where: {
          craftKey: product.craftKey,
          code: { not: product.code },
          status: 'PUBLISHED',
        },
        take: 4,
      });

      const codeLower = product.code.toLowerCase();
      let img = (product.images as any)?.[0]?.url;
      if (!img || img.includes('placeholder') || img.includes('parotaktshang')) {
        img = KNOWN_PRODUCT_IMAGES[codeLower] || CRAFT_FALLBACKS[product.craftKey]?.[0] || '/assets/photos/product-hhb01.jpg';
      }

      const craftViews = CRAFT_FALLBACKS[product.craftKey] || ['/assets/photos/product-hhb01.jpg', '/assets/photos/product-sad03.jpg', '/assets/photos/product-dap02.jpg'];
      const resolvedGallery = [
        img,
        (product.images as any)?.[1]?.url || craftViews[1] || craftViews[0],
        (product.images as any)?.[2]?.url || craftViews[2] || craftViews[0],
      ];

      return NextResponse.json({
        success: true,
        product: {
          ...product,
          image_path: img,
          imageUrl: img,
          gallery: resolvedGallery,
        },
        related,
      });
    }

    // Fallback lookup from sample data if database not yet migrated
    const sp = SAMPLE_PRODUCTS.find((p) => p.code.toLowerCase() === code.toLowerCase());
    if (sp) {
      const craft = CRAFTS.find((c) => c.key === sp.craftKey) || CRAFTS[0];
      const maker = SAMPLE_MEMBERS.find((m) => m.name === sp.maker);

      const related = SAMPLE_PRODUCTS.filter(
        (p) => p.craftKey === sp.craftKey && p.code !== sp.code
      ).slice(0, 4);

      return NextResponse.json({
        success: true,
        product: {
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
          craft,
          maker: maker
            ? {
                name: maker.name,
                dzongkhag: maker.dz,
                bio: maker.bio,
                regNumber: 'HAB-M-01',
                tier: (maker as any).tier || 'ACTIVE_SECTOR_MEMBER',
              }
            : null,
        },
        related,
        fallback: true,
      });
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching product' }, { status: 500 });
  }
}
