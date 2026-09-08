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

      return NextResponse.json({
        success: true,
        product,
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
