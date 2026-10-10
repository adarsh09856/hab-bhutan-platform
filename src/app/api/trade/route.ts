import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';
import { SERVER_WHOLESALE_TERMS } from '@/lib/wholesale-terms.server';
import { resolveWholesaleOffer } from '@/lib/wholesale-offer';
import { getWholesaleJwtSecret } from '@/lib/wholesale-auth-secret';
import { normalizeProductImages } from '@/lib/product-image-fallbacks';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('hab_wholesale_session')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Approved wholesale sign-in required.' }, { status: 401 });
    let jwtSecret: Uint8Array;
    try { jwtSecret = getWholesaleJwtSecret(); }
    catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: 503 }); }
    let buyerId = '';
    try {
      const { payload } = await jwtVerify(token, jwtSecret);
      buyerId = String((payload.wholesaleBuyer as any)?.id || '');
    } catch {
      return NextResponse.json({ success: false, error: 'Wholesale session expired. Sign in again.' }, { status: 401 });
    }
    const buyer = await prisma.wholesaleBuyer.findFirst({ where: { id: buyerId, status: 'ACTIVE' }, select: { id: true } });
    if (!buyer) return NextResponse.json({ success: false, error: 'Active approved wholesale account required.' }, { status: 403 });
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        AND: [
          { NOT: { code: { startsWith: 'SKU-TEST-', mode: 'insensitive' } } },
          { NOT: { name: { contains: 'Automated Test', mode: 'insensitive' } } },
        ],
      },
      include: { craft: true, maker: true, wholesaleTerms: true },
      orderBy: { code: 'asc' },
    });

    const wholesaleTerms = {
      ...SERVER_WHOLESALE_TERMS,
      ...((setting?.wholesaleTerms as Record<string, any> | null) || {}),
    };
    const assurances = setting?.wholesaleAssurances || CLIENT_DATA.wholesaleAssurance || [];
    const buyerTypes = setting?.wholesaleBuyerTypes || CLIENT_DATA.buyerTypes || [];

    const mapped = products.map((p) => {
      const t = resolveWholesaleOffer(p.wholesaleTerms, (wholesaleTerms as any)[p.code]);
      const normalizedImages = normalizeProductImages(p.code, p.craftKey, p.images);
      return {
        ...p,
        image_path: normalizedImages.imageUrl,
        hero_image: normalizedImages.imageUrl,
        images: normalizedImages.images,
        terms: t,
      };
    }).filter((p) => p.terms !== null);

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
