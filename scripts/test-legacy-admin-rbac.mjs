import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import { randomUUID } from 'node:crypto';
import { validateTestDatabaseUrl } from './lib/safe-test-database.mjs';

const databaseUrl = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);
if (process.env.DATABASE_URL !== databaseUrl) {
  throw new Error('Safety stop: DATABASE_URL must exactly match the isolated TEST_DATABASE_URL.');
}
const baseUrl = process.env.QUICK_EDIT_TEST_URL || 'http://127.0.0.1:3033';
const parsedBaseUrl = new URL(baseUrl);
if (!['http:', 'https:'].includes(parsedBaseUrl.protocol) || !['localhost', '127.0.0.1', '::1'].includes(parsedBaseUrl.hostname)) {
  throw new Error('Safety stop: QUICK_EDIT_TEST_URL must target a loopback HTTP server.');
}
if (process.env.JWT_SECRET !== undefined && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters for this isolated API test.');
}

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const suffix = randomUUID().replaceAll('-', '');
const roleSlug = 'staff_operator';
const email = `legacy-rbac-${suffix}@example.invalid`;
let role;
let user;
let customRole;
let customUser;
let customViewerRole;
let customViewerUser;
let hadMembershipSetting = false;
let originalTrustBadges;
let hadSiteSetting = false;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function tokenFor(currentPermissions, tokenUser = user, tokenRole = role) {
  return new SignJWT({ user: {
    id: tokenUser.id,
    userId: tokenUser.id,
    email: tokenUser.email,
    name: tokenUser.name,
    roleId: tokenRole.id,
    role: tokenRole.slug,
    roleSlug: tokenRole.slug,
    roleVersion: tokenRole.version,
    roleStatus: tokenRole.status,
    permissions: currentPermissions,
    sessionVersion: tokenUser.sessionVersion,
  } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET || '122e08790446e8ac0439211e4e508d8904792f81a061eacb8e58333a31261d46'));
}

async function requestAdmin(pathname, token, method = 'GET', body) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  return fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(token ? { Cookie: `hab_session=${token}` } : {}),
      ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
    cache: 'no-store',
  });
}

