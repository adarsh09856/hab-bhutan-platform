import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';
import { requireTestDatabaseUrl } from './lib/safe-test-database.mjs';

nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient({ datasources: { db: { url: requireTestDatabaseUrl() } } });
const baseUrl = process.env.QUICK_EDIT_TEST_URL || 'http://127.0.0.1:3033';
const suffix = randomUUID();
let role;
let user;

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function health(token) {
  const response = await fetch(`${baseUrl}/api/admin/health`, {
    headers: token ? { Cookie: `hab_session=${token}` } : {}, cache: 'no-store',
  });
  assert(response.ok, `Health returned ${response.status}`);
  return response.json();
}

try {
  role = await prisma.role.create({ data: {
    name: 'Disposable health session role', slug: `health_test_${suffix.replaceAll('-', '_')}`,
    permissions: ['content:edit'],
  } });
  user = await prisma.user.create({ data: {
    email: `health-test-${suffix}@example.invalid`, name: 'Disposable health verifier',
    passwordHash: 'not-used', roleId: role.id,
  } });
  const token = await new SignJWT({ user: {
    id: user.id, userId: user.id, email: user.email, name: user.name,
    roleId: role.id, role: role.slug, roleSlug: role.slug,
    roleVersion: role.version, roleStatus: role.status,
    permissions: ['content:edit'], sessionVersion: user.sessionVersion,
    mustChangePassword: false,
  } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  assert((await health()).user === null, 'Anonymous health response exposed a user.');
  const active = (await health(token)).user;
  assert(active?.id === user.id && active.permissions?.includes('content:edit'), 'Active role permissions missing from health.');
  const activeOutlets = await fetch(`${baseUrl}/api/admin/outlets`, { headers: { Cookie: `hab_session=${token}` } });
  assert(activeOutlets.ok, 'Active content editor could not read outlet records.');
  await prisma.user.update({ where: { id: user.id }, data: { status: 'SUSPENDED' } });
  assert((await health(token)).user === null, 'Suspended account still appeared active.');
  const suspendedOutlets = await fetch(`${baseUrl}/api/admin/outlets`, { headers: { Cookie: `hab_session=${token}` } });
  assert(suspendedOutlets.status === 401 || suspendedOutlets.status === 403, 'Suspended account could still read outlets.');
  const suspendedUpload = await fetch(`${baseUrl}/api/admin/upload`, {
    method: 'POST', headers: { Cookie: `hab_session=${token}` }, body: new FormData(),
  });
  assert(suspendedUpload.status === 403, 'Suspended account reached the upload handler.');
  await prisma.user.update({ where: { id: user.id }, data: { status: 'ACTIVE' } });
  await prisma.role.update({ where: { id: role.id }, data: { status: 'RETIRED' } });
  assert((await health(token)).user === null, 'Retired role still appeared active.');
  console.log('PASS: health exposes current permissions only for active accounts and roles; suspended sessions cannot access outlets or upload media.');
} finally {
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
  if (role) await prisma.role.deleteMany({ where: { id: role.id } });
  await prisma.$disconnect();
}
