import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { memberProfile: true },
  });

  if (!dbUser || !dbUser.memberProfile) {
    return NextResponse.json({ success: true, orders: [] });
  }

  // Find all order items that belong to products made by this artisan
  const myProducts = await prisma.product.findMany({
    where: { makerMemberId: dbUser.memberProfile.id },
    select: { id: true },
  });

  const productIds = myProducts.map((p) => p.id);

  const orderItems = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    include: {
      product: { select: { code: true, name: true, priceUSD: true } },
      order: {
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          customerName: true,
          trackingNumber: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, consignments: orderItems });
}