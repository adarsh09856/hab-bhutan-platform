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

export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ slides });
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { imageUrl, caption, altText, linkUrl, sortOrder, isActive } = body;
  if (!imageUrl?.trim() || !caption?.trim() || !altText?.trim()) {
    return NextResponse.json({ error: 'imageUrl, caption and altText are required' }, { status: 400 });
  }
  const slide = await prisma.heroSlide.create({
    data: {
      imageUrl: imageUrl.trim(),
      caption: caption.trim(),
      altText: altText.trim(),
      linkUrl: linkUrl?.trim() || null,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    },
  });
  return NextResponse.json({ slide }, { status: 201 });
}
