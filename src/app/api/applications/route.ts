import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      applicantName,
      email,
      phone,
      cidNumber,
      businessLicense,
      craftKey,
      dzongkhag,
      villageGewog,
      yearsPractising,
      planTier,
      paymentMethod,
    } = body;

    if (!applicantName || !email || !phone || !cidNumber || !craftKey || !dzongkhag) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, phone, CID, craft category, and dzongkhag are required.' },
        { status: 400 }
      );
    }

    const cleanCID = String(cidNumber).replace(/\D/g, '');
    if (cleanCID.length !== 11) {
      return NextResponse.json(
        { success: false, error: 'Bhutan Citizenship ID (CID) must be exactly 11 numeric digits.' },
        { status: 400 }
      );
    }

    // Map planTier to schema MemberTier enum
    let mappedTier: 'ACTIVE_SECTOR_MEMBER' | 'ASSOCIATE_SECTOR_MEMBER' | 'INSTITUTIONAL' = 'ACTIVE_SECTOR_MEMBER';
    if (planTier === 'enterprise' || planTier === 'ASSOCIATE_SECTOR_MEMBER') {
      mappedTier = 'ASSOCIATE_SECTOR_MEMBER';
    } else if (planTier === 'institution' || planTier === 'INSTITUTIONAL') {
      mappedTier = 'INSTITUTIONAL';
    }

    // Map payment method to schema PaymentMethod enum
    let mappedPayment: 'CARD' | 'MBOB' | 'BANK' = 'CARD';
    if (String(paymentMethod).toUpperCase() === 'MBOB') mappedPayment = 'MBOB';
    else if (String(paymentMethod).toUpperCase() === 'BANK') mappedPayment = 'BANK';

    // Verify craftKey exists
    const craft = await prisma.craft.findUnique({ where: { key: craftKey } });
    if (!craft) {
      return NextResponse.json(
        { success: false, error: `Invalid craft category: ${craftKey}` },
        { status: 400 }
      );
    }

    const application = await prisma.membershipApplication.create({
      data: {
        applicantName: applicantName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        cidNumber: cleanCID,
        businessLicense: businessLicense?.trim() || null,
        craftKey,
        dzongkhag: dzongkhag.trim(),
        villageGewog: villageGewog?.trim() || 'Central',
        yearsPractising: yearsPractising ? parseInt(String(yearsPractising), 10) || 1 : 1,
        planTier: mappedTier,
        paymentMethod: mappedPayment,
        status: 'PENDING',
      },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'GUEST',
      actorIdentifier: email.trim().toLowerCase(),
      actorIp: ip,
      action: 'MEMBERSHIP_APPLICATION_SUBMITTED',
      entityType: 'MembershipApplication',
      entityId: application.id,
      details: {
        applicantName: application.applicantName,
        email: application.email,
        cidNumber: application.cidNumber,
        craftKey: application.craftKey,
        planTier: mappedTier,
      },
    });

    const reference = `HAB-2026-${application.id.slice(0, 6).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      reference,
      applicationId: application.id,
      message: 'Application received successfully.',
    });
  } catch (err: any) {
    console.error('Error submitting application:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error processing application.' },
      { status: 500 }
    );
  }
}
