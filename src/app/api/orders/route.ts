import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateShipping } from '@/lib/shipping';
import { getEffectiveFxRate } from '@/lib/fx';
import { logAudit } from '@/lib/audit';
import { checkDurableRateLimit } from '@/lib/rate-limit';
import { getSessionUser, requirePermission, AuthError } from '@/lib/rbac';
import { sendOrderConfirmationEmail } from '@/lib/email-service';
import { notifyStaff } from '@/lib/transaction-notifications';
import { resolveBankTransferConfig } from '@/lib/payments';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { getFallbackOrders } from '@/lib/order-store';

export const dynamic = 'force-dynamic';

class CheckoutValidationError extends Error {}

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

    // All callers are subject to the same limit, including requests with test headers.
    {
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

    if (!Array.isArray(items) || !items.length || items.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Add between 1 and 50 products to your basket.' },
        { status: 400 }
      );
    }
    if (currency !== 'USD' && currency !== 'BTN') {
      return NextResponse.json({ success: false, error: 'Select USD or BTN as the checkout currency.' }, { status: 400 });
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
    let normalizedPaymentMethod: 'CARD' | 'MBOB' | 'BNB' | 'BANK' | 'COD' = 'CARD';
    if (rawPayment === 'COD' || rawPayment.includes('CASH') || rawPayment.includes('DELIVERY')) {
      normalizedPaymentMethod = 'COD';
    } else if (rawPayment === 'MBOB' || rawPayment.includes('MBOB') || rawPayment.includes('MOBILE')) {
      normalizedPaymentMethod = 'MBOB';
    } else if (rawPayment === 'BNB' || rawPayment.includes('BNB')) {
      normalizedPaymentMethod = 'BNB';
    } else if (rawPayment === 'BANK' || rawPayment.includes('BANK') || rawPayment.includes('WIRE') || rawPayment.includes('TRANSFER')) {
      normalizedPaymentMethod = 'BANK';
    } else {
      normalizedPaymentMethod = 'CARD';
    }

    // The previous card path simulated an authorization but never contacted a
    // processor. Never create an order or mark it paid without real approval.
    if (normalizedPaymentMethod === 'CARD') {
      return NextResponse.json(
        { success: false, error: 'Online card payments are temporarily unavailable because a secure card processor is not configured. Choose mBoB, BNB, bank transfer, or cash on delivery.' },
        { status: 503 }
      );
    }

    if (['MBOB', 'BNB', 'BANK'].includes(normalizedPaymentMethod) && !String(body.mBOBTransactionRef || '').trim()) {
      const provider = normalizedPaymentMethod === 'BANK' ? 'bank' : normalizedPaymentMethod === 'BNB' ? 'BNB / mPay' : 'mBoB';
      return NextResponse.json(
        { success: false, error: `Enter the ${provider} transfer reference before placing your order.` },
        { status: 400 }
      );
    }
    if (['MBOB', 'BNB', 'BANK'].includes(normalizedPaymentMethod)) {
      body.mBOBTransactionRef = String(body.mBOBTransactionRef).trim();
      if (body.mBOBTransactionRef.length > 120) return NextResponse.json({ success: false, error: 'The transfer reference must be no more than 120 characters.' }, { status: 400 });
      const settings = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
      const gateways = (settings?.paymentGateways || {}) as Record<string, any>;
      const available = normalizedPaymentMethod === 'BANK'
        ? resolveBankTransferConfig(settings).enabled
        : normalizedPaymentMethod === 'MBOB'
          ? Boolean(gateways.mbob?.accountNumber || gateways.bob?.accountNumber || settings?.checkoutAccountNumber) && gateways.mbob?.enabled !== false
          : Boolean(gateways.bnb?.accountNumber) && gateways.bnb?.enabled !== false;
      if (!available) return NextResponse.json({ success: false, error: `${normalizedPaymentMethod} payment details are unavailable. Contact HAB before transferring money.` }, { status: 503 });
    }

    if (normalizedPaymentMethod === 'BANK') {
      const proof = String(body.proofUrl || '');
      if (!/^\/uploads\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp|pdf)$/i.test(proof)) {
        return NextResponse.json({ success: false, error: 'Upload your bank transfer receipt before placing the order.' }, { status: 400 });
      }
      try {
        if (!(await stat(path.join(process.cwd(), 'public', proof.slice(1)))).isFile()) throw new Error('Missing proof');
      } catch {
        return NextResponse.json({ success: false, error: 'Payment proof was not found. Please upload it again.' }, { status: 400 });
      }
    }

    let initialPaymentStatus: 'PAID' | 'PENDING' = 'PENDING';
    let initialOrderStatus: 'PROCESSING' | 'PENDING_PAYMENT' = 'PENDING_PAYMENT';
    let internalNotes = '';

    if (normalizedPaymentMethod === 'COD') {
      initialPaymentStatus = 'PENDING';
      initialOrderStatus = 'PROCESSING';
      internalNotes = '[CASH ON DELIVERY] Payment to be collected in cash or via mBoB upon courier arrival.';
    } else if (normalizedPaymentMethod === 'MBOB') {
      initialPaymentStatus = 'PENDING';
      initialOrderStatus = 'PENDING_PAYMENT';
      internalNotes = body.mBOBTransactionRef
        ? `[mBoB] Customer submitted Journal Ref: ${body.mBOBTransactionRef}. Verify with Bank of Bhutan before dispatch.`
        : '[mBoB] Awaiting mBoB journal confirmation.';
    } else if (normalizedPaymentMethod === 'BNB') {
      initialPaymentStatus = 'PENDING';
      initialOrderStatus = 'PENDING_PAYMENT';
      internalNotes = body.mBOBTransactionRef
        ? `[BNB / mPay] Customer submitted transfer Ref: ${body.mBOBTransactionRef}. Verify with Bhutan National Bank before dispatch.`
        : '[BNB / mPay] Awaiting bank transfer confirmation.';
    } else if (normalizedPaymentMethod === 'BANK') {
      initialPaymentStatus = 'PENDING';
      initialOrderStatus = 'PENDING_PAYMENT';
      internalNotes = `[BANK TRANSFER] Reference: ${String(body.mBOBTransactionRef).trim()}. Staff must verify the deposit against the bank before confirming payment.`;
    }

    if (customerFullName.length < 2 || customerFullName.length > 160 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || customerEmail.length > 254 ||
        typeof shippingAddress?.street !== 'string' || !shippingAddress.street.trim() || shippingAddress.street.length > 500) {
      return NextResponse.json({ success: false, error: 'Enter a recipient name, valid email, and physical delivery street address.' }, { status: 400 });
    }

    let session: any = null;
    try {
      session = await getSessionUser(req);
    } catch {}
    const isMember = Boolean(session && session.id);

    const quantities = new Map<string, number>();
    for (const item of items) {
      const code = String(item?.code || '').trim().toUpperCase();
      const quantity = Number(item?.quantity);
      if (!code || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000 || quantities.has(code)) {
        return NextResponse.json({ success: false, error: 'Each basket product must have a unique code and a valid positive quantity.' }, { status: 400 });
      }
      quantities.set(code, quantity);
    }

    let finalOrder: any;
    let subtotalUSD = 0;
    let shippingCostUSD = 0;
    let totalUSD = 0;
    let totalPaidCurrency = 0;
    let selectedOption = calculateShipping(0).ems;
    try {
      finalOrder = await prisma.$transaction(async (tx) => {
        const products = await tx.product.findMany({
          where: { code: { in: [...quantities.keys()] }, status: 'PUBLISHED' },
          select: { id: true, code: true, name: true, priceUSD: true },
        });
        if (products.length !== quantities.size) throw new CheckoutValidationError('One or more products are unavailable. Refresh your basket and try again.');
        const byCode = new Map(products.map(product => [product.code.toUpperCase(), product]));
        const resolvedItems = [...quantities].map(([code, quantity]) => {
          const product = byCode.get(code);
          if (!product || !Number.isFinite(product.priceUSD) || product.priceUSD < 0) throw new CheckoutValidationError(`Product ${code} is unavailable.`);
          return { productId: product.id, code: product.code, name: product.name, priceUSD: product.priceUSD, quantity };
        });
        const subtotalCents = resolvedItems.reduce((sum, item) => sum + Math.round(item.priceUSD * 100) * item.quantity, 0);
        if (!Number.isSafeInteger(subtotalCents)) throw new CheckoutValidationError('Order amount exceeds the checkout limit. Contact HAB for a wholesale order.');
        subtotalUSD = subtotalCents / 100;
        const shippingCalc = calculateShipping(subtotalUSD);
        selectedOption = isExpress ? shippingCalc.express : shippingCalc.ems;
        shippingCostUSD = selectedOption.costUSD;
        totalUSD = subtotalUSD + shippingCostUSD;
        totalPaidCurrency = currency === 'BTN' ? Math.round(totalUSD * rateApplied) : totalUSD;

        for (const item of resolvedItems) {
          const reserved = await tx.product.updateMany({
            where: { id: item.productId, status: 'PUBLISHED', stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (reserved.count !== 1) throw new CheckoutValidationError(`${item.name} no longer has enough stock. Refresh your basket.`);
        }

        return tx.order.create({
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

      });
    } catch (dbErr: any) {
      if (dbErr instanceof CheckoutValidationError) return NextResponse.json({ success: false, error: dbErr.message }, { status: 400 });
      console.error('[orders/route] Could not save order:', dbErr);
      return NextResponse.json({ success: false, error: 'Your order could not be saved. No order was placed; please try again later.' }, { status: 503 });
    }

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

    const [customerEmailDelivery, staffEmailDelivery] = await Promise.all([sendOrderConfirmationEmail({
      order: {
        ...finalOrder,
        carrier: selectedOption.name,
        trackingNumber: finalOrder.trackingNumber || systemTrackingNumber,
      },
      customerEmail,
      customerName: customerFullName,
      siteUrl: req.nextUrl.origin,
    }), notifyStaff({ title: 'Order received', entityType: 'Order', id: finalOrder.id, reference: finalOrder.orderNumber, adminPath: '/admin/orders', siteUrl: req.nextUrl.origin })]);

    return NextResponse.json({
      success: true,
      emailDelivery: { customer: customerEmailDelivery, staff: staffEmailDelivery },
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
