import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');

    const pillars = await prisma.programmePillar.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, pillars });
  } catch (err: any) {
    console.error('Error fetching admin programme pillars:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error fetching programmes.' }, { status: err.statusCode || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { ref, title, description, activities, sortOrder, isActive } = body;

    if (!ref || !title || !description) {
      return NextResponse.json({ success: false, error: 'Ref, title, and description are required.' }, { status: 400 });
    }

    const pillar = await prisma.programmePillar.create({
      data: {
        ref: ref.trim(),
        title: title.trim(),
        description: description.trim(),
        activities: Array.isArray(activities) ? activities : [],
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, pillar });
  } catch (err: any) {
    console.error('Error creating programme pillar:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to create programme.' }, { status: err.statusCode || 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { id, ref, title, description, activities, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Pillar ID is required.' }, { status: 400 });
    }

    const updated = await prisma.programmePillar.update({
      where: { id },
      data: {
        ref: ref ? ref.trim() : undefined,
        title: title ? title.trim() : undefined,
        description: description ? description.trim() : undefined,
        activities: Array.isArray(activities) ? activities : undefined,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json({ success: true, pillar: updated });
  } catch (err: any) {
    console.error('Error updating programme pillar:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to update programme.' }, { status: err.statusCode || 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:edit');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Pillar ID is required.' }, { status: 400 });
    }

    await prisma.programmePillar.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Programme deleted.' });
  } catch (err: any) {
    console.error('Error deleting programme pillar:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete programme.' }, { status: err.statusCode || 500 });
  }
}