import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, getClientIp } from '@/lib/rbac';
import { verifyTotpCode, generateBackupCodes } from '@/lib/totp';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required for 2FA verification.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { secret, code } = body;

    if (!secret || !code) {
      return NextResponse.json(
        { success: false, error: 'Both TOTP secret and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const isValid = verifyTotpCode(code.trim(), secret.trim());
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid 6-digit verification code. Ensure your device clock is synchronized.' },
        { status: 400 }
      );
    }

    const { plaintextCodes, hashedCodes } = generateBackupCodes(8);

    await prisma.user.update({
      where: { id: session.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret.trim(),
        twoFactorBackupCodes: hashedCodes,
      },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: '2FA_ENROLLED_SUCCESS',
      entityType: 'User',
      entityId: session.id,
      details: { backupCodesIssuedCount: plaintextCodes.length },
    });

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication (2FA) successfully enabled.',
      backupCodes: plaintextCodes,
    });
  } catch (err: any) {
    console.error('Error verifying 2FA setup:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error verifying 2FA setup.' },
      { status: 500 }
    );
  }
}
