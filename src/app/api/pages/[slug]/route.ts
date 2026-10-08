import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { canPreviewDraftPage } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    const page = await prisma.customPage.findUnique({
      where: { slug: slug.toLowerCase().trim() },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    if (!page.isPublished) {
      if (!await canPreviewDraftPage(req.cookies.get('hab_session')?.value)) {
        return NextResponse.json({ error: 'This page is in draft mode and not publicly available' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, page });
  } catch (err: any) {
    console.error('Error fetching public custom page:', err);
    return NextResponse.json({ error: 'Failed to retrieve page' }, { status: 500 });
  }
}
