import assert from 'node:assert/strict';
import Module from 'node:module';
import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { GET as getPublicProduct } from '../src/app/api/products/[code]/route';
import { createSessionToken } from '../src/lib/rbac';
import { productHref } from '../src/lib/product-routes';

async function main() {
  const moduleLoader = Module as any;
  const originalLoad = moduleLoader._load;
  moduleLoader._load = function (request: string, parent: unknown, isMain: boolean) {
    if (request === 'server-only') return {};
    return originalLoad.call(this, request, parent, isMain);
  };
  const { POST: createProduct } = await import('../src/app/api/admin/products/route');
  moduleLoader._load = originalLoad;

  const product = prisma.product as any;
  const trader = prisma.traderRecord as any;
  const user = prisma.user as any;
  const audit = prisma.auditLog as any;
  const original = {
    productFindFirst: product.findFirst,
    productFindUnique: product.findUnique,
    productCreate: product.create,
    productFindMany: product.findMany,
    traderFindFirst: trader.findFirst,
    userFindUnique: user.findUnique,
    auditCreate: audit.create,
  };
  let saved: any = null;

  user.findUnique = async () => ({
    id: 'product-slug-test-user', email: 'product-slug@example.invalid', name: 'Disposable product creator',
    status: 'ACTIVE', sessionVersion: 1,
    role: { id: 'product-slug-role', slug: 'super_admin', status: 'ACTIVE', version: 1, permissions: ['products:create'] },
  });
  product.findFirst = async () => null;
  product.findUnique = async ({ where }: any) => where.code === 'HDBPM/NEW-2026' ? null : null;
  trader.findFirst = async () => ({ id: 'disposable-trader', isVisible: true, expiresAt: new Date('2030-12-31T00:00:00Z') });
  product.create = async ({ data }: any) => {
    saved = {
      id: 'disposable-product', ...data,
      craft: { key: data.craftKey, name: 'Thagzo', english: 'Weaving' },
      maker: null,
      trader: { id: 'disposable-trader', shopName: 'Disposable trader', slug: 'disposable-trader', dzongkhag: 'Thimphu', town: 'Thimphu', isVisible: true, expiresAt: new Date('2030-12-31T00:00:00Z') },
    };
    return saved;
  };
  product.findMany = async () => [];
  audit.create = async () => ({ id: 'mock-audit' });

  try {
    const token = await createSessionToken({
      id: 'product-slug-test-user', email: 'product-slug@example.invalid', roleSlug: 'super_admin',
      permissions: ['products:create'],
    });
    const request = new NextRequest('http://localhost/api/admin/products', {
      method: 'POST', headers: { Cookie: `hab_session=${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'HDBPM/NEW-2026', name: 'Verified Slash SKU Test Piece', priceUSD: 25,
        craftKey: 'thagzo', traderId: 'disposable-trader', description: 'Disposable route acceptance test product.',
        status: 'PUBLISHED', stock: 1,
      }),
    });
    const createdResponse = await createProduct(request);
    const createdBody = await createdResponse.json();
    assert.equal(createdResponse.status, 200, JSON.stringify(createdBody));
    assert.equal(createdBody.product.code, 'HDBPM/NEW-2026');
    assert.equal(createdBody.product.slug, 'verified-slash-sku-test-piece');
    assert.equal(productHref(createdBody.product.code, createdBody.product.slug), '/product/verified-slash-sku-test-piece');

    product.findFirst = async ({ where }: any) => where.slug?.equals === saved.slug ? saved : null;
    const detailResponse = await getPublicProduct(
      new NextRequest(`http://localhost/api/products/${saved.slug}`),
      { params: Promise.resolve({ code: saved.slug }) },
    );
    const detailBody = await detailResponse.json();
    assert.equal(detailResponse.status, 200, JSON.stringify(detailBody));
    assert.equal(detailBody.product.code, 'HDBPM/NEW-2026');
    assert.equal(detailBody.product.slug, 'verified-slash-sku-test-piece');
    console.log('PASS: authenticated product creation accepts a slash SKU, stores a clean title URL, and the public product lookup opens it. In-memory Prisma only; no database writes.');
  } finally {
    product.findFirst = original.productFindFirst;
    product.findUnique = original.productFindUnique;
    product.create = original.productCreate;
    product.findMany = original.productFindMany;
    trader.findFirst = original.traderFindFirst;
    user.findUnique = original.userFindUnique;
    audit.create = original.auditCreate;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
