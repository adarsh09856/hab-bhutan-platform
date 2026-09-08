import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// GET /api/user/profile - Fetch authenticated user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !session.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        status: true,
        createdAt: true,
        role: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User record not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: user });
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve profile.' }, { status: 500 });
  }
}

// PUT /api/user/profile - Update profile details or change password
export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !session.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address, city, country, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    const updateData: any = {};

    if (name && name.trim()) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (city !== undefined) updateData.city = city ? city.trim() : null;
    if (country !== undefined) updateData.country = country ? country.trim() : 'Bhutan';

    // Password change flow
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ success: false, error: 'New password must be at least 8 characters.' }, { status: 400 });
      }
      if (!currentPassword) {
        return NextResponse.json({ success: false, error: 'Current password is required to set a new password.' }, { status: 400 });
      }

      const match = bcrypt.compareSync(currentPassword, user.passwordHash);
      if (!match) {
        return NextResponse.json({ success: false, error: 'Current password does not match.' }, { status: 400 });
      }

      updateData.passwordHash = bcrypt.hashSync(newPassword, 12);
      updateData.mustChangePassword = false;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        role: { select: { name: true, slug: true } },
      },
    });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await logAudit({
      actorType: 'MEMBER',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: newPassword ? 'USER_PASSWORD_CHANGED' : 'USER_PROFILE_UPDATED',
      entityType: 'User',
      entityId: session.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedUser,
    });
  } catch (err: any) {
    console.error('Error updating user profile:', err);
    return NextResponse.json({ success: false, error: 'Failed to update profile.' }, { status: 500 });
  }
}
