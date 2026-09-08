import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import prisma from './prisma';
import { logAudit } from './audit';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('CRITICAL CONFIGURATION ERROR: A high-entropy JWT_SECRET (minimum 32 characters) must be configured in production environment variables.');
}

const secretString = process.env.JWT_SECRET || '122e08790446e8ac0439219e4e508d8904792f81a061eacb8e58333a31261d46';
const JWT_SECRET = new TextEncoder().encode(secretString);

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = payload.user as SessionUser;
    if (user) {
      user.userId = user.id;
    }
    return user || null;
  } catch {
    return null;
  }
}

import { Permission, PERMISSION_CATEGORIES, PermissionCategory } from './permissions';
export * from './permissions';




export interface SessionUser {
  id: string;
  userId?: string;
  email: string;
  name: string;
  roleId?: string;
  role?: string;
  roleSlug?: string;
  roleVersion?: number;
  roleStatus?: 'ACTIVE' | 'RETIRED';
  permissions: string[];
  mustChangePassword?: boolean;
  sessionVersion?: number;
}

export class AuthError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AuthError';
  }
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function createSessionToken(user: Partial<SessionUser>): Promise<string> {
  const normalizedUser: SessionUser = {
    id: user.id || user.userId || 'usr-guest',
    userId: user.userId || user.id || 'usr-guest',
    email: user.email || '',
    name: user.name || '',
    roleId: user.roleId || '',
    role: user.role || user.roleSlug || '',
    roleSlug: user.roleSlug || user.role || '',
    roleVersion: user.roleVersion || 1,
    roleStatus: user.roleStatus || 'ACTIVE',
    permissions: user.permissions || ['*'],
    mustChangePassword: !!user.mustChangePassword,
    sessionVersion: user.sessionVersion || 1,
  };

  return new SignJWT({ user: normalizedUser })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export const generateSessionToken = createSessionToken;

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get('hab_session')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = payload.user as SessionUser;
    if (user) {
      user.userId = user.id;
    }
    return user || null;
  } catch {
    return null;
  }
}

export async function requirePermission(req: NextRequest, permission: Permission): Promise<SessionUser> {
  const user = await getSessionUser(req);
  const clientIp = getClientIp(req);

  if (!user) {
    await logAudit({
      actorType: 'GUEST',
      actorIdentifier: 'unauthenticated',
      actorIp: clientIp,
      action: 'UNAUTHENTICATED_ACCESS_ATTEMPT',
      entityType: 'Security',
      entityId: permission,
      details: { attemptedPermission: permission },
    });
    throw new AuthError(401, 'Authentication required');
  }

  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });
  } catch (err) {
    throw new AuthError(503, 'Authentication database service currently unavailable');
  }

  if (!dbUser || dbUser.status !== 'ACTIVE') {
    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      actorIp: clientIp,
      action: 'SUSPENDED_USER_ACCESS_BLOCKED',
      entityType: 'User',
      entityId: user.id,
      details: { attemptedPermission: permission, userStatus: dbUser?.status || 'NOT_FOUND' },
    });
    throw new AuthError(403, 'Account is inactive or suspended');
  }

  // Session Revocation: If the user's session was revoked, token version will be lower than DB version
  if (user.sessionVersion && dbUser.sessionVersion && user.sessionVersion < dbUser.sessionVersion) {
    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      actorIp: clientIp,
      action: 'REVOKED_SESSION_BLOCKED',
      entityType: 'User',
      entityId: user.id,
      details: { tokenVersion: user.sessionVersion, activeVersion: dbUser.sessionVersion },
    });
    throw new AuthError(401, 'Session has been revoked. Please sign in again.');
  }

  if (dbUser.role.status === 'RETIRED') {
    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      actorIp: clientIp,
      action: 'RETIRED_ROLE_ACCESS_BLOCKED',
      entityType: 'Role',
      entityId: dbUser.role.id,
      details: { attemptedPermission: permission, roleSlug: dbUser.role.slug, version: dbUser.role.version },
    });
    throw new AuthError(403, 'Your assigned role has been retired. Please contact an administrator.');
  }

  const rolePermissions = (dbUser.role.permissions as string[]) || [];
  const hasPermission = rolePermissions.includes('*') || rolePermissions.includes(permission);

  if (!hasPermission) {
    await logAudit({
      actorType: 'STAFF',
      actorId: user.id,
      actorIdentifier: user.email,
      actorIp: clientIp,
      action: 'PERMISSION_DENIED',
      entityType: 'Security',
      entityId: permission,
      details: {
        role: dbUser.role.name,
        attemptedPermission: permission,
      },
    });
    throw new AuthError(403, `Forbidden: missing permission '${permission}'`);
  }

  return {
    id: dbUser.id,
    userId: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    roleId: dbUser.role.id,
    roleSlug: dbUser.role.slug,
    roleVersion: dbUser.role.version,
    roleStatus: dbUser.role.status as 'ACTIVE' | 'RETIRED',
    permissions: rolePermissions,
  };
}

