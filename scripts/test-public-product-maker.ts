import assert from 'node:assert/strict';
import { PUBLIC_PRODUCT_CARD_MAKER_SELECT, PUBLIC_PRODUCT_MAKER_SELECT, toPublicProductMaker } from '../src/lib/public-product-maker';
import { PUBLIC_MEMBER_PROFILE_SELECT, toPublicMemberProfile } from '../src/lib/public-member-profile';

const maker = toPublicProductMaker({
  id: 'private-id',
  name: 'Local Artisan',
  bio: 'Weaves traditional cloth.',
  joinYear: 2019,
  portraitUrl: '/uploads/artisan.jpg',
  dzongkhag: 'Bumthang',
  cidNumber: 'PRIVATE-CID',
  businessLicense: 'PRIVATE-LICENSE',
  phone: '+975-private',
  email: 'private@example.invalid',
  duesExpiryDate: new Date('2030-01-01'),
  userId: 'private-user',
  craft: { key: 'thagzo', name: 'Thagzo', english: 'Weaving', createdAt: new Date() },
});

assert.deepEqual(maker, {
  name: 'Local Artisan',
  bio: 'Weaves traditional cloth.',
  joinYear: 2019,
  portraitUrl: '/uploads/artisan.jpg',
  dzongkhag: 'Bumthang',
  craft: { key: 'thagzo', name: 'Thagzo', english: 'Weaving' },
});
assert.deepEqual(Object.keys(PUBLIC_PRODUCT_MAKER_SELECT).sort(), ['bio', 'craft', 'dzongkhag', 'joinYear', 'name', 'portraitUrl'].sort());
assert.deepEqual(Object.keys(PUBLIC_PRODUCT_CARD_MAKER_SELECT).sort(), ['dzongkhag', 'name']);
assert.equal(toPublicProductMaker(null), null);

const publicMember = toPublicMemberProfile({
  name: 'Local Artisan', craftKey: 'thagzo', dzongkhag: 'Bumthang', joinYear: 2019,
  regNumber: 'HAB-M-01', tier: 'ACTIVE_SECTOR_MEMBER', bio: 'Weaves cloth.', portraitUrl: '/uploads/member.jpg',
  cidNumber: 'PRIVATE-CID', businessLicense: 'PRIVATE-LICENSE', phone: '+975-private', email: 'private@example.invalid',
  duesExpiryDate: new Date('2030-01-01'), userId: 'private-user', createdAt: new Date(),
  craft: { key: 'thagzo', name: 'Thagzo', english: 'Weaving', description: 'Private extra field' },
  products: [{ id: 'private-product-id', code: 'THA01', name: 'Woven item', priceUSD: 20, images: [], stock: 1, craftKey: 'thagzo', region: 'Bumthang', status: 'PUBLISHED' }],
});
assert.deepEqual(publicMember, {
  name: 'Local Artisan', craftKey: 'thagzo', dzongkhag: 'Bumthang', joinYear: 2019,
  regNumber: 'HAB-M-01', tier: 'ACTIVE_SECTOR_MEMBER', bio: 'Weaves cloth.', portraitUrl: '/uploads/member.jpg',
  craft: { key: 'thagzo', name: 'Thagzo', english: 'Weaving' },
  products: [{ code: 'THA01', name: 'Woven item', priceUSD: 20, images: [], stock: 1, craftKey: 'thagzo', region: 'Bumthang' }],
});
assert.equal(toPublicMemberProfile(null), null);
assert.deepEqual(Object.keys(PUBLIC_MEMBER_PROFILE_SELECT).sort(), ['bio', 'craft', 'craftKey', 'dzongkhag', 'joinYear', 'name', 'portraitUrl', 'products', 'regNumber', 'tier'].sort());
console.log('Public product maker privacy check passed: only public profile fields are selected and returned.');
