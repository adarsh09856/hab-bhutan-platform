import nextEnv from '@next/env';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { createSessionToken } from '../src/lib/rbac.ts';
import { POST as uploadPortrait } from '../src/app/api/admin/upload/route.ts';
import { PATCH as updateMember } from '../src/app/api/admin/members/route.ts';
import { GET as readPublicMember } from '../src/app/api/members/route.ts';
import { requireTestDatabaseUrl } from './lib/safe-test-database.mjs';

nextEnv.loadEnvConfig(process.cwd(), true);
const testDatabaseUrl = requireTestDatabaseUrl();
if (process.env.DATABASE_URL !== testDatabaseUrl) {
  throw new Error('Safety stop: DATABASE_URL must exactly match the isolated TEST_DATABASE_URL.');
}

const prisma = new PrismaClient({ datasources: { db: { url: testDatabaseUrl } } });
const suffix = randomUUID().replaceAll('-', '').slice(0, 12);
const permissions = ['members:view', 'members:edit'];
const roleSlug = 'staff_operator';
const email = `portrait-roundtrip-${suffix}@example.invalid`;
const regNumber = `HAB-QA-${suffix.toUpperCase()}`;
const uploadPrefix = `qa_portrait_${suffix}`;
const uploadRoot = path.resolve(process.cwd(), 'public/uploads');
let role;
let user;
let craft;
let member;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function request(url, token, init = {}) {
  return new NextRequest(`http://127.0.0.1${url}`, {
    ...init,
    headers: { ...(init.headers || {}), ...(token ? { Cookie: `hab_session=${token}` } : {}) },
  });
}

try {
  const latestStaffRole = await prisma.role.findFirst({
    where: { slug: roleSlug },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  role = await prisma.role.create({
    data: {
      name: `Disposable portrait round-trip ${suffix}`,
      slug: roleSlug,
      version: (latestStaffRole?.version || 0) + 1,
      permissions,
    },
  });
  user = await prisma.user.create({
    data: { email, name: 'Disposable portrait QA', passwordHash: 'not-used', roleId: role.id },
  });
  craft = await prisma.craft.create({
    data: {
      key: `qa-portrait-${suffix}`,
      name: 'Disposable portrait QA craft',
      english: 'Disposable portrait QA craft',
      description: 'Temporary integration-test fixture.',
      isActive: true,
    },
  });
  member = await prisma.member.create({
    data: {
      name: 'Disposable portrait QA member',
      craftKey: craft.key,
      dzongkhag: 'Thimphu',
      joinYear: 2026,
      regNumber,
      tier: 'ACTIVE_SECTOR_MEMBER',
      status: 'VERIFIED',
      bio: 'Temporary image persistence test; not a real member.',
      cidNumber: `QA-${suffix}`,
      village: 'Local test fixture',
      duesExpiryDate: new Date('2030-01-01T00:00:00.000Z'),
    },
  });

  const token = await createSessionToken({
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
  });

  const imageBytes = await fs.readFile(path.join(process.cwd(), 'public/assets/photos/hero-1-weaving.jpg'));
  const form = new FormData();
  form.append('file', new File([imageBytes], `${uploadPrefix}.jpg`, { type: 'image/jpeg' }));
  const uploadResponse = await uploadPortrait(request(
    `/api/admin/upload?purpose=member-portrait&memberRegNumber=${encodeURIComponent(regNumber)}`,
    token,
    { method: 'POST', body: form },
  ));
  const uploadBody = await uploadResponse.json();
  assert(uploadResponse.status === 200 && uploadBody.success, `Portrait upload failed: ${uploadBody.error || uploadResponse.status}`);
  assert(uploadBody.variants?.some((variant) => variant.url === uploadBody.url), 'Upload URL is not one of its processed variants.');

  const updateResponse = await updateMember(request('/api/admin/members', token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: member.id, portraitUrl: uploadBody.url }),
  }));
  const updateBody = await updateResponse.json();
  assert(updateResponse.status === 200 && updateBody.success, `Member portrait save failed: ${updateBody.error || updateResponse.status}`);
  assert(updateBody.member?.portraitUrl === uploadBody.url, 'Admin save response omitted the uploaded portrait URL.');

  const reloaded = await prisma.member.findUniqueOrThrow({ where: { id: member.id }, select: { portraitUrl: true } });
  assert(reloaded.portraitUrl === uploadBody.url, 'Portrait URL did not persist after reloading the DB row.');

  const publicResponse = await readPublicMember(new NextRequest(
    `http://127.0.0.1/api/members?slug=${encodeURIComponent(regNumber)}`,
  ));
  const publicBody = await publicResponse.json();
  assert(publicResponse.status === 200 && publicBody.success, `Public member read failed: ${publicBody.error || publicResponse.status}`);
  assert(publicBody.member?.portraitUrl === uploadBody.url, 'Public member API did not expose the saved portrait.');

  console.log('PASS: disposable member portrait uploaded and processed, saved through Admin PATCH, persisted after DB reload, and returned by public member API.');
} finally {
  if (member) await prisma.member.deleteMany({ where: { id: member.id } }).catch(() => {});
  if (user) {
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: user.id } }).catch(() => {});
  }
  if (craft) await prisma.craft.deleteMany({ where: { id: craft.id } }).catch(() => {});
  if (role) await prisma.role.deleteMany({ where: { id: role.id } }).catch(() => {});
  for (const folder of ['originals', 'responsive']) {
    const directory = path.join(uploadRoot, folder);
    for (const entry of await fs.readdir(directory, { withFileTypes: true }).catch(() => [])) {
      if (entry.isFile() && entry.name.startsWith(`${uploadPrefix}_`)) {
        await fs.unlink(path.join(directory, entry.name));
      }
    }
  }
  await prisma.$disconnect();
}
