import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import { validateTestDatabaseUrl } from './lib/safe-test-database.mjs';

nextEnv.loadEnvConfig(process.cwd(), true);
const testDatabaseUrl = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const baseUrl = process.env.HAB_TEST_BASE_URL || 'http://127.0.0.1:3033';
assert.ok(['127.0.0.1', 'localhost', '::1'].includes(new URL(baseUrl).hostname), 'Only a loopback app may be tested.');
assert.ok(process.env.JWT_SECRET?.length >= 32, 'Local JWT secret is required.');
const prisma = new PrismaClient({ datasources: { db: { url: testDatabaseUrl } } });
const suffix = randomUUID().replaceAll('-', '');
const rateLimitKey = `payment-proof-upload:codex-test-${suffix}`;
let role;
let actor;
let uploadedName;
let legacyName;

try {
  role = await prisma.role.create({ data: { name: 'Disposable proof verifier', slug: `codex_proof_${suffix}`, permissions: ['orders:view'] } });
  actor = await prisma.user.create({ data: { email: `codex-proof-${suffix}@example.invalid`, name: 'Disposable proof reviewer', passwordHash: 'unused', roleId: role.id } });
  const token = await new SignJWT({ user: {
    id: actor.id, email: actor.email, name: actor.name, roleId: role.id,
    roleSlug: role.slug, role: role.slug, sessionVersion: actor.sessionVersion,
    permissions: ['orders:view'],
  } }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const bytes = Buffer.from('%PDF-1.4\nDisposable payment proof access test\n');
  const upload = async (endpoint) => {
    const form = new FormData();
    form.append('file', new File([bytes], 'proof.pdf', { type: 'application/pdf' }));
    const response = await fetch(`${baseUrl}${endpoint}`, { method: 'POST', headers: { 'x-real-ip': `codex-test-${suffix}` }, body: form });
    assert.equal(response.status, 200, `Proof upload failed at ${endpoint}`);
    return response.json();
  };

  for (const endpoint of ['/api/upload', '/api/donations/upload']) {
    const result = await upload(endpoint);
    assert.match(result.url, /^\/api\/payment-proofs\/[a-f0-9-]{36}\.pdf$/);
    uploadedName = result.url.split('/').pop();
    const publicResponse = await fetch(`${baseUrl}${result.url}`);
    assert.equal(publicResponse.status, 401, 'Anonymous callers must not read a proof.');
    const staffResponse = await fetch(`${baseUrl}${result.url}`, { headers: { cookie: `hab_session=${token}` } });
    assert.equal(staffResponse.status, 200, 'Authorized staff must read a proof.');
    assert.match(staffResponse.headers.get('cache-control') || '', /\bno-store\b/);
    assert.deepEqual(Buffer.from(await staffResponse.arrayBuffer()), bytes);
    await unlink(path.join(process.cwd(), '.data', 'private-uploads', 'payment-proofs', uploadedName));
    uploadedName = undefined;
  }
  legacyName = `hab-${Date.now()}-0001.pdf`;
  const legacyDir = path.join(process.cwd(), '.data', 'private-uploads', 'payment-proofs', 'legacy');
  await mkdir(legacyDir, { recursive: true });
  await writeFile(path.join(legacyDir, legacyName), bytes, { flag: 'wx' });
  const legacyUrl = `${baseUrl}/api/payment-proofs/legacy/${legacyName}`;
  assert.equal((await fetch(legacyUrl)).status, 401, 'Migrated legacy proof must not be public.');
  const legacyStaff = await fetch(legacyUrl, { headers: { cookie: `hab_session=${token}` } });
  assert.equal(legacyStaff.status, 200, 'Authorized staff must read a migrated legacy proof.');
  assert.deepEqual(Buffer.from(await legacyStaff.arrayBuffer()), bytes);
  await unlink(path.join(legacyDir, legacyName));
  legacyName = undefined;
  console.log('PASS: both proof upload paths use private storage; anonymous reads fail; current authorized staff can read new and migrated legacy proofs with no-store caching.');
} finally {
  if (uploadedName && /^[a-f0-9-]{36}\.pdf$/.test(uploadedName)) {
    await unlink(path.join(process.cwd(), '.data', 'private-uploads', 'payment-proofs', uploadedName)).catch(() => {});
  }
  if (legacyName && /^hab-\d{13}-0001\.pdf$/.test(legacyName)) {
    await unlink(path.join(process.cwd(), '.data', 'private-uploads', 'payment-proofs', 'legacy', legacyName)).catch(() => {});
  }
  if (actor) {
    await prisma.auditLog.deleteMany({ where: { OR: [{ actorId: actor.id }, { entityId: actor.id }] } });
    await prisma.user.delete({ where: { id: actor.id } });
  }
  await prisma.rateLimitAttempt.deleteMany({ where: { key: rateLimitKey } });
  if (role) await prisma.role.delete({ where: { id: role.id } });
  await prisma.$disconnect();
}
