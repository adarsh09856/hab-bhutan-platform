import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSessionUser, createSessionToken, getClientIp, SessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'New password and confirmation do not match.' },
        { status: 400 }
      );
    }

    // Complexity validation: minimum 8 chars, 1 uppercase, 1 lowercase, 1 digit
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'New password must contain at least one uppercase letter.' },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'New password must contain at least one lowercase letter.' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: 'New password must contain at least one number.' },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { success: false, error: 'New password must differ from the current temporary password.' },
        { status: 400 }
      );
    }

    // Query real user record from database
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentValid = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect.' },
        { status: 400 }
      );
    }

    // Hash new password and update record
    const newHash = bcrypt.hashSync(newPassword, 10);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: user.role.slug === 'member' ? 'MEMBER' : 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      actorIp: ip,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user.id,
      details: {
        reason: 'FIRST_LOGIN_MANDATORY_CHANGE',
        email: user.email,
      },
    });

    // Issue fresh session token with mustChangePassword: false
    const freshSessionUser: SessionUser = {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      roleId: user.role.id,
      role: user.role.name,
      roleSlug: user.role.slug,
      roleVersion: user.role.version,
      roleStatus: user.role.status as 'ACTIVE' | 'RETIRED',
      permissions: (user.role.permissions as string[]) || [],
      mustChangePassword: false,
    };

    const newToken = await createSessionToken(freshSessionUser);
    const redirectUrl = '/admin';

    const response = NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
      redirectUrl,
    });

    response.cookies.set({
      name: 'hab_session',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Error changing password:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing password change.' },
      { status: 500 }
    );
  }
}
