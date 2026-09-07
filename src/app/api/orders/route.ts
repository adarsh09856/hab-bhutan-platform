import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateShipping } from '@/lib/shipping';
import { getEffectiveFxRate } from '@/lib/fx';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching orders.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, currency, shippingMethod, shippingAddress, email, customerName, phone } = body;

    if (!items || !items.length) {
      return NextResponse.json(
        { success: false, error: 'Cannot checkout with an empty basket.' },
        { status: 400 }
      );
    }

    // Check FX rate staleness if checking out in BTN
    const fxInfo = await getEffectiveFxRate();
    if (currency === 'BTN' && fxInfo.isCriticalStale && !fxInfo.isManualOverride) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Royal Monetary Authority FX rate feed exceeds the 72-hour maximum staleness threshold. BTN checkout is temporarily suspended. Please checkout in USD or contact HAB desk.' 
        },
        { status: 422 }
      );
    }

    // Subtotal calculations
    const subtotalUsd = items.reduce((acc: number, item: any) => acc + (Number(item.priceUsd || item.price || 0) * Number(item.quantity || 1)), 0);
    const shippingCalc = calculateShipping(subtotalUsd);
    const isExpress = shippingMethod === 'express' || shippingMethod === 'EXPRESS' || shippingMethod === 'Express Courier';
    const selectedOption = isExpress ? shippingCalc.express : shippingCalc.ems;
    const shippingCostUsd = selectedOption.costUSD;
    const totalUsd = subtotalUsd + shippingCostUsd;

    const rateApplied = fxInfo.rate || 84.0;
    const totalPaidCurrency = currency === 'BTN' 
      ? Math.round(totalUsd * rateApplied) 
      : totalUsd;

    const orderNumber = `HAB-S-${Math.floor(10000 + Math.random() * 90000)}`;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';

    const customerEmail = email || shippingAddress?.email || 'guest@handicraftsbhutan.org';
    const customerFullName = customerName || shippingAddress?.fullName || 'Guest Collector';

    // Persist real order row in PostgreSQL via Prisma
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerType: 'GUEST',
        customerName: customerFullName,
        customerEmail,
        customerPhone: phone || shippingAddress?.phone || null,
        shippingAddress: shippingAddress || {},
        shippingMethod: isExpress ? 'EXPRESS' : 'EMS',
        shippingFeeUSD: shippingCostUsd,
        paymentMethod: 'CARD',
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING_PAYMENT',
        currencyUsed: currency || 'USD',
        fxRateAtPurchase: rateApplied,
        totalUSD: totalUsd,
        totalPaidCurrency,
        items: items.map((item: any) => ({
          code: item.code,
          name: item.name,
          priceUSD: Number(item.priceUsd || item.price || 0),
          quantity: Number(item.quantity || 1),
        })),
      },
    });

    // Polymorphic audit log
    await logAudit({
      actorType: 'GUEST',
      actorId: customerEmail,
      actorIdentifier: customerFullName,
      actorIp: ip,
      action: 'ORDER_PLACED',
      entityType: 'Order',
      entityId: order.id,
      details: {
        orderNumber: order.orderNumber,
        totalUsd: order.totalUSD,
        totalPaidCurrency: order.totalPaidCurrency,
        currency: order.currencyUsed,
        itemsCount: items.length,
        shippingCarrier: selectedOption.name,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        subtotalUsd,
        shippingCostUsd,
        totalUsd,
        totalPaidCurrency,
        currency: order.currencyUsed,
        rateApplied,
        carrier: selectedOption.name,
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing checkout.' },
      { status: 500 }
    );
  }
}
