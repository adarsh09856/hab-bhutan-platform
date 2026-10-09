import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd(), true);
const baseUrl = process.env.APPLICATION_PAYMENT_TEST_URL || 'http://127.0.0.1:3033';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function post(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bypass-rate-limit': 'true' },
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

  const cardOrder = await post('/api/orders', {
    items: [{ code: 'UNCONFIGURED-CARD-GUARD', name: 'Guard test only', quantity: 1, priceUsd: 1 }],
    currency: 'USD', paymentMethod: 'CARD', customerName: 'Guard test only',
    email: 'unconfigured-card@example.invalid',
    shippingAddress: { fullName: 'Guard test only', email: 'unconfigured-card@example.invalid', street: 'Local test only', city: 'Thimphu', country: 'Bhutan' },
  });
  assert(cardOrder.status === 503 && /secure card processor is not configured/i.test(cardOrder.body.error || ''), 'Card order must be rejected until a real server-side payment processor is configured.');

  console.log('PASS: card checkout and membership/wholesale card applications are rejected without a configured payment processor; unpaid bank/mBoB submissions without proof are rejected before records are created.');
}

run().catch((error) => {
  console.error(`FAIL: ${error?.message || error}`);
  process.exitCode = 1;
});
