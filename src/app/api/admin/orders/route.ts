import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { calculateShipping } from '@/lib/shipping';
import { getEffectiveFxRate } from '@/lib/fx';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'orders:view');

    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              select: { id: true, code: true, name: true, priceUSD: true, stock: true },
            },
          },
        },
        customerMember: {
          select: { id: true, name: true, regNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err: any) {
    console.error('Error fetching admin orders:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching orders.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'orders:create');
    const body = await req.json();
    const {
      customerType,
      customerMemberId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      paymentStatus,
      orderStatus,
      currencyUsed,
      internalNotes,
      items, // [{ code, quantity, priceUSD }]
    } = body;

    const isWalkIn = customerType === 'WALK_IN_POS' || shippingMethod === 'WALK_IN';
    const effectiveCustomerName = customerName || (isWalkIn ? 'Walk-in Customer' : '');
    const effectiveCustomerEmail = customerEmail || (isWalkIn ? 'pos@hab.org.bt' : '');

    if (!effectiveCustomerName || !effectiveCustomerEmail || !items || !items.length) {
      return NextResponse.json(
        { success: false, error: 'Customer name, email, and at least one order line item are required.' },
        { status: 400 }
      );
    }

    const fxInfo = await getEffectiveFxRate();
    const fxRate = fxInfo.rate || 84.0;
    const currency = currencyUsed === 'BTN' ? 'BTN' : 'USD';

    // Execute order creation and atomic inventory decrement in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify products & check inventory
      const resolvedItems: Array<{
        product: any;
        quantity: number;
        priceUSD: number;
        code: string;
        name: string;
      }> = [];

      let subtotalUSD = 0;

      for (const item of items) {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const product = await tx.product.findFirst({
          where: {
            OR: [
              { code: item.code },
              ...(item.productId ? [{ id: item.productId }] : []),
            ],
          },
        });

        if (!product) {
          throw new Error(`Product not found for code '${item.code}'.`);
        }

        if (product.stock < qty) {
          throw new Error(`Insufficient inventory for '${product.name}' (${product.code}). In stock: ${product.stock}, requested: ${qty}.`);
        }

        const price = item.priceUSD !== undefined ? Number(item.priceUSD) : product.priceUSD;
        subtotalUSD += price * qty;

        resolvedItems.push({
          product,
          quantity: qty,
          priceUSD: price,
          code: product.code,
          name: product.name,
        });

        // Atomic inventory decrement with concurrency protection
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
          throw new Error(`Insufficient stock for product '${product.name}': only ${product.stock} available.`);
        }
      }

      // 2. Shipping calculation
      let shippingFeeUSD = 0;
      let effectiveShippingMethod: 'EMS' | 'EXPRESS' = 'EMS';

      if (isWalkIn || shippingMethod === 'NONE') {
        shippingFeeUSD = 0;
        effectiveShippingMethod = 'EMS';
      } else {
        const shippingCalc = calculateShipping(subtotalUSD);
        const isExpress = shippingMethod === 'EXPRESS';
        shippingFeeUSD = isExpress ? shippingCalc.express.costUSD : shippingCalc.ems.costUSD;
        effectiveShippingMethod = isExpress ? 'EXPRESS' : 'EMS';
      }

      const totalUSD = subtotalUSD + shippingFeeUSD;
      const totalPaidCurrency = currency === 'BTN' ? Math.round(totalUSD * fxRate) : totalUSD;

      const orderNumber = isWalkIn
        ? `HAB-POS-${Math.floor(10000 + Math.random() * 90000)}`
        : `HAB-M-${Math.floor(10000 + Math.random() * 90000)}`;

      const mappedPaymentMethod: 'CARD' | 'MBOB' | 'BANK' = 
        paymentMethod === 'MBOB' ? 'MBOB' : paymentMethod === 'CARD' ? 'CARD' : 'BANK';

      const mappedCustomerType: 'STAFF' | 'MEMBER' | 'GUEST' | 'SYSTEM' =
        customerType === 'STAFF' ? 'STAFF' : customerType === 'MEMBER' ? 'MEMBER' : 'GUEST';

      // 3. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerType: mappedCustomerType,
          customerMemberId: customerMemberId || null,
          customerName: effectiveCustomerName,
          customerEmail: effectiveCustomerEmail,
          customerPhone: customerPhone || null,
          shippingAddress: shippingAddress || (isWalkIn ? { type: 'WALK_IN_POS_STORE_SALE', location: 'HAB Showroom, Thimphu', originalPaymentMethod: paymentMethod } : {}),
          shippingMethod: effectiveShippingMethod,
          shippingFeeUSD,
          paymentMethod: mappedPaymentMethod,
          paymentStatus: paymentStatus || 'PAID',
          orderStatus: orderStatus || (isWalkIn ? 'DELIVERED' : 'PROCESSING'),
          currencyUsed: currency,
          fxRateAtPurchase: fxRate,
          totalUSD,
          totalPaidCurrency,
          internalNotes: internalNotes || null,
          items: resolvedItems.map((ri) => ({
            code: ri.code,
            name: ri.name,
            priceUSD: ri.priceUSD,
            quantity: ri.quantity,
          })),
        },
      });

      // 4. Create normalized OrderItem rows
      for (const ri of resolvedItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: ri.product.id,
            code: ri.code,
            name: ri.name,
            priceUSD: ri.priceUSD,
            quantity: ri.quantity,
          },
        });
      }

      return newOrder;
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: isWalkIn ? 'POS_SALE_COMPLETED' : 'MANUAL_ORDER_CREATED',
      entityType: 'Order',
      entityId: result.id,
      details: {
        orderNumber: result.orderNumber,
        customerEmail: result.customerEmail,
        totalUSD: result.totalUSD,
        totalPaidCurrency: result.totalPaidCurrency,
        currencyUsed: result.currencyUsed,
        itemsCount: items.length,
        paymentMethod: result.paymentMethod,
      },
    });

    return NextResponse.json({
      success: true,
      order: result,
    });
  } catch (err: any) {
    console.error('Error creating manual order:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error creating manual order.' },
      { status: err.statusCode || 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      orderStatus,
      paymentStatus,
      trackingNumber,
      customerPhone,
      shippingAddress,
      cancellationReason,
      notes,
      internalNotes,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order id is required.' },
        { status: 400 }
      );
    }

    const previous = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!previous) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    // Permission enforcement
    let session;
    if (orderStatus === 'CANCELLED') {
      session = await requirePermission(req, 'orders:cancel');
    } else if (orderStatus === 'REFUNDED' || paymentStatus === 'REFUNDED') {
      session = await requirePermission(req, 'orders:refund');
    } else if (orderStatus === 'SHIPPED' || orderStatus === 'DELIVERED') {
      session = await requirePermission(req, 'orders:fulfill');
    } else {
      session = await requirePermission(req, 'orders:edit');
    }

    // If cancelling, validate status transitions and execute atomic stock restoration
    let updated;
    let refundNote: string | undefined;

    if (orderStatus === 'CANCELLED') {
      if (previous.orderStatus === 'CANCELLED') {
        return NextResponse.json(
          { success: false, error: 'Order is already cancelled.' },
          { status: 400 }
        );
      }

      if (['SHIPPED', 'DELIVERED'].includes(previous.orderStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot cancel an order that has already shipped or been delivered. Process a return/refund instead, which does not automatically restock without a physical return confirmation.',
          },
          { status: 400 }
        );
      }

      if (!cancellationReason && !notes) {
        return NextResponse.json(
          { success: false, error: 'A cancellation reason or note is required when cancelling an order.' },
          { status: 400 }
        );
      }

      updated = await prisma.$transaction(async (tx) => {
        // Return inventory for each order line item (only valid for PENDING_PAYMENT, PAID, or PROCESSING)
        if (previous.orderItems && previous.orderItems.length > 0) {
          for (const item of previous.orderItems) {
            if (item.productId) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
        }

        return tx.order.update({
          where: { id },
          data: {
            orderStatus: 'CANCELLED',
            trackingNumber: trackingNumber !== undefined ? trackingNumber : previous.trackingNumber,
          },
        });
      });
    } else if (orderStatus === 'REFUNDED' || paymentStatus === 'REFUNDED') {
      const shouldRestock = body.restock === true;
      if (shouldRestock) {
        updated = await prisma.$transaction(async (tx) => {
          if (previous.orderItems && previous.orderItems.length > 0) {
            for (const item of previous.orderItems) {
              if (item.productId) {
                await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { increment: item.quantity } },
                });
              }
            }
          }

          const updateData: any = {};
          if (orderStatus) updateData.orderStatus = orderStatus;
          if (paymentStatus) updateData.paymentStatus = paymentStatus;
          return tx.order.update({
            where: { id },
            data: updateData,
          });
        });
        refundNote = 'Order marked refunded and physical inventory restocked pursuant to verified secretariat return.';
      } else {
        const updateData: any = {};
        if (orderStatus) updateData.orderStatus = orderStatus;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        updated = await prisma.order.update({
          where: { id },
          data: updateData,
        });
        refundNote = 'Order marked refunded. Physical inventory has not been restocked (set restock: true once goods are physically verified at the secretariat).';
      }
    } else {
      const updateData: any = {};
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
      if (shippingAddress) updateData.shippingAddress = shippingAddress;
      if (internalNotes !== undefined || notes !== undefined) {
        updateData.internalNotes = internalNotes !== undefined ? internalNotes : notes;
      }

      updated = await prisma.order.update({
        where: { id },
        data: updateData,
      });
    }

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: orderStatus === 'CANCELLED' ? 'ORDER_CANCELLED' : orderStatus === 'REFUNDED' || paymentStatus === 'REFUNDED' ? 'ORDER_REFUNDED' : 'ORDER_UPDATED',
      entityType: 'Order',
      entityId: id,
      details: {
        orderNumber: updated.orderNumber,
        previousStatus: previous.orderStatus,
        newStatus: updated.orderStatus,
        trackingNumber: updated.trackingNumber,
        reason: cancellationReason || notes || null,
        refundPolicy: refundNote || null,
      },
    });

    return NextResponse.json({
      success: true,
      order: updated,
      ...(refundNote ? { note: refundNote } : {}),
    });
  } catch (err: any) {
    console.error('Error updating order:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating order.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Financial and trade regulations prohibit hard-deleting customer orders. Orders must be cancelled or refunded to maintain the immutable audit trail.',
    },
    { status: 405 }
  );
}
