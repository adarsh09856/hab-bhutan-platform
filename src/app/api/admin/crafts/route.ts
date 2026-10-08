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
  const { key, name, english, dzongkha, description, longDescription, typicalProducts, bannerUrl, technique, materials, practisedIn, history, shopNote, sortOrder, isActive } = body;
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
  try {
    const updated = await prisma.craft.update({
      where: { key },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(english !== undefined && { english: english.trim() }),
        ...(dzongkha !== undefined && { dzongkha: dzongkha?.trim() || null }),
        ...(description !== undefined && { description: description.trim() }),
        ...(longDescription !== undefined && { longDescription: longDescription?.trim() || null }),
        ...(typicalProducts !== undefined && { typicalProducts: typicalProducts?.trim() || null }),
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

export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { key, name, english, dzongkha, description, longDescription, typicalProducts, bannerUrl, technique, materials, practisedIn, history, shopNote, sortOrder, isActive } = body;
    if (!key || !name || !english) {
      return NextResponse.json({ error: 'Category key, Dzongkha name, and English name are required.' }, { status: 400 });
    }
    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const existing = await prisma.craft.findUnique({ where: { key: cleanKey } });
    if (existing) {
      return NextResponse.json({ error: `Category with key "${cleanKey}" already exists.` }, { status: 400 });
    }
    const created = await prisma.craft.create({
      data: {
        key: cleanKey,
        name: name.trim(),
        english: english.trim(),
        dzongkha: dzongkha?.trim() || null,
        description: description?.trim() || `Master craft heritage of Bhutan.`,
        longDescription: longDescription?.trim() || null,
        typicalProducts: typicalProducts?.trim() || null,
        bannerUrl: bannerUrl?.trim() || null,
        technique: technique?.trim() || null,
        materials: materials?.trim() || null,
        practisedIn: practisedIn?.trim() || null,
        history: history?.trim() || null,
        shopNote: shopNote?.trim() || null,
        sortOrder: Number(sortOrder || 0),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'CRAFT_CATEGORY_CREATED', entityType: 'Craft', entityId: cleanKey });
    return NextResponse.json({ success: true, craft: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Creation failed' }, { status: 500 });
  }
}
