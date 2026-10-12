import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { validateTestDatabaseUrl } from './lib/safe-test-database.mjs';
import credentialMaintenance from './lib/admin-credential-rotation.cjs';

const databaseUrl = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);
if (process.env.DATABASE_URL !== databaseUrl) {
  throw new Error('Safety stop: DATABASE_URL must exactly match the isolated TEST_DATABASE_URL.');
}
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const suffix = randomUUID();
const email = `credential-verify-${suffix}@example.invalid`;
const roleSlug = `credential_verify_${suffix.replaceAll('-', '_')}`;
const createdIds = { userIds: [], roleIds: [] };

try {
  const role = await prisma.role.create({
    data: {
      name: 'Disposable credential verification role',
      slug: roleSlug,
      permissions: ['content:view'],
    },
  });
  createdIds.roleIds.push(role.id);

  const oldHash = await bcrypt.hash(`old-${suffix}`, 4);
  const existing = await prisma.user.create({
    data: {
      email,
      name: 'Disposable existing administrator',
      passwordHash: oldHash,
      roleId: role.id,
      status: 'SUSPENDED',
      mustChangePassword: true,
      twoFactorEnabled: true,
      twoFactorSecret: `preserve-${suffix}`,
      sessionVersion: 7,
    },
  });
  createdIds.userIds.push(existing.id);

  const rotatedPlaintext = `rotate-${suffix}`;
  const rotatedHash = await bcrypt.hash(rotatedPlaintext, 4);
  await credentialMaintenance.rotateAdminPasswordInDatabase(prisma, email, rotatedHash);
  let persisted = await prisma.user.findUniqueOrThrow({ where: { id: existing.id } });
  assert.equal(await bcrypt.compare(rotatedPlaintext, persisted.passwordHash), true);
  assert.equal(persisted.sessionVersion, 8, 'rotation must revoke existing sessions');
  assert.equal(persisted.status, 'SUSPENDED', 'rotation must preserve account status');
  assert.equal(persisted.roleId, role.id, 'rotation must preserve assigned role');
  assert.equal(persisted.mustChangePassword, true, 'rotation must preserve forced-change state');
  assert.equal(persisted.twoFactorEnabled, true, 'rotation must preserve 2FA state');
  assert.equal(persisted.twoFactorSecret, `preserve-${suffix}`, 'rotation must preserve 2FA secret');

  const resetPlaintext = `reset-${suffix}`;
  const resetHash = await bcrypt.hash(resetPlaintext, 4);
  await credentialMaintenance.resetAdminPasswordInDatabase(prisma, {
    email, name: 'Ignored for existing account', passwordHash: resetHash,
  });
  persisted = await prisma.user.findUniqueOrThrow({ where: { id: existing.id } });
  assert.equal(await bcrypt.compare(resetPlaintext, persisted.passwordHash), true);
  assert.equal(persisted.sessionVersion, 9, 'reset must revoke existing sessions');
  assert.equal(persisted.status, 'SUSPENDED', 'reset must not reactivate a suspended account');
  assert.equal(persisted.roleId, role.id, 'reset must not change the existing role');
  assert.equal(persisted.mustChangePassword, true);
  assert.equal(persisted.twoFactorEnabled, true);
  assert.equal(persisted.twoFactorSecret, `preserve-${suffix}`);

  const retiredRole = await prisma.role.create({
    data: {
      name: 'Retired disposable Super Admin',
      slug: 'super_admin',
      version: 1,
      status: 'RETIRED',
      retiredAt: new Date(),
      permissions: ['*'],
    },
  });
  createdIds.roleIds.push(retiredRole.id);

  const firstAdminEmail = `first-admin-${suffix}@example.invalid`;
  const firstAdminPlaintext = `first-${suffix}`;
  const firstAdminHash = await bcrypt.hash(firstAdminPlaintext, 4);
  const firstAdmin = await credentialMaintenance.resetAdminPasswordInDatabase(prisma, {
    email: firstAdminEmail,
    name: 'Disposable first administrator',
    passwordHash: firstAdminHash,
  });
  createdIds.userIds.push(firstAdmin.id);
  createdIds.roleIds.push(firstAdmin.roleId);
  const activeRole = await prisma.role.findUniqueOrThrow({ where: { id: firstAdmin.roleId } });
  assert.equal(activeRole.slug, 'super_admin');
  assert.equal(activeRole.status, 'ACTIVE');
  assert.equal(activeRole.version, 2, 'new role must version beyond the retired role');
  assert.deepEqual(activeRole.permissions, ['*']);
  assert.equal(await bcrypt.compare(firstAdminPlaintext, firstAdmin.passwordHash), true);
  assert.equal(firstAdmin.status, 'ACTIVE');
  assert.equal(firstAdmin.mustChangePassword, false);

  const audits = await prisma.auditLog.findMany({
    where: { actorIdentifier: { in: [email, firstAdminEmail] } },
    orderBy: { action: 'asc' },
  });
  assert.equal(audits.length, 3, 'each credential operation must write one audit record');
  assert.deepEqual(audits.map((row) => row.action).sort(), [
    'ADMIN_PASSWORD_RESET', 'ADMIN_PASSWORD_RESET', 'ADMIN_PASSWORD_ROTATED',
  ]);
  assert.ok(audits.every((row) => !JSON.stringify(row.details || {}).includes(rotatedPlaintext)));
  assert.ok(audits.every((row) => !JSON.stringify(row.details || {}).includes(resetPlaintext)));
  assert.ok(audits.every((row) => !JSON.stringify(row.details || {}).includes(firstAdminPlaintext)));

  console.log('PASS: real isolated PostgreSQL credential rotate/reset transactions; bcrypt hashes verify; sessions increment; existing status/role/2FA are preserved; retired Super Admin role is versioned; audit events are written without plaintext passwords.');
} finally {
  if (createdIds.userIds.length) {
    await prisma.auditLog.deleteMany({ where: { actorId: { in: createdIds.userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdIds.userIds } } });
  }
  if (createdIds.roleIds.length) {
    await prisma.role.deleteMany({ where: { id: { in: createdIds.roleIds }, users: { none: {} } } });
  }
  await prisma.$disconnect();
}
