import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff =
    user.roleSlug === 'super_admin' ||
    user.roleSlug === 'staff_operator' ||
    user.permissions?.includes('*') ||
    user.permissions?.includes('content:edit') ||
    user.permissions?.includes('content:view');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const pillars = await prisma.supportPillar.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: { select: { donations: true } },
      },
    });
    return NextResponse.json({ success: true, pillars });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch support pillars' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { key, title, description, targetAmountUSD, raisedAmountUSD, iconEmoji, isActive, sortOrder } = body;

    if (!key || !title || !description) {
      return NextResponse.json({ error: 'key, title, and description are required' }, { status: 400 });
    }

    const pillar = await prisma.supportPillar.create({
      data: {
        key: key.trim().toLowerCase(),
        title: title.trim(),
        description: description.trim(),
        targetAmountUSD: Number(targetAmountUSD) || 0,
        raisedAmountUSD: Number(raisedAmountUSD) || 0,
        iconEmoji: iconEmoji?.trim() || '🌱',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'SUPPORT_PILLAR_CREATED',
      entityType: 'SupportPillar',
      entityId: pillar.id,
      details: { key: pillar.key, title: pillar.title },
    });

    return NextResponse.json({ success: true, pillar });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create support pillar' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, key, title, description, targetAmountUSD, raisedAmountUSD, iconEmoji, isActive, sortOrder } = body;

    if (!id && !key) {
      return NextResponse.json({ error: 'id or key is required for update' }, { status: 400 });
    }

    const where = id ? { id } : { key };
    const pillar = await prisma.supportPillar.update({
      where,
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(targetAmountUSD !== undefined && { targetAmountUSD: Number(targetAmountUSD) || 0 }),
        ...(raisedAmountUSD !== undefined && { raisedAmountUSD: Number(raisedAmountUSD) || 0 }),
        ...(iconEmoji !== undefined && { iconEmoji: iconEmoji?.trim() || null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) || 0 }),
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'SUPPORT_PILLAR_UPDATED',
      entityType: 'SupportPillar',
      entityId: pillar.id,
      details: { key: pillar.key, title: pillar.title },
    });

    return NextResponse.json({ success: true, pillar });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update support pillar' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const key = searchParams.get('key');

    if (!id && !key) {
      return NextResponse.json({ error: 'id or key required for deletion' }, { status: 400 });
    }

    const where = id ? { id } : { key: key! };
    const deleted = await prisma.supportPillar.delete({ where });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'SUPPORT_PILLAR_DELETED',
      entityType: 'SupportPillar',
      entityId: deleted.id,
      details: { key: deleted.key, title: deleted.title },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete support pillar' }, { status: 500 });
  }
}
