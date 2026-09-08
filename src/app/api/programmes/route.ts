import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PROGRAM_OBJECTS } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pillars = await prisma.programmePillar.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (pillars.length > 0) {
      return NextResponse.json({ success: true, pillars });
    }
  } catch {}
  return NextResponse.json({
    success: true,
    pillars: PROGRAM_OBJECTS.map((p, i) => ({
      id: p.ref,
      ref: p.ref,
      title: p.t,
      description: p.d,
      activities: p.activities,
      sortOrder: i + 1,
      isActive: true,
    })),
  });
}