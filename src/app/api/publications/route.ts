import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_PUBLICATIONS = [
  { id: 'pub-1', kind: 'Latest · Annual report', title: 'Annual Report 2025', year: 2026, metaDetails: 'PDF · 4.2 MB · English & Dzongkha', isFeatured: true, fileUrl: null },
  { id: 'pub-2', kind: 'Strategy', title: 'Five-Year Strategic Plan 2026–2030', year: 2026, metaDetails: 'PDF · 3.6 MB · Board approved', isFeatured: true, fileUrl: null },
  { id: 'pub-3', kind: 'Sector study', title: 'Zorig Chusum Value Chain Assessment', year: 2025, metaDetails: 'PDF · 2.8 MB · 96 pages', isFeatured: true, fileUrl: null },
  { id: 'pub-4', kind: 'Accounts', title: 'Audited Financial Statements 2025', year: 2026, metaDetails: 'PDF · 1.1 MB · Independent auditor', isFeatured: true, fileUrl: null },
  { id: 'pub-5', kind: 'Catalogue', title: 'HAB Product Catalogue 2026', year: 2026, metaDetails: 'PDF · 18.4 MB · 120 products', isFeatured: false, fileUrl: null },
  { id: 'pub-6', kind: 'Policy brief', title: 'Craft Sector Tax and Licensing: A Note for Policymakers', year: 2025, metaDetails: 'PDF · 640 KB · 12 pages', isFeatured: false, fileUrl: null },
  { id: 'pub-7', kind: 'Guideline', title: 'Natural Dye Handbook for Weavers', year: 2025, metaDetails: 'PDF · 6.2 MB · Illustrated', isFeatured: false, fileUrl: null },
  { id: 'pub-8', kind: 'Training manual', title: 'Costing and Pricing for Craft Enterprises', year: 2025, metaDetails: 'PDF · 2.1 MB · Workbook', isFeatured: false, fileUrl: null },
  { id: 'pub-9', kind: 'Annual report', title: 'Annual Report 2024', year: 2025, metaDetails: 'PDF · 3.9 MB · English & Dzongkha', isFeatured: false, fileUrl: null },
  { id: 'pub-10', kind: 'Accounts', title: 'Audited Financial Statements 2024', year: 2025, metaDetails: 'PDF · 1.0 MB · Independent auditor', isFeatured: false, fileUrl: null },
  { id: 'pub-11', kind: 'Case study', title: 'Khoma Weavers: Fifteen Years of Kisuthara', year: 2024, metaDetails: 'PDF · 5.4 MB · Photo essay', isFeatured: false, fileUrl: null },
  { id: 'pub-12', kind: 'Sector study', title: 'Market Demand for Bhutanese Handicrafts in Japan', year: 2024, metaDetails: 'PDF · 2.2 MB · Buyer survey', isFeatured: false, fileUrl: null },
];

export async function GET() {
  try {
    const dbPublications = await prisma.publication.findMany({
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    });

    const publications = dbPublications.length > 0 ? dbPublications : DEFAULT_PUBLICATIONS;

    return NextResponse.json({
      success: true,
      publications,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      publications: DEFAULT_PUBLICATIONS,
      fallback: true,
    });
  }
}
