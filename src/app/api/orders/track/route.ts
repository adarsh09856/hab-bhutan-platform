import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('order')?.trim();
    const email = searchParams.get('email')?.trim()?.toLowerCase();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Order reference number is required (e.g. HAB-S-12345 or HAB-POS-12345).' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: orderNumber, mode: 'insensitive' } },
          { id: orderNumber },
        ],
      },
      include: {
        orderItems: {
          select: {
            id: true,
            code: true,
            name: true,
            priceUSD: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: `No order found for reference '${orderNumber}'. Please check the order ID on your receipt or email.` },
        { status: 404 }
      );
    }

    // If customer email was also supplied, verify match
    if (email && order.customerEmail && order.customerEmail.toLowerCase() !== email) {
      return NextResponse.json(
        { success: false, error: 'The email provided does not match the order record.' },
        { status: 403 }
      );
    }

    // Mask sensitive contact details for public privacy
    const shippingAddr: any = order.shippingAddress || {};
    const maskedAddress = {
      city: shippingAddr.city || shippingAddr.dzongkhag || 'Thimphu',
      country: shippingAddr.country || 'Bhutan',
      postalCode: shippingAddr.postalCode ? `${shippingAddr.postalCode.slice(0, 2)}***` : undefined,
    };

    // Construct lifecycle progression milestones
    const statusMap: Record<string, number> = {
      PENDING_PAYMENT: 1,
      PROCESSING: 2,
      DISPATCHED: 3,
      IN_TRANSIT: 4,
      DELIVERED: 5,
      CANCELLED: 0,
    };

    const currentStep = statusMap[order.orderStatus] ?? 2;

    const isPosSale = order.orderNumber.startsWith('HAB-POS-') || (order.shippingAddress as any)?.type === 'WALK_IN_POS_STORE_SALE';

    const milestones = [
      {
        step: 1,
        title: 'Order Confirmed',
        desc: 'Order received and registered in Bhutan Secretariat database.',
        completed: currentStep >= 1,
        active: currentStep === 1,
        timestamp: order.createdAt,
      },
      {
        step: 2,
        title: 'Artisan Inspection & Certification',
        desc: 'Master craft authenticity verification and protective archival packing.',
        completed: currentStep >= 2,
        active: currentStep === 2,
      },
      {
        step: 3,
        title: isPosSale ? 'Over-the-Counter Fulfillment' : 'Handed to Bhutan Post / EMS',
        desc: isPosSale 
          ? 'Completed at HAB Showroom register.' 
          : 'Dispatched from Thimphu GPO to international gateway.',
        completed: currentStep >= 3,
        active: currentStep === 3,
      },
      {
        step: 4,
        title: 'International Transit / Customs',
        desc: 'Border clearance and airway forwarding to destination country.',
        completed: currentStep >= 4,
        active: currentStep === 4,
      },
      {
        step: 5,
        title: 'Delivered',
        desc: 'Successfully delivered to customer with signed certificate.',
        completed: currentStep >= 5,
        active: currentStep === 5,
      },
    ];

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerType: order.customerType,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        shippingMethod: order.shippingMethod,
        shippingFeeUSD: order.shippingFeeUSD,
        totalUSD: order.totalUSD,
        totalPaidCurrency: order.totalPaidCurrency,
        currencyUsed: order.currencyUsed,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        shippingDestination: maskedAddress,
        items: order.orderItems.length > 0 
          ? order.orderItems 
          : (order.items as any[] || []),
        milestones,
        isPosSale,
      },
    });
  } catch (err: any) {
    console.error('Error tracking order:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error tracking order status.' },
      { status: 500 }
    );
  }
}
