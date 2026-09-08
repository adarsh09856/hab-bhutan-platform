import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'users:edit');
    const body = await req.json();
    const { userId, action, roleId, status, customPassword } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Target user not found.' }, { status: 404 });
    }

    const ip = getClientIp(req);

    if (action === 'RESET_PASSWORD') {
      // Generate a temporary 10-char password or use custom
      const tempPassword = customPassword && customPassword.trim().length >= 8
        ? customPassword.trim()
        : `Hab@${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const newHash = bcrypt.hashSync(tempPassword, 12);

      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newHash,
          mustChangePassword: true,
          sessionVersion: { increment: 1 }, // Invalidate existing sessions immediately
        },
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'ADMIN_PASSWORD_RESET',
        entityType: 'User',
        entityId: userId,
        details: { targetEmail: targetUser.email, mustChangePassword: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully. Hand this temporary password to the user.',
        temporaryPassword: tempPassword,
      });
    }

    if (action === 'UPDATE_ROLE') {
      if (!roleId) {
        return NextResponse.json({ success: false, error: 'New roleId is required.' }, { status: 400 });
      }

      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        return NextResponse.json({ success: false, error: 'Target role not found.' }, { status: 404 });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          roleId,
          sessionVersion: { increment: 1 },
        },
        include: { role: true },
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: 'USER_ROLE_CHANGED',
        entityType: 'User',
        entityId: userId,
        details: { fromRole: targetUser.role.name, toRole: role.name },
      });

      return NextResponse.json({
        success: true,
        message: `User role updated to ${role.name}.`,
        user: updated,
      });
    }

    if (action === 'TOGGLE_STATUS') {
      const newStatus = status || (targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          status: newStatus,
          sessionVersion: newStatus === 'SUSPENDED' ? { increment: 1 } : undefined,
        },
        include: { role: true },
      });

      await logAudit({
        actorType: 'STAFF',
        actorId: session.id,
        actorIdentifier: session.email,
        actorIp: ip,
        action: newStatus === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
        entityType: 'User',
        entityId: userId,
        details: { previousStatus: targetUser.status, newStatus },
      });

      return NextResponse.json({
        success: true,
        message: `User status changed to ${newStatus}.`,
        user: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials action requested.' }, { status: 400 });
  } catch (err: any) {
    console.error('Credentials action error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error processing credential action.' },
      { status: err.statusCode || 500 }
    );
  }
}
