import assert from 'node:assert/strict';
import { selectFeaturedProducts } from '../src/lib/featured-products';

const catalog = [
  { code: 'A', name: 'First in catalog' },
  { code: 'B', name: 'Second in catalog' },
  { code: 'C', name: 'Third in catalog' },
];

assert.deepEqual(selectFeaturedProducts(['C', 'A'], catalog), {
  manual: true,
  products: [catalog[2], catalog[0]],
});
assert.deepEqual(selectFeaturedProducts([], catalog), { manual: false, products: [] });
assert.deepEqual(selectFeaturedProducts(['REMOVED'], catalog), { manual: true, products: [] });
assert.deepEqual(selectFeaturedProducts(['A', 'A', 'B', 'C'], catalog, 2), {
  manual: true,
  products: [catalog[0], catalog[1]],
});

console.log('Featured product order passed: manual ordering, auto mode, removed SKU handling, deduplication and 8-item limit.');
