import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !session.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const cleanEmail = session.email.toLowerCase().trim();

    // Query orders linked by userId or matching customerEmail
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: session.id },
          { customerEmail: cleanEmail },
        ],
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                images: true,
                craftKey: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        shippingAddress: o.shippingAddress,
        shippingMethod: o.shippingMethod,
        shippingFeeUSD: o.shippingFeeUSD,
        trackingNumber: o.trackingNumber,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        totalUSD: o.totalUSD,
        totalPaidCurrency: o.totalPaidCurrency,
        currencyUsed: o.currencyUsed,
        fxRateAtPurchase: o.fxRateAtPurchase,
        items: o.items,
        orderItems: o.orderItems,
        mBOBTransactionRef: o.mBOBTransactionRef,
        createdAt: o.createdAt,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching user orders:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve order history.' }, { status: 500 });
  }
}
