import assert from 'node:assert/strict';
import { normalizeProductImages } from '../src/lib/product-image-fallbacks.ts';
import { isPublicCatalogProduct } from '../src/lib/public-catalog-visibility.ts';

const brokenHhb10 = normalizeProductImages('HHB10', 'thagzo', [
  { url: '/placeholders/hhb10_1.jpg', role: 'primary' },
  { url: '/placeholders/hhb10_2.jpg', role: 'angle2' },
]);
assert.equal(brokenHhb10.imageUrl, '/assets/photos/product-hhb10.jpg');
assert.deepEqual(brokenHhb10.images, [{ url: '/assets/photos/product-hhb10.jpg', role: 'primary' }]);

const uploaded = normalizeProductImages('CUSTOM-01', 'lhazo', [
  { url: '/uploads/custom-primary.jpg', role: 'primary', focalPoint: 'center' },
  { url: '/uploads/custom-side.jpg', role: 'angle2' },
  { url: '/placeholders/legacy.jpg', role: 'angle3' },
]);
assert.equal(uploaded.imageUrl, '/uploads/custom-primary.jpg');
assert.equal(uploaded.images.length, 2);
assert.equal(uploaded.images[0].focalPoint, 'center');
assert.ok(uploaded.images.every((image) => !image.url.toLowerCase().includes('placeholder')));

const missingImage = normalizeProductImages('UNKNOWN-01', 'thagzo', []);
assert.equal(missingImage.imageUrl, '/assets/photos/image-unavailable.svg');

const relatedWithLegacyPlaceholders = ['HHB01', 'SAD03', 'KIS02'].map((code) => ({
  code,
  ...normalizeProductImages(code, 'thagzo', [{ url: `/placeholders/${code.toLowerCase()}_1.jpg`, role: 'primary' }]),
}));
assert.deepEqual(relatedWithLegacyPlaceholders.map((item) => item.imageUrl), [
  '/assets/photos/product-hhb01.jpg',
  '/assets/photos/product-sad03.jpg',
  '/images/crafts/thagzo.jpg',
]);

assert.equal(normalizeProductImages('LHA01', 'lhazo', [
  { url: '/assets/photos/product-sad03.jpg', role: 'primary' },
]).imageUrl, '/assets/photos/product-lha01.jpg');
assert.equal(normalizeProductImages('KIS02', 'thagzo', [
  { url: '/assets/photos/product-cam01.jpg', role: 'primary' },
]).imageUrl, '/images/crafts/thagzo.jpg');
assert.equal(normalizeProductImages('KIS02', 'thagzo', [
  { url: '/assets/photos/product-kis02.jpg', role: 'primary' },
]).imageUrl, '/images/crafts/thagzo.jpg');
assert.equal(normalizeProductImages('KIS02', 'thagzo', [
  { url: '/assets/photos/product-kis02.jpg', role: 'primary' },
  { url: '/uploads/verified-kisuthara-photo.jpg', role: 'gallery' },
]).imageUrl, '/uploads/verified-kisuthara-photo.jpg');
assert.equal(normalizeProductImages('PAR06', 'parzo', [
  { url: '/assets/photos/product-cam01.jpg', role: 'primary' },
  { url: '/uploads/member-photo.jpg', role: 'angle2' },
]).images.some((image) => image.url === '/uploads/member-photo.jpg'), true);

assert.equal(isPublicCatalogProduct({ code: 'HHB10', name: 'Handheld Bag', status: 'PUBLISHED' }), true);
assert.equal(isPublicCatalogProduct({ code: 'SKU-TEST-44899', name: 'Automated Test Kishuthara Textile', status: 'PUBLISHED' }), false);
assert.equal(isPublicCatalogProduct({ code: 'HHB10', name: 'Handheld Bag', status: 'DRAFT' }), false);

console.log('PASS: mismatched Kisuthara photo is suppressed, craft illustration and genuine uploads work, and test/draft catalogue records stay out of public responses.');
