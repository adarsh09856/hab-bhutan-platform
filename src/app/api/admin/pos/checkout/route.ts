import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { getEffectiveFxRate } from '@/lib/fx';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'orders:create');
    const ip = getClientIp(req);
    const body = await req.json();

    const {
      items,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      tenderedAmount,
      changeAmount,
      paymentRef,
      currencyUsed = 'BTN',
      notes,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one item is required for counter sale.' },
        { status: 400 }
      );
    }

    const fxInfo = await getEffectiveFxRate();
    const fxRate = fxInfo.rate || 84.0;
    const currency = currencyUsed === 'BTN' ? 'BTN' : 'USD';

    // Transaction to validate stock, decrement inventory, and record order atomically
    const order = await prisma.$transaction(async (tx) => {
      let subtotalUSD = 0;
      const validatedItems: Array<{
        productId: string;
        code: string;
        name: string;
        priceUSD: number;
        quantity: number;
      }> = [];

      for (const item of items) {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.name || item.code}`);
        }

        if (product.stock < qty) {
          throw new Error(
            `Insufficient stock for "${product.name}". In stock: ${product.stock}, Requested: ${qty}`
          );
        }

        // Decrement stock atomically
        const updateResult = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });

        if (updateResult.count === 0) {
          throw new Error(`Concurrency conflict: Failed to reserve stock for "${product.name}".`);
        }

        const priceUSD = product.priceUSD;
        subtotalUSD += priceUSD * qty;

        validatedItems.push({
          productId: product.id,
          code: product.code,
          name: product.name,
          priceUSD,
          quantity: qty,
        });
      }

      const totalUSD = subtotalUSD;
      const totalPaidCurrency = currency === 'BTN' ? Math.round(totalUSD * fxRate) : totalUSD;
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderNumber = `POS-${dateStr}-${randomSuffix}`;

      const mappedPaymentMethod = paymentMethod === 'MBOB' ? 'MBOB' : paymentMethod === 'CARD' ? 'CARD' : 'COD';

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerType: 'GUEST',
          customerName: customerName ? customerName.trim() : 'Counter Walk-in Customer',
          customerEmail: customerEmail ? customerEmail.trim() : 'pos-counter@hab.bt',
          customerPhone: customerPhone ? customerPhone.trim() : null,
          shippingAddress: {
            channel: 'ONLINE_POS',
            counterLocation: 'HAB Central Outlet · Norzin Lam, Thimphu',
            cashierName: session.name || session.email,
            cashierEmail: session.email,
            tenderedAmount: tenderedAmount || totalPaidCurrency,
            changeAmount: changeAmount || 0,
            paymentRef: paymentRef || 'COUNTER_CASH',
            originalTender: paymentMethod,
          },
          shippingMethod: 'EXPRESS',
          shippingFeeUSD: 0,
          paymentMethod: mappedPaymentMethod,
          paymentStatus: 'PAID',
          orderStatus: 'DELIVERED',
          currencyUsed: currency,
          fxRateAtPurchase: fxRate,
          totalUSD,
          totalPaidCurrency,
          internalNotes: `Online Counter POS Sale completed by ${session.email}. Tender: ${paymentMethod}. Ref: ${paymentRef || 'N/A'}. Tendered: ${tenderedAmount || totalPaidCurrency}. Change: ${changeAmount || 0}.${notes ? ` Notes: ${notes}` : ''}`,
          items: validatedItems.map((vi) => ({
            code: vi.code,
            name: vi.name,
            priceUSD: vi.priceUSD,
            quantity: vi.quantity,
          })),
        },
      });

      for (const vi of validatedItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: vi.productId,
            code: vi.code,
            name: vi.name,
            priceUSD: vi.priceUSD,
            quantity: vi.quantity,
          },
        });
      }

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'POS_CHECKOUT_COMPLETED',
        entityType: 'Order',
        entityId: newOrder.id,
        details: {
          orderNumber,
          totalUSD,
          totalPaidCurrency,
          currency,
          paymentMethod,
          itemsCount: validatedItems.length,
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    console.error('POS checkout error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Counter checkout transaction failed.' },
      { status: 400 }
    );
  }
}
