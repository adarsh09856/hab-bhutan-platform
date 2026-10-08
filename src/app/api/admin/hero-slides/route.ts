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

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');
    const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ success: true, slides });
  } catch (error: any) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:create');
    const body = await req.json();
    const { imageUrl, caption, altText, linkUrl, sortOrder, isActive } = body;
    if (!imageUrl?.trim() || !caption?.trim() || !altText?.trim()) {
      return NextResponse.json({ success: false, error: 'Image, caption and image description are required.' }, { status: 400 });
    }
    if (!safeLink(imageUrl) || !safeLink(linkUrl, true)) {
      return NextResponse.json({ success: false, error: 'Use a site-relative path or secure HTTPS URL for slide media and links.' }, { status: 400 });
    }
    const slide = await prisma.heroSlide.create({
      data: {
        imageUrl: imageUrl.trim(),
        caption: caption.trim(),
        altText: altText.trim(),
        linkUrl: linkUrl?.trim() || null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
    });
    await logAudit({ actorType: 'STAFF', actorId: session.id, actorIdentifier: session.email, actorIp: getClientIp(req), action: 'HERO_SLIDE_CREATED', entityType: 'HeroSlide', entityId: slide.id, details: { caption: slide.caption } });
    return NextResponse.json({ success: true, slide }, { status: 201 });
  } catch (error: any) {
    return errorResponse(error);
  }
}
