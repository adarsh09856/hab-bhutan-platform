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

export async function GET() {
  try {
    const projects = await prisma.projectRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (projects.length > 0) {
      return NextResponse.json({ success: true, projects });
    }

    return NextResponse.json({ success: true, projects: DEFAULT_PROJECTS, fallback: true });
  } catch (err: any) {
    return NextResponse.json({ success: true, projects: DEFAULT_PROJECTS, fallback: true });
  }
}
