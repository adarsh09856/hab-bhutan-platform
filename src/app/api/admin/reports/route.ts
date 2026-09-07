import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'reports:view');

    const [orders, projects, membersCount] = await Promise.all([
      prisma.order.findMany(),
      prisma.projectRecord.findMany(),
      prisma.member.count({ where: { status: 'VERIFIED' } }),
    ]);

    const grossVolumeUSD = orders.reduce((sum, o) => sum + o.totalUSD, 0);
    const artisanShareUSD = grossVolumeUSD * 0.8; // 80% pass-through

    // Aggregate sales by craft from order item snapshots
    const craftSalesMap: Record<string, { units: number; grossUSD: number }> = {};

    for (const order of orders) {
      const items = (order.items as any[]) || [];
      for (const item of items) {
        const key = item.code?.slice(0, 3) || 'OTHER';
        if (!craftSalesMap[key]) {
          craftSalesMap[key] = { units: 0, grossUSD: 0 };
        }
        craftSalesMap[key].units += Number(item.quantity || 1);
        craftSalesMap[key].grossUSD += Number(item.priceUSD || 0) * Number(item.quantity || 1);
      }
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalOrdersCount: orders.length,
        grossVolumeUSD,
        artisanShareUSD,
        duesCollectedBTN: membersCount * 5000,
        activeMembersCount: membersCount,
      },
      craftSales: craftSalesMap,
      donorProjects: projects,
    });
  } catch (err: any) {
    console.error('Error fetching admin reports:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching reports.' },
      { status: err.statusCode || 500 }
    );
  }
}
