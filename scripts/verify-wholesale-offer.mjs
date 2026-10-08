import assert from 'node:assert/strict';
import { resolveWholesaleOffer } from '../src/lib/wholesale-offer.ts';

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

console.log('Wholesale pricing eligibility checks passed.');
