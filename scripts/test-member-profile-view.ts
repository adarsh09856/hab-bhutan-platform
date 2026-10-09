import assert from 'node:assert/strict';
import { toMemberProfileView, toMemberProductViews } from '../src/lib/member-profile-view';

assert.deepEqual(toMemberProfileView({ name: 'Verified Artisan', craftKey: 'thagzo' }), {
  name: 'Verified Artisan', craft_key: 'thagzo', dzongkhag: '', member_since: null, blurb: '', portraitUrl: '',
}, 'Missing member details stay empty instead of receiving a sample portrait, bio, or year.');

assert.deepEqual(toMemberProductViews([
  { id: 'private-id', code: 'A', name: 'Maker product', craftKey: 'thagzo', priceUSD: 12, region: '', images: [] },
], { name: 'Verified Artisan', dzongkhag: 'Bumthang' }), [{
  code: 'A', name: 'Maker product', craft_key: 'thagzo', region: 'Bumthang',
  maker: 'Verified Artisan', price_usd: 12, image_path: '',
}], 'Profile cards use only this member’s linked products and do not invent product imagery.');

console.log('Member detail mapping passed: no fabricated profile fields; linked products only.');
