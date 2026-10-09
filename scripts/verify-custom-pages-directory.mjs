import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

nextEnv.loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();
const host = process.env.CUSTOM_PAGE_DIRECTORY_TEST_URL || 'http://127.0.0.1:3033';
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) {
  throw new Error('Safety stop: this verification only permits localhost.');
}
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const roleSlug = `codex_custom_page_${suffix.replace(/[^a-z0-9]/gi, '_')}`;
const slug = `codex-directory-check-${suffix}`;
const permissions = ['content:view', 'content:create', 'content:edit', 'content:delete'];
let role;
let user;
let pageId;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, token, options = {}) {
  const response = await fetch(`${host}${path}`, {
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
  role = await prisma.role.create({ data: { name: 'Temporary page directory check', slug: roleSlug, permissions } });
  user = await prisma.user.create({
    data: {
      email: `codex-page-directory-${suffix}@example.invalid`,
      name: 'Temporary Page Directory Check',
      passwordHash: 'not-used',
      roleId: role.id,
    },
  });
  const token = await new SignJWT({ user: {
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
  } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m').sign(new TextEncoder().encode(secret));

  const created = await request('/api/admin/pages', token, {
    method: 'POST',
    body: JSON.stringify({ title: `Directory check ${suffix}`, slug, content: 'Temporary local test page only.', isPublished: false }),
  });
  assert(created.response.status === 201 && created.body.success, `Page create failed: ${created.body.error || created.response.status}.`);
  pageId = created.body.page?.id;
  assert(pageId, 'Page create did not return the saved page.');

  const list = await request('/api/admin/pages', token);
  assert(list.response.ok && list.body.success, `Admin page list failed: ${list.body.error || list.response.status}.`);
  const visiblePage = list.body.customPages?.find((page) => page.id === pageId);
  assert(visiblePage?.slug === slug && visiblePage.title === `Directory check ${suffix}`, 'Newly created page is missing from the Website Pages data source.');

  const deleteResult = await request(`/api/admin/pages/${encodeURIComponent(pageId)}`, token, { method: 'DELETE' });
  assert(deleteResult.response.ok && deleteResult.body.success, `Temporary page cleanup failed: ${deleteResult.body.error || deleteResult.response.status}.`);
  pageId = null;
  console.log('PASS: authenticated page creation returns its saved row; a fresh Website Pages list immediately includes the new title/slug; temporary page cleaned up.');
} catch (error) {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
} finally {
  if (pageId) await prisma.customPage.deleteMany({ where: { id: pageId } }).catch(() => {});
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: user.id } }).catch(() => {});
  }
  if (role) await prisma.role.deleteMany({ where: { id: role.id } }).catch(() => {});
  await prisma.$disconnect();
}
