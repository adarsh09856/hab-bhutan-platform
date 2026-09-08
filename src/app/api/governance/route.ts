import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const records = await prisma.governanceRecord.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const board = records
      .filter((r) => r.category === 'BOARD_OF_TRUSTEES')
      .map((r) => ({
        role: r.roleTitle,
        name: r.individualName,
        note: r.chapterOrNote,
      }));

    const team = records
      .filter((r) => r.category === 'SECRETARIAT')
      .map((r) => ({
        role: r.roleTitle,
        name: r.individualName,
        note: r.chapterOrNote,
      }));

    const milestones = records
      .filter((r) => r.category === 'MILESTONE')
      .map((r) => ({
        y: r.roleTitle,
        t: r.individualName,
      }));

    return NextResponse.json({
      success: true,
      records,
      board,
      team,
      milestones,
    });
  } catch (err: any) {
    console.error('Error fetching governance records:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching governance records.' },
      { status: 500 }
    );
  }
}
