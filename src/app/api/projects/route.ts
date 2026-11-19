import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getProjectCoverPhotoUrl } from '@/lib/project-media';

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
    activitiesDz: Array.isArray(p.activitiesDz) ? p.activitiesDz : [],
    resultsDz: Array.isArray(p.resultsDz) ? p.resultsDz : [],
    coverPhotoUrl: getProjectCoverPhotoUrl({ ...p, coverPhotoUrl }),
    reportPdfUrl: reportPdfUrl || p.reportPdfUrl || '',
    image_path: getProjectCoverPhotoUrl({ ...p, coverPhotoUrl }),
  };
}

export async function GET() {
  try {
    const [rawProjects, settings] = await Promise.all([
      prisma.projectRecord.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } }).catch(() => null),
    ]);

    const trustBadges = (settings?.trustBadges as Record<string, unknown> | null) || {};
    const bannerSlides = Array.isArray(trustBadges.projectBannerSlides)
      ? trustBadges.projectBannerSlides.filter((slide: any) => slide && slide.isActive !== false).sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      : [];

    const res = NextResponse.json({
      success: true,
      projects: rawProjects.map(unpackProject),
      projectBannerSlides: bannerSlides,
      hasProjectBannerSlides: Array.isArray(trustBadges.projectBannerSlides) && trustBadges.projectBannerSlides.length > 0,
    });
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
