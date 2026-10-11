import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';
import { requireTestDatabaseUrl } from './lib/safe-test-database.mjs';

nextEnv.loadEnvConfig(process.cwd(), true);
const databaseUrl = requireTestDatabaseUrl();
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const baseUrl = process.env.QUICK_EDIT_TEST_URL || 'http://127.0.0.1:3033';
const suffix = randomUUID();
const original = '/assets/photos/hero-1-weaving.jpg';
const replacement = '/assets/photos/hero-4-textiles.jpg';
let role;
let user;
let project;

function assert(value, message) {
  if (!value) throw new Error(message);
}

try {
  role = await prisma.role.create({ data: {
    name: 'Disposable project cover verifier',
    slug: `project_cover_test_${suffix.replaceAll('-', '_')}`,
    permissions: ['content:view', 'content:edit'],
  } });
  user = await prisma.user.create({ data: {
    email: `project-cover-${suffix}@example.invalid`,
    name: 'Disposable project cover verifier', passwordHash: 'not-used', roleId: role.id,
  } });
  project = await prisma.projectRecord.create({ data: {
    name: `Disposable project cover ${suffix}`, status: 'current', partner: 'Local test only',
    period: '2026', budget: 'Test only', progressPercent: 1, summary: 'Local fixture.',
    activities: { list: ['Preserve this activity'], coverPhotoUrl: original, reportPdfUrl: '' },
    results: [],
  } });

  const permissions = ['content:view', 'content:edit'];
  const token = await new SignJWT({ user: {
    id: user.id, userId: user.id, email: user.email, name: user.name,
    roleId: role.id, role: role.slug, roleSlug: role.slug,
    roleVersion: role.version, roleStatus: role.status, permissions,
    sessionVersion: user.sessionVersion, mustChangePassword: false,
  } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const getPublic = async () => {
    const response = await fetch(`${baseUrl}/api/projects`, { cache: 'no-store' });
    assert(response.ok, `Public projects returned ${response.status}`);
    const body = await response.json();
    return body.projects.find(item => item.id === project.id);
  };
  assert((await getPublic())?.coverPhotoUrl === original, 'Original cover missing from public API.');

  const denied = await fetch(`${baseUrl}/api/admin/projects`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: project.id, coverPhotoUrl: replacement }),
  });
  assert(denied.status === 401 || denied.status === 403, 'Anonymous cover update was not denied.');
  assert((await getPublic())?.coverPhotoUrl === original, 'Anonymous attempt changed the public cover.');

  const save = await fetch(`${baseUrl}/api/admin/projects`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: `hab_session=${token}` },
    body: JSON.stringify({ id: project.id, coverPhotoUrl: replacement }),
  });
  const saved = await save.json();
  assert(save.ok && saved.success, `Project cover save failed: ${saved.error || save.status}`);
  assert(saved.project.coverPhotoUrl === replacement, 'Admin response did not return replacement.');
  assert((await getPublic())?.coverPhotoUrl === replacement, 'Public listing did not receive replacement.');

  const stored = await prisma.projectRecord.findUniqueOrThrow({ where: { id: project.id } });
  assert(stored.activities?.coverPhotoUrl === replacement, 'Project record did not persist replacement.');
  assert(stored.activities?.list?.[0] === 'Preserve this activity', 'Project activity was overwritten.');

  const detail = await fetch(`${baseUrl}/projects/${project.id}`, { cache: 'no-store' });
  const html = await detail.text();
  assert(detail.ok && html.includes('data-hab-gallery="project"'), 'Detail cover is not record-aware in Quick Edit.');
  assert(html.includes(replacement), 'Detail page did not render replacement cover.');
  assert(html.includes(`data-hab-gallery-id="${project.id}"`), 'Detail cover lacks Project ID.');
  console.log('PASS: anonymous cover save denied; isolated authorized save persisted to Admin record, public listing, and detail page; other project fields were preserved.');
} finally {
  if (project) await prisma.projectRecord.deleteMany({ where: { id: project.id } });
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
  if (role) await prisma.role.deleteMany({ where: { id: role.id } });
  await prisma.$disconnect();
}
