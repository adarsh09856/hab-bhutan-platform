import assert from 'node:assert/strict';
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';

nextEnv.loadEnvConfig(process.cwd(), true);
const baseUrl = process.env.HAB_TEST_BASE_URL || 'http://127.0.0.1:3035';
if (!['127.0.0.1', 'localhost', '::1'].includes(new URL(baseUrl).hostname)) {
  throw new Error('This regression may only call a local loopback app.');
}

const prisma = new PrismaClient();
const suffix = randomUUID();
const email = `codex-membership-${suffix}@example.invalid`;
let createdId = null;

async function submit(payload) {
  const response = await fetch(`${baseUrl}/api/applications`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

const baseApplication = {
  fullName: 'Local application verification only',
  email,
  phone: '+97517000000',
  cidOrReg: '12345678901',
  craftKey: 'thagzo',
  dzongkhag: 'Thimphu',
  village: 'Local test',
  planTier: 'ACTIVE_SECTOR_MEMBER',
};

try {
  const unsupportedCard = await submit({ ...baseApplication, paymentMethod: 'CARD' });
  assert.equal(unsupportedCard.response.status, 503, 'unconfigured card checkout must not claim a successful application');
  const cardRows = await prisma.membershipApplication.findMany({ where: { email } });
  assert.equal(cardRows.length, 0, 'failed card checkout must not create an application record');

  const missingProof = await submit({ ...baseApplication, paymentMethod: 'MBOB', paymentRef: 'LOCAL-TEST' });
  assert.equal(missingProof.response.status, 400, 'offline payment requires both reference and proof');

  const saved = await submit({
    ...baseApplication,
    paymentMethod: 'MBOB',
    paymentRef: `LOCAL-${suffix}`,
    mobilePhone: '+97517000000',
    proofUrl: '/uploads/local-verification-proof.pdf',
  });
  assert.equal(saved.response.status, 200, `valid local payment-evidence form failed: ${saved.body.error || saved.response.status}`);
  assert.equal(saved.body.success, true);
  createdId = saved.body.applicationId;
  const row = await prisma.membershipApplication.findUnique({ where: { id: createdId } });
  assert.ok(row, 'success response must correspond to a database record');
  assert.equal(row.email, email);
  assert.equal(row.paymentMethod, 'MBOB');
  assert.equal(row.uploadedDocUrl, '/uploads/local-verification-proof.pdf');
  assert.match(row.reviewerNotes || '', /Payment: MBOB/);

  const unknownCraft = await submit({ ...baseApplication, email: `codex-invalid-${suffix}@example.invalid`, craftKey: 'not-a-hab-craft', paymentMethod: 'MBOB', paymentRef: 'LOCAL-TEST', proofUrl: '/uploads/local-verification-proof.pdf' });
  assert.equal(unknownCraft.response.status, 400, 'unknown craft keys must not enter the application queue');
  console.log('PASS: unconfigured card attempt and missing transfer proof were rejected; valid mBoB evidence created a verifiable local database application; invalid craft category was rejected. No payment was processed.');
} finally {
  if (createdId) {
    await prisma.auditLog.deleteMany({ where: { entityId: createdId } }).catch(() => {});
    await prisma.membershipApplication.deleteMany({ where: { id: createdId } }).catch(() => {});
  }
  await prisma.$disconnect();
}
