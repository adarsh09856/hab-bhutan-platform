import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'applications:view');

    const applications = await prisma.membershipApplication.findMany({
      include: {
        reviewer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (err: any) {
    console.error('Error fetching membership applications:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching applications.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'applications:review');
    const body = await req.json();
    const { id, status, reviewerNotes, rejectionReason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Application id and status are required.' },
        { status: 400 }
      );
    }

    const application = await prisma.membershipApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Membership application not found.' },
        { status: 404 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';

    // Atomic Approval & Enrolment Transaction
    if (status === 'APPROVED') {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update application status
        const updatedApp = await tx.membershipApplication.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewerId: session.id,
            reviewerNotes: reviewerNotes || 'Approved by secretariat reviewer.',
            reviewedAt: new Date(),
          },
        });

        // 2. Resolve member role
        const memberRole = await tx.role.findFirst({
          where: { slug: 'member', status: 'ACTIVE' },
        });

        if (!memberRole) {
          throw new Error('Member role not found in system. Ensure roles are seeded.');
        }

        // 3. Provision or link user account
        const tempPasswordHash = bcrypt.hashSync('ArtisanMember2026!', 10);
        const user = await tx.user.upsert({
          where: { email: application.email },
          update: {},
          create: {
            email: application.email,
            name: application.applicantName,
            passwordHash: tempPasswordHash,
            roleId: memberRole.id,
            status: 'ACTIVE',
          },
        });

        // 4. Provision authenticated Member enterprise record
        const memberCount = await tx.member.count();
        const regNumber = `HAB-2026-${100 + memberCount + 1}`;

        const newMember = await tx.member.create({
          data: {
            name: application.applicantName,
            craftKey: application.craftKey,
            dzongkhag: application.dzongkhag,
            joinYear: 2026,
            regNumber,
            tier: application.planTier,
            status: 'VERIFIED',
            bio: `Master craftsman practising ${application.craftKey} with ${application.yearsPractising} years of experience in ${application.dzongkhag} (${application.villageGewog}).`,
            cidNumber: application.cidNumber,
            businessLicense: application.businessLicense,
            userId: user.id,
            duesExpiryDate: new Date('2026-12-31'),
          },
        });

        return { updatedApp, newMember, user };
      });

      // 5. Audit Logging
      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'MEMBERSHIP_APPLICATION_APPROVED',
        entityType: 'MembershipApplication',
        entityId: id,
        details: {
          applicantName: application.applicantName,
          cidNumber: application.cidNumber,
          assignedRegNumber: result.newMember.regNumber,
          reviewerNotes,
        },
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'MEMBER_ENROLLED_FROM_APPLICATION',
        entityType: 'Member',
        entityId: result.newMember.id,
        details: {
          regNumber: result.newMember.regNumber,
          userId: result.user.id,
          email: result.user.email,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Application approved and member enterprise successfully enrolled.',
        application: result.updatedApp,
        member: result.newMember,
      });
    }

    // Rejection or Under Review update
    const updatedApp = await prisma.membershipApplication.update({
      where: { id },
      data: {
        status,
        reviewerId: session.id,
        reviewerNotes: reviewerNotes || null,
        rejectionReason: rejectionReason || null,
        reviewedAt: new Date(),
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: `MEMBERSHIP_APPLICATION_${status}`,
      entityType: 'MembershipApplication',
      entityId: id,
      details: {
        applicantName: application.applicantName,
        cidNumber: application.cidNumber,
        rejectionReason: rejectionReason || null,
        reviewerNotes: reviewerNotes || null,
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedApp,
    });
  } catch (err: any) {
    console.error('Error reviewing application:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error reviewing application.' },
      { status: err.statusCode || 500 }
    );
  }
}
