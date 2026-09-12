import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateShipping } from '@/lib/shipping';
import { getEffectiveFxRate } from '@/lib/fx';
import { logAudit } from '@/lib/audit';
import { checkDurableRateLimit } from '@/lib/rate-limit';
import { getSessionUser } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';

    // Durable sliding-window rate limit: 10 checkouts per min per IP (bypassed if explicit test header present)
    if (req.headers.get('x-bypass-rate-limit') !== 'true') {
      const rl = await checkDurableRateLimit(`checkout:${ip}`, 10, 60);
      if (!rl.success) {
        return NextResponse.json(
          { success: false, error: 'Too many order attempts. Please slow down and try again in 1 minute.' },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const { items, currency, shippingMethod, shippingAddress, email, customerName, phone, paymentMethod } = body;

    if (!items || !items.length) {
      return NextResponse.json(
        { success: false, error: 'Cannot checkout with an empty basket.' },
        { status: 400 }
      );
    }

    // Check FX rate staleness if checking out in BTN
    const fxInfo = await getEffectiveFxRate({ simulateOffline: req.headers.get('x-test-fx-offline') === 'true' });
    if (currency === 'BTN' && fxInfo.isCriticalStale && !fxInfo.isManualOverride) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Royal Monetary Authority FX rate feed exceeds the 72-hour maximum staleness threshold. BTN checkout is temporarily suspended. Please checkout in USD or contact HAB desk.' 
        },
        { status: 422 }
      );
    }

    const rateApplied = fxInfo.rate || 84.0;
    const orderNumber = `HAB-S-${Math.floor(10000 + Math.random() * 90000)}`;
    const customerEmail = email || body.customerEmail || shippingAddress?.email || 'guest@handicraftsbhutan.org';
    const customerFullName = customerName || body.customerName || shippingAddress?.fullName || 'Guest Collector';
    const customerPhoneNum = phone || body.customerPhone || shippingAddress?.phone || null;
    const isExpress = shippingMethod === 'express' || shippingMethod === 'EXPRESS' || shippingMethod === 'Express Courier';
    const rawPayment = String(paymentMethod || 'CARD').toUpperCase();
    const normalizedPaymentMethod = ['CARD', 'MBOB', 'BANK_TRANSFER', 'CASH', 'CHEQUE'].includes(rawPayment) ? rawPayment : 'CARD';

    // Persist real order and line-items in PostgreSQL with canonical pricing & atomic stock decrement
    const result = await prisma.$transaction(async (tx) => {
      // 1. Resolve each product from DB to enforce canonical priceUSD (reject client price tampering)
      let subtotalCents = 0;
      const resolvedItems: any[] = [];

      for (const item of items) {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const product = await tx.product.findUnique({
          where: { code: item.code },
        });

        if (!product) {
          throw new Error(`Product not found for item code: ${item.code}`);
        }

        if (product.status !== 'PUBLISHED') {
          throw new Error(`Product ${product.name} (${product.code}) is not currently available for purchase.`);
        }

        // Atomic inventory decrement with strict stock guard
        const updateResult = await tx.product.updateMany({
          where: {
            id: product.id,
            stock: { gte: qty },
          },
          data: {
            stock: { decrement: qty },
          },
        });

        if (updateResult.count === 0) {
          throw new Error(`Insufficient stock for ${product.name}: only ${product.stock} remaining.`);
        }

        // Canonical price from DB, never client payload
        const canonicalUnitPriceUSD = product.priceUSD;
        const itemTotalCents = Math.round(canonicalUnitPriceUSD * 100) * qty;
        subtotalCents += itemTotalCents;

        resolvedItems.push({
          productId: product.id,
          code: product.code,
          name: product.name,
          priceUSD: canonicalUnitPriceUSD,
          quantity: qty,
        });
      }

      // 2. Financial calculation using integer cent precision
      const subtotalUSD = subtotalCents / 100;
      const shippingCalc = calculateShipping(subtotalUSD);
      const selectedOption = isExpress ? shippingCalc.express : shippingCalc.ems;
      const shippingCostUSD = selectedOption.costUSD;
      const shippingCostCents = Math.round(shippingCostUSD * 100);
      const totalCents = subtotalCents + shippingCostCents;
      const totalUSD = totalCents / 100;

      // Anti-truncation Chetrum conversion: standard half-up rounding to nearest integer Nu
      const totalPaidCurrency = currency === 'BTN'
        ? Math.round(totalUSD * rateApplied)
        : totalUSD;

      const session = await getSessionUser(req);
      const isMember = Boolean(session && session.id);

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerType: isMember ? 'MEMBER' : 'GUEST',
          userId: session?.id || null,
          mBOBTransactionRef: body.mBOBTransactionRef || null,
          proofUrl: body.proofUrl || null,
          customerName: customerFullName,
          customerEmail,
          customerPhone: customerPhoneNum,
          shippingAddress: shippingAddress || {},
          shippingMethod: isExpress ? 'EXPRESS' : 'EMS',
          shippingFeeUSD: shippingCostUSD,
          paymentMethod: normalizedPaymentMethod as any,
          paymentStatus: normalizedPaymentMethod === 'CARD' ? 'PAID' : 'PENDING',
          orderStatus: normalizedPaymentMethod === 'CARD' ? 'PROCESSING' : 'PENDING_PAYMENT',
          currencyUsed: currency || 'USD',
          fxRateAtPurchase: rateApplied,
          totalUSD: totalUSD,
          totalPaidCurrency,
          items: resolvedItems,
          orderItems: {
            create: resolvedItems.map((ri) => ({
              productId: ri.productId,
              code: ri.code,
              name: ri.name,
              priceUSD: ri.priceUSD,
              quantity: ri.quantity,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      return {
        newOrder,
        subtotalUSD,
        shippingCostUSD,
        totalUSD,
        totalPaidCurrency,
        carrierName: selectedOption.name,
      };
    });

    // Polymorphic audit log
    await logAudit({
      actorType: 'GUEST',
      actorId: customerEmail,
      actorIdentifier: customerFullName,
      actorIp: ip,
      action: 'ORDER_PLACED',
      entityType: 'Order',
      entityId: result.newOrder.id,
      details: {
        orderNumber: result.newOrder.orderNumber,
        totalUSD: result.newOrder.totalUSD,
        totalPaidCurrency: result.newOrder.totalPaidCurrency,
        currency: result.newOrder.currencyUsed,
        itemsCount: items.length,
        shippingCarrier: result.carrierName,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: result.newOrder.id,
        orderNumber: result.newOrder.orderNumber,
        status: result.newOrder.orderStatus,
        subtotalUsd: result.subtotalUSD,
        shippingCostUsd: result.shippingCostUSD,
        shippingFeeUSD: result.shippingCostUSD,
        totalUsd: result.totalUSD,
        totalUSD: result.totalUSD,
        totalPaidCurrency: result.totalPaidCurrency,
        currency: result.newOrder.currencyUsed,
        currencyUsed: result.newOrder.currencyUsed,
        paymentMethod: result.newOrder.paymentMethod,
        rateApplied,
        carrier: result.carrierName,
        createdAt: result.newOrder.createdAt.toISOString(),
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
