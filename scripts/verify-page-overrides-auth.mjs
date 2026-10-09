import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();
const host = process.env.PAGE_OVERRIDES_TEST_URL || 'http://127.0.0.1:3033';
const databaseUrl = process.env.DATABASE_URL || '';
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) throw new Error('Safety stop: local app only.');
if (!/localhost|127\.0\.0\.1/.test(databaseUrl)) throw new Error('Safety stop: loopback database only.');
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const pathname = `/__page_override_auth_${suffix}`;
const key = `page/section:1/p:1:${suffix}`;
let user;
let originalTrustBadges;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function call(path, token, method = 'GET', body) {
  const response = await fetch(`${host}${path}`, {
    method,
    cache: 'no-store',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Cookie: `hab_session=${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

try {
  assert(process.env.JWT_SECRET?.length >= 32, 'Local JWT_SECRET is missing or too short.');
  const role = await prisma.role.findFirst({ where: { slug: 'super_admin', status: 'ACTIVE' } });
  assert(role, 'Isolated database requires an active super_admin role.');
  user = await prisma.user.create({ data: { email: `page-override-${suffix}@example.invalid`, name: 'Temporary override verifier', passwordHash: 'not-used', roleId: role.id } });
  const token = await new SignJWT({ user: {
    id: user.id, userId: user.id, email: user.email, name: user.name,
    roleId: role.id, role: role.slug, roleSlug: role.slug, roleVersion: role.version,
    roleStatus: role.status, sessionVersion: user.sessionVersion, mustChangePassword: false,
  } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } });
  assert(setting, 'Isolated test database requires the default site settings record.');
  originalTrustBadges = setting.trustBadges;

  const anonymousWrite = await call('/api/page-overrides', null, 'PUT', { pathname, key, override: { text: 'must not save' } });
  assert(anonymousWrite.response.status === 401, 'Anonymous override update was not denied.');
  const activeWrite = await call('/api/page-overrides', token, 'PUT', { pathname, key, override: { text: 'Saved locally' } });
  assert(activeWrite.response.ok && activeWrite.body.success, `Active editor could not save: ${activeWrite.body.error || activeWrite.response.status}.`);
  const publicRead = await call(`/api/page-overrides?path=${encodeURIComponent(pathname)}`, null);
  assert(publicRead.body.overrides?.[key]?.text === 'Saved locally', 'Public page did not read its saved override.');
  const allPages = await call('/api/page-overrides?all=1', token);
  assert(allPages.response.ok && allPages.body.pages?.[pathname]?.[key]?.text === 'Saved locally', 'Authenticated restore/history list did not include the override.');

  await prisma.user.update({ where: { id: user.id }, data: { status: 'SUSPENDED' } });
  const staleWrite = await call('/api/page-overrides', token, 'PUT', { pathname, key, remove: true, override: {} });
  assert(staleWrite.response.status === 403, 'Suspended staff could still change Quick Edit content using an existing token.');
  const staleHistory = await call('/api/page-overrides?all=1', token);
  assert(staleHistory.response.status === 403, 'Suspended staff could still read the protected override history.');
  const stillPublic = await call(`/api/page-overrides?path=${encodeURIComponent(pathname)}`, null);
  assert(stillPublic.body.overrides?.[key]?.text === 'Saved locally', 'Rejected stale-session delete unexpectedly removed the override.');
  console.log('PASS: public override read; authenticated save/history; anonymous denial; suspended-session write and history denial; failed delete preserves the live override.');
} finally {
  if (originalTrustBadges !== undefined) {
    await prisma.siteSetting.update({ where: { id: 'default' }, data: { trustBadges: originalTrustBadges } }).catch(() => {});
  }
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: user.id } }).catch(() => {});
  }
  await prisma.$disconnect();
}
