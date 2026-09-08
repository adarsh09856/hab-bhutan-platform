import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, imageUrl: true, caption: true, altText: true, linkUrl: true, sortOrder: true },
    });
    return NextResponse.json({ slides });
  } catch {
    return NextResponse.json({ slides: [] });
  }
}
