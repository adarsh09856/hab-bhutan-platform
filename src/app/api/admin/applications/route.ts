import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
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

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'applications:create');
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
        { success: false, error: 'Applicant name, email, phone, CID, craft, and dzongkhag are required.' },
        { status: 400 }
      );
    }

    const cleanCID = String(cidNumber).replace(/\D/g, '');
    if (cleanCID.length !== 11) {
      return NextResponse.json(
        { success: false, error: 'Bhutan Citizenship ID (CID) must be exactly 11 digits.' },
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
        dzongkhag,
        villageGewog: villageGewog?.trim() || 'Central',
        yearsPractising: yearsPractising ? parseInt(yearsPractising, 10) : 5,
        planTier: planTier || 'ACTIVE_SECTOR_MEMBER',
        paymentMethod: paymentMethod || 'CARD',
        status: 'PENDING',
      },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'MEMBERSHIP_APPLICATION_LOGGED_MANUALLY',
      entityType: 'MembershipApplication',
      entityId: application.id,
      details: {
        applicantName: application.applicantName,
        email: application.email,
        cidNumber: application.cidNumber,
        craftKey: application.craftKey,
      },
    });

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (err: any) {
    console.error('Error logging paper application:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error logging application.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, reviewerNotes, rejectionReason, ...editFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application id is required.' },
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

    const ip = getClientIp(req);

    // MODE 1: Profile/Data Correction (editFields present)
    if (Object.keys(editFields).length > 0 && !status) {
      const session = await requirePermission(req, 'applications:edit');
      const updateData: any = {};

      if (editFields.applicantName !== undefined) updateData.applicantName = editFields.applicantName.trim();
      if (editFields.email !== undefined) updateData.email = editFields.email.trim().toLowerCase();
      if (editFields.phone !== undefined) updateData.phone = editFields.phone.trim();
      if (editFields.craftKey !== undefined) updateData.craftKey = editFields.craftKey;
      if (editFields.dzongkhag !== undefined) updateData.dzongkhag = editFields.dzongkhag;
      if (editFields.villageGewog !== undefined) updateData.villageGewog = editFields.villageGewog.trim();
      if (editFields.yearsPractising !== undefined) updateData.yearsPractising = parseInt(editFields.yearsPractising, 10);
      if (editFields.planTier !== undefined) updateData.planTier = editFields.planTier;
      if (editFields.businessLicense !== undefined) updateData.businessLicense = editFields.businessLicense.trim() || null;

      if (editFields.cidNumber !== undefined) {
        const cleanCID = String(editFields.cidNumber).replace(/\D/g, '');
        if (cleanCID.length !== 11) {
          return NextResponse.json(
            { success: false, error: 'Bhutan Citizenship ID (CID) must be exactly 11 digits.' },
            { status: 400 }
          );
        }
        updateData.cidNumber = cleanCID;
      }

      const updated = await prisma.membershipApplication.update({
        where: { id },
        data: updateData,
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'MEMBERSHIP_APPLICATION_EDITED',
        entityType: 'MembershipApplication',
        entityId: id,
        details: {
          previous: {
            applicantName: application.applicantName,
            cidNumber: application.cidNumber,
            email: application.email,
          },
          changes: updateData,
        },
      });

      return NextResponse.json({
        success: true,
        application: updated,
      });
    }

    // MODE 2: Status Review (APPROVE / REJECT / UNDER_REVIEW)
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Application status is required for review update.' },
        { status: 400 }
      );
    }

    let session;
    if (status === 'APPROVED') {
      session = await requirePermission(req, 'applications:approve');
    } else if (status === 'REJECTED') {
      session = await requirePermission(req, 'applications:reject');
      if (!rejectionReason || !rejectionReason.trim()) {
        return NextResponse.json(
          { success: false, error: 'A formal rejection reason is mandatory when rejecting an application.' },
          { status: 400 }
        );
      }
    } else {
      session = await requirePermission(req, 'applications:review');
    }

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

export async function DELETE(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'applications:delete');
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // query empty, body not JSON
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application id is required for deletion.' },
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

    // Safety guard: only unfinalized applications can be deleted
    if (application.status === 'APPROVED' || application.status === 'REJECTED') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete finalized application (${application.status}). Decisions are legally auditable association records.`,
        },
        { status: 400 }
      );
    }

    await prisma.membershipApplication.delete({ where: { id } });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'MEMBERSHIP_APPLICATION_DELETED',
      entityType: 'MembershipApplication',
      entityId: id,
      details: {
        applicantName: application.applicantName,
        cidNumber: application.cidNumber,
        email: application.email,
        statusAtDeletion: application.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Application for '${application.applicantName}' successfully purged.`,
    });
  } catch (err: any) {
    console.error('Error deleting application:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error deleting application.' },
      { status: err.statusCode || 500 }
    );
  }
}
