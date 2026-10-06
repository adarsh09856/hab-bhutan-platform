import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const where: any = {};
    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }
    if (status) {
      where.status = status.toUpperCase();
    }

    const tenders = await prisma.tenderRecord.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { closingDate: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      tenders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch tenders' },
      { status: 500 }
    );
  }
}
