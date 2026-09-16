import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    status: 'current',
    name: 'Sustainable Bhutanese Handicrafts (SWITCH-Asia)',
    partner: 'EU SWITCH-Asia · with GrAT and SHINE',
    period: '2024 – 2027',
    budget: 'EUR 1.4 m',
    progressPercent: 62,
    summary: 'Shifting member enterprises to resource-efficient production: natural dyes, waste reduction and cleaner finishing, while holding craft quality.',
    activities: [
      'Cleaner-production audits in 240 workshops',
      'Natural dye and low-waste finishing training',
      'Green business plans and access to finance',
      'Eco-label criteria drafted with RGoB',
    ],
    results: [
      { n: '240', l: 'Enterprises audited' },
      { n: '1,180', l: 'Artisans trained' },
      { n: '31%', l: 'Average waste reduction' },
    ],
  },
  {
    id: 'proj-2',
    status: 'current',
    name: 'Market Access for Rural Artisans',
    partner: 'Enhanced Integrated Framework (EIF)',
    period: '2025 – 2027',
    budget: 'USD 620,000',
    progressPercent: 38,
    summary: 'Connecting rural producer groups to export buyers through the HAB e-shop, trade fairs and consolidated EMS shipping.',
    activities: [
      'Product photography and cataloguing for 400 items',
      'Export documentation clinics in six dzongkhags',
      'Buyer missions to India, Thailand and Japan',
      'Consolidated shipping desk at the secretariat',
    ],
    results: [
      { n: '400', l: 'Products catalogued' },
      { n: '14', l: 'Export buyers engaged' },
      { n: '6', l: 'Dzongkhags covered' },
    ],
  },
];

function unpackProject(p: any) {
  if (!p) return p;
  let activities: string[] = [];
  let coverPhotoUrl = '';
  let reportPdfUrl = '';

  if (Array.isArray(p.activities)) {
    activities = p.activities;
  } else if (p.activities && typeof p.activities === 'object') {
    activities = p.activities.list || [];
    coverPhotoUrl = p.activities.coverPhotoUrl || '';
    reportPdfUrl = p.activities.reportPdfUrl || '';
  }

  return {
    ...p,
    activities,
    coverPhotoUrl: coverPhotoUrl || p.coverPhotoUrl || '',
    reportPdfUrl: reportPdfUrl || p.reportPdfUrl || '',
    image_path: coverPhotoUrl || p.image_path || '',
  };
}

export async function GET() {
  try {
    const rawProjects = await prisma.projectRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });

    let res: NextResponse;
    if (rawProjects.length > 0) {
      res = NextResponse.json({ success: true, projects: rawProjects.map(unpackProject) });
    } else {
      res = NextResponse.json({ success: true, projects: DEFAULT_PROJECTS.map(unpackProject), fallback: true });
    }
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch (err: any) {
    const res = NextResponse.json({ success: true, projects: DEFAULT_PROJECTS.map(unpackProject), fallback: true });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  }
}
