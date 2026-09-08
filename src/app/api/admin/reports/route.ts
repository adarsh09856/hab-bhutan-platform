import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'reports:view');

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    const range = searchParams.get('range') || 'all';

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();
    if (range === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { createdAt: { gte: startOfDay } };
    } else if (range === '7d') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: sevenDaysAgo } };
    } else if (range === '30d') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: thirtyDaysAgo } };
    } else if (range === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { gte: startOfMonth } };
    }

    const [orders, projects, crafts, members, verifiedMembersCount] = await Promise.all([
      prisma.order.findMany({
        where: dateFilter,
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  maker: true,
                  craft: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.projectRecord.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.craft.findMany({ select: { key: true, name: true, english: true } }),
      prisma.member.findMany({ select: { id: true, name: true, regNumber: true, dzongkhag: true, craftKey: true } }),
      prisma.member.count({ where: { status: 'VERIFIED' } }),
    ]);

    const grossVolumeUSD = orders.reduce((sum, o) => sum + (o.totalUSD || 0), 0);
    const artisanShareUSD = grossVolumeUSD * 0.8; // 80% pass-through to artisan
    const associationShareUSD = grossVolumeUSD * 0.2; // 20% HAB association consignment commission
    const duesCollectedBTN = verifiedMembersCount * 1200;

    // Craft map lookup
    const craftLookup = new Map<string, { name: string; english: string }>();
    crafts.forEach((c) => craftLookup.set(c.key, { name: c.name, english: c.english }));

    // Member map lookup
    const memberLookup = new Map<string, { name: string; regNumber: string; dzongkhag: string; craftKey: string }>();
    members.forEach((m) => memberLookup.set(m.id, { name: m.name, regNumber: m.regNumber, dzongkhag: m.dzongkhag, craftKey: m.craftKey }));

    // Aggregate sales by craft category
    const craftSalesMap: Record<string, {
      key: string;
      name: string;
      english: string;
      units: number;
      grossUSD: number;
      artisanShareUSD: number;
      associationShareUSD: number;
    }> = {};

    // Aggregate sales by artisan / member
    const artisanSalesMap: Record<string, {
      memberId: string;
      name: string;
      regNumber: string;
      dzongkhag: string;
      craftKey: string;
      units: number;
      grossUSD: number;
      payoutUSD: number;
      payoutBTN: number;
    }> = {};

    // Daily volume trend
    const dailyTrendsMap: Record<string, { date: string; volumeUSD: number; orderCount: number }> = {};

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().slice(0, 10);
      if (!dailyTrendsMap[dateKey]) {
        dailyTrendsMap[dateKey] = { date: dateKey, volumeUSD: 0, orderCount: 0 };
      }
      dailyTrendsMap[dateKey].volumeUSD += order.totalUSD || 0;
      dailyTrendsMap[dateKey].orderCount += 1;

      // Check normalized orderItems first
      if (order.orderItems && order.orderItems.length > 0) {
        for (const item of order.orderItems) {
          const qty = Number(item.quantity || 1);
          const itemTotalUSD = Number(item.priceUSD || 0) * qty;

          // Craft attribution
          const cKey = item.product?.craftKey || (item.code ? item.code.slice(0, 3).toLowerCase() : 'other');
          if (!craftSalesMap[cKey]) {
            const meta = craftLookup.get(cKey) || { name: cKey.toUpperCase(), english: 'Traditional Handicraft' };
            craftSalesMap[cKey] = {
              key: cKey,
              name: meta.name,
              english: meta.english,
              units: 0,
              grossUSD: 0,
              artisanShareUSD: 0,
              associationShareUSD: 0,
            };
          }
          craftSalesMap[cKey].units += qty;
          craftSalesMap[cKey].grossUSD += itemTotalUSD;
          craftSalesMap[cKey].artisanShareUSD += itemTotalUSD * 0.8;
          craftSalesMap[cKey].associationShareUSD += itemTotalUSD * 0.2;

          // Artisan attribution
          const makerId = item.product?.makerMemberId;
          if (makerId && memberLookup.has(makerId)) {
            const m = memberLookup.get(makerId)!;
            if (!artisanSalesMap[makerId]) {
              artisanSalesMap[makerId] = {
                memberId: makerId,
                name: m.name,
                regNumber: m.regNumber,
                dzongkhag: m.dzongkhag,
                craftKey: m.craftKey,
                units: 0,
                grossUSD: 0,
                payoutUSD: 0,
                payoutBTN: 0,
              };
            }
            artisanSalesMap[makerId].units += qty;
            artisanSalesMap[makerId].grossUSD += itemTotalUSD;
            artisanSalesMap[makerId].payoutUSD += itemTotalUSD * 0.8;
            artisanSalesMap[makerId].payoutBTN += itemTotalUSD * 0.8 * (order.fxRateAtPurchase || 84.0);
          }
        }
      } else {
        // Fallback to order.items snapshot
        const items = (order.items as any[]) || [];
        for (const item of items) {
          const qty = Number(item.quantity || 1);
          const itemTotalUSD = Number(item.priceUSD || 0) * qty;
          const cKey = item.code ? item.code.slice(0, 3).toLowerCase() : 'other';

          if (!craftSalesMap[cKey]) {
            const meta = craftLookup.get(cKey) || { name: cKey.toUpperCase(), english: 'Traditional Handicraft' };
            craftSalesMap[cKey] = {
              key: cKey,
              name: meta.name,
              english: meta.english,
              units: 0,
              grossUSD: 0,
              artisanShareUSD: 0,
              associationShareUSD: 0,
            };
          }
          craftSalesMap[cKey].units += qty;
          craftSalesMap[cKey].grossUSD += itemTotalUSD;
          craftSalesMap[cKey].artisanShareUSD += itemTotalUSD * 0.8;
          craftSalesMap[cKey].associationShareUSD += itemTotalUSD * 0.2;
        }
      }
    }

    const craftSalesList = Object.values(craftSalesMap).sort((a, b) => b.grossUSD - a.grossUSD);
    const artisanSalesList = Object.values(artisanSalesMap).sort((a, b) => b.grossUSD - a.grossUSD);
    const dailyTrendsList = Object.values(dailyTrendsMap).sort((a, b) => b.date.localeCompare(a.date));

    if (format === 'csv') {
      const rows: string[][] = [
        ['HANDICRAFTS ASSOCIATION OF BHUTAN - OFFICIAL FINANCIAL RECONCILIATION STATEMENT'],
        ['Generated At', new Date().toISOString()],
        ['Reporting Period', range.toUpperCase()],
        [],
        ['=== 1. EXECUTIVE SUMMARY METRICS ==='],
        ['Metric', 'Value USD', 'Value BTN (Approx 84 FX)', 'Notes'],
        ['Total Orders Processed', orders.length.toString(), '', ''],
        ['Gross E-Commerce Volume', grossVolumeUSD.toFixed(2), (grossVolumeUSD * 84).toFixed(2), 'Online sales checkout canonical USD'],
        ['Est. Artisan Share (80% Provisional)*', artisanShareUSD.toFixed(2), (artisanShareUSD * 84).toFixed(2), 'Disbursed to member craftspeople'],
        ['HAB Retained Operating Revenue (20%)', associationShareUSD.toFixed(2), (associationShareUSD * 84).toFixed(2), 'Consignment commission retained by HAB'],
        ['Verified Members Annual Dues', '', duesCollectedBTN.toString(), `${verifiedMembersCount} active registered members`],
        [],
        ['=== 2. CRAFT CATEGORY SALES BREAKDOWN ==='],
        ['Craft Key', 'Dzongkha/Traditional Name', 'English Name', 'Units Sold', 'Gross Sales (USD)', '80% Artisan Share (USD)', '20% HAB Commission (USD)'],
        ...craftSalesList.map((c) => [
          c.key,
          `"${c.name}"`,
          `"${c.english}"`,
          c.units.toString(),
          c.grossUSD.toFixed(2),
          c.artisanShareUSD.toFixed(2),
          c.associationShareUSD.toFixed(2),
        ]),
        [],
        ['=== 3. ARTISAN CONSIGNMENT PAYOUT LEDGER ==='],
        ['Artisan Name', 'Reg Number', 'Dzongkhag', 'Craft', 'Units Sold', 'Gross Sales (USD)', 'Payout Due (USD)', 'Payout Due (BTN)'],
        ...artisanSalesList.map((a) => [
          `"${a.name}"`,
          a.regNumber,
          a.dzongkhag,
          a.craftKey,
          a.units.toString(),
          a.grossUSD.toFixed(2),
          a.payoutUSD.toFixed(2),
          a.payoutBTN.toFixed(2),
        ]),
        [],
        ['=== 4. ORDER TRANSACTIONS AUDIT LOG ==='],
        ['Order Number', 'Date', 'Status', 'Payment Method', 'Customer Email', 'Gross USD', 'Currency', 'Tracking Number'],
        ...orders.map((o) => [
          o.orderNumber,
          o.createdAt.toISOString().slice(0, 10),
          o.orderStatus,
          o.paymentMethod,
          o.customerEmail,
          o.totalUSD.toFixed(2),
          o.currencyUsed,
          o.trackingNumber || '',
        ]),
        [],
        ['=== 5. BILATERAL DONOR & SECTOR PROJECTS ==='],
        ['Project Name', 'Partner', 'Budget', 'Period', 'Status', 'Milestone %'],
        ...projects.map((p) => [
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.partner.replace(/"/g, '""')}"`,
          `"${p.budget.replace(/"/g, '""')}"`,
          p.period,
          p.status,
          `${p.progressPercent || 0}%`,
        ]),
        [],
        ['# Note: The 80% artisan / 20% association consignment revenue split is provisional and subject to formal HAB Secretariat ratification prior to commercial operations.'],
      ];

      const csvContent = rows.map((r) => r.join(',')).join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="hab-financial-statement-${range}-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      range,
      metrics: {
        totalOrdersCount: orders.length,
        grossVolumeUSD,
        artisanShareUSD,
        associationShareUSD,
        artisanShareDescription: 'Est. Artisan Share (80% provisional)* — subject to formal HAB Secretariat ratification',
        duesCollectedBTN,
        activeMembersCount: verifiedMembersCount,
      },
      craftSales: craftSalesList,
      artisanSales: artisanSalesList,
      dailyTrends: dailyTrendsList,
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

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'projects:create');
    const body = await req.json();
    const {
      name,
      partner,
      period,
      budget,
      progressPercent,
      summary,
      activities,
      results,
      status,
    } = body;

    if (!name || !partner || !budget) {
      return NextResponse.json(
        { success: false, error: 'Project name, partner/donor, and budget are required.' },
        { status: 400 }
      );
    }

    const project = await prisma.projectRecord.create({
      data: {
        name: name.trim(),
        partner: partner.trim(),
        period: period?.trim() || '2025–2027',
        budget: budget.trim(),
        progressPercent: progressPercent !== undefined ? Number(progressPercent) : 10,
        summary: summary?.trim() || 'Donor-funded handicrafts sector capacity development project.',
        activities: Array.isArray(activities) ? activities : [],
        results: Array.isArray(results) ? results : [],
        status: status || 'current',
      },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'PROJECT_RECORD_CREATED',
      entityType: 'ProjectRecord',
      entityId: project.id,
      details: { name: project.name, partner: project.partner, budget: project.budget },
    });

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    console.error('Error creating donor project:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error creating donor project.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'projects:edit');
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Project ID is required.' }, { status: 400 });
    }

    const project = await prisma.projectRecord.update({
      where: { id },
      data,
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'PROJECT_RECORD_UPDATED',
      entityType: 'ProjectRecord',
      entityId: project.id,
      details: { updatedFields: Object.keys(data) },
    });

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    console.error('Error updating donor project:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating donor project.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'projects:delete');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Project ID is required.' }, { status: 400 });
    }

    const project = await prisma.projectRecord.delete({ where: { id } });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'PROJECT_RECORD_DELETED',
      entityType: 'ProjectRecord',
      entityId: id,
      details: { name: project.name },
    });

    return NextResponse.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting donor project:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error deleting donor project.' },
      { status: err.statusCode || 500 }
    );
  }
}
