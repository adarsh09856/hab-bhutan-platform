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

    if (dbProducts.length > 0) {
      return NextResponse.json({
        success: true,
        products: dbProducts,
      });
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
