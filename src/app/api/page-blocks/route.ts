import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const pathOf = (value: unknown) => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.length > 200 || value.includes('?') || value.includes('#')) return null;
  return value.replace(/\/$/, '') || '/';
};
const safeUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const url = value.trim();
  return (url.startsWith('/') && !url.startsWith('//')) || /^https:\/\//i.test(url) ? url : null;
};
const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get('all') === '1';
    if (all) await requirePermission(req, 'content:view');
    const pathname = pathOf(req.nextUrl.searchParams.get('path'));
    if (!all && !pathname) return fail('A valid page path is required.', 400);
    const blocks = await prisma.publicPageBlock.findMany({
      where: { ...(pathname ? { pathname } : {}), ...(!all ? { isPublished: true } : {}) },
      orderBy: [{ pathname: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json({ success: true, blocks }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) { return fail(error?.message || 'Unable to load page sections.', error?.statusCode || 500); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:edit');
    const data = await req.json();
    const pathname = pathOf(data.pathname);
    const title = typeof data.title === 'string' ? data.title.trim().slice(0, 250) : '';
    if (!pathname || !title) return fail('Page path and title are required.', 400);
    if (data.imageUrl && !safeUrl(data.imageUrl)) return fail('Image URL must be an internal path or HTTPS URL.', 400);
    if (data.buttonHref && !safeUrl(data.buttonHref)) return fail('Button URL must be an internal path or HTTPS URL.', 400);
    const block = await prisma.publicPageBlock.create({ data: {
      pathname, title, body: String(data.body || '').slice(0, 20000),
      imageUrl: safeUrl(data.imageUrl), buttonLabel: String(data.buttonLabel || '').trim().slice(0, 150) || null,
      buttonHref: safeUrl(data.buttonHref), sortOrder: Number.isInteger(data.sortOrder) ? data.sortOrder : 0,
      isPublished: data.isPublished !== false,
    } });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'PAGE_BLOCK_CREATED', entityType: 'PublicPageBlock', entityId: block.id, details: { pathname } });
    return NextResponse.json({ success: true, block });
  } catch (error: any) { return fail(error?.message || 'Unable to create section.', error?.statusCode || 500); }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:edit');
    const data = await req.json();
    const id = typeof data.id === 'string' ? data.id : '';
    if (!id) return fail('Section ID is required.', 400);
    const pathname = data.pathname === undefined ? undefined : pathOf(data.pathname);
    if (data.pathname !== undefined && !pathname) return fail('Invalid page path.', 400);
    if (data.title !== undefined && !String(data.title).trim()) return fail('Section title is required.', 400);
    if (data.imageUrl && !safeUrl(data.imageUrl)) return fail('Invalid image URL.', 400);
    if (data.buttonHref && !safeUrl(data.buttonHref)) return fail('Invalid button URL.', 400);
    const block = await prisma.publicPageBlock.update({ where: { id }, data: {
      pathname: pathname || undefined, title: data.title === undefined ? undefined : String(data.title).trim().slice(0, 250),
      body: data.body === undefined ? undefined : String(data.body).slice(0, 20000),
      imageUrl: data.imageUrl === undefined ? undefined : safeUrl(data.imageUrl),
      buttonLabel: data.buttonLabel === undefined ? undefined : String(data.buttonLabel).trim().slice(0, 150) || null,
      buttonHref: data.buttonHref === undefined ? undefined : safeUrl(data.buttonHref),
      sortOrder: Number.isInteger(data.sortOrder) ? data.sortOrder : undefined,
      isPublished: typeof data.isPublished === 'boolean' ? data.isPublished : undefined,
    } });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'PAGE_BLOCK_UPDATED', entityType: 'PublicPageBlock', entityId: id, details: { pathname: block.pathname } });
    return NextResponse.json({ success: true, block });
  } catch (error: any) { return fail(error?.message || 'Unable to update section.', error?.statusCode || 500); }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requirePermission(req, 'content:edit');
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return fail('Section ID is required.', 400);
    const block = await prisma.publicPageBlock.delete({ where: { id } });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'PAGE_BLOCK_DELETED', entityType: 'PublicPageBlock', entityId: id, details: { pathname: block.pathname } });
    return NextResponse.json({ success: true });
  } catch (error: any) { return fail(error?.message || 'Unable to delete section.', error?.statusCode || 500); }
}
