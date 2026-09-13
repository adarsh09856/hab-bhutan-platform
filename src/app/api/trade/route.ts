import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const products = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      include: { craft: true, maker: true },
      orderBy: { code: 'asc' },
    });

    const wholesaleTerms = setting?.wholesaleTerms || CLIENT_DATA.wholesaleTerms || {};
    const assurances = setting?.wholesaleAssurances || CLIENT_DATA.wholesaleAssurance || [];
    const buyerTypes = setting?.wholesaleBuyerTypes || CLIENT_DATA.buyerTypes || [];

    const mapped = products.map((p) => {
      const t = (wholesaleTerms as any)[p.code] || {
        moq: setting?.wholesaleMoq || 5,
        lead: setting?.wholesaleLeadTime || '2 to 4 weeks',
        tiers: [
          [5, Math.round(p.priceUSD * 0.9)],
          [15, Math.round(p.priceUSD * 0.82)],
          [40, Math.round(p.priceUSD * 0.75)],
          [100, Math.round(p.priceUSD * 0.68)],
        ],
      };
      const img = (p.images as any)?.[0]?.url || '/assets/photos/product-sad03.jpg';
      return {
        ...p,
        image_path: img,
        hero_image: img,
        terms: t,
      };
    });

    const res = NextResponse.json({
      success: true,
      moq: setting?.wholesaleMoq || 5,
      leadTime: setting?.wholesaleLeadTime || '2 to 4 weeks depending on batch size',
      terms: wholesaleTerms,
      assurances,
      buyerTypes,
      products: mapped,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch (err: any) {
    const res = NextResponse.json({
      success: true,
      moq: 5,
      leadTime: '2 to 4 weeks',
      terms: CLIENT_DATA.wholesaleTerms,
      assurances: CLIENT_DATA.wholesaleAssurance,
      buyerTypes: CLIENT_DATA.buyerTypes,
      products: CLIENT_DATA.products,
      fallback: true,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  }
}
