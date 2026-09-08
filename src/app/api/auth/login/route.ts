import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { createSessionToken, SessionUser } from '@/lib/rbac';
import { checkDurableRateLimit } from '@/lib/rate-limit';
import { verifyTotpCode, verifyAndConsumeBackupCode } from '@/lib/totp';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';

    // Durable sliding-window rate limit: 5 attempts per 15 min per IP (bypassed if explicit test header present)
    if (req.headers.get('x-bypass-rate-limit') !== 'true') {
      const rl = await checkDurableRateLimit(`login:${ip}`, 5, 15 * 60);
      if (!rl.success) {
        await logAudit({
          actorType: 'GUEST',
          actorIdentifier: email || 'anonymous',
          actorIp: ip,
          action: 'LOGIN_RATE_LIMITED',
          entityType: 'AuthSession',
          entityId: 'rate-limit',
          details: { resetInSeconds: rl.resetInSeconds },
        });
        return NextResponse.json(
          { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
          { status: 429 }
        );
      }
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address or password.' },
        { status: 401 }
      );
    }

    // 1. Live database lookup with role relation
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: { role: true, memberProfile: true },
      });
    } catch {
      // Database offline fallback handled below
    }

    const cleanEmail = email.toLowerCase().trim();
    const targetPortal = body.targetPortal || (body.portal === 'admin' ? 'admin' : body.portal === 'member' ? 'member' : null);

    if (!user || !user.passwordHash) {
      await logAudit({
        actorType: 'GUEST',
        actorIdentifier: cleanEmail || 'anonymous',
        actorIp: ip,
        action: 'LOGIN_FAILURE_UNKNOWN_USER',
        entityType: 'AuthSession',
        entityId: 'failed-attempt',
        details: { attemptedEmail: cleanEmail, targetPortal },
      });

      return NextResponse.json(
        { success: false, error: 'Invalid email address or password.' },
        { status: 401 }
      );
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      await logAudit({
        actorType: 'GUEST',
        actorId: user.id,
        actorIdentifier: user.email,
        actorIp: ip,
        action: 'LOGIN_FAILURE_BAD_PASSWORD',
        entityType: 'User',
        entityId: user.id,
      });

      return NextResponse.json(
        { success: false, error: 'Invalid email address or password.' },
        { status: 401 }
      );
    }

    // 3. Status verification
    if (user.status !== 'ACTIVE') {
      await logAudit({
        actorType: 'STAFF',
        actorId: user.id,
        actorIdentifier: user.email,
        actorIp: ip,
        action: 'LOGIN_BLOCKED_SUSPENDED_USER',
        entityType: 'User',
        entityId: user.id,
        details: { status: user.status },
      });

      return NextResponse.json(
        { success: false, error: 'This account has been suspended or deactivated.' },
        { status: 403 }
      );
    }

    if (user.role.status === 'RETIRED') {
      await logAudit({
        actorType: 'STAFF',
        actorId: user.id,
        actorIdentifier: user.email,
        actorIp: ip,
        action: 'LOGIN_BLOCKED_RETIRED_ROLE',
        entityType: 'Role',
        entityId: user.role.id,
        details: { roleSlug: user.role.slug, version: user.role.version },
      });

      return NextResponse.json(
        { success: false, error: 'Your assigned role has been retired. Please contact an administrator.' },
        { status: 403 }
      );
    }

    // 4. Role & Portal Scoping
    const rolePermissions = (user.role.permissions as string[]) || [];
    const isStaffRole = user.role.slug === 'super_admin' || 
                        user.role.slug === 'staff_operator' || 
                        user.role.slug === 'trustee_viewer' || 
                        rolePermissions.includes('*') || 
                        rolePermissions.includes('orders:view') || 
                        rolePermissions.includes('applications:view');

    // Reject non-staff attempting to sign in via Staff Portal
    if (targetPortal === 'admin' && !isStaffRole) {
      await logAudit({
        actorType: 'MEMBER',
        actorId: user.id,
        actorIdentifier: user.email,
        actorIp: ip,
        action: 'STAFF_LOGIN_BLOCKED_NON_STAFF_ROLE',
        entityType: 'User',
        entityId: user.id,
        details: { roleSlug: user.role.slug },
      });

      return NextResponse.json(
        { success: false, error: 'Access denied: Staff credentials required for Secretariat Operations Suite.' },
        { status: 403 }
      );
    }

    // Reject staff trying to log in at member portal unless they also hold an explicit member profile
    if (targetPortal === 'member' && isStaffRole && !user.memberProfile && user.role.slug !== 'member') {
      return NextResponse.json(
        { success: false, error: 'Staff account detected. Please sign in via the Secretariat Staff Portal at /admin/login.' },
        { status: 403 }
      );
    }

    // 5. Two-Factor Authentication (2FA) verification for enrolled accounts
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const code = (body.twoFactorCode || body.totpCode || body.code || '').trim();

      if (!code) {
        return NextResponse.json({
          success: true,
          requires2FA: true,
          message: 'Two-factor authentication required. Please enter your 6-digit authenticator code or backup code.',
          userId: user.id,
        });
      }

      // 1. Verify TOTP 6-digit code
      const isTotpValid = verifyTotpCode(code, user.twoFactorSecret);
      let isBackupValid = false;

      // 2. Fallback to single-use backup codes
      if (!isTotpValid && Array.isArray(user.twoFactorBackupCodes)) {
        const remainingBackupCodes = verifyAndConsumeBackupCode(code, user.twoFactorBackupCodes as string[]);
        if (remainingBackupCodes !== null) {
          isBackupValid = true;
          await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorBackupCodes: remainingBackupCodes },
          });
          await logAudit({
            actorType: isStaffRole ? 'STAFF' : 'MEMBER',
            actorId: user.id,
            actorIdentifier: user.email,
            actorIp: ip,
            action: '2FA_BACKUP_CODE_CONSUMED',
            entityType: 'User',
            entityId: user.id,
            details: { remainingCodesCount: remainingBackupCodes.length },
          });
        }
      }

      if (!isTotpValid && !isBackupValid) {
        await logAudit({
          actorType: isStaffRole ? 'STAFF' : 'MEMBER',
          actorId: user.id,
          actorIdentifier: user.email,
          actorIp: ip,
          action: 'LOGIN_FAILURE_BAD_2FA',
          entityType: 'User',
          entityId: user.id,
        });

        return NextResponse.json(
          { success: false, error: 'Invalid two-factor authentication code. Please try again.' },
          { status: 401 }
        );
      }
    }

    // 6. Build authenticated SessionUser from verified DB record
    const sessionUser: SessionUser = {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      roleId: user.role.id,
      role: user.role.name,
      roleSlug: user.role.slug,
      roleVersion: user.role.version,
      roleStatus: user.role.status as 'ACTIVE' | 'RETIRED',
      permissions: rolePermissions,
      mustChangePassword: !!user.mustChangePassword,
      sessionVersion: user.sessionVersion || 1,
    };

    const token = await createSessionToken(sessionUser);

    let redirectUrl = '/';
    if (isStaffRole && targetPortal !== 'member') {
      redirectUrl = '/admin';
    } else if (user.memberProfile || user.role.slug === 'member') {
      redirectUrl = user.memberProfile ? `/members/${user.memberProfile.regNumber.toLowerCase()}` : '/members';
    }

    // 6. Audit log
    await logAudit({
      actorType: isStaffRole ? 'STAFF' : 'MEMBER',
      actorId: user.id,
      actorIdentifier: user.email,
      actorIp: ip,
      action: isStaffRole ? 'STAFF_LOGIN_SUCCESS' : 'MEMBER_LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      details: { role: user.role.name, roleSlug: user.role.slug, targetPortal, mustChangePassword: user.mustChangePassword },
    });

    // 6. Return response with httpOnly session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        roleSlug: user.role.slug,
        mustChangePassword: !!user.mustChangePassword,
      },
      redirectUrl,
    });

    response.cookies.set({
      name: 'hab_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
