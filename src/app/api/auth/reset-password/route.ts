import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Reset token and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters in length.' },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const now = new Date();

    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiry: { gt: now },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Password reset link is invalid, expired, or has already been used.' },
        { status: 400 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password, single-use invalidate token, and increment sessionVersion to revoke existing sessions
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        resetTokenHash: null,
        resetTokenExpiry: null,
        mustChangePassword: false,
        sessionVersion: { increment: 1 },
      },
    });

    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      actorIp: ip,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'User',
      entityId: user.id,
      details: { allSessionsRevoked: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated. All active sessions have been terminated. Please sign in with your new credentials.',
    });
  } catch (err: any) {
    console.error('Error resetting password:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating password.' },
      { status: 500 }
    );
  }
}
