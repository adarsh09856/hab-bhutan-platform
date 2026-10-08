import assert from 'node:assert/strict';
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

nextEnv.loadEnvConfig(process.cwd(), true);
const baseUrl = process.env.HAB_TEST_BASE_URL || 'http://127.0.0.1:3035';
if (!['127.0.0.1', 'localhost', '::1'].includes(new URL(baseUrl).hostname)) {
  throw new Error('This regression may only call a local loopback app.');
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('A sufficiently long local JWT_SECRET is required.');
}

const prisma = new PrismaClient();
const suffix = randomUUID();
const buyerId = `codex-local-${suffix}`;
const username = `codex_${suffix.replaceAll('-', '').slice(0, 16)}`;
const email = `codex-wholesale-${suffix}@example.invalid`;
const unhashedBuyerId = `codex-unhashed-${suffix}`;
const unhashedUsername = `codex_nohash_${suffix.replaceAll('-', '').slice(0, 12)}`;
const actorId = `codex-local-test-${suffix}`;
let buyerCreated = false;
let unhashedBuyerCreated = false;

async function call(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  return { response, body: await response.json().catch(() => ({})) };
}

try {
  await prisma.wholesaleBuyer.create({
    data: {
      id: buyerId,
      username,
      passwordHash: await bcrypt.hash(randomUUID(), 4),
      companyName: 'Local approval-to-login verification',
      contactName: 'Local test only',
      email,
      country: 'Bhutan',
      discountTier: 20,
      status: 'PENDING',
    },
  });
  buyerCreated = true;

  const staffToken = await new SignJWT({ user: {
    id: actorId,
    email: 'codex-local-test@example.invalid',
    name: 'Local integration test',
    role: 'staff_operator',
    roleSlug: 'staff_operator',
    roleId: 'local-test-role',
    roleVersion: 1,
    roleStatus: 'ACTIVE',
    permissions: ['*'],
    sessionVersion: 1,
    mustChangePassword: false,
  } })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const approval = await call('/api/admin/wholesale/action', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `hab_session=${staffToken}` },
    body: JSON.stringify({ buyerId, action: 'APPROVE' }),
  });
  assert.equal(approval.response.status, 200, `approval failed: ${approval.body.error || approval.response.status}`);
  assert.equal(approval.body.success, true);
  assert.equal(approval.body.status, 'ACTIVE');
  assert.equal(typeof approval.body.temporaryPassword, 'string');
  const storedBuyer = await prisma.wholesaleBuyer.findUnique({ where: { id: buyerId } });
  assert.equal(storedBuyer?.status, 'ACTIVE', 'approval must be persisted before credentials are returned');
  assert.ok(await bcrypt.compare(approval.body.temporaryPassword, storedBuyer.passwordHash), 'emailed temporary password must match the persisted hash');

  const login = await call('/api/wholesale/auth', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password: approval.body.temporaryPassword }),
  });
  assert.equal(login.response.status, 200, `approved buyer could not sign in: ${login.body.error || login.response.status}`);
  assert.equal(login.body.buyer.username, username);
  const cookie = login.response.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie?.startsWith('hab_wholesale_session='));
  const session = await call('/api/wholesale/auth', { headers: { cookie } });
  assert.equal(session.body.authenticated, true, 'approved buyer session must remain valid');

  const logout = await call('/api/wholesale/auth', { method: 'DELETE', headers: { cookie } });
  assert.equal(logout.response.status, 200);

  await prisma.wholesaleBuyer.create({
    data: {
      id: unhashedBuyerId,
      username: unhashedUsername,
      passwordHash: '',
      companyName: 'Local passwordless denial verification',
      contactName: 'Local test only',
      email: `codex-nohash-${suffix}@example.invalid`,
      country: 'Bhutan',
      status: 'ACTIVE',
    },
  });
  unhashedBuyerCreated = true;
  const passwordlessLogin = await call('/api/wholesale/auth', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: unhashedUsername, password: 'any-password' }),
  });
  assert.equal(passwordlessLogin.response.status, 401, 'active legacy record without a bcrypt hash must not bypass password authentication');

  console.log('PASS: local database buyer approval persisted ACTIVE status and matching password hash; returned temporary credentials authenticated successfully; session/logout worked; passwordless account was denied.');
} finally {
  if (buyerCreated) {
    await prisma.auditLog.deleteMany({ where: { entityId: buyerId } }).catch(() => {});
    await prisma.wholesaleBuyer.deleteMany({ where: { id: buyerId } }).catch(() => {});
  }
  if (unhashedBuyerCreated) await prisma.wholesaleBuyer.deleteMany({ where: { id: unhashedBuyerId } }).catch(() => {});
  await prisma.auditLog.deleteMany({ where: { actorId } }).catch(() => {});
  await prisma.$disconnect();
}
