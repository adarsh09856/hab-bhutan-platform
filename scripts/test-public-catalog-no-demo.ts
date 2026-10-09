import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { GET as listProducts } from '../src/app/api/products/route';
import { GET as getProduct } from '../src/app/api/products/[code]/route';
import { normalizeProductImages } from '../src/lib/product-image-fallbacks';

async function main() {
  const originalFindMany = prisma.product.findMany;
  const originalFindFirst = prisma.product.findFirst;
  try {
    (prisma.product as any).findMany = async () => [];
    (prisma.product as any).findFirst = async () => null;

    const empty = await listProducts(new NextRequest('http://localhost/api/products?craft=dezo'));
    assert.equal(empty.status, 200);
    const emptyBody = await empty.json();
    assert.equal(emptyBody.success, true);
    assert.deepEqual(emptyBody.products, []);
    assert.notEqual(emptyBody.fallback, true);

    const missing = await getProduct(new NextRequest('http://localhost/api/products/HHB10'), { params: Promise.resolve({ code: 'HHB10' }) });
    assert.equal(missing.status, 404);

    (prisma.product as any).findFirst = async () => ({ code: 'SKU-TEST-123', name: 'Automated Test Product', status: 'PUBLISHED' });
    const hidden = await getProduct(new NextRequest('http://localhost/api/products/SKU-TEST-123'), { params: Promise.resolve({ code: 'SKU-TEST-123' }) });
    assert.equal(hidden.status, 404);

    assert.equal(normalizeProductImages('UNLISTED-01', 'thagzo', []).imageUrl, '/assets/photos/image-unavailable.svg');
    assert.equal(normalizeProductImages('HHB10', 'thagzo', [{ url: '/placeholders/hhb10_1.jpg', role: 'primary' }]).imageUrl, '/assets/photos/product-hhb10.jpg');

    (prisma.product as any).findMany = async () => { throw new Error('Simulated database outage'); };
    const outage = await listProducts(new NextRequest('http://localhost/api/products'));
    assert.equal(outage.status, 503);
    assert.deepEqual(Object.keys(await outage.json()).sort(), ['error', 'success']);
  } finally {
    (prisma.product as any).findMany = originalFindMany;
    (prisma.product as any).findFirst = originalFindFirst;
  }
  console.log('PASS: empty and missing products do not become demo catalogue entries; hidden product and database outage remain non-public. No database writes.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
