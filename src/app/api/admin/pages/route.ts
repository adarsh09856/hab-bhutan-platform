import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');

    let customPages: any[] = [];
    try {
      customPages = await prisma.customPage.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
    } catch (dbErr: any) {
      console.warn('Could not query customPage table (may need db push):', dbErr.message);
      customPages = [];
    }

    return NextResponse.json({
      success: true,
      customPages,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:create');
    const body = await req.json();

    const {
      title,
      slug: rawSlug,
      category = 'General',
      excerpt = '',
      content,
      bannerUrl = null,
      seoTitle = null,
      seoDescription = null,
      isPublished = true,
      showInHeaderNav = false,
      showInFooterNav = false,
      sortOrder = 0,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Page title is required' }, { status: 400 });
    }

    // Generate or sanitize slug
    const cleanSlug = (rawSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      return NextResponse.json({ error: 'A valid page slug is required' }, { status: 400 });
    }

    // Check if slug already exists
    const existing = await prisma.customPage.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json({ error: `A page with URL slug "/pages/${cleanSlug}" already exists.` }, { status: 409 });
    }

    const newPage = await prisma.customPage.create({
      data: {
        slug: cleanSlug,
        title: title.trim(),
        category: category.trim() || 'General',
        excerpt: excerpt?.trim() || null,
        content: content || '',
        bannerUrl: bannerUrl?.trim() || null,
        seoTitle: seoTitle?.trim() || null,
        seoDescription: seoDescription?.trim() || null,
        isPublished: Boolean(isPublished),
        showInHeaderNav: Boolean(showInHeaderNav),
        showInFooterNav: Boolean(showInFooterNav),
        sortOrder: Number(sortOrder) || 0,
      },
    });

    // Auto-link to Navigation if requested
    if (showInHeaderNav) {
      try {
        const headerCount = await prisma.navigationItem.count({ where: { menuType: 'HEADER' } });
        await prisma.navigationItem.create({
          data: {
            menuType: 'HEADER',
            label: newPage.title,
            href: `/pages/${newPage.slug}`,
            sortOrder: headerCount + 1,
            isActive: true,
          },
        });
      } catch (navErr) {
        console.warn('Could not auto-create header navigation item:', navErr);
      }
    }

    if (showInFooterNav) {
      try {
        const footerCount = await prisma.navigationItem.count({ where: { menuType: 'FOOTER' } });
        await prisma.navigationItem.create({
          data: {
            menuType: 'FOOTER',
            column: 'Organization',
            label: newPage.title,
            href: `/pages/${newPage.slug}`,
            sortOrder: footerCount + 1,
            isActive: true,
          },
        });
      } catch (navErr) {
        console.warn('Could not auto-create footer navigation item:', navErr);
      }
    }

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: getClientIp(req),
      action: 'CUSTOM_PAGE_CREATED',
      entityType: 'CustomPage',
      entityId: newPage.id,
      details: { title: newPage.title, slug: newPage.slug, category: newPage.category },
    });

    return NextResponse.json({ success: true, page: newPage }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating custom page:', err);
    return NextResponse.json({ error: err.message || 'Failed to create page' }, { status: err.statusCode || 500 });
  }
}
