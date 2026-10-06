import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderQuery = (searchParams.get('order') || searchParams.get('q') || searchParams.get('ref') || '').trim();
    const emailQuery = (searchParams.get('email') || '').trim().toLowerCase();
    const phoneQuery = (searchParams.get('phone') || '').trim().replace(/\D/g, '');

    // Must provide at least one identifier: order/tracking reference, email, or phone
    if (!orderQuery && !emailQuery && !phoneQuery) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide an Order/Tracking number, Email address, or Phone number to track your order.',
        },
        { status: 400 }
      );
    }

    // Build flexible query conditions
    const whereConditions: any[] = [];

    if (orderQuery) {
      whereConditions.push(
        { orderNumber: { equals: orderQuery, mode: 'insensitive' } },
        { trackingNumber: { equals: orderQuery, mode: 'insensitive' } },
        { id: { equals: orderQuery, mode: 'insensitive' } }
      );

      // If user typed an email into the single search box
      if (orderQuery.includes('@')) {
        whereConditions.push({ customerEmail: { equals: orderQuery.toLowerCase(), mode: 'insensitive' } });
      }

      // If user typed a pure phone number into the single search box
      const digitsOnly = orderQuery.replace(/\D/g, '');
      if (digitsOnly.length >= 6) {
        whereConditions.push({ customerPhone: { contains: digitsOnly } });
      }
    }

    if (emailQuery) {
      whereConditions.push({ customerEmail: { equals: emailQuery, mode: 'insensitive' } });
    }

    if (phoneQuery) {
      whereConditions.push({ customerPhone: { contains: phoneQuery } });
    }

    // Execute query
    const orders = await prisma.order.findMany({
      where: {
        OR: whereConditions,
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
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (!orders || orders.length === 0) {
      const searchedVal = orderQuery || emailQuery || phoneQuery;
      return NextResponse.json(
        {
          success: false,
          error: `No order found for '${searchedVal}'. Please verify your System Order ID (e.g. HAB-ORD-XXXX), DHL tracking number, email, or phone number.`,
        },
        { status: 404 }
      );
    }

    // Helper: format single order for response
    const formatOrder = (order: any) => {
      const shippingAddr: any = order.shippingAddress || {};
      const maskedAddress = {
        city: shippingAddr.city || shippingAddr.dzongkhag || 'Thimphu',
        country: shippingAddr.country || 'Bhutan',
        postalCode: shippingAddr.postalCode ? `${shippingAddr.postalCode.slice(0, 2)}***` : undefined,
      };

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
      const isPosSale = order.orderNumber.startsWith('HAB-POS-') || shippingAddr.type === 'WALK_IN_POS_STORE_SALE';

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
          title: isPosSale ? 'Over-the-Counter Fulfillment' : 'Handed to Bhutan Post / DHL',
          desc: isPosSale
            ? 'Completed at HAB Showroom register.'
            : order.trackingNumber
            ? `Dispatched via DHL Express (Tracking: ${order.trackingNumber})`
            : 'Dispatched from Thimphu GPO via Bhutan Post EMS (System Tracking ID Active).',
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

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        systemTrackingNumber: order.orderNumber,
        trackingNumber: order.trackingNumber || order.orderNumber,
        dhlTrackingNumber: order.trackingNumber || null,
        hasCourierTracking: Boolean(order.trackingNumber),
        courierName: order.trackingNumber ? 'DHL Express' : 'Bhutan Post EMS / Secretariat Dispatch',
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
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
        items: order.orderItems?.length > 0 ? order.orderItems : (order.items as any[]) || [],
        milestones,
        isPosSale,
      };
    };

    return NextResponse.json({
      success: true,
      order: formatOrder(orders[0]),
      allOrders: orders.length > 1 ? orders.map(formatOrder) : undefined,
    });
  } catch (err: any) {
    console.error('Error tracking order:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error tracking order status.' },
      { status: 500 }
    );
  }
}
