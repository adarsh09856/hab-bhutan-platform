import assert from 'node:assert/strict';
import { normalizeQuickEditImageSource } from '../src/lib/quick-edit-image';

const localBase = 'http://127.0.0.1:3036/projects';
assert.equal(
  normalizeQuickEditImageSource('http://127.0.0.1:3036/uploads/project-cover.jpg?width=900#photo', localBase),
  '/uploads/project-cover.jpg?width=900#photo',
  'same-origin image overrides must not persist the local hostname',
);
assert.equal(
  normalizeQuickEditImageSource('/assets/photos/hero-1-weaving.jpg', localBase),
  '/assets/photos/hero-1-weaving.jpg',
  'already-relative image paths must remain unchanged',
);
assert.equal(
  normalizeQuickEditImageSource('https://cdn.example.org/crafts/verified.jpg', localBase),
  'https://cdn.example.org/crafts/verified.jpg',
  'external HTTPS image sources must remain intact',
);

console.log('PASS: Quick Edit image URLs remain portable across local, staging, and production hosts.');
