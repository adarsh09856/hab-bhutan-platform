import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { moveToRecycleBin } from '@/lib/recycle-bin';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest, write = false) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff =
    user.roleSlug === 'super_admin' ||
    user.roleSlug === 'staff_operator' ||
    user.permissions?.includes('*') ||
    user.permissions?.includes('content:edit') ||
    (!write && user.permissions?.includes('content:view'));
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const tenders = await prisma.tenderRecord.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, tenders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch tenders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req, true);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      tenderNumber,
      title,
      category = 'Procurement',
      description,
      openingDate,
      closingDate,
      documentUrl,
      documentType = 'PDF',
      documentTitle = 'Tender Document & Terms',
      submissionEmail = 'officehab@gmail.com',
      contactPerson = 'Secretary Desk, HAB',
      contactPhone = '+975-2-338089',
      estimatedBudget,
      eligibility,
      status = 'OPEN',
      sortOrder = 0,
    } = body;

    if (!tenderNumber || !title || !description || !closingDate) {
      return NextResponse.json(
        { error: 'tenderNumber, title, description, and closingDate are required' },
        { status: 400 }
      );
    }

    const tender = await prisma.tenderRecord.create({
      data: {
        tenderNumber: tenderNumber.trim().toUpperCase(),
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        openingDate: openingDate ? new Date(openingDate) : new Date(),
        closingDate: new Date(closingDate),
        documentUrl: documentUrl || null,
        documentType: documentType || 'PDF',
        documentTitle: documentTitle || null,
        submissionEmail: submissionEmail.trim(),
        contactPerson: contactPerson.trim(),
        contactPhone: contactPhone.trim(),
        estimatedBudget: estimatedBudget ? String(estimatedBudget).trim() : null,
        eligibility: eligibility ? String(eligibility).trim() : null,
        status: status.toUpperCase(),
        sortOrder: Number(sortOrder) || 0,
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'TENDER_CREATED',
      entityType: 'TenderRecord',
      entityId: tender.id,
      details: { tenderNumber: tender.tenderNumber, title: tender.title },
    });

    return NextResponse.json({ success: true, tender });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create tender' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req, true);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, tenderNumber, ...rest } = body;

    if (!id && !tenderNumber) {
      return NextResponse.json({ error: 'id or tenderNumber is required' }, { status: 400 });
    }

    const where = id ? { id } : { tenderNumber };

    const updateData: any = {};
    if (rest.title !== undefined) updateData.title = rest.title.trim();
    if (rest.category !== undefined) updateData.category = rest.category.trim();
    if (rest.description !== undefined) updateData.description = rest.description.trim();
    if (rest.openingDate !== undefined) updateData.openingDate = new Date(rest.openingDate);
    if (rest.closingDate !== undefined) updateData.closingDate = new Date(rest.closingDate);
    if (rest.documentUrl !== undefined) updateData.documentUrl = rest.documentUrl;
    if (rest.documentType !== undefined) updateData.documentType = rest.documentType;
    if (rest.documentTitle !== undefined) updateData.documentTitle = rest.documentTitle;
    if (rest.submissionEmail !== undefined) updateData.submissionEmail = rest.submissionEmail.trim();
    if (rest.contactPerson !== undefined) updateData.contactPerson = rest.contactPerson.trim();
    if (rest.contactPhone !== undefined) updateData.contactPhone = rest.contactPhone.trim();
    if (rest.estimatedBudget !== undefined) updateData.estimatedBudget = rest.estimatedBudget;
    if (rest.eligibility !== undefined) updateData.eligibility = rest.eligibility;
    if (rest.status !== undefined) updateData.status = rest.status.toUpperCase();
    if (rest.sortOrder !== undefined) updateData.sortOrder = Number(rest.sortOrder);

    const updated = await prisma.tenderRecord.update({
      where,
      data: updateData,
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'TENDER_UPDATED',
      entityType: 'TenderRecord',
      entityId: updated.id,
      details: { changes: updateData },
    });

    return NextResponse.json({ success: true, tender: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update tender' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await verifyAdmin(req, true);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    const existing = await prisma.tenderRecord.findUnique({ where: { id } });
    if (existing) {
      await moveToRecycleBin({
        entityType: 'TENDER',
        originalId: existing.id,
        itemTitle: `${existing.title} (${existing.tenderNumber})`,
        itemData: existing,
        deletedBy: user.email,
        reason: 'Deleted by administrator from Tenders Studio',
      });
    }

    const deleted = await prisma.tenderRecord.delete({
      where: { id },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'TENDER_DELETED',
      entityType: 'TenderRecord',
      entityId: deleted.id,
      details: { tenderNumber: deleted.tenderNumber, title: deleted.title },
    });

    return NextResponse.json({ success: true, deleted: true, message: `Tender '${deleted.title}' moved to Recycle Bin.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete tender' }, { status: 500 });
  }
}
