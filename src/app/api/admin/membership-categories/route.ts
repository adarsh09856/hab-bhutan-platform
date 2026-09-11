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
    user.permissions?.includes('members:edit') ||
    user.permissions?.includes('members:view');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const categories = await prisma.membershipCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { duesBTN: 'asc' }],
    });
    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch membership categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { key, name, shortName, duesBTN, duesUSD, description, eligibility, benefits, documents, isActive, sortOrder } = body;

    if (!key || !name || !description) {
      return NextResponse.json({ error: 'key, name, and description are required' }, { status: 400 });
    }

    const category = await prisma.membershipCategory.create({
      data: {
        key: key.trim().toLowerCase(),
        name: name.trim(),
        shortName: shortName?.trim() || null,
        duesBTN: Number(duesBTN) || 0,
        duesUSD: Number(duesUSD) || 0,
        description: description.trim(),
        eligibility: eligibility || null,
        benefits: benefits || null,
        documents: documents || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'MEMBERSHIP_CATEGORY_CREATED',
      entityType: 'MembershipCategory',
      entityId: category.id,
      details: { key: category.key, name: category.name },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create membership category' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, key, name, shortName, duesBTN, duesUSD, description, eligibility, benefits, documents, isActive, sortOrder } = body;

    if (!id && !key) {
      return NextResponse.json({ error: 'id or key required for update' }, { status: 400 });
    }

    const where = id ? { id } : { key };
    const category = await prisma.membershipCategory.update({
      where,
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(shortName !== undefined && { shortName: shortName?.trim() || null }),
        ...(duesBTN !== undefined && { duesBTN: Number(duesBTN) || 0 }),
        ...(duesUSD !== undefined && { duesUSD: Number(duesUSD) || 0 }),
        ...(description !== undefined && { description: description.trim() }),
        ...(eligibility !== undefined && { eligibility }),
        ...(benefits !== undefined && { benefits }),
        ...(documents !== undefined && { documents }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) || 0 }),
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'MEMBERSHIP_CATEGORY_UPDATED',
      entityType: 'MembershipCategory',
      entityId: category.id,
      details: { key: category.key, name: category.name },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update membership category' }, { status: 500 });
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
    const deleted = await prisma.membershipCategory.delete({ where });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'MEMBERSHIP_CATEGORY_DELETED',
      entityType: 'MembershipCategory',
      entityId: deleted.id,
      details: { key: deleted.key, name: deleted.name },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete membership category' }, { status: 500 });
  }
}
