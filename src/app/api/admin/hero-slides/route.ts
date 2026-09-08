import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get('hab_staff_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch { return null; }
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
