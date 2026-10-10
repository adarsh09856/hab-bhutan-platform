import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    const res = NextResponse.json({ success: true, projects: rawProjects.map(unpackProject) });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;
  } catch (error) {
    console.error('Failed to load projects:', error);
    return NextResponse.json(
      { success: false, error: 'The projects directory is temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
