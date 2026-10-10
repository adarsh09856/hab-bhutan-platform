import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function safeImageUrl(value: string) {
  const url = value.trim();
  if (/\.pdf(?:[?#]|$)/i.test(url)) return false;
  return (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) || /^https:\/\/[^\s]+$/i.test(url);
}

function outletImage(note: string | null) {
  return note?.match(/<!--\s*HAB_IMAGE:\s*(.*?)\s*-->/)?.[1]?.trim() || null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'content:view');
    if (!['super_admin', 'staff_operator'].includes(String(user.roleSlug || '').toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Staff login required.' }, { status: 403 });
    }
    const [siteSetting, heroSlides, crafts, outlets] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { id: 'default' } }),
      prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.craft.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.outletRecord.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);

    const heroSlots = heroSlides.map((slide, index) => ({
      key: `hero.${slide.id}`,
      category: 'Hero Carousel',
      label: `Hero Slide ${index + 1}`,
      url: slide.imageUrl,
      caption: slide.altText,
      aspect: '16:9 / Landscape',
      description: slide.caption || slide.altText || 'Homepage hero slide.',
    }));
    const defaultSlots = [
      {
        key: 'about.band',
        category: 'Site Bands',
        label: 'About Mission & Network Band',
        url: siteSetting?.aboutBandImageUrl || '/assets/photos/about-hab.jpg',
        caption: siteSetting?.aboutBandImageCaption || '',
        aspect: '4:3 / Landscape',
        description: 'Featured photography on homepage About Band and main About page.',
      },
    ];

    // Add 13 crafts slots
    const craftSlots = crafts.map((c) => ({
      key: `craft.${c.key}`,
      category: '13 Crafts Heritage',
      label: `${c.name} (${c.english}) Banner`,
      url: c.bannerUrl || `/images/crafts/${c.key}.jpg`,
      aspect: '16:9 / Landscape',
      description: `Official header image on /craft/${c.key}.`,
    }));

    const outletSlots = outlets.map((outlet) => ({
      key: `outlet.${outlet.key}`,
      category: 'Outlets & Markets',
      label: `${outlet.name} image`,
      url: outletImage(outlet.note) || '/assets/photos/image-unavailable.svg',
      aspect: '16:9 / Landscape',
      description: `Saved photo for /outlets/${outlet.key}.`,
    }));
    const allSlots = [...heroSlots, ...defaultSlots, ...craftSlots, ...outletSlots];

    return NextResponse.json({
      success: true,
      slots: allSlots,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.statusCode ? err.message : 'Media slots temporarily unavailable.' }, { status: err?.statusCode || 503 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'content:edit');
    if (!['super_admin', 'staff_operator'].includes(String(user.roleSlug || '').toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Staff login required.' }, { status: 403 });
    }
    const body = await request.json();
    const { key, url, caption } = body;

    if (typeof key !== 'string' || typeof url !== 'string' || !key.trim() || !url.trim()) {
      return NextResponse.json({ success: false, error: 'Key and URL are required' }, { status: 400 });
    }
    const cleanKey = key.trim();
    const cleanUrl = url.trim();
    if (!safeImageUrl(cleanUrl)) return NextResponse.json({ success: false, error: 'Use an internal path or HTTPS image URL.' }, { status: 400 });

    if (cleanKey === 'about.band') {
      const update = await prisma.siteSetting.updateMany({
        where: { id: 'default' },
        data: { aboutBandImageUrl: cleanUrl, ...(typeof caption === 'string' && caption.trim() ? { aboutBandImageCaption: caption.trim() } : {}) },
      });
      if (!update.count) return NextResponse.json({ success: false, error: 'Site settings not found.' }, { status: 404 });
    } else if (cleanKey.startsWith('craft.')) {
      const update = await prisma.craft.updateMany({ where: { key: cleanKey.slice(6) }, data: { bannerUrl: cleanUrl } });
      if (!update.count) return NextResponse.json({ success: false, error: 'Craft not found.' }, { status: 404 });
    } else if (cleanKey.startsWith('hero.')) {
      const update = await prisma.heroSlide.updateMany({
        where: { id: cleanKey.slice(5) },
        data: { imageUrl: cleanUrl, ...(typeof caption === 'string' && caption.trim() ? { altText: caption.trim() } : {}) },
      });
      if (!update.count) return NextResponse.json({ success: false, error: 'Hero slide not found.' }, { status: 404 });
    } else if (cleanKey.startsWith('outlet.')) {
      const outlet = await prisma.outletRecord.findUnique({ where: { key: cleanKey.slice(7) }, select: { id: true, note: true } });
      if (!outlet) return NextResponse.json({ success: false, error: 'Outlet not found.' }, { status: 404 });
      const note = (outlet.note || '').replace(/<!--\s*HAB_IMAGE:\s*[\s\S]*?-->/g, '').trim();
      await prisma.outletRecord.update({
        where: { id: outlet.id },
        data: { note: `${note}${note ? '\n' : ''}<!-- HAB_IMAGE: ${cleanUrl} -->` },
      });
    } else {
      return NextResponse.json({ success: false, error: 'This media slot is not editable here.' }, { status: 404 });
    }

    await logAudit({
      actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email,
      action: 'MEDIA_SLOT_UPDATED', entityType: 'MediaSlot', entityId: cleanKey,
      details: { url: cleanUrl, caption: caption || null },
    }).catch(() => {});
    return NextResponse.json({ success: true, message: `Media slot ${cleanKey} updated successfully.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.statusCode ? err.message : 'Media slot could not be saved.' }, { status: err?.statusCode || 500 });
  }
}
