import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();
const baseUrl = process.env.PROGRAMME_DZ_TEST_URL || 'http://127.0.0.1:3033';
const parsedUrl = new URL(baseUrl);
const dbHost = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : '';
if (!['127.0.0.1', 'localhost', '::1'].includes(parsedUrl.hostname) || !['127.0.0.1', 'localhost', '::1'].includes(dbHost)) {
  throw new Error('Safety stop: programme verification is restricted to a loopback app and local database.');
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Local JWT_SECRET is missing or too short.');

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const permissions = ['content:view', 'content:edit'];
let role;
let actor;
let pillar;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  role = await prisma.role.create({ data: { name: 'Temporary programme Dzongkha verification', slug: `codex_prog_dz_${suffix.replace(/[^a-z0-9]/gi, '_')}`, permissions } });
  actor = await prisma.user.create({ data: { email: `codex-prog-dz-${suffix}@example.invalid`, name: 'Local programme verification', passwordHash: 'not-used', roleId: role.id } });
  const token = await new SignJWT({ user: {
    id: actor.id, userId: actor.id, email: actor.email, name: actor.name,
    roleId: role.id, role: role.slug, roleSlug: role.slug, roleVersion: role.version,
    roleStatus: role.status, permissions, sessionVersion: actor.sessionVersion, mustChangePassword: false,
  } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const request = async (path, options = {}) => fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { ...(options.body ? { 'content-type': 'application/json' } : {}), Cookie: `hab_session=${token}` },
  });

  const create = await request('/api/admin/programmes', { method: 'POST', body: JSON.stringify({
    ref: `Z${Date.now()}`, title: 'Local verification programme', titleDz: 'འབྲུག་སྐད་བརྟག་དཔྱད',
    description: 'Temporary verification description', descriptionDz: 'འགྲེལ་བཤད་བརྟག་དཔྱད',
    activities: ['English activity'], activitiesDz: ['ལས་སྣ་བརྟག་དཔྱད'], isActive: true,
  }) });
  const created = await create.json();
  assert(create.ok && created.success && created.pillar?.titleDz === 'འབྲུག་སྐད་བརྟག་དཔྱད', `Admin create failed (${create.status}): ${created.error || 'unexpected response'}`);
  pillar = created.pillar;

  const update = await request('/api/admin/programmes', { method: 'PUT', body: JSON.stringify({
    id: pillar.id, titleDz: 'མིང་བསྐྱར་བཅོས', descriptionDz: 'འགྲེལ་བཤད་བསྐྱར་བཅོས', activitiesDz: ['ལས་སྣ་བསྐྱར་བཅོས'],
  }) });
  const updated = await update.json();
  assert(update.ok && updated.success, `Admin update failed (${update.status}): ${updated.error || 'unexpected response'}`);

  const publicResponse = await fetch(`${baseUrl}/api/programmes`, { cache: 'no-store' });
  const publicBody = await publicResponse.json();
  const publicPillar = publicBody.pillars?.find((item) => item.id === pillar.id);
  assert(publicResponse.ok && publicPillar?.titleDz === 'མིང་བསྐྱར་བཅོས', 'Public programme API did not return the updated Dzongkha title.');
  assert(publicPillar?.descriptionDz === 'འགྲེལ་བཤད་བསྐྱར་བཅོས' && publicPillar?.activitiesDz?.[0] === 'ལས་སྣ་བསྐྱར་བཅོས', 'Public programme API did not return the updated Dzongkha description and activity.');

  console.log('PASS: local programme create/update API stores Dzongkha title, description, and activities; public API returns updated values.');
} catch (error) {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
} finally {
  if (pillar) await prisma.programmePillar.deleteMany({ where: { id: pillar.id } }).catch(() => {});
  if (actor) await prisma.auditLog.deleteMany({ where: { actorId: actor.id } }).catch(() => {});
  if (actor) await prisma.user.deleteMany({ where: { id: actor.id } }).catch(() => {});
  if (role) await prisma.role.deleteMany({ where: { id: role.id } }).catch(() => {});
  await prisma.$disconnect();
}
