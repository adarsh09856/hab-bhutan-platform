import assert from 'node:assert/strict';
import { productHref } from '../src/lib/product-routes';
import { productNameSlug, uniqueProductSlug } from '../src/lib/product-slugs';

async function main() {
  const queried: string[] = [];
  const slug = await uniqueProductSlug('Handwoven Bucket Pouch', 'HDBPM/015', async (candidate) => {
    queried.push(candidate);
    return null;
  });

  assert.equal(slug, 'handwoven-bucket-pouch');
  assert.deepEqual(queried, ['handwoven-bucket-pouch']);
  assert.equal(productHref('HDBPM/015', slug), '/product/handwoven-bucket-pouch');
  assert.equal(productHref('HDBPM/015'), '/product/HDBPM%2F015');

  const collisionSlug = await uniqueProductSlug('Handwoven Bucket Pouch', 'HDBPM/015', async (candidate) =>
    candidate === 'handwoven-bucket-pouch' ? { id: 'existing' } : null,
  );
  assert.equal(collisionSlug, 'handwoven-bucket-pouch-hdbpm-015');
  assert.equal(productNameSlug('HDBPM/015'), 'hdbpm-015');
  console.log('PASS: new slash-coded SKUs retain their code while title-based product URLs stay safe and unique.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
