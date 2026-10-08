import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

type PageOverride = {
  text?: string;
  href?: string;
  src?: string;
  alt?: string;
  placeholder?: string;
};

function normalizePath(value: string | null) {
  const path = (value || '/').split('?')[0].trim();
  return path.startsWith('/') ? path : `/${path}`;
}

function cleanOverride(value: unknown): PageOverride {
  if (!value || typeof value !== 'object') return {};
  const source = value as Record<string, unknown>;
  const result: PageOverride = {};
  for (const key of ['text', 'href', 'src', 'alt', 'placeholder'] as const) {
    if (typeof source[key] === 'string') result[key] = source[key] as string;
  }
  return result;
}

export async function GET(req: NextRequest) {
  const pathname = normalizePath(req.nextUrl.searchParams.get('path'));
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
      select: { trustBadges: true },
    });
    const trustBadges = (setting?.trustBadges as Record<string, unknown> | null) || {};
    const pages = (trustBadges.pageOverrides as Record<string, unknown> | null) || {};
    if (req.nextUrl.searchParams.get('all') === '1') {
      const user = await getSessionUser(req);
      const role = String(user?.roleSlug || user?.role || '').toLowerCase();
      if (!user || !['super_admin', 'staff_operator'].includes(role)) {
        return NextResponse.json({ success: false, error: 'Staff login required.' }, { status: 401 });
      }
      return NextResponse.json({ success: true, pages }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      });
    }
    const globalPage = (pages['/__global__'] as Record<string, unknown> | null) || {};
    const page = {
      ...globalPage,
      ...((pages[pathname] as Record<string, unknown> | null) || {}),
    };
    const overrides = Object.fromEntries(
      Object.entries(page).map(([key, value]) => [key, cleanOverride(value)])
    );
    return NextResponse.json({ success: true, pathname, overrides }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch {
    return NextResponse.json({ success: true, pathname, overrides: {}, degraded: true }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const role = String(user?.roleSlug || user?.role || '').toLowerCase();
    if (!user || !['super_admin', 'staff_operator'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Staff login required.' }, { status: 401 });
    }

    const body = await req.json();
    const pathname = normalizePath(typeof body.pathname === 'string' ? body.pathname : '/');
    const key = typeof body.key === 'string' ? body.key.trim().slice(0, 500) : '';
    if (!key) return NextResponse.json({ success: false, error: 'Editable element key is required.' }, { status: 400 });

    const override = cleanOverride(body.override);
    if (body.remove !== true && Object.keys(override).length === 0) {
      return NextResponse.json({ success: false, error: 'At least one editable field is required.' }, { status: 400 });
    }
    const current = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
    if (!current) return NextResponse.json({ success: false, error: 'Site settings are not initialized.' }, { status: 409 });

    const trustBadges = (current.trustBadges as Record<string, unknown> | null) || {};
    const pages = { ...((trustBadges.pageOverrides as Record<string, unknown> | null) || {}) };
    const page = { ...((pages[pathname] as Record<string, unknown> | null) || {}) };

    if (body.remove === true) {
      delete page[key];
      if (Object.keys(page).length === 0) delete pages[pathname];
      else pages[pathname] = page;
    } else {
      page[key] = override;
      pages[pathname] = page;
    }

    await prisma.siteSetting.update({
      where: { id: 'default' },
      data: { trustBadges: { ...trustBadges, pageOverrides: pages } as any },
    });

    try {
      await logAudit({
        actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email,
        action: body.remove === true ? 'PAGE_OVERRIDE_REMOVED' : 'PAGE_OVERRIDE_UPDATED',
        entityType: 'PublicPage', entityId: pathname,
        details: { pathname, key, fields: Object.keys(override) },
      });
    } catch {}

    return NextResponse.json({ success: true, pathname, key, override });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unable to save page content.' }, { status: 500 });
  }
}
