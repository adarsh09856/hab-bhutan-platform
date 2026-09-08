import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';

async function verifyAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff = user.roleSlug === 'super_admin' ||
                  user.roleSlug === 'staff_operator' ||
                  user.roleSlug === 'trustee_viewer' ||
                  user.permissions?.includes('*') ||
                  user.permissions?.includes('content:edit');
  return isStaff ? user : null;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { imageUrl, caption, altText, linkUrl, sortOrder, isActive } = body;
  try {
    const slide = await prisma.heroSlide.update({
      where: { id: params.id },
      data: {
        ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() }),
        ...(caption !== undefined && { caption: caption.trim() }),
        ...(altText !== undefined && { altText: altText.trim() }),
        ...(linkUrl !== undefined && { linkUrl: linkUrl?.trim() || null }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });
    return NextResponse.json({ slide });
  } catch {
    return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await prisma.heroSlide.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
  }
}