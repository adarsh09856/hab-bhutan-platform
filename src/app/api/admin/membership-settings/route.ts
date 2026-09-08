import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return null;
  const isStaff = user.roleSlug === 'super_admin' ||
                  user.roleSlug === 'staff_operator' ||
                  user.permissions?.includes('*') ||
                  user.permissions?.includes('members:verify');
  return isStaff ? user : null;
}

export async function GET(req: NextRequest) {
  try {
    let setting = await prisma.membershipSetting.findUnique({ where: { id: 'default' } });
    if (!setting) {
      setting = await prisma.membershipSetting.create({
        data: {
          id: 'default',
          activeDuesBTN: 1200,
          associateDuesBTN: 2500,
          institutionalDuesBTN: 10000,
          bankName: 'Bank of Bhutan (BoB)',
          accountNumber: '200847291038',
          accountTitle: 'Handicrafts Association of Bhutan',
          mbobQrUrl: '/images/mbob_qr_placeholder.png',
        },
      });
    }

    // Fetch members with dues tracking
    const rawMembers = await prisma.member.findMany({
      select: {
        id: true,
        name: true,
        regNumber: true,
        craftKey: true,
        dzongkhag: true,
        tier: true,
        status: true,
        duesExpiryDate: true,
        joinYear: true,
      },
      orderBy: { duesExpiryDate: 'asc' },
    });

    const now = Date.now();
    const members = rawMembers.map((m) => {
      const expiryMs = new Date(m.duesExpiryDate).getTime();
      const daysRemaining = Math.ceil((expiryMs - now) / (1000 * 60 * 60 * 24));
      let duesStatus: 'CURRENT' | 'EXPIRING_SOON' | 'EXPIRED' = 'CURRENT';
      if (daysRemaining < 0) {
        duesStatus = 'EXPIRED';
      } else if (daysRemaining <= 30) {
        duesStatus = 'EXPIRING_SOON';
      }

      return {
        ...m,
        daysRemaining,
        duesStatus,
      };
    });

    return NextResponse.json({ success: true, setting, members });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  try {
    const updated = await prisma.membershipSetting.upsert({
      where: { id: 'default' },
      update: {
        ...(body.activeDuesBTN !== undefined && { activeDuesBTN: Number(body.activeDuesBTN) }),
        ...(body.associateDuesBTN !== undefined && { associateDuesBTN: Number(body.associateDuesBTN) }),
        ...(body.institutionalDuesBTN !== undefined && { institutionalDuesBTN: Number(body.institutionalDuesBTN) }),
        ...(body.bankName !== undefined && { bankName: body.bankName }),
        ...(body.accountNumber !== undefined && { accountNumber: body.accountNumber }),
        ...(body.accountTitle !== undefined && { accountTitle: body.accountTitle }),
        ...(body.mbobQrUrl !== undefined && { mbobQrUrl: body.mbobQrUrl }),
      },
      create: {
        id: 'default',
        activeDuesBTN: Number(body.activeDuesBTN) || 1200,
        associateDuesBTN: Number(body.associateDuesBTN) || 2500,
        institutionalDuesBTN: Number(body.institutionalDuesBTN) || 10000,
        bankName: body.bankName || 'Bank of Bhutan (BoB)',
        accountNumber: body.accountNumber || '200847291038',
        accountTitle: body.accountTitle || 'Handicrafts Association of Bhutan',
        mbobQrUrl: body.mbobQrUrl || '/images/mbob_qr_placeholder.png',
      },
    });
    await logAudit({ actorType: 'STAFF', actorId: user.id, actorIdentifier: user.email, action: 'MEMBERSHIP_DUES_UPDATED', entityType: 'MembershipSetting', entityId: 'default' });
    return NextResponse.json({ success: true, setting: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action, memberId, months = 12, amountBTN, receiptRef, paymentMethod = 'BANK', notes } = body;

    if (action === 'record_payment' || action === 'renew_dues') {
      if (!memberId) {
        return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
      }

      const existingMember = await prisma.member.findUnique({ where: { id: memberId } });
      if (!existingMember) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }

      const now = new Date();
      const currentExpiry = new Date(existingMember.duesExpiryDate);
      const baseDate = currentExpiry > now ? currentExpiry : now;
      
      const newExpiry = new Date(baseDate);
      newExpiry.setMonth(newExpiry.getMonth() + Number(months));

      const updated = await prisma.member.update({
        where: { id: memberId },
        data: {
          duesExpiryDate: newExpiry,
          status: 'VERIFIED',
        },
      });

      const ip = getClientIp(req);
      await logAudit({
        actorType: 'STAFF',
        actorId: user.id,
        actorIdentifier: user.email,
        actorIp: ip,
        action: 'MEMBER_DUES_RENEWED',
        entityType: 'Member',
        entityId: memberId,
        details: {
          memberName: existingMember.name,
          regNumber: existingMember.regNumber,
          previousExpiry: existingMember.duesExpiryDate,
          newExpiry,
          months,
          amountBTN,
          receiptRef,
          paymentMethod,
          notes,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Dues renewed for ${existingMember.name} until ${newExpiry.toISOString().slice(0, 10)}.`,
        member: updated,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}