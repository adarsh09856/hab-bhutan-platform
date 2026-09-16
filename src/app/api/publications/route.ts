import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_PUBLICATIONS = [
  { id: 'pub-1', kind: 'Annual report', title: 'Annual Report 2025', year: 2026, metaDetails: 'PDF · 4.2 MB · English & Dzongkha', isFeatured: true, fileUrl: '/publications' },
  { id: 'pub-2', kind: 'Strategy', title: 'Five-Year Strategic Plan 2026–2030', year: 2026, metaDetails: 'PDF · 3.6 MB · Board approved', isFeatured: true, fileUrl: '/publications' },
  { id: 'pub-3', kind: 'Sector study', title: 'Zorig Chusum Value Chain Assessment', year: 2025, metaDetails: 'PDF · 2.8 MB · 96 pages', isFeatured: true, fileUrl: '/publications' },
  { id: 'pub-4', kind: 'Accounts', title: 'Audited Financial Statements 2025', year: 2026, metaDetails: 'PDF · 1.1 MB · Independent auditor', isFeatured: true, fileUrl: '/publications' },
  { id: 'pub-5', kind: 'Catalogue', title: 'HAB Product Catalogue 2026', year: 2026, metaDetails: 'PDF · 18.4 MB · 120 products', isFeatured: false, fileUrl: '/publications' },
  { id: 'pub-6', kind: 'Policy brief', title: 'Craft Sector Tax and Licensing: A Note for Policymakers', year: 2025, metaDetails: 'PDF · 640 KB · 12 pages', isFeatured: false, fileUrl: '/publications' },
  { id: 'pub-7', kind: 'Guideline', title: 'Natural Dye Handbook for Weavers', year: 2025, metaDetails: 'PDF · 6.2 MB · Illustrated', isFeatured: false, fileUrl: '/publications' },
  { id: 'pub-8', kind: 'Training manual', title: 'Costing and Pricing for Craft Enterprises', year: 2025, metaDetails: 'PDF · 2.1 MB · Workbook', isFeatured: false, fileUrl: '/publications' },
  { id: 'pub-9', kind: 'Annual report', title: 'Annual Report 2024', year: 2025, metaDetails: 'PDF · 3.9 MB · English & Dzongkha', isFeatured: false, fileUrl: '/publications' },
  { id: 'pub-10', kind: 'Accounts', title: 'Audited Financial Statements 2024', year: 2025, metaDetails: 'PDF · 1.0 MB · Independent auditor', isFeatured: false, fileUrl: '/publications' },
  { id: 'pub-11', kind: 'Case study', title: 'Khoma Weavers: Fifteen Years of Kisuthara', year: 2024, metaDetails: 'PDF · 5.4 MB · Photo essay', isFeatured: false, fileUrl: '/publications' },
  { id: 'pub-12', kind: 'Sector study', title: 'Market Demand for Bhutanese Handicrafts in Japan', year: 2024, metaDetails: 'PDF · 2.2 MB · Buyer survey', isFeatured: false, fileUrl: '/publications' },
];

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

    const fallbackList = featuredOnly 
      ? DEFAULT_PUBLICATIONS.filter(p => p.isFeatured) 
      : DEFAULT_PUBLICATIONS;

    let publications = dbPublications.length > 0 ? dbPublications : fallbackList;

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
  } catch (err: any) {
    const fallbackList = featuredOnly 
      ? DEFAULT_PUBLICATIONS.filter(p => p.isFeatured) 
      : DEFAULT_PUBLICATIONS;

    const res = NextResponse.json({
      success: true,
      publications: fallbackList,
      fallback: true,
    });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  }
}
