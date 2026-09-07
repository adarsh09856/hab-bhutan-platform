import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'orders:view');

    const orders = await prisma.order.findMany({
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

export async function PATCH(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'orders:fulfill');
    const body = await req.json();
    const { id, orderStatus, trackingNumber, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order id is required.' },
        { status: 400 }
      );
    }

    const previous = await prisma.order.findUnique({ where: { id } });
    if (!previous) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'ORDER_FULFILLMENT_UPDATED',
      entityType: 'Order',
      entityId: id,
      details: {
        orderNumber: updated.orderNumber,
        previousStatus: previous.orderStatus,
        newStatus: updated.orderStatus,
        trackingNumber: updated.trackingNumber,
        notes: notes || null,
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
