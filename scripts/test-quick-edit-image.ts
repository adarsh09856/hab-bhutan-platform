import assert from 'node:assert/strict';
import { applyQuickEditImage } from '../src/lib/quick-edit-image';

const attributes = new Map([['src', '/old.jpg'], ['srcset', '/old-large.jpg 2x'], ['sizes', '100vw']]);
const image = {
  getAttribute: (name: string) => attributes.get(name) ?? null,
  setAttribute: (name: string, value: string) => { attributes.set(name, value); },
  removeAttribute: (name: string) => { attributes.delete(name); },
};
applyQuickEditImage(image, '/uploads/new-original.jpg');
assert.equal(attributes.get('src'), '/uploads/new-original.jpg');
assert.equal(attributes.has('srcset'), false);
assert.equal(attributes.has('sizes'), false);
applyQuickEditImage(image, '/uploads/new-original.jpg');
assert.equal(attributes.get('src'), '/uploads/new-original.jpg');
applyQuickEditImage(image, '');
assert.equal(attributes.get('src'), '/uploads/new-original.jpg');
console.log('PASS: image replacement clears old responsive candidates and remains idempotent.');
