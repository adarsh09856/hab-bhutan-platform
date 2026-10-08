import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';
import { SERVER_WHOLESALE_TERMS } from '@/lib/wholesale-terms.server';

export const dynamic = 'force-dynamic';

const tradeJwtKey = new TextEncoder().encode(process.env.JWT_SECRET || '122e08790446e8ac0439219e4e508d8904792f81a061eacb8e58333a31261d46');

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('hab_wholesale_session')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Approved wholesale sign-in required.' }, { status: 401 });
    let buyerId = '';
    try {
      const { payload } = await jwtVerify(token, tradeJwtKey);
      buyerId = String((payload.wholesaleBuyer as any)?.id || '');
    } catch {
      return NextResponse.json({ success: false, error: 'Wholesale session expired. Sign in again.' }, { status: 401 });
    }
    const buyer = await prisma.wholesaleBuyer.findFirst({ where: { id: buyerId, status: 'ACTIVE' }, select: { id: true } });
    if (!buyer) return NextResponse.json({ success: false, error: 'Active approved wholesale account required.' }, { status: 403 });
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const products = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      include: { craft: true, maker: true, wholesaleTerms: true },
      orderBy: { code: 'asc' },
    });

    const wholesaleTerms = setting?.wholesaleTerms || SERVER_WHOLESALE_TERMS;
    const assurances = setting?.wholesaleAssurances || CLIENT_DATA.wholesaleAssurance || [];
    const buyerTypes = setting?.wholesaleBuyerTypes || CLIENT_DATA.buyerTypes || [];

    const mapped = products.map((p) => {
      const saved = p.wholesaleTerms;
      const t = saved ? {
        moq: saved.moq,
        lead_time: saved.leadTime,
        tiers: saved.tiers,
        customisation: saved.customisation || '',
        is_active: saved.isActive,
      } : (wholesaleTerms as any)[p.code] || {
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
      assurances,
      buyerTypes,
      products: mapped,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch (err: any) {
    console.error('Wholesale catalogue unavailable:', err);
    const res = NextResponse.json({ success: false, error: 'Wholesale catalogue is temporarily unavailable.' }, { status: 503 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
}
