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

    const [orders, projects, verifiedMembersCount] = await Promise.all([
      prisma.order.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.projectRecord.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.member.count({ where: { status: 'VERIFIED' } }),
    ]);

    const grossVolumeUSD = orders.reduce((sum, o) => sum + (o.totalUSD || 0), 0);
    const artisanShareUSD = grossVolumeUSD * 0.8; // 80% pass-through
    const duesCollectedBTN = verifiedMembersCount * 5000;

    // Aggregate sales by craft from order items
    const craftSalesMap: Record<string, { units: number; grossUSD: number }> = {};
    for (const order of orders) {
      const items = (order.items as any[]) || [];
      for (const item of items) {
        const key = item.code ? item.code.slice(0, 3) : 'OTHER';
        if (!craftSalesMap[key]) {
          craftSalesMap[key] = { units: 0, grossUSD: 0 };
        }
        craftSalesMap[key].units += Number(item.quantity || 1);
        craftSalesMap[key].grossUSD += Number(item.priceUSD || 0) * Number(item.quantity || 1);
      }
    }

    if (format === 'csv') {
      const rows = [
        ['Type', 'Identifier / Name', 'Amount USD', 'Amount BTN', 'Status', 'Date'],
        ['METRIC_SUMMARY', 'Gross E-Commerce Volume', grossVolumeUSD.toFixed(2), '', 'AGGREGATED', new Date().toISOString().slice(0, 10)],
        ['METRIC_SUMMARY', 'Artisan 80% Payout Disbursed', artisanShareUSD.toFixed(2), '', 'AGGREGATED', new Date().toISOString().slice(0, 10)],
        ['METRIC_SUMMARY', 'Verified Member Dues', '', duesCollectedBTN.toString(), `${verifiedMembersCount} Members`, new Date().toISOString().slice(0, 10)],
        ...orders.map((o) => [
          'ORDER_TRANSACTION',
          o.orderNumber,
          o.totalUSD.toFixed(2),
          o.currencyUsed === 'BTN' ? o.totalPaidCurrency.toString() : '',
          o.orderStatus,
          o.createdAt.toISOString().slice(0, 10),
        ]),
        ...projects.map((p) => [
          'DONOR_PROJECT',
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.budget.replace(/"/g, '""')}"`,
          '',
          `${p.status} (${p.progressPercent || 0}%)`,
          p.period,
        ]),
      ];

      const csvContent = rows.map((r) => r.join(',')).join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="hab-financial-statement-2026.csv"',
        },
      });
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalOrdersCount: orders.length,
        grossVolumeUSD,
        artisanShareUSD,
        duesCollectedBTN,
        activeMembersCount: verifiedMembersCount,
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
    const { id, name, partner, period, budget, progressPercent, summary, activities, results, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Project id is required.' }, { status: 400 });
    }

    const previous = await prisma.projectRecord.findUnique({ where: { id } });
    if (!previous) {
      return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (partner !== undefined) updateData.partner = partner.trim();
    if (period !== undefined) updateData.period = period.trim();
    if (budget !== undefined) updateData.budget = budget.trim();
    if (progressPercent !== undefined) updateData.progressPercent = Math.min(100, Math.max(0, Number(progressPercent)));
    if (summary !== undefined) updateData.summary = summary.trim();
    if (activities !== undefined) updateData.activities = activities;
    if (results !== undefined) updateData.results = results;
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.projectRecord.update({
      where: { id },
      data: updateData,
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'PROJECT_RECORD_UPDATED',
      entityType: 'ProjectRecord',
      entityId: id,
      details: { changes: updateData },
    });

    return NextResponse.json({ success: true, project: updated });
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
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // body empty
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Project id is required for deletion.' }, { status: 400 });
    }

    const project = await prisma.projectRecord.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
    }

    await prisma.projectRecord.delete({ where: { id } });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'PROJECT_RECORD_DELETED',
      entityType: 'ProjectRecord',
      entityId: id,
      details: { name: project.name, partner: project.partner },
    });

    return NextResponse.json({ success: true, message: `Project '${project.name}' deleted.` });
  } catch (err: any) {
    console.error('Error deleting donor project:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error deleting donor project.' },
      { status: err.statusCode || 500 }
    );
  }
}
