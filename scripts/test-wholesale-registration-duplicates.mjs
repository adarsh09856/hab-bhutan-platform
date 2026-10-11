import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { validateTestDatabaseUrl } from './lib/safe-test-database.mjs';

nextEnv.loadEnvConfig(process.cwd(), true);
const testDatabaseUrl = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const prisma = new PrismaClient({ datasources: { db: { url: testDatabaseUrl } } });
const baseUrl = process.env.WHOLESALE_REGISTRATION_TEST_URL || 'http://127.0.0.1:3033';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const email = `wholesale-duplicate-${suffix}@example.invalid`;
let createdBuyerId;
let proofUrl;
let uploadedProofPath;
const fallbackPath = path.join(process.cwd(), '.data', 'wholesale-buyers.json');

function readFallback() {
  try {
    const data = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function submit(businessName) {
  const response = await fetch(`${baseUrl}/api/wholesale/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessName, contactPerson: 'Temporary Local Test', email, paymentMethod: 'mbob', paymentRef: 'LOCAL-TEST-ONLY', proofUrl }),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

async function run() {
  assert(['localhost', '127.0.0.1', '::1'].includes(new URL(baseUrl).hostname), 'Safety stop: test requires a localhost app.');
  assert(!readFallback().some((buyer) => buyer.email.toLowerCase() === email), 'Safety stop: generated test email already exists in fallback data.');

  try {
    proofUrl = 'https://example.invalid/fake.pdf';
    const externalProof = await submit(`Temporary Test Company ${suffix}`);
    assert(externalProof.response.status === 400, 'An arbitrary URL cannot stand in for an uploaded wholesale proof.');
    const form = new FormData();
    form.append('file', new Blob(['%PDF-1.4\nTemporary local wholesale proof\n'], { type: 'application/pdf' }), 'local-proof.pdf');
    const proofResponse = await fetch(`${baseUrl}/api/upload`, { method: 'POST', body: form });
    const proofBody = await proofResponse.json();
    assert(proofResponse.status === 200 && /^\/api\/payment-proofs\/[a-f0-9-]{36}\.pdf$/.test(proofBody.url || ''), 'Disposable proof upload failed.');
    proofUrl = proofBody.url;
    uploadedProofPath = path.join(process.cwd(), '.data', 'private-uploads', 'payment-proofs', path.basename(proofUrl));
    const created = await submit(`Temporary Test Company ${suffix}`);
    assert(created.response.status === 200 && created.body.success, `Local wholesale registration failed: ${created.body.error || created.response.status}.`);
    createdBuyerId = created.body.buyerId;

    const beforeDb = await prisma.wholesaleBuyer.findUnique({ where: { email } });
    const beforeFallback = readFallback().find((buyer) => buyer.email.toLowerCase() === email);
    assert(beforeDb || beforeFallback, 'First test submission was not stored in either local store.');

    const duplicate = await submit('ATTEMPTED UNAUTHORIZED COMPANY CHANGE');
    assert(duplicate.response.status === 409 && duplicate.body.success === false, `Duplicate submission should return 409, got ${duplicate.response.status}.`);
    const afterDb = await prisma.wholesaleBuyer.findUnique({ where: { email } });
    const afterFallback = readFallback().find((buyer) => buyer.email.toLowerCase() === email);
    assert(!beforeDb || afterDb?.companyName === beforeDb.companyName, 'Duplicate submission changed the database company name.');
    assert(!beforeFallback || afterFallback?.companyName === beforeFallback.companyName, 'Duplicate submission changed the fallback company name.');
    assert(afterFallback?.companyName !== 'ATTEMPTED UNAUTHORIZED COMPANY CHANGE', 'Duplicate submission replaced the fallback record.');

    console.log('PASS: first localhost registration succeeded; duplicate email returned 409 and did not change the database or fallback record.');
  } finally {
    await prisma.auditLog.deleteMany({ where: { actorIdentifier: email } }).catch(() => {});
    await prisma.wholesaleBuyer.deleteMany({ where: { email } }).catch(() => {});
    const fallback = readFallback();
    const filtered = fallback.filter((buyer) => buyer.email.toLowerCase() !== email);
    if (filtered.length !== fallback.length) fs.writeFileSync(fallbackPath, JSON.stringify(filtered, null, 2), 'utf8');
    if (uploadedProofPath) fs.unlinkSync(uploadedProofPath);
    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
});
