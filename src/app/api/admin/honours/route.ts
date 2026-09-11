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
    const honours = await prisma.honourRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { yearAwarded: 'desc' }, { name: 'asc' }],
    });
    return NextResponse.json({ success: true, honours });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch honours' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, craft, dzongkhag, awardType, yearAwarded, citation, portraitUrl, isActive, sortOrder } = body;

    if (!name || !craft || !dzongkhag || !citation) {
      return NextResponse.json({ error: 'name, craft, dzongkhag, and citation are required' }, { status: 400 });
    }

    const honour = await prisma.honourRecord.create({
      data: {
        name: name.trim(),
        craft: craft.trim(),
        dzongkhag: dzongkhag.trim(),
        awardType: awardType?.trim() || 'RoyalSeal',
        yearAwarded: Number(yearAwarded) || new Date().getFullYear(),
        citation: citation.trim(),
        portraitUrl: portraitUrl?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'HONOUR_RECORD_CREATED',
      entityType: 'HonourRecord',
      entityId: honour.id,
      details: { name: honour.name, awardType: honour.awardType },
    });

    return NextResponse.json({ success: true, honour });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create honour' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, name, craft, dzongkhag, awardType, yearAwarded, citation, portraitUrl, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required for update' }, { status: 400 });
    }

    const honour = await prisma.honourRecord.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(craft !== undefined && { craft: craft.trim() }),
        ...(dzongkhag !== undefined && { dzongkhag: dzongkhag.trim() }),
        ...(awardType !== undefined && { awardType: awardType.trim() }),
        ...(yearAwarded !== undefined && { yearAwarded: Number(yearAwarded) || new Date().getFullYear() }),
        ...(citation !== undefined && { citation: citation.trim() }),
        ...(portraitUrl !== undefined && { portraitUrl: portraitUrl?.trim() || null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) || 0 }),
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'HONOUR_RECORD_UPDATED',
      entityType: 'HonourRecord',
      entityId: honour.id,
      details: { name: honour.name, awardType: honour.awardType },
    });

    return NextResponse.json({ success: true, honour });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update honour' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required for deletion' }, { status: 400 });
    }

    const deleted = await prisma.honourRecord.delete({ where: { id } });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'HONOUR_RECORD_DELETED',
      entityType: 'HonourRecord',
      entityId: deleted.id,
      details: { name: deleted.name },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete honour' }, { status: 500 });
  }
}
