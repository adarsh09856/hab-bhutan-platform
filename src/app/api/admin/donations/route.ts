import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { notifyDonationStatus } from '@/lib/transaction-notifications';
import {
  getAllFallbackDonations,
  saveFallbackDonation,
  updateFallbackDonationStatus,
} from '@/lib/donation-store';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest, permission: 'donations:view' | 'donations:create' | 'donations:edit' | 'donations:delete') {
  try {
    return await requirePermission(req, permission);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'You are not authorized to manage donations.' },
      { status: error?.statusCode || 500 }
    );
  }
}

// GET /api/admin/donations - list donations with filters
export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req, 'donations:view');
  if (user instanceof NextResponse) return user;

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
  const user = await verifyAdmin(req, 'donations:create');
  if (user instanceof NextResponse) return user;

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
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
    }
    if (!['ONE_TIME', 'MONTHLY'].includes(frequency) || !['PENDING', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Unsupported donation frequency or initial status.' }, { status: 400 });
    }

    // Generate unique receipt number if not provided
    const receiptNumber =
      customReceipt && customReceipt.trim()
        ? customReceipt.trim().toUpperCase()
        : `HAB-DON-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    let donation: any = null;
    try {
      donation = await prisma.$transaction(async (tx) => {
        const created = await tx.donationRecord.create({
          data: {
            pillarKey: pillarKey.trim().toLowerCase(),
            donorName: donorName.trim(),
            donorEmail: donorEmail.trim().toLowerCase(),
            amountUSD: numAmount,
            frequency,
            status,
            receiptNumber,
          },
          include: { pillar: { select: { title: true, key: true } } },
        });
        if (created.status === 'COMPLETED') {
          await tx.supportPillar.update({
            where: { key: pillarKey.trim().toLowerCase() },
            data: { raisedAmountUSD: { increment: numAmount } },
          });
        }
        return created;
      });
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
      frequency,
      status,
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

    const emailDelivery = await notifyDonationStatus(undefined, donation || savedFallback);
    return NextResponse.json({ success: true, donation: donation || savedFallback, emailDelivery });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to record donation' }, { status: 500 });
  }
}

// PATCH /api/admin/donations - update status or donation details
export async function PATCH(req: NextRequest) {
  const user = await verifyAdmin(req, 'donations:edit');
  if (user instanceof NextResponse) return user;

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
    if (amountUSD !== undefined && (!Number.isFinite(newAmount) || newAmount <= 0)) {
      return NextResponse.json({ success: false, error: 'Donation amount must be a finite positive number.' }, { status: 400 });
    }
    if (!['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(newStatus)) {
      return NextResponse.json({ success: false, error: 'Unsupported donation status.' }, { status: 400 });
    }
    if (frequency !== undefined && !['ONE_TIME', 'MONTHLY'].includes(frequency)) {
      return NextResponse.json({ success: false, error: 'Unsupported donation frequency.' }, { status: 400 });
    }

    let updated: any = null;
    if (existing) {
      updated = await prisma.$transaction(async (tx) => {
        const completedDelta = (newStatus === 'COMPLETED' ? newAmount : 0) - (existing.status === 'COMPLETED' ? existing.amountUSD : 0);
        if (completedDelta !== 0) {
          await tx.supportPillar.update({
            where: { key: existing.pillarKey },
            data: { raisedAmountUSD: { increment: completedDelta } },
          });
        }
        return tx.donationRecord.update({
          where: { id },
          data: {
            ...(donorName !== undefined && { donorName: donorName.trim() }),
            ...(donorEmail !== undefined && { donorEmail: donorEmail.trim().toLowerCase() }),
            ...(amountUSD !== undefined && { amountUSD: newAmount }),
            ...(frequency !== undefined && { frequency }),
            ...(status !== undefined && { status: newStatus }),
          },
          include: { pillar: { select: { title: true, key: true } } },
        });
      });
    }

    const previousFallback = existing ? null : getAllFallbackDonations().find(record => record.id === id);
    const updatedFallback = existing ? null : updateFallbackDonationStatus(id, newStatus as any, {
      ...(donorName !== undefined && { donorName: donorName.trim() }),
      ...(donorEmail !== undefined && { donorEmail: donorEmail.trim().toLowerCase() }),
      ...(amountUSD !== undefined && { amountUSD: newAmount }),
      ...(frequency !== undefined && { frequency }),
    });
    if (!updated && !updatedFallback) return NextResponse.json({ success: false, error: 'Donation record not found.' }, { status: 404 });

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
          previousStatus: existing?.status || null,
          status: newStatus,
          previousAmountUSD: existing?.amountUSD ?? null,
          amountUSD: newAmount,
        },
      });
    } catch {
      // Non-blocking
    }

    const emailDelivery = await notifyDonationStatus(existing?.status || previousFallback?.status, updated || updatedFallback!);
    return NextResponse.json({ success: true, donation: updated || updatedFallback, emailDelivery });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update donation' }, { status: 500 });
  }
}

// DELETE /api/admin/donations - delete donation
export async function DELETE(req: NextRequest) {
  const user = await verifyAdmin(req, 'donations:delete');
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Donation id is required' }, { status: 400 });
    }

    let existing: any = null;
    try { existing = await prisma.donationRecord.findUnique({ where: { id } }); } catch { /* Check fallback store below. */ }

    let voided: any = null;
    if (existing) {
      voided = await prisma.$transaction(async (tx) => {
        if (existing.status === 'COMPLETED') {
          await tx.supportPillar.update({
            where: { key: existing.pillarKey },
            data: { raisedAmountUSD: { decrement: existing.amountUSD } },
          });
        }
        return tx.donationRecord.update({ where: { id }, data: { status: 'CANCELLED' } });
      });
    } else {
      voided = updateFallbackDonationStatus(id, 'CANCELLED');
    }
    if (!voided) return NextResponse.json({ success: false, error: 'Donation record not found.' }, { status: 404 });

    try {
      await logAudit({
        actorType: 'STAFF',
        actorId: user.id,
        actorIdentifier: user.email,
        action: 'DONATION_RECORD_VOIDED',
        entityType: 'DonationRecord',
        entityId: id,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true, voided: true, donation: voided });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete donation' }, { status: 500 });
  }
}
