import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'members:view');

    const members = await prisma.member.findMany({
      include: {
        craft: true,
        products: {
          select: { code: true, name: true, priceUSD: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (err: any) {
    console.error('Error fetching admin members:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching members.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'members:verify');
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Member id and new status are required.' },
        { status: 400 }
      );
    }

    const previous = await prisma.member.findUnique({ where: { id } });
    if (!previous) {
      return NextResponse.json(
        { success: false, error: 'Member not found.' },
        { status: 404 }
      );
    }

    const updated = await prisma.member.update({
      where: { id },
      data: { status },
      include: { craft: true, products: true },
    });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: `MEMBER_STATUS_CHANGED_${status}`,
      entityType: 'Member',
      entityId: id,
      details: {
        previousStatus: previous.status,
        newStatus: status,
        notes: notes || null,
        enterpriseName: updated.name,
      },
    });

    return NextResponse.json({
      success: true,
      member: updated,
    });
  } catch (err: any) {
    console.error('Error updating member:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating member.' },
      { status: err.statusCode || 500 }
    );
  }
}
