import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    if (!slides || slides.length === 0) {
      return NextResponse.json({ slides: DEFAULT_SLIDES });
    }
    const normalized = slides.map((s, idx) => {
      let img = s.imageUrl;
      if (!img || img.includes('/images/') || img.includes('placeholder')) {
        img = DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].imageUrl;
      }
      return { ...s, imageUrl: img };
    });
    return NextResponse.json({ slides: normalized });
  } catch {
    return NextResponse.json({ slides: DEFAULT_SLIDES });
  }
}

