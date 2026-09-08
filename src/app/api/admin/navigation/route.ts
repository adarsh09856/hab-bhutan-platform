import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');

    const items = await prisma.navigationItem.findMany({
      orderBy: [{ menuType: 'asc' }, { sortOrder: 'asc' }],
    });

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:create');
    const body = await req.json();
    const { menuType, column, label, href, parent, sortOrder, isActive, isExternal } = body;

    if (!label?.trim() || !href?.trim() || !menuType) {
      return NextResponse.json({ error: 'Menu type, label, and URL are required' }, { status: 400 });
    }

    const item = await prisma.navigationItem.create({
      data: {
        menuType: menuType.toUpperCase(),
        column: column?.trim() || null,
        label: label.trim(),
        href: href.trim(),
        parent: parent?.trim() || null,
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isExternal: Boolean(isExternal),
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: getClientIp(req),
      action: 'NAVIGATION_ITEM_CREATED',
      entityType: 'NavigationItem',
      entityId: item.id,
      details: { label: item.label, href: item.href, menuType: item.menuType },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create navigation item' }, { status: err.statusCode || 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { id, menuType, column, label, href, parent, sortOrder, isActive, isExternal } = body;

    if (!id) {
      return NextResponse.json({ error: 'Navigation item ID is required' }, { status: 400 });
    }

    const item = await prisma.navigationItem.update({
      where: { id },
      data: {
        ...(menuType && { menuType: menuType.toUpperCase() }),
        ...(column !== undefined && { column: column?.trim() || null }),
        ...(label && { label: label.trim() }),
        ...(href && { href: href.trim() }),
        ...(parent !== undefined && { parent: parent?.trim() || null }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(isExternal !== undefined && { isExternal: Boolean(isExternal) }),
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: getClientIp(req),
      action: 'NAVIGATION_ITEM_UPDATED',
      entityType: 'NavigationItem',
      entityId: item.id,
      details: { label: item.label, href: item.href },
    });

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update navigation item' }, { status: err.statusCode || 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:delete');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await prisma.navigationItem.delete({ where: { id } });

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: getClientIp(req),
      action: 'NAVIGATION_ITEM_DELETED',
      entityType: 'NavigationItem',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete navigation item' }, { status: err.statusCode || 500 });
  }
}
