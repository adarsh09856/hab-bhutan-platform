import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

nextEnv.loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();
const baseUrl = process.env.QUICK_EDIT_TEST_URL || 'http://127.0.0.1:3033';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const permissions = ['content:view', 'content:create', 'content:edit', 'content:delete'];
const roleSlug = `codex_nav_check_${suffix.replace(/[^a-z0-9]/gi, '_')}`;
let role;
let user;
let navigationId;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, token, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Cookie: `hab_session=${token}` } : {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

try {
  const secret = process.env.JWT_SECRET;
  assert(secret && secret.length >= 32, 'Local JWT_SECRET is missing or too short.');

  role = await prisma.role.create({
    data: { name: 'Temporary Quick Edit navigation verification', slug: roleSlug, permissions },
  });
  user = await prisma.user.create({
    data: {
      email: `codex-nav-check-${suffix}@example.invalid`,
      name: 'Temporary Quick Edit Navigation Check',
      passwordHash: 'not-used',
      roleId: role.id,
    },
  });

  const token = await new SignJWT({
    user: {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      roleId: role.id,
      role: role.slug,
      roleSlug: role.slug,
      roleVersion: role.version,
      roleStatus: role.status,
      permissions,
      sessionVersion: user.sessionVersion,
      mustChangePassword: false,
    },
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(secret));

  const anonymous = await request('/api/admin/navigation', null, {
    method: 'POST',
    body: JSON.stringify({ menuType: 'HEADER', label: 'Unauthorized probe', href: '/about' }),
  });
  assert(anonymous.response.status === 401, `Anonymous create returned ${anonymous.response.status}, expected 401.`);

  const created = await request('/api/admin/navigation', token, {
    method: 'POST',
    body: JSON.stringify({ menuType: 'HEADER', label: `Temporary ${suffix}`, href: '/about', sortOrder: 9876 }),
  });
  assert(created.response.status === 201 && created.body.success, `Create failed: ${created.body.error || created.response.status}.`);
  navigationId = created.body.item?.id;
  assert(navigationId, 'Create returned no navigation item ID.');

  const updated = await request('/api/admin/navigation', token, {
    method: 'PUT',
    body: JSON.stringify({ id: navigationId, menuType: 'HEADER', label: `Updated ${suffix}`, href: '/contact', sortOrder: 9877, isActive: true }),
  });
  assert(updated.response.ok && updated.body.success, `Update failed: ${updated.body.error || updated.response.status}.`);
  assert(updated.body.item?.label === `Updated ${suffix}` && updated.body.item?.href === '/contact', 'Update did not round-trip the changed label and destination.');

  const publicRead = await request('/api/navigation', null);
  assert(publicRead.response.ok && publicRead.body.success, `Public read failed (${publicRead.response.status}).`);
  assert(publicRead.body.header?.some((item) => item.id === navigationId && item.label === `Updated ${suffix}`), 'Public navigation did not immediately expose the saved change.');

  const deleted = await request(`/api/admin/navigation?id=${encodeURIComponent(navigationId)}`, token, { method: 'DELETE' });
  assert(deleted.response.ok && deleted.body.success, `Delete failed: ${deleted.body.error || deleted.response.status}.`);
  navigationId = null;
  const afterDelete = await prisma.navigationItem.findUnique({ where: { id: created.body.item.id } });
  assert(afterDelete === null, 'Deleted navigation item still exists in the database.');

  console.log('PASS: anonymous writes denied; authenticated header navigation create/read/update/delete round-trip succeeded; temporary records cleaned up.');
} catch (error) {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
} finally {
  if (navigationId) await prisma.navigationItem.deleteMany({ where: { id: navigationId } }).catch(() => {});
  if (user) await prisma.user.deleteMany({ where: { id: user.id } }).catch(() => {});
  if (role) await prisma.role.deleteMany({ where: { id: role.id } }).catch(() => {});
  await prisma.$disconnect();
}
