import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

type ProjectBannerSlide = {
  id: string;
  imageUrl: string;
  altText: string;
  caption: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

function isSafeUrl(value: unknown, optional = false): value is string {
  if (typeof value !== 'string' || !value.trim()) return optional;
  const url = value.trim();
  return !url.includes('\\') && !url.startsWith('//') && (url.startsWith('/') || /^https:\/\//i.test(url));
}

async function readSlides() {
  const settings = await prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } });
  const trustBadges = (settings?.trustBadges as Record<string, unknown> | null) || {};
  const slides = Array.isArray(trustBadges.projectBannerSlides) ? trustBadges.projectBannerSlides : [];
  return slides as ProjectBannerSlide[];
}

async function writeSlides(slides: ProjectBannerSlide[]) {
  const settings = await prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } });
  if (!settings) throw Object.assign(new Error('Site settings are not initialized.'), { statusCode: 409 });
  const trustBadges = (settings.trustBadges as Record<string, unknown> | null) || {};
  await prisma.siteSetting.update({
    where: { id: 'default' },
    data: { trustBadges: { ...trustBadges, projectBannerSlides: slides } as any },
  });
}

function errorResponse(error: any) {
  return NextResponse.json({ success: false, error: error?.message || 'Project banner request failed.' }, { status: error?.statusCode || 500 });
}

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');
    const slides = (await readSlides()).sort((a, b) => a.sortOrder - b.sortOrder);
    return NextResponse.json({ success: true, slides }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:create');
    const body = await req.json();
    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
    const caption = typeof body.caption === 'string' ? body.caption.trim() : '';
    const altText = typeof body.altText === 'string' ? body.altText.trim() : '';
    const linkUrl = typeof body.linkUrl === 'string' ? body.linkUrl.trim() : '';
    if (!imageUrl || !isSafeUrl(imageUrl) || !isSafeUrl(linkUrl, true)) {
      return NextResponse.json({ success: false, error: 'Choose an image and use a site path or secure HTTPS URL.' }, { status: 400 });
    }
    if (!altText) return NextResponse.json({ success: false, error: 'Add an image description for accessibility.' }, { status: 400 });
    const slides = await readSlides();
    if (slides.length >= 24) return NextResponse.json({ success: false, error: 'The project banner supports up to 24 slides.' }, { status: 400 });
    const slide: ProjectBannerSlide = {
      id: randomUUID(), imageUrl, altText: altText.slice(0, 300), caption: caption.slice(0, 240),
      linkUrl: linkUrl || null,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : slides.length,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : true,
    };
    await writeSlides([...slides, slide]);
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, actorIp: getClientIp(req), action: 'PROJECT_BANNER_SLIDE_CREATED', entityType: 'ProjectBannerSlide', entityId: slide.id, details: { caption: slide.caption } });
    return NextResponse.json({ success: true, slide }, { status: 201 });
  } catch (error: any) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:edit');
    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ success: false, error: 'Banner slide ID is required.' }, { status: 400 });
    const slides = await readSlides();
    const index = slides.findIndex((slide) => slide.id === id);
    if (index < 0) return NextResponse.json({ success: false, error: 'Banner slide not found.' }, { status: 404 });
    const old = slides[index];
    if (body.imageUrl !== undefined && !isSafeUrl(body.imageUrl)) return NextResponse.json({ success: false, error: 'Use a site path or secure HTTPS URL for the image.' }, { status: 400 });
    if (body.linkUrl !== undefined && !isSafeUrl(body.linkUrl, true)) return NextResponse.json({ success: false, error: 'Use a site path or secure HTTPS URL for the slide link.' }, { status: 400 });
    const slide: ProjectBannerSlide = {
      ...old,
      ...(body.imageUrl !== undefined && { imageUrl: String(body.imageUrl).trim() }),
      ...(body.altText !== undefined && { altText: String(body.altText).trim().slice(0, 300) }),
      ...(body.caption !== undefined && { caption: String(body.caption).trim().slice(0, 240) }),
      ...(body.linkUrl !== undefined && { linkUrl: String(body.linkUrl || '').trim() || null }),
      ...(body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder)) && { sortOrder: Number(body.sortOrder) }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
    };
    slides[index] = slide;
    await writeSlides(slides);
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, actorIp: getClientIp(req), action: 'PROJECT_BANNER_SLIDE_UPDATED', entityType: 'ProjectBannerSlide', entityId: slide.id, details: { fields: Object.keys(body).filter((key) => key !== 'id') } });
    return NextResponse.json({ success: true, slide });
  } catch (error: any) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:delete');
    const id = new URL(req.url).searchParams.get('id') || '';
    const slides = await readSlides();
    const nextSlides = slides.filter((slide) => slide.id !== id);
    if (nextSlides.length === slides.length) return NextResponse.json({ success: false, error: 'Banner slide not found.' }, { status: 404 });
    await writeSlides(nextSlides);
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, actorIp: getClientIp(req), action: 'PROJECT_BANNER_SLIDE_DELETED', entityType: 'ProjectBannerSlide', entityId: id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return errorResponse(error);
  }
}
