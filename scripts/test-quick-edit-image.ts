import assert from 'node:assert/strict';
import { applyQuickEditImage } from '../src/lib/quick-edit-image';

const attributes = new Map([['src', '/old.jpg'], ['srcset', '/old-large.jpg 2x'], ['sizes', '100vw']]);
let mutations = 0;
const image = {
  getAttribute: (name: string) => attributes.get(name) ?? null,
  setAttribute: (name: string, value: string) => { mutations++; attributes.set(name, value); },
  removeAttribute: (name: string) => { mutations++; attributes.delete(name); },
};
applyQuickEditImage(image, '/uploads/new-original.jpg');
assert.equal(attributes.get('src'), '/uploads/new-original.jpg');
assert.equal(attributes.has('srcset'), false);
assert.equal(attributes.has('sizes'), false);
applyQuickEditImage(image, '/uploads/new-original.jpg');
assert.equal(attributes.get('src'), '/uploads/new-original.jpg');
assert.equal(mutations, 3, 'Re-applying an unchanged image must not trigger an observer loop.');
applyQuickEditImage(image, '');
assert.equal(attributes.get('src'), '/uploads/new-original.jpg');
console.log('PASS: image replacement clears old responsive candidates and remains idempotent.');
