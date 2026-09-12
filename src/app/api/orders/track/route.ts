import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('order')?.trim();
    const email = searchParams.get('email')?.trim()?.toLowerCase();
    const phone = searchParams.get('phone')?.trim()?.replace(/\D/g, '');

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Order reference number is required (e.g. HAB-S-12345).' },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'To protect customer privacy, please enter the email address or phone number used when placing this order.',
        },
        { status: 400 }
      );
    }

    // Look up by official orderNumber ONLY — prevent enumeration by database internal UUID
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: { equals: orderNumber, mode: 'insensitive' },
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
        { success: false, error: `No order found for reference '${orderNumber}'. Please verify your order number and contact details.` },
        { status: 404 }
      );
    }

    // Anti-enumeration identity match: verify customer email or phone
    const emailMatches = email && order.customerEmail && order.customerEmail.toLowerCase() === email;
    const cleanOrderPhone = (order.customerPhone || '').replace(/\D/g, '');
    const phoneMatches = phone && cleanOrderPhone && (cleanOrderPhone === phone || cleanOrderPhone.endsWith(phone) || phone.endsWith(cleanOrderPhone));

    if (!emailMatches && !phoneMatches) {
      return NextResponse.json(
        { success: false, error: 'The verification email or phone number does not match the order record.' },
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
      SHIPPED: 3,
      DISPATCHED: 3,
      IN_TRANSIT: 4,
      DELIVERED: 5,
      CANCELLED: 0,
      REFUNDED: 0,
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
        trackingNumber: order.trackingNumber || null,
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
