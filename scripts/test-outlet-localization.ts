import assert from 'node:assert/strict';
import { resolveOutletText } from '../src/lib/outlet-localization';

const outlet = {
  key: 'local-test-market', type: 'MARKET', name: 'English market', name_dz: 'ཚོང་ཁྲོམ',
  place: 'Punakha', place_dz: 'སྤུ་ན་ཁ', note: 'English visitor note', note_dz: null,
  description: 'English description', description_dz: 'འགྲེལ་བཤད',
  hours: '09:00–17:00', hours_dz: '', stalls: '32 stalls', stalls_dz: null,
  crafts_on_site: 'Weaving', crafts_on_site_dz: 'བཀྲག་འཐག', payment: 'Cash', payment_dz: null,
  getting_there: '', facilities: '', long_description: '', imageUrl: '/assets/photos/market.jpg',
};

assert.equal(resolveOutletText(outlet, 'dz', 'name'), 'ཚོང་ཁྲོམ', 'use saved directory-shaped Dzongkha field');
assert.equal(resolveOutletText(outlet, 'dz', 'description'), 'འགྲེལ་བཤད');
assert.equal(resolveOutletText(outlet, 'dz', 'note'), 'English visitor note', 'fall back when translation is null');
assert.equal(resolveOutletText(outlet, 'dz', 'hours'), '09:00–17:00', 'fall back when translation is blank');
assert.equal(resolveOutletText(outlet, 'en', 'place'), 'Punakha', 'English selection remains unchanged');
console.log('PASS: outlet directory translations use the actual server-provided field names and fall back safely.');
