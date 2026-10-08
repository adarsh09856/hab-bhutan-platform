import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd(), true);
const baseUrl = process.env.APPLICATION_PAYMENT_TEST_URL || 'http://127.0.0.1:3033';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function post(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`);
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function run() {
  assert(['localhost', '127.0.0.1', '::1'].includes(new URL(baseUrl).hostname), 'Safety stop: test requires a localhost app.');

  const privateMembershipLedger = await get('/api/admin/membership-settings');
  assert(privateMembershipLedger.status === 401, 'Anonymous user must not read the admin membership ledger.');
  const publicMembershipDues = await get('/api/membership-settings');
  assert(publicMembershipDues.status === 200 && publicMembershipDues.body.success, 'Public application form should be able to load membership dues.');
  assert(!('accountNumber' in (publicMembershipDues.body.setting || {})) && !('mbobQrUrl' in (publicMembershipDues.body.setting || {})), 'Public dues endpoint should not expose the stale duplicate bank configuration.');

  const memberCard = await post('/api/applications', { categoryKey: 'individual-artisan', paymentMethod: 'card' });
  assert(memberCard.status === 503 && /not configured/i.test(memberCard.body.error || ''), 'Membership card payment should be rejected clearly while no card checkout is configured.');
  const memberMissingProof = await post('/api/applications', { categoryKey: 'individual-artisan', paymentMethod: 'mbob' });
  assert(memberMissingProof.status === 400 && /reference and deposit proof/i.test(memberMissingProof.body.error || ''), 'Membership mBoB submission without reference/proof should be rejected.');

  const wholesaleCard = await post('/api/wholesale/register', { businessName: 'Local test only', contactPerson: 'Local test only', email: 'gateway-test@example.invalid', paymentMethod: 'card' });
  assert(wholesaleCard.status === 503 && /not configured/i.test(wholesaleCard.body.error || ''), 'Wholesale card payment should be rejected clearly while no card checkout is configured.');
  const wholesaleMissingProof = await post('/api/wholesale/register', { businessName: 'Local test only', contactPerson: 'Local test only', email: 'gateway-test@example.invalid', paymentMethod: 'bank' });
  assert(wholesaleMissingProof.status === 400 && /reference and deposit proof/i.test(wholesaleMissingProof.body.error || ''), 'Wholesale bank submission without reference/proof should be rejected.');

  console.log('PASS: membership/wholesale card requests are rejected without a configured application checkout; unpaid bank/mBoB requests without a reference and proof are rejected before any record is created.');
}

run().catch((error) => {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
});