try {
  hadMembershipSetting = Boolean(await prisma.membershipSetting.findUnique({ where: { id: 'default' } }));
  hadSiteSetting = Boolean(await prisma.siteSetting.findUnique({ where: { id: 'default' } }));
  if (!hadSiteSetting) {
    await prisma.siteSetting.create({ data: {
      id: 'default', heroParagraph: 'Disposable Quick Edit verification setting.',
      footerAbout: 'Disposable Quick Edit verification setting.', partnersList: [],
    } });
  }
  const existingRole = await prisma.role.findFirst({ where: { slug: roleSlug } });
  assert(!existingRole, 'Use a fresh disposable database without an existing staff_operator role.');

  role = await prisma.role.create({ data: {
    name: 'Disposable restricted staff role',
    slug: roleSlug,
    permissions: [],
  } });
  user = await prisma.user.create({ data: {
    email,
    name: 'Disposable legacy RBAC verifier',
    passwordHash: 'not-used',
    roleId: role.id,
  } });

  const overclaimedToken = await tokenFor(['*']);
  const protectedReadRoutes = [
    '/api/admin/clusters',
    '/api/admin/crafts',
    '/api/admin/events',
    '/api/admin/honours',
    '/api/admin/tenders',
    '/api/admin/site-settings',
    '/api/admin/membership-settings',
    '/api/admin/wholesale',
    '/api/admin/recycle-bin',
    '/api/admin/policies',
    '/api/admin/media',
  ];
  for (const pathname of protectedReadRoutes) {
    const denied = await requestAdmin(pathname, overclaimedToken);
    assert(denied.status === 401 || denied.status === 403, `${pathname} accepted a DB role with no permissions (HTTP ${denied.status}).`);
  }
  for (const [method, pathname, body] of [
    ['POST', '/api/admin/policies', {}],
    ['PATCH', '/api/admin/policies', {}],
    ['DELETE', '/api/admin/policies', undefined],
    ['PATCH', '/api/admin/media', {}],
    ['POST', '/api/admin/wholesale/action', {}],
    ['POST', '/api/admin/wholesale/import', {}],
    ['POST', '/api/admin/email/test', {}],
    ['POST', '/api/admin/upload', new FormData()],
    ['PUT', '/api/page-overrides', {}],
  ]) {
    const denied = await requestAdmin(pathname, overclaimedToken, method, body);
    assert(denied.status === 401 || denied.status === 403, `${method} ${pathname} accepted a DB role with no permissions (HTTP ${denied.status}).`);
  }

  role = await prisma.role.update({ where: { id: role.id }, data: { permissions: ['content:view'] } });
  for (const [method, pathname, body] of [
    ['POST', '/api/admin/clusters', {}],
    ['PUT', '/api/admin/clusters', {}],
    ['DELETE', '/api/admin/clusters', undefined],
    ['POST', '/api/admin/wholesale', {}],
    ['PUT', '/api/admin/wholesale', {}],
    ['DELETE', '/api/admin/wholesale', undefined],
    ['POST', '/api/admin/policies', {}],
    ['PATCH', '/api/admin/policies', {}],
    ['DELETE', '/api/admin/policies', undefined],
    ['PATCH', '/api/admin/media', {}],
    ['POST', '/api/admin/wholesale/action', {}],
    ['POST', '/api/admin/wholesale/import', {}],
    ['POST', '/api/admin/email/test', {}],
    ['POST', '/api/admin/upload', undefined],
    ['PUT', '/api/page-overrides', {}],
  ]) {
    const denied = await requestAdmin(pathname, overclaimedToken, method, body);
    assert(denied.status === 401 || denied.status === 403, `${method} ${pathname} was allowed to a view-only role (HTTP ${denied.status}).`);
  }
  for (const pathname of ['/api/admin/site-settings', '/api/admin/recycle-bin']) {
    const denied = await requestAdmin(pathname, overclaimedToken);
    assert(denied.status === 401 || denied.status === 403, `${pathname} exposed privileged settings/archive data to an unprivileged role (HTTP ${denied.status}).`);
  }
  for (const [method, pathname, body] of [
    ['POST', '/api/admin/policies', {}],
    ['PATCH', '/api/admin/policies', {}],
    ['DELETE', '/api/admin/policies', undefined],
    ['PATCH', '/api/admin/media', {}],
    ['POST', '/api/admin/wholesale/action', {}],
    ['POST', '/api/admin/wholesale/import', {}],
    ['POST', '/api/admin/email/test', {}],
    ['POST', '/api/admin/upload', undefined],
    ['PUT', '/api/page-overrides', {}],
  ]) {
    const denied = await requestAdmin(pathname, overclaimedToken, method, body);
    assert(denied.status === 401 || denied.status === 403, `${method} ${pathname} was allowed to a content:view-only role (HTTP ${denied.status}).`);
  }
  const viewOnlyHistory = await requestAdmin('/api/page-overrides?all=1', overclaimedToken);
  assert(viewOnlyHistory.status === 401 || viewOnlyHistory.status === 403, 'A content:view-only role could access Quick Edit restore history.');

  customViewerRole = await prisma.role.create({ data: {
    name: 'Disposable custom content viewer',
    slug: `content_viewer_${suffix.slice(0, 24)}`,
    permissions: ['content:view'],
  } });
  customViewerUser = await prisma.user.create({ data: {
    email: `content-view-${suffix}@example.invalid`, name: 'Disposable content-view verifier',
    passwordHash: 'not-used', roleId: customViewerRole.id,
  } });
  const viewerToken = await tokenFor(['content:view'], customViewerUser, customViewerRole);
  for (const pathname of ['/api/admin/policies', '/api/admin/media']) {
    const allowed = await requestAdmin(pathname, viewerToken);
    assert(allowed.status === 200, `${pathname} rejected an active custom role with content:view (HTTP ${allowed.status}).`);
  }
  const customViewerAdminPage = await requestAdmin('/admin', viewerToken);
  assert(customViewerAdminPage.status === 200, `Custom content:view role could not enter the Admin panel (HTTP ${customViewerAdminPage.status}).`);

  role = await prisma.role.update({ where: { id: role.id }, data: { permissions: [
    'content:create', 'content:edit', 'members:view', 'members:verify', 'orders:fulfill', 'products:review',
  ] } });
  const validatedCreate = await requestAdmin('/api/admin/clusters', overclaimedToken, 'POST', {});
  assert(validatedCreate.status === 400, `A role with content:create was rejected before request validation (HTTP ${validatedCreate.status}).`);
  role = await prisma.role.update({ where: { id: role.id }, data: { permissions: [
    'content:edit', 'members:view', 'members:verify', 'orders:fulfill', 'products:review',
  ] } });
  const allowedReadRoutes = protectedReadRoutes.filter((pathname) => pathname !== '/api/admin/wholesale');
  for (const pathname of allowedReadRoutes) {
    const allowed = await requestAdmin(pathname, overclaimedToken);
    assert(allowed.status === 200, `${pathname} rejected an active Staff Operator with its seeded DB permissions (HTTP ${allowed.status}).`);
  }
  for (const [method, pathname, body] of [
    ['POST', '/api/admin/wholesale', {}],
    ['PUT', '/api/admin/wholesale', {}],
    ['DELETE', '/api/admin/wholesale', undefined],
  ]) {
    const validation = await requestAdmin(pathname, overclaimedToken, method, body);
    assert(validation.status === 400, `${method} ${pathname} did not reach safe input validation for the existing Staff Operator permissions (HTTP ${validation.status}).`);
  }
  for (const [method, pathname, body] of [
    ['POST', '/api/admin/policies', {}],
    ['PATCH', '/api/admin/policies', {}],
    ['DELETE', '/api/admin/policies', undefined],
    ['PATCH', '/api/admin/media', { key: 'unsupported-slot', url: 'https://example.invalid/image.jpg' }],
    ['POST', '/api/admin/wholesale/action', {}],
    ['POST', '/api/admin/wholesale/import', {}],
    ['POST', '/api/admin/email/test', { toEmail: 'not-an-address' }],
    ['POST', '/api/admin/upload', new FormData()],
  ]) {
    const validation = await requestAdmin(pathname, overclaimedToken, method, body);
    assert(validation.status === 400 || validation.status === 404, `${method} ${pathname} did not reach safe validation with the seeded staff permissions (HTTP ${validation.status}).`);
  }

  customRole = await prisma.role.create({ data: {
    name: 'Disposable custom content editor',
    slug: `content_editor_${suffix.slice(0, 24)}`,
    permissions: ['content:edit'],
  } });
  customUser = await prisma.user.create({ data: {
    email: `quick-edit-${suffix}@example.invalid`, name: 'Disposable Quick Edit verifier',
    passwordHash: 'not-used', roleId: customRole.id,
  } });
  const editorToken = await tokenFor(['content:edit'], customUser, customRole);
  const customEditorAdminPage = await requestAdmin('/admin', editorToken);
  assert(customEditorAdminPage.status === 200, `Custom content:edit role could not enter the Admin panel (HTTP ${customEditorAdminPage.status}).`);
  for (const [method, pathname, body] of [
    ['GET', '/api/admin/site-settings', undefined],
    ['POST', '/api/admin/email/test', { toEmail: 'not-an-address' }],
  ]) {
    const denied = await requestAdmin(pathname, editorToken, method, body);
    assert(denied.status === 401 || denied.status === 403, `${method} ${pathname} exposed privileged settings/email dispatch to a custom content editor (HTTP ${denied.status}).`);
  }
  const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { trustBadges: true } });
  assert(setting, 'Disposable database must have the default site settings row for Quick Edit verification.');
  originalTrustBadges = setting.trustBadges;
  const pathname = `/__quick_edit_rbac_${suffix}`;
  const key = `quick-edit-rbac:${suffix}`;
  const savedOverride = await requestAdmin('/api/page-overrides', editorToken, 'PUT', {
    pathname, key, override: { text: 'Disposable saved value' },
  });
  assert(savedOverride.status === 200, `Custom content:edit role could not save Quick Edit text (HTTP ${savedOverride.status}).`);
  const publicOverride = await requestAdmin(`/api/page-overrides?path=${encodeURIComponent(pathname)}`, null);
  const publicBody = await publicOverride.json();
  assert(publicBody.overrides?.[key]?.text === 'Disposable saved value', 'Saved Quick Edit text was not returned to its public page.');
  const removedOverride = await requestAdmin('/api/page-overrides', editorToken, 'PUT', { pathname, key, override: {}, remove: true });
  assert(removedOverride.status === 200, `Custom content:edit role could not undo its Quick Edit override (HTTP ${removedOverride.status}).`);
  const afterUndo = await requestAdmin(`/api/page-overrides?path=${encodeURIComponent(pathname)}`, null);
  assert(!(await afterUndo.json()).overrides?.[key], 'Quick Edit undo did not remove the temporary override.');

  user = await prisma.user.update({ where: { id: user.id }, data: { sessionVersion: { increment: 1 } } });
  const revoked = await requestAdmin('/api/admin/clusters', overclaimedToken);
  assert(revoked.status === 401 || revoked.status === 403, `Revoked session still accessed clusters (HTTP ${revoked.status}).`);

  console.log('PASS: legacy staff-role API uses current DB permissions, ignores over-claimed JWT permissions, and blocks revoked sessions.');
} finally {
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
  if (originalTrustBadges !== undefined) {
    await prisma.siteSetting.update({ where: { id: 'default' }, data: { trustBadges: originalTrustBadges } }).catch(() => {});
  }
  if (!hadSiteSetting) await prisma.siteSetting.deleteMany({ where: { id: 'default' } });
  if (customUser) {
    await prisma.auditLog.deleteMany({ where: { actorId: customUser.id } });
    await prisma.user.deleteMany({ where: { id: customUser.id } });
  }
  if (customRole) await prisma.role.deleteMany({ where: { id: customRole.id } });
  if (customViewerUser) {
    await prisma.auditLog.deleteMany({ where: { actorId: customViewerUser.id } });
    await prisma.user.deleteMany({ where: { id: customViewerUser.id } });
  }
  if (customViewerRole) await prisma.role.deleteMany({ where: { id: customViewerRole.id } });
  if (!hadMembershipSetting) await prisma.membershipSetting.deleteMany({ where: { id: 'default' } });
  if (role) await prisma.role.deleteMany({ where: { id: role.id } });
  await prisma.$disconnect();
}
