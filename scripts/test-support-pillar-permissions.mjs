import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();
const baseUrl = process.env.SUPPORT_PILLAR_TEST_URL || 'http://127.0.0.1:3033';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const writableKey = `codex-support-${suffix}`;
const unicodeKey = `codex-dz-${suffix}`;
let writerRole;
let viewerRole;
let writer;
let viewer;
let createdPillarId;
let unicodePillarId;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function makeToken(user, role, permissions) {
  return new SignJWT({ user: {
    id: user.id, userId: user.id, email: user.email, name: user.name,
    roleId: role.id, role: role.slug, roleSlug: role.slug, roleVersion: role.version,
    roleStatus: role.status, permissions, sessionVersion: user.sessionVersion, mustChangePassword: false,
  } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

async function request(method, token, body, query = '') {
  const response = await fetch(`${baseUrl}/api/admin/support-pillars${query}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), Cookie: `hab_session=${token}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

async function run() {
  assert(['localhost', '127.0.0.1', '::1'].includes(new URL(process.env.DATABASE_URL).hostname), 'Safety stop: test requires localhost PostgreSQL.');
  assert(['localhost', '127.0.0.1', '::1'].includes(new URL(baseUrl).hostname), 'Safety stop: test requires a localhost app.');
  assert(process.env.JWT_SECRET?.length >= 32, 'Local JWT_SECRET is missing or too short.');

  try {
    writerRole = await prisma.role.create({ data: { name: `Temporary pillar editor ${suffix}`, slug: `codex-pillar-edit-${suffix}`, permissions: ['content:view', 'content:edit'] } });
    viewerRole = await prisma.role.create({ data: { name: `Temporary pillar viewer ${suffix}`, slug: `codex-pillar-view-${suffix}`, permissions: ['content:view'] } });
    writer = await prisma.user.create({ data: { email: `pillar-editor-${suffix}@example.invalid`, name: 'Temporary support pillar editor test', passwordHash: 'not-used', roleId: writerRole.id } });
    viewer = await prisma.user.create({ data: { email: `pillar-viewer-${suffix}@example.invalid`, name: 'Temporary support pillar viewer test', passwordHash: 'not-used', roleId: viewerRole.id } });
    const writerToken = await makeToken(writer, writerRole, ['content:view', 'content:edit']);
    const viewerToken = await makeToken(viewer, viewerRole, ['content:view']);

    const created = await request('POST', writerToken, { key: writableKey, title: `Temporary ${suffix}`, description: 'Local permission and CRUD verification only.' });
    assert(created.response.status === 201 && created.body.success, `Editor could not create support pillar: ${created.body.error || created.response.status}.`);
    createdPillarId = created.body.pillar?.id;
    assert(createdPillarId, 'Created support pillar returned no id.');

    const viewerRead = await request('GET', viewerToken);
    assert(viewerRead.response.ok && viewerRead.body.pillars?.some((pillar) => pillar.id === createdPillarId), 'content:view role should be able to read support pillars.');
    const deniedPost = await request('POST', viewerToken, { key: `${writableKey}-denied`, title: 'Denied', description: 'Must not create.' });
    const deniedPut = await request('PUT', viewerToken, { id: createdPillarId, title: 'Must not change' });
    const deniedDelete = await request('DELETE', viewerToken, null, `?id=${encodeURIComponent(createdPillarId)}`);
    assert([deniedPost.response.status, deniedPut.response.status, deniedDelete.response.status].every((status) => status === 403), 'content:view-only role must receive 403 for create, update and delete.');
    assert((await prisma.supportPillar.findUnique({ where: { id: createdPillarId } }))?.title === `Temporary ${suffix}`, 'Denied write changed the support pillar.');

    const updated = await request('PUT', writerToken, { id: createdPillarId, title: `Updated ${suffix}`, description: 'Updated local ASCII test.' });
    assert(updated.response.ok && updated.body.pillar?.title === `Updated ${suffix}`, 'content:edit role could not update support pillar.');

    const encoding = await prisma.$queryRawUnsafe('SHOW server_encoding');
    const encodingName = String(encoding?.[0]?.server_encoding || '').toUpperCase();
    const unicodeCreate = await request('POST', writerToken, { key: unicodeKey, title: 'རྫོང་ཁ', description: 'ལག་བཟོ།' });
    if (encodingName === 'UTF8') {
      assert(unicodeCreate.response.status === 201 && unicodeCreate.body.pillar?.title === 'རྫོང་ཁ', `UTF-8 database did not preserve Dzongkha: ${unicodeCreate.body.error || unicodeCreate.response.status}.`);
      unicodePillarId = unicodeCreate.body.pillar.id;
    } else {
      assert(unicodeCreate.response.status === 503 && /UTF-8/.test(unicodeCreate.body.error || ''), `Non-UTF8 database should return a clear encoding error, got ${unicodeCreate.response.status}: ${unicodeCreate.body.error || ''}.`);
      assert(await prisma.supportPillar.count({ where: { key: unicodeKey } }) === 0, 'Unsupported Unicode input was silently stored after alteration.');
    }

    const deleted = await request('DELETE', writerToken, null, `?id=${encodeURIComponent(createdPillarId)}`);
    assert(deleted.response.ok && deleted.body.deleted, 'content:edit role could not delete support pillar.');
    createdPillarId = null;
    console.log(`PASS: support-pillar CRUD requires content:edit, content:view remains read-only, and Unicode writes are preserved or rejected without data loss (database encoding: ${encodingName}).`);
  } finally {
    await prisma.supportPillar.deleteMany({ where: { OR: [{ id: createdPillarId || '' }, { id: unicodePillarId || '' }, { key: writableKey }, { key: unicodeKey }] } }).catch(() => {});
    const actorIds = [writer?.id, viewer?.id].filter(Boolean);
    if (actorIds.length) await prisma.auditLog.deleteMany({ where: { actorId: { in: actorIds } } }).catch(() => {});
    if (writer) await prisma.user.deleteMany({ where: { id: writer.id } }).catch(() => {});
    if (viewer) await prisma.user.deleteMany({ where: { id: viewer.id } }).catch(() => {});
    if (writerRole) await prisma.role.deleteMany({ where: { id: writerRole.id } }).catch(() => {});
    if (viewerRole) await prisma.role.deleteMany({ where: { id: viewerRole.id } }).catch(() => {});
    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
});
