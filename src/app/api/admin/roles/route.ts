import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission, getClientIp, createRoleRevision, reassignUsersToRole, retireRole } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'roles:view');

    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: [{ name: 'asc' }, { version: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        version: r.version,
        status: r.status,
        permissions: r.permissions,
        userCount: r._count.users,
        createdAt: r.createdAt,
        retiredAt: r.retiredAt,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching roles:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching roles.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'roles:create');
    const body = await req.json();
    const { name, baseRoleName, slug, permissions, description } = body;

    const roleName = name || baseRoleName;
    if (!roleName || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: 'Role name and permissions array are required.' },
        { status: 400 }
      );
    }

    const roleSlug = slug || roleName.toLowerCase().replace(/\s+/g, '_');
    const ip = getClientIp(req);

    const newRole = await createRoleRevision({
      name: roleName,
      slug: roleSlug,
      permissions,
      actor: session,
      clientIp: ip,
    });

    return NextResponse.json({
      success: true,
      role: newRole,
    });
  } catch (err: any) {
    console.error('Error creating role revision:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error creating role revision.' },
      { status: err.statusCode || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requirePermission(req, 'roles:reassign');
    const body = await req.json();
    const { oldRoleId, newRoleId } = body;

    if (!oldRoleId || !newRoleId) {
      return NextResponse.json(
        { success: false, error: 'oldRoleId and newRoleId are required.' },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);

    // Step 1: Reassign active users
    const reassignedCount = await reassignUsersToRole({
      fromRoleId: oldRoleId,
      toRoleId: newRoleId,
      actor: session,
      clientIp: ip,
    });

    // Step 2: Retire previous role
    const retiredRole = await retireRole({
      roleId: oldRoleId,
      actor: session,
      clientIp: ip,
    });

    return NextResponse.json({
      success: true,
      message: `Role retired. ${reassignedCount} user(s) migrated to new revision.`,
      retiredRole,
      migratedCount: reassignedCount,
    });
  } catch (err: any) {
    console.error('Error retiring and reassigning role:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error reassigning role.' },
      { status: err.statusCode || 500 }
    );
  }
}
