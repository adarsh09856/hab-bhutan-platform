import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
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
    return NextResponse.json({ success: true, setting });
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