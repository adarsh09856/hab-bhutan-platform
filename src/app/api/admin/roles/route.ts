import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, createRoleRevision, reassignUsersToRole, retireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'ROLES_MANAGE');
    const body = await req.json();
    const { baseRoleName, permissions, description } = body;

    if (!baseRoleName || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: 'baseRoleName and permissions array are required.' },
        { status: 400 }
      );
    }

    const newRole = await createRoleRevision(baseRoleName, permissions, description);
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    await logAudit({
      actorType: 'STAFF',
      actorId: session.userId,
      action: 'ROLE_REVISION_CREATED',
      entityType: 'Role',
      entityId: newRole.id,
      ipAddress: ip,
      metadata: { roleName: baseRoleName, revision: newRole.revision }
    });

    return NextResponse.json({
      success: true,
      role: newRole
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'ROLES_MANAGE');
    const body = await req.json();
    const { oldRoleId, newRoleId } = body;

    if (!oldRoleId || !newRoleId) {
      return NextResponse.json(
        { success: false, error: 'oldRoleId and newRoleId are required.' },
        { status: 400 }
      );
    }

    // Step 1: Reassign active users
    const reassignedCount = await reassignUsersToRole(oldRoleId, newRoleId);

    // Step 2: Retire previous role
    const retiredRole = await retireRole(oldRoleId);

    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    await logAudit({
      actorType: 'STAFF',
      actorId: session.userId,
      action: 'ROLE_SUPERSEDED_AND_RETIRED',
      entityType: 'Role',
      entityId: oldRoleId,
      ipAddress: ip,
      metadata: { newRoleId, reassignedCount }
    });

    return NextResponse.json({
      success: true,
      message: `Role ${oldRoleId} retired. ${reassignedCount} users migrated to ${newRoleId}.`,
      retiredRole
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
