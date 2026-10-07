import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import {
  getAllFallbackDonations,
  saveFallbackDonation,
  updateFallbackDonationStatus,
  deleteFallbackDonation,
} from '@/lib/donation-store';

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

    let dbDonations: any[] = [];
    try {
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

      dbDonations = await prisma.donationRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          pillar: {
            select: { title: true, key: true },
          },
        },
      });
    } catch (dbErr: any) {
      console.warn('[admin/donations] DB read error, using fallback store:', dbErr.message);
    }

    const fallbackDonations = getAllFallbackDonations();
    const existingIds = new Set(dbDonations.map((d) => d.id));
    const existingReceipts = new Set(dbDonations.map((d) => d.receiptNumber));
    const merged = [...dbDonations];

    for (const fd of fallbackDonations) {
      if (!existingIds.has(fd.id) && !existingReceipts.has(fd.receiptNumber)) {
        // Apply filter if specified
        if (pillarKey && pillarKey !== 'ALL' && fd.pillarKey !== pillarKey) continue;
        if (status && status !== 'ALL' && fd.status !== status) continue;
        if (search) {
          const matchName = fd.donorName?.toLowerCase().includes(search);
          const matchEmail = fd.donorEmail?.toLowerCase().includes(search);
          const matchReceipt = fd.receiptNumber?.toLowerCase().includes(search);
          if (!matchName && !matchEmail && !matchReceipt) continue;
        }

        merged.push({
          ...fd,
          createdAt: new Date(fd.createdAt),
          updatedAt: new Date(fd.updatedAt),
        });
      }
    }

    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalUSD = merged.reduce((sum, d) => sum + (d.status === 'COMPLETED' ? (Number(d.amountUSD) || 0) : 0), 0);
    const completedCount = merged.filter((d) => d.status === 'COMPLETED').length;
    const pendingCount = merged.filter((d) => d.status === 'PENDING').length;

    return NextResponse.json({
      success: true,
      donations: merged,
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

    let donation: any = null;
    try {
      donation = await prisma.donationRecord.create({
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
    } catch (dbErr: any) {
      if (dbErr.code === 'P2002') {
        return NextResponse.json({ error: 'Receipt number already exists. Please use a unique receipt number.' }, { status: 400 });
      }
      console.warn('[admin/donations] DB create failed, saving to fallback store:', dbErr.message);
    }

    const savedFallback = saveFallbackDonation({
      id: donation?.id || `don-${Date.now()}`,
      pillarKey: pillarKey.trim().toLowerCase(),
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim().toLowerCase(),
      amountUSD: numAmount,
      frequency: frequency === 'MONTHLY' ? 'MONTHLY' : 'ONE_TIME',
      status: status === 'PENDING' ? 'PENDING' : 'COMPLETED',
      receiptNumber,
      createdAt: donation?.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pillar: {
        title: pillarKey.toUpperCase(),
        key: pillarKey.toLowerCase(),
      },
    });

    try {
      await logAudit({
        actorType: 'STAFF',
        actorId: user.id,
        actorIdentifier: user.email,
        action: 'OFFLINE_DONATION_RECORDED',
        entityType: 'DonationRecord',
        entityId: donation?.id || savedFallback.id,
        details: {
          receiptNumber,
          amountUSD: numAmount,
          pillarKey,
          donorName,
          status: donation?.status || savedFallback.status,
        },
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true, donation: donation || savedFallback });
  } catch (err: any) {
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

    let existing: any = null;
    try {
      existing = await prisma.donationRecord.findUnique({
        where: { id },
      });
    } catch {
      // DB offline
    }

    const newAmount = amountUSD !== undefined ? Number(amountUSD) : (existing?.amountUSD ?? 0);
    const newStatus = status || existing?.status || 'COMPLETED';

    if (existing) {
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
    }

    let updated: any = null;
    try {
      updated = await prisma.donationRecord.update({
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
    } catch {
      // Fallback
    }

    // Always update fallback store
    const updatedFallback = updateFallbackDonationStatus(id, newStatus as any, {
      ...(donorName && { donorName: donorName.trim() }),
      ...(donorEmail && { donorEmail: donorEmail.trim().toLowerCase() }),
      ...(amountUSD !== undefined && { amountUSD: newAmount }),
      ...(frequency && { frequency }),
    });

    try {
      await logAudit({
        actorType: 'STAFF',
        actorId: user.id,
        actorIdentifier: user.email,
        action: 'DONATION_RECORD_UPDATED',
        entityType: 'DonationRecord',
        entityId: id,
        details: {
          receiptNumber: updated?.receiptNumber || updatedFallback?.receiptNumber,
          status: newStatus,
          amountUSD: newAmount,
        },
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true, donation: updated || updatedFallback });
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

    try {
      const existing = await prisma.donationRecord.findUnique({ where: { id } });
      if (existing) {
        if (existing.status === 'COMPLETED') {
          await prisma.supportPillar.update({
            where: { key: existing.pillarKey },
            data: { raisedAmountUSD: { decrement: existing.amountUSD } },
          }).catch(() => {});
        }
        await prisma.donationRecord.delete({ where: { id } });
      }
    } catch {
      // DB delete attempted
    }

    deleteFallbackDonation(id);

    try {
      await logAudit({
        actorType: 'STAFF',
        actorId: user.id,
        actorIdentifier: user.email,
        action: 'DONATION_RECORD_DELETED',
        entityType: 'DonationRecord',
        entityId: id,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete donation' }, { status: 500 });
  }
}
