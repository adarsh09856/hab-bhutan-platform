import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserForAnyPermission, Permission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { allocateHonourSlug } from '@/lib/honour-slugs';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest, permissions: Permission[]) {
  return getSessionUserForAnyPermission(req, permissions);
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req, ['content:view', 'content:edit']);
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
  const user = await verifyAdmin(req, ['content:create', 'content:edit']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, title, craft, dzongkhag, awardType, yearAwarded, practisingSince, citation, citationDz, shortDescription, story, workPhotos, showHome, portraitUrl, isActive, sortOrder } = body;

    if (!name || !craft || !dzongkhag || !citation) {
      return NextResponse.json({ error: 'name, craft, dzongkhag, and citation are required' }, { status: 400 });
    }

    if (Array.isArray(workPhotos) && workPhotos.length > 6) return NextResponse.json({ error: 'A maximum of six work photographs is allowed.' }, { status: 400 });
    if (showHome && await prisma.honourRecord.count({ where: { showHome: true, isActive: true } }) >= 6) return NextResponse.json({ error: 'Only six active profiles can be featured on the homepage.' }, { status: 400 });
    const awardedYear = Number(yearAwarded) || new Date().getFullYear();
    const existingSlugs = await prisma.honourRecord.findMany({ select: { id: true, slug: true, name: true, yearAwarded: true } });
    const honour = await prisma.honourRecord.create({
      data: {
        slug: allocateHonourSlug(name.trim(), awardedYear, existingSlugs),
        name: name.trim(),
        title: title?.trim() || 'Master Craftsperson',
        craft: craft.trim(),
        dzongkhag: dzongkhag.trim(),
        awardType: awardType?.trim() || 'RoyalSeal',
        yearAwarded: awardedYear,
        practisingSince: practisingSince ? Number(practisingSince) : null,
        citation: citation.trim(),
        shortDescription: shortDescription?.trim() || null,
        story: story?.trim() || null,
        workPhotos: Array.isArray(workPhotos) ? workPhotos.slice(0, 6) : [],
        showHome: Boolean(showHome),
        citationDz: citationDz?.trim() || null,
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
  const user = await verifyAdmin(req, ['content:edit']);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, name, title, craft, dzongkhag, awardType, yearAwarded, practisingSince, citation, citationDz, shortDescription, story, workPhotos, showHome, portraitUrl, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required for update' }, { status: 400 });
    }

    if (Array.isArray(workPhotos) && workPhotos.length > 6) return NextResponse.json({ error: 'A maximum of six work photographs is allowed.' }, { status: 400 });
    if (showHome && (isActive !== false) && await prisma.honourRecord.count({ where: { showHome: true, isActive: true, id: { not: id } } }) >= 6) return NextResponse.json({ error: 'Only six active profiles can be featured on the homepage.' }, { status: 400 });
    const existing = await prisma.honourRecord.findUnique({ where: { id }, select: { id: true, slug: true, name: true, yearAwarded: true } });
    if (!existing) return NextResponse.json({ error: 'Honour record not found' }, { status: 404 });
    const nextName = name !== undefined ? name.trim() : existing.name;
    const nextYear = yearAwarded !== undefined ? Number(yearAwarded) || new Date().getFullYear() : existing.yearAwarded;
    const missingSlug = !existing.slug
      ? allocateHonourSlug(nextName, nextYear, await prisma.honourRecord.findMany({ select: { id: true, slug: true, name: true, yearAwarded: true } }), id)
      : undefined;
    const honour = await prisma.honourRecord.update({
      where: { id },
      data: {
        ...(missingSlug ? { slug: missingSlug } : {}),
        ...(name !== undefined && { name: name.trim() }),
        ...(title !== undefined && { title: title.trim() }),
        ...(craft !== undefined && { craft: craft.trim() }),
        ...(dzongkhag !== undefined && { dzongkhag: dzongkhag.trim() }),
        ...(awardType !== undefined && { awardType: awardType.trim() }),
        ...(yearAwarded !== undefined && { yearAwarded: Number(yearAwarded) || new Date().getFullYear() }),
        ...(practisingSince !== undefined && { practisingSince: practisingSince ? Number(practisingSince) : null }),
        ...(citation !== undefined && { citation: citation.trim() }),
        ...(shortDescription !== undefined && { shortDescription: shortDescription?.trim() || null }),
        ...(story !== undefined && { story: story?.trim() || null }),
        ...(workPhotos !== undefined && { workPhotos: Array.isArray(workPhotos) ? workPhotos.slice(0, 6) : [] }),
        ...(showHome !== undefined && { showHome: Boolean(showHome) }),
        ...(citationDz !== undefined && { citationDz: citationDz?.trim() || null }),
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
  const user = await verifyAdmin(req, ['content:delete', 'content:edit']);
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
