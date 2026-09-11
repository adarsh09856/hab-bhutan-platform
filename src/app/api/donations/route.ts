import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { checkDurableRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateCheck = await checkDurableRateLimit(`donate:${clientIp}`, 10, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `Too many requests. Please retry in ${rateCheck.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { pillarKey, donorName, donorEmail, amountUSD, frequency } = body;

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

    // Generate unique receipt number e.g. HAB-DON-2026-XXXXX
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const receiptNumber = `HAB-DON-${new Date().getFullYear()}-${randomSuffix}`;

    const donation = await prisma.donationRecord.create({
      data: {
        pillarKey: pillarKey.trim().toLowerCase(),
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim().toLowerCase(),
        amountUSD: numAmount,
        frequency: frequency === 'MONTHLY' ? 'MONTHLY' : 'ONE_TIME',
        status: 'COMPLETED',
        receiptNumber,
      },
    });

    // Update the raisedAmountUSD on the pillar if it exists
    try {
      await prisma.supportPillar.update({
        where: { key: pillarKey.trim().toLowerCase() },
        data: {
          raisedAmountUSD: { increment: numAmount },
        },
      });
    } catch {
      // Non-blocking if pillar record not yet seeded
    }

    await logAudit({
      actorType: 'GUEST',
      actorIdentifier: donorEmail.trim().toLowerCase(),
      action: 'DONATION_RECORDED',
      entityType: 'DonationRecord',
      entityId: donation.id,
      details: {
        receiptNumber,
        amountUSD: numAmount,
        pillarKey,
      },
    });

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        receiptNumber: donation.receiptNumber,
        amountUSD: donation.amountUSD,
        donorName: donation.donorName,
        createdAt: donation.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Donation submission failed' }, { status: 500 });
  }
}
