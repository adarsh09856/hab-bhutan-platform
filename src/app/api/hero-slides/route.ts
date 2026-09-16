import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_SLIDES = [
  {
    id: 'hero-1',
    imageUrl: '/assets/photos/hero-1-weaving.jpg',
    caption: 'photo 1 — artisan at the loom, Khoma',
    altText: 'Artisan at the backstrap loom in Khoma, Lhuentse',
    linkUrl: '/shop',
    sortOrder: 1,
  },
  {
    id: 'hero-2',
    imageUrl: '/assets/photos/hero-2-punakha.jpg',
    caption: 'photo 2 — the Punakha crafts market, stalls and buyers',
    altText: 'The Punakha crafts market, stalls and buyers',
    linkUrl: '/outlets/punakha-market',
    sortOrder: 2,
  },
  {
    id: 'hero-3',
    imageUrl: '/assets/photos/hero-3-clay.jpg',
    caption: 'photo 3 — a natural dye training, Lhuentse',
    altText: 'Traditional clay sculpture and statue making in Bhutan',
    linkUrl: '/programmes/f',
    sortOrder: 3,
  },
  {
    id: 'hero-4',
    imageUrl: '/assets/photos/hero-4-textiles.jpg',
    caption: 'photo 4 — carving workshop, Trashiyangtse',
    altText: 'Naturally dyed yathra and silk textiles in Bumthang',
    linkUrl: '/clusters',
    sortOrder: 4,
  },
  {
    id: 'hero-5',
    imageUrl: '/assets/photos/hero-5-desho.jpg',
    caption: 'photo 5 — HAB outlet counter, Thimphu',
    altText: 'Handmade traditional desho paper workshop in Trashiyangtse',
    linkUrl: '/outlets',
    sortOrder: 5,
  },
];

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, imageUrl: true, caption: true, altText: true, linkUrl: true, sortOrder: true },
    });
    
    // If database has active slides, use them directly; fallback to DEFAULT_SLIDES only if none exist
    const effectiveSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;

    const normalized = effectiveSlides.map((s, idx) => {
      let img = s.imageUrl;
      if (!img || img.includes('placeholder')) {
        img = DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].imageUrl;
      }
      return { 
        ...s, 
        imageUrl: img,
        caption: s.caption || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].caption,
      };
    });

    const response = NextResponse.json({ slides: normalized });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch {
    const response = NextResponse.json({ slides: DEFAULT_SLIDES });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
}

