import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function failure(error: any, fallback: string) {
  const message = String(error?.message || '');
  if (message.includes('22P05') || /encoding|character.*byte sequence/i.test(message)) {
    return NextResponse.json({ error: 'The database cannot store one or more characters in this text. Its encoding must be migrated to UTF-8; no characters were removed or substituted.' }, { status: 503 });
  }
  return NextResponse.json({ error: error?.message || fallback }, { status: error?.statusCode || 500 });
}

const cleanText = (value: unknown) => typeof value === 'string' ? value.trim() : '';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');
    const pillars = await prisma.supportPillar.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { donations: true } } },
    });
    const mapped = pillars.map((pillar) => ({
      ...pillar,
      iconEmoji: pillar.key === 'grassroots' ? 'leaf' : (pillar.iconEmoji === 'leaf' ? '' : (pillar.iconEmoji || '')),
    }));
    return NextResponse.json({ success: true, pillars: mapped });
  } catch (error: any) {
    return failure(error, 'Failed to fetch support pillars.');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:edit');
    const body = await req.json();
    const key = cleanText(body?.key).toLowerCase();
    const title = cleanText(body?.title);
    const description = cleanText(body?.description);
    if (!key || !title || !description) {
      return NextResponse.json({ error: 'key, title, and description are required' }, { status: 400 });
    }

    const pillar = await prisma.supportPillar.create({
      data: {
        key,
        title,
        description,
        targetAmountUSD: Number(body.targetAmountUSD) || 0,
        raisedAmountUSD: Number(body.raisedAmountUSD) || 0,
        iconEmoji: cleanText(body.iconEmoji) || (key === 'grassroots' ? 'leaf' : ''),
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        sortOrder: Number(body.sortOrder) || 0,
      },
    });

    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'SUPPORT_PILLAR_CREATED', entityType: 'SupportPillar', entityId: pillar.id, details: { key: pillar.key, title: pillar.title } });
    return NextResponse.json({ success: true, pillar }, { status: 201 });
  } catch (error: any) {
    return failure(error, 'Failed to create support pillar.');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:edit');
    const body = await req.json();
    const id = cleanText(body?.id);
    const key = cleanText(body?.key).toLowerCase();
    if (!id && !key) return NextResponse.json({ error: 'id or key is required for update' }, { status: 400 });

    const where = id ? { id } : { key };
    const pillar = await prisma.supportPillar.update({
      where,
      data: {
        ...(body.title !== undefined && { title: cleanText(body.title) }),
        ...(body.description !== undefined && { description: cleanText(body.description) }),
        ...(body.targetAmountUSD !== undefined && { targetAmountUSD: Number(body.targetAmountUSD) || 0 }),
        ...(body.raisedAmountUSD !== undefined && { raisedAmountUSD: Number(body.raisedAmountUSD) || 0 }),
        ...(body.iconEmoji !== undefined && { iconEmoji: cleanText(body.iconEmoji) || null }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
        ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) || 0 }),
      },
    });

    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'SUPPORT_PILLAR_UPDATED', entityType: 'SupportPillar', entityId: pillar.id, details: { key: pillar.key, title: pillar.title } });
    return NextResponse.json({ success: true, pillar });
  } catch (error: any) {
    return failure(error, 'Failed to update support pillar.');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:edit');
    const id = req.nextUrl.searchParams.get('id');
    const key = req.nextUrl.searchParams.get('key')?.trim().toLowerCase();
    if (!id && !key) return NextResponse.json({ error: 'id or key required for deletion' }, { status: 400 });

    const where = id ? { id } : { key: key! };
    const deleted = await prisma.supportPillar.delete({ where });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'SUPPORT_PILLAR_DELETED', entityType: 'SupportPillar', entityId: deleted.id, details: { key: deleted.key, title: deleted.title } });
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return failure(error, 'Failed to delete support pillar.');
  }
}
