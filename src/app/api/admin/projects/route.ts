import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');

    const projects = await prisma.projectRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, projects });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:create');
    const body = await req.json();
    const { status, name, partner, period, budget, progressPercent, summary, activities, results } = body;

    if (!name?.trim() || !partner?.trim() || !summary?.trim()) {
      return NextResponse.json({ error: 'Project name, partner, and summary are required.' }, { status: 400 });
    }

    const project = await prisma.projectRecord.create({
      data: {
        status: status || 'current',
        name: name.trim(),
        partner: partner.trim(),
        period: period?.trim() || '2026 – 2028',
        budget: budget?.trim() || 'Undisclosed',
        progressPercent: progressPercent !== undefined ? Number(progressPercent) : 50,
        summary: summary.trim(),
        activities: Array.isArray(activities) ? activities : [],
        results: Array.isArray(results) ? results : [],
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: getClientIp(req),
      action: 'PROJECT_RECORD_CREATED',
      entityType: 'ProjectRecord',
      entityId: project.id,
      details: { name: project.name, partner: project.partner },
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create project' }, { status: err.statusCode || 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { id, status, name, partner, period, budget, progressPercent, summary, activities, results } = body;

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await prisma.projectRecord.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(name && { name: name.trim() }),
        ...(partner && { partner: partner.trim() }),
        ...(period && { period: period.trim() }),
        ...(budget && { budget: budget.trim() }),
        ...(progressPercent !== undefined && { progressPercent: Number(progressPercent) }),
        ...(summary && { summary: summary.trim() }),
        ...(activities !== undefined && { activities: Array.isArray(activities) ? activities : [] }),
        ...(results !== undefined && { results: Array.isArray(results) ? results : [] }),
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: getClientIp(req),
      action: 'PROJECT_RECORD_UPDATED',
      entityType: 'ProjectRecord',
      entityId: project.id,
      details: { name: project.name },
    });

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update project' }, { status: err.statusCode || 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:delete');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await prisma.projectRecord.delete({ where: { id } });

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: getClientIp(req),
      action: 'PROJECT_RECORD_DELETED',
      entityType: 'ProjectRecord',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete project' }, { status: err.statusCode || 500 });
  }
}
