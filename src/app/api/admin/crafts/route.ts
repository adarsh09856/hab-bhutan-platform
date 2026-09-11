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
                  user.permissions?.includes('products:review');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const crafts = await prisma.craft.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true, members: true } } },
  });
  return NextResponse.json({ success: true, crafts });
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { key, name, english, dzongkha, description, bannerUrl, technique, materials, practisedIn, history, shopNote, sortOrder, isActive } = body;
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
  try {
    const updated = await prisma.craft.update({
      where: { key },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(english !== undefined && { english: english.trim() }),
        ...(dzongkha !== undefined && { dzongkha: dzongkha?.trim() || null }),
        ...(description !== undefined && { description: description.trim() }),
        ...(bannerUrl !== undefined && { bannerUrl: bannerUrl?.trim() || null }),
        ...(technique !== undefined && { technique: technique?.trim() || null }),
        ...(materials !== undefined && { materials: materials?.trim() || null }),
        ...(practisedIn !== undefined && { practisedIn: practisedIn?.trim() || null }),
        ...(history !== undefined && { history: history?.trim() || null }),
        ...(shopNote !== undefined && { shopNote: shopNote?.trim() || null }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'CRAFT_METADATA_UPDATED', entityType: 'Craft', entityId: key });
    return NextResponse.json({ success: true, craft: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}