import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isPublicPublicationTitle } from '@/lib/publication-visibility';

export const dynamic = 'force-dynamic';

const FEATURED_ORDER: Record<string, number> = {
  'annual report 2025': 1,
  'five-year strategic plan 2026–2030': 2,
  'zorig chusum value chain assessment': 3,
  'audited financial statements 2025': 4,
};

export async function GET(req: Request) {
  let featuredOnly = false;
  try {
    const { searchParams } = new URL(req.url);
    featuredOnly = searchParams.get('featured') === 'true';

    const where = featuredOnly ? { isFeatured: true } : undefined;

    const dbPublications = await prisma.publication.findMany({
      where,
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    });

    let publications = dbPublications.filter((publication) => isPublicPublicationTitle(publication.title));

    if (featuredOnly) {
      publications = publications.sort((a, b) => {
        const orderA = FEATURED_ORDER[a.title.trim().toLowerCase()] || 99;
        const orderB = FEATURED_ORDER[b.title.trim().toLowerCase()] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return (b.year || 0) - (a.year || 0);
      });
    }

    const res = NextResponse.json({
      success: true,
      publications,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch {
    const res = NextResponse.json({
      success: false,
      error: 'Publication records are temporarily unavailable.',
      publications: [],
    }, { status: 503 });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  }
}
