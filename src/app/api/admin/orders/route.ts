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
      items, // [{ code, quantity, priceUSD }]
    } = body;

    if (!customerName || !customerEmail || !items || !items.length) {
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

        // Atomic inventory decrement
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: qty } },
        });
      }

      // 2. Shipping calculation
      const shippingCalc = calculateShipping(subtotalUSD);
      const isExpress = shippingMethod === 'EXPRESS';
      const shippingFeeUSD = isExpress ? shippingCalc.express.costUSD : shippingCalc.ems.costUSD;
      const totalUSD = subtotalUSD + shippingFeeUSD;
      const totalPaidCurrency = currency === 'BTN' ? Math.round(totalUSD * fxRate) : totalUSD;

      const orderNumber = `HAB-M-${Math.floor(10000 + Math.random() * 90000)}`;

      // 3. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerType: customerType || 'GUEST',
          customerMemberId: customerMemberId || null,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          shippingAddress: shippingAddress || {},
          shippingMethod: isExpress ? 'EXPRESS' : 'EMS',
          shippingFeeUSD,
          paymentMethod: paymentMethod || 'CARD',
          paymentStatus: paymentStatus || 'PAID',
          orderStatus: orderStatus || 'PROCESSING',
          currencyUsed: currency,
          fxRateAtPurchase: fxRate,
          totalUSD,
          totalPaidCurrency,
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
      action: 'MANUAL_ORDER_CREATED',
      entityType: 'Order',
      entityId: result.id,
      details: {
        orderNumber: result.orderNumber,
        customerEmail: result.customerEmail,
        totalUSD: result.totalUSD,
        itemsCount: items.length,
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

    // If cancelling, execute atomic stock restoration
    let updated;
    if (orderStatus === 'CANCELLED' && previous.orderStatus !== 'CANCELLED') {
      if (!cancellationReason && !notes) {
        return NextResponse.json(
          { success: false, error: 'A cancellation reason or note is required when cancelling an order.' },
          { status: 400 }
        );
      }

      updated = await prisma.$transaction(async (tx) => {
        // Return inventory for each order line item
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
    } else {
      const updateData: any = {};
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
      if (shippingAddress) updateData.shippingAddress = shippingAddress;

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
      action: orderStatus === 'CANCELLED' ? 'ORDER_CANCELLED' : 'ORDER_UPDATED',
      entityType: 'Order',
      entityId: id,
      details: {
        orderNumber: updated.orderNumber,
        previousStatus: previous.orderStatus,
        newStatus: updated.orderStatus,
        trackingNumber: updated.trackingNumber,
        reason: cancellationReason || notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      order: updated,
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
