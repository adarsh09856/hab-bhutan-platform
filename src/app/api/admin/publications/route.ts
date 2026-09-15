import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');

    const publications = await prisma.publication.findMany({
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, publications });
  } catch (err: any) {
    console.error('Error fetching admin publications:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching publications.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { title, kind, year, metaDetails, fileUrl, isFeatured } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Publication title is required.' },
        { status: 400 }
      );
    }

    const publication = await prisma.publication.create({
      data: {
        title: title.trim(),
        kind: kind ? kind.trim() : 'Annual report',
        year: Number(year) || new Date().getFullYear(),
        metaDetails: metaDetails ? metaDetails.trim() : 'PDF · Document',
        fileUrl: fileUrl ? fileUrl.trim() : null,
        isFeatured: Boolean(isFeatured),
      },
    });

    return NextResponse.json({ success: true, publication });
  } catch (err: any) {
    console.error('Error creating publication:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create publication.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { id, title, kind, year, metaDetails, fileUrl, isFeatured } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Publication ID is required.' }, { status: 400 });
    }

    const publication = await prisma.publication.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        kind: kind !== undefined ? kind.trim() : undefined,
        year: year !== undefined ? Number(year) : undefined,
        metaDetails: metaDetails !== undefined ? metaDetails.trim() : undefined,
        fileUrl: fileUrl !== undefined ? fileUrl : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
      },
    });

    return NextResponse.json({ success: true, publication });
  } catch (err: any) {
    console.error('Error updating publication:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update publication.' },
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
      return NextResponse.json({ success: false, error: 'Publication ID is required.' }, { status: 400 });
    }

    await prisma.publication.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Publication deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting publication:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete publication.' },
      { status: err.statusCode || 500 }
    );
  }
}
