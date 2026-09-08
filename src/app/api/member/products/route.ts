import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { memberProfile: true },
  });

  if (!dbUser || !dbUser.memberProfile) {
    return NextResponse.json({ success: true, products: [] });
  }

  const products = await prisma.product.findMany({
    where: { makerMemberId: dbUser.memberProfile.id },
    include: { craft: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, products });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { memberProfile: true },
  });

  if (!dbUser || !dbUser.memberProfile) {
    return NextResponse.json({ error: 'Artisan profile required to submit craft products' }, { status: 403 });
  }

  const body = await req.json();
  const { name, craftKey, priceUSD, priceBTN, stock, description, dimensions, materials, imageUrl } = body;

  if (!name?.trim() || !craftKey || !priceUSD || !description?.trim()) {
    return NextResponse.json({ error: 'Name, craft category, price, and description are required' }, { status: 400 });
  }

  // Generate unique product code
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const code = `HAB-${craftKey.slice(0, 3).toUpperCase()}-${randomSuffix}`;

  try {
    const product = await prisma.product.create({
      data: {
        code,
        name: name.trim(),
        craftKey,
        makerMemberId: dbUser.memberProfile.id,
        region: dbUser.memberProfile.dzongkhag || 'Thimphu',
        priceUSD: Number(priceUSD),
        stock: Number(stock) || 1,
        description: description.trim(),
        images: [{ url: imageUrl?.trim() || '/images/products/placeholder.jpg', role: 'primary' }],
        status: 'DRAFT',
      },
      include: { craft: true },
    });

    await logAudit({
      actorType: 'MEMBER',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'CRAFT_PRODUCT_SUBMITTED_FOR_REVIEW',
      entityType: 'Product',
      entityId: product.id,
      details: { code, name: product.name },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Product submission failed' }, { status: 500 });
  }
}