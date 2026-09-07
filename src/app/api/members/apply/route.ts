import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, 
      cid, 
      enterpriseName, 
      phone, 
      email, 
      dzongkhag, 
      gewog, 
      village, 
      craftDiscipline, 
      craftKey,
      businessLicense,
      tier,
      experienceYears 
    } = body;

    // Validate 11-digit CID format strictly
    const cidClean = (cid || '').replace(/\D/g, '');
    if (cidClean.length !== 11) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Bhutan Citizenship Identity Card (CID). Must be exactly 11 digits per Department of Civil Registration and Census regulations.' 
        },
        { status: 400 }
      );
    }

    if (!name || !enterpriseName || !dzongkhag) {
      return NextResponse.json(
        { success: false, error: 'Missing required applicant registration fields.' },
        { status: 400 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';

    // Map craftKey to valid Zorig Chusum key
    const normalizedCraftKey = craftKey || craftDiscipline || 'thagzo';
    const villageGewog = [gewog, village].filter(Boolean).join(', ') || 'Not specified';
    const planTier = (tier === 'ASSOCIATE' || tier === 'ASSOCIATE_SECTOR_MEMBER') 
      ? 'ASSOCIATE_SECTOR_MEMBER' 
      : 'ACTIVE_SECTOR_MEMBER';

    // Write real row to PostgreSQL via Prisma
    const application = await prisma.membershipApplication.create({
      data: {
        applicantName: name,
        email: email || `${cidClean}@applicants.hab.bt`,
        phone: phone || '+975 17 000 000',
        cidNumber: cidClean,
        businessLicense: businessLicense || null,
        craftKey: normalizedCraftKey,
        dzongkhag,
        villageGewog,
        yearsPractising: parseInt(experienceYears) || 1,
        planTier,
        status: 'PENDING',
      },
    });

    // Polymorphic audit log
    await logAudit({
      actorType: 'GUEST',
      actorId: cidClean,
      actorIdentifier: name,
      actorIp: ip,
      action: 'MEMBERSHIP_APPLICATION_SUBMITTED',
      entityType: 'MembershipApplication',
      entityId: application.id,
      details: {
        applicantName: name,
        enterprise: enterpriseName,
        dzongkhag,
        craftKey: normalizedCraftKey,
        planTier,
      },
    });

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Your membership application has been submitted to the Secretariat. You will receive an SMS and email notification upon DCRC and craft committee review.',
      submittedAt: application.submittedAt.toISOString(),
    });
  } catch (err: any) {
    console.error('Error creating membership application:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing application.' },
      { status: 500 }
    );
  }
}
