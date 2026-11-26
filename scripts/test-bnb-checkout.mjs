import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { deleteFallbackOrder } from '../src/lib/order-store.ts';
import { validateTestDatabaseUrl } from './lib/safe-test-database.mjs';

nextEnv.loadEnvConfig(process.cwd(), true);
const baseUrl = process.env.BNB_CHECKOUT_TEST_URL || 'http://127.0.0.1:3033';
const host = new URL(baseUrl).hostname;
const testDatabaseUrl = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);
if (process.env.DATABASE_URL !== testDatabaseUrl) {
  throw new Error('Safety stop: DATABASE_URL must exactly match the isolated TEST_DATABASE_URL.');
}
const dbHost = new URL(testDatabaseUrl).hostname;
if (!['localhost', '127.0.0.1', '::1'].includes(host) || !['localhost', '127.0.0.1', '::1'].includes(dbHost)) {
  throw new Error('Safety stop: BNB checkout verification is restricted to loopback app and database hosts.');
}
const prisma = new PrismaClient({ datasources: { db: { url: testDatabaseUrl } } });

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const code = `BNB-LOCAL-${suffix}`.toUpperCase();
const email = `bnb-local-${suffix}@example.invalid`;
let orderId;
let orderNumber;
let productId;
let adminUserId;
let adminRoleId;

