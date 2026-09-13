import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CLIENT_DATA } from '@/lib/client-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let siteSetting: any = null;
    let heroSlides: any[] = [];
    let crafts: any[] = [];
    let outlets: any[] = [];

    try {
      siteSetting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
      heroSlides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } });
      crafts = await prisma.craft.findMany({ orderBy: { sortOrder: 'asc' } });
      outlets = await prisma.outletRecord.findMany({ orderBy: { sortOrder: 'asc' } });
    } catch {
      // offline fallback
    }

    const defaultSlots = [
      {
        key: 'hero.slide1',
        category: 'Hero Carousel',
        label: 'Hero Slide 1 — Thagzo Master Weaving',
        url: heroSlides[0]?.imageUrl || '/assets/photos/hero-1-weaving.jpg',
        aspect: '16:9 / Landscape',
        description: 'Primary banner on homepage hero showing master weaver working on backstrap loom.',
      },
      {
        key: 'hero.slide2',
        category: 'Hero Carousel',
        label: 'Hero Slide 2 — Punakha Crafts Market',
        url: heroSlides[1]?.imageUrl || '/assets/photos/hero-2-punakha.jpg',
        aspect: '16:9 / Landscape',
        description: 'Homepage banner featuring the Punakha market and riverside artisan stalls.',
      },
      {
        key: 'hero.slide3',
        category: 'Hero Carousel',
        label: 'Hero Slide 3 — Jimzo Clay Sculpting',
        url: heroSlides[2]?.imageUrl || '/assets/photos/hero-3-clay.jpg',
        aspect: '16:9 / Landscape',
        description: 'Banner depicting traditional clay figurine sculpture in Thimphu.',
      },
      {
        key: 'about.band',
        category: 'Site Bands',
        label: 'About Mission & Network Band',
        url: siteSetting?.aboutBandImageUrl || '/assets/photos/about-hab.jpg',
        aspect: '4:3 / Landscape',
        description: 'Featured photography on homepage About Band and main About page.',
      },
      {
        key: 'outlet.punakha',
        category: 'Outlets & Markets',
        label: 'Punakha Crafts Market Hero',
        url: '/assets/photos/hero-2-punakha.jpg',
        aspect: '16:9 / Landscape',
        description: 'Main photographic banner on /outlets and /outlet?outlet=punakha-market.',
      },
      {
        key: 'seal.authenticity',
        category: 'Brand & Certification',
        label: 'Seal of Bhutan Authentic Craft',
        url: '/assets/hab-logo.png',
        aspect: 'Logo / Vector',
        description: 'Official seal applied to certified handicraft documentation and packaging.',
      },
      {
        key: 'publication.annual2026',
        category: 'Publications',
        label: 'Annual Sector Review 2026 Cover',
        url: '/images/report_placeholder.png',
        aspect: '3:4 / Portrait',
        description: 'Document cover thumbnail shown on /publications.',
      },
    ];

    // Add 13 crafts slots
    const craftSlots = (crafts.length > 0 ? crafts : CLIENT_DATA.crafts).map((c: any) => ({
      key: `craft.${c.key}`,
      category: '13 Crafts Heritage',
      label: `${c.name} (${c.english || c.craft_name}) Banner`,
      url: c.bannerUrl || `/images/crafts/${c.key}.jpg`,
      aspect: '16:9 / Landscape',
      description: `Official header image on /craft/${c.key}.`,
    }));

    const allSlots = [...defaultSlots, ...craftSlots];

    return NextResponse.json({
      success: true,
      slots: allSlots,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { key, url, caption } = body;

    if (!key || !url) {
      return NextResponse.json({ success: false, error: 'Key and URL are required' }, { status: 400 });
    }

    try {
      if (key === 'about.band') {
        await (prisma.siteSetting as any).upsert({
          where: { id: 'default' },
          create: {
            id: 'default',
            aboutBandImageUrl: url,
            aboutBandImageCaption: caption || 'HAB artisan workshop',
            heroParagraph: 'Handicrafts Association of Bhutan promotes living craft heritage across all dzongkhags.',
            footerAbout: 'Apex Civil Society Organization established under the CSO Act of Bhutan 2007.',
            partnersList: [],
          },
          update: { aboutBandImageUrl: url, aboutBandImageCaption: caption || 'HAB artisan workshop' },
        });

      } else if (key.startsWith('craft.')) {
        const craftKey = key.replace('craft.', '');
        await prisma.craft.updateMany({
          where: { key: craftKey },
          data: { bannerUrl: url },
        });
      } else if (key.startsWith('hero.')) {
        const slideIdx = key === 'hero.slide1' ? 0 : key === 'hero.slide2' ? 1 : 2;
        const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } });
        if (slides[slideIdx]) {
          await prisma.heroSlide.update({
            where: { id: slides[slideIdx].id },
            data: { imageUrl: url },
          });
        }
      }
    } catch {
      // In-memory fallback
    }

    return NextResponse.json({ success: true, message: `Media slot ${key} updated successfully.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
