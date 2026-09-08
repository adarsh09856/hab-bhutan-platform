import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'reports:view');

    const [
      orders,
      pendingOrdersCount,
      lowStockProducts,
      pendingApplicationsCount,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          orderItems: {
            select: { code: true, name: true, quantity: true },
          },
        },
      }),
      prisma.order.count({
        where: {
          orderStatus: { in: ['PENDING_PAYMENT', 'PROCESSING'] },
        },
      }),
      prisma.product.count({
        where: {
          stock: { lt: 3 },
          status: 'PUBLISHED',
        },
      }),
      prisma.membershipApplication.count({
        where: {
          status: { in: ['PENDING', 'UNDER_REVIEW'] },
        },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Compute gross online sales
    const allCompletedOrders = await prisma.order.findMany({
      where: {
        orderStatus: { notIn: ['CANCELLED'] },
        paymentStatus: 'PAID',
      },
      select: {
        totalUSD: true,
        totalPaidCurrency: true,
        currencyUsed: true,
      },
    });

    const totalSalesUSD = allCompletedOrders.reduce((sum, o) => sum + (o.totalUSD || 0), 0);
    const totalSalesBTN = allCompletedOrders.reduce((sum, o) => {
      if (o.currencyUsed === 'BTN') return sum + (o.totalPaidCurrency || 0);
      return sum + Math.round((o.totalUSD || 0) * 84.0);
    }, 0);

    return NextResponse.json({
      success: true,
      metrics: {
        totalSalesUSD,
        totalSalesBTN,
        pendingOrdersCount,
        lowStockCount: lowStockProducts,
        pendingApplicationsCount,
      },
      recentOrders: orders.slice(0, 5).map((o) => ({
        id: o.orderNumber,
        customer: `${o.customerName} (${o.customerType})`,
        items: o.orderItems.map((oi) => `${oi.code} × ${oi.quantity}`).join(', ') || 'Craft items',
        total: o.currencyUsed === 'BTN' ? `Nu. ${o.totalPaidCurrency.toLocaleString()}` : `$${o.totalUSD.toFixed(2)}`,
        method: o.shippingMethod,
        status: `${o.paymentStatus} · ${o.orderStatus}`,
        createdAt: o.createdAt,
      })),
      recentAuditLogs: recentAuditLogs.map((log) => ({
        id: log.id,
        actor: log.actorIdentifier,
        role: log.actorType,
        action: log.action,
        target: `${log.entityType}: ${log.entityId}`,
        createdAt: log.createdAt,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching dashboard data:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching dashboard data.' },
      { status: err.statusCode || 500 }
    );
  }
}
