import { NextRequest, NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';
import { notifySubmission } from '@/lib/transaction-notifications';
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
    const {
      pillarKey, 
      donorName, 
      donorEmail, 
      amountUSD, 
      amountBTN, 
      currency = 'USD', 
      frequency, 
      paymentMethod = 'MBOB',
      journalRef, 
      proofUrl 
    } = body;

    const normalizedPaymentMethod = String(paymentMethod || '').trim().toUpperCase();
    if (normalizedPaymentMethod === 'CARD') {
      return NextResponse.json(
        { success: false, error: 'Online card donations are not configured. Pay by mBoB, BNB, or bank transfer and submit your reference and proof.' },
        { status: 503 }
      );
    }
    if (!['MBOB', 'BNB', 'BANK'].includes(normalizedPaymentMethod)) {
      return NextResponse.json({ success: false, error: 'Choose mBoB, BNB, or bank transfer.' }, { status: 400 });
    }

    if (!pillarKey || !donorName || !donorEmail || (!amountUSD && !amountBTN)) {
      return NextResponse.json(
        { error: 'pillarKey, donorName, donorEmail, and donation amount are required' },
        { status: 400 }
      );
    }

    const calculatedUSD = amountUSD ? Number(amountUSD) : Math.round((Number(amountBTN) / 84) * 100) / 100;
    const calculatedBTN = amountBTN ? Number(amountBTN) : Math.round(calculatedUSD * 84);

    if (!Number.isFinite(calculatedUSD) || calculatedUSD <= 0 || !Number.isFinite(calculatedBTN) || calculatedBTN <= 0) {
      return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
    }

    const paymentReference = String(journalRef || '').trim();
    const uploadedProof = String(proofUrl || '').trim();
    if (!paymentReference || paymentReference.length > 120) {
      return NextResponse.json({ success: false, error: 'Enter the mBoB, BNB, or bank transfer reference (up to 120 characters).' }, { status: 400 });
    }
    if (!/^\/uploads\/hab-[a-z0-9-]+(?:\.[a-z0-9]+)?$/i.test(uploadedProof)) {
      return NextResponse.json({ success: false, error: 'Upload your payment receipt or deposit slip before submitting.' }, { status: 400 });
    }
    try {
      const proofFile = await stat(path.join(process.cwd(), 'public', uploadedProof.slice(1)));
      if (!proofFile.isFile()) throw new Error('Payment proof is not a file.');
    } catch {
      return NextResponse.json({ success: false, error: 'The uploaded payment proof could not be found. Please upload it again.' }, { status: 400 });
    }

    const normalizedPillarKey = String(pillarKey).trim().toLowerCase();
    const pillar = await prisma.supportPillar.findUnique({ where: { key: normalizedPillarKey }, select: { key: true } });
    if (!pillar) {
      return NextResponse.json({ success: false, error: 'Choose a valid HAB donation programme.' }, { status: 400 });
    }

    // Generate unique receipt number e.g. HAB-DON-2026-XXXXX
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const receiptNumber = `HAB-DON-${new Date().getFullYear()}-${randomSuffix}`;
    const initialStatus = 'PENDING';

    let donation: any;
    try {
      donation = await prisma.donationRecord.create({
        data: {
          pillarKey: normalizedPillarKey,
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim().toLowerCase(),
          amountUSD: calculatedUSD,
          amountBTN: calculatedBTN,
          currency: currency.toUpperCase(),
          frequency: frequency === 'MONTHLY' ? 'MONTHLY' : 'ONE_TIME',
          paymentMethod: normalizedPaymentMethod,
          journalRef: paymentReference,
          proofUrl: uploadedProof,
          status: initialStatus,
          receiptNumber,
        },
      });
    } catch (dbErr) {
      console.error('[api/donations] Database insert failed; donation was not accepted:', dbErr);
      return NextResponse.json({ success: false, error: 'We could not securely save your donation evidence. Nothing was submitted; please try again later.' }, { status: 503 });
    }

    try {
      await logAudit({
        actorType: 'GUEST',
        actorIdentifier: donorEmail.trim().toLowerCase(),
        action: 'DONATION_RECORDED',
        entityType: 'DonationRecord',
        entityId: donation.id,
        details: {
          receiptNumber,
          amountUSD: calculatedUSD,
          amountBTN: calculatedBTN,
          pillarKey,
        },
      });
    } catch {
      // Non-blocking
    }

    const emailDelivery = await notifySubmission({ kind: 'donation', email: donation.donorEmail, name: donation.donorName, id: donation.id, reference: donation.receiptNumber, siteUrl: req.nextUrl.origin });
    return NextResponse.json({
      success: true,
      emailDelivery,
      donation: {
        id: donation.id,
        receiptNumber: donation.receiptNumber,
        amountUSD: donation.amountUSD,
        donorName: donation.donorName,
        status: donation.status,
        createdAt: donation.createdAt,
      },
      message: 'Donation evidence received. HAB will confirm the gift after reviewing the payment proof.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Donation submission failed' }, { status: 500 });
  }
}

