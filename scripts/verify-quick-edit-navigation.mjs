import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

nextEnv.loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();
const baseUrl = process.env.QUICK_EDIT_TEST_URL || 'http://127.0.0.1:3033';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const permissions = ['content:view', 'content:create', 'content:edit', 'content:delete', 'members:view', 'members:create', 'members:edit', 'members:delete', 'applications:view', 'applications:create', 'applications:edit', 'applications:delete'];
const roleSlug = `codex_nav_check_${suffix.replace(/[^a-z0-9]/gi, '_')}`;
const viewerRoleSlug = `codex_nav_view_${suffix.replace(/[^a-z0-9]/gi, '_')}`;
const categoryKey = `qe-check-${Date.now()}`;
let role;
let user;
let viewerRole;
let viewer;
let navigationId;
const footerNavigationIds = [];
let categoryId;
let applicationId;

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

async function createToken(targetUser, targetRole, tokenPermissions) {
  const secret = process.env.JWT_SECRET;
  return new SignJWT({
    user: {
      id: targetUser.id,
      userId: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
      roleId: targetRole.id,
      role: targetRole.slug,
      roleSlug: targetRole.slug,
      roleVersion: targetRole.version,
      roleStatus: targetRole.status,
      permissions: tokenPermissions,
      sessionVersion: targetUser.sessionVersion,
      mustChangePassword: false,
    },
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(secret));
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
  const token = await createToken(user, role, permissions);

  viewerRole = await prisma.role.create({
    data: { name: 'Temporary membership read-only verification', slug: viewerRoleSlug, permissions: ['members:view'] },
  });
  viewer = await prisma.user.create({
    data: {
      email: `codex-nav-view-${suffix}@example.invalid`,
      name: 'Temporary Membership Read-only Check',
      passwordHash: 'not-used',
      roleId: viewerRole.id,
    },
  });
  const viewerToken = await createToken(viewer, viewerRole, ['members:view']);

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

  const footerFixtures = [
    ['Projects', '/about', '/projects'],
    ['Strategic Plan', '/publications', '/strategic-plan'],
    ['Board of Trustees', '/about#governance', '/board-of-trustees'],
    ['Secretariat', '/about#governance', '/secretariat'],
    ['Member shops', '/shop', '/outlets'],
    ['Annual reports', '/publications', '/annual-reports'],
    ['Audited accounts', '/publications', '/audited-accounts'],
    ['Tenders & vacancies', '/news', '/tenders'],
    ['Shipping & delivery', '/about#support', '/shipping-policy'],
    ['Returns', '/about#support', '/returns-policy'],
    ['Duty & customs', '/about#support', '/customs-policy'],
    ['About HAB', '/about', '/about'],
    ['Strategic Plan', '/pages/custom-strategy', '/pages/custom-strategy'],
  ];
  for (const [label, href] of footerFixtures) {
    const createdFooterLink = await request('/api/admin/navigation', token, {
      method: 'POST',
      body: JSON.stringify({ menuType: 'FOOTER', column: `Temporary ${suffix}`, label: `${label} ${suffix}`, href, sortOrder: 9876 }),
    });
    assert(createdFooterLink.response.status === 201 && createdFooterLink.body.success, `Footer link fixture create failed for ${label}: ${createdFooterLink.body.error || createdFooterLink.response.status}.`);
    footerNavigationIds.push(createdFooterLink.body.item?.id);
  }
  const publicFooterRead = await request('/api/navigation', null);
  const publicFooterLinks = Object.values(publicFooterRead.body.footer || {}).flat();
  for (let index = 0; index < footerFixtures.length; index += 1) {
    const [label, , expectedHref] = footerFixtures[index];
    assert(publicFooterLinks.find((item) => item.id === footerNavigationIds[index])?.href === expectedHref, `Footer link “${label}” did not resolve to ${expectedHref}.`);
  }
  const renderedHomeResponse = await fetch(`${baseUrl}/`, { cache: 'no-store' });
  const renderedHome = await renderedHomeResponse.text();
  assert(renderedHomeResponse.ok, `Public homepage SSR returned HTTP ${renderedHomeResponse.status}.`);
  assert(renderedHome.includes(`Updated ${suffix}`), 'Initial server-rendered header did not use saved navigation.');
  assert(renderedHome.includes(`aria-label="Temporary ${suffix}"`), 'Initial server-rendered footer did not use saved navigation.');
  assert(renderedHome.includes(`Projects ${suffix}`) && renderedHome.includes('href="/projects"'), 'Initial footer SSR did not apply the canonical Projects destination.');
  assert(renderedHome.includes('Strategic Plan ') && renderedHome.includes('href="/pages/custom-strategy"'), 'Initial footer SSR did not preserve a custom Admin-saved destination.');

  const deleted = await request(`/api/admin/navigation?id=${encodeURIComponent(navigationId)}`, token, { method: 'DELETE' });
  assert(deleted.response.ok && deleted.body.success, `Delete failed: ${deleted.body.error || deleted.response.status}.`);
  navigationId = null;
  const afterDelete = await prisma.navigationItem.findUnique({ where: { id: created.body.item.id } });
  assert(afterDelete === null, 'Deleted navigation item still exists in the database.');

  const viewerCreate = await request('/api/admin/membership-categories', viewerToken, {
    method: 'POST',
    body: JSON.stringify({ key: `${categoryKey}-denied`, name: 'Should not be created', description: 'Unauthorized write probe.' }),
  });
  assert(viewerCreate.response.status === 403, `Read-only role create returned ${viewerCreate.response.status}, expected 403.`);

  const categoryCreated = await request('/api/admin/membership-categories', token, {
    method: 'POST',
    body: JSON.stringify({ key: categoryKey, name: `Temporary ${suffix}`, description: 'Temporary Quick Edit category check.', duesBTN: 1200, duesUSD: 15, eligibility: 'Local integration verification only.', benefits: ['Benefit one'], bannerImageUrl: null, isActive: true, sortOrder: 9876 }),
  });
  assert(categoryCreated.response.status === 200 && categoryCreated.body.success, `Category create failed: ${categoryCreated.body.error || categoryCreated.response.status}.`);
  categoryId = categoryCreated.body.category?.id;
  assert(categoryId, 'Category create returned no record ID.');

  const categoryUpdated = await request('/api/admin/membership-categories', token, {
    method: 'PUT',
    body: JSON.stringify({ id: categoryId, name: `Updated ${suffix}`, description: 'Updated Quick Edit category check.', duesBTN: 1500, benefits: ['Benefit one', 'Benefit two'], isActive: true, sortOrder: 9877 }),
  });
  assert(categoryUpdated.response.ok && categoryUpdated.body.success, `Category update failed: ${categoryUpdated.body.error || categoryUpdated.response.status}.`);
  assert(categoryUpdated.body.category?.name === `Updated ${suffix}` && categoryUpdated.body.category?.duesBTN === 1500, 'Category update did not round-trip.');

  const categoryPublicRead = await request(`/api/membership-categories?key=${encodeURIComponent(categoryKey)}`, null);
  assert(categoryPublicRead.response.ok && categoryPublicRead.body.category?.name === `Updated ${suffix}`, 'Public membership page API did not expose the saved category.');

  const categoryDeleted = await request(`/api/admin/membership-categories?id=${encodeURIComponent(categoryId)}`, token, { method: 'DELETE' });
  assert(categoryDeleted.response.ok && categoryDeleted.body.success, `Category delete failed: ${categoryDeleted.body.error || categoryDeleted.response.status}.`);
  categoryId = null;
  const categoryAfterDelete = await prisma.membershipCategory.findUnique({ where: { key: categoryKey } });
  assert(categoryAfterDelete === null, 'Deleted membership category still exists in the database.');

  const applicationCreated = await request('/api/admin/applications', token, {
    method: 'POST',
    body: JSON.stringify({ applicantName: `Temporary ${suffix}`, email: `codex-application-check-${suffix}@example.invalid`, phone: '+975-17000000', cidNumber: '12345678901', businessLicense: 'LOCAL-QA', craftKey: 'thagzo', dzongkhag: 'Thimphu', villageGewog: 'Local test', yearsPractising: 3, planTier: 'ACTIVE_SECTOR_MEMBER', paymentMethod: 'CARD' }),
  });
  assert(applicationCreated.response.ok && applicationCreated.body.success, `Application create failed: ${applicationCreated.body.error || applicationCreated.response.status}.`);
  applicationId = applicationCreated.body.application?.id;
  assert(applicationId && applicationCreated.body.application.status === 'PENDING', 'Manual application create did not return its pending application.');

  const anonymousEdit = await request('/api/admin/applications', null, {
    method: 'PATCH',
    body: JSON.stringify({ id: applicationId, applicantName: 'Unauthorized probe' }),
  });
  assert(anonymousEdit.response.status === 401, `Anonymous application edit returned ${anonymousEdit.response.status}, expected 401 before ID lookup.`);

  const listedApplications = await request('/api/admin/applications', token);
  assert(listedApplications.response.ok && listedApplications.body.applications?.some((item) => item.id === applicationId), 'Staff application list did not return the created record.');

  const applicationUpdated = await request('/api/admin/applications', token, {
    method: 'PATCH',
    body: JSON.stringify({ id: applicationId, applicantName: `Updated ${suffix}`, villageGewog: 'Edited locally' }),
  });
  assert(applicationUpdated.response.ok && applicationUpdated.body.success && applicationUpdated.body.application?.applicantName === `Updated ${suffix}`, 'Application edit did not round-trip.');

  const applicationDeleted = await request(`/api/admin/applications?id=${encodeURIComponent(applicationId)}`, token, { method: 'DELETE' });
  assert(applicationDeleted.response.ok && applicationDeleted.body.success, `Application delete failed: ${applicationDeleted.body.error || applicationDeleted.response.status}.`);
  applicationId = null;

  console.log('PASS: anonymous navigation writes denied; authenticated header navigation CRUD/public read succeeded; 12 known legacy footer destinations resolve to their own routes while custom Admin destinations are preserved; server-rendered header/footer immediately use saved navigation; a members:view-only role was denied category writes; membership-category CRUD/public read succeeded; membership-application CRUD succeeded; anonymous application edit was denied before record lookup; temporary records cleaned up.');
} catch (error) {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
} finally {
  if (navigationId) await prisma.navigationItem.deleteMany({ where: { id: navigationId } }).catch(() => {});
  if (footerNavigationIds.length) await prisma.navigationItem.deleteMany({ where: { id: { in: footerNavigationIds.filter(Boolean) } } }).catch(() => {});
  if (categoryId) await prisma.membershipCategory.deleteMany({ where: { id: categoryId } }).catch(() => {});
  if (applicationId) await prisma.membershipApplication.deleteMany({ where: { id: applicationId } }).catch(() => {});
  const testActorIds = [user?.id, viewer?.id].filter(Boolean);
  if (testActorIds.length) await prisma.auditLog.deleteMany({ where: { actorId: { in: testActorIds } } }).catch(() => {});
  if (user) await prisma.user.deleteMany({ where: { id: user.id } }).catch(() => {});
  if (role) await prisma.role.deleteMany({ where: { id: role.id } }).catch(() => {});
  if (viewer) await prisma.user.deleteMany({ where: { id: viewer.id } }).catch(() => {});
  if (viewerRole) await prisma.role.deleteMany({ where: { id: viewerRole.id } }).catch(() => {});
  await prisma.$disconnect();
}
