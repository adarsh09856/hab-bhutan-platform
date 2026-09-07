import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { createSessionToken, SessionUser } from '@/lib/rbac';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';

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

    // 2. Demo logins support (Admin & Member)
    const DEMO_ADMIN_HASH = '$2a$10$nNOqqs3oWu8IkWqt7/aMq.1oJFYHBMHkaPHtpas4qf7l0bq0EErVm';
    const DEMO_MEMBER_HASH = '$2a$10$6.H.Hbi6tCtycqnUE8a5gOLU4KKaIj02DwRPfUlxrXLDeC9T4C6lW';

    if (!user || !user.passwordHash) {
      if (cleanEmail === 'admin@handicraftsbhutan.org' && bcrypt.compareSync(password, DEMO_ADMIN_HASH)) {
        const sessionUser: SessionUser = {
          id: 'usr_demo_admin_root',
          userId: 'usr_demo_admin_root',
          email: 'admin@handicraftsbhutan.org',
          name: 'HAB Secretariat Admin (Demo)',
          roleId: 'role_demo_super_admin',
          role: 'Super Admin',
          roleSlug: 'super_admin',
          roleVersion: 1,
          roleStatus: 'ACTIVE',
          permissions: ['*'],
        };
        const token = await createSessionToken(sessionUser);
        const response = NextResponse.json({
          success: true,
          user: {
            id: sessionUser.id,
            email: sessionUser.email,
            name: sessionUser.name,
            role: sessionUser.role,
            roleSlug: sessionUser.roleSlug,
          },
          redirectUrl: '/admin',
        });
        response.cookies.set({
          name: 'hab_session',
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
        return response;
      }

      if (cleanEmail === 'member@handicraftsbhutan.org' && bcrypt.compareSync(password, DEMO_MEMBER_HASH)) {
        const sessionUser: SessionUser = {
          id: 'usr_demo_member_root',
          userId: 'usr_demo_member_root',
          email: 'member@handicraftsbhutan.org',
          name: 'Choki Wangmo (Demo Member)',
          roleId: 'role_demo_member',
          role: 'Artisan Member',
          roleSlug: 'member',
          roleVersion: 1,
          roleStatus: 'ACTIVE',
          permissions: ['products:create', 'PORTAL_ACCESS', 'PRODUCTS_SUBMIT', 'DUES_PAY'],
        };
        const token = await createSessionToken(sessionUser);
        const response = NextResponse.json({
          success: true,
          user: {
            id: sessionUser.id,
            email: sessionUser.email,
            name: sessionUser.name,
            role: sessionUser.role,
            roleSlug: sessionUser.roleSlug,
          },
          redirectUrl: '/portal',
        });
        response.cookies.set({
          name: 'hab_session',
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
        return response;
      }

      await logAudit({
        actorType: 'GUEST',
        actorIdentifier: email || 'anonymous',
        actorIp: ip,
        action: 'LOGIN_FAILURE_UNKNOWN_USER',
        entityType: 'AuthSession',
        entityId: 'failed-attempt',
        details: { attemptedEmail: email },
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

    // 4. Build authenticated SessionUser from verified DB record
    const rolePermissions = (user.role.permissions as string[]) || [];
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
    };

    const token = await createSessionToken(sessionUser);

    const isStaff = user.role.slug !== 'member';
    const redirectUrl = isStaff ? '/admin' : '/portal';

    // 5. Audit log
    await logAudit({
      actorType: isStaff ? 'STAFF' : 'MEMBER',
      actorId: user.id,
      actorIdentifier: user.email,
      actorIp: ip,
      action: isStaff ? 'STAFF_LOGIN_SUCCESS' : 'MEMBER_LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      details: { role: user.role.name, roleSlug: user.role.slug },
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
