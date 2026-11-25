import assert from 'node:assert/strict';
import { bhutanDateKey, bhutanDayStartUtc, traderIsExpired } from '../src/lib/trader-expiry';

const beforeBhutanMidnight = new Date('2026-11-24T18:30:00.000Z');
const expiryStoredAsUtcMidnight = '2026-11-25T00:00:00.000Z';

assert.equal(bhutanDateKey(beforeBhutanMidnight), '2026-11-25');
assert.equal(bhutanDayStartUtc(beforeBhutanMidnight).toISOString(), '2026-11-24T18:00:00.000Z');
assert.equal(traderIsExpired(expiryStoredAsUtcMidnight, beforeBhutanMidnight), false);

const nextBhutanDay = new Date('2026-11-25T18:00:00.000Z');
assert.equal(bhutanDateKey(nextBhutanDay), '2026-11-26');
assert.equal(traderIsExpired(expiryStoredAsUtcMidnight, nextBhutanDay), true);
assert.equal(traderIsExpired('2026-11-25', beforeBhutanMidnight), false);

console.log('Trader expiry Bhutan-day boundary: 6 assertions passed.');
