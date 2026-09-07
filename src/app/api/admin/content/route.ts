import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:edit');

    const [news, publications, governance] = await Promise.all([
      prisma.newsArticle.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.publication.findMany({
        orderBy: { year: 'desc' },
      }),
      prisma.governanceRecord.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      news,
      publications,
      governance,
    });
  } catch (err: any) {
    console.error('Error fetching admin content:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching content.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { type, ...data } = body;

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';

    if (type === 'NEWS') {
      const article = await prisma.newsArticle.create({
        data: {
          kind: data.category || 'Programs',
          title: data.title,
          dateString: data.dateString || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          blurb: data.excerpt || data.blurb || '',
          content: data.content || null,
          isPublished: true,
        },
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'NEWS_ARTICLE_CREATED',
        entityType: 'NewsArticle',
        entityId: article.id,
        details: { title: article.title },
      });

      return NextResponse.json({ success: true, item: article });
    }

    if (type === 'PUBLICATION') {
      const pub = await prisma.publication.create({
        data: {
          kind: data.category || data.kind || 'Annual report',
          title: data.title,
          year: Number(data.year) || new Date().getFullYear(),
          metaDetails: data.metaDetails || 'PDF · Document',
          fileUrl: data.fileUrl || null,
          isFeatured: Boolean(data.isFeatured),
        },
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'PUBLICATION_CREATED',
        entityType: 'Publication',
        entityId: pub.id,
        details: { title: pub.title },
      });

      return NextResponse.json({ success: true, item: pub });
    }

    return NextResponse.json({ success: false, error: 'Invalid content type.' }, { status: 400 });
  } catch (err: any) {
    console.error('Error creating content item:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error creating content.' },
      { status: err.statusCode || 500 }
    );
  }
}
