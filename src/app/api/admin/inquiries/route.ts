import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'content:view');

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, inquiries });
  } catch (err: any) {
    console.error('Error fetching admin inquiries:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch inquiries.' }, { status: err.statusCode || 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'content:edit');
    const body = await req.json();
    const { id, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Inquiry ID is required.' }, { status: 400 });
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
      },
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err: any) {
    console.error('Error updating inquiry:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to update inquiry.' }, { status: err.statusCode || 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission(req, 'content:edit');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Inquiry ID is required.' }, { status: 400 });
    }

    await prisma.inquiry.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Inquiry deleted.' });
  } catch (err: any) {
    console.error('Error deleting inquiry:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete inquiry.' }, { status: err.statusCode || 500 });
  }
}
