import assert from 'node:assert/strict';
import { removeRepeatedLead } from '../src/lib/display-copy';

assert.equal(
  removeRepeatedLead('Every ngultrum stays in the sector.', 'Every ngultrum stays in the sector. Your gift funds fair-price advocacy.'),
  'Your gift funds fair-price advocacy.',
);
assert.equal(removeRepeatedLead('Distinct short tagline', 'A different full explanation.'), 'A different full explanation.');
assert.equal(removeRepeatedLead('', 'Keep the body copy.'), 'Keep the body copy.');
assert.equal(removeRepeatedLead('Shared phrase', 'shared phrase — with extra context.'), 'with extra context.');

console.log('Public card copy cleanup checks passed (duplicate lead removed; distinct copy preserved).');
