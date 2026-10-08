import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function safeLink(value: unknown, optional = false): value is string {
  if (typeof value !== 'string' || !value.trim()) return optional;
  const url = value.trim();
  return !url.includes('\\') && !url.startsWith('//') &&
    (url.startsWith('/') || /^https:\/\//i.test(url));
}

function errorResponse(error: any) {
  return NextResponse.json({ success: false, error: error?.message || 'Hero slide request failed.' }, { status: error?.statusCode || 500 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission(req, 'content:edit');
    const { id } = await params;
    const body = await req.json();
    const { imageUrl, caption, altText, linkUrl, sortOrder, isActive } = body;
    if ((imageUrl !== undefined && !safeLink(imageUrl)) || (linkUrl !== undefined && !safeLink(linkUrl, true))) {
      return NextResponse.json({ success: false, error: 'Use a site-relative path or secure HTTPS URL for slide media and links.' }, { status: 400 });
    }
    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() }),
        ...(caption !== undefined && { caption: caption.trim() }),
        ...(altText !== undefined && { altText: altText.trim() }),
        ...(linkUrl !== undefined && { linkUrl: linkUrl?.trim() || null }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });
    await logAudit({ actorType: 'STAFF', actorId: session.id, actorIdentifier: session.email, actorIp: getClientIp(req), action: 'HERO_SLIDE_UPDATED', entityType: 'HeroSlide', entityId: slide.id, details: { caption: slide.caption } });
    return NextResponse.json({ success: true, slide });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.code === 'P2025' ? 'Slide not found.' : error?.message || 'Could not update slide.' }, { status: error?.code === 'P2025' ? 404 : error?.statusCode || 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission(req, 'content:delete');
    const { id } = await params;
    await prisma.heroSlide.delete({ where: { id } });
    await logAudit({ actorType: 'STAFF', actorId: session.id, actorIdentifier: session.email, actorIp: getClientIp(req), action: 'HERO_SLIDE_DELETED', entityType: 'HeroSlide', entityId: id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.code === 'P2025' ? 'Slide not found.' : error?.message || 'Could not delete slide.' }, { status: error?.code === 'P2025' ? 404 : error?.statusCode || 500 });
  }
}
