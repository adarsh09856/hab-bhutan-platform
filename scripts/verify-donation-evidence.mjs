import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { unlink } from 'fs/promises';
import path from 'path';

nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();
const host = process.env.DONATION_TEST_URL || 'http://127.0.0.1:3033';
const databaseUrl = process.env.DATABASE_URL || '';
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) throw new Error('Safety stop: this verification only permits localhost.');
if (!/localhost|127\.0\.0\.1/.test(databaseUrl)) throw new Error('Safety stop: this verification only permits a loopback database.');
let donationId;
let uploadedPath;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function postDonation(body) {
  const response = await fetch(`${host}/api/donations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

try {
  const health = await fetch(`${host}/api/admin/health`, { cache: 'no-store' });
  assert(health.ok, `Local app health returned ${health.status}.`);
  const pillar = await prisma.supportPillar.findFirst({ select: { key: true, raisedAmountUSD: true } });
  assert(pillar, 'Local database has no support pillar to use for the isolated test.');

  const base = {
    pillarKey: pillar.key,
    donorName: 'Temporary Donation Verification',
    donorEmail: `donation-check-${Date.now()}@example.invalid`,
    amountUSD: 1,
    amountBTN: 84,
    currency: 'BTN',
    frequency: 'ONE_TIME',
  };
  const card = await postDonation({ ...base, paymentMethod: 'CARD' });
  assert(card.response.status === 503 && card.body.success === false, 'Unconfigured card donations were not explicitly rejected.');

  const noRef = await postDonation({ ...base, paymentMethod: 'MBOB', proofUrl: '/uploads/hab-nonexistent.pdf' });
  assert(noRef.response.status === 400, 'Missing transfer reference was not rejected.');
  const missingProof = await postDonation({ ...base, paymentMethod: 'MBOB', journalRef: 'LOCAL-TEST-REFERENCE' });
  assert(missingProof.response.status === 400, 'Missing proof was not rejected.');

  const upload = new FormData();
  upload.append('file', new Blob(['%PDF-1.4\nLocal test payment evidence\n%%EOF'], { type: 'application/pdf' }), 'temporary-proof.pdf');
  const uploaded = await fetch(`${host}/api/upload`, { method: 'POST', body: upload });
  const uploadedBody = await uploaded.json().catch(() => ({}));
  assert(uploaded.ok && uploadedBody.success && /^\/uploads\/hab-[a-z0-9-]+\.pdf$/i.test(uploadedBody.url), `Temporary proof upload failed: ${uploadedBody.error || uploaded.status}.`);
  uploadedPath = uploadedBody.url;

  const saved = await postDonation({ ...base, paymentMethod: 'MBOB', journalRef: 'LOCAL-TEST-REFERENCE', proofUrl: uploadedPath });
  assert(saved.response.ok && saved.body.success, `Pending evidence submit failed: ${saved.body.error || saved.response.status}.`);
  donationId = saved.body.donation?.id;
  assert(donationId && saved.body.donation.status === 'PENDING', 'Donation was not saved in PENDING status.');
  assert(saved.body.message?.includes('reviewing the payment proof'), 'Response does not explain that HAB must review the evidence.');

  const persisted = await prisma.donationRecord.findUnique({ where: { id: donationId } });
  assert(persisted?.status === 'PENDING' && persisted?.journalRef === 'LOCAL-TEST-REFERENCE' && persisted?.proofUrl === uploadedPath, 'Database did not retain pending status and submitted evidence.');
  const pillarAfter = await prisma.supportPillar.findUnique({ where: { key: pillar.key }, select: { raisedAmountUSD: true } });
  assert(pillarAfter.raisedAmountUSD === pillar.raisedAmountUSD, 'Pending donation incorrectly increased the raised total.');
  console.log('PASS: online card is rejected; missing transaction reference/proof are rejected; real uploaded evidence persists as PENDING; pending submission does not inflate raised totals.');
} catch (error) {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
} finally {
  if (donationId) {
    await prisma.auditLog.deleteMany({ where: { entityType: 'DonationRecord', entityId: donationId } }).catch(() => {});
    await prisma.donationRecord.deleteMany({ where: { id: donationId } }).catch(() => {});
  }
  if (uploadedPath && /^\/uploads\/hab-[a-z0-9-]+\.pdf$/i.test(uploadedPath)) {
    await unlink(path.join(process.cwd(), 'public', uploadedPath.slice(1))).catch(() => {});
  }
  await prisma.$disconnect();
}
