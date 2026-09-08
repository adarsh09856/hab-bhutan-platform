import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'reports:view');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    
    // Start of this week (Monday)
    const dayOfWeek = now.getDay() || 7;
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setHours(0, 0, 0, 0);
    startOfThisWeek.setDate(now.getDate() - dayOfWeek + 1);
    
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    // Start of this month and last month
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 48 hours ago for attention threshold
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const [
      orders,
      pendingFulfillmentCount,
      attentionOrders,
      lowStockProducts,
      outOfStockProducts,
      pendingApplicationsCount,
      recentlyApprovedMembersCount,
      totalActiveMembersCount,
      latestNews,
      latestPublication,
      recentAuditLogs,
      paidOrders,
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
          orderStatus: { in: ['PAID', 'PROCESSING'] },
        },
      }),
      prisma.order.count({
        where: {
          OR: [
            { paymentStatus: 'FAILED' },
            { 
              orderStatus: 'PROCESSING',
              createdAt: { lt: fortyEightHoursAgo },
            },
          ],
        },
      }),
      prisma.product.count({
        where: {
          stock: { gt: 0, lt: 3 },
          status: 'PUBLISHED',
        },
      }),
      prisma.product.count({
        where: {
          stock: 0,
          status: 'PUBLISHED',
        },
      }),
      prisma.membershipApplication.count({
        where: {
          status: { in: ['PENDING', 'UNDER_REVIEW'] },
        },
      }),
      prisma.member.count({
        where: {
          status: 'VERIFIED',
          createdAt: { gte: startOfThisMonth },
        },
      }),
      prisma.member.count({
        where: {
          status: 'VERIFIED',
        },
      }),
      prisma.newsArticle.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { title: true, createdAt: true },
      }),
      prisma.publication.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { title: true, createdAt: true },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      prisma.order.findMany({
        where: {
          orderStatus: { notIn: ['CANCELLED'] },
          paymentStatus: 'PAID',
        },
        select: {
          totalUSD: true,
          totalPaidCurrency: true,
          currencyUsed: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate revenue buckets
    const sumUSD = (arr: typeof paidOrders) => arr.reduce((acc, o) => acc + (o.totalUSD || 0), 0);
    const sumBTN = (arr: typeof paidOrders) => arr.reduce((acc, o) => {
      if (o.currencyUsed === 'BTN') return acc + (o.totalPaidCurrency || 0);
      return acc + Math.round((o.totalUSD || 0) * 84.0);
    }, 0);

    const todayOrders = paidOrders.filter(o => new Date(o.createdAt) >= startOfToday);
    const thisWeekOrders = paidOrders.filter(o => new Date(o.createdAt) >= startOfThisWeek);
    const lastWeekOrders = paidOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= startOfLastWeek && d < startOfThisWeek;
    });
    const thisMonthOrders = paidOrders.filter(o => new Date(o.createdAt) >= startOfThisMonth);
    const lastMonthOrders = paidOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= startOfLastMonth && d < startOfThisMonth;
    });

    const salesTodayUSD = sumUSD(todayOrders);
    const salesTodayBTN = sumBTN(todayOrders);

    const salesThisWeekUSD = sumUSD(thisWeekOrders);
    const salesThisWeekBTN = sumBTN(thisWeekOrders);
    const salesLastWeekUSD = sumUSD(lastWeekOrders);

    const salesThisMonthUSD = sumUSD(thisMonthOrders);
    const salesThisMonthBTN = sumBTN(thisMonthOrders);
    const salesLastMonthUSD = sumUSD(lastMonthOrders);

    const totalSalesUSD = sumUSD(paidOrders);
    const totalSalesBTN = sumBTN(paidOrders);

    // Trends (% change vs previous period)
    const weekTrendPct = salesLastWeekUSD > 0 
      ? Math.round(((salesThisWeekUSD - salesLastWeekUSD) / salesLastWeekUSD) * 100)
      : salesThisWeekUSD > 0 ? 100 : 0;

    const monthTrendPct = salesLastMonthUSD > 0 
      ? Math.round(((salesThisMonthUSD - salesLastMonthUSD) / salesLastMonthUSD) * 100)
      : salesThisMonthUSD > 0 ? 100 : 0;

    // Content freshness calculation (days since newest content)
    const newsAgeDays = latestNews 
      ? Math.floor((Date.now() - new Date(latestNews.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const pubAgeDays = latestPublication
      ? Math.floor((Date.now() - new Date(latestPublication.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const maxContentAgeDays = Math.min(
      newsAgeDays ?? 999, 
      pubAgeDays ?? 999
    );
    const isContentStale = maxContentAgeDays > 60;

    return NextResponse.json({
      success: true,
      metrics: {
        totalSalesUSD,
        pendingOrdersCount: pendingFulfillmentCount,
        lowStockCount: lowStockProducts,
        pendingApplicationsCount,
        sales: {
          today: { usd: salesTodayUSD, btn: salesTodayBTN },
          thisWeek: { usd: salesThisWeekUSD, btn: salesThisWeekBTN, trendPct: weekTrendPct },
          thisMonth: { usd: salesThisMonthUSD, btn: salesThisMonthBTN, trendPct: monthTrendPct },
          allTime: { usd: totalSalesUSD, btn: totalSalesBTN },
        },
        orders: {
          pendingFulfillment: pendingFulfillmentCount,
          attentionRequired: attentionOrders,
          total: orders.length,
        },
        catalog: {
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
        },
        members: {
          pendingApplications: pendingApplicationsCount,
          recentlyApproved: recentlyApprovedMembersCount,
          totalActive: totalActiveMembersCount,
        },
        contentFreshness: {
          newsAgeDays,
          pubAgeDays,
          isStale: isContentStale,
          latestNewsTitle: latestNews?.title || null,
          latestPubTitle: latestPublication?.title || null,
        },
      },
      recentOrders: orders.map((o) => ({
        id: o.orderNumber,
        customer: `${o.customerName} (${o.customerType})`,
        items: o.orderItems.map((oi) => `${oi.code} × ${oi.quantity}`).join(', ') || 'Craft items',
        total: o.currencyUsed === 'BTN' ? `Nu. ${o.totalPaidCurrency.toLocaleString()}` : `$${o.totalUSD.toFixed(2)}`,
        method: o.shippingMethod,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
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
