import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, imageUrl: true, caption: true, altText: true, linkUrl: true, sortOrder: true },
    });
    const normalized = slides.map((slide) => ({
      ...slide,
      imageUrl: slide.imageUrl && !/placeholder/i.test(slide.imageUrl)
        ? slide.imageUrl
        : '/assets/photos/image-unavailable.svg',
      caption: slide.caption || '',
      altText: slide.altText || '',
    }));

    const response = NextResponse.json({ success: true, slides: normalized });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch {
    const response = NextResponse.json({ success: false, error: 'Homepage slides are temporarily unavailable.', slides: [] }, { status: 503 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
}

