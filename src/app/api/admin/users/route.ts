import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'users:view');

    const users = await prisma.user.findMany({
      include: {
        role: {
          select: { id: true, name: true, slug: true, version: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        roleId: u.roleId,
        role: u.role,
        status: u.status,
        twoFactorEnabled: u.twoFactorEnabled,
        createdAt: u.createdAt,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching staff users:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching users.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'users:create');
    const body = await req.json();
    const { name, email, password, roleId } = body;

    if (!name || !email || !password || !roleId) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and roleId are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `A user with email '${cleanEmail}' already exists.` },
        { status: 400 }
      );
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Specified role not found.' },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        roleId,
        status: 'ACTIVE',
      },
      include: { role: true },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: newUser.id,
      details: {
        name: newUser.name,
        email: newUser.email,
        role: role.name,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (err: any) {
    console.error('Error creating staff user:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error creating user.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'users:edit');
    const body = await req.json();
    const { id, name, email, roleId, status, password } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User id is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (roleId) updateData.roleId = roleId;
    if (status) updateData.status = status;
    if (password && password.trim().length >= 6) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: id,
      details: {
        email: updated.email,
        changes: {
          name: updateData.name,
          roleId: updateData.roleId,
          status: updateData.status,
          passwordReset: Boolean(updateData.passwordHash),
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
      },
    });
  } catch (err: any) {
    console.error('Error updating staff user:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating user.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'users:delete');
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // body empty
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'User id is required for deactivation.' }, { status: 400 });
    }

    if (id === session.id) {
      return NextResponse.json(
        { success: false, error: 'Self-deactivation is prohibited. Another administrator must deactivate this account.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // Soft-deactivate to SUSPENDED to maintain foreign-key references to audit logs and reviews
    const deactivated = await prisma.user.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    const ip = getClientIp(req);
    await logAudit({
      actorType: 'STAFF',
      actorId: session.id,
      actorIdentifier: session.email,
      actorIp: ip,
      action: 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: id,
      details: {
        email: deactivated.email,
        name: deactivated.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Staff user '${deactivated.name}' (${deactivated.email}) deactivated.`,
    });
  } catch (err: any) {
    console.error('Error deactivating staff user:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error deactivating user.' },
      { status: err.statusCode || 500 }
    );
  }
}
