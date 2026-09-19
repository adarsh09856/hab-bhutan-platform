import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePermission(req, 'content:view');
    const { id } = params;

    const page = await prisma.customPage.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, page });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.statusCode || 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requirePermission(req, 'content:edit');
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.customPage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const {
      title,
      slug: rawSlug,
      category,
      excerpt,
      content,
      bannerUrl,
      seoTitle,
      seoDescription,
      isPublished,
      showInHeaderNav,
      showInFooterNav,
      sortOrder,
    } = body;

    let cleanSlug = existing.slug;
    if (rawSlug && rawSlug !== existing.slug) {
      cleanSlug = rawSlug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check conflict
      const conflict = await prisma.customPage.findUnique({
        where: { slug: cleanSlug },
      });
      if (conflict && conflict.id !== id) {
        return NextResponse.json({ error: `Slug "/pages/${cleanSlug}" is already in use by another page.` }, { status: 409 });
      }
    }

    const oldHref = `/pages/${existing.slug}`;
    const newHref = `/pages/${cleanSlug}`;

    const updated = await prisma.customPage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        slug: cleanSlug,
        ...(category !== undefined && { category: category.trim() }),
        ...(excerpt !== undefined && { excerpt: excerpt?.trim() || null }),
        ...(content !== undefined && { content }),
        ...(bannerUrl !== undefined && { bannerUrl: bannerUrl?.trim() || null }),
        ...(seoTitle !== undefined && { seoTitle: seoTitle?.trim() || null }),
        ...(seoDescription !== undefined && { seoDescription: seoDescription?.trim() || null }),
        ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
        ...(showInHeaderNav !== undefined && { showInHeaderNav: Boolean(showInHeaderNav) }),
        ...(showInFooterNav !== undefined && { showInFooterNav: Boolean(showInFooterNav) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      },
    });

    // Sync Header Navigation
    if (showInHeaderNav !== undefined) {
      try {
        if (showInHeaderNav) {
          const navItem = await prisma.navigationItem.findFirst({
            where: { menuType: 'HEADER', href: oldHref },
          });
          if (navItem) {
            await prisma.navigationItem.update({
              where: { id: navItem.id },
              data: { label: updated.title, href: newHref, isActive: true },
            });
          } else {
            const count = await prisma.navigationItem.count({ where: { menuType: 'HEADER' } });
            await prisma.navigationItem.create({
              data: {
                menuType: 'HEADER',
                label: updated.title,
                href: newHref,
                sortOrder: count + 1,
                isActive: true,
              },
            });
          }
        } else {
          await prisma.navigationItem.deleteMany({
            where: { menuType: 'HEADER', href: { in: [oldHref, newHref] } },
          });
        }
      } catch (navErr) {
        console.warn('Navigation sync warning for header:', navErr);
      }
    } else if (oldHref !== newHref) {
      // Update href on existing nav item if slug changed
      try {
        await prisma.navigationItem.updateMany({
          where: { href: oldHref },
          data: { href: newHref },
        });
      } catch {}
    }

    // Sync Footer Navigation
    if (showInFooterNav !== undefined) {
      try {
        if (showInFooterNav) {
          const navItem = await prisma.navigationItem.findFirst({
            where: { menuType: 'FOOTER', href: oldHref },
          });
          if (navItem) {
            await prisma.navigationItem.update({
              where: { id: navItem.id },
              data: { label: updated.title, href: newHref, isActive: true },
            });
          } else {
            const count = await prisma.navigationItem.count({ where: { menuType: 'FOOTER' } });
            await prisma.navigationItem.create({
              data: {
                menuType: 'FOOTER',
                column: 'Association',
                label: updated.title,
                href: newHref,
                sortOrder: count + 1,
                isActive: true,
              },
            });
          }
        } else {
          await prisma.navigationItem.deleteMany({
            where: { menuType: 'FOOTER', href: { in: [oldHref, newHref] } },
          });
        }
      } catch (navErr) {
        console.warn('Navigation sync warning for footer:', navErr);
      }
    }

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: getClientIp(req),
      action: 'CUSTOM_PAGE_UPDATED',
      entityType: 'CustomPage',
      entityId: updated.id,
      details: { title: updated.title, slug: updated.slug },
    });

    return NextResponse.json({ success: true, page: updated });
  } catch (err: any) {
    console.error('Error updating custom page:', err);
    return NextResponse.json({ error: err.message || 'Failed to update page' }, { status: err.statusCode || 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requirePermission(req, 'content:delete');
    const { id } = params;

    const page = await prisma.customPage.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Unlink any NavigationItem pointing to this page
    try {
      await prisma.navigationItem.deleteMany({
        where: { href: `/pages/${page.slug}` },
      });
    } catch (navErr) {
      console.warn('Could not auto-delete navigation item:', navErr);
    }

    await prisma.customPage.delete({
      where: { id },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: getClientIp(req),
      action: 'CUSTOM_PAGE_DELETED',
      entityType: 'CustomPage',
      entityId: id,
      details: { title: page.title, slug: page.slug },
    });

    return NextResponse.json({ success: true, message: `Page "${page.title}" deleted successfully.` });
  } catch (err: any) {
    console.error('Error deleting custom page:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete page' }, { status: err.statusCode || 500 });
  }
}
