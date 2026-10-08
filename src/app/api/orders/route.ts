import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateShipping } from '@/lib/shipping';
import { getEffectiveFxRate } from '@/lib/fx';
import { logAudit } from '@/lib/audit';
import { checkDurableRateLimit } from '@/lib/rate-limit';
import { getSessionUser, requirePermission, AuthError } from '@/lib/rbac';
import { CLIENT_DATA } from '@/lib/client-data';
import { sendOrderConfirmationEmail } from '@/lib/email-service';
import { getFallbackOrders, saveFallbackOrder, FallbackOrder } from '@/lib/order-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'orders:view');
    let orders: any[] = [];
    try {
      orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (dbErr) {
      // Database offline fallback
    }

    const fallbackOrders = getFallbackOrders();
    const map = new Map<string, any>();
    for (const o of orders) {
      if (o && o.orderNumber) map.set(o.orderNumber, o);
    }
    for (const fo of fallbackOrders) {
      if (fo && fo.orderNumber && !map.has(fo.orderNumber)) {
        map.set(fo.orderNumber, fo);
      }
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      orders: merged,
    });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    console.error('Error fetching orders:', err);
    return NextResponse.json({
      success: true,
      orders: getFallbackOrders(),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || req.headers.get('x-real-ip')
      || '127.0.0.1';

    // Durable sliding-window rate limit: 10 checkouts per min per IP (bypassed if explicit test header present)
    if (req.headers.get('x-bypass-rate-limit') !== 'true') {
      try {
        const rl = await checkDurableRateLimit(`checkout:${ip}`, 10, 60);
        if (!rl.success) {
          return NextResponse.json(
            { success: false, error: 'Too many order attempts. Please slow down and try again in 1 minute.' },
            { status: 429 }
          );
        }
      } catch {
        // Rate-limit non-blocking fallback
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
    let fxInfo: any = { rate: 84.0, isCriticalStale: false, isManualOverride: false };
    try {
      fxInfo = await getEffectiveFxRate({ simulateOffline: req.headers.get('x-test-fx-offline') === 'true' });
      if (currency === 'BTN' && fxInfo.isCriticalStale && !fxInfo.isManualOverride) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Royal Monetary Authority FX rate feed exceeds the 72-hour maximum staleness threshold. BTN checkout is temporarily suspended. Please checkout in USD or contact HAB desk.' 
          },
          { status: 422 }
        );
      }
    } catch {
      // Use standard rate
    }

    const rateApplied = fxInfo.rate || 84.0;
    const orderNumber = `HAB-S-${Math.floor(10000 + Math.random() * 90000)}`;
    const systemTrackingNumber = `HAB-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const rawEmail = email || body.customerEmail || shippingAddress?.email || 'guest@handicraftsbhutan.org';
    const customerEmail = String(rawEmail).trim().toLowerCase();
    const customerFullName = String(customerName || body.customerName || shippingAddress?.fullName || 'Guest Collector').trim();
    const customerPhoneNum = phone || body.customerPhone || shippingAddress?.phone || null;
    const isExpress = shippingMethod === 'express' || shippingMethod === 'EXPRESS' || shippingMethod === 'Express Courier';

    // Strict normalization for PaymentMethod ('CARD' | 'MBOB' | 'BNB' | 'BANK' | 'COD')
    const rawPayment = String(paymentMethod || 'CARD').trim().toUpperCase();
    let normalizedPaymentMethod: 'CARD' | 'MBOB' | 'BANK' | 'COD' = 'CARD';
    if (rawPayment === 'COD' || rawPayment.includes('CASH') || rawPayment.includes('DELIVERY')) {
      normalizedPaymentMethod = 'COD';
    } else if (rawPayment === 'MBOB' || rawPayment.includes('MBOB') || rawPayment.includes('MOBILE')) {
      normalizedPaymentMethod = 'MBOB';
    } else if (rawPayment === 'BNB' || rawPayment.includes('BNB')) {
      normalizedPaymentMethod = 'MBOB'; // Map to mobile banking enum
    } else if (rawPayment === 'BANK' || rawPayment.includes('BANK') || rawPayment.includes('WIRE') || rawPayment.includes('TRANSFER')) {
      normalizedPaymentMethod = 'BANK';
    } else {
      normalizedPaymentMethod = 'CARD';
    }

    let initialPaymentStatus: 'PAID' | 'PENDING' = 'PENDING';
    let initialOrderStatus: 'PROCESSING' | 'PENDING_PAYMENT' = 'PENDING_PAYMENT';
    let internalNotes = '';

    if (normalizedPaymentMethod === 'COD') {
      initialPaymentStatus = 'PENDING';
      initialOrderStatus = 'PROCESSING';
      internalNotes = '[CASH ON DELIVERY] Payment to be collected in cash or via mBoB upon courier arrival.';
    } else if (normalizedPaymentMethod === 'CARD') {
      initialPaymentStatus = 'PAID';
      initialOrderStatus = 'PROCESSING';
      internalNotes = '[GATEWAY SANDBOX / TEST SIMULATION] Simulated 3D-Secure card authorization in Sandbox Mode.';
    } else if (normalizedPaymentMethod === 'MBOB') {
      initialPaymentStatus = 'PENDING';
      initialOrderStatus = 'PROCESSING';
      internalNotes = body.mBOBTransactionRef
        ? `[mBoB] Customer submitted Journal Ref: ${body.mBOBTransactionRef}. Verify with Bank of Bhutan before dispatch.`
        : '[mBoB] Awaiting mBoB journal confirmation.';
    } else if (normalizedPaymentMethod === 'BANK') {
      initialPaymentStatus = 'PENDING';
      initialOrderStatus = 'PENDING_PAYMENT';
      internalNotes = '[BANK WIRE] Awaiting direct bank transfer to Bank of Bhutan account.';
    }

    let session: any = null;
    try {
      session = await getSessionUser(req);
    } catch {}
    const isMember = Boolean(session && session.id);

    // Resolve resolvedItems and subtotalCents canonically
    let subtotalCents = 0;
    const resolvedItems: any[] = [];
    for (const item of items) {
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const refProduct = CLIENT_DATA.products.find((p) => p.code === item.code);
      const canonicalUnitPriceUSD = refProduct?.price_usd || Number(item.priceUsd) || Number(item.priceUSD) || 50;
      const itemTotalCents = Math.round(canonicalUnitPriceUSD * 100) * qty;
      subtotalCents += itemTotalCents;

      resolvedItems.push({
        productId: item.productId || item.id || `prod-${item.code}`,
        code: item.code,
        name: refProduct?.name || item.name || `Bhutanese Craft SKU ${item.code}`,
        priceUSD: canonicalUnitPriceUSD,
        quantity: qty,
      });
    }

    const subtotalUSD = subtotalCents / 100;
    const shippingCalc = calculateShipping(subtotalUSD);
    const selectedOption = isExpress ? shippingCalc.express : shippingCalc.ems;
    const shippingCostUSD = selectedOption.costUSD;
    const shippingCostCents = Math.round(shippingCostUSD * 100);
    const totalCents = subtotalCents + shippingCostCents;
    const totalUSD = totalCents / 100;

    const totalPaidCurrency = currency === 'BTN'
      ? Math.round(totalUSD * rateApplied)
      : totalUSD;

    let dbOrderRecord: any = null;

    // Attempt PostgreSQL persistence via Prisma transaction
    try {
      dbOrderRecord = await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
          let product = await tx.product.findUnique({
            where: { code: item.code },
          });

          if (!product) {
            const refProduct = CLIENT_DATA.products.find((p) => p.code === item.code);
            const craftKey = refProduct?.craft_key || 'thagzo';
            const price = refProduct?.price_usd || Number(item.priceUsd) || 50;

            const imgUrl = refProduct?.image_path 
              ? `/${refProduct.image_path.replace(/^\/+/, '')}`
              : `/assets/photos/product-${item.code.toLowerCase().slice(0, 5)}.jpg`;

            product = await tx.product.create({
              data: {
                code: item.code,
                name: refProduct?.name || item.name || `Bhutanese Craft SKU ${item.code}`,
                priceUSD: price,
                stock: 100,
                status: 'PUBLISHED',
                description: refProduct?.description || 'Authentic Bhutanese handcrafted piece certified by HAB.',
                craftKey,
                region: refProduct?.region || 'Thimphu',
                images: [{ url: imgUrl, role: 'primary' }],
              },
            });
          }

          if (product && product.stock >= qty) {
            await tx.product.update({
              where: { id: product.id },
              data: { stock: { decrement: qty } },
            }).catch(() => {});
          }
        }

        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            trackingNumber: isExpress ? `DHL-HAB-${Math.floor(1000000 + Math.random() * 9000000)}` : systemTrackingNumber,
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
            paymentMethod: normalizedPaymentMethod,
            paymentStatus: initialPaymentStatus,
            orderStatus: initialOrderStatus,
            currencyUsed: currency || 'USD',
            fxRateAtPurchase: rateApplied,
            totalUSD: totalUSD,
            totalPaidCurrency,
            items: resolvedItems,
            internalNotes: internalNotes,
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

        return newOrder;
      });
    } catch (dbErr: any) {
      console.warn('[orders/route] PostgreSQL database connection unavailable or transaction error; activating resilient fallback order persistence:', dbErr.message);
    }

    // Persist to resilient fallback store
    const fallbackSaved = saveFallbackOrder({
      id: dbOrderRecord?.id || `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderNumber,
      trackingNumber: isExpress ? `DHL-HAB-${Math.floor(1000000 + Math.random() * 9000000)}` : systemTrackingNumber,
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
      paymentMethod: (normalizedPaymentMethod as any),
      paymentStatus: initialPaymentStatus,
      orderStatus: initialOrderStatus,
      currencyUsed: currency || 'USD',
      fxRateAtPurchase: rateApplied,
      totalUSD: totalUSD,
      totalPaidCurrency,
      subtotalUSD: subtotalUSD,
      items: resolvedItems,
      orderItems: resolvedItems,
      carrier: selectedOption.name,
      internalNotes,
    });

    const finalOrder = dbOrderRecord || fallbackSaved;

    // Polymorphic audit log (safe non-blocking)
    logAudit({
      actorType: 'GUEST',
      actorId: customerEmail,
      actorIdentifier: customerFullName,
      actorIp: ip,
      action: 'ORDER_PLACED',
      entityType: 'Order',
      entityId: finalOrder.id,
      details: {
        orderNumber: finalOrder.orderNumber,
        trackingNumber: finalOrder.trackingNumber || systemTrackingNumber,
        totalUSD: totalUSD,
        totalPaidCurrency: totalPaidCurrency,
        currency: finalOrder.currencyUsed,
        itemsCount: items.length,
        shippingCarrier: selectedOption.name,
      },
    }).catch(() => {});

    // Asynchronous order confirmation email dispatch (zero-crash / non-blocking)
    sendOrderConfirmationEmail({
      order: {
        ...finalOrder,
        carrier: selectedOption.name,
        trackingNumber: finalOrder.trackingNumber || systemTrackingNumber,
      },
      customerEmail,
      customerName: customerFullName,
    }).catch((err) => {
      console.warn('[orders/route] Background confirmation email dispatch notice:', err.message);
    });

    return NextResponse.json({
      success: true,
      order: {
        id: finalOrder.id,
        orderNumber: finalOrder.orderNumber,
        trackingNumber: finalOrder.trackingNumber || systemTrackingNumber,
        status: finalOrder.orderStatus,
        subtotalUsd: subtotalUSD,
        shippingCostUsd: shippingCostUSD,
        shippingFeeUSD: shippingCostUSD,
        totalUsd: totalUSD,
        totalUSD: totalUSD,
        totalPaidCurrency: totalPaidCurrency,
        currency: finalOrder.currencyUsed,
        currencyUsed: finalOrder.currencyUsed,
        paymentMethod: finalOrder.paymentMethod,
        rateApplied,
        carrier: selectedOption.name,
        createdAt: finalOrder.createdAt ? new Date(finalOrder.createdAt).toISOString() : new Date().toISOString(),
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
