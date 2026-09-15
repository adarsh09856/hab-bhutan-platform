import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');

    const records = await prisma.governanceRecord.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, records });
  } catch (err: any) {
    console.error('Error fetching admin governance records:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching governance records.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { category, roleTitle, individualName, chapterOrNote, sortOrder } = body;

    if (!category || !roleTitle || !individualName) {
      return NextResponse.json(
        { success: false, error: 'Category, role/title, and name are required.' },
        { status: 400 }
      );
    }

    const record = await prisma.governanceRecord.create({
      data: {
        category: category.trim(),
        roleTitle: roleTitle.trim(),
        individualName: individualName.trim(),
        chapterOrNote: (chapterOrNote || '').trim(),
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    console.error('Error creating governance record:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create governance record.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { id, category, roleTitle, individualName, chapterOrNote, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Record ID is required.' }, { status: 400 });
    }

    const record = await prisma.governanceRecord.update({
      where: { id },
      data: {
        category: category !== undefined ? category.trim() : undefined,
        roleTitle: roleTitle !== undefined ? roleTitle.trim() : undefined,
        individualName: individualName !== undefined ? individualName.trim() : undefined,
        chapterOrNote: chapterOrNote !== undefined ? chapterOrNote.trim() : undefined,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    console.error('Error updating governance record:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update governance record.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission(req, 'content:edit');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Record ID is required.' }, { status: 400 });
    }

    await prisma.governanceRecord.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Record deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting governance record:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete governance record.' },
      { status: err.statusCode || 500 }
    );
  }
}