// Immutable Role Lifecycle Management
// NOTE ON IMMUTABILITY CONTRACT: Permissions are create-only and never updated in place.
// When permissions change, createRoleRevision() creates a new Role row with incremented version.
// status and retiredAt are the only mutable fields, used strictly for state-machine lifecycle tracking.
export async function createRoleRevision(
  param1: string | { name: string; slug: string; permissions: Permission[]; actor: SessionUser; clientIp?: string },
  paramPermissions?: Permission[],
  paramDesc?: string,
  actor?: SessionUser,
  clientIp?: string
) {
  let name: string;
  let slug: string;
  let permissions: Permission[];
  let actorId = actor?.id;
  let actorEmail = actor?.email || 'admin@handicraftsbhutan.org';

  if (typeof param1 === 'object') {
    name = param1.name;
    slug = param1.slug;
    permissions = param1.permissions;
    actorId = param1.actor?.id;
    actorEmail = param1.actor?.email;
  } else {
    name = param1;
    slug = param1.toLowerCase().replace(/\s+/g, '_');
    permissions = paramPermissions || ['*'];
  }

  // Find highest version for this slug
  const latest = await prisma.role.findFirst({
    where: { slug },
    orderBy: { version: 'desc' },
  });

  const nextVersion = latest ? latest.version + 1 : 1;

  const newRole = await prisma.role.create({
    data: {
      name,
      slug,
      version: nextVersion,
      status: 'ACTIVE',
      permissions,
    },
  });

  await logAudit({
    actorType: 'STAFF',
    actorId: actorId || null,
    actorIdentifier: actorEmail,
    actorIp: clientIp || null,
    action: 'ROLE_CREATED',
    entityType: 'Role',
    entityId: newRole.id,
    details: {
      name: newRole.name,
      slug: newRole.slug,
      version: newRole.version,
      permissions,
    },
  });

  return {
    ...newRole,
    revision: newRole.version,
  };
}

export async function reassignUsersToRole(
  param1: string | { fromRoleId: string; toRoleId: string; actor: SessionUser; clientIp?: string },
  paramToRoleId?: string,
  actor?: SessionUser,
  clientIp?: string
) {
  let fromRoleId: string;
  let toRoleId: string;
  let actorId = actor?.id;
  let actorEmail = actor?.email || 'admin@handicraftsbhutan.org';

  if (typeof param1 === 'object') {
    fromRoleId = param1.fromRoleId;
    toRoleId = param1.toRoleId;
    actorId = param1.actor.id;
    actorEmail = param1.actor.email;
  } else {
    fromRoleId = param1;
    toRoleId = paramToRoleId!;
  }

  const count = await prisma.user.count({ where: { roleId: fromRoleId } });

  await prisma.user.updateMany({
    where: { roleId: fromRoleId },
    data: { roleId: toRoleId },
  });

  await logAudit({
    actorType: 'STAFF',
    actorId: actorId || null,
    actorIdentifier: actorEmail,
    actorIp: clientIp || null,
    action: 'ROLE_USERS_REASSIGNED',
    entityType: 'Role',
    entityId: toRoleId,
    details: {
      fromRoleId,
      toRoleId,
      migratedUserCount: count,
    },
  });

  return count;
}

// NOTE: Permissions are create-only and never updated in place; status/retiredAt are the only 
// mutable fields, used for lifecycle only (marking role retired and setting timestamp).
export async function retireRole(
  param1: string | { roleId: string; actor: SessionUser; clientIp?: string },
  actor?: SessionUser,
  clientIp?: string
) {
  let roleId: string;
  let actorId = actor?.id;
  let actorEmail = actor?.email || 'admin@handicraftsbhutan.org';

  if (typeof param1 === 'object') {
    roleId = param1.roleId;
    actorId = param1.actor.id;
    actorEmail = param1.actor.email;
  } else {
    roleId = param1;
  }

  // Ensure no active users remain on this role
  const userCount = await prisma.user.count({ where: { roleId } });
  if (userCount > 0) {
    throw new AuthError(
      400,
      `Cannot retire role: ${userCount} users are still assigned. Reassign them first.`
    );
  }

  const retiredRole = await prisma.role.update({
    where: { id: roleId },
    data: {
      status: 'RETIRED',
      retiredAt: new Date(),
    },
  });

  await logAudit({
    actorType: 'STAFF',
    actorId: actorId || null,
    actorIdentifier: actorEmail,
    actorIp: clientIp || null,
    action: 'ROLE_RETIRED',
    entityType: 'Role',
    entityId: retiredRole.id,
    details: {
      name: retiredRole.name,
      slug: retiredRole.slug,
      version: retiredRole.version,
    },
  });

  return retiredRole;
}

/**
 * Revoke all active sessions for a user by incrementing their sessionVersion in PostgreSQL.
 * Instantly invalidates all outstanding JWTs held by that user.
 */
export async function revokeAllUserSessions(
  userId: string,
  actor?: SessionUser,
  clientIp?: string
) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      sessionVersion: { increment: 1 },
    },
  });

  await logAudit({
    actorType: 'STAFF',
    actorId: actor?.id || userId,
    actorIdentifier: actor?.email || updated.email,
    actorIp: clientIp || null,
    action: 'USER_SESSIONS_REVOKED',
    entityType: 'User',
    entityId: userId,
    details: {
      userEmail: updated.email,
      newSessionVersion: updated.sessionVersion,
    },
  });

  return updated;
}

