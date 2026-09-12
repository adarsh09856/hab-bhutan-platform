import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');

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
    const body = await req.json();
    const { type, ...data } = body;
    const ip = getClientIp(req);

    if (type === 'NEWS') {
      const session = await requirePermission(req, 'content:create');
      if (!data.title) {
        return NextResponse.json({ success: false, error: 'Article title is required.' }, { status: 400 });
      }

      const article = await prisma.newsArticle.create({
        data: {
          kind: data.kind || data.category || 'Programs',
          title: data.title.trim(),
          dateString: data.dateString || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          blurb: data.blurb || data.excerpt || '',
          content: data.content || null,
          isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
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
        details: { title: article.title, kind: article.kind },
      });

      return NextResponse.json({ success: true, item: article });
    }

    if (type === 'PUBLICATION') {
      const session = await requirePermission(req, 'content:create');
      if (!data.title) {
        return NextResponse.json({ success: false, error: 'Publication title is required.' }, { status: 400 });
      }

      const pub = await prisma.publication.create({
        data: {
          kind: data.kind || data.category || 'Annual report',
          title: data.title.trim(),
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
        details: { title: pub.title, year: pub.year },
      });

      return NextResponse.json({ success: true, item: pub });
    }

    if (type === 'GOVERNANCE') {
      const session = await requirePermission(req, 'governance:create');
      if (!data.roleTitle || !data.individualName) {
        return NextResponse.json(
          { success: false, error: 'Role title and individual name are required.' },
          { status: 400 }
        );
      }

      const gov = await prisma.governanceRecord.create({
        data: {
          category: data.category || 'SECRETARIAT',
          roleTitle: data.roleTitle.trim(),
          individualName: data.individualName.trim(),
          chapterOrNote: data.chapterOrNote?.trim() || '',
          sortOrder: Number(data.sortOrder) || 0,
        },
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'GOVERNANCE_RECORD_CREATED',
        entityType: 'GovernanceRecord',
        entityId: gov.id,
        details: { roleTitle: gov.roleTitle, individualName: gov.individualName },
      });

      return NextResponse.json({ success: true, item: gov });
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id, ...data } = body;
    const ip = getClientIp(req);

    if (!type || !id) {
      return NextResponse.json({ success: false, error: 'Content type and id are required.' }, { status: 400 });
    }

    if (type === 'NEWS') {
      const session = await requirePermission(req, 'content:edit');
      const updateData: any = {};
      if (data.title) updateData.title = data.title.trim();
      if (data.kind || data.category) updateData.kind = data.kind || data.category;
      if (data.dateString) updateData.dateString = data.dateString;
      if (data.blurb !== undefined || data.excerpt !== undefined) updateData.blurb = data.blurb ?? data.excerpt;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.isPublished !== undefined) updateData.isPublished = Boolean(data.isPublished);

      const updated = await prisma.newsArticle.update({
        where: { id },
        data: updateData,
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'NEWS_ARTICLE_UPDATED',
        entityType: 'NewsArticle',
        entityId: id,
        details: { changes: updateData },
      });

      return NextResponse.json({ success: true, item: updated });
    }

    if (type === 'PUBLICATION') {
      const session = await requirePermission(req, 'content:edit');
      const updateData: any = {};
      if (data.title) updateData.title = data.title.trim();
      if (data.kind || data.category) updateData.kind = data.kind || data.category;
      if (data.year !== undefined) updateData.year = Number(data.year);
      if (data.metaDetails) updateData.metaDetails = data.metaDetails;
      if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;
      if (data.isFeatured !== undefined) updateData.isFeatured = Boolean(data.isFeatured);

      const updated = await prisma.publication.update({
        where: { id },
        data: updateData,
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'PUBLICATION_UPDATED',
        entityType: 'Publication',
        entityId: id,
        details: { changes: updateData },
      });

      return NextResponse.json({ success: true, item: updated });
    }

    if (type === 'GOVERNANCE') {
      const session = await requirePermission(req, 'governance:edit');
      const updateData: any = {};
      if (data.category) updateData.category = data.category;
      if (data.roleTitle) updateData.roleTitle = data.roleTitle.trim();
      if (data.individualName) updateData.individualName = data.individualName.trim();
      if (data.chapterOrNote !== undefined) updateData.chapterOrNote = data.chapterOrNote.trim();
      if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);

      const updated = await prisma.governanceRecord.update({
        where: { id },
        data: updateData,
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'GOVERNANCE_RECORD_UPDATED',
        entityType: 'GovernanceRecord',
        entityId: id,
        details: { changes: updateData },
      });

      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid content type.' }, { status: 400 });
  } catch (err: any) {
    console.error('Error updating content item:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating content.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let type = searchParams.get('type');
    let id = searchParams.get('id');

    if (!type || !id) {
      try {
        const body = await req.json();
        type = body.type;
        id = body.id;
      } catch {
        // body empty
      }
    }

    if (!type || !id) {
      return NextResponse.json({ success: false, error: 'Content type and id are required.' }, { status: 400 });
    }

    const ip = getClientIp(req);

    if (type === 'NEWS') {
      const session = await requirePermission(req, 'content:delete');
      const article = await prisma.newsArticle.findUnique({ where: { id } });
      if (!article) return NextResponse.json({ success: false, error: 'Article not found.' }, { status: 404 });

      await prisma.newsArticle.delete({ where: { id } });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'NEWS_ARTICLE_DELETED',
        entityType: 'NewsArticle',
        entityId: id,
        details: { title: article.title },
      });

      return NextResponse.json({ success: true, message: `Article '${article.title}' deleted.` });
    }

    if (type === 'PUBLICATION') {
      const session = await requirePermission(req, 'content:delete');
      const pub = await prisma.publication.findUnique({ where: { id } });
      if (!pub) return NextResponse.json({ success: false, error: 'Publication not found.' }, { status: 404 });

      await prisma.publication.delete({ where: { id } });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'PUBLICATION_DELETED',
        entityType: 'Publication',
        entityId: id,
        details: { title: pub.title },
      });

      return NextResponse.json({ success: true, message: `Publication '${pub.title}' deleted.` });
    }

    if (type === 'GOVERNANCE') {
      const session = await requirePermission(req, 'governance:delete');
      const gov = await prisma.governanceRecord.findUnique({ where: { id } });
      if (!gov) return NextResponse.json({ success: false, error: 'Governance record not found.' }, { status: 404 });

      await prisma.governanceRecord.delete({ where: { id } });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'GOVERNANCE_RECORD_DELETED',
        entityType: 'GovernanceRecord',
        entityId: id,
        details: { roleTitle: gov.roleTitle, individualName: gov.individualName },
      });

      return NextResponse.json({ success: true, message: `Governance record '${gov.roleTitle}' deleted.` });
    }

    return NextResponse.json({ success: false, error: 'Invalid content type.' }, { status: 400 });
  } catch (err: any) {
    console.error('Error deleting content item:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error deleting content.' },
      { status: err.statusCode || 500 }
    );
  }
}

export const PUT = PATCH;

