import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { createSessionToken, SessionUser } from '@/lib/rbac';
import { checkDurableRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, accountType = 'CUSTOMER', address, city } = body;

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Rate limiting: 5 registrations per 30 minutes per IP
    const rl = await checkDurableRateLimit(`register:${ip}`, 5, 30 * 60);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: 'Too many registration requests. Please wait a few minutes and try again.' },
        { status: 429 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide your full legal name.' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists. Please log in.' },
        { status: 409 }
      );
    }

    // Determine Role
    const targetRoleSlug = accountType === 'ARTISAN' ? 'member' : 'customer';
    let role = await prisma.role.findFirst({
      where: { slug: targetRoleSlug, status: 'ACTIVE' },
      orderBy: { version: 'desc' },
    });

    if (!role) {
      // Create role if doesn't exist
      role = await prisma.role.create({
        data: {
          name: accountType === 'ARTISAN' ? 'Artisan Member' : 'Customer Buyer',
          slug: targetRoleSlug,
          version: 1,
          status: 'ACTIVE',
          permissions: accountType === 'ARTISAN'
            ? ['products:create', 'PORTAL_ACCESS', 'PRODUCTS_SUBMIT', 'DUES_PAY']
            : ['orders:read_own', 'profile:edit'],
        },
      });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 12);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        roleId: role.id,
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
        city: city ? city.trim() : null,
        country: 'Bhutan',
        status: 'ACTIVE',
        mustChangePassword: false,
      },
      include: { role: true },
    });

    // Create session token
    const sessionUser: SessionUser = {
      id: newUser.id,
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      roleId: newUser.role.id,
      role: newUser.role.name,
      roleSlug: newUser.role.slug,
      roleVersion: newUser.role.version,
      roleStatus: newUser.role.status as 'ACTIVE' | 'RETIRED',
      permissions: (newUser.role.permissions as string[]) || [],
      mustChangePassword: false,
      sessionVersion: 1,
    };

    const token = await createSessionToken(sessionUser);

    // Audit log
    await logAudit({
      actorType: 'GUEST',
      actorId: newUser.id,
      actorIdentifier: newUser.email,
      actorIp: ip,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: newUser.id,
      details: { role: role.name, roleSlug: role.slug, accountType },
    });

    const redirectUrl = accountType === 'ARTISAN' ? '/membership/apply' : '/account';

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role.name,
        roleSlug: newUser.role.slug,
      },
      redirectUrl,
    });

    // Set secure session cookie
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
    console.error('Registration error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to complete registration.' },
      { status: 500 }
    );
  }
}
