import assert from 'node:assert/strict';
import { normalizeProductImages } from '../src/lib/product-image-fallbacks.ts';
import { isPublicCatalogProduct } from '../src/lib/public-catalog-visibility.ts';
import { toPublicMemberProfile } from '../src/lib/public-member-profile.ts';

const mismatchedHhb10 = normalizeProductImages('HHB10', 'thagzo', [
  { url: '/placeholders/hhb10_1.jpg', role: 'primary' },
  { url: '/placeholders/hhb10_2.jpg', role: 'angle2' },
]);
assert.equal(mismatchedHhb10.imageUrl, '/assets/photos/image-unavailable.svg');
assert.deepEqual(mismatchedHhb10.images, [{ url: '/assets/photos/image-unavailable.svg', role: 'primary' }]);

const uploaded = normalizeProductImages('CUSTOM-01', 'lhazo', [
  { url: '/uploads/custom-primary.jpg', role: 'primary', focalPoint: 'center' },
  { url: '/uploads/custom-side.jpg', role: 'angle2' },
  { url: '/placeholders/legacy.jpg', role: 'angle3' },
]);
assert.equal(uploaded.imageUrl, '/uploads/custom-primary.jpg');
assert.equal(uploaded.images.length, 2);
assert.equal(uploaded.images[0].focalPoint, 'center');
assert.ok(uploaded.images.every((image) => !image.url.toLowerCase().includes('placeholder')));

const bundledCustom = normalizeProductImages('CUSTOM-02', 'lhazo', [
  { url: '/assets/photos/product-custom-02.jpg', role: 'primary' },
]);
assert.equal(bundledCustom.imageUrl, '/assets/photos/product-custom-02.jpg');
assert.equal(normalizeProductImages('CUSTOM-02', 'lhazo', [
  { url: '/assets/photos/product-cam01.jpg', role: 'primary' },
]).imageUrl, '/assets/photos/image-unavailable.svg');

const missingImage = normalizeProductImages('UNKNOWN-01', 'thagzo', []);
assert.equal(missingImage.imageUrl, '/assets/photos/image-unavailable.svg');

const relatedWithLegacyPlaceholders = ['HHB01', 'SAD03', 'KIS02'].map((code) => ({
  code,
  ...normalizeProductImages(code, 'thagzo', [{ url: `/placeholders/${code.toLowerCase()}_1.jpg`, role: 'primary' }]),
}));
assert.deepEqual(relatedWithLegacyPlaceholders.map((item) => item.imageUrl), [
  '/assets/photos/product-hhb01.jpg',
  '/assets/photos/product-sad03.jpg',
  '/assets/photos/image-unavailable.svg',
]);

assert.equal(normalizeProductImages('LHA01', 'lhazo', [
  { url: '/assets/photos/product-sad03.jpg', role: 'primary' },
]).imageUrl, '/assets/photos/image-unavailable.svg');
assert.equal(normalizeProductImages('KIS02', 'thagzo', [
  { url: '/assets/photos/product-cam01.jpg', role: 'primary' },
]).imageUrl, '/assets/photos/image-unavailable.svg');
assert.equal(normalizeProductImages('KIS02', 'thagzo', [
  { url: '/assets/photos/product-kis02.jpg', role: 'primary' },
]).imageUrl, '/assets/photos/image-unavailable.svg');
assert.equal(normalizeProductImages('KIS02', 'thagzo', [
  { url: '/assets/photos/product-kis02.jpg', role: 'primary' },
  { url: '/uploads/verified-kisuthara-photo.jpg', role: 'gallery' },
]).imageUrl, '/uploads/verified-kisuthara-photo.jpg');
assert.equal(normalizeProductImages('PAR06', 'parzo', [
  { url: '/assets/photos/product-cam01.jpg', role: 'primary' },
  { url: '/uploads/member-photo.jpg', role: 'angle2' },
]).images.some((image) => image.url === '/uploads/member-photo.jpg'), true);

for (const [code, wrongPath] of [
  ['CUS02', '/assets/photos/product-cus02.jpg'],
  ['DAP02', '/assets/photos/product-dap02.jpg'],
  ['DEZ01', '/assets/photos/product-dez01.jpg'],
  ['DEZ07', '/assets/photos/product-dez07.jpg'],
  ['LHA01', '/assets/photos/product-lha01.jpg'],
  ['LHA08', '/assets/photos/product-lha08.jpg'],
  ['LUD01', '/assets/photos/product-lud01.jpg'],
  ['PAR06', '/assets/photos/product-par06.jpg'],
  ['PHO03', '/assets/photos/product-pho03.jpg'],
  ['TRO04', '/assets/photos/product-tro04.jpg'],
  ['TRO09', '/assets/photos/product-tro09.jpg'],
  ['TSH11', '/assets/photos/product-tsh11.jpg'],
]) {
  assert.equal(
    normalizeProductImages(code, '', [{ url: wrongPath, role: 'primary' }]).imageUrl,
    '/assets/photos/image-unavailable.svg',
    `${code} must not use its visually mismatched bundled photo`,
  );
}

for (const [code, expectedPath] of [
  ['CAM01', '/assets/photos/product-cam01.jpg'],
  ['FTB04', '/assets/photos/product-ftb04.jpg'],
  ['GAKI', '/assets/photos/product-gaki.jpg'],
  ['HHB01', '/assets/photos/product-hhb01.jpg'],
  ['MAS01', '/assets/photos/product-mas01.jpg'],
  ['SAD03', '/assets/photos/product-sad03.jpg'],
]) {
  assert.equal(
    normalizeProductImages(code, '', [{ url: '/placeholders/old.jpg', role: 'primary' }]).imageUrl,
    expectedPath,
    `${code} keeps its visually matched bundled image`,
  );
}

assert.equal(
  normalizeProductImages('PHO03', 'shagzo', [{ url: '/uploads/verified-phob-photo.jpg', role: 'primary' }]).imageUrl,
  '/uploads/verified-phob-photo.jpg',
  'a real uploaded product photo remains eligible even for a SKU with a bad bundled image',
);

assert.equal(isPublicCatalogProduct({ code: 'HHB10', name: 'Handheld Bag', status: 'PUBLISHED' }), true);
assert.equal(isPublicCatalogProduct({ code: 'SKU-TEST-44899', name: 'Automated Test Kishuthara Textile', status: 'PUBLISHED' }), false);
assert.equal(isPublicCatalogProduct({ code: 'HHB10', name: 'Handheld Bag', status: 'DRAFT' }), false);

const memberProfile = toPublicMemberProfile({
  name: 'Verified Maker',
  products: [
    { code: 'HHB10', craftKey: 'thagzo', images: [
      { url: '/placeholders/hhb10_1.jpg', role: 'primary' },
      { url: '/placeholders/hhb10_2.jpg', role: 'gallery' },
    ] },
    { code: 'NO-PHOTO', craftKey: 'thagzo', images: [] },
  ],
});
assert.deepEqual(memberProfile.products[0].images, [{ url: '/assets/photos/image-unavailable.svg', role: 'primary' }]);
assert.deepEqual(memberProfile.products[1].images, [], 'A member product with no saved photo stays blank.');

console.log('PASS: product and member-profile image fallbacks, genuine uploads, and public catalogue visibility.');
