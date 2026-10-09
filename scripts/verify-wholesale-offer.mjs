import assert from 'node:assert/strict';
import { resolveWholesaleOffer } from '../src/lib/wholesale-offer.ts';
import { getWholesaleJwtSecret } from '../src/lib/wholesale-auth-secret.ts';
import { normalizeWholesaleTiers } from '../src/lib/wholesale-terms-normalize.ts';

const configuredLegacy = {
  moq: 10,
  lead: '3–4 weeks',
  tiers: [[10, 24], [50, 20]],
  custom: 'Gift packaging available',
};

assert.deepEqual(resolveWholesaleOffer(null, configuredLegacy), {
  moq: 10,
  lead_time: '3–4 weeks',
  tiers: [[10, 24], [50, 20]],
  customisation: 'Gift packaging available',
  is_active: true,
});
assert.equal(resolveWholesaleOffer(null, undefined), null, 'A new product with no configured terms must not receive guessed B2B prices.');
assert.equal(resolveWholesaleOffer({ moq: 5, tiers: [[5, 10]], isActive: false }, null), null, 'Disabled saved terms must not be offered.');
assert.equal(resolveWholesaleOffer({ moq: 5, tiers: [], isActive: true }, null), null, 'Empty saved tiers must not be offered.');
assert.equal(resolveWholesaleOffer(null, { moq: 5, tiers: [[5, 10], [5, 9]] }), null, 'Duplicate quantity breaks must be rejected.');
assert.equal(resolveWholesaleOffer({ moq: 5, tiers: [[5, 0]], isActive: true }, null)?.tiers[0][1], 0, 'A valid explicitly configured zero price is not silently rewritten.');
assert.deepEqual(normalizeWholesaleTiers([{ quantity: 5, price: 12 }, { minQty: '20', unitPrice: '9.5' }]), [[5, 12], [20, 9.5]], 'Named historical tier fields must normalize for Admin and public use.');
assert.deepEqual(resolveWholesaleOffer({ moq: 5, tiers: [{ quantity: 5, price: 12 }], isActive: true }, null)?.tiers, [[5, 12]], 'A saved object-shaped tier must remain visible and eligible.');
assert.equal(resolveWholesaleOffer({ moq: 5, tiers: [{ quantity: '', price: '' }], isActive: true }, null), null, 'Blank object-shaped tiers must not become free offers.');

const originalSecret = process.env.JWT_SECRET;
try {
  delete process.env.JWT_SECRET;
  assert.throws(() => getWholesaleJwtSecret(), /not configured securely/);
  process.env.JWT_SECRET = 'short-secret';
  assert.throws(() => getWholesaleJwtSecret(), /not configured securely/);
  process.env.JWT_SECRET = 'local-verification-secret-with-at-least-32-characters';
  assert.ok(getWholesaleJwtSecret().length >= 32);
} finally {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
}

console.log('Wholesale pricing eligibility and JWT secret checks passed.');
