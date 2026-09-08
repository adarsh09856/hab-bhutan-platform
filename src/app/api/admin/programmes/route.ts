import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff = user.roleSlug === 'super_admin' ||
                  user.roleSlug === 'staff_operator' ||
                  user.permissions?.includes('*') ||
                  user.permissions?.includes('content:edit');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const pillars = await prisma.programmePillar.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ success: true, pillars });
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { ref, title, description, activities, sortOrder, isActive } = body;
  if (!ref?.trim() || !title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'ref, title, and description are required' }, { status: 400 });
  }
  try {
    const pillar = await prisma.programmePillar.create({
      data: {
        ref: ref.trim().toLowerCase(),
        title: title.trim(),
        description: description.trim(),
        activities: Array.isArray(activities) ? activities : [],
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
    });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'PROGRAMME_PILLAR_CREATED', entityType: 'ProgrammePillar', entityId: pillar.id });
    return NextResponse.json({ success: true, pillar }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Creation failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, ref, title, description, activities, sortOrder, isActive } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    const pillar = await prisma.programmePillar.update({
      where: { id },
      data: {
        ...(ref !== undefined && { ref: ref.trim().toLowerCase() }),
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(activities !== undefined && { activities }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'PROGRAMME_PILLAR_UPDATED', entityType: 'ProgrammePillar', entityId: id });
    return NextResponse.json({ success: true, pillar });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id parameter required' }, { status: 400 });
  try {
    await prisma.programmePillar.delete({ where: { id } });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'PROGRAMME_PILLAR_DELETED', entityType: 'ProgrammePillar', entityId: id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}