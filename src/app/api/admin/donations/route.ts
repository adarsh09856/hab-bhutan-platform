import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff =
    user.roleSlug === 'super_admin' ||
    user.roleSlug === 'staff_operator' ||
    user.permissions?.includes('*') ||
    user.permissions?.includes('reports:view') ||
    user.permissions?.includes('orders:edit');
  return isStaff ? user : null;
}

// GET /api/admin/donations - list donations with filters
export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const pillarKey = searchParams.get('pillarKey');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim().toLowerCase();

    const where: any = {};
    if (pillarKey && pillarKey !== 'ALL') where.pillarKey = pillarKey;
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { donorName: { contains: search, mode: 'insensitive' } },
        { donorEmail: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const donations = await prisma.donationRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pillar: {
          select: { title: true, key: true },
        },
      },
    });

    const totalUSD = donations.reduce((sum, d) => sum + (d.status === 'COMPLETED' ? d.amountUSD : 0), 0);
    const completedCount = donations.filter((d) => d.status === 'COMPLETED').length;
    const pendingCount = donations.filter((d) => d.status === 'PENDING').length;

    return NextResponse.json({
      success: true,
      donations,
      totalUSD,
      completedCount,
      pendingCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch donations' }, { status: 500 });
  }
}

// POST /api/admin/donations - record manual/offline donation
export async function POST(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      pillarKey,
      donorName,
      donorEmail,
      amountUSD,
      frequency = 'ONE_TIME',
      status = 'COMPLETED',
      receiptNumber: customReceipt,
    } = body;

    if (!pillarKey || !donorName || !donorEmail || !amountUSD) {
      return NextResponse.json(
        { error: 'pillarKey, donorName, donorEmail, and amountUSD are required' },
        { status: 400 }
      );
    }

    const numAmount = Number(amountUSD);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
    }

    // Generate unique receipt number if not provided
    const receiptNumber =
      customReceipt && customReceipt.trim()
        ? customReceipt.trim().toUpperCase()
        : `HAB-DON-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const donation = await prisma.donationRecord.create({
      data: {
        pillarKey: pillarKey.trim().toLowerCase(),
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim().toLowerCase(),
        amountUSD: numAmount,
        frequency: frequency === 'MONTHLY' ? 'MONTHLY' : 'ONE_TIME',
        status: status === 'PENDING' ? 'PENDING' : 'COMPLETED',
        receiptNumber,
      },
      include: {
        pillar: {
          select: { title: true, key: true },
        },
      },
    });

    // If completed, increment raised amount on the pillar
    if (donation.status === 'COMPLETED') {
      try {
        await prisma.supportPillar.update({
          where: { key: pillarKey.trim().toLowerCase() },
          data: {
            raisedAmountUSD: { increment: numAmount },
          },
        });
      } catch {
        // Non-blocking if pillar not matched
      }
    }

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'OFFLINE_DONATION_RECORDED',
      entityType: 'DonationRecord',
      entityId: donation.id,
      details: {
        receiptNumber,
        amountUSD: numAmount,
        pillarKey,
        donorName,
        status: donation.status,
      },
    });

    return NextResponse.json({ success: true, donation });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Receipt number already exists. Please use a unique receipt number.' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Failed to record donation' }, { status: 500 });
  }
}

// PATCH /api/admin/donations - update status or donation details
export async function PATCH(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, status, donorName, donorEmail, amountUSD, frequency } = body;

    if (!id) {
      return NextResponse.json({ error: 'Donation id is required' }, { status: 400 });
    }

    const existing = await prisma.donationRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Donation record not found' }, { status: 404 });
    }

    const newAmount = amountUSD !== undefined ? Number(amountUSD) : existing.amountUSD;
    const newStatus = status || existing.status;

    // Financial reconciliation if status or amount changes
    const wasCompleted = existing.status === 'COMPLETED';
    const isNowCompleted = newStatus === 'COMPLETED';

    if (wasCompleted && !isNowCompleted) {
      // Decrement previously added amount
      await prisma.supportPillar.update({
        where: { key: existing.pillarKey },
        data: { raisedAmountUSD: { decrement: existing.amountUSD } },
      }).catch(() => {});
    } else if (!wasCompleted && isNowCompleted) {
      // Increment newly completed amount
      await prisma.supportPillar.update({
        where: { key: existing.pillarKey },
        data: { raisedAmountUSD: { increment: newAmount } },
      }).catch(() => {});
    } else if (wasCompleted && isNowCompleted && newAmount !== existing.amountUSD) {
      // Adjust difference
      const diff = newAmount - existing.amountUSD;
      await prisma.supportPillar.update({
        where: { key: existing.pillarKey },
        data: { raisedAmountUSD: { increment: diff } },
      }).catch(() => {});
    }

    const updated = await prisma.donationRecord.update({
      where: { id },
      data: {
        ...(donorName && { donorName: donorName.trim() }),
        ...(donorEmail && { donorEmail: donorEmail.trim().toLowerCase() }),
        ...(amountUSD !== undefined && { amountUSD: newAmount }),
        ...(frequency && { frequency }),
        ...(status && { status: newStatus }),
      },
      include: {
        pillar: { select: { title: true, key: true } },
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'DONATION_RECORD_UPDATED',
      entityType: 'DonationRecord',
      entityId: updated.id,
      details: {
        receiptNumber: updated.receiptNumber,
        status: updated.status,
        amountUSD: updated.amountUSD,
      },
    });

    return NextResponse.json({ success: true, donation: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update donation' }, { status: 500 });
  }
}

// DELETE /api/admin/donations - delete donation
export async function DELETE(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Donation id is required' }, { status: 400 });
    }

    const existing = await prisma.donationRecord.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Donation record not found' }, { status: 404 });
    }

    // Decrement from pillar if completed
    if (existing.status === 'COMPLETED') {
      await prisma.supportPillar.update({
        where: { key: existing.pillarKey },
        data: { raisedAmountUSD: { decrement: existing.amountUSD } },
      }).catch(() => {});
    }

    await prisma.donationRecord.delete({ where: { id } });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      action: 'DONATION_RECORD_DELETED',
      entityType: 'DonationRecord',
      entityId: id,
      details: {
        receiptNumber: existing.receiptNumber,
        amountUSD: existing.amountUSD,
        pillarKey: existing.pillarKey,
      },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete donation' }, { status: 500 });
  }
}
