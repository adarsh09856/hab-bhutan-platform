import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');

    const rawPillars = await prisma.programmePillar.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const pillars = rawPillars.map((p: any) => {
      let activities: string[] = [];
      let imageUrl = '';
      if (Array.isArray(p.activities)) {
        activities = p.activities;
      } else if (p.activities && typeof p.activities === 'object') {
        activities = p.activities.list || [];
        imageUrl = p.activities.imageUrl || '';
      }
      return {
        ...p,
        activities,
        imageUrl,
      };
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
    const { ref, title, description, activities, imageUrl, sortOrder, isActive } = body;

    if (!ref || !title || !description) {
      return NextResponse.json({ success: false, error: 'Ref, title, and description are required.' }, { status: 400 });
    }

    const storedActivities = {
      list: Array.isArray(activities) ? activities : [],
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
    };

    const pillar = await prisma.programmePillar.create({
      data: {
        ref: ref.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        activities: storedActivities,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      pillar: {
        ...pillar,
        activities: storedActivities.list,
        imageUrl: storedActivities.imageUrl,
      },
    });
  } catch (err: any) {
    console.error('Error creating programme pillar:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to create programme.' }, { status: err.statusCode || 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { id, ref, title, description, activities, imageUrl, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Pillar ID is required.' }, { status: 400 });
    }

    const existing = await prisma.programmePillar.findUnique({ where: { id } });
    let currentImg = '';
    if (existing?.activities && typeof existing.activities === 'object' && !Array.isArray(existing.activities)) {
      currentImg = (existing.activities as any).imageUrl || '';
    }
    const finalImg = imageUrl !== undefined ? String(imageUrl).trim() : currentImg;
    const finalActivities = Array.isArray(activities)
      ? activities
      : existing?.activities && typeof existing.activities === 'object' && (existing.activities as any).list
      ? (existing.activities as any).list
      : Array.isArray(existing?.activities)
      ? existing.activities
      : [];

    const storedActivities = {
      list: finalActivities,
      imageUrl: finalImg,
    };

    const updated = await prisma.programmePillar.update({
      where: { id },
      data: {
        ref: ref ? ref.trim().toUpperCase() : undefined,
        title: title ? title.trim() : undefined,
        description: description ? description.trim() : undefined,
        activities: storedActivities,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      pillar: {
        ...updated,
        activities: storedActivities.list,
        imageUrl: storedActivities.imageUrl,
      },
    });
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