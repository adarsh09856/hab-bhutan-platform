import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { deleteFallbackOrder } from '../src/lib/order-store.ts';

nextEnv.loadEnvConfig(process.cwd(), true);
const prisma = new PrismaClient();
const baseUrl = process.env.BNB_CHECKOUT_TEST_URL || 'http://127.0.0.1:3033';
const host = new URL(baseUrl).hostname;
const dbHost = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : '';
if (!['localhost', '127.0.0.1', '::1'].includes(host) || !['localhost', '127.0.0.1', '::1'].includes(dbHost)) {
  throw new Error('Safety stop: BNB checkout verification is restricted to loopback app and database hosts.');
}

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const code = `BNB-LOCAL-${suffix}`;
const email = `bnb-local-${suffix}@example.invalid`;
let orderId;
let orderNumber;
let productId;

try {
  const healthResponse = await fetch(`${baseUrl}/api/admin/health`);
  const health = await healthResponse.json();
  if (!healthResponse.ok || health?.database?.connected !== true) throw new Error('Local app database health check failed.');
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

  const response = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-bypass-rate-limit': 'true' },
    body: JSON.stringify({
      items: [{ id: product.id, productId: product.id, code, name: product.name, quantity: 1, priceUsd: 1 }],
      currency: 'BTN', paymentMethod: 'BNB', shippingMethod: 'EMS',
      customerName: 'Local BNB verification', email,
      mBOBTransactionRef: `BNB-REF-${suffix}`,
      shippingAddress: { fullName: 'Local BNB verification', email, street: 'Test only', city: 'Thimphu', country: 'Bhutan' },
    }),
  });
  const result = await response.json();
  if (response.status !== 200 || !result.success) throw new Error(`BNB order creation failed: ${result.error || response.status}`);

  orderId = result.order.id;
  orderNumber = result.order.orderNumber;
  const saved = await prisma.order.findUnique({ where: { id: orderId }, include: { orderItems: true } });
  if (saved?.paymentMethod !== 'BNB') throw new Error(`Expected BNB, saved method was ${saved?.paymentMethod}.`);
  if (saved?.paymentStatus !== 'PENDING') throw new Error(`Unverified bank transfer must remain pending, got ${saved?.paymentStatus}.`);
  if (saved?.mBOBTransactionRef !== `BNB-REF-${suffix}`) throw new Error('BNB transfer reference did not persist.');
  if (!saved?.internalNotes?.includes('BNB / mPay')) throw new Error('BNB verification instructions were not retained for staff.');

  console.log('PASS: BNB stays distinct from mBoB, its transfer reference persists, and the new order remains pending verification.');
} finally {
  if (orderId) {
    await prisma.orderItem.deleteMany({ where: { orderId } }).catch(() => {});
    await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
  }
  if (orderNumber) deleteFallbackOrder(orderNumber);
  if (productId) await prisma.product.delete({ where: { id: productId } }).catch(() => {});
  await prisma.$disconnect();
}
