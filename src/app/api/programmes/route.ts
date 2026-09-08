import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pillars = await prisma.programmePillar.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, pillars });
  } catch (err: any) {
    console.error('Error fetching programme pillars:', err);
    return NextResponse.json({ success: false, error: 'Database unavailable.' }, { status: 500 });
  }
}