try {
  // Admin health requires authentication. Verify the isolated connection here;
  // the unique fixture must also appear in the app before creating a test order.
  await prisma.$queryRaw`SELECT 1`;

  const craft = await prisma.craft.findFirst({ select: { key: true } });
  if (!craft) throw new Error('No local craft record exists for a temporary test product.');
  const product = await prisma.product.create({
    data: {
      code, name: 'Local BNB payment verification item', priceUSD: 1,
      craftKey: craft.key, region: 'Local test', description: 'Temporary test fixture',
      images: [], stock: 2, status: 'PUBLISHED',
    },
  });
  productId = product.id;
  const visibleFixture = await prisma.product.findUnique({ where: { code }, select: { id: true, code: true, status: true } });
  if (!visibleFixture || visibleFixture.status !== 'PUBLISHED') throw new Error('The local checkout test product was not persisted as a published fixture.');
  const catalogueResponse = await fetch(`${baseUrl}/api/products?q=${encodeURIComponent(code)}&shuffle=false`);
  const catalogueBody = await catalogueResponse.json().catch(() => ({}));
  if (!catalogueResponse.ok || !catalogueBody.products?.some((item) => item.code === code)) {
    throw new Error('The disposable checkout product was not visible through the local public catalogue.');
  }

  for (const method of ['BNB', 'MBOB']) {
    const missingReference = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-bypass-rate-limit': 'true' },
      body: JSON.stringify({
        items: [{ code: `NO-REF-${method}-${suffix}`, name: 'Must not be created', quantity: 1, priceUsd: 1 }],
        currency: 'BTN', paymentMethod: method, customerName: 'Local reference guard', email,
        shippingAddress: { country: 'Bhutan' },
      }),
    });
    const missingBody = await missingReference.json();
    if (missingReference.status !== 400 || !/transfer reference/i.test(missingBody.error || '')) {
      throw new Error(`${method} checkout without a transaction reference was not rejected.`);
    }
  }

  const response = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({
      items: [{ id: product.id, productId: product.id, code, name: product.name, quantity: 1, priceUsd: 1 }],
      currency: 'BTN', paymentMethod: 'BNB', shippingMethod: 'EMS',
      customerName: 'Local BNB verification', email, phone: '+97517123456',
      mBOBTransactionRef: `BNB-REF-${suffix}`,
      shippingAddress: { fullName: 'Local BNB verification', email, phone: '+97517123456', street: 'Test only', city: 'Thimphu', country: 'Bhutan', postalCode: '11001' },
    }),
  });
  const result = await response.json();
  if (response.status !== 200 || !result.success) throw new Error(`BNB order creation failed: ${result.error || response.status}`);

  orderId = result.order.id;
  orderNumber = result.order.orderNumber;
  const saved = await prisma.order.findUnique({ where: { id: orderId }, include: { orderItems: true } });
  if (saved?.orderItems.length !== 1 || saved.orderItems[0].productId !== productId || saved.orderItems[0].quantity !== 1) {
    throw new Error('The order did not persist its expected line item for the Admin manifest.');
  }
  if (saved?.paymentMethod !== 'BNB') throw new Error(`Expected BNB, saved method was ${saved?.paymentMethod}.`);
  if (saved?.paymentStatus !== 'PENDING' || saved?.orderStatus !== 'PENDING_PAYMENT') {
    throw new Error(`Unverified bank transfer must remain PENDING/PENDING_PAYMENT, got ${saved?.paymentStatus}/${saved?.orderStatus}.`);
  }
  if (saved?.mBOBTransactionRef !== `BNB-REF-${suffix}`) throw new Error('BNB transfer reference did not persist.');
  if (!saved?.internalNotes?.includes('BNB / mPay')) throw new Error('BNB verification instructions were not retained for staff.');

  // Create a disposable staff identity in the isolated database and authenticate
  // through the real login route before checking this order in the Admin manifest.
  const adminRole = await prisma.role.create({
    data: { name: `Local BNB manifest ${suffix}`, slug: `local_bnb_manifest_${suffix}`, permissions: ['orders:view'] },
  });
  adminRoleId = adminRole.id;
  const adminEmail = `bnb-admin-${suffix}@example.invalid`;
  const adminPassword = `Local-${suffix}-${randomUUID()}`;
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail, name: 'Local BNB manifest test',
      passwordHash: await bcrypt.hash(adminPassword, 4), roleId: adminRole.id,
    },
  });
  adminUserId = adminUser.id;
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword, targetPortal: 'admin' }),
  });
  const loginBody = await loginResponse.json().catch(() => ({}));
  const sessionCookie = loginResponse.headers.get('set-cookie')?.match(/(?:^|,\s*)hab_session=([^;,]+)/)?.[1];
  if (!loginResponse.ok || !loginBody.success || loginBody.user?.id !== adminUser.id || !sessionCookie) {
    throw new Error(`Isolated Admin login failed (${loginResponse.status}): ${loginBody.error || 'session cookie missing'}`);
  }

  const manifestResponse = await fetch(`${baseUrl}/api/admin/orders`, {
    headers: { Cookie: `hab_session=${sessionCookie}` },
  });
  const manifest = await manifestResponse.json().catch(() => ({}));
  const manifestOrder = manifest.orders?.find((order) => order.id === orderId);
  const manifestItem = manifestOrder?.items?.find((item) => item.productId === productId && item.code === code);
  if (!manifestResponse.ok || !manifest.success || !manifestOrder || !manifestItem
    || manifestItem.quantity !== 1 || manifestOrder.paymentMethod !== 'BNB'
    || manifestOrder.paymentStatus !== 'PENDING' || manifestOrder.orderStatus !== 'PENDING_PAYMENT') {
    throw new Error('Authenticated Admin order manifest did not show the scoped BNB test order and its expected pending line item.');
  }
  console.log('PASS: a disposable staff account authenticated through the real login route and saw the scoped BNB order and line item in the Admin manifest.');

  const trackingQuery = new URLSearchParams({ order: orderNumber, email });
  const trackedResponse = await fetch(`${baseUrl}/api/orders/track?${trackingQuery}`);
  const tracked = await trackedResponse.json();
  if (!trackedResponse.ok || tracked.order?.orderNumber !== orderNumber
    || tracked.order?.paymentStatus !== 'PENDING'
    || tracked.order?.orderStatus !== 'PENDING_PAYMENT'
    || tracked.order?.items?.length !== 1) {
    throw new Error('Public tracking did not show the pending BNB order and its line item.');
  }
  console.log('PASS: public tracking shows the order, line item, and pending payment status.');

  console.log('PASS: missing BNB/mBoB references are rejected; BNB stays distinct from mBoB; its reference persists; and the order remains pending payment verification.');
} finally {
  if (orderId) {
    await prisma.orderItem.deleteMany({ where: { orderId } }).catch(() => {});
    await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
  }
  if (orderNumber) deleteFallbackOrder(orderNumber);
  if (productId) await prisma.product.delete({ where: { id: productId } }).catch(() => {});
  if (adminUserId) {
    await prisma.auditLog.deleteMany({ where: { OR: [{ actorId: adminUserId }, { entityId: adminUserId }] } }).catch(() => {});
    await prisma.user.delete({ where: { id: adminUserId } }).catch(() => {});
  }
  if (adminRoleId) await prisma.role.delete({ where: { id: adminRoleId } }).catch(() => {});
  await prisma.$disconnect();
}
