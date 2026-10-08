import assert from 'node:assert/strict';
import { normalizeProductImages } from '../src/lib/product-image-fallbacks.ts';

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
assert.equal(missingImage.imageUrl, '/assets/photos/product-sad03.jpg');

const relatedWithLegacyPlaceholders = ['HHB01', 'SAD03', 'KIS02'].map((code) => ({
  code,
  ...normalizeProductImages(code, 'thagzo', [{ url: `/placeholders/${code.toLowerCase()}_1.jpg`, role: 'primary' }]),
}));
assert.deepEqual(relatedWithLegacyPlaceholders.map((item) => item.imageUrl), [
  '/assets/photos/product-hhb01.jpg',
  '/assets/photos/product-sad03.jpg',
  '/assets/photos/product-sad03.jpg',
]);

console.log('PASS: placeholder variants resolve to stable product/craft photos; uploaded images and metadata are preserved; unknown and related products receive deterministic fallbacks.');
