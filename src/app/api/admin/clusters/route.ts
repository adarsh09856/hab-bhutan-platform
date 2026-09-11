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
    user.permissions?.includes('content:edit');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const clusters = await prisma.clusterRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ success: true, clusters });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch clusters' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { key, name, craftKey, dzongkhag, members, established, isFeatured, sortOrder, summary, story, visitorNote } = body;

    if (!key || !name || !craftKey || !dzongkhag) {
      return NextResponse.json({ error: 'key, name, craftKey, and dzongkhag are required' }, { status: 400 });
    }

    const cluster = await prisma.clusterRecord.create({
      data: {
        key: key.trim().toLowerCase(),
        name: name.trim(),
        craftKey: craftKey.trim(),
        dzongkhag: dzongkhag.trim(),
        members: Number(members) || 0,
        established: Number(established) || new Date().getFullYear(),
        isFeatured: Boolean(isFeatured),
        sortOrder: Number(sortOrder) || 0,
        summary: summary?.trim() || '',
        story: story?.trim() || '',
        visitorNote: visitorNote?.trim() || null,
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'CLUSTER_CREATED',
      entityType: 'ClusterRecord',
      entityId: cluster.id,
      details: { key: cluster.key, name: cluster.name },
    });

    return NextResponse.json({ success: true, cluster });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create cluster' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, key, name, craftKey, dzongkhag, members, established, isFeatured, sortOrder, summary, story, visitorNote } = body;

    if (!id && !key) {
      return NextResponse.json({ error: 'id or key is required' }, { status: 400 });
    }

    const updated = await prisma.clusterRecord.update({
      where: id ? { id } : { key },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(craftKey !== undefined && { craftKey: craftKey.trim() }),
        ...(dzongkhag !== undefined && { dzongkhag: dzongkhag.trim() }),
        ...(members !== undefined && { members: Number(members) }),
        ...(established !== undefined && { established: Number(established) }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(summary !== undefined && { summary: summary.trim() }),
        ...(story !== undefined && { story: story.trim() }),
        ...(visitorNote !== undefined && { visitorNote: visitorNote?.trim() || null }),
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'CLUSTER_UPDATED',
      entityType: 'ClusterRecord',
      entityId: updated.id,
      details: { key: updated.key, name: updated.name },
    });

    return NextResponse.json({ success: true, cluster: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update cluster' }, { status: 500 });
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
      return NextResponse.json({ error: 'id or key required' }, { status: 400 });
    }

    const deleted = await prisma.clusterRecord.delete({
      where: id ? { id } : { key: key! },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'CLUSTER_DELETED',
      entityType: 'ClusterRecord',
      entityId: deleted.id,
      details: { key: deleted.key, name: deleted.name },
    });

    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete cluster' }, { status: 500 });
  }
}
